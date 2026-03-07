import { db } from '~/server/db';
import { products, productCategories, categories } from '~/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

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

    const result = allProducts.map(p => ({
      ...p,
      categories: productCategoryMap[p.id] || [],
    }));

    return result;
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Fehler beim Laden der Produkte' });
  }
});
