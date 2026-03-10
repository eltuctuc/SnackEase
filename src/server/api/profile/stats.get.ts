/**
 * GET /api/profile/stats?period=7d|30d|90d|all
 *
 * Liefert alle Profil-Daten des eingeloggten Mitarbeiters in einem API-Call:
 * - User-Stammdaten (Name, Standort, Guthaben)
 * - Einkaufsstatistiken (Gesamtausgaben, Anzahl, Lieblingsprodukt, letzter Kauf)
 * - Gesundheits-Score (serverseitig berechnet aus Naehrwerten)
 * - Bonuspunkte-Zeitreihe (fuer Chart)
 * - Bestellverlauf (nur status = picked_up)
 *
 * Nur fuer eingeloggte Mitarbeiter (nicht Admin).
 */

import { db } from '~/server/db';
import { users, userCredits, purchases, purchaseItems, products } from '~/server/db/schema';
import { and, eq, sql, gte, desc } from 'drizzle-orm';
import { getCurrentUser } from '~/server/utils/auth';
import { calculateHealthScore } from '~/server/utils/healthScore';
export { calculateHealthScore } from '~/server/utils/healthScore';

// ============================================================
// Typen
// ============================================================

interface HistoryItem {
  id: number;
  pickedUpAt: string;
  totalAmount: string;
  items: {
    productName: string;
    quantity: number;
    price: string;
  }[];
}

interface BonusChartBucket {
  label: string;
  points: number;
}

// ============================================================
// Hilfsfunktionen: Zeitraum-Berechnung
// ============================================================

/** Gibt das Startdatum fuer den gewaehlten Zeitraum zurueck */
function getSinceDate(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null; // Kein Filter
  }
}

/** Startdatum dieser Woche (Montag 00:00) */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=So, 1=Mo, ...
  const diff = day === 0 ? -6 : 1 - day; // Montag als Wochenbeginn
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Startdatum dieses Monats */
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/** Startdatum dieses Jahres */
function getYearStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
}

