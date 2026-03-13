/**
 * GET /api/leaderboard
 *
 * FEAT-8: Leaderboard — Rangliste der Mitarbeiter
 * FEAT-23: Erweiterung um dritten Tab "Gesamt-Punkte"
 *
 * @description
 * Gibt alle drei Ranglisten in einem Response zurueck:
 * - "Meistgekauft": sortiert nach Kaufanzahl
 * - "Gesundheit": sortiert nach Bonuspunkten
 * - "Gesamt-Punkte": sortiert nach akkumulierten point_transactions
 *
 * Alle werden gleichzeitig berechnet um Tab-Wechsel ohne neuen API-Call
 * zu ermoeglichen.
 *
 * @query period - 'week' | 'month' | 'all' (Standard: 'week')
 *
 * @access Protected (Login erforderlich, Admin wird auf /admin weitergeleitet)
 */

import { db } from '~/server/db'
import { users, purchases, pointTransactions } from '~/server/db/schema'
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

export interface PointsLeaderboardEntry {
  rank: number
  id: number
  name: string
  location: string
  isActive: boolean
  totalPoints: number
}

export interface LeaderboardResponse {
  period: 'week' | 'month' | 'all'
  mostPurchased: LeaderboardEntry[]
  healthiest: LeaderboardEntry[]
  totalPoints: PointsLeaderboardEntry[]
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
    // Zeitraum-Filter als SQL-Fragment fuer purchases
    let purchaseDateFilter: ReturnType<typeof gte> | undefined

    if (period === 'week') {
      purchaseDateFilter = gte(purchases.createdAt, sql`DATE_TRUNC('week', NOW())`)
    } else if (period === 'month') {
      purchaseDateFilter = gte(purchases.createdAt, sql`DATE_TRUNC('month', NOW())`)
    }

    // Zeitraum-Filter als SQL-Fragment fuer point_transactions
    let pointsDateFilter: ReturnType<typeof gte> | undefined

    if (period === 'week') {
      pointsDateFilter = gte(pointTransactions.createdAt, sql`DATE_TRUNC('week', NOW())`)
    } else if (period === 'month') {
      pointsDateFilter = gte(pointTransactions.createdAt, sql`DATE_TRUNC('month', NOW())`)
    }

    // ========================================
    // Query 1: Meistgekauft + Gesundheit (bestehend)
    // ========================================

    const purchaseRows = await db
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
        purchaseDateFilter
          ? and(eq(purchases.userId, users.id), purchaseDateFilter)
          : eq(purchases.userId, users.id),
      )
      .where(eq(users.role, 'mitarbeiter'))
      .groupBy(users.id, users.name, users.location, users.isActive)

    // ========================================
    // Query 2: Gesamt-Punkte (FEAT-23)
    // ========================================

    const pointRows = await db
      .select({
        id: users.id,
        name: users.name,
        location: users.location,
        isActive: users.isActive,
        totalPoints: sql<number>`CAST(COALESCE(SUM(${pointTransactions.totalPoints}), 0) AS INTEGER)`,
      })
      .from(users)
      .leftJoin(
        pointTransactions,
        pointsDateFilter
          ? and(eq(pointTransactions.userId, users.id), pointsDateFilter)
          : eq(pointTransactions.userId, users.id),
      )
      .where(eq(users.role, 'mitarbeiter'))
      .groupBy(users.id, users.name, users.location, users.isActive)

    // ========================================
    // Sortierung und Rang-Vergabe
    // ========================================

    // Meistgekauft: nach Kaufanzahl absteigend, Tiebreaker: alphabetisch
    const mostPurchased = [...purchaseRows]
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

    // Gesundheit: nach Bonuspunkten absteigend, Tiebreaker: alphabetisch
    const healthiest = [...purchaseRows]
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

    // Gesamt-Punkte: nach totalPoints absteigend, Tiebreaker: alphabetisch (EC-7)
    const totalPointsList = [...pointRows]
      .sort((a, b) => b.totalPoints - a.totalPoints || (a.name ?? '').localeCompare(b.name ?? ''))
      .map((row, idx) => ({
        rank: idx + 1,
        id: row.id,
        name: row.name ?? '',
        location: row.location ?? '',
        isActive: row.isActive ?? true,
        totalPoints: row.totalPoints,
      }))

    return { period, mostPurchased, healthiest, totalPoints: totalPointsList }
  } catch (error: unknown) {
    console.error('[leaderboard] DB-Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Rangliste',
    })
  }
})
