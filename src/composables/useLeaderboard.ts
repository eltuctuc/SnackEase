/**
 * useLeaderboard - Composable für Leaderboard-State und Datenabruf
 *
 * @description
 * Verwaltet:
 * - Zeitraum-Filter (week / month / all)
 * - Aktiven Tab (mostPurchased / healthiest)
 * - API-Call mit $fetch
 * - Loading-, Fehler- und Leer-Zustand
 *
 * Beide Tab-Datensätze werden in einem API-Call geladen.
 * Tab-Wechsel löst keinen neuen API-Call aus (AC-7).
 */

import { ref, computed, type Ref } from 'vue'

export type Period = 'week' | 'month' | 'all'
export type ActiveTab = 'mostPurchased' | 'healthiest'

export interface LeaderboardEntry {
  rank: number
  id: number
  name: string
  location: string
  isActive: boolean
  totalPurchases: number
  healthPoints: number
}

export interface LeaderboardData {
  period: Period
  mostPurchased: LeaderboardEntry[]
  healthiest: LeaderboardEntry[]
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

  /** Aktuelle Liste je nach Tab */
  const currentList = computed<LeaderboardEntry[]>(() => {
    if (!data.value) return []
    return activeTab.value === 'mostPurchased'
      ? data.value.mostPurchased
      : data.value.healthiest
  })

  /** Eigener Rang in der aktuellen Liste */
  const ownEntry = computed<LeaderboardEntry | undefined>(() => {
    if (!currentUserId.value) return undefined
    return currentList.value.find(e => e.id === currentUserId.value)
  })

  /** Leere Liste (keine Käufe im Zeitraum) */
  const isEmpty = computed(() => !isLoading.value && !error.value && currentList.value.length === 0)

  // ========================================
  // ACTIONS
  // ========================================

  /** Lädt Leaderboard-Daten vom Server (neuer API-Call) */
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

  /** Wechselt den Zeitraum und lädt neu */
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
