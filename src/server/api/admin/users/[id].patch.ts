import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Nutzer-ID' });
  }

  const body = await readBody(event);
  const { name, location } = body;

  if (!name && !location) {
    throw createError({ statusCode: 400, message: 'Mindestens ein Feld (Name oder Standort) erforderlich' });
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (location !== undefined) updateData.location = location;

  try {
    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        location: users.location,
        role: users.role,
        isActive: users.isActive,
      });

    if (!updated[0]) {
      throw createError({ statusCode: 404, message: 'Nutzer nicht gefunden' });
    }

    return { success: true, user: updated[0] };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Aktualisieren des Nutzers' });
  }
});
