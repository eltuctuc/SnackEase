/**
 * GET /api/favorites
 *
 * Gibt private Favoriten-Liste des eingeloggten Nutzers zurueck.
 * Sortierung: neueste zuerst (favorites.createdAt DESC).
 * Privatsphare: Gibt ausschliesslich die eigenen Favoriten zurueck (REQ-19).
 *
 * Auth: User-Session erforderlich
 *
 * Response (200): { favorites: Array<{ id, name, price, ... , addedAt }> }
 */

import { db } from '~/server/db'
import { favorites, products, productOffers } from '~/server/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'
import { isOfferCurrentlyActive, calculateDiscountedPrice } from '~/server/utils/offers'

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // AUTH CHECK
  // ----------------------------------------
  const currentUser = await getCurrentUser(event)

  try {
    // ----------------------------------------
    // QUERY: Eigene Favoriten mit Produktdaten
    // Sortierung: neueste zuerst (REQ-21)
    // ----------------------------------------
    const userFavorites = await db
      .select({
        favoriteId: favorites.id,
        addedAt: favorites.createdAt,
        productId: products.id,
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
      })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, currentUser.id))
      .orderBy(favorites.createdAt)

    // Neueste zuerst (DESC)
    userFavorites.reverse()

    if (userFavorites.length === 0) {
      return { favorites: [] }
    }

    // ----------------------------------------
    // FEAT-14: Aktive Angebote laden (kein N+1)
    // ----------------------------------------
    const productIds = userFavorites.map(f => f.productId)

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
        const fav = userFavorites.find(f => f.productId === offer.productId)
        if (fav) {
          const discountedPrice = calculateDiscountedPrice(
            parseFloat(fav.price),
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
      favorites: userFavorites.map(f => ({
        id: f.productId,
        name: f.name,
        description: f.description,
        category: f.category,
        price: f.price,
        imageUrl: f.imageUrl,
        calories: f.calories,
        protein: f.protein,
        sugar: f.sugar,
        fat: f.fat,
        allergens: f.allergens,
        isVegan: f.isVegan,
        isGlutenFree: f.isGlutenFree,
        stock: f.stock,
        addedAt: f.addedAt?.toISOString() ?? new Date().toISOString(),
        activeOffer: offersMap.get(f.productId) ?? null,
      })),
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error
    console.error('Error fetching favorites:', error)
    throw createError({ statusCode: 500, message: 'Fehler beim Laden der Favoriten' })
  }
})
