/**
 * DELETE /api/favorites/[productId]
 *
 * Produkt aus eigenen Favoriten entfernen.
 *
 * Auth: User-Session erforderlich
 *
 * Response (200): { success: true }
 * Errors: 401 (unauthenticated), 404 (favorite not found)
 */

import { db } from '~/server/db'
import { favorites } from '~/server/db/schema'
import { and, eq } from 'drizzle-orm'
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
    const deleted = await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.productId, productId),
          eq(favorites.userId, currentUser.id),
        )
      )
      .returning({ id: favorites.id })

    if (deleted.length === 0) {
      throw createError({ statusCode: 404, message: 'Favorit nicht gefunden' })
    }

    return { success: true }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error removing favorite:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Entfernen des Favoriten' })
  }
})
