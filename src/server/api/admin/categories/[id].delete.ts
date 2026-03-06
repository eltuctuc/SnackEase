import { db } from '~/server/db';
import { categories, productCategories, products } from '~/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

// EC-1: Kategorie löschen mit Produkt-Überprüfung
// EC-1b: Produkte die nur in dieser Kategorie sind müssen neu zugeordnet werden
// EC-1c: Niemals Produkt ohne Kategorie
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Kategorie-ID' });
  }

  const body = await readBody(event).catch(() => ({}));
  // productReassignments: Array von { productId, newCategoryId } für Produkte die neu zugeordnet werden müssen
  const productReassignments: Array<{ productId: number; newCategoryId: number }> = body.productReassignments || [];

  try {
    const existing = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Kategorie nicht gefunden' });
    }

    // Produkte in dieser Kategorie finden
    const linkedProducts = await db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, id));

    const productIds = linkedProducts.map(p => p.productId);

    // Prüfen welche Produkte NUR in dieser Kategorie sind
    let productsWithOnlyThisCategory: number[] = [];

    if (productIds.length > 0) {
      // Produkte die in mehreren Kategorien sind
      // Alle Kategorie-Verknüpfungen für diese Produkte
      const allLinks = await db
        .select({ productId: productCategories.productId, categoryId: productCategories.categoryId })
        .from(productCategories)
        .where(inArray(productCategories.productId, productIds));

      // Produkte zählen wie viele Kategorien sie haben
      const categoryCountPerProduct: Record<number, number> = {};
      for (const link of allLinks) {
        categoryCountPerProduct[link.productId] = (categoryCountPerProduct[link.productId] || 0) + 1;
      }

      productsWithOnlyThisCategory = productIds.filter(pid => categoryCountPerProduct[pid] === 1);
    }

    // Wenn es Produkte gibt die nur in dieser Kategorie sind und keine Neuzuweisung vorhanden
    if (productsWithOnlyThisCategory.length > 0) {
      const reassignedIds = productReassignments.map(r => r.productId);
      const unhandled = productsWithOnlyThisCategory.filter(pid => !reassignedIds.includes(pid));

      if (unhandled.length > 0) {
        // Produktdetails für die Antwort
        const affectedProducts = await db
          .select({ id: products.id, name: products.name })
          .from(products)
          .where(inArray(products.id, unhandled));

        throw createError({
          statusCode: 409,
          message: 'Kategorie kann nicht gelöscht werden: Produkte müssen neu zugeordnet werden',
          data: { productsNeedingReassignment: affectedProducts },
        } as any);
      }
    }

    await db.transaction(async (tx) => {
      // Neuzuweisungen durchführen
      for (const reassignment of productReassignments) {
        // Alte Verknüpfung mit dieser Kategorie entfernen
        await tx
          .delete(productCategories)
          .where(
            and(
              eq(productCategories.productId, reassignment.productId),
              eq(productCategories.categoryId, id)
            )
          );

        // Neue Verknüpfung anlegen (nur wenn noch nicht vorhanden)
        const alreadyLinked = await tx
          .select({ id: productCategories.id })
          .from(productCategories)
          .where(
            and(
              eq(productCategories.productId, reassignment.productId),
              eq(productCategories.categoryId, reassignment.newCategoryId)
            )
          )
          .limit(1);

        if (!alreadyLinked[0]) {
          await tx.insert(productCategories).values({
            productId: reassignment.productId,
            categoryId: reassignment.newCategoryId,
          });
        }
      }

      // Alle übrigen Verknüpfungen mit dieser Kategorie löschen (Produkte mit mehreren Kategorien)
      await tx.delete(productCategories).where(eq(productCategories.categoryId, id));

      // Kategorie löschen
      await tx.delete(categories).where(eq(categories.id, id));
    });

    return {
      success: true,
      message: `Kategorie "${existing[0].name}" wurde gelöscht`,
      reassignedCount: productReassignments.length,
    };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Löschen der Kategorie' });
  }
});
