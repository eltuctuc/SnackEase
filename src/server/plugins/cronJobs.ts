/**
 * Nitro Server Plugin: Cron-Jobs
 *
 * FEAT-11: Automatische Stornierung abgelaufener Bestellungen
 *
 * @description
 * Dieses Plugin startet beim Server-Start und führt jede Minute
 * die cancelExpiredOrders-Funktion aus.
 *
 * Abgelaufene Bestellungen (status='pending_pickup', expiresAt < jetzt)
 * werden automatisch storniert und das Guthaben zurückerstattet.
 *
 * Warum Nitro Plugin?
 * - Nativer Nuxt 3 Mechanismus für Server-seitige Initialisierung
 * - Kein externer Dienst nötig (kein Vercel Cron)
 * - Läuft solange der Server-Prozess läuft
 *
 * Race Condition Schutz:
 * - DB-Transaktion mit Row-Level Lock (SELECT FOR UPDATE)
 * - Wenn Abholung und Cron-Job gleichzeitig laufen, gewinnt der erste
 */

import { db } from '~/server/db'
import { purchases, userCredits, creditTransactions, products } from '~/server/db/schema'
import { eq, and, lt, sql } from 'drizzle-orm'

/**
 * Storniert alle abgelaufenen Bestellungen und erstattet Guthaben zurück
 */
async function cancelExpiredOrders(): Promise<void> {
  try {
    const now = new Date()

    // Alle abgelaufenen pending_pickup-Bestellungen finden
    const expiredOrders = await db
      .select({
        id: purchases.id,
        userId: purchases.userId,
        productId: purchases.productId,
        price: purchases.price,
      })
      .from(purchases)
      .where(
        and(
          eq(purchases.status, 'pending_pickup'),
          lt(purchases.expiresAt, now)
        )
      )

    if (expiredOrders.length === 0) {
      return
    }

    console.log(`[CronJob] Storniere ${expiredOrders.length} abgelaufene Bestellung(en)...`)

    for (const order of expiredOrders) {
      try {
        await db.transaction(async (tx) => {
          // Row-Level Lock: Sicherstellen dass keine gleichzeitige Abholung stattfindet
          const locked = await tx.execute(
            sql`SELECT id, status FROM purchases WHERE id = ${order.id} FOR UPDATE`
          )

          const lockedOrder = locked.rows[0] as { id: number; status: string } | undefined

          // Nochmals prüfen ob noch pending_pickup (könnte inzwischen abgeholt worden sein)
          if (!lockedOrder || lockedOrder.status !== 'pending_pickup') {
            return // Abholung hat gewonnen — überspringen
          }

          // Status auf cancelled setzen
          await tx
            .update(purchases)
            .set({
              status: 'cancelled',
              cancelledAt: now,
            })
            .where(eq(purchases.id, order.id))

          // Guthaben zurückerstatten
          await tx
            .update(userCredits)
            .set({
              balance: sql`${userCredits.balance} + ${order.price}`,
              updatedAt: now,
            })
            .where(eq(userCredits.userId, order.userId))

          // Produktname für Transaction-Log holen
          const productRows = await tx
            .select({ name: products.name })
            .from(products)
            .where(eq(products.id, order.productId))
            .limit(1)

          const productName = productRows[0]?.name ?? 'Unbekanntes Produkt'

          // Refund-Transaktion loggen
          await tx.insert(creditTransactions).values({
            userId: order.userId,
            amount: order.price.toString(),
            type: 'refund',
            description: `Rückerstattung: ${productName} (Bestellung abgelaufen)`,
          })
        })

        console.log(`[CronJob] Bestellung #${order.id} storniert, Guthaben zurückerstattet`)
      } catch (txErr: unknown) {
        // Einzelne Transaktion fehlgeschlagen — weiter mit nächster Bestellung
        const e = txErr as { message?: string }
        console.error(`[CronJob] Fehler bei Bestellung #${order.id}:`, e.message)
      }
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[CronJob] Fehler beim Laden abgelaufener Bestellungen:', e.message)
  }
}

export default defineNitroPlugin(() => {
  // Einmal beim Start ausführen (falls Server nach langer Pause startet)
  cancelExpiredOrders()

  // Dann jede Minute wiederholen
  setInterval(cancelExpiredOrders, 60 * 1000)

  console.log('[CronJob] Automatische Stornierung aktiv (Intervall: 60s)')
})
