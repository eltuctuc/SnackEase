<!--
  OrderCard — Einzelne Bestellkarte in der Bestellübersicht (FEAT-11)

  Zeigt:
  - Status-Badge (Bereit / Abgeholt / Storniert)
  - Produktname + Preis
  - Standort
  - Countdown (nur bei pending_pickup, mit Urgency-Farbe)
  - PIN-Anzeige (nur bei pending_pickup)
  - NFC-Button (primär) + PIN-Button (sekundär) — nur bei pending_pickup

  @component
-->

<script setup lang="ts">
import { useCountdown } from '~/composables/useCountdown'
import type { Order, OrderItem } from '~/types'

// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  order: Order
  /** Ob gerade eine Abholung für diese Bestellung läuft */
  isPickingUp?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Abholung per NFC */
  'pickup-nfc': [orderId: number]
  /** Abholung per PIN */
  'pickup-pin': [orderId: number]
}>()

// ========================================
// COMPOSABLES
// ========================================

const { formatPrice } = useFormatter()

// ========================================
// STATE
// ========================================

/** Ob die Bestell-Details eingeklappt sind (nur bei Mehrprodukt-Bestellungen) */
const isCollapsed = ref(true)

// ========================================
// COMPUTED
// ========================================

/** Ist dies eine Mehrprodukt-Bestellung? */
const isMultiItemOrder = computed(() => {
  return props.order.items && props.order.items.length > 1
})

/** Liste aller Produkte (Legacy + Neu) */
const orderItems = computed((): OrderItem[] => {
  if (props.order.items && props.order.items.length > 0) {
    return props.order.items
  }
  // Fallback für Legacy-Bestellungen (einzelnes Produkt)
  if (props.order.productName) {
    return [{
      productId: 0,
      productName: props.order.productName,
      quantity: 1,
      unitPrice: props.order.price?.toString() || '0',
      imageUrl: props.order.productImageUrl ?? null
    }]
  }
  return []
})

/** Produktname für Anzeige (Legacy) */
const displayProductName = computed(() => {
  if (isMultiItemOrder.value) {
    return `${orderItems.value.length} Produkte`
  }
  return orderItems.value[0]?.productName || 'Produkt'
})

/** Produktbild für Anzeige (Legacy) */
const displayImage = computed(() => {
  if (isMultiItemOrder.value) {
    return orderItems.value[0]?.imageUrl
  }
  return orderItems.value[0]?.imageUrl
})

/** Gesamtpreis */
const displayTotalPrice = computed(() => {
  return parseFloat(props.order.totalPrice?.toString() || '0')
})

/** Ist die Bestellung bereit zur Abholung? */
const isPendingPickup = computed(() => props.order.status === 'pending_pickup')

/**
 * Countdown immer initialisieren — nur im Template anzeigen wenn pending_pickup.
 * Composable-Regeln in Vue erlauben keine bedingten Hooks-Aufrufe.
 */
const countdown = useCountdown(new Date(props.order.expiresAt))

/** Status-Label und Farbe */
const statusConfig = computed(() => {
  switch (props.order.status) {
    case 'pending_pickup':
      return {
        label: 'Bereit zur Abholung',
        icon: '🟡',
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      }
    case 'picked_up':
      return {
        label: 'Abgeholt',
        icon: '✅',
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
      }
    case 'cancelled':
      return {
        label: 'Storniert',
        icon: '❌',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
      }
    default:
      return {
        label: props.order.status,
        icon: '❔',
        badgeClass: 'bg-muted text-muted-foreground',
      }
  }
})

/** Urgency-Klasse für Countdown-Farbe */
const countdownClass = computed(() => {
  switch (countdown.value.urgency) {
    case 'danger':
      return 'text-red-600 font-semibold'
    case 'warning':
      return 'text-orange-500 font-medium'
    default:
      return 'text-foreground'
  }
})

