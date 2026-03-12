/**
 * GET /api/recommendations
 *
 * Gibt Top-10 Produkte mit den meisten Empfehlungen zurueck.
 * Joined mit products-Tabelle fuer vollstaendige Produkt-Infos.
 * Gibt auch zurueck ob der eingeloggte Nutzer das Produkt empfohlen hat.
 *
 * Auth: User-Session erforderlich (401 wenn nicht eingeloggt)
 *
 * Response (200):
 * {
 *   products: Array<{
 *     id, name, price, imageUrl, category, stock, isVegan, isGlutenFree,
 *     recommendationCount, isRecommendedByMe, activeOffer
 *   }>
 * }
 */

import { db } from '~/server/db'
import { recommendations, products, productOffers } from '~/server/db/schema'
import { eq, sql, inArray } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'
import { isOfferCurrentlyActive, calculateDiscountedPrice } from '~/server/utils/offers'

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // AUTH CHECK
  // ----------------------------------------
  const currentUser = await getCurrentUser(event)

  try {
    // ----------------------------------------
    // QUERY: Top-10 Produkte mit Empfehlungsanzahl
    // Tiebreaker: MIN(createdAt) ASC bei Gleichstand (EC-9)
    // ----------------------------------------
    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        category: products.category,
        price: products.price,
        imageUrl: products.imageUrl,
        calories: products.calories,
        protein: products.protein,
        sugar: products.sugar,
        fat: products.fat,
        allergens: products.allergens,
        isVegan: products.isVegan,
        isGlutenFree: products.isGlutenFree,
        isActive: products.isActive,
        stock: products.stock,
        recommendationCount: sql<number>`cast(count(${recommendations.id}) as integer)`,
      })
      .from(recommendations)
      .innerJoin(products, eq(recommendations.productId, products.id))
      .where(eq(products.isActive, true))
      .groupBy(products.id)
      .orderBy(
        sql`count(${recommendations.id}) desc`,
        sql`min("recommendations"."created_at") asc`,
      )
      .limit(10)

    if (topProducts.length === 0) {
      return { products: [] }
    }

    // ----------------------------------------
    // isRecommendedByMe: Hat der aktuelle Nutzer diese Produkte empfohlen?
    // Ein einzelner Query fuer alle productIds (kein N+1)
    // ----------------------------------------
    const productIds = topProducts.map(p => p.id)

    const myRecommendations = await db
      .select({ productId: recommendations.productId })
      .from(recommendations)
      .where(
        sql`${recommendations.userId} = ${currentUser.id} AND ${recommendations.productId} = ANY(ARRAY[${sql.join(productIds.map(id => sql`${id}::integer`), sql`, `)}])`
      )

    const myRecommendedProductIds = new Set(myRecommendations.map(r => r.productId))

    // ----------------------------------------
    // FEAT-14: Aktive Angebote laden (kein N+1)
    // ----------------------------------------
    const offers = await db
      .select()
      .from(productOffers)
      .where(inArray(productOffers.productId, productIds))

    const offersMap = new Map<number, {
      id: number
      discountType: string
      discountValue: string
      discountedPrice: string
      startsAt: string
      expiresAt: string
    }>()

    for (const offer of offers) {
      if (isOfferCurrentlyActive(offer)) {
        const product = topProducts.find(p => p.id === offer.productId)
        if (product) {
          const discountedPrice = calculateDiscountedPrice(
            parseFloat(product.price),
            offer.discountType as 'percent' | 'absolute',
            parseFloat(offer.discountValue),
          )
          offersMap.set(offer.productId, {
            id: offer.id,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            discountedPrice: discountedPrice.toFixed(2),
            startsAt: offer.startsAt.toISOString(),
            expiresAt: offer.expiresAt.toISOString(),
          })
        }
      }
    }

    return {
      products: topProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        imageUrl: p.imageUrl,
        calories: p.calories,
        protein: p.protein,
        sugar: p.sugar,
        fat: p.fat,
        allergens: p.allergens,
        isVegan: p.isVegan,
        isGlutenFree: p.isGlutenFree,
        stock: p.stock,
        recommendationCount: p.recommendationCount,
        isRecommendedByMe: myRecommendedProductIds.has(p.id),
        activeOffer: offersMap.get(p.id) ?? null,
      })),
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error fetching recommendations:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Laden der Empfehlungen' })
  }
})
