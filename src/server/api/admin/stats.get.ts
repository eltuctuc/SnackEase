import { db } from '~/server/db';
import { users, userCredits, creditTransactions } from '~/server/db/schema';
import { eq, sql, gte } from 'drizzle-orm';

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
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  const activeUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'mitarbeiter'));
  
  const totalTransactions = await db.select({ count: sql<number>`count(*)` }).from(creditTransactions);
  
  const todayTransactions = await db
    .select({ count: sql<number>`count(*)` })
    .from(creditTransactions)
    .where(gte(creditTransactions.createdAt, today));
  
  const totalCreditsResult = await db
    .select({ sum: sql<string>`coalesce(sum(${userCredits.balance}), '0')` })
    .from(userCredits);
  
  return {
    totalUsers: totalUsers[0]?.count || 0,
    activeUsers: activeUsers[0]?.count || 0,
    totalTransactions: totalTransactions[0]?.count || 0,
    todayTransactions: todayTransactions[0]?.count || 0,
    totalCredits: parseFloat(totalCreditsResult[0]?.sum || '0'),
  };
});
