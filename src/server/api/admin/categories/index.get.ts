import { db } from '~/server/db';
import { categories, productCategories } from '~/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        productCount: sql<number>`count(${productCategories.id})`,
      })
      .from(categories)
      .leftJoin(productCategories, eq(categories.id, productCategories.categoryId))
      .groupBy(categories.id)
      .orderBy(categories.name);

    return allCategories;
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Fehler beim Laden der Kategorien' });
  }
});
