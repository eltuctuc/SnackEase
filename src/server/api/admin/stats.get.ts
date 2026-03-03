import { db } from '~/server/db';
import { users, userCredits, creditTransactions } from '~/server/db/schema';
import { eq, sql, gte } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  
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
