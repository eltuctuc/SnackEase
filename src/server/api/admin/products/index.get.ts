import { db } from '~/server/db';
import { products, productCategories, categories, productOffers } from '~/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';
import { isOfferCurrentlyActive, calculateDiscountedPrice } from '~/server/utils/offers';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const allProducts = await db
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
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(products.name);

    // Kategorien pro Produkt laden
    const productIds = allProducts.map(p => p.id);

    let productCategoryMap: Record<number, Array<{ id: number; name: string }>> = {};

    if (productIds.length > 0) {
      const categoryLinks = await db
        .select({
          productId: productCategories.productId,
          categoryId: categories.id,
          categoryName: categories.name,
        })
        .from(productCategories)
        .innerJoin(categories, eq(productCategories.categoryId, categories.id))
        .where(inArray(productCategories.productId, productIds));

      for (const link of categoryLinks) {
        if (!productCategoryMap[link.productId]) {
          productCategoryMap[link.productId] = [];
        }
        productCategoryMap[link.productId].push({ id: link.categoryId, name: link.categoryName });
      }
    }

    // FEAT-14: Aktive Angebote für alle Produkte in einem Query laden
    let offersMap = new Map<number, {
      id: number
      discountType: string
      discountValue: string
      discountedPrice: string
      startsAt: string
      expiresAt: string
    }>()

    if (productIds.length > 0) {
      const offers = await db
        .select()
        .from(productOffers)
        .where(inArray(productOffers.productId, productIds))

      for (const offer of offers) {
        if (isOfferCurrentlyActive(offer)) {
          const product = allProducts.find(p => p.id === offer.productId)
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
    }

    const result = allProducts.map(p => ({
      ...p,
      categories: productCategoryMap[p.id] || [],
      activeOffer: offersMap.get(p.id) ?? null,
    }));

    return result;
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Fehler beim Laden der Produkte' });
  }
});
