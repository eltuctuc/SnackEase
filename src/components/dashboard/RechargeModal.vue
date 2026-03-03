<!--
  RechargeModal - Modal für Guthaben-Aufladung
  
  Diese Komponente zeigt ein Modal mit Auflade-Optionen (10€, 25€, 50€).
  
  Features:
  - Betrag-Auswahl via Buttons
  - Loading-State während Aufladung
  - Success-Animation nach erfolgreicher Aufladung
  - Auto-Close nach Success (1.5s)
  - Error-Handling mit Fehlermeldungen
  - Keyboard-Navigation (ESC zum Schließen)
  
  @component
-->

<script setup lang="ts">
import { RECHARGE_OPTIONS } from '~/constants/credits'
import { RECHARGE_SIMULATION, SUCCESS_MODAL_AUTO_CLOSE_DELAY } from '~/constants/ui'

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props für RechargeModal
 * 
 * @property show - Steuert Sichtbarkeit des Modals
 * @property isLoading - Loading-State (deaktiviert Buttons während API-Call)
 * @property error - Fehlermeldung vom Store (null = kein Fehler)
 */
interface Props {
  show: boolean
  isLoading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
})

/**
 * Events die diese Komponente emitted
 * 
 * @event close - User möchte Modal schließen (X-Button, Backdrop, ESC)
 * @event recharge - User hat Betrag gewählt und "Jetzt aufladen" geklickt
 * @event dismiss-error - User hat Fehlermeldung geschlossen
 */
const emit = defineEmits<{
  close: []
  recharge: [amount: string]
  dismissError: []
}>()

// ========================================
// REACTIVE STATE
// ========================================

/** Aktuell ausgewählter Auflade-Betrag */
const selectedAmount = ref<string | null>(null)

/** Loading-State während Aufladung (für simulierten Progress) */
const isRecharging = ref(false)

/** Success-State nach erfolgreicher Aufladung */
const rechargeSuccess = ref(false)

// ========================================
// COMPUTED PROPERTIES
// ========================================

/**
 * Zeigt ob Modal aktuell im Loading-Zustand ist
 * 
 * Kombiniert Parent-Loading (props.isLoading) mit lokalem Recharge-State
 */
const isLoadingState = computed(() => props.isLoading || isRecharging.value)

// ========================================
// METHODS
// ========================================

/**
 * Setzt den ausgewählten Auflade-Betrag
 * 
 * @param amount - Betrag als String ('10' | '25' | '50')
 */
const selectAmount = (amount: string) => {
  selectedAmount.value = amount
}

/**
 * Führt Guthaben-Aufladung durch
 * 
 * @description
 * Workflow:
 * 1. Validierung (Betrag gewählt?)
 * 2. Loading-State aktivieren
 * 3. Simulation-Delay (2-3s für bessere UX)
 * 4. Event an Parent emittieren (Parent führt API-Call aus)
 * 5. Success-Animation zeigen
 * 6. Auto-Close nach 1.5s
 */
const handleRecharge = async () => {
  if (!selectedAmount.value || isRecharging.value) return

  isRecharging.value = true
  rechargeSuccess.value = false

  // Simuliere realistische Ladezeit (2-3 Sekunden)
  await new Promise(resolve => 
    setTimeout(
      resolve, 
      RECHARGE_SIMULATION.BASE_DELAY + Math.random() * RECHARGE_SIMULATION.RANDOM_DELAY_MAX
    )
  )

  // Emittiere Event an Parent (Parent macht API-Call)
  emit('recharge', selectedAmount.value)

  isRecharging.value = false

  // Success-State anzeigen (Parent setzt isLoading = false bei Erfolg)
  rechargeSuccess.value = true
  
  // Auto-Close nach 1.5s
  setTimeout(() => {
    emit('close')
    // Reset State nach Modal-Close
    setTimeout(() => {
      rechargeSuccess.value = false
      selectedAmount.value = null
    }, 300) // Warte auf Modal-Fade-Out-Animation
  }, SUCCESS_MODAL_AUTO_CLOSE_DELAY)
}

/**
 * Schließt Modal und resettet State
 */
const closeModal = () => {
  emit('close')
  // Reset State nach Modal-Close-Animation
  setTimeout(() => {
    selectedAmount.value = null
    rechargeSuccess.value = false
  }, 300)
}

/**
 * Schließt Fehlermeldung
 */
const dismissError = () => {
  emit('dismissError')
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recharge-modal-title"
    >
      <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 id="recharge-modal-title" class="text-xl font-bold">Guthaben aufladen</h2>
          <button 
            @click="closeModal"
            class="text-muted-foreground hover:text-foreground p-1"
            aria-label="Modal schließen"
          >
            ✕
          </button>
        </div>

        <!-- Success State -->
        <div v-if="rechargeSuccess" class="text-center py-8" role="status" aria-live="polite">
          <div class="text-4xl mb-4" aria-hidden="true">✓</div>
          <p class="text-lg font-medium text-green-600">Guthaben erfolgreich aufgeladen!</p>
        </div>

        <!-- Loading State -->
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

        <!-- Main Content (Betrag-Auswahl) -->
        <div v-else>
          <p class="text-sm text-muted-foreground mb-4">Wähle einen Betrag:</p>
          
          <!-- Error Message -->
          <div 
            v-if="error" 
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" 
            role="alert"
          >
            {{ error }}
            <button 
              @click="dismissError" 
              class="ml-2 underline" 
              aria-label="Fehlermeldung schließen"
            >
              ✕
            </button>
          </div>
          
          <!-- Betrag-Buttons -->
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

          <!-- Aufladen Button -->
          <button 
            @click="handleRecharge"
            :disabled="!selectedAmount || isLoadingState"
            aria-label="Guthaben mit gewählten Betrag aufladen"
            class="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoadingState ? 'Wird aufgeladen...' : 'Jetzt aufladen' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
