/**
 * PATCH /api/admin/inventory
 *
 * FEAT-12: Bestandsverwaltung — Bestand mehrerer Produkte gleichzeitig aktualisieren
 * FEAT-22: stockThreshold pro Produkt konfigurierbar — ersetzt hardkodierten Wert 3
 *
 * @access Admin only
 *
 * @requestBody
 * ```json
 * {
 *   "updates": [
 *     { "productId": 1, "stockQuantity": 15 },
 *     { "productId": 3, "stockQuantity": 0, "stockThreshold": 5 }
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
  stockQuantity?: number
  stockThreshold?: number
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
    if (typeof u.productId !== 'number') {
      throw createError({ statusCode: 400, message: 'Jedes Update benötigt eine productId als Zahl' })
    }
    if (u.stockQuantity !== undefined) {
      if (typeof u.stockQuantity !== 'number') {
        throw createError({ statusCode: 400, message: 'stockQuantity muss eine Zahl sein' })
      }
      if (u.stockQuantity < 0 || u.stockQuantity > 999) {
        throw createError({ statusCode: 400, message: 'Bestandswert muss zwischen 0 und 999 liegen' })
      }
    }
    if (u.stockThreshold !== undefined) {
      if (typeof u.stockThreshold !== 'number' || !Number.isInteger(u.stockThreshold)) {
        throw createError({ statusCode: 400, message: 'Schwellwert muss eine ganze Zahl sein' })
      }
      if (u.stockThreshold < 1) {
        throw createError({ statusCode: 400, message: 'Schwellwert muss mindestens 1 sein' })
      }
    }
  }

  // Prüfen ob alle productIds existieren (BUG-FEAT12-004)
  const productIds = updates.map(u => u.productId)
  const existingProducts = await db
    .select({ id: products.id, stock: products.stock, stockThreshold: products.stockThreshold })
    .from(products)
    .where(inArray(products.id, productIds))

  if (existingProducts.length !== productIds.length) {
    const existingIds = new Set(existingProducts.map(p => p.id))
    const missingIds = productIds.filter(id => !existingIds.has(id))
    throw createError({ statusCode: 404, message: `Produkte nicht gefunden: ${missingIds.join(', ')}` })
  }

  // Produkt-Map für Bestand + Schwellwert-Lookup
  const productMap = new Map(existingProducts.map(p => [p.id, p]))

  // Alle Updates in einer Transaktion (EC-7: alle oder keine)
  await db.transaction(async (tx) => {
    for (const u of updates) {
      const updateData: Record<string, unknown> = {}
      if (u.stockQuantity !== undefined) updateData.stock = u.stockQuantity
      if (u.stockThreshold !== undefined) updateData.stockThreshold = u.stockThreshold

      if (Object.keys(updateData).length > 0) {
        await tx
          .update(products)
          .set(updateData)
          .where(eq(products.id, u.productId))
      }
    }
  })

  // FEAT-13 + FEAT-22: Benachrichtigungen nach Schwellwert-Änderung oder Bestand-Änderung prüfen
  // Läuft nach der Transaktion — kein Rollback des Bestands bei Fehler
  try {
    for (const u of updates) {
      const existingProduct = productMap.get(u.productId)
      if (!existingProduct) continue

      // Aktuellen Bestand und Schwellwert ermitteln (nach Update)
      const currentStock = u.stockQuantity !== undefined ? u.stockQuantity : (existingProduct.stock ?? 0)
      const currentThreshold = u.stockThreshold !== undefined ? u.stockThreshold : (existingProduct.stockThreshold ?? 3)

      if (currentStock > currentThreshold) {
        // Bestand über Schwellwert → bestehende Warnung löschen (EC-3 + FEAT-22 REQ-10)
        await db
          .delete(lowStockNotifications)
          .where(eq(lowStockNotifications.productId, u.productId))
      } else if (currentStock <= currentThreshold) {
        // Bestand unter/gleich Schwellwert → Warnung erzeugen falls noch nicht vorhanden (EC-2)
        await db
          .insert(lowStockNotifications)
          .values({
            productId: u.productId,
            stockQuantity: currentStock,
          })
          .onConflictDoNothing()
      }
    }
  } catch (notificationError: unknown) {
    console.error('Fehler beim Bereinigen der Low-Stock-Benachrichtigungen:', notificationError)
  }

  return { success: true, updatedCount: updates.length }
})
