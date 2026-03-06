import { db } from '~/server/db';
import { products } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

// EC-6: Soft-Delete - Produkt wird nicht wirklich gelöscht, nur isActive = false
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Produkt-ID' });
  }

  try {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' });
    }

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
