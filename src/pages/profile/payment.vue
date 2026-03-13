<script setup lang="ts">
/**
 * /profile/payment — Zahlungsmethode waehlen (FEAT-24)
 *
 * Zeigt:
 * - Header mit Zurueck-Pfeil und Titel "Zahlungsmethode"
 * - PaymentMethodSelector (drei Radio-Optionen)
 * - "AUSWAHL SPEICHERN"-Button
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

const { savePaymentMethod, loadPaymentMethod } = useCreditNumpad()

// ============================================================
// State
// ============================================================

const selectedMethod = ref<PaymentMethod>('paypal')

// ============================================================
// Speichern und zuruecknavigieren
// ============================================================

function handleSave() {
  if (authStore.user) {
    savePaymentMethod(selectedMethod.value, authStore.user.id)
  }
  router.push('/profile/credit')
}

// ============================================================
// Auth-Guard und Initialisierung (onMounted Pattern)
// ============================================================

onMounted(async () => {
  if (!authStore.user) {
    await authStore.initFromCookie()
  }

  if (!authStore.user) {
    await navigateTo('/login')
    return
  }

  if (authStore.user.role === 'admin') {
    await navigateTo('/admin')
    return
  }

  // Gespeicherte Zahlungsmethode laden (REQ-13)
  selectedMethod.value = loadPaymentMethod(authStore.user.id)
})
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">

    <!-- Header -->
    <div class="bg-card border-b border-border px-4 h-14 flex items-center gap-3 flex-shrink-0">
      <NuxtLink
        to="/profile/credit"
        class="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Zurück zu Guthaben aufladen"
      >
        <!-- Zurueck-Pfeil (Teenyicons: arrow-left) -->
        <svg
          class="w-5 h-5"
          viewBox="0 0 15 15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M8.5 3.5L4 7.5l4.5 4M4 7.5h7" />
        </svg>
      </NuxtLink>

      <h1 class="text-base font-bold text-foreground flex-1">Zahlungsmethode</h1>
    </div>

    <!-- Zahlungsmethoden-Auswahl -->
    <div class="flex-1 bg-card mt-4 mx-0 border-t border-b border-border">
      <ProfilePaymentMethodSelector
        v-model="selectedMethod"
      />
    </div>

    <!-- CTA-Button -->
    <div class="px-4 py-6 flex-shrink-0">
      <button
        type="button"
        class="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-sm font-bold tracking-widest hover:bg-primary/90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        @click="handleSave"
      >
        AUSWAHL SPEICHERN
      </button>
    </div>

    <!-- Tab-Bar (Profil-Tab aktiv) -->
    <UserTabBar />

  </div>
</template>
