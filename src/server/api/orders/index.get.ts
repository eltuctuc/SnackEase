/**
 * GET /api/orders
 *
 * FEAT-11: Bestellabholung — Alle Bestellungen des eingeloggten Nutzers laden
 *
 * @description
 * Liefert alle Bestellungen des authentifizierten Users, sortiert nach
 * Erstellungszeitpunkt (neueste zuerst). Joined mit der products-Tabelle
 * für Produktname und Bild-URL.
 *
 * @route GET /api/orders
 * @access Protected (Login erforderlich)
 *
 * @response
 * ```json
 * {
 *   "orders": [
 *     {
 *       "id": 1,
 *       "productName": "Apfel",
 *       "productImageUrl": "...",
 *       "price": "1.50",
 *       "status": "pending_pickup",
 *       "pickupPin": "1234",
 *       "pickupLocation": "Nürnberg, Büro 1. OG",
 *       "expiresAt": "2026-03-04T12:30:00.000Z",
 *       "pickedUpAt": null,
 *       "cancelledAt": null,
 *       "createdAt": "2026-03-04T10:30:00.000Z"
 *     }
 *   ]
 * }
 * ```
 *
 * @throws {401} - User nicht eingeloggt
 * @throws {500} - DB-Fehler
 */

import { db } from '~/server/db'
import { purchases, products } from '~/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'
import type { PurchaseWithProduct } from '~/types'

export default defineEventHandler(async (event): Promise<{ orders: PurchaseWithProduct[] }> => {
  try {
    // ========================================
    // SCHRITT 1: User authentifizieren
    // ========================================

    const user = await getCurrentUser(event)

    // ========================================
    // SCHRITT 2: Bestellungen laden (Join mit products)
    // ========================================

    const rows = await db
      .select({
        id: purchases.id,
        userId: purchases.userId,
        productId: purchases.productId,
        price: purchases.price,
        bonusPoints: purchases.bonusPoints,
        status: purchases.status,
        pickupPin: purchases.pickupPin,
        pickupLocation: purchases.pickupLocation,
        expiresAt: purchases.expiresAt,
        pickedUpAt: purchases.pickedUpAt,
        cancelledAt: purchases.cancelledAt,
        createdAt: purchases.createdAt,
        productName: products.name,
        productCategory: products.category,
        productImageUrl: products.imageUrl,
      })
      .from(purchases)
      .innerJoin(products, eq(purchases.productId, products.id))
      .where(eq(purchases.userId, user.id))
      .orderBy(desc(purchases.createdAt))

    // ========================================
    // SCHRITT 3: Response aufbauen
    // ========================================

    const orders: PurchaseWithProduct[] = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      price: row.price.toString(),
      bonusPoints: row.bonusPoints ?? 0,
      status: row.status as 'pending_pickup' | 'picked_up' | 'cancelled',
      pickupPin: row.pickupPin,
      pickupLocation: row.pickupLocation,
      expiresAt: row.expiresAt.toISOString(),
      pickedUpAt: row.pickedUpAt ? row.pickedUpAt.toISOString() : null,
      cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
      createdAt: row.createdAt!.toISOString(),
      productName: row.productName,
      productCategory: row.productCategory,
      productImageUrl: row.productImageUrl,
    }))

    return { orders }
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string }
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || 'Fehler beim Laden der Bestellungen',
    })
  }
})
