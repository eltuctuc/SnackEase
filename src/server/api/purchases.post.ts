/**
 * POST /api/purchases
 *
 * FEAT-16: Warenkorb-System - Checkout für Vorbestellung
 *
 * @description
 * Dieser Endpunkt erstellt eine Vorbestellung aus dem Warenkorb:
 * 1. Validiert User-Authentifizierung
 * 2. Prüft Produkt-Existenz und Bestand (alle Produkte)
 * 3. Erstellt Bestellung mit purchase_items (KEIN Guthaben-Abzug!)
 * 4. Generiert PIN und Ablaufzeit
 *
 * WICHTIG: Guthaben-Abzug erfolgt erst beim Abholen (POST /api/orders/[id]/pickup)
 *
 * @route POST /api/purchases
 * @access Protected (Login erforderlich)
 *
 * @requestBody
 * ```json
 * {
 *   "items": [
 *     { "productId": 1, "quantity": 2 },
 *     { "productId": 3, "quantity": 1 }
 *   ],
 *   "pickupLocation": "Nürnberg"
 * }
 * ```
 *
 * @response Success
 * ```json
 * {
 *   "success": true,
 *   "orderId": 123,
 *   "pickupPin": "1234",
 *   "expiresAt": "2026-03-04T12:30:00Z",
 *   "totalPrice": "5.50"
 * }
 * ```
 *
 * @throws {400} - Produkt nicht verfügbar oder Warenkorb leer
 * @throws {401} - User nicht eingeloggt
 * @throws {403} - Admin kann nicht kaufen
 * @throws {500} - DB-Fehler
 */

import { db } from '~/server/db'
import { userCredits, products, purchases, purchaseItems, lowStockNotifications } from '~/server/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'
import { generatePin } from '~/server/utils/purchase'

interface CheckoutItem {
  productId: number
  quantity: number
}

export default defineEventHandler(async (event) => {
  // ========================================
  // SCHRITT 1: Request-Body lesen
  // ========================================

  const body = await readBody(event)
  const { items, pickupLocation } = body as { items: CheckoutItem[]; pickupLocation?: string }

  // Validierung: items vorhanden?
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Warenkorb ist leer',
    })
  }

  // Validierung: jedes Item hat productId und quantity
  for (const item of items) {
    if (!item.productId || typeof item.productId !== 'number' || !item.quantity || item.quantity < 1) {
      throw createError({
        statusCode: 400,
        message: 'Ungültige Warenkorb-Daten',
      })
    }
  }

  try {
    // ========================================
    // SCHRITT 2: User authentifizieren
    // ========================================

    const user = await getCurrentUser(event)

    // Admin-Guard: Admins haben kein Guthaben und können nicht kaufen
    if (user.role === 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Admin kann keine Produkte kaufen',
      })
    }

    // ========================================
    // SCHRITT 3: Produkte laden und Preise berechnen
    // ========================================

    const productIds = items.map(item => item.productId)
    const productResults = await db.select().from(products).where(
      and(
        eq(products.isActive, true),
        sql`${products.id} IN (${sql.join(productIds.map(id => sql`${id}`), sql`, `)})`
      )
    )

    // Prüfen ob alle Produkte existieren
    const foundIds = new Set(productResults.map(p => p.id))
    const missingIds = productIds.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Ein oder mehrere Produkte sind nicht mehr verfügbar',
      })
    }

    // Produkt-Map für schnellen Zugriff
    const productMap = new Map(productResults.map(p => [p.id, p]))

    // Gesamtpreis berechnen
    let totalPrice = 0
    const orderItems: {
      productId: number
      quantity: number
      unitPrice: number
      productName: string
    }[] = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        throw createError({
          statusCode: 400,
          message: `Produkt nicht gefunden`,
        })
      }

      // FEAT-14: Angebots-Preis prüfen (hier vereinfacht - Normalpreis)
      // TODO: Wenn FEAT-14 implementiert ist, hier Angebotspreis abrufen
      const unitPrice = parseFloat(product.price.toString())
      totalPrice += unitPrice * item.quantity

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        productName: product.name
      })
    }

    // ========================================
    // SCHRITT 4: PIN generieren
    // ========================================

    const pickupPin = generatePin()

    // Ablaufzeitpunkt: 2 Stunden nach Bestellung
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2)

    // ========================================
    // SCHRITT 5: Atomare Transaktion mit Row-Level Lock
    // ========================================

    const { purchase } = await db.transaction(async (tx) => {
      // 5a. Alle Produkt-Zeilen sperren und Bestand prüfen
      for (const orderItem of orderItems) {
        const lockedRows = await tx.execute(
          sql`SELECT stock FROM products WHERE id = ${orderItem.productId} FOR UPDATE`
        )
        const lockedStock = (lockedRows.rows[0] as { stock: number } | undefined)?.stock ?? 0

        if (lockedStock < orderItem.quantity) {
          const product = productMap.get(orderItem.productId)
          throw createError({
            statusCode: 400,
            message: `Nicht genug Bestand für "${product?.name || 'Produkt'}". Verfügbar: ${lockedStock}`,
          })
        }
      }

      // 5b. KEIN Guthaben-Abzug! (erst bei Abholung)

      // 5c. Bestand reduzieren
      for (const orderItem of orderItems) {
        await tx.update(products)
          .set({
            stock: sql`${products.stock} - ${orderItem.quantity}`,
          })
          .where(eq(products.id, orderItem.productId))
      }

      // 5d. Kauf speichern
      const purchaseResults = await tx.insert(purchases).values({
        userId: user.id,
        // productId bleibt NULL bei Warenkorb-Bestellungen
        totalPrice: totalPrice.toFixed(2),
        bonusPoints: 0,
        status: 'pending_pickup',
        pickupPin: pickupPin,
        pickupLocation: pickupLocation || user.location || 'Nürnberg',
        expiresAt: expiresAt,
      }).returning()

      const purchase = purchaseResults[0]

      // 5e. Purchase-Items speichern
      await tx.insert(purchaseItems).values(
        orderItems.map(item => ({
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
        }))
      )

      return { purchase }
    })

    // ========================================
    // SCHRITT 6: Low-Stock-Check (FEAT-13)
    // ========================================

    try {
      for (const orderItem of orderItems) {
        const stockRows = await db
          .select({ stock: products.stock })
          .from(products)
          .where(eq(products.id, orderItem.productId))
          .limit(1)

        const updatedStock = stockRows[0]?.stock ?? 0

        if (updatedStock <= 3) {
          await db.insert(lowStockNotifications)
            .values({
              productId: orderItem.productId,
              stockQuantity: updatedStock,
            })
            .onConflictDoNothing()
        }
      }
    } catch (notificationError: unknown) {
      console.error('Low-Stock-Benachrichtigung konnte nicht erstellt werden:', notificationError)
    }

    // ========================================
    // SCHRITT 7: Success-Response
    // ========================================

    return {
      success: true,
      orderId: purchase.id,
      pickupPin: purchase.pickupPin,
      expiresAt: purchase.expiresAt.toISOString(),
      totalPrice: totalPrice.toFixed(2),
    }
  } catch (error: unknown) {
    // ========================================
    // ERROR HANDLING
    // ========================================

    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Checkout',
    })
  }
})
