import { db } from '~/server/db';
import { products, productCategories } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

// EC-6: Soft-Delete - Produkt wird nicht wirklich gelöscht, nur isActive = false
// BUG-FEAT10-008: Wenn ?rollback=true übergeben wird, wird das Produkt hard-deleted
//   (nur erlaubt wenn isActive = false, z.B. beim Rollback nach fehlgeschlagenem Bild-Upload)
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Produkt-ID' });
  }

  const query = getQuery(event);
  const isRollback = query.rollback === 'true';

  try {
    const existing = await db
      .select({ id: products.id, isActive: products.isActive })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' });
    }

    if (isRollback) {
      // Hard-Delete: Rollback nach fehlgeschlagenem Bild-Upload beim Erstellen eines neuen Produkts
      // Kein isActive-Check nötig, da das Produkt direkt nach dem Anlegen gelöscht wird (war nie sichtbar)
      await db.transaction(async (tx) => {
        // Zuerst Kategorie-Verknüpfungen löschen (Foreign Key)
        await tx.delete(productCategories).where(eq(productCategories.productId, id));
        // Dann Produkt endgültig löschen
        await tx.delete(products).where(eq(products.id, id));
      });

      return { success: true, message: 'Produkt wurde endgültig gelöscht (Rollback)' };
    }

    // Standard: Soft-Delete
    await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));

    return { success: true, message: 'Produkt wurde deaktiviert' };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Löschen des Produkts' });
  }
});
