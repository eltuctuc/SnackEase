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
import { recommendations, products } from '~/server/db/schema'
import { eq, sql } from 'drizzle-orm'
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

    setResponseStatus(event, 201)
    return { success: true, recommendationCount: countResult[0]?.count ?? 1 }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error adding recommendation:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Hinzufuegen der Empfehlung' })
  }
})
