/**
 * GET /api/admin/offers
 *
 * FEAT-14: Alle Angebote abrufen (Admin)
 *
 * @description
 * Gibt alle Angebote zurück — auch inaktive und geplante.
 * Optional nach productId filtern.
 *
 * @route GET /api/admin/offers
 * @access Admin
 *
 * @queryParams
 * - productId?: number - Filtert auf ein bestimmtes Produkt
 *
 * @response Array von Angebot-Objekten mit berechnetem discountedPrice
 */

import { db } from '~/server/db'
import { productOffers, products } from '~/server/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { calculateDiscountedPrice, isOfferCurrentlyActive } from '~/server/utils/offers'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const query = getQuery(event)
    const productIdParam = query.productId ? parseInt(query.productId as string, 10) : null

    // Angebote laden (mit optionalem Filter)
    const offersQuery = db.select().from(productOffers)
    const offers = productIdParam
      ? await offersQuery.where(eq(productOffers.productId, productIdParam))
      : await offersQuery

    if (offers.length === 0) {
      return []
    }

    // Produkte laden für Preis-Berechnung
    const productIds = [...new Set(offers.map(o => o.productId))]
    const productList = await db
      .select({ id: products.id, price: products.price })
      .from(products)
      .where(inArray(products.id, productIds))

    const productPriceMap = new Map(productList.map(p => [p.id, p.price]))

    return offers.map(offer => {
      const productPrice = productPriceMap.get(offer.productId)
      const originalPrice = productPrice ? parseFloat(productPrice) : 0
      const discountedPrice = calculateDiscountedPrice(
        originalPrice,
        offer.discountType as 'percent' | 'absolute',
        parseFloat(offer.discountValue),
      )

      return {
        id: offer.id,
        productId: offer.productId,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        discountedPrice: discountedPrice.toFixed(2),
        startsAt: offer.startsAt.toISOString(),
        expiresAt: offer.expiresAt.toISOString(),
        isActive: offer.isActive,
        isCurrentlyActive: isOfferCurrentlyActive(offer),
        createdAt: offer.createdAt?.toISOString() ?? null,
        updatedAt: offer.updatedAt?.toISOString() ?? null,
      }
    })
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Laden der Angebote',
    })
  }
})
