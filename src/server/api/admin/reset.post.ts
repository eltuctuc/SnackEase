import { db } from '~/server/db';
import { userCredits, creditTransactions, purchases, products } from '~/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

// BUG-FEAT12-002: Produktspezifische Seed-Bestände aus src/server/seed.ts
// Zuordnung über Produktnamen, da IDs sich nach DB-Resets ändern können
const SEED_STOCK_BY_NAME: Record<string, number> = {
  'Bio Apfel': 50,
  'Banane': 40,
  'Protein Riegel Schoko': 25,
  'Protein Riegel Vanille': 20,
  'Veggie Protein Bar': 15,
  'Chocolate Shake': 30,
  'Vanille Shake': 28,
  'Beeren Shake': 22,
  'Vegan Shake Berry': 18,
  'Schokoriegel Vollmilch': 35,
  'Schokoriegel Dunkel': 25,
  'Haselnuss-Nougat Riegel': 20,
  'Erdnüsse Geröstet': 40,
  'Mandeln': 30,
  'Cashew Kerne': 25,
  'Mix Nüsse': 20,
  'Orangensaft': 30,
  'Apfelsaft': 28,
  'Wasser Medium': 50,
  'Cola Zero': 40,
  'Iso Sport Drink': 25,
};

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

      // BUG-FEAT12-002: Bestand produktspezifisch auf Seed-Werte zurücksetzen
      // Fallback auf 10 für Produkte die nicht in der Seed-Map vorhanden sind (z.B. manuell angelegte)
      const allProducts = await tx.select({ id: products.id, name: products.name }).from(products);
      for (const product of allProducts) {
        const seedStock = SEED_STOCK_BY_NAME[product.name] ?? 10;
        await tx.update(products).set({ stock: seedStock }).where(eq(products.id, product.id));
      }
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