/** Formatiertes Abholzeitpunkt */
const pickedUpAtFormatted = computed(() => {
  if (!props.order.pickedUpAt) return null
  return new Date(props.order.pickedUpAt).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

/** Formatiertes Stornierungszeitpunkt */
const cancelledAtFormatted = computed(() => {
  if (!props.order.cancelledAt) return null
  return new Date(props.order.cancelledAt).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// ========================================
// METHODS
// ========================================

function handleNfcPickup() {
  if (props.isPickingUp) return
  emit('pickup-nfc', props.order.id)
}

function handlePinPickup() {
  if (props.isPickingUp) return
  emit('pickup-pin', props.order.id)
}
</script>

<template>
  <div
    class="bg-card rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
    :data-testid="`order-card-${order.id}`"
    :data-status="order.status"
  >
    <!-- Status-Badge -->
    <div class="flex items-start justify-between mb-3">
      <span
        :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-medium', statusConfig.badgeClass]"
        :data-testid="`order-status-${order.id}`"
      >
        {{ statusConfig.icon }} {{ statusConfig.label }}
      </span>

      <!-- Bestelldatum -->
      <span class="text-xs text-muted-foreground">
        {{ new Date(order.createdAt).toLocaleDateString('de-DE') }}
      </span>
    </div>

    <!-- Produkt-Info -->
    <div
      class="flex items-center gap-3 mb-3"
      :class="{ 'cursor-pointer': isMultiItemOrder }"
      @click="isMultiItemOrder && (isCollapsed = !isCollapsed)"
    >
      <!-- Einzelnes Bild oder Produktanzahl -->
      <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
        <span v-if="!displayImage">🍎</span>
        <img
          v-else
          :src="displayImage"
          :alt="displayProductName"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="flex-1">
        <h3 class="font-medium text-foreground">{{ displayProductName }}</h3>
        <p class="text-sm text-muted-foreground">{{ formatPrice(displayTotalPrice) }} €</p>
      </div>
      <!-- Chevron für Mehrprodukt-Bestellungen -->
      <span
        v-if="isMultiItemOrder"
        class="text-muted-foreground transition-transform"
        :class="{ 'rotate-180': !isCollapsed }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>

    <!-- Aufgeklappte Produktliste (nur bei Mehrprodukt-Bestellungen) -->
    <div
      v-if="isMultiItemOrder && !isCollapsed"
      class="mb-3 pl-15 space-y-2"
    >
      <div
        v-for="item in orderItems"
        :key="item.productId"
        class="flex items-center gap-2 text-sm"
      >
        <div class="w-8 h-8 bg-muted rounded overflow-hidden flex-shrink-0">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.productName"
            class="w-full h-full object-cover"
          />
        </div>
        <span class="flex-1 text-foreground">{{ item.productName }}</span>
        <span class="text-muted-foreground">x{{ item.quantity }}</span>
        <span class="text-foreground font-medium">{{ formatPrice(parseFloat(item.unitPrice)) }}€</span>
      </div>
    </div>

    <!-- Standort (immer sichtbar) -->
    <div class="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
      <span aria-hidden="true">📍</span>
      <span>{{ order.pickupLocation }}</span>
    </div>

    <!-- pending_pickup: Countdown + PIN + Buttons -->
    <template v-if="isPendingPickup">
      <!-- Countdown -->
      <div
        class="flex items-center gap-1.5 mb-3"
        role="timer"
        aria-live="polite"
        :aria-label="`Verbleibende Zeit: ${countdown.label}`"
      >
        <span aria-hidden="true">⏱️</span>
        <span :class="['text-sm', countdownClass]" :data-testid="`order-countdown-${order.id}`">
          <span v-if="!countdown.expired">Noch {{ countdown.label }}</span>
          <span v-else>Abgelaufen</span>
        </span>
      </div>

      <!-- PIN-Anzeige -->
      <div class="flex items-center gap-1.5 mb-4">
        <span aria-hidden="true">🔐</span>
        <span class="text-sm text-muted-foreground">PIN:</span>
        <span class="font-bold text-foreground tracking-widest" :data-testid="`order-pin-${order.id}`">
          {{ order.pickupPin }}
        </span>
      </div>

      <!-- Abholoptionen — nur wenn nicht abgelaufen -->
      <div v-if="!countdown.expired" class="flex gap-2">
        <!-- NFC-Button (primär) -->
        <button
          @click="handleNfcPickup"
          :disabled="isPickingUp"
          :class="[
            'flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
            isPickingUp
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90',
          ]"
          :data-testid="`order-nfc-btn-${order.id}`"
          aria-label="Mit NFC abholen"
        >
          <span v-if="isPickingUp">Wird abgeholt...</span>
          <span v-else>📲 Mit NFC abholen</span>
        </button>

        <!-- PIN-Button (sekundär) -->
        <button
          @click="handlePinPickup"
          :disabled="isPickingUp"
          :class="[
            'flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
            isPickingUp
              ? 'border-input text-muted-foreground cursor-not-allowed bg-muted'
              : 'border-input text-foreground hover:bg-muted',
          ]"
          :data-testid="`order-pin-btn-${order.id}`"
          aria-label="PIN eingeben"
        >
          🔢 PIN eingeben
        </button>
      </div>

      <!-- Abgelaufen-Hinweis -->
      <div v-else class="text-sm text-muted-foreground text-center py-2 bg-muted rounded-lg">
        Bestellung abgelaufen — wird automatisch storniert
      </div>
    </template>

    <!-- picked_up: Abholzeitpunkt -->
    <template v-else-if="order.status === 'picked_up'">
      <div class="text-sm text-green-700 flex items-center gap-1.5">
        <span aria-hidden="true">✓</span>
        <span>Abgeholt am {{ pickedUpAtFormatted }} Uhr</span>
      </div>
    </template>

    <!-- cancelled: Info-Text -->
    <template v-else-if="order.status === 'cancelled'">
      <div class="space-y-1">
        <div class="text-sm text-red-600 flex items-center gap-1.5">
          <span aria-hidden="true">❌</span>
          <span>Nicht abgeholt innerhalb 2 Stunden</span>
        </div>
        <div class="text-sm text-muted-foreground flex items-center gap-1.5">
          <span>Nicht abgeholt — kein Guthaben wurde abgezogen</span>
        </div>
        <div v-if="cancelledAtFormatted" class="text-xs text-muted-foreground">
          Storniert am {{ cancelledAtFormatted }} Uhr
        </div>
      </div>
    </template>
  </div>
</template>
