import { db } from '~/server/db';
import { categories } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);
  const { name, description } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, message: 'Kategoriename ist erforderlich' });
  }

  try {
    // Doppelter Name?
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, name.trim()))
      .limit(1);

    if (existing[0]) {
      throw createError({ statusCode: 400, message: 'Eine Kategorie mit diesem Namen existiert bereits' });
    }

    const inserted = await db
      .insert(categories)
      .values({
        name: name.trim(),
        description: description || null,
        isActive: true,
      })
      .returning();

    return { success: true, category: inserted[0] };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Anlegen der Kategorie' });
  }
});
