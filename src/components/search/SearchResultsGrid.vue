<!--
  SearchResultsGrid - Produktkarten-Liste für /search (FEAT-19)

  Layout: Einspaltiges Full-Width-Layout (Listenansicht laut Wireframe).
  Produktbild 56x56px links, Name+Preis mitte, Favoriten-Icon+Warenkorb-Button rechts.

  Ladezustand: Skeleton-Cards (animate-pulse, bg-muted)
  Leerer Zustand: EmptyState.vue mit optionalem "Filter zurücksetzen"-Link

  EC-8: Warenkorb-Button-Klick verhindert Öffnung des ProductDetailModal (click.stop)
  EC-9: Favoriten-Icon-Klick verhindert Öffnung des ProductDetailModal (click.stop in FavoriteIcon)

  @component
-->

<script setup lang="ts">
import type { Product } from '~/types'
import EmptyState from '~/components/shared/EmptyState.vue'
import FavoriteIcon from '~/components/recommendations/FavoriteIcon.vue'
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'

// ========================================
// COMPOSABLES & STORES
// ========================================

const { formatPrice } = useFormatter()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()

// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  /** Produktliste (Suchergebnisse) */
  products: Product[]
  /** true während API-Call */
  isLoading: boolean
  /** true wenn mindestens ein Filter aktiv (für EmptyState-CTA) */
  hasActiveFilters: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Produkt angeklickt → ProductDetailModal öffnen */
  productClick: [product: Product]
  /** "Filter zurücksetzen" geklickt */
  resetFilters: []
}>()

// ========================================
// METHODEN
// ========================================

const handleProductClick = (product: Product) => {
  emit('productClick', product)
}

const handleFavoriteToggle = (productId: number) => {
  const product = props.products.find(p => p.id === productId)
  if (product) {
    favoritesStore.toggleFavorite(productId, product)
  }
}

/**
 * Warenkorb-Aktion (EC-8: Event-Propagation wird im Template via @click.stop gestoppt)
 */
const handleAddToCart = (product: Product) => {
  if ((product.stock ?? 0) <= 0) return

  const isInCart = cartStore.hasProduct(product.id)
  if (isInCart) {
    const qty = cartStore.getQuantity(product.id)
    cartStore.updateQuantity(product.id, qty + 1)
  } else {
    cartStore.addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.imageUrl || undefined,
    })
  }
}

const handleRemoveFromCart = (product: Product) => {
  const qty = cartStore.getQuantity(product.id)
  cartStore.updateQuantity(product.id, qty - 1)
}

// ========================================
// SKELETON
// ========================================

/** Anzahl angezeigter Skeleton-Cards */
const SKELETON_COUNT = 5

// ========================================
// SVG-PFADE (Teenyicons v0.4.1)
// ========================================

/** outline/shopping-bag.svg – für Warenkorb-Button */
const shoppingBagPath = 'M3.5 4.5h8l1 9H2.5l1-9zm2-2a2 2 0 114 0'

/** Minus für Mengenverringerung */
const minusPath = 'M2.5 7.5h10'

/** Plus für Mengenerhöhung */
const plusPath = 'M7.5 2.5v10m-5-5h10'
</script>

