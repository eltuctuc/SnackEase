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

const showResetModal = ref(false)
const showCreditsResetModal = ref(false)
const resetConfirmation = ref('')
const isResetting = ref(false)
const resetSuccess = ref(false)
const resetError = ref<string | null>(null)

const canReset = computed(() => resetConfirmation.value === 'RESET')

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

const handleReset = async () => {
  if (!canReset.value || isResetting.value) return

  isResetting.value = true
  resetError.value = null

  try {
    await $fetch('/api/admin/reset', { method: 'POST' })
    resetSuccess.value = true
    showResetModal.value = false
    resetConfirmation.value = ''
    await fetchStats()
  } catch (e: unknown) {
    resetError.value = (e as { message?: string }).message || 'Fehler beim Reset'
  } finally {
    isResetting.value = false
  }
}

const handleCreditsReset = async () => {
  if (isResetting.value) return

  isResetting.value = true
  resetError.value = null

  try {
    await $fetch('/api/admin/credits/reset', { method: 'POST' })
    resetSuccess.value = true
    showCreditsResetModal.value = false
    await fetchStats()
  } catch (e: unknown) {
    resetError.value = (e as { message?: string }).message || 'Fehler beim Guthaben-Reset'
  } finally {
    isResetting.value = false
  }
}

const closeResetModal = () => {
  showResetModal.value = false
  resetConfirmation.value = ''
  resetError.value = null
}

const closeCreditsResetModal = () => {
  showCreditsResetModal.value = false
  resetError.value = null
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
        <p class="text-sm text-muted-foreground mt-1">Systemübersicht und Reset-Funktionen</p>
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

        <div v-if="resetSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Reset erfolgreich durchgefuehrt.
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

        <!-- Reset-Aktionen -->
        <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">System-Aktionen</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-card rounded-lg p-6 border">
            <h3 class="text-base font-bold text-foreground mb-2">System-Reset</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Loescht alle Bestellungen und Transaktionen und setzt das Guthaben aller Nutzer auf 25 EUR zurueck.
              <strong class="text-red-600">Nicht rueckgaengig machbar!</strong>
            </p>
            <button
              @click="showResetModal = true"
              class="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
            >
              System-Reset durchfuehren
            </button>
          </div>

          <div class="bg-card rounded-lg p-6 border">
            <h3 class="text-base font-bold text-foreground mb-2">Guthaben-Reset</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Setzt das Guthaben aller Nutzer auf 25 EUR zurueck, ohne die Transaktionshistorie zu loeschen.
            </p>
            <button
              @click="showCreditsResetModal = true"
              class="w-full py-2.5 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm"
            >
              Guthaben-Reset durchfuehren
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- System-Reset Modal -->
    <Teleport to="body">
      <div
        v-if="showResetModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeResetModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 id="reset-modal-title" class="text-xl font-bold text-red-600">System-Reset</h2>
            <button @click="closeResetModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">
              ✕
            </button>
          </div>

          <p class="text-sm text-muted-foreground mb-4">
            Diese Aktion loescht alle Bestellungen und Transaktionen und setzt das Guthaben aller Nutzer auf 25 EUR zurueck.
          </p>

          <label for="reset-confirm" class="block text-sm font-medium mb-2">
            Geben Sie <code class="bg-gray-100 px-1 rounded">RESET</code> ein um zu bestaetigen:
          </label>
          <input
            id="reset-confirm"
            v-model="resetConfirmation"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            placeholder="RESET"
          />

          <div v-if="resetError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ resetError }}
          </div>

          <button
            @click="handleReset"
            :disabled="!canReset || isResetting"
            class="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isResetting ? 'Wird ausgefuehrt...' : 'Reset bestaetigen' }}
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Guthaben-Reset Modal -->
    <Teleport to="body">
      <div
        v-if="showCreditsResetModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeCreditsResetModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-reset-modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 id="credits-reset-modal-title" class="text-xl font-bold text-yellow-600">Guthaben-Reset</h2>
            <button @click="closeCreditsResetModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">
              ✕
            </button>
          </div>

          <p class="text-sm text-muted-foreground mb-4">
            Diese Aktion setzt das Guthaben aller Nutzer auf 25 EUR zurueck, ohne die Transaktionshistorie zu loeschen.
          </p>
          <p class="text-sm font-medium mb-6">Moechten Sie fortfahren?</p>

          <div v-if="resetError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ resetError }}
          </div>

          <div class="flex gap-3">
            <button
              @click="closeCreditsResetModal"
              class="flex-1 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Abbrechen
            </button>
            <button
              @click="handleCreditsReset"
              :disabled="isResetting"
              class="flex-1 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isResetting ? 'Wird ausgefuehrt...' : 'Reset durchfuehren' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
