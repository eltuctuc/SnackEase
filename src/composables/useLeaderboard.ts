/**
 * useLeaderboard - Composable fuer Leaderboard-State und Datenabruf
 *
 * @description
 * Verwaltet:
 * - Zeitraum-Filter (week / month / all)
 * - Aktiven Tab (mostPurchased / totalPoints / healthiest)
 * - API-Call mit $fetch
 * - Loading-, Fehler- und Leer-Zustand
 *
 * Alle drei Tab-Datensaetze werden in einem API-Call geladen.
 * Tab-Wechsel loest keinen neuen API-Call aus.
 *
 * FEAT-23: Dritter Tab "Gesamt-Punkte" (totalPoints) hinzugefuegt.
 */

import { ref, computed, type Ref } from 'vue'

export type Period = 'week' | 'month' | 'all'
export type ActiveTab = 'mostPurchased' | 'totalPoints' | 'healthiest'

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

export interface LeaderboardData {
  period: Period
  mostPurchased: LeaderboardEntry[]
  healthiest: LeaderboardEntry[]
  totalPoints: PointsLeaderboardEntry[]
}

export function useLeaderboard(currentUserId: Ref<number | undefined>) {
  // ========================================
  // STATE
  // ========================================

  const period = ref<Period>('week')
  const activeTab = ref<ActiveTab>('mostPurchased')
  const data = ref<LeaderboardData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ========================================
  // COMPUTED
  // ========================================

  /**
   * Aktuelle Liste je nach Tab.
   * Fuer totalPoints-Tab: PointsLeaderboardEntry[], sonst LeaderboardEntry[].
   * Union-Typ da beide Listen-Typen verwendet werden.
   */
  const currentList = computed<LeaderboardEntry[] | PointsLeaderboardEntry[]>(() => {
    if (!data.value) return []
    if (activeTab.value === 'totalPoints') return data.value.totalPoints
    return activeTab.value === 'mostPurchased'
      ? data.value.mostPurchased
      : data.value.healthiest
  })

  /**
   * Eigener Rang in der aktuellen Liste.
   * Bei totalPoints-Tab: PointsLeaderboardEntry, sonst LeaderboardEntry.
   */
  const ownEntry = computed<LeaderboardEntry | PointsLeaderboardEntry | undefined>(() => {
    if (!currentUserId.value) return undefined
    return (currentList.value as Array<{ id: number }>).find(e => e.id === currentUserId.value) as
      | LeaderboardEntry
      | PointsLeaderboardEntry
      | undefined
  })

  /** Leere Liste (keine Eintraege im Zeitraum) */
  const isEmpty = computed(() => !isLoading.value && !error.value && currentList.value.length === 0)

  // ========================================
  // ACTIONS
  // ========================================

  /** Laedt Leaderboard-Daten vom Server (neuer API-Call) */
  async function fetchLeaderboard() {
    isLoading.value = true
    error.value = null

    try {
      const result = await $fetch<LeaderboardData>(`/api/leaderboard?period=${period.value}`)
      data.value = result
    } catch {
      error.value = 'Rangliste konnte nicht geladen werden.'
    } finally {
      isLoading.value = false
    }
  }

  /** Wechselt den Zeitraum und laedt neu */
  async function setPeriod(newPeriod: Period) {
    if (newPeriod === period.value) return
    period.value = newPeriod
    await fetchLeaderboard()
  }

  /** Wechselt den Tab — kein neuer API-Call */
  function setTab(tab: ActiveTab) {
    activeTab.value = tab
  }

  return {
    // State
    period,
    activeTab,
    isLoading,
    error,
    // Computed
    currentList,
    ownEntry,
    isEmpty,
    // Actions
    fetchLeaderboard,
    setPeriod,
    setTab,
  }
}
