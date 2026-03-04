<!--
  BalanceCard - Guthaben-Anzeige mit Auflade-Funktionen
  
  Diese Komponente zeigt:
  - Aktuellen Guthabenstand mit farblicher Kennzeichnung (grün/gelb/rot)
  - Status-Indikator-Dot
  - Buttons für Aufladung und Monatspauschale
  - Letztes Auflade-Datum
  - Fehlermeldungen
  
  @component
-->

<script setup lang="ts">
import type { BalanceStatus } from '~/types'

// ========================================
// COMPOSABLES
// ========================================

/** useFormatter für Datums-Formatierung */
const { formatDate } = useFormatter()

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props für BalanceCard
 * 
 * @property balance - Aktuelles Guthaben als String (z.B. "25.50")
 * @property balanceStatus - Status für Farbkodierung ('good' | 'warning' | 'critical')
 * @property lastRechargedAt - Letztes Auflade-Datum (ISO-8601 String oder null)
 * @property isLoading - Loading-State (deaktiviert Buttons)
 * @property error - Fehlermeldung (null = kein Fehler)
 */
interface Props {
  balance: string
  balanceStatus: BalanceStatus
  lastRechargedAt: string | null
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
 * @event open-recharge-modal - User klickt auf "Guthaben aufladen"
 * @event request-monthly - User klickt auf "Monatspauschale +25€"
 * @event dismiss-error - User schließt Fehlermeldung
 */
const emit = defineEmits<{
  openRechargeModal: []
  requestMonthly: []
  dismissError: []
}>()

// ========================================
// COMPUTED PROPERTIES
// ========================================

/**
 * Dynamische CSS-Klassen für Balance-Card basierend auf Status
 * 
 * @description
 * Bestimmt die Hintergrund- und Textfarbe:
 * - 'good' (> 20€): Grün
 * - 'warning' (10-20€): Gelb
 * - 'critical' (< 10€): Rot
 */
const balanceColorClass = computed(() => {
  switch (props.balanceStatus) {
    case 'good': return 'bg-green-100 border-green-300 text-green-800'
    case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    case 'critical': return 'bg-red-100 border-red-300 text-red-800'
    default: return 'bg-gray-100 border-gray-300 text-gray-800'
  }
})

/**
 * Dynamische CSS-Klassen für Status-Indikator-Dot
 */
const balanceDotClass = computed(() => {
  switch (props.balanceStatus) {
    case 'good': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
})

/**
 * Formatiert ISO-Datum zu deutschem Format
 * 
 * @returns Formatiertes Datum (z.B. "04.03.2026") oder null
 * 
 * @description
 * Nutzt useFormatter() Composable für konsistente Formatierung.
 */
const formattedLastRechargedAt = computed(() => {
  return formatDate(props.lastRechargedAt)
})
</script>

<template>
  <!-- Loading Skeleton -->
  <div v-if="isLoading" class="rounded-lg p-6 border-2 bg-gray-100 border-gray-200 animate-pulse">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="h-3 bg-gray-300 rounded w-16 mb-2"></div>
        <div class="h-10 bg-gray-300 rounded w-28"></div>
      </div>
      <div class="w-4 h-4 rounded-full bg-gray-300"></div>
    </div>
    <div class="flex gap-3">
      <div class="flex-1 h-12 bg-gray-300 rounded-lg"></div>
      <div class="flex-1 h-12 bg-gray-300 rounded-lg"></div>
    </div>
  </div>

  <!-- Echte Karte -->
  <div
    v-else
    :class="['rounded-lg p-6 border-2 transition-all', balanceColorClass]"
    role="status"
    aria-live="polite"
  >
    <!-- Guthaben-Anzeige -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm font-medium opacity-80" id="balance-label">Guthaben</p>
        <p class="text-4xl font-bold" aria-labelledby="balance-label">
          <span aria-live="polite" data-testid="balance-amount">{{ balance }}</span> €
        </p>
      </div>
      <!-- Status-Indikator-Dot -->
      <div 
        :class="['w-4 h-4 rounded-full', balanceDotClass]"
        role="img"
        :aria-label="'Guthaben-Status: ' + balanceStatus"
      ></div>
    </div>
    
    <!-- Action-Buttons -->
    <div class="flex gap-3">
      <!-- Guthaben aufladen Button -->
      <button 
        @click="emit('openRechargeModal')"
        :disabled="isLoading"
        aria-label="Guthaben aufladen"
        class="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Guthaben aufladen
      </button>
      
      <!-- Monatspauschale Button -->
      <button 
        @click="emit('requestMonthly')"
        :disabled="isLoading"
        aria-label="Monatspauschale erhalten, erhöht Guthaben um 25 Euro"
        class="flex-1 py-3 px-4 border-2 border-current rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'Wird geladen...' : 'Monatspauschale +25€' }}
      </button>
    </div>
  
    <!-- Letztes Auflade-Datum -->
    <p v-if="formattedLastRechargedAt" class="text-xs mt-3 opacity-70">
      Zuletzt aufgeladen: {{ formattedLastRechargedAt }}
    </p>
    
    <!-- Fehlermeldung -->
    <p v-if="error" class="text-xs mt-3 text-red-600 bg-red-50 p-2 rounded" role="alert">
      {{ error }}
      <button 
        @click="emit('dismissError')" 
        class="ml-2 underline" 
        aria-label="Fehlermeldung schließen"
      >
        ✕
      </button>
    </p>
  </div>
</template>
