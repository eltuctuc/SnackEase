/**
 * POST /api/recommendations
 *
 * Empfehlung fuer ein Produkt hinzufuegen.
 *
 * Auth: User-Session erforderlich
 * Body: { productId: number }
 *
 * Response (201): { success: true, recommendationCount: number }
 * Errors: 400, 401, 404 (product), 409 (already exists)
 */

import { db } from '~/server/db'
import { recommendations, products, pointTransactions } from '~/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // AUTH CHECK
  // ----------------------------------------
  const currentUser = await getCurrentUser(event)

  // ----------------------------------------
  // REQUEST BODY
  // ----------------------------------------
  const body = await readBody(event)
  const productId = body?.productId

  if (!productId || typeof productId !== 'number') {
    throw createError({ statusCode: 400, message: 'productId fehlt oder ist ungueltig' })
  }

  try {
    // Produkt pruefen
    const product = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (product.length === 0) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' })
    }

    // Empfehlung einfuegen (UNIQUE-Constraint verhindert Duplikate)
    try {
      await db.insert(recommendations).values({
        productId,
        userId: currentUser.id,
      })
    } catch (insertError: unknown) {
      const err = insertError as { message?: string; code?: string }
      // UNIQUE-Constraint verletzt -> 409 Conflict
      if (
        err.message?.includes('unique') ||
        err.message?.includes('duplicate') ||
        err.code === '23505'
      ) {
        throw createError({ statusCode: 409, message: 'Empfehlung existiert bereits' })
      }
      throw insertError
    }

    // Neue Gesamtanzahl berechnen
    const countResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(recommendations)
      .where(eq(recommendations.productId, productId))

    // ========================================
    // FEAT-23 Nice-to-Have REQ-14: Empfehlungs-Punkte
    // Wenn currentUser Produkt X empfiehlt und bereits ein anderer Nutzer dasselbe Produkt
    // in der recommendations-Tabelle eingetragen hat, bekommt der urspruengliche Empfehlende
    // +5 Punkte (seine Empfehlung wurde bestaetigt).
    // Laut Spec: "Der Empfehlungs-Bonus wird dem Nutzer gutgeschrieben, dessen Empfehlung von
    // einem anderen Nutzer abgegeben wurde" (EC-10: auch wenn inaktiv)
    // ========================================
    try {
      // Frueheste Empfehlung fuer dieses Produkt suchen, die NICHT von currentUser stammt.
      // Diese wurde bereits vor dem INSERT oben abgefragt; da der INSERT erfolgreich war,
      // ist currentUser jetzt der neueste Empfehlende.
      const earliestRecommenderRows = await db.execute(
        sql`SELECT user_id FROM recommendations
            WHERE product_id = ${productId}
              AND user_id != ${currentUser.id}
            ORDER BY created_at ASC
            LIMIT 1`
      )

      if (earliestRecommenderRows.rows.length > 0) {
        // Der urspruengliche Empfehlende erhaelt +5 Punkte
        const originalRecommenderUserId = (earliestRecommenderRows.rows[0] as { user_id: number }).user_id

        await db.insert(pointTransactions).values({
          userId: originalRecommenderUserId,
          purchaseId: null,
          type: 'recommendation',
          basePoints: 5,
          veganBonus: 0,
          proteinBonus: 0,
          offerBonus: 0,
          speedBonus: 0,
          streakBonus: 0,
          totalPoints: 5,
        })
      }
      // Wenn niemand das Produkt vor currentUser empfohlen hat: keine Punkte vergeben
    } catch (pointsError: unknown) {
      // Punkte-Fehler sind nicht kritisch — Empfehlung wird trotzdem gespeichert
      console.error('[recommendations] Punkte-Vergabe fehlgeschlagen (nicht-kritisch):', pointsError)
    }

    setResponseStatus(event, 201)
    return { success: true, recommendationCount: countResult[0]?.count ?? 1 }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error adding recommendation:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Hinzufuegen der Empfehlung' })
  }
})
