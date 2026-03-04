<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalTransactions: 0,
  todayTransactions: 0,
  totalCredits: 0
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

const isAdmin = computed(() => authStore.user?.role === 'admin')

const canReset = computed(() => resetConfirmation.value === 'RESET')

const fetchStats = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await $fetch('/api/admin/stats')
    stats.value = data as any
  } catch (e: any) {
    error.value = e.message || 'Fehler beim Laden der Statistiken'
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
  } catch (e: any) {
    resetError.value = e.message || 'Fehler beim Reset'
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
  } catch (e: any) {
    resetError.value = e.message || 'Fehler beim Guthaben-Reset'
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
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-primary">Admin-Bereich</h1>
          <p v-if="authStore.user" class="text-sm text-muted-foreground mt-1">
            Angemeldet als {{ authStore.user.name }}
            <span class="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
              Admin
            </span>
          </p>
        </div>
        
        <NuxtLink 
          to="/dashboard"
          class="py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
        >
          Zurück zum Dashboard
        </NuxtLink>
      </div>

      <!-- Skeleton bis Daten geladen sind -->
      <template v-if="!pageReady">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          <div v-for="i in 4" :key="i" class="bg-card rounded-lg p-6 border">
            <div class="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div class="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
        <div class="bg-card rounded-lg p-6 border mb-8 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </template>

      <!-- Echte Statistiken -->
      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-card rounded-lg p-6 border">
            <p class="text-sm text-muted-foreground">Gesamt-Nutzer</p>
            <p class="text-3xl font-bold text-foreground">{{ stats.totalUsers }}</p>
          </div>

          <div class="bg-card rounded-lg p-6 border">
            <p class="text-sm text-muted-foreground">Aktive Nutzer</p>
            <p class="text-3xl font-bold text-foreground">{{ stats.activeUsers }}</p>
          </div>

          <div class="bg-card rounded-lg p-6 border">
            <p class="text-sm text-muted-foreground">Transaktionen heute</p>
            <p class="text-3xl font-bold text-foreground">{{ stats.todayTransactions }}</p>
          </div>

          <div class="bg-card rounded-lg p-6 border">
            <p class="text-sm text-muted-foreground">Gesamt-Guthaben</p>
            <p class="text-3xl font-bold text-foreground">{{ stats.totalCredits.toFixed(2) }} €</p>
          </div>
        </div>

        <div class="bg-card rounded-lg p-6 border mb-8">
          <p class="text-muted-foreground">Gesamt-Transaktionen: {{ stats.totalTransactions }}</p>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-card rounded-lg p-6 border">
          <h2 class="text-xl font-bold text-foreground mb-4">System-Reset</h2>
          <p class="text-sm text-muted-foreground mb-4">
            Setzt alle Transaktionen zurück und setzt das Guthaben aller Nutzer auf 25 € zurück.
            <strong class="text-red-600">Diese Aktion kann nicht rückgängig gemacht werden!</strong>
          </p>
          <button 
            @click="showResetModal = true"
            class="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            System-Reset durchführen
          </button>
        </div>
        
        <div class="bg-card rounded-lg p-6 border">
          <h2 class="text-xl font-bold text-foreground mb-4">Guthaben-Reset</h2>
          <p class="text-sm text-muted-foreground mb-4">
            Setzt das Guthaben aller Nutzer auf 25 € zurück, ohne die Transaktionshistorie zu löschen.
          </p>
          <button 
            @click="showCreditsResetModal = true"
            class="w-full py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
          >
            Guthaben-Reset durchführen
          </button>
        </div>
      </div>

      <div class="mt-8">
        <NuxtLink 
          to="/admin/users"
          class="inline-flex items-center justify-center py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Nutzer-Verwaltung
        </NuxtLink>
      </div>
    </div>

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
            <h2 id="reset-modal-title" class="text-xl font-bold text-red-600">⚠️ System-Reset</h2>
            <button 
              @click="closeResetModal"
              class="text-muted-foreground hover:text-foreground p-1"
              aria-label="Modal schließen"
            >
              ✕
            </button>
          </div>

          <div class="mb-6">
            <p class="text-sm text-muted-foreground mb-4">
              Diese Aktion wird alle Transaktionen löschen und das Guthaben aller Nutzer auf 25 € zurücksetzen.
            </p>
            
            <label for="reset-confirm" class="block text-sm font-medium mb-2">
              Geben Sie <code class="bg-gray-100 px-1 rounded">RESET</code> ein um zu bestätigen:
            </label>
            <input
              id="reset-confirm"
              v-model="resetConfirmation"
              type="text"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="RESET"
            />
          </div>

          <div v-if="resetError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ resetError }}
          </div>

          <button 
            @click="handleReset"
            :disabled="!canReset || isResetting"
            class="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isResetting ? 'Wird ausgeführt...' : 'Reset bestätigen' }}
          </button>
        </div>
      </div>
    </Teleport>

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
            <h2 id="credits-reset-modal-title" class="text-xl font-bold text-yellow-600">⚠️ Guthaben-Reset</h2>
            <button 
              @click="closeCreditsResetModal"
              class="text-muted-foreground hover:text-foreground p-1"
              aria-label="Modal schließen"
            >
              ✕
            </button>
          </div>

          <div class="mb-6">
            <p class="text-sm text-muted-foreground mb-4">
              Diese Aktion setzt das Guthaben aller Nutzer auf 25 € zurück, ohne die Transaktionshistorie zu löschen.
            </p>
            
            <p class="text-sm font-medium">
              Möchten Sie fortfahren?
            </p>
          </div>

          <div v-if="resetError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ resetError }}
          </div>

          <div class="flex gap-3">
            <button 
              @click="closeCreditsResetModal"
              class="flex-1 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button 
              @click="handleCreditsReset"
              :disabled="isResetting"
              class="flex-1 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isResetting ? 'Wird ausgeführt...' : 'Reset durchführen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