<template>
  <div>

    <!-- Ladezustand: Skeleton-Cards (sofort nach Debounce-Trigger sichtbar) -->
    <div v-if="isLoading" class="flex flex-col gap-3" aria-busy="true" aria-label="Produkte werden geladen">
      <div
        v-for="n in SKELETON_COUNT"
        :key="n"
        class="flex items-center gap-3 p-3 bg-card border border-border rounded-xl animate-pulse"
      >
        <!-- Bildplatzhalter 56x56 -->
        <div class="w-14 h-14 rounded-lg bg-muted flex-shrink-0" />
        <!-- Textplatzhalter -->
        <div class="flex-1 min-w-0 space-y-2">
          <div class="h-4 bg-muted rounded w-3/5" />
          <div class="h-3 bg-muted rounded w-2/5" />
        </div>
        <!-- Button-Platzhalter -->
        <div class="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
      </div>
    </div>

    <!-- Leerer Zustand (nur nach abgeschlossenem API-Call anzeigen) -->
    <div
      v-else-if="products.length === 0"
      aria-live="polite"
    >
      <EmptyState
        icon="info"
        title="Kein Produkt gefunden"
        description="Versuche einen anderen Suchbegriff oder passe die Filter an."
      />
      <!-- "Filter zurücksetzen"-Link (nur wenn Filter aktiv, REQ-31) -->
      <div v-if="hasActiveFilters" class="flex justify-center mt-2 pb-4">
        <button
          type="button"
          class="text-sm text-accent font-medium hover:underline focus:outline-none focus-visible:underline"
          @click="emit('resetFilters')"
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>

    <!-- Ergebnisliste (Listenansicht laut Wireframe) -->
    <div
      v-else
      class="flex flex-col gap-3"
      aria-live="polite"
      aria-label="Suchergebnisse"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors cursor-pointer min-h-[72px]"
        data-testid="search-result-card"
        @click="handleProductClick(product)"
      >

        <!-- Produktbild (56x56px, laut Wireframe + UX Expert Review) -->
        <div class="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-2xl"
            aria-hidden="true"
          >
            🍎
          </div>
        </div>

        <!-- Produkt-Info (Name, Preis, Badges) -->
        <div class="flex-1 min-w-0">
          <p class="font-medium text-foreground text-sm truncate">{{ product.name }}</p>

          <!-- Preis (mit Angebotspreis falls vorhanden, FEAT-14) -->
          <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
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

          <!-- Vegan/GF Badges -->
          <div class="flex gap-1 mt-1">
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
          </div>
        </div>

        <!-- Aktionsbereich (nur für Mitarbeiter) -->
        <div
          v-if="!authStore.isAdmin"
          class="flex flex-col items-center gap-1.5 flex-shrink-0"
          @click.stop
        >
          <!-- FEAT-18: Favoriten-Icon (EC-9: FavoriteIcon hat eigenes click.stop) -->
          <FavoriteIcon
            :product-id="product.id"
            :is-favorite="favoritesStore.isFavorite(product.id)"
            @toggle="handleFavoriteToggle"
          />

          <!-- Warenkorb: +/- wenn bereits im Warenkorb, sonst Tasche-Icon (EC-8: click.stop) -->
          <template v-if="(product.stock ?? 0) > 0">
            <!-- Produkt bereits im Warenkorb: Mengensteuerung -->
            <div
              v-if="cartStore.hasProduct(product.id)"
              class="flex items-center gap-1"
            >
              <button
                type="button"
                class="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                aria-label="Menge verringern"
                @click.stop="handleRemoveFromCart(product)"
              >
                <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5">
                  <path :d="minusPath" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
              <span class="w-5 text-center text-sm font-medium text-foreground">
                {{ cartStore.getQuantity(product.id) }}
              </span>
              <button
                type="button"
                class="w-7 h-7 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors"
                aria-label="Menge erhöhen"
                @click.stop="handleAddToCart(product)"
              >
                <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5">
                  <path :d="plusPath" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <!-- Produkt noch nicht im Warenkorb: Warenkorb-Button -->
            <button
              v-else
              type="button"
              class="w-9 h-9 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors"
              :aria-label="`${product.name} in den Warenkorb legen`"
              data-testid="add-to-cart-button"
              @click.stop="handleAddToCart(product)"
            >
              <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4">
                <path :d="shoppingBagPath" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </template>

          <!-- Ausverkauft: deaktivierter Button -->
          <div
            v-else
            class="text-xs text-red-500 font-medium text-center whitespace-nowrap"
          >
            Ausverkauft
          </div>
        </div>

      </div>
    </div>

  </div>
</template>
