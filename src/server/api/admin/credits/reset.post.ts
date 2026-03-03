import { db } from '~/server/db';
import { userCredits } from '~/server/db/schema';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  
  try {
    await db.update(userCredits).set({ balance: sql`25.00` }).execute();
    
    return { success: true, message: 'Guthaben-Reset erfolgreich durchgeführt' };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Guthaben-Reset: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'),
    });
  }
});
