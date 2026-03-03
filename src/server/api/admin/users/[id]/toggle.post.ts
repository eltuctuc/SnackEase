import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

function checkAdminAuth(event: any): { isAdmin: boolean; userId: number | null } {
  const authCookie = getCookie(event, 'auth_token');
  
  if (!authCookie) {
    return { isAdmin: false, userId: null };
  }
  
  const userId = parseInt(authCookie.replace('user_', ''), 10);
  
  if (isNaN(userId)) {
    return { isAdmin: false, userId: null };
  }
  
  return { isAdmin: authCookie.startsWith('user_'), userId };
}

export default defineEventHandler(async (event) => {
  const auth = checkAdminAuth(event);
  
  if (!auth.isAdmin || !auth.userId) {
    throw createError({
      statusCode: 401,
      message: 'Nicht autorisiert',
    });
  }
  
  const adminUser = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
  
  if (!adminUser[0] || adminUser[0].role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin-Zugriff erforderlich',
    });
  }
  
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
