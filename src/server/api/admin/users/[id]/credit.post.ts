import { db } from '~/server/db';
import { users, userCredits, creditTransactions } from '~/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Nutzer-ID' });
  }

  const body = await readBody(event);
  const { amount, note } = body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw createError({ statusCode: 400, message: 'Betrag muss eine positive Zahl sein' });
  }

  try {
    // Prüfe ob Nutzer existiert
    const user = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!user[0]) {
      throw createError({ statusCode: 404, message: 'Nutzer nicht gefunden' });
    }

    await db.transaction(async (tx) => {
      // Guthaben erhöhen (upsert)
      const existingCredit = await tx
        .select({ id: userCredits.id })
        .from(userCredits)
        .where(eq(userCredits.userId, id))
        .limit(1);

      if (existingCredit[0]) {
        await tx
          .update(userCredits)
          .set({
            balance: sql`${userCredits.balance} + ${amount}`,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, id));
      } else {
        await tx.insert(userCredits).values({
          userId: id,
          balance: String(amount),
        });
      }

      // Transaktion protokollieren
      await tx.insert(creditTransactions).values({
        userId: id,
        amount: String(amount),
        type: 'recharge',
        description: note || 'Admin-Guthaben-Zuweisung',
      });
    });

    return { success: true, message: 'Guthaben erfolgreich zugewiesen' };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Zuweisen des Guthabens' });
  }
});
