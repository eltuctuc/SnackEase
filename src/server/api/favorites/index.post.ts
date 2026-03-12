/**
 * POST /api/favorites
 *
 * Produkt zu Favoriten hinzufuegen.
 * Max. 10 Favoriten pro Nutzer (422 wenn ueberschritten).
 *
 * Auth: User-Session erforderlich
 * Body: { productId: number }
 *
 * Response (201): { success: true, favoritesCount: number }
 * Errors: 400, 401, 404 (product), 409 (already favorite), 422 (limit reached)
 */

import { db } from '~/server/db'
import { favorites, products } from '~/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

const FAVORITES_LIMIT = 10

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
    // ----------------------------------------
    // FAVORITEN-LIMIT PRUEFEN (serverseitig)
    // ----------------------------------------
    const countResult = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(favorites)
      .where(eq(favorites.userId, currentUser.id))

    const currentCount = countResult[0]?.count ?? 0

    if (currentCount >= FAVORITES_LIMIT) {
      throw createError({
        statusCode: 422,
        message: 'Maximale Anzahl von 10 Favoriten erreicht. Bitte entferne zuerst ein Produkt aus deinen Favoriten.',
      })
    }

    // Produkt pruefen
    const product = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (product.length === 0) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' })
    }

    // Favorit einfuegen
    try {
      await db.insert(favorites).values({
        productId,
        userId: currentUser.id,
      })
    } catch (insertError: unknown) {
      const err = insertError as { message?: string; code?: string }
      if (
        err.message?.includes('unique') ||
        err.message?.includes('duplicate') ||
        err.code === '23505'
      ) {
        throw createError({ statusCode: 409, message: 'Produkt ist bereits in Favoriten' })
      }
      throw insertError
    }

    setResponseStatus(event, 201)
    return { success: true, favoritesCount: currentCount + 1 }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error adding favorite:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Hinzufuegen des Favoriten' })
  }
})
