<!--
  PurchaseSuccessModal - Bestätigung nach erfolgreichem Kauf (FEAT-7 + FEAT-11)

  Diese Komponente:
  - Zeigt Kauf-Bestätigung mit PIN
  - Zeigt Countdown bis Ablauf (via useCountdown Composable)
  - Zeigt Standort und Abholoptionen (FEAT-11 — NFC + PIN aktiviert)
  - Zeigt Bonuspunkte
  - Öffnet NfcPickupAnimation bei NFC-Klick
  - Öffnet PinInputModal bei PIN-Klick

  @component
-->

<script setup lang="ts">
import type { PurchaseWithProduct } from '~/types'
import NfcPickupAnimation from '~/components/orders/NfcPickupAnimation.vue'
import PinInputModal from '~/components/orders/PinInputModal.vue'

// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  isOpen: boolean
  purchase: PurchaseWithProduct | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// ========================================
// COMPOSABLES
// ========================================

const { formatPrice } = useFormatter()
const purchasesStore = usePurchasesStore()
const creditsStore = useCreditsStore()
const authStore = useAuthStore()

// ========================================
// REACTIVE STATE
// ========================================

/** Ref zum Close-Button für Focus-Management */
const closeButtonRef = ref<HTMLButtonElement | null>(null)

/** Ob NFC-Animation sichtbar ist */
const showNfcAnimation = ref(false)

/** Ob PIN-Modal offen ist */
const showPinModal = ref(false)

/** Fehlermeldung im PIN-Modal */
const pinModalError = ref<string | null>(null)

/** Anzahl falscher PIN-Versuche */
const pinAttempts = ref(0)

const MAX_PIN_ATTEMPTS = 3

// ========================================
// COUNTDOWN
// ========================================

/**
 * Einfache Countdown-Berechnung (ohne Composable, da Composable ein fixes Date braucht
 * und das Purchase sich nach Modal-Öffnung nicht ändert).
 *
 * Aktualisiert sich jede Minute für die Anzeige.
 */
const now = ref(new Date())
let countdownInterval: ReturnType<typeof setInterval> | null = null

/**
 * Formatierter Countdown-Text für Anzeige
 */
const timeRemaining = computed(() => {
  if (!props.purchase) return ''

  const diffMs = new Date(props.purchase.expiresAt).getTime() - now.value.getTime()

  if (diffMs <= 0) return 'Abgelaufen'

  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
})

