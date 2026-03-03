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
  
  const user = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
  
  if (!user[0] || user[0].role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin-Zugriff erforderlich',
    });
  }
  
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      location: users.location,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'mitarbeiter'));
  
  return { users: allUsers };
});
