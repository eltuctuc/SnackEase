/**
 * GET /api/admin/inventory
 *
 * FEAT-12: Bestandsverwaltung — Bestandsübersicht für Admin
 * FEAT-22: stockThreshold pro Produkt aus DB — ersetzt hardkodierten Wert 3
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
 *       "stockThreshold": 3,
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

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      imageUrl: products.imageUrl,
      stock: products.stock,
      stockThreshold: products.stockThreshold,
      isActive: products.isActive,
    })
    .from(products)
    .orderBy(asc(products.name))

  const inventory = rows.map((p) => {
    const qty = p.stock ?? 0
    const threshold = p.stockThreshold ?? 3
    const status = qty === 0 ? 'empty' : qty <= threshold ? 'low' : 'ok'

    return {
      productId: p.id,
      productName: p.name,
      category: p.category,
      imageUrl: p.imageUrl,
      stockQuantity: qty,
      stockThreshold: threshold,
      status,
      isActive: p.isActive,
    }
  })

  return { inventory }
})
