/**
 * PATCH /api/admin/inventory
 *
 * FEAT-12: Bestandsverwaltung — Bestand mehrerer Produkte gleichzeitig aktualisieren
 *
 * @access Admin only
 *
 * @requestBody
 * ```json
 * {
 *   "updates": [
 *     { "productId": 1, "stockQuantity": 15 },
 *     { "productId": 3, "stockQuantity": 0 }
 *   ]
 * }
 * ```
 *
 * @response
 * ```json
 * { "success": true, "updatedCount": 2 }
 * ```
 *
 * @throws {400} Ungültige Eingabe (leere Liste oder Werte < 0 oder > 999)
 * @throws {403} Kein Admin
 */

import { db } from '~/server/db'
import { products, lowStockNotifications } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'
import { eq, inArray } from 'drizzle-orm'

interface StockUpdate {
  productId: number
  stockQuantity: number
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const updates: StockUpdate[] = body?.updates

  // Validierung
  if (!Array.isArray(updates) || updates.length === 0) {
    throw createError({ statusCode: 400, message: 'updates muss eine nicht-leere Liste sein' })
  }

  for (const u of updates) {
    if (typeof u.productId !== 'number' || typeof u.stockQuantity !== 'number') {
      throw createError({ statusCode: 400, message: 'Jedes Update benötigt productId und stockQuantity als Zahlen' })
    }
    if (u.stockQuantity < 0 || u.stockQuantity > 999) {
      throw createError({ statusCode: 400, message: 'Bestandswert muss zwischen 0 und 999 liegen' })
    }
  }

  // Prüfen ob alle productIds existieren (BUG-FEAT12-004)
  const productIds = updates.map(u => u.productId)
  const existingProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, productIds))

  if (existingProducts.length !== productIds.length) {
    const existingIds = new Set(existingProducts.map(p => p.id))
    const missingIds = productIds.filter(id => !existingIds.has(id))
    throw createError({ statusCode: 404, message: `Produkte nicht gefunden: ${missingIds.join(', ')}` })
  }

  // Alle Updates in einer Transaktion (EC-7: alle oder keine)
  await db.transaction(async (tx) => {
    for (const u of updates) {
      await tx
        .update(products)
        .set({ stock: u.stockQuantity })
        .where(eq(products.id, u.productId))
    }
  })

  // FEAT-13: Benachrichtigungen für aufgefüllte Produkte automatisch entfernen
  // Läuft nach der Transaktion — kein Rollback des Bestands bei Fehler
  try {
    for (const u of updates) {
      if (u.stockQuantity > 3) {
        await db
          .delete(lowStockNotifications)
          .where(eq(lowStockNotifications.productId, u.productId))
      }
    }
  } catch (notificationError: unknown) {
    console.error('Fehler beim Bereinigen der Low-Stock-Benachrichtigungen:', notificationError)
  }

  return { success: true, updatedCount: updates.length }
})
