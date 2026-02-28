import { db } from '~/server/db'
import { userCredits, creditTransactions, users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

const MONTHLY_AMOUNT = 25

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'auth_token')
  
  if (!authCookie) {
    throw createError({
      statusCode: 401,
      message: 'Nicht eingeloggt',
    })
  }

  try {
    const userId = authCookie.replace('user_', '')
    const userIdNum = parseInt(userId, 10)
    
    if (isNaN(userIdNum)) {
      throw createError({
        statusCode: 401,
        message: 'Ungültiges Token',
      })
    }

    const userResults = await db.select().from(users).where(eq(users.id, userIdNum)).limit(1)

    if (!userResults[0]) {
      throw createError({
        statusCode: 401,
        message: 'User nicht gefunden',
      })
    }

    const user = userResults[0]

    const creditsResults = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1)
    
    let currentBalance = 0
    
    if (creditsResults[0]) {
      currentBalance = parseFloat(creditsResults[0].balance.toString()) || 0
    }

    const newBalance = currentBalance + MONTHLY_AMOUNT

    if (creditsResults[0]) {
      await db.update(userCredits)
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

    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: MONTHLY_AMOUNT.toFixed(2),
      type: 'recharge',
      description: `Monatspauschale: ${MONTHLY_AMOUNT}€`,
    })

    return {
      success: true,
      newBalance: newBalance.toFixed(2),
      message: `Monatspauschale von ${MONTHLY_AMOUNT}€ gutgeschrieben`,
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler bei der Monatspauschale',
    })
  }
})
