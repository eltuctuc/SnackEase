<!--
  OffersSlider - Horizontaler Querslider fuer aktive Angebote

  Zeigt alle Produkte mit aktivem Angebot in einem scrollbaren Slider.
  Blendet sich vollstaendig aus wenn:
  - Noch geladen wird (zeigt Skeleton)
  - Keine Produkte mit activeOffer !== null vorhanden sind

  Responsiv:
  - Mobile (<768px):  2,5 Karten sichtbar (horizontaler Scroll mit Snap)
  - Tablet (768-1279): 3,5 Karten sichtbar (horizontaler Scroll mit Snap)
  - Desktop (1280px+): Grid, 4 Karten pro Zeile, kein Scroll

  @component
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'
import OfferSliderCard from '~/components/dashboard/OfferSliderCard.vue'

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props fuer OffersSlider
 *
 * @property products   - Alle Produkte (ungefiltert, Filterung passiert intern)
 * @property isLoading  - Ob die Produkte noch geladen werden (zeigt Skeleton)
 */
interface Props {
  products: Product[]
  isLoading: boolean
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
 * Filtert alle Produkte auf diejenigen mit aktivem Angebot.
 * Der Server liefert activeOffer nur wenn das Angebot serverseitig aktiv ist.
 * Clientseitig pruefen wir nur ob activeOffer !== null.
 */
const offerProducts = computed(() => {
  return props.products.filter(
    (p): p is Product & { activeOffer: NonNullable<Product['activeOffer']> } =>
      p.activeOffer != null,
  )
})

/**
 * Slider soll nur angezeigt werden wenn mindestens ein Angebot vorhanden ist
 * oder noch geladen wird (Skeleton).
 */
const hasOffers = computed(() => offerProducts.value.length > 0)

// ========================================
// EVENT HANDLER
// ========================================

const handleOpenDetail = (product: Product) => {
  emit('open-detail', product)
}

const handleAddToCart = (product: Product) => {
  emit('add-to-cart', product)
}
</script>

<template>
  <!--
    Wrapper: Nur sichtbar wenn geladen wird (Skeleton) ODER Angebote vorhanden sind.
    Bei keinen Angeboten und fertig geladen: vollstaendig unsichtbar (AC-2).
  -->
  <section
    v-if="isLoading || hasOffers"
    role="region"
    aria-label="Aktuelle Angebote"
    class="mb-6"
  >
    <!-- Abschnittstitel (semantisches Heading — REQ-7) -->
    <h2 class="text-base font-semibold text-foreground mb-3">
      Aktuelle Angebote
    </h2>

    <!-- Skeleton-Loader waehrend Produkte laden (verhindert Layout-Shift) -->
    <template v-if="isLoading">
      <!--
        Mobile/Tablet: Flex-Zeile mit Skeleton-Karten
        Desktop: Grid mit Skeleton-Karten
      -->
      <div
        class="
          flex gap-3 overflow-hidden
          xl:grid xl:grid-cols-4 xl:overflow-visible
        "
        aria-busy="true"
        aria-label="Angebote werden geladen"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="
            shrink-0 rounded-xl bg-muted animate-pulse
            w-[calc((100%-1.5rem)/2.5)]
            md:w-[calc((100%-2rem)/3.5)]
            xl:w-auto
          "
          style="aspect-ratio: 0.75"
        />
      </div>
    </template>

    <!-- Angebots-Karten -->
    <template v-else>
      <!--
        Slider-Container:
        - Mobile/Tablet: overflow-x scroll + scroll-snap
        - Desktop (xl+): Grid, kein Scroll

        padding-right auf Mobile/Tablet: signalisiert angeschnittene Karte rechts.
        Der negative margin-right gleicht den aeusseren Padding der Seite aus.
      -->
      <div
        class="
          flex gap-3
          overflow-x-auto
          scroll-smooth
          scrollbar-hide
          snap-x snap-mandatory
          xl:grid xl:grid-cols-4 xl:overflow-visible xl:flex-none
        "
        style="-webkit-overflow-scrolling: touch"
      >
        <OfferSliderCard
          v-for="product in offerProducts"
          :key="product.id"
          :product="product"
          class="
            w-[calc((100%-1.5rem)/2.5)]
            md:w-[calc((100%-2rem)/3.5)]
            xl:w-auto
          "
          @open-detail="handleOpenDetail"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
/* Scrollbar verstecken (cross-browser) — nur auf Mobile/Tablet relevant */
.scrollbar-hide {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}
</style>
