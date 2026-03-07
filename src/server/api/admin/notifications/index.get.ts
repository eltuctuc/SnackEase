/**
 * GET /api/admin/notifications
 *
 * FEAT-13: Low-Stock-Benachrichtigungen — Alle Warnungen abrufen
 *
 * @access Admin only
 *
 * @response
 * ```json
 * {
 *   "notifications": [
 *     {
 *       "id": 1,
 *       "productId": 2,
 *       "productName": "Nüsse",
 *       "productCategory": "Snacks",
 *       "stockQuantity": 2,
 *       "isRead": false,
 *       "createdAt": "2026-03-04T10:30:00Z",
 *       "readAt": null
 *     }
 *   ],
 *   "unreadCount": 1
 * }
 * ```
 *
 * @throws {401} Nicht eingeloggt
 * @throws {403} Kein Admin
 * @throws {500} DB-Fehler
 */

import { db } from '~/server/db'
import { lowStockNotifications, products } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  try {
    const rows = await db
      .select({
        id: lowStockNotifications.id,
        productId: lowStockNotifications.productId,
        productName: products.name,
        productCategory: products.category,
        stockQuantity: lowStockNotifications.stockQuantity,
        isRead: lowStockNotifications.isRead,
        createdAt: lowStockNotifications.createdAt,
        readAt: lowStockNotifications.readAt,
      })
      .from(lowStockNotifications)
      .innerJoin(products, eq(lowStockNotifications.productId, products.id))
      .orderBy(asc(lowStockNotifications.stockQuantity), asc(lowStockNotifications.createdAt))

    const notifications = rows.map((row) => ({
      id: row.id,
      productId: row.productId,
      productName: row.productName,
      productCategory: row.productCategory,
      stockQuantity: row.stockQuantity,
      isRead: row.isRead,
      createdAt: row.createdAt ? row.createdAt.toISOString() : null,
      readAt: row.readAt ? row.readAt.toISOString() : null,
    }))

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return { notifications, unreadCount }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Laden der Benachrichtigungen',
    })
  }
})
