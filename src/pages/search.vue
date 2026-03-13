<script setup lang="ts">
/**
 * /search — Erweiterte Suche (FEAT-19)
 *
 * Vollständige Suchseite mit:
 * - Echtzeit-Suche mit 300ms Debounce (useSearch.ts)
 * - Filter-Chips: Kategorie, Verfügbarkeit, Preis, Ernährung
 * - Sortierung: Relevanz, Preis aufsteigend, Preis absteigend
 * - Listenansicht mit Produktkarten (FavoriteIcon + Warenkorb)
 * - ProductDetailModal für Produktdetails
 *
 * Lokaler Komponenten-State (kein Pinia-Store, EC-10: kein Persistieren).
 */

import type { Product } from '~/types'
import SearchInput from '~/components/search/SearchInput.vue'
import FilterChips from '~/components/search/FilterChips.vue'
import SortSelector from '~/components/search/SortSelector.vue'
import SearchResultsGrid from '~/components/search/SearchResultsGrid.vue'

// ========================================
// LOKALE TYPEN
// ========================================

type SortByValue = 'relevance' | 'price_asc' | 'price_desc'
import ProductDetailModal from '~/components/dashboard/ProductDetailModal.vue'
import { useSearch } from '~/composables/useSearch'
import { useFavoritesStore } from '~/stores/favorites'

// ========================================
// STORES & COMPOSABLES
// ========================================

const favoritesStore = useFavoritesStore()

// ========================================
// LOKALER FILTER-STATE
// ========================================

/** Kategorie-Filter ('' = Alle) */
const selectedCategory = ref<string>('')
/** Nur vorrätige Produkte */
const onlyInStock = ref<boolean>(false)
/** Preis-Untergrenze (null = kein Filter) */
const minPrice = ref<number | null>(null)
/** Preis-Obergrenze (null = kein Filter) */
const maxPrice = ref<number | null>(null)
/** Vegan-Filter */
const isVegan = ref<boolean>(false)
/** Glutenfrei-Filter */
const isGlutenFree = ref<boolean>(false)

// ========================================
// SORTIERUNG
// ========================================

/** Aktive Sortierung (Standard: Relevanz) */
const sortBy = ref<SortByValue>('relevance')

// ========================================
// SUCHERGEBNISSE
// ========================================

/** Produkte aus dem API-Call */
const products = ref<Product[]>([])
/** true während API-Call */
const isLoading = ref<boolean>(false)
/** Ausgewähltes Produkt für ProductDetailModal */
const selectedProduct = ref<Product | null>(null)
/** true wenn Modal geöffnet */
const showModal = ref<boolean>(false)

// ========================================
// COMPUTED
// ========================================

/**
 * hasActiveFilters — true wenn mindestens ein Filter (außer Kategorie "Alle") aktiv ist.
 * Steuert Sichtbarkeit des "Filter zurücksetzen"-Buttons (REQ-31).
 */
const hasActiveFilters = computed((): boolean => {
  return (
    selectedCategory.value !== '' ||
    onlyInStock.value ||
    minPrice.value !== null ||
    maxPrice.value !== null ||
    isVegan.value ||
    isGlutenFree.value
  )
})

// ========================================
// SUCHE & API
// ========================================

/**
 * Führt API-Call durch mit allen aktiven Filtern und Sortierung.
 * Wird vom useSearch Composable (Debounce) und bei Filter-Änderungen aufgerufen.
 *
 * @param queryText - Aktueller Suchbegriff
 */
