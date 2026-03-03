import { db } from '~/server/db'
import { userCredits } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event)

    const creditsResults = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1)

    if (!creditsResults[0]) {
      return {
        userId: user.id,
        balance: '0',
        lastRechargedAt: null,
      }
    }

    const credits = creditsResults[0]

    return {
      userId: user.id,
      balance: credits.balance,
      lastRechargedAt: credits.lastRechargedAt?.toISOString() || null,
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Laden des Guthabens',
    })
  }
})
