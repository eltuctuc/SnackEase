/**
 * POST /api/orders/:id/pickup
 *
 * FEAT-11: Bestellabholung — Bestellung per NFC oder PIN abholen
 *
 * @description
 * Führt die Abholung einer Bestellung durch. Unterstützt zwei Methoden:
 * - "nfc": Simulation einer NFC-Abholung (kein PIN nötig)
 * - "pin": PIN-basierte Abholung (PIN muss übereinstimmen)
 *
 * Prüfungen:
 * 1. User authentifiziert
 * 2. Bestellung existiert und gehört dem User
 * 3. Status ist "pending_pickup"
 * 4. Bestellung ist nicht abgelaufen (expiresAt > jetzt)
 * 5. Bei PIN-Methode: PIN stimmt überein
 *
 * Bei Erfolg: Status → "picked_up", pickedUpAt wird gesetzt
 *
 * @route POST /api/orders/:id/pickup
 * @access Protected (Login erforderlich)
 *
 * @requestBody
 * ```json
 * { "method": "nfc" }
 * // oder
 * { "method": "pin", "pin": "1234" }
 * ```
 *
 * @response
 * ```json
 * {
 *   "success": true,
 *   "message": "Bestellung erfolgreich abgeholt!",
 *   "order": { "id": 1, "status": "picked_up", "pickedUpAt": "..." }
 * }
 * ```
 *
 * @throws {400} - Ungültige Methode, falsche PIN, Bestellung abgelaufen
 * @throws {401} - Nicht eingeloggt
 * @throws {403} - Fremde Bestellung
 * @throws {404} - Bestellung nicht gefunden
 * @throws {409} - Bereits abgeholt oder storniert
 * @throws {500} - DB-Fehler
 */

import { db } from '~/server/db'
import { purchases } from '~/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

// ========================================
// RATE LIMITING (BUG-FEAT11-003)
// In-Memory-Map: key = "userId:orderId", value = Anzahl fehlgeschlagener PIN-Versuche
// Max 3 Fehlversuche pro Bestellung, dann 429 Too Many Requests
// ========================================

const MAX_PIN_ATTEMPTS = 3
const pinAttempts = new Map<string, number>()

interface PickupRequest {
  method: 'nfc' | 'pin'
  pin?: string
}

interface PickupResponse {
  success: true
  message: string
  order: {
    id: number
    status: string
    pickedUpAt: string
  }
}

export default defineEventHandler(async (event): Promise<PickupResponse> => {
  // ========================================
  // SCHRITT 1: URL-Parameter lesen
  // ========================================

  const orderId = parseInt(getRouterParam(event, 'id') ?? '', 10)

  if (isNaN(orderId)) {
    throw createError({
      statusCode: 400,
      message: 'Ungültige Bestell-ID',
    })
  }

  // ========================================
  // SCHRITT 2: Request-Body lesen und validieren
  // ========================================

  const body = await readBody<PickupRequest>(event)
  const { method, pin } = body

  if (method !== 'nfc' && method !== 'pin') {
    throw createError({
      statusCode: 400,
      message: 'Methode muss "nfc" oder "pin" sein',
    })
  }

  if (method === 'pin' && (!pin || !/^\d{4}$/.test(pin))) {
    throw createError({
      statusCode: 400,
      message: 'PIN muss genau 4 Ziffern enthalten',
    })
  }

  try {
    // ========================================
    // SCHRITT 3: User authentifizieren
    // ========================================

    const user = await getCurrentUser(event)

    // ========================================
    // SCHRITT 4: Bestellung per Datenbank-Transaktion verarbeiten
    // (SELECT FOR UPDATE verhindert Race Condition mit Cron-Job)
    // ========================================

    const pickedUpAt = new Date()

    const result = await db.transaction(async (tx) => {
      // Bestellung mit Row-Level-Lock laden
      const rows = await tx.execute(
        sql`SELECT id, user_id, status, pickup_pin, expires_at FROM purchases WHERE id = ${orderId} FOR UPDATE`
      )

      const order = rows.rows[0] as {
        id: number
        user_id: number
        status: string
        pickup_pin: string
        expires_at: Date | string
      } | undefined

      // Bestellung nicht gefunden
      if (!order) {
        throw createError({
          statusCode: 404,
          message: 'Bestellung nicht gefunden',
        })
      }

      // Eigentümerprüfung
      if (order.user_id !== user.id) {
        throw createError({
          statusCode: 403,
          message: 'Zugriff verweigert',
        })
      }

      // Status-Prüfung
      if (order.status === 'picked_up') {
        throw createError({
          statusCode: 409,
          message: 'Diese Bestellung wurde bereits abgeholt',
        })
      }

      if (order.status === 'cancelled') {
        throw createError({
          statusCode: 409,
          message: 'Bestellung wurde storniert, Guthaben zurückerstattet',
        })
      }

      // Ablauf-Prüfung
      const expiresAt = new Date(order.expires_at)
      if (expiresAt < new Date()) {
        throw createError({
          statusCode: 400,
          message: 'Bestellung ist abgelaufen',
        })
      }

      // PIN-Prüfung (nur bei pin-Methode)
      if (method === 'pin') {
        const rateLimitKey = `${user.id}:${orderId}`
        const attempts = pinAttempts.get(rateLimitKey) ?? 0

        // Rate Limiting: Nach MAX_PIN_ATTEMPTS Fehlversuchen sperren
        if (attempts >= MAX_PIN_ATTEMPTS) {
          throw createError({
            statusCode: 429,
            message: `Zu viele falsche PIN-Versuche. Bitte lade die Seite neu.`,
          })
        }

        if (order.pickup_pin !== pin) {
          // Fehlversuch zählen
          pinAttempts.set(rateLimitKey, attempts + 1)
          throw createError({
            statusCode: 400,
            message: 'Falsche PIN',
          })
        }

        // Erfolg: Rate-Limit-Eintrag löschen
        pinAttempts.delete(rateLimitKey)
      }

      // Status auf picked_up setzen
      await tx
        .update(purchases)
        .set({
          status: 'picked_up',
          pickedUpAt: pickedUpAt,
        })
        .where(eq(purchases.id, orderId))

      return { id: order.id }
    })

    return {
      success: true,
      message: 'Bestellung erfolgreich abgeholt!',
      order: {
        id: result.id,
        status: 'picked_up',
        pickedUpAt: pickedUpAt.toISOString(),
      },
    }
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string }
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || 'Fehler bei der Abholung',
    })
  }
})
