import { db } from '~/server/db';
import { users, userCredits, creditTransactions, purchases, loginEvents } from '~/server/db/schema';
import { eq, sql, gte } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsersResult,
    activeUsersResult,
    totalTransactionsResult,
    todayTransactionsResult,
    totalCreditsResult,
    totalPurchasesResult,
    todayPurchasesResult,
    totalLoginsResult,
    todayLoginsResult,
    failedLoginsResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'mitarbeiter')),
    db.select({ count: sql<number>`count(*)` }).from(creditTransactions),
    db.select({ count: sql<number>`count(*)` }).from(creditTransactions).where(gte(creditTransactions.createdAt, today)),
    db.select({ sum: sql<string>`coalesce(sum(${userCredits.balance}), '0')` }).from(userCredits),
    db.select({ count: sql<number>`count(*)` }).from(purchases),
    db.select({ count: sql<number>`count(*)` }).from(purchases).where(gte(purchases.createdAt, today)),
    db.select({ count: sql<number>`count(*)` }).from(loginEvents).where(eq(loginEvents.success, true)),
    db.select({ count: sql<number>`count(*)` }).from(loginEvents).where(
      sql`${loginEvents.success} = true AND ${loginEvents.createdAt} >= ${today}`
    ),
    db.select({ count: sql<number>`count(*)` }).from(loginEvents).where(eq(loginEvents.success, false)),
  ]);

  return {
    totalUsers: totalUsersResult[0]?.count || 0,
    activeUsers: activeUsersResult[0]?.count || 0,
    totalTransactions: totalTransactionsResult[0]?.count || 0,
    todayTransactions: todayTransactionsResult[0]?.count || 0,
    totalCredits: parseFloat(totalCreditsResult[0]?.sum || '0'),
    totalPurchases: totalPurchasesResult[0]?.count || 0,
    todayPurchases: todayPurchasesResult[0]?.count || 0,
    totalLogins: totalLoginsResult[0]?.count || 0,
    todayLogins: todayLoginsResult[0]?.count || 0,
    failedLogins: failedLoginsResult[0]?.count || 0,
  };
});
