import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import type { H3Event } from 'h3';

/**
 * Extrahiert User-ID aus Auth-Cookie
 */
export function getUserIdFromCookie(event: H3Event): number | null {
  const authCookie = getCookie(event, 'auth_token');
  
  if (!authCookie || !authCookie.startsWith('user_')) {
    return null;
  }
  
  const userId = parseInt(authCookie.replace('user_', ''), 10);
  
  if (isNaN(userId)) {
    return null;
  }
  
  return userId;
}

/**
 * Prüft ob der eingeloggte User Admin ist
 * Wirft 401/403 Error wenn nicht autorisiert
 */
export async function requireAdmin(event: H3Event) {
  const userId = getUserIdFromCookie(event);
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Nicht autorisiert',
    });
  }
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user[0] || user[0].role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin-Zugriff erforderlich',
    });
  }
  
  return user[0];
}

/**
 * Holt den aktuell eingeloggten User (ohne Rolle-Prüfung)
 */
export async function getCurrentUser(event: H3Event) {
  const userId = getUserIdFromCookie(event);
  
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Nicht eingeloggt',
    });
  }
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user[0] || user[0].isActive === false) {
    throw createError({
      statusCode: 401,
      message: 'User nicht gefunden oder deaktiviert',
    });
  }
  
  return user[0];
}
