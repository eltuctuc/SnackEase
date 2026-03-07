import { db } from '~/server/db';
import { userCredits, creditTransactions, purchases } from '~/server/db/schema';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

// EC-8: System-Reset muss auch purchases-Tabelle leeren
// BUG-FEAT10-013: In-Memory-Lock verhindert parallele Reset-Anfragen
let isResetting = false;

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  if (isResetting) {
    throw createError({ statusCode: 409, message: 'System-Reset bereits aktiv. Bitte warten.' });
  }

  isResetting = true;

  try {
    await db.transaction(async (tx) => {
      // EC-8: purchases-Tabelle leeren (war vorher vergessen)
      await tx.delete(purchases).execute();

      // Transaktionshistorie leeren
      await tx.delete(creditTransactions).execute();

      // Guthaben aller Nutzer auf 25 € zurücksetzen
      await tx.update(userCredits).set({ balance: sql`25.00` }).execute();
    });

    return { success: true, message: 'System-Reset erfolgreich durchgeführt' };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Reset: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'),
    });
  } finally {
    isResetting = false;
  }
});
