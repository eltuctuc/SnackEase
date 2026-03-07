/**
 * POST /api/admin/notifications/:id/read
 *
 * FEAT-13: Einzelne Benachrichtigung als gelesen markieren
 *
 * @access Admin only
 *
 * @response
 * ```json
 * { "success": true, "message": "Benachrichtigung als gelesen markiert" }
 * ```
 *
 * @throws {400} Ungültige ID
 * @throws {401} Nicht eingeloggt
 * @throws {403} Kein Admin
 * @throws {404} Benachrichtigung nicht gefunden
 * @throws {500} DB-Fehler
 */

import { db } from '~/server/db'
import { lowStockNotifications } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const id = parseInt(idParam ?? '', 10)

  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Benachrichtigungs-ID' })
  }

  try {
    const existing = await db
      .select({ id: lowStockNotifications.id })
      .from(lowStockNotifications)
      .where(eq(lowStockNotifications.id, id))
      .limit(1)

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Benachrichtigung nicht gefunden' })
    }

    await db
      .update(lowStockNotifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(lowStockNotifications.id, id))

    return { success: true, message: 'Benachrichtigung als gelesen markiert' }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Markieren der Benachrichtigung',
    })
  }
})
