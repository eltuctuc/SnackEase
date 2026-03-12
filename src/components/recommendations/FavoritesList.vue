<!--
  FavoritesList - Private Favoriten-Liste des eingeloggten Nutzers (FEAT-18)

  Zeigt eigene Favoriten (neueste zuerst).
  Herz-Icon ermoeglicht direktes Entfernen aus der Liste (EC-11: optimistisches Remove).

  @component
-->

<script setup lang="ts">
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

const favoritesStore = useFavoritesStore()
const { formatPrice } = useFormatter()

// ========================================
// METHODS
// ========================================

const handleFavoriteToggle = (productId: number) => {
  const product = favoritesStore.favorites.find(f => f.id === productId)
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
  <div v-if="favoritesStore.isLoading" class="py-8 text-center">
    <p class="text-muted-foreground text-sm">Favoriten werden geladen...</p>
  </div>

  <!-- Empty State (EC-6) -->
  <EmptyState
    v-else-if="favoritesStore.favorites.length === 0"
    icon="heart"
    title="Noch keine Favoriten"
    description="Tippe auf das Herz-Icon auf einer Produktkarte, um Produkte zu deinen Favoriten hinzuzufuegen."
  />

  <!-- Produktliste (neueste zuerst) -->
  <div v-else class="space-y-3">
    <div
      v-for="product in favoritesStore.favorites"
      :key="product.id"
      class="flex items-center gap-3 bg-background border border-border rounded-lg p-3 hover:border-primary/40 transition-all"
    >
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
        <div class="flex items-center gap-2 mt-0.5 flex-wrap">
          <!-- Preis -->
          <template v-if="product.activeOffer">
            <s class="text-xs text-muted-foreground">{{ formatPrice(product.price) }} €</s>
            <span class="text-sm font-bold text-red-500">
              {{ formatPrice(product.activeOffer.discountedPrice) }} €
            </span>
          </template>
          <template v-else>
            <span class="text-sm font-bold text-primary">{{ formatPrice(product.price) }} €</span>
          </template>

          <!-- Badges -->
          <span
            v-if="product.isVegan"
            class="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded"
          >
            🌱
          </span>
          <span
            v-if="product.isGlutenFree"
            class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded"
          >
            GF
          </span>
          <span
            v-if="product.stock === 0"
            class="text-xs text-red-500"
          >
            Ausverkauft
          </span>
        </div>
      </div>

      <!-- Favorit-Entfernen-Button (EC-11) -->
      <FavoriteIcon
        :product-id="product.id"
        :is-favorite="true"
        @toggle="handleFavoriteToggle"
      />
    </div>
  </div>
</template>
