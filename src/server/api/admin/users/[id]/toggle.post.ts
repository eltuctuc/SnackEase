import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  
  const userIdParam = getRouterParam(event, 'id');
  const userId = parseInt(userIdParam || '', 10);
  
  if (isNaN(userId)) {
    throw createError({
      statusCode: 400,
      message: 'Ungültige Nutzer-ID',
    });
  }
  
  const targetUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!targetUser[0]) {
    throw createError({
      statusCode: 404,
      message: 'Nutzer nicht gefunden',
    });
  }
  
  if (targetUser[0].role === 'admin') {
    throw createError({
      statusCode: 400,
      message: 'Admin-Konten können nicht deaktiviert werden',
    });
  }
  
  const newStatus = !targetUser[0].isActive;
  
  await db.update(users).set({ isActive: newStatus }).where(eq(users.id, userId));
  
  return {
    success: true,
    userId,
    isActive: newStatus,
    message: newStatus ? 'Nutzer aktiviert' : 'Nutzer deaktiviert'
  };
});
