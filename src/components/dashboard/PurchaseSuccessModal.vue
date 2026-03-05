<!--
  PurchaseSuccessModal - Bestätigung nach erfolgreichem Kauf (FEAT-7)
  
  Diese Komponente:
  - Zeigt Kauf-Bestätigung mit PIN
  - Zeigt Countdown bis Ablauf (2 Stunden)
  - Zeigt Standort und Abholoptionen (FEAT-11)
  - Zeigt Bonuspunkte
  
  @component
-->

<script setup lang="ts">
import type { PurchaseWithProduct } from '~/types'

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props für PurchaseSuccessModal
 * 
 * @property isOpen - Ob Modal geöffnet ist
 * @property purchase - Kauf-Objekt mit allen Details
 */
interface Props {
  isOpen: boolean
  purchase: PurchaseWithProduct | null
}

const props = defineProps<Props>()

/**
 * Events die diese Komponente emitted
 * 
 * @event close - Modal schließen
 */
const emit = defineEmits<{
  close: []
}>()

// ========================================
// COMPOSABLES
// ========================================

const { formatPrice } = useFormatter()

// ========================================
// REACTIVE STATE
// ========================================

/** Ref zum Close-Button für Focus-Management */
const closeButtonRef = ref<HTMLButtonElement | null>(null)

/** Verbleibende Zeit bis Ablauf (dynamisch) */
const timeRemaining = ref('')

// ========================================
// COMPUTED
// ========================================

/**
 * Berechnet verbleibende Zeit bis expiresAt
 * 
 * @returns String wie "1h 45min" oder "23min"
 */
function calculateTimeRemaining() {
  if (!props.purchase) return ''

  const now = new Date()
  const expiresAt = new Date(props.purchase.expiresAt)
  const diffMs = expiresAt.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'Abgelaufen'
  }

  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }

  return `${minutes}min`
}

// ========================================
// LIFECYCLE
// ========================================

/**
 * Countdown aktualisieren (jede Minute)
 */
let countdownInterval: NodeJS.Timeout | null = null

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.purchase) {
    // Fokus auf Close-Button setzen wenn Modal geöffnet wird
    nextTick(() => {
      closeButtonRef.value?.focus()
    })

    // Countdown starten
    timeRemaining.value = calculateTimeRemaining()
    
    countdownInterval = setInterval(() => {
      timeRemaining.value = calculateTimeRemaining()
    }, 60000) // Alle 60 Sekunden aktualisieren
  } else {
    // Countdown stoppen
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }
})

// Cleanup bei Component-Unmount
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

// ========================================
// METHODS
// ========================================

/**
 * Modal schließen
 */
function handleClose() {
  emit('close')
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
            class="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
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
          <div class="mb-4">
            <p class="text-sm text-muted-foreground mb-1">📍 Abholort:</p>
            <p class="font-medium text-foreground">{{ purchase.pickupLocation }}</p>
          </div>

          <!-- Countdown -->
          <div class="mb-6">
            <p class="text-sm text-muted-foreground mb-1">⏱️ Gültig bis:</p>
            <p class="font-medium text-foreground">
              {{ new Date(purchase.expiresAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }} Uhr
              <span class="text-muted-foreground text-sm">(noch {{ timeRemaining }})</span>
            </p>
          </div>

          <!-- Abholoptionen (FEAT-11 Vorbereitung) -->
          <div class="space-y-2">
            <button
              class="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              disabled
            >
              📲 Mit NFC abholen (kommt bald)
            </button>
            
            <button
              class="w-full py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              disabled
            >
              🔢 PIN am Automaten eingeben
            </button>
          </div>

          <!-- Info-Text -->
          <p class="text-xs text-muted-foreground text-center mt-4">
            Hinweis: Die Abholung am Automaten wird in einem späteren Update verfügbar sein (FEAT-11).
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
