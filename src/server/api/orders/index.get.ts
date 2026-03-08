/**
 * GET /api/orders
 *
 * FEAT-11: Bestellabholung — Alle Bestellungen des eingeloggten Nutzers laden
 * FEAT-16: Unterstützt jetzt auch Warenkorb-Bestellungen mit purchase_items
 *
 * @description
 * Liefert alle Bestellungen des authentifizierten Users, sortiert nach
 * Erstellungszeitpunkt (neueste zuerst). Unterstützt sowohl:
 * - Einzelprodukt-Bestellungen (FEAT-7) - Join mit products
 * - Warenkorb-Bestellungen (FEAT-16) - Join mit purchase_items + products
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
 *       "totalPrice": "5.50",
 *       "status": "pending_pickup",
 *       "pickupPin": "1234",
 *       "pickupLocation": "Nürnberg, Büro 1. OG",
 *       "expiresAt": "2026-03-04T12:30:00.000Z",
 *       "pickedUpAt": null,
 *       "cancelledAt": null,
 *       "createdAt": "2026-03-04T10:30:00.000Z",
 *       "items": [
 *         { "productId": 1, "productName": "Apfel", "quantity": 2, "unitPrice": "1.00", "imageUrl": "..." },
 *         { "productId": 3, "productName": "Cola", "quantity": 1, "unitPrice": "3.50", "imageUrl": "..." }
 *       ]
 *     }
 *   ]
 * }
 * ```
 *
 * @throws {401} - User nicht eingeloggt
 * @throws {500} - DB-Fehler
 */

import { db } from '~/server/db'
import { purchases, products, purchaseItems } from '~/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: string
  imageUrl: string | null
}

interface Order {
  id: number
  userId: number
  totalPrice: string | null
  status: 'pending_pickup' | 'picked_up' | 'cancelled'
  pickupPin: string
  pickupLocation: string
  expiresAt: string
  pickedUpAt: string | null
  cancelledAt: string | null
  createdAt: string
  items: OrderItem[]
}

export default defineEventHandler(async (event): Promise<{ orders: Order[] }> => {
  try {
    // ========================================
    // SCHRITT 1: User authentifizieren
    // ========================================

    const user = await getCurrentUser(event)

    // ========================================
    // SCHRITT 2: Bestellungen laden (nur pending_pickup)
    // ========================================

    const purchaseRows = await db
      .select({
        id: purchases.id,
        userId: purchases.userId,
        totalPrice: purchases.totalPrice,
        price: purchases.price, // Für Abwärtskompatibilität mit FEAT-7
        status: purchases.status,
        pickupPin: purchases.pickupPin,
        pickupLocation: purchases.pickupLocation,
        expiresAt: purchases.expiresAt,
        pickedUpAt: purchases.pickedUpAt,
        cancelledAt: purchases.cancelledAt,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .where(eq(purchases.userId, user.id))
      .orderBy(desc(purchases.createdAt))

    // ========================================
    // SCHRITT 3: Für jede Bestellung die Items laden
    // ========================================

    const orders: Order[] = await Promise.all(
      purchaseRows.map(async (purchase) => {
        // Purchase-Items laden
        const itemRows = await db
          .select({
            productId: purchaseItems.productId,
            quantity: purchaseItems.quantity,
            unitPrice: purchaseItems.unitPrice,
            productName: products.name,
            imageUrl: products.imageUrl,
          })
          .from(purchaseItems)
          .innerJoin(products, eq(purchaseItems.productId, products.id))
          .where(eq(purchaseItems.purchaseId, purchase.id))

        const items: OrderItem[] = itemRows.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          imageUrl: item.imageUrl,
        }))

        // Für FEAT-7 Kompatibilität: wenn totalPrice null ist, verwende price
        const orderTotalPrice = purchase.totalPrice || purchase.price?.toString() || '0'

        return {
          id: purchase.id,
          userId: purchase.userId,
          totalPrice: orderTotalPrice,
          status: purchase.status as 'pending_pickup' | 'picked_up' | 'cancelled',
          pickupPin: purchase.pickupPin,
          pickupLocation: purchase.pickupLocation,
          expiresAt: purchase.expiresAt.toISOString(),
          pickedUpAt: purchase.pickedUpAt ? purchase.pickedUpAt.toISOString() : null,
          cancelledAt: purchase.cancelledAt ? purchase.cancelledAt.toISOString() : null,
          createdAt: purchase.createdAt!.toISOString(),
          items,
        }
      })
    )

    return { orders }
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string }
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || 'Fehler beim Laden der Bestellungen',
    })
  }
})
