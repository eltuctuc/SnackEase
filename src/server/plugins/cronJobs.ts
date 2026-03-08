/**
 * Nitro Server Plugin: Cron-Jobs
 *
 * FEAT-11: Automatische Stornierung abgelaufener Bestellungen
 * FEAT-16: Kein Refund mehr nötig (Guthaben wird erst beim Abholen abgezogen)
 *
 * @description
 * Dieses Plugin startet beim Server-Start und führt jede Minute
 * die cancelExpiredOrders-Funktion aus.
 *
 * Abgelaufene Bestellungen (status='pending_pickup', expiresAt < jetzt)
 * werden automatisch storniert.
 *
 * FEAT-16 Änderung:
 * - Kein Guthaben-Refund mehr! Das Guthaben wird erst beim Abholen abgezogen.
 * - Bei Stornierung verfällt die Bestellung einfach ohne Guthaben-Bewegung.
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
import { purchases, productOffers } from '~/server/db/schema'
import { eq, and, lt, sql } from 'drizzle-orm'

/**
 * Storniert alle abgelaufenen Bestellungen
 * FEAT-16: Kein Guthaben-Refund mehr!
 */
async function cancelExpiredOrders(): Promise<void> {
  try {
    const now = new Date()

    // Alle abgelaufenen pending_pickup-Bestellungen finden
    const expiredOrders = await db
      .select({
        id: purchases.id,
        userId: purchases.userId,
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

          // Status auf cancelled setzen (kein Refund mehr!)
          await tx
            .update(purchases)
            .set({
              status: 'cancelled',
              cancelledAt: now,
            })
            .where(eq(purchases.id, order.id))
        })

        console.log(`[CronJob] Bestellung #${order.id} storniert (kein Refund - FEAT-16)`)
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

/**
 * Löscht alle abgelaufenen Angebote
 * FEAT-14: Cleanup abgelaufener Angebote
 */
async function cleanupExpiredOffers(): Promise<void> {
  try {
    const now = new Date()

    const deleted = await db
      .delete(productOffers)
      .where(lt(productOffers.expiresAt, now))
      .returning({ id: productOffers.id })

    if (deleted.length > 0) {
      console.log(`[CronJob] ${deleted.length} abgelaufene Angebot(e) gelöscht (FEAT-14)`)
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[CronJob] Fehler beim Löschen abgelaufener Angebote:', e.message)
  }
}

export default defineNitroPlugin(() => {
  // Einmal beim Start ausführen (falls Server nach langer Pause startet)
  cancelExpiredOrders()
  cleanupExpiredOffers()

  // Dann jede Minute wiederholen
  setInterval(cancelExpiredOrders, 60 * 1000)
  setInterval(cleanupExpiredOffers, 60 * 1000)

  console.log('[CronJob] Automatische Stornierung aktiv (Intervall: 60s, kein Refund - FEAT-16)')
  console.log('[CronJob] Angebots-Cleanup aktiv (Intervall: 60s - FEAT-14)')
})
