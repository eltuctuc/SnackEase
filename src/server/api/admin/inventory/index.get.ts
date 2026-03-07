/**
 * GET /api/admin/inventory
 *
 * FEAT-12: Bestandsverwaltung — Bestandsübersicht für Admin
 *
 * @access Admin only
 *
 * @response
 * ```json
 * {
 *   "inventory": [
 *     {
 *       "productId": 1,
 *       "productName": "Apfel",
 *       "category": "obst",
 *       "imageUrl": "...",
 *       "stockQuantity": 15,
 *       "lowStockThreshold": 3,
 *       "status": "ok",
 *       "isActive": true
 *     }
 *   ]
 * }
 * ```
 */

import { db } from '~/server/db'
import { products } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'
import { asc } from 'drizzle-orm'

const LOW_STOCK_THRESHOLD = 3

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      imageUrl: products.imageUrl,
      stock: products.stock,
      isActive: products.isActive,
    })
    .from(products)
    .orderBy(asc(products.name))

  const inventory = rows.map((p) => {
    const qty = p.stock ?? 0
    const status = qty === 0 ? 'empty' : qty <= LOW_STOCK_THRESHOLD ? 'low' : 'ok'

    return {
      productId: p.id,
      productName: p.name,
      category: p.category,
      imageUrl: p.imageUrl,
      stockQuantity: qty,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      status,
      isActive: p.isActive,
    }
  })

  return { inventory }
})
