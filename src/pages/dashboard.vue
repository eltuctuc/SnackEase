<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()
const creditsStore = useCreditsStore()

const showRechargeModal = ref(false)
const selectedAmount = ref<string | null>(null)
const isRecharging = ref(false)
const rechargeSuccess = ref(false)

const RECHARGE_OPTIONS = [
  { amount: '10', label: '10 €', description: 'Klein' },
  { amount: '25', label: '25 €', description: 'Standard' },
  { amount: '50', label: '50 €', description: 'Groß' },
]

const balanceColorClass = computed(() => {
  switch (creditsStore.balanceStatus) {
    case 'good': return 'bg-green-100 border-green-300 text-green-800'
    case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    case 'critical': return 'bg-red-100 border-red-300 text-red-800'
    default: return 'bg-gray-100 border-gray-300 text-gray-800'
  }
})

const balanceDotClass = computed(() => {
  switch (creditsStore.balanceStatus) {
    case 'good': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
})

const logout = () => {
  authStore.logout()
}

const selectAmount = (amount: string) => {
  selectedAmount.value = amount
}

const handleRecharge = async () => {
  if (!selectedAmount.value || isRecharging.value) return

  isRecharging.value = true
  rechargeSuccess.value = false

  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

  const result = await creditsStore.recharge(selectedAmount.value)

  isRecharging.value = false

  if (result.success) {
    rechargeSuccess.value = true
    setTimeout(() => {
      showRechargeModal.value = false
      rechargeSuccess.value = false
      selectedAmount.value = null
    }, 1500)
  }
}

const handleMonthly = async () => {
  if (creditsStore.isLoading) return

  await creditsStore.receiveMonthly()
}

const dismissError = () => {
  creditsStore.error = null
}

const closeModalAndReset = () => {
  showRechargeModal.value = false
  selectedAmount.value = null
  creditsStore.error = null
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showRechargeModal.value) {
    closeModalAndReset()
  }
}

onMounted(async () => {
  await authStore.initFromCookie()
  
  if (!authStore.user) {
    router.push('/login')
  } else {
    await creditsStore.fetchBalance()
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
          <p v-if="authStore.user" class="text-sm text-muted-foreground mt-1">
            Angemeldet als {{ authStore.user.name }} 
            <span v-if="authStore.user.location">({{ authStore.user.location }})</span>
            <span class="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
              {{ authStore.user.role }}
            </span>
          </p>
        </div>
        
        <button 
          @click="logout"
          class="py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
        >
          Abmelden
        </button>
      </div>

      <div class="grid gap-6 mb-8">
          <div 
            :class="['rounded-lg p-6 border-2 transition-all', balanceColorClass]"
            role="status"
            aria-live="polite"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium opacity-80" id="balance-label">Guthaben</p>
                <p class="text-4xl font-bold" aria-labelledby="balance-label">
                  <span aria-live="polite">{{ creditsStore.balance }}</span> €
                </p>
              </div>
              <div 
                :class="['w-4 h-4 rounded-full', balanceDotClass]"
                role="img"
                :aria-label="'Guthaben-Status: ' + creditsStore.balanceStatus"
              ></div>
            </div>
            
            <div class="flex gap-3">
              <button 
                @click="showRechargeModal = true"
                :disabled="creditsStore.isLoading"
                aria-label="Guthaben aufladen"
                class="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guthaben aufladen
              </button>
              
              <button 
                @click="handleMonthly"
                :disabled="creditsStore.isLoading"
                aria-label="Monatspauschale erhalten, erhöht Guthaben um 25 Euro"
                class="flex-1 py-3 px-4 border-2 border-current rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ creditsStore.isLoading ? 'Wird geladen...' : 'Monatspauschale +25€' }}
              </button>
            </div>
          
          <p v-if="creditsStore.lastRechargedAt" class="text-xs mt-3 opacity-70">
            Zuletzt aufgeladen: {{ new Date(creditsStore.lastRechargedAt).toLocaleDateString('de-DE') }}
          </p>
          
          <p v-if="creditsStore.error" class="text-xs mt-3 text-red-600 bg-red-50 p-2 rounded" role="alert">
            {{ creditsStore.error }}
            <button @click="dismissError" class="ml-2 underline" aria-label="Fehlermeldung schließen">✕</button>
          </p>
        </div>
      </div>

      <div class="bg-card rounded-lg p-6 border">
        <p class="text-foreground">Willkommen im Admin-Dashboard!</p>
        <p class="text-muted-foreground mt-2">Hier werden später die Admin-Funktionen angezeigt.</p>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="showRechargeModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeModalAndReset"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 id="modal-title" class="text-xl font-bold">Guthaben aufladen</h2>
            <button 
              @click="closeModalAndReset"
              class="text-muted-foreground hover:text-foreground p-1"
              aria-label="Modal schließen"
            >
              ✕
            </button>
          </div>

          <div v-if="rechargeSuccess" class="text-center py-8" role="status" aria-live="polite">
            <div class="text-4xl mb-4" aria-hidden="true">✓</div>
            <p class="text-lg font-medium text-green-600">Guthaben erfolgreich aufgeladen!</p>
          </div>

          <div v-else-if="isRecharging" class="text-center py-8">
            <div class="mb-4">
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary transition-all duration-300"
                  style="width: 100%"
                ></div>
              </div>
            </div>
            <p class="text-lg font-medium">Wird aufgeladen...</p>
          </div>

          <div v-else>
            <p class="text-sm text-muted-foreground mb-4">Wähle einen Betrag:</p>
            
            <div v-if="creditsStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              {{ creditsStore.error }}
              <button @click="dismissError" class="ml-2 underline" aria-label="Fehlermeldung schließen">✕</button>
            </div>
            
            <div class="grid grid-cols-3 gap-3 mb-6" role="group" aria-label="Auflade-Beträge auswählen">
              <button
                v-for="option in RECHARGE_OPTIONS"
                :key="option.amount"
                @click="selectAmount(option.amount)"
                :aria-pressed="selectedAmount === option.amount"
                :class="[
                  'p-4 rounded-lg border-2 transition-all text-center',
                  selectedAmount === option.amount 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                ]"
              >
                <p class="text-2xl font-bold">{{ option.label }}</p>
                <p class="text-xs text-muted-foreground">{{ option.description }}</p>
              </button>
            </div>

            <button 
              @click="handleRecharge"
              :disabled="!selectedAmount || isRecharging"
              aria-label="Guthaben mit gewählten Betrag aufladen"
              class="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isRecharging ? 'Wird aufgeladen...' : 'Jetzt aufladen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
