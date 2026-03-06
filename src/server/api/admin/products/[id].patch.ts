import { db } from '~/server/db';
import { products, productCategories, categories } from '~/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Produkt-ID' });
  }

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
    isActive,
    stock,
  } = body;

  try {
    // Produkt existiert?
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      const priceFloat = parseFloat(price);
      if (isNaN(priceFloat) || priceFloat <= 0) {
        throw createError({ statusCode: 400, message: 'Ungültiger Preis' });
      }
      updateData.price = String(priceFloat.toFixed(2));
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (calories !== undefined) updateData.calories = calories;
    if (protein !== undefined) updateData.protein = protein;
    if (sugar !== undefined) updateData.sugar = sugar;
    if (fat !== undefined) updateData.fat = fat;
    if (allergens !== undefined) updateData.allergens = allergens;
    if (isVegan !== undefined) updateData.isVegan = isVegan;
    if (isGlutenFree !== undefined) updateData.isGlutenFree = isGlutenFree;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (stock !== undefined) updateData.stock = stock;

    await db.transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        // Kategorie-Feld bei Kategorie-Änderung synchron halten
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
          const validCategories = await tx
            .select({ id: categories.id, name: categories.name })
            .from(categories)
            .where(inArray(categories.id, categoryIds));

          if (validCategories.length !== categoryIds.length) {
            throw createError({ statusCode: 400, message: 'Eine oder mehrere Kategorien existieren nicht' });
          }

          updateData.category = validCategories[0].name;

          // Alte Verknüpfungen löschen und neue anlegen
          await tx.delete(productCategories).where(eq(productCategories.productId, id));
          await tx.insert(productCategories).values(
            categoryIds.map((categoryId: number) => ({ productId: id, categoryId }))
          );
        }

        await tx.update(products).set(updateData).where(eq(products.id, id));
      }
    });

    const updated = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return { success: true, product: updated[0] };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Aktualisieren des Produkts' });
  }
});
