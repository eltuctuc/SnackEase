import { db } from '~/server/db';
import { userCredits, creditTransactions } from '~/server/db/schema';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  
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
