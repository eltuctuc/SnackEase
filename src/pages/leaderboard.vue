<!--
  /leaderboard — Mitarbeiter-Rangliste
  FEAT-8: Leaderboard mit zwei Tabs (Meistgekauft / Gesündeste) und Zeitraum-Filter
  FEAT-23: Dritter Tab "Gesamt-Punkte" zwischen den bestehenden Tabs eingefuegt
-->

<script setup lang="ts">
import { computed, ref as vRef } from 'vue'
import { useLeaderboard } from '~/composables/useLeaderboard'
import type { ActiveTab, LeaderboardEntry, PointsLeaderboardEntry } from '~/composables/useLeaderboard'
import LeaderboardList from '~/components/leaderboard/LeaderboardList.vue'
import PointsLeaderboardEntry from '~/components/leaderboard/PointsLeaderboardEntry.vue'
import LeaderboardSkeleton from '~/components/leaderboard/LeaderboardSkeleton.vue'

// ========================================
// AUTH
// ========================================

const authStore = useAuthStore()

// ========================================
// LEADERBOARD STATE
// ========================================

const currentUserId = computed(() => authStore.user?.id)

const {
  period,
  activeTab,
  isLoading,
  error,
  currentList,
  ownEntry,
  isEmpty,
  fetchLeaderboard,
  setPeriod,
  setTab,
} = useLeaderboard(currentUserId)

// Auth initialisieren, dann Daten laden
onMounted(async () => {
  if (!authStore.user) {
    await authStore.initFromCookie()
  }
  await fetchLeaderboard()
})

// ========================================
// TYPE GUARDS
// ========================================

function isPointsEntry(entry: LeaderboardEntry | PointsLeaderboardEntry): entry is PointsLeaderboardEntry {
  return 'totalPoints' in entry
}

function isPointsList(list: LeaderboardEntry[] | PointsLeaderboardEntry[]): list is PointsLeaderboardEntry[] {
  return activeTab.value === 'totalPoints'
}

function isLeaderboardEntry(entry: LeaderboardEntry | PointsLeaderboardEntry): entry is LeaderboardEntry {
  return 'totalPurchases' in entry
}

// ========================================
// PERIOD LABELS
// ========================================

const periodLabels = [
  { key: 'week' as const, label: 'Woche' },
  { key: 'month' as const, label: 'Monat' },
  { key: 'all' as const, label: 'Allzeit' },
]

// ========================================
// TASTATUR-NAVIGATION
// ========================================

const tabOrder: ActiveTab[] = ['mostPurchased', 'totalPoints', 'healthiest']
const tabRefs = vRef<HTMLButtonElement[]>([])

function handleTabKeydown(event: KeyboardEvent) {
  const currentIndex = tabOrder.indexOf(activeTab.value)
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    const nextIndex = (currentIndex + 1) % tabOrder.length
    setTab(tabOrder[nextIndex])
    nextTick(() => tabRefs.value[nextIndex]?.focus())
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const prevIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length
    setTab(tabOrder[prevIndex])
    nextTick(() => tabRefs.value[prevIndex]?.focus())
  }
}

// ========================================
// PERIOD RADIOGROUP TASTATUR-NAVIGATION
// ========================================

const periodOrder = periodLabels.map(p => p.key)
const periodRefs = vRef<HTMLButtonElement[]>([])

function handlePeriodKeydown(event: KeyboardEvent) {
  const currentIndex = periodOrder.indexOf(period.value)
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    const nextIndex = (currentIndex + 1) % periodOrder.length
    setPeriod(periodOrder[nextIndex])
    nextTick(() => periodRefs.value[nextIndex]?.focus())
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    const prevIndex = (currentIndex - 1 + periodOrder.length) % periodOrder.length
    setPeriod(periodOrder[prevIndex])
    nextTick(() => periodRefs.value[prevIndex]?.focus())
  }
}

// ========================================
// OWN ENTRY BANNER TEXT
// ========================================

