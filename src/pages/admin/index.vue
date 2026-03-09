<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  todayTransactions: number
  totalCredits: number
  totalPurchases: number
  todayPurchases: number
  totalLogins: number
  todayLogins: number
  failedLogins: number
}

const stats = ref<AdminStats>({
  totalUsers: 0,
  activeUsers: 0,
  totalTransactions: 0,
  todayTransactions: 0,
  totalCredits: 0,
  totalPurchases: 0,
  todayPurchases: 0,
  totalLogins: 0,
  todayLogins: 0,
  failedLogins: 0,
})
const isLoading = ref(true)
const error = ref<string | null>(null)
const pageReady = ref(false)

const fetchStats = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await $fetch('/api/admin/stats')
    stats.value = data as AdminStats
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Laden der Statistiken'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await authStore.initFromCookie()

  if (!authStore.user) {
    router.push('/login')
    return
  }

  if (authStore.user.role !== 'admin') {
    router.push('/dashboard')
    return
  }

  await fetchStats()
  pageReady.value = true
})
</script>

<template>
  <div>
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground">Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">Systemübersicht</p>
      </div>

      <!-- Skeleton -->
      <template v-if="!pageReady">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
          <div v-for="i in 8" :key="i" class="bg-card rounded-lg p-5 border">
            <div class="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div class="h-7 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </template>

      <!-- Statistiken -->
      <template v-else>
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <!-- Nutzer-Stats -->
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Nutzer</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Gesamt-Nutzer</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalUsers }}</p>
          </div>
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Mitarbeiter</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.activeUsers }}</p>
          </div>
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Logins heute</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.todayLogins }}</p>
          </div>
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Fehlgeschlagene Logins</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.failedLogins }}</p>
          </div>
        </div>

        <!-- Bestell-Stats -->
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Bestellungen & Transaktionen</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Bestellungen gesamt</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalPurchases }}</p>
          </div>
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Bestellungen heute</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.todayPurchases }}</p>
          </div>
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Transaktionen gesamt</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalTransactions }}</p>
          </div>
          <div class="bg-card rounded-lg p-5 border">
            <p class="text-xs text-muted-foreground mb-1">Gesamt-Guthaben</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalCredits.toFixed(2) }} EUR</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