const performSearch = async (queryText: string) => {
  isLoading.value = true

  try {
    // Query-Parameter zusammenstellen
    const params: Record<string, string> = {}

    // Suchbegriff (q-Parameter, FEAT-19)
    if (queryText.trim()) {
      params.q = queryText.trim()
    }

    // Kategorie-Filter
    if (selectedCategory.value && selectedCategory.value !== '') {
      params.category = selectedCategory.value
    }

    // Verfügbarkeits-Filter
    if (onlyInStock.value) {
      params.inStock = 'true'
    }

    // Preis-Filter
    if (minPrice.value !== null) {
      params.minPrice = minPrice.value.toString()
    }
    if (maxPrice.value !== null) {
      params.maxPrice = maxPrice.value.toString()
    }

    // Ernährungs-Filter
    if (isVegan.value) {
      params.isVegan = 'true'
    }
    if (isGlutenFree.value) {
      params.isGlutenFree = 'true'
    }

    // Sortierung (nur wenn nicht Standard oder Suchbegriff vorhanden)
    if (sortBy.value !== 'relevance') {
      params.sortBy = sortBy.value
    } else if (queryText.trim()) {
      params.sortBy = 'relevance'
    }

    products.value = await $fetch<Product[]>('/api/products', { params })
  } catch (error) {
    console.error('Suche fehlgeschlagen:', error)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

// ========================================
// useSearch COMPOSABLE (Debounce für Texteingabe)
// ========================================

/**
 * Wiederverwendung von useSearch.ts (FEAT-6, FEAT-19).
 * autoSearch: true → watchDebounced mit 300ms.
 * onSearch-Callback: führt API-Call mit aktuellem Suchtext aus.
 */
const { query, clearQuery } = useSearch({
  autoSearch: true,
  debounceMs: 300,
  onSearch: (q) => {
    performSearch(q)
  },
})

// ========================================
// WATCHER: Filter-Änderungen → sofortige Suche (kein Debounce)
// ========================================

/**
 * Alle Filter (außer Suchtext) lösen sofortige Suche aus.
 * Kein Debounce nötig da kein Tastendruck-Szenario.
 */
watch([selectedCategory, onlyInStock, minPrice, maxPrice, isVegan, isGlutenFree, sortBy], () => {
  performSearch(query.value)
})

// ========================================
// METHODEN
// ========================================

/**
 * Produktkarte geklickt → ProductDetailModal öffnen (AC-16)
 */
const handleProductClick = (product: Product) => {
  selectedProduct.value = product
  showModal.value = true
}

/**
 * Modal schließen
 */
const handleModalClose = () => {
  showModal.value = false
  selectedProduct.value = null
}

/**
 * Alle Filter zurücksetzen (REQ-32).
 * Suchbegriff bleibt erhalten.
 */
const resetFilters = () => {
  selectedCategory.value = ''
  onlyInStock.value = false
  minPrice.value = null
  maxPrice.value = null
  isVegan.value = false
  isGlutenFree.value = false
  sortBy.value = 'relevance'
  // Sofortige Suche mit aktuellem Suchtext und ohne Filter
  performSearch(query.value)
}

// ========================================
// LIFECYCLE
// ========================================

onMounted(async () => {
  // Initiale Suche (zeigt alle Produkte an)
  await performSearch('')

  // Favoriten laden (falls noch nicht geladen)
  if (favoritesStore.favorites.length === 0) {
    await favoritesStore.fetchFavorites()
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background">

    <!-- Seiten-Header -->
    <div class="px-4 pt-4 pb-2">
      <h1 class="text-xl font-bold text-foreground mb-4">Suche</h1>

      <!-- Suchfeld (REQ-1–REQ-5) -->
      <SearchInput
        v-model="query"
        placeholder="Produkte suchen..."
        @clear="clearQuery"
      />
    </div>

    <!-- Filter-Chips (REQ-8–REQ-18) -->
    <div class="px-4 py-2">
      <FilterChips
        v-model:selected-category="selectedCategory"
        v-model:only-in-stock="onlyInStock"
        v-model:min-price="minPrice"
        v-model:max-price="maxPrice"
        v-model:is-vegan="isVegan"
        v-model:is-gluten-free="isGlutenFree"
      />

      <!-- "Filter zurücksetzen"-Button (REQ-31/32) -->
      <div v-if="hasActiveFilters" class="flex justify-end mt-2">
        <button
          type="button"
          class="text-xs text-accent font-medium hover:underline focus:outline-none focus-visible:underline"
          @click="resetFilters"
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>

    <!-- Sortierung + Ergebniszähler -->
    <div class="px-4 py-2">
      <div class="flex items-center gap-3">
        <!-- Ergebnis-Zähler -->
        <p
          v-if="!isLoading"
          class="text-xs text-muted-foreground flex-shrink-0"
          aria-live="polite"
        >
          {{ products.length }} {{ products.length === 1 ? 'Ergebnis' : 'Ergebnisse' }}
        </p>
        <div class="flex-1" />
        <!-- Sortierungs-Umschalter (REQ-25–REQ-30) -->
        <div class="w-full max-w-[260px]">
          <SortSelector v-model="sortBy" />
        </div>
      </div>
    </div>

    <!-- Suchergebnisse -->
    <div class="flex-1 px-4 pb-24">
      <SearchResultsGrid
        :products="products"
        :is-loading="isLoading"
        :has-active-filters="hasActiveFilters"
        @product-click="handleProductClick"
        @reset-filters="resetFilters"
      />
    </div>

    <!-- ProductDetailModal (REQ-21, AC-16) -->
    <ProductDetailModal
      :show="showModal"
      :product="selectedProduct"
      @close="handleModalClose"
    />

  </div>
</template>
