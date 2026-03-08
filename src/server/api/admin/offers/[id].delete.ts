/**
 * DELETE /api/admin/offers/[id]
 *
 * FEAT-14: Angebot löschen (Admin)
 *
 * @route DELETE /api/admin/offers/[id]
 * @access Admin
 *
 * @throws {401/403} - Nicht autorisiert
 * @throws {404} - Angebot nicht gefunden
 * @throws {500} - DB-Fehler
 */

import { db } from '~/server/db'
import { productOffers } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const id = parseInt(getRouterParam(event, 'id') ?? '', 10)
    if (isNaN(id)) {
      throw createError({ statusCode: 400, message: 'Ungültige Angebots-ID' })
    }

    // Angebot prüfen ob es existiert
    const existing = await db
      .select({ id: productOffers.id })
      .from(productOffers)
      .where(eq(productOffers.id, id))
      .limit(1)

    if (existing.length === 0) {
      throw createError({ statusCode: 404, message: 'Angebot nicht gefunden' })
    }

    // Angebot löschen
    await db.delete(productOffers).where(eq(productOffers.id, id))

    return { success: true }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Löschen des Angebots',
    })
  }
})
