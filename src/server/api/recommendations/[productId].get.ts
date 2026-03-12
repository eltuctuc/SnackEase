/**
 * GET /api/recommendations/[productId]
 *
 * Gibt Empfehlungsstatus fuer ein einzelnes Produkt zurueck.
 * Wird vom ProductDetailModal verwendet wenn Produkt nicht in Top-10 ist.
 *
 * Auth: User-Session erforderlich
 *
 * Response (200): { recommendationCount: number, isRecommendedByMe: boolean }
 */

import { db } from '~/server/db'
import { recommendations } from '~/server/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // AUTH CHECK
  // ----------------------------------------
  const currentUser = await getCurrentUser(event)

  // ----------------------------------------
  // ROUTE PARAMETER
  // ----------------------------------------
  const productIdParam = getRouterParam(event, 'productId')
  const productId = parseInt(productIdParam ?? '')

  if (isNaN(productId)) {
    throw createError({ statusCode: 400, message: 'Ungueltige Produkt-ID' })
  }

  try {
    // Gesamtanzahl
    const countResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(recommendations)
      .where(eq(recommendations.productId, productId))

    // Hat der aktuelle Nutzer empfohlen?
    const myRec = await db
      .select({ id: recommendations.id })
      .from(recommendations)
      .where(
        and(
          eq(recommendations.productId, productId),
          eq(recommendations.userId, currentUser.id),
        )
      )
      .limit(1)

    return {
      recommendationCount: countResult[0]?.count ?? 0,
      isRecommendedByMe: myRec.length > 0,
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error fetching recommendation state:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Laden des Empfehlungsstatus' })
  }
})
