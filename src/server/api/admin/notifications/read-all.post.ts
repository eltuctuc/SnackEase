/**
 * POST /api/admin/notifications/read-all
 *
 * FEAT-13: Alle Benachrichtigungen als gelesen markieren
 *
 * @access Admin only
 *
 * @response
 * ```json
 * { "success": true, "updatedCount": 3 }
 * ```
 *
 * @throws {401} Nicht eingeloggt
 * @throws {403} Kein Admin
 * @throws {500} DB-Fehler
 */

import { db } from '~/server/db'
import { lowStockNotifications } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  try {
    const unread = await db
      .select({ id: lowStockNotifications.id })
      .from(lowStockNotifications)
      .where(eq(lowStockNotifications.isRead, false))

    if (unread.length > 0) {
      await db
        .update(lowStockNotifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(lowStockNotifications.isRead, false))
    }

    return { success: true, updatedCount: unread.length }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Markieren aller Benachrichtigungen',
    })
  }
})
