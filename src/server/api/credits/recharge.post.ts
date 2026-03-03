import { db } from '~/server/db'
import { userCredits, creditTransactions } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

const ALLOWED_AMOUNTS = ['10', '25', '50']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { amount } = body

  if (!amount || !ALLOWED_AMOUNTS.includes(amount.toString())) {
    throw createError({
      statusCode: 400,
      message: 'Ungültiger Betrag. Erlaubt: 10, 25, 50',
    })
  }

  try {
    const user = await getCurrentUser(event)
    const amountNum = parseFloat(amount)

    // TODO: Transactions würden Race Conditions verhindern, aber neon-http unterstützt sie nicht
    // Für Production: Auf neon-serverless (WebSockets) wechseln
    const creditsResults = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1)
    
    let currentBalance = 0
    
    if (creditsResults[0]) {
      currentBalance = parseFloat(creditsResults[0].balance.toString()) || 0
    }

    const newBalance = currentBalance + amountNum

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
      amount: amountNum.toFixed(2),
      type: 'recharge',
      description: `Guthaben aufgeladen: ${amount}€`,
    })

    return {
      success: true,
      newBalance: newBalance.toFixed(2),
      message: `Guthaben um ${amount}€ erhöht`,
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Aufladen des Guthabens',
    })
  }
})
