import { db } from '~/server/db'
import { userCredits, creditTransactions } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

const MONTHLY_AMOUNT = 25

export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event)

    // TODO: Transactions würden Race Conditions verhindern, aber neon-http unterstützt sie nicht
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
