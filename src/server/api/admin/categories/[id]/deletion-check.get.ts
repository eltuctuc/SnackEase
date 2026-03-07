import { db } from '~/server/db';
import { categories, productCategories, products } from '~/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

// Prüft welche Produkte neu zugeordnet werden müssen wenn eine Kategorie gelöscht wird
// Löscht NICHT - nur Vorabprüfung
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Kategorie-ID' });
  }

  try {
    const existing = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Kategorie nicht gefunden' });
    }

    const linkedProducts = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, id));

    const productIds = linkedProducts.map(p => p.productId);
    let productsNeedingReassignment: Array<{ id: number; name: string }> = [];

    if (productIds.length > 0) {
      const allLinks = await db
        .select({ productId: productCategories.productId, categoryId: productCategories.categoryId })
        .from(productCategories)
        .where(inArray(productCategories.productId, productIds));

      const categoryCountPerProduct: Record<number, number> = {};
      for (const link of allLinks) {
        categoryCountPerProduct[link.productId] = (categoryCountPerProduct[link.productId] || 0) + 1;
      }

      const productsWithOnlyThisCategory = productIds.filter(pid => categoryCountPerProduct[pid] === 1);

      if (productsWithOnlyThisCategory.length > 0) {
        productsNeedingReassignment = await db
          .select({ id: products.id, name: products.name })
          .from(products)
          .where(inArray(products.id, productsWithOnlyThisCategory));
      }
    }

    return { productsNeedingReassignment };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Prüfen der Löschbarkeit' });
  }
});
