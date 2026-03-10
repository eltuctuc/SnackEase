<script setup lang="ts">
/**
 * Profil-Seite (/profile) — FEAT-20
 *
 * Zeigt persoenliche Uebersicht des eingeloggten Mitarbeiters:
 * - Profil-Header mit Name, Standort, Guthaben
 * - Bonuspunkte-Chart (eigener Woche/Monat/Jahr-Umschalter)
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

  // Profil-Daten laden
  await loadProfile()
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
