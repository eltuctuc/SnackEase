/**
 * POST /api/credits/recharge
 * 
 * Lädt Guthaben für eingeloggten User auf
 * 
 * @description
 * Dieser Endpunkt:
 * - Prüft ob User eingeloggt ist (Session-Cookie)
 * - Validiert Auflade-Betrag (nur 10, 25, 50 Euro erlaubt)
 * - Erhöht Guthaben in user_credits Tabelle
 * - Erstellt Transaction-Log in credit_transactions
 * - Gibt neuen Guthabenstand zurück
 * 
 * @route POST /api/credits/recharge
 * @access Protected (Login erforderlich)
 * 
 * @requestBody
 * ```json
 * {
 *   "amount": "25"
 * }
 * ```
 * 
 * @response Success
 * ```json
 * {
 *   "success": true,
 *   "newBalance": "50.00",
 *   "message": "Guthaben um 25€ erhöht"
 * }
 * ```
 * 
 * @throws {400} - Ungültiger Betrag (nicht in ALLOWED_AMOUNTS)
 * @throws {401} - User nicht eingeloggt
 * @throws {500} - DB-Fehler
 * 
 * @see src/constants/credits.ts → RECHARGE_AMOUNTS für erlaubte Beträge
 */

import { db } from '~/server/db'
import { userCredits, creditTransactions } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'
import { RECHARGE_AMOUNTS } from '~/constants/credits'

// ========================================
// VALIDATION - Erlaubte Beträge
// ========================================

/**
 * Erlaubte Auflade-Beträge in Euro (als String-Array)
 * 
 * @description
 * BUSINESS-REGEL: Nur fest definierte Beträge erlaubt
 * 
 * Warum?
 * - Verhindert Missbrauch (z.B. 0.01€ oder 999999€)
 * - Vereinfacht Buchhaltung / Reporting
 * - Klare Preis-Stufen für User (bessere UX)
 * 
 * Beträge:
 * - 10€: Kleiner Betrag für gelegentliche Nutzer
 * - 25€: Standard-Betrag (entspricht Monatspauschale)
 * - 50€: Großer Betrag für Vielnutzer
 * 
 * @see src/constants/credits.ts → RECHARGE_AMOUNTS
 */
const ALLOWED_AMOUNTS = Object.values(RECHARGE_AMOUNTS)