/** Startdatum der letzten 7 Tage */
function get7DaysAgo(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

// ============================================================
// Bonuspunkte-Chart-Aggregation
// ============================================================

interface PurchaseRow {
  id: number;
  pickedUpAt: Date | null;
  bonusPoints: number | null;
}

/**
 * Aggregiert Bonuspunkte-Daten zu Chart-Buckets.
 * Woche: 7 Tagesbalken (Mo-So)
 * Monat: 4 Wochenbalken (KW 1-4)
 * Jahr: 12 Monatsbalken (Jan-Dez)
 */
function aggregateBonusPoints(
  purchaseRows: PurchaseRow[],
  chartPeriod: 'week' | 'month' | 'year',
): BonusChartBucket[] {
  const now = new Date();

  if (chartPeriod === 'week') {
    // 7 Tagesbalken: Montag bis Sonntag der aktuellen Woche
    const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const weekStart = getWeekStart();
    const buckets: BonusChartBucket[] = dayLabels.map((label) => ({ label, points: 0 }));

    for (const row of purchaseRows) {
      if (!row.pickedUpAt) continue;
      const date = new Date(row.pickedUpAt);
      const diffDays = Math.floor(
        (date.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (diffDays >= 0 && diffDays < 7) {
        buckets[diffDays].points += row.bonusPoints ?? 0;
      }
    }
    return buckets;
  }

  if (chartPeriod === 'month') {
    // 4 Wochenbalken: KW1-KW4 des aktuellen Monats
    const monthStart = getMonthStart();
    const buckets: BonusChartBucket[] = [
      { label: 'Woche 1', points: 0 },
      { label: 'Woche 2', points: 0 },
      { label: 'Woche 3', points: 0 },
      { label: 'Woche 4', points: 0 },
    ];

    for (const row of purchaseRows) {
      if (!row.pickedUpAt) continue;
      const date = new Date(row.pickedUpAt);
      const diffDays = Math.floor(
        (date.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000),
      );
      const weekIndex = Math.min(Math.floor(diffDays / 7), 3);
      if (weekIndex >= 0) {
        buckets[weekIndex].points += row.bonusPoints ?? 0;
      }
    }
    return buckets;
  }

  // year: 12 Monatsbalken
  const monthLabels = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const buckets: BonusChartBucket[] = monthLabels.map((label) => ({ label, points: 0 }));
  const yearStart = getYearStart();

  for (const row of purchaseRows) {
    if (!row.pickedUpAt) continue;
    const date = new Date(row.pickedUpAt);
    if (date >= yearStart && date.getFullYear() === now.getFullYear()) {
      buckets[date.getMonth()].points += row.bonusPoints ?? 0;
    }
  }
  return buckets;
}

// ============================================================
// API-Handler
// ============================================================

export default defineEventHandler(async (event) => {
  // Auth: Nur eingeloggte Mitarbeiter (kein Admin-Zugriff)
  const currentUser = await getCurrentUser(event);

  if (currentUser.role === 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admins haben keinen Zugriff auf die Profil-Seite',
    });
  }

  // Query-Parameter parsen
  const query = getQuery(event);
  const period = (query.period as string) || '30d';

  if (!['7d', '30d', '90d', 'all'].includes(period)) {
    throw createError({
      statusCode: 400,
      message: 'Ungültiger period-Parameter. Erlaubt: 7d, 30d, 90d, all',
    });
  }

  const sinceDate = getSinceDate(period);
  const userId = currentUser.id;

  try {
    // ========================================================
    // Parallele Queries (Promise.all fuer Performance)
    // ========================================================

    const [
      // Query A: User-Daten + Guthaben
      userWithCredits,

      // Query B: Bestellungen im Zeitraum (fuer Verlauf + Score + Bonus)
      periodOrdersRaw,

      // Query C1: Gesamtanzahl aller abgeholten Bestellungen (alle Zeiten)
      totalOrderCountResult,

      // Query C2: Anzahl abgeholter Bestellungen in den letzten 7 Tagen
      last7DaysCountResult,

      // Query C3: Datum des letzten Kaufs (alle Zeiten)
      lastOrderResult,

      // Query C4a: Ausgaben diese Woche
      weekSpentResult,

      // Query C4b: Ausgaben diesen Monat
      monthSpentResult,

      // Query C4c: Ausgaben dieses Jahr
      yearSpentResult,

      // Query C5: Lieblingsprodukt (alle Zeiten)
      favoriteProductResult,
    ] = await Promise.all([
      // A: User + Credits
      db
        .select({
          name: users.name,
          location: users.location,
          balance: userCredits.balance,
        })
        .from(users)
        .leftJoin(userCredits, eq(userCredits.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1),

      // B: Bestellungen mit Items und Produkten im Zeitraum
      db
        .select({
          purchaseId: purchases.id,
          pickedUpAt: purchases.pickedUpAt,
          totalPrice: purchases.totalPrice,
          price: purchases.price,
          bonusPoints: purchases.bonusPoints,
          productName: products.name,
          itemQuantity: purchaseItems.quantity,
          unitPrice: purchaseItems.unitPrice,
          legacyProductId: purchases.productId,
        })
        .from(purchases)
        .leftJoin(purchaseItems, eq(purchaseItems.purchaseId, purchases.id))
        .leftJoin(products, eq(products.id, purchaseItems.productId))
        .where(
          and(
            eq(purchases.userId, userId),
            eq(purchases.status, 'picked_up'),
            ...(sinceDate ? [gte(purchases.pickedUpAt, sinceDate)] : []),
          ),
        )
        .orderBy(desc(purchases.pickedUpAt)),

      // C1: Gesamtanzahl aller abgeholten Bestellungen
      db
        .select({ count: sql<number>`count(*)` })
        .from(purchases)
        .where(and(eq(purchases.userId, userId), eq(purchases.status, 'picked_up'))),

      // C2: Anzahl in den letzten 7 Tagen
      db
        .select({ count: sql<number>`count(*)` })
        .from(purchases)
        .where(
          and(
            eq(purchases.userId, userId),
            eq(purchases.status, 'picked_up'),
            gte(purchases.pickedUpAt, get7DaysAgo()),
          ),
        ),

      // C3: Letzter Kauf
      db
        .select({ pickedUpAt: purchases.pickedUpAt })
        .from(purchases)
        .where(and(eq(purchases.userId, userId), eq(purchases.status, 'picked_up')))
        .orderBy(desc(purchases.pickedUpAt))
        .limit(1),

      // C4a: Ausgaben diese Woche
      db
        .select({
          sum: sql<string>`coalesce(sum(coalesce(${purchases.totalPrice}, ${purchases.price})), '0')`,
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.userId, userId),
            eq(purchases.status, 'picked_up'),
            gte(purchases.pickedUpAt, getWeekStart()),
          ),
        ),

      // C4b: Ausgaben diesen Monat
      db
        .select({
          sum: sql<string>`coalesce(sum(coalesce(${purchases.totalPrice}, ${purchases.price})), '0')`,
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.userId, userId),
            eq(purchases.status, 'picked_up'),
            gte(purchases.pickedUpAt, getMonthStart()),
          ),
        ),

      // C4c: Ausgaben dieses Jahr
      db
        .select({
          sum: sql<string>`coalesce(sum(coalesce(${purchases.totalPrice}, ${purchases.price})), '0')`,
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.userId, userId),
            eq(purchases.status, 'picked_up'),
            gte(purchases.pickedUpAt, getYearStart()),
          ),
        ),

      // C5: Lieblingsprodukt (alle Zeiten, nicht period-gefiltert)
      db
        .select({
          productId: purchaseItems.productId,
          productName: products.name,
          count: sql<number>`sum(${purchaseItems.quantity})`,
        })
        .from(purchaseItems)
        .innerJoin(purchases, eq(purchases.id, purchaseItems.purchaseId))
        .innerJoin(products, eq(products.id, purchaseItems.productId))
        .where(and(eq(purchases.userId, userId), eq(purchases.status, 'picked_up')))
        .groupBy(purchaseItems.productId, products.name)
        .orderBy(desc(sql<number>`sum(${purchaseItems.quantity})`), products.name)
        .limit(1),
    ]);

    // ========================================================
    // Bestellverlauf aggregieren (pro Purchase gruppieren)
    // ========================================================

    const ordersMap = new Map<number, HistoryItem>();

    for (const row of periodOrdersRaw) {
      if (!ordersMap.has(row.purchaseId)) {
        // Gesamtbetrag: totalPrice (FEAT-16 Warenkorb) oder price (FEAT-7 Legacy)
        const totalAmount = parseFloat(row.totalPrice ?? row.price ?? '0').toFixed(2);

        ordersMap.set(row.purchaseId, {
          id: row.purchaseId,
          pickedUpAt: row.pickedUpAt ? row.pickedUpAt.toISOString() : '',
          totalAmount,
          items: [],
        });
      }

      // Items hinzufuegen (nur wenn purchase_items vorhanden)
      if (row.productName && row.itemQuantity !== null) {
        ordersMap.get(row.purchaseId)!.items.push({
          productName: row.productName,
          quantity: row.itemQuantity ?? 1,
          price: row.unitPrice ?? '0',
        });
      }
    }

    const orders = Array.from(ordersMap.values());

    // ========================================================
    // Gesundheits-Score berechnen
    // ========================================================

    // Naehrwerte fuer Bestellungen im Zeitraum laden (Query E)
    let healthScore: number | null = null;

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);

      // Items mit Naehrwerten fuer Gesundheits-Score
      const healthItems = await db
        .select({
          calories: products.calories,
          sugar: products.sugar,
          fat: products.fat,
          isVegan: products.isVegan,
          isGlutenFree: products.isGlutenFree,
          quantity: purchaseItems.quantity,
        })
        .from(purchaseItems)
        .innerJoin(products, eq(products.id, purchaseItems.productId))
        .where(sql`${purchaseItems.purchaseId} = ANY(${sql.raw(`ARRAY[${orderIds.join(',')}]`)})`);

      healthScore = calculateHealthScore(healthItems);
    }

    // ========================================================
    // Bonuspunkte-Daten fuer Chart (Query D)
    // Aggregation der periodOrdersRaw-Daten (kein neuer Query noetig)
    // ========================================================

    // Eindeutige Bestellungen (pro purchaseId, nicht pro Item)
    const purchaseRowsForChart: PurchaseRow[] = [];
    const seenForChart = new Set<number>();

    for (const row of periodOrdersRaw) {
      if (!seenForChart.has(row.purchaseId)) {
        seenForChart.add(row.purchaseId);
        purchaseRowsForChart.push({
          id: row.purchaseId,
          pickedUpAt: row.pickedUpAt,
          bonusPoints: row.bonusPoints,
        });
      }
    }

    const bonusWeek = aggregateBonusPoints(purchaseRowsForChart, 'week');
    const bonusMonth = aggregateBonusPoints(purchaseRowsForChart, 'month');
    const bonusYear = aggregateBonusPoints(purchaseRowsForChart, 'year');

    // ========================================================
    // Ausgaben-Summe im gewahlten Zeitraum berechnen
    // ========================================================

    let totalSpentInPeriod = 0;
    for (const order of orders) {
      totalSpentInPeriod += parseFloat(order.totalAmount);
    }

    // ========================================================
    // Response zusammenbauen
    // ========================================================

    const userData = userWithCredits[0];

    return {
      user: {
        name: userData?.name ?? '',
        location: userData?.location ?? '',
        balance: parseFloat(userData?.balance ?? '0').toFixed(2),
      },
      stats: {
        // Zeitraum-abhaengige Stats
        totalSpent: totalSpentInPeriod.toFixed(2),
        orderCount: orders.length,
        // Zeitraum-UNabhaengige Stats (immer alle Zeiten)
        totalOrderCount: Number(totalOrderCountResult[0]?.count ?? 0),
        last7DaysCount: Number(last7DaysCountResult[0]?.count ?? 0),
        lastOrderDate: lastOrderResult[0]?.pickedUpAt?.toISOString() ?? null,
        weekSpent: parseFloat(weekSpentResult[0]?.sum ?? '0').toFixed(2),
        monthSpent: parseFloat(monthSpentResult[0]?.sum ?? '0').toFixed(2),
        yearSpent: parseFloat(yearSpentResult[0]?.sum ?? '0').toFixed(2),
        // Lieblingsprodukt (alle Zeiten)
        favoriteProduct: favoriteProductResult[0]
          ? {
              name: favoriteProductResult[0].productName ?? '',
              count: Number(favoriteProductResult[0].count),
            }
          : null,
        healthScore,
      },
      bonusChart: {
        week: bonusWeek,
        month: bonusMonth,
        year: bonusYear,
      },
      orders,
    };
  } catch (error) {
    // Bekannte H3-Errors weiterwerfen
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Profil-Daten',
    });
  }
});
