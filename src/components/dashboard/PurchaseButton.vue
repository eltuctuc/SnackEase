<!--
  PurchaseButton - One-Touch Kaufen-Button (FEAT-7)
  
  Diese Komponente:
  - Zeigt "Kaufen"-Button auf Produktkarte
  - Prüft Guthaben und Bestand
  - Zeigt Ladeanimation während Kauf
  - Öffnet Success-Modal nach erfolgreichem Kauf
  - Zeigt Fehlermeldungen als Toast
  
  @component
-->

<script setup lang="ts">
import type { Product } from '~/types'

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props für PurchaseButton
 * 
 * @property product - Produkt das gekauft werden soll
 * @property userBalance - Aktuelles Guthaben des Users (für Validierung)
 */
interface Props {
  product: Product
  userBalance: number
}

const props = defineProps<Props>()

/**
 * Events die diese Komponente emitted
 * 
 * @event purchase-success - Kauf erfolgreich, öffnet Success-Modal
 */
const emit = defineEmits<{
  purchaseSuccess: []
}>()

// ========================================
// COMPOSABLES & STORES
// ========================================

const purchasesStore = usePurchasesStore()
const { formatPrice } = useFormatter()

// ========================================
// REACTIVE STATE
// ========================================

/** Loading-State für Button-Animation */
const isLoading = ref(false)

// ========================================
// COMPUTED
// ========================================

/**
 * Produktpreis als Zahl für Vergleiche
 */
const productPrice = computed(() => parseFloat(props.product.price))

/**
 * Kann User sich dieses Produkt leisten?
 */
const canAfford = computed(() => props.userBalance >= productPrice.value)

/**
 * Ist Produkt auf Lager? (FEAT-12)
 */
const isInStock = computed(() => (props.product.stock ?? 0) > 0)

/**
 * Ist Bestand niedrig? (<=3 Stück) (FEAT-12)
 */
const isLowStock = computed(() => {
  const stock = props.product.stock ?? 0
  return stock > 0 && stock <= 3
})

/**
 * Button-Disabled-State
 * 
 * Button ist deaktiviert wenn:
 * - Nicht genug Guthaben
 * - Produkt ausverkauft
 * - Loading-State aktiv
 */
const isDisabled = computed(() => {
  return !canAfford.value || !isInStock.value || isLoading.value
})

/**
 * Button-Text dynamisch
 */
const buttonText = computed(() => {
  if (isLoading.value) return 'Wird gekauft...'
  if (!isInStock.value) return 'Ausverkauft'
  if (!canAfford.value) return 'Zu wenig Guthaben'
  return 'Kaufen'
})

/**
 * Button-Farbe dynamisch
 * 
 * - Grün: Normal (kann kaufen)
 * - Gelb: Low Stock (Warnung)
 * - Grau: Deaktiviert (nicht kaufbar)
 */
const buttonClass = computed(() => {
  if (isDisabled.value) {
    return 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }
  
  if (isLowStock.value) {
    return 'bg-yellow-500 text-white hover:bg-yellow-600'
  }
  
  return 'bg-green-600 text-white hover:bg-green-700'
})

// ========================================
// METHODS
// ========================================

/**
 * Kauft das Produkt (One-Touch)
 * 
 * @description
 * Ablauf:
 * 1. Button deaktivieren (Loading-State)
 * 2. API-Call via Store
 * 3. Bei Erfolg: Success-Modal öffnen
 * 4. Bei Fehler: Toast mit Fehlermeldung
 */
async function handlePurchase() {
  // Debounce: Verhindert Doppelklicks
  if (isLoading.value) return

  isLoading.value = true

  try {
    const result = await purchasesStore.purchase(props.product.id)

    if (result.success) {
      // Erfolg: Modal öffnen
      emit('purchaseSuccess')
    } else {
      // Fehler: Toast anzeigen
      showErrorToast(result.error)
    }
  } catch (err) {
    // Netzwerk-Fehler
    showErrorToast('Verbindungsfehler. Bitte erneut versuchen.')
  } finally {
    isLoading.value = false
  }
}

/**
 * Zeigt Fehler-Toast
 * 
 * @param message - Fehlermeldung
 */
function showErrorToast(message: string) {
  // TODO: Toast-Notification-System integrieren
  // Für MVP: Browser-Alert (kann später durch toast-Library ersetzt werden)
  alert(`❌ ${message}`)
}
</script>

<template>
  <div class="mt-3">
    <!-- Low-Stock-Warnung (FEAT-12) -->
    <div
      v-if="isLowStock"
      class="text-xs text-yellow-600 mb-1 font-medium"
    >
      ⚠️ Nur noch {{ product.stock }} Stück verfügbar
    </div>

    <!-- Kaufen-Button -->
    <button
      @click="handlePurchase"
      :disabled="isDisabled"
      :class="[
        'w-full py-2 px-4 rounded-lg font-medium transition-all text-sm',
        buttonClass
      ]"
      :aria-label="`${product.name} für ${formatPrice(product.price)} Euro kaufen`"
    >
      <!-- Loading-Spinner -->
      <span v-if="isLoading" class="inline-block animate-spin mr-2">⏳</span>
      
      {{ buttonText }}
    </button>

    <!-- Bonuspunkte-Hinweis -->
    <div
      v-if="isInStock && canAfford"
      class="text-xs text-muted-foreground mt-1 text-center"
    >
      🏆 Bonuspunkte sammeln
    </div>
  </div>
</template>