// ========================================
// LIFECYCLE
// ========================================

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.purchase) {
    // Fokus auf Close-Button setzen wenn Modal geöffnet wird
    nextTick(() => {
      closeButtonRef.value?.focus()
    })

    // State zurücksetzen
    showNfcAnimation.value = false
    showPinModal.value = false
    pinModalError.value = null
    pinAttempts.value = 0

    // Countdown-Interval starten (jede Minute)
    now.value = new Date()
    if (countdownInterval) clearInterval(countdownInterval)
    countdownInterval = setInterval(() => {
      now.value = new Date()
    }, 60000)
  } else {
    // Countdown-Interval stoppen
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

// ========================================
// COMPUTED
// ========================================

/** Ob gerade eine Abholung läuft */
const isCurrentlyPickingUp = computed(
  () => showNfcAnimation.value || purchasesStore.isPickingUp
)

/** Ist der PIN gesperrt (max Versuche) */
const isPinLocked = computed(() => pinAttempts.value >= MAX_PIN_ATTEMPTS)

// ========================================
// METHODS
// ========================================

function handleClose() {
  emit('close')
}

// --- NFC-Abholung ---

function handleNfcClick() {
  if (isCurrentlyPickingUp.value || !props.purchase) return
  showNfcAnimation.value = true
}

async function handleNfcAnimationDone() {
  showNfcAnimation.value = false

  if (!props.purchase) return

  const result = await purchasesStore.pickupOrder(props.purchase.id, 'nfc')

  if (result.success) {
    // Guthaben aktualisieren
    if (!authStore.isAdmin) {
      await creditsStore.fetchBalance()
    }
    // Modal schließen nach kurzer Pause (UX)
    await nextTick()
    emit('close')
  }
}

// --- PIN-Abholung ---

function handlePinClick() {
  if (isCurrentlyPickingUp.value || !props.purchase) return
  showPinModal.value = true
  pinModalError.value = null
  pinAttempts.value = 0
}

async function handlePinConfirm(pin: string) {
  if (!props.purchase) return

  const result = await purchasesStore.pickupOrder(props.purchase.id, 'pin', pin)

  if (result.success) {
    showPinModal.value = false
    pinModalError.value = null
    pinAttempts.value = 0

    // Guthaben aktualisieren
    if (!authStore.isAdmin) {
      await creditsStore.fetchBalance()
    }

    // Modal schließen
    await nextTick()
    emit('close')
  } else {
    pinAttempts.value++
    const verbleibend = MAX_PIN_ATTEMPTS - pinAttempts.value

    if (pinAttempts.value >= MAX_PIN_ATTEMPTS) {
      pinModalError.value = 'Maximale Versuche erreicht. Bitte lade die Seite neu.'
    } else {
      pinModalError.value = `PIN falsch. Noch ${verbleibend} Versuch${verbleibend === 1 ? '' : 'e'}.`
    }
  }
}

function handlePinCancel() {
  showPinModal.value = false
  pinModalError.value = null
  pinAttempts.value = 0
}
</script>

<template>
  <!-- Modal-Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen && purchase"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="handleClose"
      >
        <!-- Modal-Content -->
        <div
          class="bg-card rounded-lg border shadow-lg max-w-md w-full p-6 relative"
          @click.stop
          data-testid="purchase-success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-success-title"
        >
          <!-- Close Button -->
          <button
            ref="closeButtonRef"
            @click="handleClose"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Modal schließen"
            data-testid="modal-close-button"
          >
            ✕
          </button>

          <!-- Success-Header -->
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">✅</div>
            <h2 id="purchase-success-title" class="text-2xl font-bold text-foreground">Kauf erfolgreich!</h2>
          </div>

          <!-- Produkt-Info -->
          <div class="bg-muted rounded-lg p-4 mb-4">
            <div class="flex items-center gap-3">
              <!-- Produktbild -->
              <div class="w-16 h-16 bg-background rounded-lg flex items-center justify-center text-3xl">
                <span v-if="!purchase.productImageUrl">🍎</span>
                <img
                  v-else
                  :src="purchase.productImageUrl"
                  :alt="purchase.productName"
                  class="w-full h-full object-cover rounded-lg"
                />
              </div>

              <!-- Produktdetails -->
              <div class="flex-1">
                <h3 class="font-medium text-foreground">{{ purchase.productName }}</h3>
                <p class="text-sm text-muted-foreground">{{ formatPrice(purchase.price) }} €</p>
              </div>
            </div>

            <!-- Bonuspunkte -->
            <div v-if="purchase.bonusPoints > 0" class="mt-3 text-sm text-center">
              🏆 <span class="font-medium">+{{ purchase.bonusPoints }} Bonuspunkte</span> gesammelt!
            </div>
          </div>

          <!-- PIN-Anzeige -->
          <div class="bg-primary/10 border-2 border-primary rounded-lg p-4 mb-4">
            <p class="text-sm text-center text-muted-foreground mb-2">🔐 Deine Abhol-PIN:</p>
            <div class="text-4xl font-bold text-center text-primary tracking-wider" data-testid="pickup-pin">
              {{ purchase.pickupPin }}
            </div>
          </div>

          <!-- Standort -->
          <div class="mb-3">
            <p class="text-sm text-muted-foreground mb-1">📍 Abholort:</p>
            <p class="font-medium text-foreground">{{ purchase.pickupLocation }}</p>
          </div>

          <!-- Countdown -->
          <div class="mb-5">
            <p class="text-sm text-muted-foreground mb-1">⏱️ Gültig bis:</p>
            <p class="font-medium text-foreground">
              {{ new Date(purchase.expiresAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }} Uhr
              <span class="text-muted-foreground text-sm">(noch {{ timeRemaining }})</span>
            </p>
          </div>

          <!-- Abholoptionen -->
          <div class="space-y-2 mb-4">
            <!-- NFC-Button (primär) -->
            <button
              @click="handleNfcClick"
              :disabled="isCurrentlyPickingUp"
              :class="[
                'w-full py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                isCurrentlyPickingUp
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90',
              ]"
              data-testid="modal-nfc-button"
              aria-label="Mit NFC abholen"
            >
              <span v-if="isCurrentlyPickingUp">Wird abgeholt...</span>
              <span v-else>📲 Mit NFC abholen</span>
            </button>

            <!-- PIN-Button (sekundär) -->
            <button
              @click="handlePinClick"
              :disabled="isCurrentlyPickingUp"
              :class="[
                'w-full py-3 rounded-lg font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                isCurrentlyPickingUp
                  ? 'border-input bg-muted text-muted-foreground cursor-not-allowed'
                  : 'border-input bg-background text-foreground hover:bg-muted',
              ]"
              data-testid="modal-pin-button"
              aria-label="PIN am Automaten eingeben"
            >
              🔢 PIN am Automaten eingeben
            </button>
          </div>

          <!-- Link zu Bestellungen -->
          <div class="text-center mb-4">
            <NuxtLink
              to="/orders"
              class="text-sm text-primary hover:underline"
              @click="handleClose"
              data-testid="orders-link"
            >
              Zu meinen Bestellungen →
            </NuxtLink>
          </div>

          <!-- Demo-Hinweis -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-xs text-blue-800">
              <span class="font-medium">Demo-Hinweis:</span>
              Dies ist eine Simulation. Klicke "Mit NFC abholen" um den Abholprozess zu simulieren,
              oder gib deine PIN ein.
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- NFC-Animation (Fullscreen) -->
    <NfcPickupAnimation
      :is-visible="showNfcAnimation"
      @done="handleNfcAnimationDone"
    />

    <!-- PIN-Modal -->
    <PinInputModal
      :is-open="showPinModal"
      :error-message="pinModalError ?? undefined"
      :is-locked="isPinLocked"
      :is-loading="purchasesStore.isPickingUp"
      @confirm="handlePinConfirm"
      @cancel="handlePinCancel"
    />
  </Teleport>
</template>
