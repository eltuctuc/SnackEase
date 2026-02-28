import { db } from '~/server/db'
import { userCredits, users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

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