// ========================================
// MAIN HANDLER
// ========================================

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // SCHRITT 1: Request-Body lesen
  // ----------------------------------------
  
  const body = await readBody(event)
  const { amount } = body

  // ----------------------------------------
  // SCHRITT 2: Betrag validieren
  // ----------------------------------------
  
  /**
   * Validierung: Nur erlaubte Beträge akzeptieren
   * 
   * WICHTIG: toString() für Type-Safety (Frontend könnte Number senden)
   * Wirft 400 Bad Request bei ungültigem Betrag.
   */
  if (!amount || !ALLOWED_AMOUNTS.includes(amount.toString())) {
    throw createError({
      statusCode: 400,
      message: `Ungültiger Betrag. Erlaubt: ${ALLOWED_AMOUNTS.join(', ')} Euro`,
    })
  }

  try {
    // ----------------------------------------
    // SCHRITT 3: User authentifizieren
    // ----------------------------------------
    
    /**
     * Holt eingeloggten User aus Session-Cookie
     * 
     * Wirft 401 Unauthorized wenn:
     * - Kein Auth-Cookie vorhanden
     * - User-ID ungültig
     * - User nicht in DB gefunden
     * - Account deaktiviert (isActive = false)
     * 
     * @see src/server/utils/auth.ts → getCurrentUser()
     */
    const user = await getCurrentUser(event)

    // Admin-Guard: Admins koennen kein Guthaben aufladen
    if (user.role === 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Admin hat kein Guthaben',
      })
    }

    const amountNum = parseFloat(amount)

    // ----------------------------------------
    // SCHRITT 4: Aktuelles Guthaben abrufen
    // ----------------------------------------
    
    /**
     * WICHTIG - Race Condition Problem:
     * 
     * Ohne DB-Transactions können Race Conditions auftreten:
     * - User klickt zweimal schnell auf "Aufladen"
     * - Beide Requests lesen gleichzeitig Balance = 10€
     * - Beide addieren +25€
     * - Beide schreiben 35€ (statt korrekter 60€)
     * 
     * TODO - Production-Ready-Lösung:
     * 1. Option: Neon Serverless Driver mit Transaction-Support
     *    (neon-http unterstützt keine Transactions)
     * 
     * 2. Option: Optimistic Locking mit Version-Counter
     *    UPDATE user_credits SET balance = ..., version = version + 1
     *    WHERE user_id = ? AND version = ?
     * 
     * 3. Option: Redis-Lock für kritische Section
     * 
     * Aktuell: Race Conditions möglich bei simultanen Requests!
     * Für MVP akzeptabel, für Production MUST-FIX.
     */
    const creditsResults = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1)
    
    let currentBalance = 0
    
    // Guthaben-Eintrag existiert bereits?
    if (creditsResults[0]) {
      // BEACHTE: balance ist Decimal-Type → toString() und parsen
      currentBalance = parseFloat(creditsResults[0].balance.toString()) || 0
    }

    // ----------------------------------------
    // SCHRITT 5: Neues Guthaben berechnen
    // ----------------------------------------
    
    const newBalance = currentBalance + amountNum

    // ----------------------------------------
    // SCHRITT 6: Guthaben in DB aktualisieren
    // ----------------------------------------
    
    /**
     * Update oder Insert je nach Existenz des Eintrags
     * 
     * BEACHTE: 
     * - balance wird als String gespeichert (Decimal-Precision)
     * - toFixed(2) stellt sicher: immer 2 Nachkommastellen
     * - updatedAt wird aktualisiert für Audit-Trail
     */
    if (creditsResults[0]) {
      // Bestehenden Eintrag aktualisieren
      await db.update(userCredits)
        .set({ 
          balance: newBalance.toFixed(2),
          lastRechargedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, user.id))
    } else {
      // Neuen Eintrag erstellen (erster Auflade-Vorgang für User)
      await db.insert(userCredits).values({
        userId: user.id,
        balance: newBalance.toFixed(2),
        lastRechargedAt: new Date(),
      })
    }

    // ----------------------------------------
    // SCHRITT 7: Transaction-Log erstellen
    // ----------------------------------------
    
    /**
     * Erstelle Audit-Log für Buchhaltung / Reporting
     * 
     * Jede Guthaben-Änderung wird protokolliert:
     * - type: 'recharge' (Aufladung durch User)
     * - amount: Betrag (immer positiv)
     * - description: User-freundliche Beschreibung
     * - createdAt: Automatisch durch DB (Timestamp)
     * 
     * Zukünftig könnte hier auch 'purchase' (Kauf) geloggt werden.
     */
    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: amountNum.toFixed(2),
      type: 'recharge',
      description: `Guthaben aufgeladen: ${amount}€`,
    })

    // ----------------------------------------
    // SCHRITT 8: Success-Response
    // ----------------------------------------
    
    return {
      success: true,
      newBalance: newBalance.toFixed(2),
      message: `Guthaben um ${amount}€ erhöht`,
    }
  } catch (error: unknown) {
    // ----------------------------------------
    // ERROR HANDLING
    // ----------------------------------------
    
    /**
     * Fehlerbehandlung mit Type-Safety
     * 
     * Mögliche Fehler:
     * - 401: User nicht eingeloggt (von getCurrentUser())
     * - 500: DB-Fehler (Neon Verbindung, Query-Fehler)
     * 
     * Wirft H3-Error mit passender Status-Code und Message.
     */
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Aufladen des Guthabens',
    })
  }
})
