import { db } from '~/server/db';
import { products, productCategories, categories } from '~/server/db/schema';
import { inArray } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const {
    name,
    description,
    price,
    categoryIds,
    imageUrl,
    calories,
    protein,
    sugar,
    fat,
    allergens,
    isVegan,
    isGlutenFree,
    stock,
    stockThreshold,
  } = body;

  if (!name || !price) {
    throw createError({ statusCode: 400, message: 'Name und Preis sind erforderlich' });
  }

  if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
    throw createError({ statusCode: 400, message: 'Mindestens eine Kategorie ist erforderlich' });
  }

  // FEAT-22: Schwellwert-Validierung
  if (stockThreshold !== undefined) {
    const threshold = parseInt(String(stockThreshold), 10)
    if (isNaN(threshold) || threshold < 1) {
      throw createError({ statusCode: 400, message: 'Schwellwert muss mindestens 1 sein' })
    }
  }

  const uniqueCategoryIds = [...new Set(categoryIds as number[])];

  const priceFloat = parseFloat(price);
  if (isNaN(priceFloat) || priceFloat <= 0) {
    throw createError({ statusCode: 400, message: 'Ungültiger Preis' });
  }

  try {
    // Kategorien validieren
    const validCategories = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(inArray(categories.id, uniqueCategoryIds));

    if (validCategories.length !== uniqueCategoryIds.length) {
      throw createError({ statusCode: 400, message: 'Eine oder mehrere Kategorien existieren nicht' });
    }

    let newProduct: typeof products.$inferSelect | null = null;

    await db.transaction(async (tx) => {
      // Produkt anlegen - category-Feld wird mit dem Namen der ersten Kategorie befüllt (Rückwärtskompatibilität)
      const inserted = await tx.insert(products).values({
        name,
        description: description || null,
        category: validCategories[0].name,
        price: String(priceFloat.toFixed(2)),
        imageUrl: imageUrl || null,
        calories: calories ?? null,
        protein: protein ?? null,
        sugar: sugar ?? null,
        fat: fat ?? null,
        allergens: allergens || null,
        isVegan: isVegan ?? false,
        isGlutenFree: isGlutenFree ?? false,
        isActive: true,
        stock: stock ?? 10,
        // FEAT-22: Nachbestellschwellwert (default 3)
        stockThreshold: stockThreshold !== undefined ? parseInt(String(stockThreshold), 10) : 3,
      }).returning();

      newProduct = inserted[0];

      // Kategorie-Verknüpfungen anlegen
      await tx.insert(productCategories).values(
        uniqueCategoryIds.map((categoryId: number) => ({
          productId: newProduct!.id,
          categoryId,
        }))
      );
    });

    return { success: true, product: newProduct };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Anlegen des Produkts' });
  }
});
