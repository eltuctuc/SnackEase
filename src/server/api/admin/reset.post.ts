import { db } from '~/server/db';
import { users, userCredits, creditTransactions } from '~/server/db/schema';
import { eq, sql } from 'drizzle-orm';

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
  
  try {
    await db.transaction(async (tx) => {
      await tx.delete(creditTransactions).execute();
      
      await tx.update(userCredits).set({ balance: sql`25.00` }).execute();
    });
    
    return { success: true, message: 'System-Reset erfolgreich durchgeführt' };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Reset: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'),
    });
  }
});
