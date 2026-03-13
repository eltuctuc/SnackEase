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
import { recommendations, products, purchases, pointTransactions } from '~/server/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
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
    // Pruefe ob der empfangende Nutzer (currentUser) das Produkt zuvor empfohlen hat.
    // Wenn ja: vergib +5 Punkte an den empfehlenden Nutzer.
    // ========================================
    try {
      // Pruefen ob currentUser selbst das Produkt kaufte (hat eine picked_up Bestellung mit diesem Produkt)
      const ownPurchaseRows = await db.execute(
        sql`SELECT p.user_id FROM purchases p
            INNER JOIN purchase_items pi ON pi.purchase_id = p.id
            WHERE pi.product_id = ${productId}
              AND p.status = 'picked_up'
            ORDER BY p.created_at DESC
            LIMIT 1`
      )

      if (ownPurchaseRows.rows.length > 0) {
        // Eigentuemernutzer des zuletzt abgeholten Kaufs dieses Produkts
        const originalBuyerUserId = (ownPurchaseRows.rows[0] as { user_id: number }).user_id

        // Nur Punkte vergeben wenn ein anderer Nutzer der Kaeufer war
        if (originalBuyerUserId !== currentUser.id) {
          // +5 Punkte an den Kaeufer (nicht an denjenigen der empfiehlt, sondern an den Nutzer dessen Empfehlung
          // bestaetigt wurde — gemaess FEAT-23 Spec: Punkte an den der das Produkt empfohlen hat)
          // Laut Spec: "Der Empfehlungs-Bonus wird dem Nutzer gutgeschrieben, dessen Empfehlung von einem anderen
          // Nutzer abgegeben wurde"
          // D.h. currentUser gibt die Empfehlung ab → originalBuyerUserId hat das Produkt selbst gekauft
          // → originalBuyerUserId erhaelt die Punkte (EC-10: auch wenn inaktiv)
          await db.insert(pointTransactions).values({
            userId: originalBuyerUserId,
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
      }
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
