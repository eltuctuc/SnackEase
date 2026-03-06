/**
 * GET /api/leaderboard
 *
 * FEAT-8: Leaderboard — Rangliste der Mitarbeiter
 *
 * @description
 * Gibt beide Ranglisten in einem Response zurück:
 * - "Meistgekauft": sortiert nach Kaufanzahl
 * - "Gesündeste": sortiert nach Bonuspunkten
 *
 * Beide werden gleichzeitig berechnet um Tab-Wechsel ohne neuen API-Call
 * zu ermöglichen (AC-7).
 *
 * @query period - 'week' | 'month' | 'all' (Standard: 'week')
 *
 * @access Protected (Login erforderlich, Admin wird auf /admin weitergeleitet)
 */

import { db } from '~/server/db'
import { users, purchases } from '~/server/db/schema'
import { eq, sql, and, gte } from 'drizzle-orm'
import { getCurrentUser } from '~/server/utils/auth'

export interface LeaderboardEntry {
  rank: number
  id: number
  name: string
  location: string
  isActive: boolean
  totalPurchases: number
  healthPoints: number
}

export interface LeaderboardResponse {
  period: 'week' | 'month' | 'all'
  mostPurchased: LeaderboardEntry[]
  healthiest: LeaderboardEntry[]
}

export default defineEventHandler(async (event): Promise<LeaderboardResponse> => {
  // Auth-Check
  const currentUser = await getCurrentUser(event)

  if (currentUser.role === 'admin') {
    throw createError({ statusCode: 403, message: 'Admin hat keinen Zugriff auf das Leaderboard' })
  }

  const query = getQuery(event)
  const rawPeriod = query.period as string | undefined
  const period: 'week' | 'month' | 'all' =
    rawPeriod === 'month' ? 'month' : rawPeriod === 'all' ? 'all' : 'week'

  try {
    // Zeitraum-Filter als SQL-Fragment
    let dateFilter: ReturnType<typeof gte> | undefined

    if (period === 'week') {
      dateFilter = gte(purchases.createdAt, sql`DATE_TRUNC('week', NOW())`)
    } else if (period === 'month') {
      dateFilter = gte(purchases.createdAt, sql`DATE_TRUNC('month', NOW())`)
    }

    // Alle Mitarbeiter mit ihren Kaufdaten laden
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        location: users.location,
        isActive: users.isActive,
        totalPurchases: sql<number>`CAST(COUNT(${purchases.id}) AS INTEGER)`,
        healthPoints: sql<number>`CAST(COALESCE(SUM(${purchases.bonusPoints}), 0) AS INTEGER)`,
      })
      .from(users)
      .leftJoin(
        purchases,
        dateFilter
          ? and(eq(purchases.userId, users.id), dateFilter)
          : eq(purchases.userId, users.id),
      )
      .where(eq(users.role, 'mitarbeiter'))
      .groupBy(users.id, users.name, users.location, users.isActive)

    // Meistgekauft: nach Kaufanzahl absteigend, Tiebreaker: alphabetisch
    const mostPurchased = [...rows]
      .sort((a, b) => b.totalPurchases - a.totalPurchases || (a.name ?? '').localeCompare(b.name ?? ''))
      .map((row, idx) => ({
        rank: idx + 1,
        id: row.id,
        name: row.name ?? '',
        location: row.location ?? '',
        isActive: row.isActive ?? true,
        totalPurchases: row.totalPurchases,
        healthPoints: row.healthPoints,
      }))

    // Gesündeste: nach Bonuspunkten absteigend, Tiebreaker: alphabetisch
    const healthiest = [...rows]
      .sort((a, b) => b.healthPoints - a.healthPoints || (a.name ?? '').localeCompare(b.name ?? ''))
      .map((row, idx) => ({
        rank: idx + 1,
        id: row.id,
        name: row.name ?? '',
        location: row.location ?? '',
        isActive: row.isActive ?? true,
        totalPurchases: row.totalPurchases,
        healthPoints: row.healthPoints,
      }))

    return { period, mostPurchased, healthiest }
  } catch (error: unknown) {
    console.error('[leaderboard] DB-Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Rangliste',
    })
  }
})
