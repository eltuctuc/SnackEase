/**
 * GET /api/profile/points
 *
 * FEAT-23: Punkte-Uebersicht des eingeloggten Mitarbeiters
 *
 * @description
 * Gibt die Gesamt-Punktzahl (Allzeit) und die letzten 10 Punkte-Transaktionen
 * des eingeloggten Nutzers zurueck, inkl. der Produkt-Namen der jeweiligen Bestellung.
 *
 * @access Protected (Login erforderlich)
 *
 * @response
 * ```json
 * {
 *   "totalPoints": 120,
 *   "transactions": [
 *     {
 *       "id": 1,
 *       "type": "purchase_pickup",
 *       "totalPoints": 17,
 *       "basePoints": 10,
 *       "veganBonus": 3,
 *       "proteinBonus": 2,
 *       "offerBonus": 2,
 *       "speedBonus": 0,
 *       "streakBonus": 0,
 *       "createdAt": "2026-03-13T10:00:00.000Z",
 *       "products": ["Bio-Apfel", "Protein-Riegel"]
 *     }
 *   ]
 * }
 * ```
 */

import { db } from '~/server/db'
import { pointTransactions, purchaseItems, products } from '~/server/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

interface PointTransactionRow {
  id: number
  type: string
  totalPoints: number
  basePoints: number
  veganBonus: number
  proteinBonus: number
  offerBonus: number
  speedBonus: number
  streakBonus: number
  createdAt: string
  purchaseId: number | null
  products: string[]
}

interface ProfilePointsResponse {
  totalPoints: number
  transactions: PointTransactionRow[]
}

export default defineEventHandler(async (event): Promise<ProfilePointsResponse> => {
  // Auth-Check
  const currentUser = await getCurrentUser(event)

  try {
    // Allzeit-Gesamt-Punktzahl
    const totalResult = await db
      .select({
        total: sql<number>`CAST(COALESCE(SUM(${pointTransactions.totalPoints}), 0) AS INTEGER)`,
      })
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, currentUser.id))

    const totalPoints = totalResult[0]?.total ?? 0

    // Letzte 10 Transaktionen (neueste zuerst)
    const txRows = await db
      .select({
        id: pointTransactions.id,
        type: pointTransactions.type,
        totalPoints: pointTransactions.totalPoints,
        basePoints: pointTransactions.basePoints,
        veganBonus: pointTransactions.veganBonus,
        proteinBonus: pointTransactions.proteinBonus,
        offerBonus: pointTransactions.offerBonus,
        speedBonus: pointTransactions.speedBonus,
        streakBonus: pointTransactions.streakBonus,
        createdAt: pointTransactions.createdAt,
        purchaseId: pointTransactions.purchaseId,
      })
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, currentUser.id))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(10)

    // Produkt-Namen fuer jede Transaktion mit purchaseId laden
    const purchaseIds = txRows
      .map(t => t.purchaseId)
      .filter((id): id is number => id !== null)

    // Map: purchaseId → Produktnamen
    const productNameMap = new Map<number, string[]>()

    if (purchaseIds.length > 0) {
      // Alle purchase_items fuer alle relevanten Bestellungen in einem Query
      const itemRows = await db
        .select({
          purchaseId: purchaseItems.purchaseId,
          productName: products.name,
          quantity: purchaseItems.quantity,
        })
        .from(purchaseItems)
        .innerJoin(products, eq(purchaseItems.productId, products.id))
        .where(
          sql`${purchaseItems.purchaseId} = ANY(${sql.raw(`ARRAY[${purchaseIds.join(',')}]`)})`
        )

      for (const row of itemRows) {
        const existing = productNameMap.get(row.purchaseId) ?? []
        // Mehrfach-Mengen: Namen so oft hinzufuegen wie qty
        for (let i = 0; i < row.quantity; i++) {
          existing.push(row.productName)
        }
        productNameMap.set(row.purchaseId, existing)
      }
    }

    // Response zusammenbauen
    const transactions: PointTransactionRow[] = txRows.map(tx => ({
      id: tx.id,
      type: tx.type,
      totalPoints: tx.totalPoints,
      basePoints: tx.basePoints,
      veganBonus: tx.veganBonus,
      proteinBonus: tx.proteinBonus,
      offerBonus: tx.offerBonus,
      speedBonus: tx.speedBonus,
      streakBonus: tx.streakBonus,
      createdAt: tx.createdAt?.toISOString() ?? new Date().toISOString(),
      purchaseId: tx.purchaseId,
      products: tx.purchaseId ? (productNameMap.get(tx.purchaseId) ?? []) : [],
    }))

    return { totalPoints, transactions }
  } catch (error: unknown) {
    console.error('[profile/points] DB-Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Punkte',
    })
  }
})
