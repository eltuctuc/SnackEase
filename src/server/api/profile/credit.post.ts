/**
 * POST /api/profile/credit
 *
 * Laedt Guthaben fuer den eingeloggten Mitarbeiter auf.
 * Akzeptiert einen beliebigen Centbetrag (integer >= 1).
 *
 * FEAT-24: Neue Route fuer freie Numpad-Eingabe.
 * Bestehende /api/credits/recharge akzeptiert nur feste Betraege (10/25/50 EUR)
 * und wird hier nicht wiederverwendet.
 *
 * @requestBody
 * { "amountCents": 1000 }  // 1000 Cent = 10,00 EUR
 *
 * @response
 * { "success": true, "newBalance": "15.00" }
 *
 * @throws 400 — amountCents fehlt oder <= 0
 * @throws 401 — User nicht eingeloggt
 * @throws 403 — Admin kann kein Guthaben aufladen
 * @throws 500 — DB-Fehler
 */

import { db } from '~/server/db'
import { userCredits, creditTransactions } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // SCHRITT 1: Request-Body lesen
  // ----------------------------------------

  const body = await readBody(event)
  const { amountCents } = body

  // ----------------------------------------
  // SCHRITT 2: Betrag validieren
  // ----------------------------------------

  if (!amountCents || typeof amountCents !== 'number' || !Number.isInteger(amountCents) || amountCents <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Ungültiger Betrag. amountCents muss eine positive ganze Zahl sein.',
    })
  }

  try {
    // ----------------------------------------
    // SCHRITT 3: User authentifizieren
    // ----------------------------------------

    const user = await getCurrentUser(event)

    // Admin-Guard: Admins koennen kein Guthaben aufladen
    if (user.role === 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Admin hat kein Guthaben',
      })
    }

    // Centbetrag in Euro umrechnen (2 Dezimalstellen)
    const amountEuro = amountCents / 100

    // ----------------------------------------
    // SCHRITT 4: Aktuelles Guthaben abrufen
    // ----------------------------------------

    const creditsResults = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, user.id))
      .limit(1)

    let currentBalance = 0

    if (creditsResults[0]) {
      currentBalance = parseFloat(creditsResults[0].balance.toString()) || 0
    }

    // ----------------------------------------
    // SCHRITT 5: Neues Guthaben berechnen
    // ----------------------------------------

    const newBalance = currentBalance + amountEuro

    // ----------------------------------------
    // SCHRITT 6: Guthaben in DB aktualisieren
    // ----------------------------------------

    if (creditsResults[0]) {
      await db
        .update(userCredits)
        .set({
          balance: newBalance.toFixed(2),
          lastRechargedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, user.id))
    } else {
      await db.insert(userCredits).values({
        userId: user.id,
        balance: newBalance.toFixed(2),
        lastRechargedAt: new Date(),
      })
    }

    // ----------------------------------------
    // SCHRITT 7: Transaction-Log erstellen
    // ----------------------------------------

    const amountFormatted = amountEuro.toFixed(2)

    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: amountFormatted,
      type: 'recharge',
      description: `Guthaben aufgeladen: ${amountFormatted} EUR`,
    })

    // ----------------------------------------
    // SCHRITT 8: Success-Response
    // ----------------------------------------

    return {
      success: true,
      newBalance: newBalance.toFixed(2),
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Aufladen des Guthabens',
    })
  }
})
