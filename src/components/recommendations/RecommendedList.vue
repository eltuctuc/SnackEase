<!--
  RecommendedList - Top-10 Produktliste mit Empfehlungsanzahl-Badge (FEAT-18)

  Laedt beim Aktivieren (via onMounted) die Top-10-Empfehlungsliste.
  Zeigt Empfehlungsanzahl-Badge neben jeder Produktkarte.
  Herz-Icon (FavoriteIcon) ist ebenfalls auf den Karten vorhanden.

  @component
-->

<script setup lang="ts">
import { useRecommendationsStore } from '~/stores/recommendations'
import { useFavoritesStore } from '~/stores/favorites'
import FavoriteIcon from '~/components/recommendations/FavoriteIcon.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import type { Product } from '~/types'

// ========================================
// EMITS
// ========================================

const emit = defineEmits<{
  productClick: [product: Product]
}>()

// ========================================
// STORES & COMPOSABLES
// ========================================

const recommendationsStore = useRecommendationsStore()
const favoritesStore = useFavoritesStore()
const { formatPrice } = useFormatter()

// ========================================
// LIFECYCLE
// ========================================

onMounted(async () => {
  // Lazy-Loading: Nur laden wenn noch keine Daten vorhanden
  if (recommendationsStore.products.length === 0 && !recommendationsStore.isLoading) {
    await recommendationsStore.fetchTopRecommendations()
  }
})

// ========================================
// METHODS
// ========================================

const handleFavoriteToggle = (productId: number) => {
  const product = recommendationsStore.products.find(p => p.id === productId)
  if (product) {
    favoritesStore.toggleFavorite(productId, product)
  }
}

const handleProductClick = (product: Product) => {
  emit('productClick', product)
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="recommendationsStore.isLoading" class="py-8 text-center">
    <p class="text-muted-foreground text-sm">Empfehlungen werden geladen...</p>
  </div>

  <!-- Error State -->
  <div v-else-if="recommendationsStore.error" class="py-8 text-center">
    <p class="text-sm text-red-500">{{ recommendationsStore.error }}</p>
  </div>

  <!-- Empty State (EC-5) -->
  <EmptyState
    v-else-if="recommendationsStore.products.length === 0"
    icon="thumb-up"
    title="Noch keine Empfehlungen"
    description="Oeffne ein Produkt und tippe auf 'Empfehlen', um die erste Empfehlung abzugeben."
  />

  <!-- Produktliste -->
  <div v-else class="space-y-3">
    <div
      v-for="(product, index) in recommendationsStore.products"
      :key="product.id"
      class="flex items-center gap-3 bg-background border border-border rounded-lg p-3 hover:border-primary/40 transition-all"
    >
      <!-- Rang-Badge -->
      <div
        class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        :class="[
          index === 0 ? 'bg-yellow-100 text-yellow-700' :
          index === 1 ? 'bg-gray-100 text-gray-600' :
          index === 2 ? 'bg-orange-100 text-orange-600' :
          'bg-muted text-muted-foreground'
        ]"
        aria-hidden="true"
      >
        {{ index + 1 }}
      </div>

      <!-- Produktbild (klickbar) -->
      <div
        class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer overflow-hidden"
        @click="handleProductClick(product)"
        :aria-label="`${product.name} Details anzeigen`"
        role="button"
        tabindex="0"
        @keydown.enter="handleProductClick(product)"
      >
        <span v-if="!product.imageUrl" aria-hidden="true">🍎</span>
        <img
          v-else
          :src="product.imageUrl"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Produktinfo (klickbar) -->
      <div
        class="flex-1 min-w-0 cursor-pointer"
        @click="handleProductClick(product)"
        role="button"
        :aria-label="`${product.name} Details anzeigen`"
        tabindex="-1"
      >
        <h4 class="font-medium text-foreground text-sm truncate">{{ product.name }}</h4>
        <div class="flex items-center gap-2 mt-0.5">
          <!-- Preis -->
          <template v-if="product.activeOffer">
            <s class="text-xs text-muted-foreground">{{ formatPrice(product.price) }}</s>
            <span class="text-sm font-bold text-red-500">
              {{ formatPrice(product.activeOffer.discountedPrice) }}
            </span>
          </template>
          <template v-else>
            <span class="text-sm font-bold text-primary">{{ formatPrice(product.price) }}</span>
          </template>
        </div>
      </div>

      <!-- Empfehlungsanzahl-Badge (REQ-12) -->
      <div class="flex items-center gap-1 text-primary flex-shrink-0">
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <path
            d="M9.312 2.995A2.034 2.034 0 005.776.992L3 5.354V12.5A2.5 2.5 0 005.5 15h5a2.5 2.5 0 002-1l2.5-3.333V7.5A2.5 2.5 0 0012.5 5H8.309l1.003-2.005zM0 5v10h1V5H0z"
            fill="currentColor"
          />
        </svg>
        <span class="text-xs font-semibold">{{ product.recommendationCount }}</span>
      </div>

      <!-- Favoriten-Icon -->
      <FavoriteIcon
        :product-id="product.id"
        :is-favorite="favoritesStore.isFavorite(product.id)"
        @toggle="handleFavoriteToggle"
      />
    </div>
  </div>
</template>
