<!--
  PurchaseButton - Warenkorb-Button (FEAT-16)

  Diese Komponente:
  - Zeigt "In den Warenkorb"-Button oder "+/-" bei bereits vorhandenen Produkten
  - Zeigt Bestand an
  - Nutzt Cart-Store für Warenkorb-Verwaltung

  @component
-->

<script setup lang="ts">
import type { Product } from '~/types'
import { useCartStore } from '~/stores/cart'

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props für PurchaseButton
 *
 * @property product - Produkt das in den Warenkorb gelegt werden soll
 */
interface Props {
  product: Product
}

const props = defineProps<Props>()

/**
 * Events die diese Komponente emits
 *
 * @event added-to-cart - Produkt wurde zum Warenkorb hinzugefügt
 */
const emit = defineEmits<{
  addedToCart: []
}>()

// ========================================
// COMPOSABLES & STORES
// ========================================

const cartStore = useCartStore()

// ========================================
// COMPUTED
// ========================================

/**
 * Ist Produkt im Warenkorb?
 */
const isInCart = computed(() => cartStore.hasProduct(props.product.id))

/**
 * Anzahl dieses Produkts im Warenkorb
 */
const quantityInCart = computed(() => cartStore.getQuantity(props.product.id))

/**
 * Produktpreis als Zahl
 */
const productPrice = computed(() => parseFloat(props.product.price))

/**
 * Ist Produkt auf Lager?
 */
const isInStock = computed(() => (props.product.stock ?? 0) > 0)

/**
 * Ist Bestand niedrig? (<=3 Stück)
 */
const isLowStock = computed(() => {
  const stock = props.product.stock ?? 0
  return stock > 0 && stock <= 3
})

// ========================================
// METHODS
// ========================================

/**
 * Produkt zum Warenkorb hinzufügen
 */
function addToCart() {
  if (!isInStock.value) return

  cartStore.addItem({
    productId: props.product.id,
    name: props.product.name,
    price: productPrice.value,
    image: props.product.imageUrl || undefined
  })

  emit('addedToCart')
}

/**
 * Menge im Warenkorb erhöhen
 */
function incrementQuantity() {
  cartStore.updateQuantity(props.product.id, quantityInCart.value + 1)
}

/**
 * Menge im Warenkorb verringern
 */
function decrementQuantity() {
  cartStore.updateQuantity(props.product.id, quantityInCart.value - 1)
}
</script>

<template>
  <div class="mt-3">
    <!-- Bestandsanzeige -->
    <div
      v-if="!isInStock"
      class="text-xs text-red-600 mb-1 font-medium"
      aria-live="polite"
    >
      Ausverkauft
    </div>
    <div
      v-else-if="isLowStock"
      class="text-xs text-yellow-600 mb-1 font-medium"
      aria-live="polite"
    >
      Nur noch {{ product.stock }} Stück verfügbar
    </div>
    <div
      v-else
      class="text-xs text-green-600 mb-1 font-medium"
    >
      {{ product.stock }} Stück verfügbar
    </div>

    <!-- Wenn Produkt bereits im Warenkorb: +/- Buttons -->
    <div v-if="isInStock && isInCart" class="flex items-center gap-2">
      <button
        @click="decrementQuantity"
        class="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
        aria-label="Menge verringern"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>

      <span class="flex-1 text-center font-medium text-foreground">{{ quantityInCart }}</span>

      <button
        @click="incrementQuantity"
        class="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors"
        aria-label="Menge erhöhen"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- "In den Warenkorb"-Button -->
    <button
      v-else
      @click="addToCart"
      :disabled="!isInStock"
      :class="[
        'w-full py-2 px-4 rounded-lg font-medium transition-all text-sm inline-flex items-center justify-center gap-2',
        isInStock
          ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      ]"
      :aria-label="`${product.name} in den Warenkorb legen`"
      data-testid="add-to-cart-button"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {{ isInStock ? 'In den Warenkorb' : 'Ausverkauft' }}
    </button>
  </div>
</template>
