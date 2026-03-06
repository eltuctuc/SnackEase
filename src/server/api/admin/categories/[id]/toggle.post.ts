import { db } from '~/server/db';
import { categories } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

// EC-2: Kategorie deaktivieren blendet Produkte im Frontend aus, deaktiviert sie NICHT
export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Kategorie-ID' });
  }

  try {
    const existing = await db
      .select({ id: categories.id, isActive: categories.isActive })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Kategorie nicht gefunden' });
    }

    const newState = !existing[0].isActive;

    await db
      .update(categories)
      .set({ isActive: newState })
      .where(eq(categories.id, id));

    return {
      success: true,
      isActive: newState,
      message: newState ? 'Kategorie aktiviert' : 'Kategorie deaktiviert',
    };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Ändern des Kategorie-Status' });
  }
});
