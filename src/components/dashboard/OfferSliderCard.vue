<!--
  OfferSliderCard - Einzelne Angebots-Karte im Querslider

  Zeigt:
  - Produktbild (quadratisch, abgerundete Ecken) oder Platzhalter
  - Rabatt-Badge ("-20%" oder "-0,50 EUR")
  - Produktname (max. 2 Zeilen, abgeschnitten)
  - Angebotspreis (hervorgehoben)
  - "In den Warenkorb"-Button (Teenyicons cart-Ikon)

  Events:
  - open-detail: Klick auf Kartenflaeche oeffnet ProductDetailModal
  - add-to-cart:  Klick auf Warenkorb-Button legt Produkt in Warenkorb

  @component
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'
import { useFormatter } from '~/composables/useFormatter'

// ========================================
// COMPOSABLES
// ========================================

const { formatPrice } = useFormatter()

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props fuer OfferSliderCard
 *
 * @property product - Produkt-Objekt mit activeOffer (darf nicht null sein)
 */
interface Props {
  product: Product & {
    activeOffer: NonNullable<Product['activeOffer']>
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'open-detail': [product: Product]
  'add-to-cart': [product: Product]
}>()

// ========================================
// COMPUTED
// ========================================

/**
 * Berechnet den anzuzeigenden Badge-Text
 *
 * discountType "percent"   => "-20%"
 * discountType "absolute"  => "-0,50 EUR"
 */
const badgeText = computed<string>(() => {
  const { discountType, discountValue } = props.product.activeOffer
  if (discountType === 'percent') {
    return `-${discountValue}%`
  }
  // Absolute: auf 2 Dezimalstellen, DE-Formatierung
  const num = parseFloat(discountValue)
  return `-${num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
})

/**
 * ARIA-Label fuer den Badge (fuer Screenreader verstaendlich)
 */
const badgeAriaLabel = computed<string>(() => {
  const { discountType, discountValue } = props.product.activeOffer
  if (discountType === 'percent') {
    return `${discountValue} Prozent Rabatt`
  }
  const num = parseFloat(discountValue)
  return `${num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euro Rabatt`
})

/**
 * Angebotspreis als formatierter String
 *
 * Der Server liefert bereits den berechneten Angebotspreis in activeOffer.discountedPrice.
 */
const offerPrice = computed<string>(() => {
  const discounted = parseFloat(props.product.activeOffer.discountedPrice)
  return formatPrice(discounted)
})

// ========================================
// EVENT HANDLER
// ========================================

/**
 * Klick auf die Kartenflaeche oeffnet das Detail-Modal.
 * Klick auf den Warenkorb-Button wird von diesem Handler NICHT behandelt
 * (Button stoppt die Event-Propagation).
 */
const handleCardClick = () => {
  emit('open-detail', props.product)
}

/**
 * Klick auf den Warenkorb-Button legt das Produkt in den Warenkorb.
 * Event-Propagation wird gestoppt damit kein Detail-Modal geöffnet wird.
 */
const handleAddToCart = (event: Event) => {
  event.stopPropagation()
  emit('add-to-cart', props.product)
}
</script>

<template>
  <!--
    Karte als button-Element fuer vollstaendige Tastatur-Zugaenglichkeit.
    scroll-snap-align: start sorgt fuer sauberes Snap beim Scrollen.
  -->
  <button
    type="button"
    class="
      relative flex flex-col
      bg-card border border-border rounded-xl
      overflow-hidden cursor-pointer
      text-left
      transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      snap-start shrink-0
    "
    :aria-label="`${product.name} — Angebot anzeigen`"
    @click="handleCardClick"
    @keydown.enter="handleCardClick"
    @keydown.space.prevent="handleCardClick"
  >
    <!-- Produktbild-Bereich (quadratisch) -->
    <div class="relative w-full aspect-square bg-muted overflow-hidden">
      <!-- Produktbild -->
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />

      <!-- Platzhalter wenn kein Bild vorhanden (EC-4) -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-muted"
        aria-hidden="true"
      >
        <span class="text-4xl select-none">🍎</span>
      </div>

      <!-- Rabatt-Badge oben rechts -->
      <span
        class="
          absolute top-2 right-2
          bg-red-500 text-white text-xs font-bold
          px-2 py-1 rounded-full
          leading-none
        "
        :aria-label="badgeAriaLabel"
      >
        {{ badgeText }}
      </span>
    </div>

    <!-- Karten-Inhalt: Name, Preis, Button -->
    <div class="flex flex-col gap-1 p-2 flex-1">
      <!-- Produktname (max. 2 Zeilen, abgeschnitten per CSS — EC-6) -->
      <p class="text-xs font-medium text-foreground line-clamp-2 leading-tight">
        {{ product.name }}
      </p>

      <!-- Angebotspreis -->
      <p class="text-sm font-bold text-primary">
        {{ offerPrice }} €
      </p>
    </div>

    <!-- Warenkorb-Button (Teenyicons cart.svg) -->
    <div class="px-2 pb-2">
      <button
        type="button"
        class="
          w-full flex items-center justify-center
          min-h-[44px] min-w-[44px]
          bg-primary/10 hover:bg-primary/20
          text-primary rounded-lg
          transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
        "
        :aria-label="`${product.name} in den Warenkorb legen`"
        @click="handleAddToCart"
        @keydown.enter.stop="handleAddToCart"
        @keydown.space.stop.prevent="handleAddToCart"
      >
        <!-- Teenyicons cart.svg inline -->
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          aria-hidden="true"
        >
          <path
            d="M.5.5l.6 2m0 0l2.4 8h11v-6a2 2 0 00-2-2H1.1zm11.4 12a1 1 0 110-2 1 1 0 010 2zm-8-1a1 1 0 112 0 1 1 0 01-2 0z"
            stroke="currentColor"
          />
        </svg>
      </button>
    </div>
  </button>
</template>
