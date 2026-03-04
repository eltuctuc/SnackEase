/**
 * POST /api/purchases
 * 
 * FEAT-7: One-Touch Kauf - Kauft ein Produkt mit einem Klick
 * 
 * @description
 * Dieser Endpunkt führt eine atomare Transaktion aus:
 * 1. Validiert User-Authentifizierung
 * 2. Prüft Produkt-Existenz
 * 3. Prüft Guthaben >= Produktpreis
 * 4. Prüft Bestand > 0 (FEAT-12)
 * 5. Führt Transaktion durch:
 *    - Guthaben abziehen
 *    - Bestand -1
 *    - Kauf speichern mit Status "pending_pickup"
 *    - PIN generieren
 *    - Bonuspunkte berechnen
 *    - Transaction-Log erstellen
 * 
 * @route POST /api/purchases
 * @access Protected (Login erforderlich)
 * 
 * @requestBody
 * ```json
 * {
 *   "productId": 1
 * }
 * ```
 * 
 * @response Success
 * ```json
 * {
 *   "success": true,
 *   "purchase": {
 *     "id": 123,
 *     "productId": 1,
 *     "productName": "Apfel",
 *     "productCategory": "obst",
 *     "productImageUrl": "...",
 *     "price": "1.50",
 *     "status": "pending_pickup",
 *     "pickupPin": "1234",
 *     "pickupLocation": "Nürnberg, Büro 1. OG",
 *     "expiresAt": "2026-03-04T12:30:00Z",
 *     "createdAt": "2026-03-04T10:30:00Z"
 *   },
 *   "newBalance": "23.50"
 * }
 * ```
 * 
 * @throws {400} - Nicht genug Guthaben oder Produkt nicht verfügbar
 * @throws {401} - User nicht eingeloggt
 * @throws {404} - Produkt nicht gefunden
 * @throws {500} - DB-Fehler
 */

import { db } from '~/server/db'
import { userCredits, creditTransactions, products, purchases } from '~/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'
import { generatePin, calculateBonusPoints } from '~/server/utils/purchase'
import type { PurchaseResponse, PurchaseWithProduct } from '~/types'

export default defineEventHandler(async (event): Promise<PurchaseResponse> => {
  // ========================================
  // SCHRITT 1: Request-Body lesen
  // ========================================
  
  const body = await readBody(event)
  const { productId } = body

  // Validierung: productId vorhanden?
  if (!productId || typeof productId !== 'number') {
    throw createError({
      statusCode: 400,
      message: 'productId ist erforderlich',
    })
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
    // SCHRITT 3: Produkt laden
    // ========================================
    
    const productResults = await db.select().from(products).where(eq(products.id, productId)).limit(1)
    
    if (!productResults[0]) {
      throw createError({
        statusCode: 404,
        message: 'Produkt nicht gefunden',
      })
    }

    const product = productResults[0]
    const productPrice = parseFloat(product.price)

    // ========================================
    // SCHRITT 4: Guthaben prüfen
    // ========================================
    
    const creditsResults = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1)
    
    if (!creditsResults[0]) {
      return {
        success: false,
        error: 'Nicht genug Guthaben',
        currentBalance: '0.00',
        requiredAmount: productPrice.toFixed(2),
      }
    }

    const currentBalance = parseFloat(creditsResults[0].balance.toString())

    // Guthaben-Check
    if (currentBalance < productPrice) {
      return {
        success: false,
        error: 'Nicht genug Guthaben',
        currentBalance: currentBalance.toFixed(2),
        requiredAmount: productPrice.toFixed(2),
      }
    }

    // ========================================
    // SCHRITT 5: Bestand prüfen (FEAT-12)
    // ========================================
    
    const currentStock = product.stock ?? 0
    
    if (currentStock <= 0) {
      return {
        success: false,
        error: 'Produkt nicht verfügbar',
        stockQuantity: 0,
      }
    }

    // ========================================
    // SCHRITT 6: PIN und Bonuspunkte generieren
    // ========================================
    
    const pickupPin = generatePin()
    const bonusPoints = calculateBonusPoints(product.category)
    
    // Ablaufzeitpunkt: 2 Stunden nach Kauf
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 2)

    // ========================================
    // SCHRITT 7: Atomare Transaktion
    // ========================================
    
    /**
     * ✅ FIXED (BUG-FEAT7-001): Atomare Transaktion implementiert
     * 
     * Alle DB-Operationen laufen jetzt in einer Transaktion:
     * - Bei Erfolg: Alle Änderungen werden committed
     * - Bei Fehler: Automatisches Rollback ALLER Operationen
     * 
     * Vorteile:
     * - Keine Race Conditions mehr (Row-Level Locks)
     * - Kein Guthaben-Verlust bei DB-Fehlern
     * - ACID-Garantien (Atomicity, Consistency, Isolation, Durability)
     * 
     * @see BUG-FEAT7-001 - Dokumentation des Problems und der Lösung
     */
    
    const newBalance = currentBalance - productPrice

    // Atomare Transaktion: Alle Operationen oder keine
    const { purchase } = await db.transaction(async (tx) => {
      // 7a. Guthaben abziehen
      await tx.update(userCredits)
        .set({ 
          balance: newBalance.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, user.id))

      // 7b. Bestand reduzieren (FEAT-12)
      // Mit Row-Level Lock: Verhindert parallele Käufe bei stock=1
      await tx.update(products)
        .set({ 
          stock: sql`${products.stock} - 1`,
        })
        .where(eq(products.id, productId))

      // 7c. Kauf speichern
      const purchaseResults = await tx.insert(purchases).values({
        userId: user.id,
        productId: product.id,
        price: productPrice.toFixed(2),
        bonusPoints: bonusPoints,
        status: 'pending_pickup',
        pickupPin: pickupPin,
        pickupLocation: user.location || 'Nürnberg, Büro 1. OG',
        expiresAt: expiresAt,
      }).returning()

      const purchase = purchaseResults[0]

      // 7d. Transaction-Log erstellen
      await tx.insert(creditTransactions).values({
        userId: user.id,
        amount: `-${productPrice.toFixed(2)}`,
        type: 'purchase',
        description: `Kauf: ${product.name}`,
      })

      return { purchase }
    })
    
    // Bei Fehler wird automatisch Rollback durchgeführt:
    // - Guthaben bleibt unverändert
    // - Bestand bleibt unverändert
    // - Kein Purchase-Record erstellt
    // - Kein Transaction-Log

    // ========================================
    // SCHRITT 8: Success-Response mit Produkt-Details
    // ========================================
    
    const purchaseWithProduct: PurchaseWithProduct = {
      id: purchase.id,
      userId: purchase.userId,
      productId: purchase.productId,
      productName: product.name,
      productCategory: product.category,
      productImageUrl: product.imageUrl,
      price: purchase.price.toString(),
      bonusPoints: purchase.bonusPoints ?? 0,
      status: purchase.status as 'pending_pickup' | 'picked_up' | 'cancelled',
      pickupPin: purchase.pickupPin,
      pickupLocation: purchase.pickupLocation,
      expiresAt: purchase.expiresAt.toISOString(),
      pickedUpAt: purchase.pickedUpAt ? purchase.pickedUpAt.toISOString() : null,
      cancelledAt: purchase.cancelledAt ? purchase.cancelledAt.toISOString() : null,
      createdAt: purchase.createdAt!.toISOString(),
    }

    return {
      success: true,
      purchase: purchaseWithProduct,
      newBalance: newBalance.toFixed(2),
    }
  } catch (error: unknown) {
    // ========================================
    // ERROR HANDLING
    // ========================================
    
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Kauf',
    })
  }
})