function getOwnEntryValueText(): string {
  if (!ownEntry.value) return ''
  if (isPointsEntry(ownEntry.value)) {
    return `${ownEntry.value.totalPoints} Punkte`
  }
  if (isLeaderboardEntry(ownEntry.value)) {
    return activeTab.value === 'mostPurchased'
      ? `${ownEntry.value.totalPurchases} Käufe`
      : `${ownEntry.value.healthPoints} Punkte`
  }
  return ''
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20 md:pb-0 md:pl-56 pt-14 md:pt-0">
    <UserHeader />

    <div class="max-w-xl mx-auto px-4 py-6">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-xl font-bold text-primary">Bestenliste</h1>
      </div>

      <!-- Tabs (REQ-1) — drei Tabs: Meistgekauft / Gesamt-Punkte / Gesündeste -->
      <div
        role="tablist"
        aria-label="Ranglisten-Kategorien"
        class="flex border-b border-gray-200 mb-4"
        @keydown="handleTabKeydown"
      >
        <button
          :ref="el => el && (tabRefs[0] = el as HTMLButtonElement)"
          role="tab"
          :aria-selected="activeTab === 'mostPurchased'"
          :tabindex="activeTab === 'mostPurchased' ? 0 : -1"
          class="flex-1 py-2.5 text-sm font-medium text-center focus:ring-2 focus:ring-primary min-h-[44px] transition-colors motion-safe:transition-colors"
          :class="[
            activeTab === 'mostPurchased'
              ? 'text-primary border-b-2 border-primary font-semibold'
              : 'text-gray-500 hover:text-primary border-b-2 border-transparent'
          ]"
          @click="setTab('mostPurchased')"
        >
          Meistgekauft
        </button>
        <button
          :ref="el => el && (tabRefs[1] = el as HTMLButtonElement)"
          role="tab"
          :aria-selected="activeTab === 'totalPoints'"
          :tabindex="activeTab === 'totalPoints' ? 0 : -1"
          class="flex-1 py-2.5 text-sm font-medium text-center focus:ring-2 focus:ring-primary min-h-[44px] transition-colors motion-safe:transition-colors"
          :class="[
            activeTab === 'totalPoints'
              ? 'text-primary border-b-2 border-primary font-semibold'
              : 'text-gray-500 hover:text-primary border-b-2 border-transparent'
          ]"
          @click="setTab('totalPoints')"
        >
          Gesamt-Punkte
        </button>
        <button
          :ref="el => el && (tabRefs[2] = el as HTMLButtonElement)"
          role="tab"
          :aria-selected="activeTab === 'healthiest'"
          :tabindex="activeTab === 'healthiest' ? 0 : -1"
          class="flex-1 py-2.5 text-sm font-medium text-center focus:ring-2 focus:ring-primary min-h-[44px] transition-colors motion-safe:transition-colors"
          :class="[
            activeTab === 'healthiest'
              ? 'text-primary border-b-2 border-primary font-semibold'
              : 'text-gray-500 hover:text-primary border-b-2 border-transparent'
          ]"
          @click="setTab('healthiest')"
        >
          Gesündeste
        </button>
      </div>

      <!-- Punkte-System-Hinweis (nur bei Gesündeste-Tab) -->
      <div
        v-if="activeTab === 'healthiest'"
        class="text-xs text-gray-500 text-center mb-3 bg-gray-50 rounded-lg px-3 py-2"
      >
        Punkte: Obst +3 &nbsp;|&nbsp; Nüsse/Protein +2 &nbsp;|&nbsp; Snacks/Getränke +1
      </div>

      <!-- Gesamt-Punkte-Hinweis (nur bei totalPoints-Tab) -->
      <div
        v-if="activeTab === 'totalPoints'"
        class="text-xs text-gray-500 text-center mb-3 bg-blue-50 rounded-lg px-3 py-2"
      >
        Punkte: Abholung +10 &nbsp;|&nbsp; Vegan +3 &nbsp;|&nbsp; Protein +2 &nbsp;|&nbsp; Angebot +2 &nbsp;|&nbsp; Schnell &lt;30 min +5
      </div>

      <!-- Zeitraum-Filter -->
      <div
        role="radiogroup"
        aria-label="Zeitraum auswählen"
        class="flex gap-2 mb-4"
        @keydown="handlePeriodKeydown"
      >
        <button
          v-for="(p, index) in periodLabels"
          :key="p.key"
          :ref="el => el && (periodRefs[index] = el as HTMLButtonElement)"
          role="radio"
          :aria-checked="period === p.key"
          :tabindex="period === p.key ? 0 : -1"
          class="flex-1 py-2 text-sm font-medium rounded-lg border min-h-[44px] focus:ring-2 focus:ring-primary transition-colors motion-safe:transition-colors"
          :class="[
            period === p.key
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
          ]"
          @click="setPeriod(p.key)"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- Eigener-Rang-Banner -->
      <div
        v-if="ownEntry && !isLoading && !error"
        class="mb-4 px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-sm flex items-center justify-between"
      >
        <span class="text-blue-700 font-medium">Dein Rang: Platz {{ ownEntry.rank }}</span>
        <span class="text-blue-700 text-xs">
          {{ ownEntry.location }} ·
          {{ getOwnEntryValueText() }}
        </span>
      </div>
      <div
        v-else-if="!ownEntry && !isLoading && !error"
        class="mb-4 px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm flex items-center"
      >
        <span class="text-gray-500">Dein Rang: Noch nicht auf der Rangliste</span>
      </div>

      <!-- Ranglisten-Bereich: Gesamt-Punkte-Tab -->
      <template v-if="activeTab === 'totalPoints'">
        <!-- Loading -->
        <LeaderboardSkeleton v-if="isLoading" />

        <!-- Fehler -->
        <div
          v-else-if="error"
          class="flex flex-col items-center gap-4 py-12 px-4 text-center"
          role="alert"
        >
          <p class="text-gray-600 text-sm font-medium">{{ error }}</p>
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary transition-colors motion-safe:transition-colors"
            @click="fetchLeaderboard"
          >
            Erneut versuchen
          </button>
        </div>

        <!-- Leere Liste -->
        <div
          v-else-if="isEmpty"
          class="flex flex-col items-center gap-3 py-12 px-4 text-center"
        >
          <p class="text-gray-500 text-sm font-medium">Noch keine Punkte in diesem Zeitraum.</p>
          <p class="text-gray-500 text-xs">Hole eine Bestellung ab und sammle Punkte!</p>
        </div>

        <!-- Punkte-Rangliste -->
        <ol v-else class="space-y-2" aria-label="Punkte-Rangliste">
          <PointsLeaderboardEntry
            v-for="entry in (isPointsList(currentList) ? currentList : [])"
            :key="entry.id"
            :entry="entry"
            :is-own="entry.id === authStore.user?.id"
          />
        </ol>
      </template>

      <!-- Ranglisten-Bereich: Meistgekauft + Gesündeste -->
      <LeaderboardList
        v-else
        :entries="(currentList as LeaderboardEntry[])"
        :is-loading="isLoading"
        :error="error"
        :is-empty="isEmpty"
        :current-user-id="authStore.user?.id"
        :value-type="activeTab === 'mostPurchased' ? 'mostPurchased' : 'healthiest'"
        @retry="fetchLeaderboard"
      />

      <!-- Refresh-Button -->
      <div class="mt-6">
        <button
          class="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:text-primary hover:border-primary focus:ring-2 focus:ring-primary transition-colors motion-safe:transition-colors disabled:opacity-50"
          :disabled="isLoading"
          @click="fetchLeaderboard"
        >
          <svg
            aria-hidden="true"
            class="w-4 h-4"
            :class="{ 'animate-spin': isLoading }"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Aktualisieren
        </button>
      </div>

    </div>
  </div>
</template>
