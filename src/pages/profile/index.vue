<script setup lang="ts">
/**
 * Profil-Seite (/profile) — FEAT-20
 * FEAT-23: Gesamt-Punkte-Anzeige + Transaktionsliste hinzugefuegt
 *
 * Zeigt persoenliche Uebersicht des eingeloggten Mitarbeiters:
 * - Profil-Header mit Name, Standort, Guthaben
 * - Bonuspunkte-Chart (eigener Woche/Monat/Jahr-Umschalter)
 * - Gesamt-Punkte (FEAT-23): prominente Punktzahl + letzte 10 Transaktionen
 * - Globaler Zeitraum-Umschalter (7T / 30T / 90T / Alle)
 * - Einkaufsstatistiken (zeitraeume-unabhaengig + zeitraeume-abhaengig)
 * - Bestellverlauf (nur status = picked_up)
 * - Logout-Button (zweistufig)
 *
 * Auth-Guard: onMounted prueft authStore.user
 * - Nicht eingeloggt → /login
 * - Admin → /admin
 */

// ============================================================
// Typen
// ============================================================

import type { PointsTransaction } from '~/components/profile/PointsTransactionItem.vue'
import PointsTransactionList from '~/components/profile/PointsTransactionList.vue'

type Period = '7d' | '30d' | '90d' | 'all'

interface BonusBucket {
  label: string
  points: number
}

interface OrderItem {
  productName: string
  quantity: number
  price: string
}

interface ProfileOrder {
  id: number
  pickedUpAt: string
  totalAmount: string
  items: OrderItem[]
}

interface ProfileStats {
  user: {
    name: string
    location: string
    balance: string
  }
  stats: {
    totalSpent: string
    orderCount: number
    totalOrderCount: number
    last7DaysCount: number
    lastOrderDate: string | null
    weekSpent: string
    monthSpent: string
    yearSpent: string
    favoriteProduct: { name: string; count: number } | null
    healthScore: number | null
  }
  bonusChart: {
    week: BonusBucket[]
    month: BonusBucket[]
    year: BonusBucket[]
  }
  orders: ProfileOrder[]
}

// ============================================================
// State
// ============================================================

const authStore = useAuthStore()

/** Globaler Zeitraum-Filter (Standard: 30 Tage gemaess REQ-6) */
const period = ref<Period>('30d')

/** API-Daten */
const profileData = ref<ProfileStats | null>(null)

/** Lade-Zustand */
const loading = ref(true)

/** Fehler-Zustand */
const error = ref<string | null>(null)

// ============================================================
// FEAT-23: Punkte-State
// ============================================================

/** Allzeit-Gesamt-Punktzahl */
const totalPoints = ref<number>(0)

/** Letzte 10 Punkte-Transaktionen */
const pointTransactions = ref<PointsTransaction[]>([])

/** Lade-Zustand Punkte */
const pointsLoading = ref(true)

// ============================================================
// Profil-Daten laden
// ============================================================

