<!--
  ProductGrid - Produktkatalog mit Suche und Kategorie-Filtern

  Diese Komponente zeigt:
  - Suchfeld mit Enter-Key-Support
  - Kategorie-Filter-Buttons
  - Grid-Layout mit Produktkarten
  - Loading- und Error-States
  - Empty-State bei keinen Ergebnissen
  - PurchaseButton auf jeder Produktkarte (FEAT-16)

  @component
-->

<script setup lang="ts">
import type { Product, ProductCategoryOption } from '~/types'
import PurchaseButton from './PurchaseButton.vue'
import FavoriteIcon from '~/components/recommendations/FavoriteIcon.vue'

// ========================================
// COMPOSABLES
// ========================================

/** useFormatter für Preis-Formatierung */
const { formatPrice } = useFormatter()

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props für ProductGrid
 *
 * @property products - Liste der anzuzeigenden Produkte
 * @property categories - Verfügbare Kategorien mit Icons
 * @property selectedCategory - Aktuell ausgewählte Kategorie
 * @property isLoading - Loading-State während API-Call
 * @property error - Fehlermeldung (null = kein Fehler)
 */
interface Props {
  products: Product[]
  categories: ProductCategoryOption[]
  selectedCategory: string
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
 * @event select-category - User hat Kategorie gewählt
 * @event search - User hat Suche getriggert (Enter oder Button)
 * @event product-click - User hat auf Produkt geklickt (für Detail-Ansicht)
 */
const emit = defineEmits<{
  selectCategory: [category: string]
  search: [query: string]
  productClick: [product: Product]
}>()

// ========================================
// COMPOSABLES & STORES
// ========================================

const authStore = useAuthStore()
// FEAT-18: Favoriten-Store fuer Herz-Icons
const favoritesStore = useFavoritesStore()

// ========================================
// REACTIVE STATE
// ========================================

/** Suchbegriff-Input */
const searchQuery = ref('')

// ========================================
// METHODS
// ========================================

/**
 * Triggert Suche
 * 
 * Wird aufgerufen durch:
 * - Enter-Taste im Suchfeld
 * - Klick auf "Suchen"-Button
 */
const handleSearch = () => {
  emit('search', searchQuery.value)
}

/**
 * Setzt Kategorie-Filter
 * 
 * @param category - Kategorie-ID (z.B. 'obst', 'shakes')
 */
const selectCategory = (category: string) => {
  emit('selectCategory', category)
}

/**
 * Öffnet Produkt-Detail-Modal
 *
 * @param product - Angeklicktes Produkt
 */
const openProductDetail = (product: Product) => {
  emit('productClick', product)
}

/**
 * FEAT-18: Toggelt Favoriten-Status eines Produkts.
 * Nur fuer Mitarbeiter (nicht fuer Admins).
 *
 * @param productId - Produkt-ID
 */
const handleFavoriteToggle = (productId: number) => {
  const product = props.products.find(p => p.id === productId)
  if (product) {
    favoritesStore.toggleFavorite(productId, product)
  }
}
</script>

<template>
  <div class="bg-card rounded-lg border p-6" data-testid="product-grid">
    <!-- Header: Suche + Kategorien -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-foreground mb-4">Produktkatalog</h2>
      
      <!-- Suchfeld -->
      <div class="flex flex-col sm:flex-row gap-4 mb-4">
        <div class="relative flex-1">
          <label for="product-search" class="sr-only">Produkte suchen</label>
          <input
            id="product-search"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Produkte suchen..."
            class="w-full px-4 py-2 pl-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
        </div>
        <button
          @click="handleSearch"
          class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Suchen
        </button>
      </div>

      <!-- Kategorie-Filter -->
      <div class="flex flex-wrap gap-2" role="group" aria-label="Kategorien auswählen">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            selectedCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-primary/20'
          ]"
        >
          {{ category.icon }} {{ category.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-muted-foreground">Produkte werden geladen...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-12">
      <p class="text-muted-foreground">Keine Produkte gefunden.</p>
    </div>

    <!-- Produkt-Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-background border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all"
        data-testid="product-card"
      >
        <!-- Produktbild oder Fallback-Icon (klickbar für Detail-Ansicht) -->
        <div
          @click="openProductDetail(product)"
          class="cursor-pointer"
        >
          <div class="relative aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center text-4xl">
            <span v-if="!product.imageUrl" aria-hidden="true">🍎</span>
            <img
              v-else
              :src="product.imageUrl"
              :alt="product.name"
              class="w-full h-full object-cover rounded-lg"
            />
            <!-- FEAT-18: FavoriteIcon (nur fuer Mitarbeiter, nicht fuer Admins) -->
            <div
              v-if="!authStore.isAdmin"
              class="absolute top-1 right-1"
              @click.stop
            >
              <FavoriteIcon
                :product-id="product.id"
                :is-favorite="favoritesStore.isFavorite(product.id)"
                @toggle="handleFavoriteToggle"
              />
            </div>
          </div>
          
          <!-- Produktname -->
          <h3 class="font-medium text-foreground text-sm truncate">{{ product.name }}</h3>
          
          <!-- Preis + Stock-Status -->
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <!-- FEAT-14: Angebotspreis-Anzeige -->
            <template v-if="product.activeOffer">
              <s class="text-sm text-muted-foreground">{{ formatPrice(product.price) }} €</s>
              <span class="text-lg font-bold text-red-500" data-testid="product-price">
                {{ formatPrice(product.activeOffer.discountedPrice) }} €
              </span>
            </template>
            <template v-else>
              <span class="text-lg font-bold text-primary" data-testid="product-price">{{ formatPrice(product.price) }} €</span>
            </template>
            <span v-if="product.stock === 0" class="text-xs text-red-500">Ausverkauft</span>
          </div>
          
          <!-- Badges (Vegan, Glutenfrei) -->
          <div class="flex gap-1 mt-2">
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

        <!-- FEAT-16: Purchase Button (nur für Mitarbeiter) -->
        <PurchaseButton
          v-if="!authStore.isAdmin"
          :product="product"
        />

        <!-- Admin: Info-Text statt Kauf-Button -->
        <p v-else class="text-sm text-muted-foreground text-center mt-3">
          Nur zur Information
        </p>
      </div>
    </div>
  </div>
</template>
