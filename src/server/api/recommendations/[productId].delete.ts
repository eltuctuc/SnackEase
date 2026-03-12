/**
 * DELETE /api/recommendations/[productId]
 *
 * Eigene Empfehlung fuer ein Produkt zurueckziehen.
 *
 * Auth: User-Session erforderlich
 *
 * Response (200): { success: true, recommendationCount: number }
 * Errors: 401 (unauthenticated), 404 (recommendation not found)
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
    // Empfehlung loeschen
    const deleted = await db
      .delete(recommendations)
      .where(
        and(
          eq(recommendations.productId, productId),
          eq(recommendations.userId, currentUser.id),
        )
      )
      .returning({ id: recommendations.id })

    if (deleted.length === 0) {
      throw createError({ statusCode: 404, message: 'Empfehlung nicht gefunden' })
    }

    // Neue Gesamtanzahl berechnen
    const countResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(recommendations)
      .where(eq(recommendations.productId, productId))

    return { success: true, recommendationCount: countResult[0]?.count ?? 0 }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error removing recommendation:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Entfernen der Empfehlung' })
  }
})