async function loadProfile() {
  loading.value = true
  error.value = null

  try {
    const data = await $fetch<ProfileStats>(`/api/profile/stats?period=${period.value}`)
    profileData.value = data
  } catch (err: unknown) {
    // EC-9: 401 bei abgelaufener Session → zu Login weiterleiten
    if (
      err &&
      typeof err === 'object' &&
      'statusCode' in err &&
      (err as { statusCode: number }).statusCode === 401
    ) {
      await navigateTo('/login')
      return
    }
    error.value = 'Profil konnte nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

// ============================================================
// FEAT-23: Punkte laden
// ============================================================

async function loadPoints() {
  pointsLoading.value = true
  try {
    const data = await $fetch<{ totalPoints: number; transactions: PointsTransaction[] }>('/api/profile/points')
    totalPoints.value = data.totalPoints
    pointTransactions.value = data.transactions
  } catch {
    // Punkte-Fehler still ignorieren (kein kritischer Fehler)
  } finally {
    pointsLoading.value = false
  }
}

// ============================================================
// Zeitraum-Wechsel
// ============================================================

watch(period, () => {
  loadProfile()
})

// ============================================================
// Auth-Guard und Initialisierung (onMounted Pattern)
// ============================================================

onMounted(async () => {
  // Session aus Cookie initialisieren falls noch nicht geschehen
  if (!authStore.user) {
    await authStore.initFromCookie()
  }

  // Nicht eingeloggt → Login
  if (!authStore.user) {
    await navigateTo('/login')
    return
  }

  // Admin → Admin-Dashboard (AC-19)
  if (authStore.user.role === 'admin') {
    await navigateTo('/admin')
    return
  }

  // Profil-Daten und Punkte parallel laden
  await Promise.all([loadProfile(), loadPoints()])
})

// ============================================================
// Computed: Profil-Header-Daten
// Als erster Schritt aus dem Auth-Store (sofortige Anzeige)
// ============================================================

const headerName = computed(() => profileData.value?.user.name ?? authStore.user?.name ?? '')
const headerLocation = computed(
  () => profileData.value?.user.location ?? authStore.user?.location ?? '',
)
const headerBalance = computed(() => profileData.value?.user.balance ?? '0.00')
</script>

<template>
  <div class="min-h-screen bg-background pb-24">

    <!-- Fehler-Banner -->
    <div
      v-if="error"
      class="mx-4 mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm"
      role="alert"
    >
      {{ error }}
      <button
        class="ml-2 underline font-medium"
        @click="loadProfile"
      >
        Erneut versuchen
      </button>
    </div>

    <!-- Profil-Header (sofort aus Auth-Store, kein Skeleton fuer Name) -->
    <ProfileHeader
      :name="headerName"
      :location="headerLocation"
      :balance="headerBalance"
      :loading="loading && !authStore.user"
    />

    <!-- Bonuspunkte-Chart (eigener Zeitraum-Umschalter) -->
    <ProfileBonusPointsCard
      :week="profileData?.bonusChart.week ?? []"
      :month="profileData?.bonusChart.month ?? []"
      :year="profileData?.bonusChart.year ?? []"
      :loading="loading"
    />

    <!-- FEAT-23: Gesamt-Punkte-Anzeige -->
    <div class="mx-4 mb-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-700">Gesamt-Punkte</h2>
        <!-- Punkte-Icon (Stern) -->
        <svg
          aria-hidden="true"
          class="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <!-- Prominente Punktzahl -->
      <div v-if="!pointsLoading" class="text-3xl font-bold text-primary">
        {{ totalPoints.toLocaleString('de-DE') }}
        <span class="text-sm font-normal text-gray-400 ml-1">Punkte (Allzeit)</span>
      </div>
      <div v-else class="h-9 w-32 bg-gray-100 rounded animate-pulse" />
    </div>

    <!-- FEAT-23: Punkte-Transaktionsliste -->
    <PointsTransactionList
      :transactions="pointTransactions"
      :is-loading="pointsLoading"
    />

    <!-- Globaler Zeitraum-Umschalter -->
    <ProfilePeriodSelector v-model="period" />

    <!-- Einkaufsstatistiken -->
    <ProfileStatsGrid
      :total-order-count="profileData?.stats.totalOrderCount ?? 0"
      :last-7-days-count="profileData?.stats.last7DaysCount ?? 0"
      :last-order-date="profileData?.stats.lastOrderDate ?? null"
      :week-spent="profileData?.stats.weekSpent ?? '0.00'"
      :month-spent="profileData?.stats.monthSpent ?? '0.00'"
      :year-spent="profileData?.stats.yearSpent ?? '0.00'"
      :favorite-product="profileData?.stats.favoriteProduct ?? null"
      :health-score="profileData?.stats.healthScore ?? null"
      :loading="loading"
    />

    <!-- Bestellverlauf -->
    <ProfileOrderHistoryList
      :orders="profileData?.orders ?? []"
      :loading="loading"
    />

    <!-- Logout-Button -->
    <ProfileLogoutButton />
  </div>
</template>
