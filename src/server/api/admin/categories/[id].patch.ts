import { db } from '~/server/db';
import { categories } from '~/server/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Kategorie-ID' });
  }

  const body = await readBody(event);
  const { name, description } = body;

  if (!name && description === undefined) {
    throw createError({ statusCode: 400, message: 'Mindestens ein Feld erforderlich' });
  }

  try {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Kategorie nicht gefunden' });
    }

    // Duplikat-Check: Kein anderer Eintrag mit demselben Namen
    if (name !== undefined) {
      const duplicate = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.name, name.trim()), ne(categories.id, id)))
        .limit(1);

      if (duplicate[0]) {
        throw createError({ statusCode: 400, message: `Eine Kategorie mit dem Namen "${name.trim()}" existiert bereits.` });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;

    const updated = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    return { success: true, category: updated[0] };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Aktualisieren der Kategorie' });
  }
});
