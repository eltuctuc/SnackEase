<script setup lang="ts">
/**
 * /profile/credit — Guthaben aufladen (FEAT-24)
 *
 * Layout: Der globale Layout (default.vue) stellt pt-14 (UserHeader) und
 * pb-20 (UserTabBar) bereit. Diese Seite fuellt den verbleibenden Raum
 * mit einem Flex-Column-Layout: Info + Betrag + Button oben, Numpad unten.
 *
 * Auth-Guard: onMounted prueft authStore.user
 * - Nicht eingeloggt → /login
 * - Admin → /admin
 */

import { useCreditNumpad, type PaymentMethod } from '~/composables/useCreditNumpad'

// ============================================================
// Stores
// ============================================================

const authStore = useAuthStore()
const router = useRouter()

// ============================================================
// Composable
// ============================================================

const {
  amountCents,
  formattedAmount,
  isButtonDisabled,
  pressDigit,
  pressBackspace,
  reset,
  paymentMethod,
  refreshPaymentMethod,
} = useCreditNumpad()

// ============================================================
// State
// ============================================================

const isLoading = ref(false)
const balance = ref<string>('0.00')
const balanceLoading = ref(true)
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)

let toastTimeout: ReturnType<typeof setTimeout> | null = null

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { type, message }
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toast.value = null }, 4000)
}

// ============================================================
// Zahlungsmethode-Label
// ============================================================

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  visa: 'VISA / MAESTRO',
  paypal: 'PayPal',
  salary: 'Nettogehalt',
}

const paymentLabel = computed(() => PAYMENT_LABELS[paymentMethod.value])

// ============================================================
// Formatiertes Guthaben
// ============================================================

const formattedBalance = computed(() => {
  const num = parseFloat(balance.value) || 0
  return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
})

// ============================================================
// Guthaben laden
// ============================================================

async function loadBalance() {
  balanceLoading.value = true
  try {
    const result = await $fetch<{ balance: string }>('/api/credits/balance')
    balance.value = result.balance?.toString() ?? '0.00'
  } catch {
    balance.value = '0.00'
  } finally {
    balanceLoading.value = false
  }
}

// ============================================================
// Aufladen
// ============================================================

async function handleRecharge() {
  if (isButtonDisabled.value || isLoading.value) return
  isLoading.value = true

  try {
    const result = await $fetch<{ success: boolean; newBalance: string }>('/api/profile/credit', {
      method: 'POST',
      body: { amountCents: amountCents.value },
    })

    if (result.success) {
      balance.value = result.newBalance
      reset()
      showToast('success', 'Guthaben erfolgreich aufgeladen')
      setTimeout(() => { router.push('/profile') }, 1200)
    }
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    showToast('error', error.message ?? 'Aufladen fehlgeschlagen. Bitte versuche es erneut.')
  } finally {
    isLoading.value = false
  }
}

// ============================================================
// Auth-Guard (onMounted Pattern)
// ============================================================

onMounted(async () => {
  if (!authStore.user) await authStore.initFromCookie()
  if (!authStore.user) { await navigateTo('/login'); return }
  if (authStore.user.role === 'admin') { await navigateTo('/admin'); return }
  refreshPaymentMethod(authStore.user.id)
  await loadBalance()
})

onUnmounted(() => { if (toastTimeout) clearTimeout(toastTimeout) })
</script>

<template>
  <div class="bg-background flex flex-col" style="height: calc(100vh - 56px - 80px)">

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="toast"
        class="absolute top-20 left-4 right-4 z-50 max-w-md mx-auto px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
        :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-destructive-foreground'"
        role="alert"
        aria-live="assertive"
      >
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Seiteninterner Header -->
    <div class="bg-card border-b border-border px-4 h-12 flex items-center gap-3 flex-shrink-0">
      <NuxtLink
        to="/profile"
        class="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Zurück zu Profil"
      >
        <svg class="w-5 h-5" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M8.5 3.5L4 7.5l4.5 4M4 7.5h7" />
        </svg>
      </NuxtLink>
      <h1 class="text-base font-bold text-foreground flex-1">Guthaben aufladen</h1>
    </div>

    <!-- Info-Zeile: Guthaben + Zahlungsmethode -->
    <div class="bg-card border-b border-border px-4 py-2 flex items-center justify-between flex-shrink-0">
      <div class="flex items-baseline gap-2">
        <span class="text-sm text-muted-foreground">Guthaben</span>
        <template v-if="balanceLoading">
          <span class="inline-block h-5 w-16 bg-muted rounded animate-pulse" />
        </template>
        <span v-else class="text-base font-semibold text-foreground">{{ formattedBalance }}</span>
      </div>

      <NuxtLink
        to="/profile/payment"
        class="flex flex-col items-center gap-0.5 rounded-lg p-1 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        :aria-label="`Zahlungsmethode: ${paymentLabel}. Tippen zum Ändern.`"
      >
        <div
          class="px-2 py-1 rounded-md text-xs font-bold text-white"
          :class="{
            'bg-blue-700': paymentMethod === 'paypal',
            'bg-blue-500': paymentMethod === 'visa',
            'bg-teal-600': paymentMethod === 'salary',
          }"
        >
          {{ paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'visa' ? 'VISA' : 'GEHALT' }}
        </div>
        <span class="text-[10px] text-muted-foreground">{{ paymentLabel }}</span>
      </NuxtLink>
    </div>

    <!-- Betrag-Anzeige -->
    <div class="flex items-center justify-center px-4 py-4 flex-shrink-0">
      <div
        class="text-5xl font-light tracking-tight transition-colors duration-100"
        :class="amountCents === 0 ? 'text-muted-foreground/50' : 'text-foreground'"
        aria-live="polite"
        aria-label="Einzugebender Betrag"
        aria-atomic="true"
      >
        {{ formattedAmount }}
      </div>
    </div>

    <!-- CTA-Bereich -->
    <div class="px-4 pb-3 space-y-2 flex-shrink-0">
      <button
        type="button"
        class="w-full h-12 rounded-2xl text-sm font-bold tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        :class="isButtonDisabled || isLoading
          ? 'bg-primary text-primary-foreground opacity-40 cursor-not-allowed'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'"
        :disabled="isButtonDisabled || isLoading"
        :aria-disabled="isButtonDisabled || isLoading ? 'true' : 'false'"
        @click="handleRecharge"
      >
        <span v-if="!isLoading">GUTHABEN AUFLADEN</span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Wird aufgeladen...
        </span>
      </button>

      <p class="text-center text-sm text-foreground">
        Falsche Zahlungsmethode?
        <NuxtLink to="/profile/payment" class="text-primary font-medium hover:underline focus:outline-none focus:underline">
          Ändern
        </NuxtLink>
      </p>
    </div>

    <!-- Numpad (fuellt den verbleibenden Platz) -->
    <div class="flex-1 min-h-0">
      <ProfileCreditNumpad
        @digit="pressDigit"
        @backspace="pressBackspace"
      />
    </div>

  </div>
</template>
