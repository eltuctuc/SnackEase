<!--
  DashboardTabs - Tab-Umschalter "Empfohlen" / "Favoriten" (FEAT-18)

  Erscheint unterhalb des Angebots-Sliders auf dem Dashboard.
  Standard-Tab: "Empfohlen" (wird nicht persistiert, REQ-5).

  Accessibility (WCAG 2.1 AA):
  - role="tablist" auf Container
  - role="tab" + aria-selected auf jedem Tab-Button
  - role="tabpanel" + aria-labelledby auf Content-Bereich
  - Pfeiltasten-Navigation zwischen Tabs (ARIA Tab Pattern)

  @component
-->

<script setup lang="ts">
import RecommendedList from '~/components/recommendations/RecommendedList.vue'
import FavoritesList from '~/components/recommendations/FavoritesList.vue'
import type { Product } from '~/types'

// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  activeTab: 'recommended' | 'favorites'
}

defineProps<Props>()

const emit = defineEmits<{
  tabChange: [tab: 'recommended' | 'favorites']
  productClick: [product: Product]
}>()

// ========================================
// STORE
// ========================================

const favoritesStore = useFavoritesStore()

// ========================================
// METHODS
// ========================================

const selectTab = (tab: 'recommended' | 'favorites') => {
  emit('tabChange', tab)
}

/**
 * Pfeiltasten-Navigation zwischen Tabs (ARIA Tab Pattern)
 * Links/Rechts wechselt zwischen Tabs.
 */
const handleKeydown = (event: KeyboardEvent, currentTab: 'recommended' | 'favorites') => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    const nextTab = currentTab === 'recommended' ? 'favorites' : 'recommended'
    emit('tabChange', nextTab)
    // Fokus auf neuen Tab setzen
    const tabId = nextTab === 'recommended' ? 'tab-recommended' : 'tab-favorites'
    nextTick(() => {
      document.getElementById(tabId)?.focus()
    })
  }
}

const handleProductClick = (product: Product) => {
  emit('productClick', product)
}
</script>

<template>
  <div class="mt-4 mb-6">
    <!-- Tab-Bar -->
    <div
      role="tablist"
      aria-label="Produktlisten-Ansicht"
      class="flex border-b border-border mb-4"
    >
      <!-- Tab: Empfohlen -->
      <button
        id="tab-recommended"
        role="tab"
        :aria-selected="activeTab === 'recommended'"
        aria-controls="tabpanel-recommended"
        class="flex-1 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        :class="[
          activeTab === 'recommended'
            ? 'text-primary border-b-2 border-primary -mb-px'
            : 'text-muted-foreground hover:text-foreground'
        ]"
        @click="selectTab('recommended')"
        @keydown="handleKeydown($event, 'recommended')"
      >
        Empfohlen
      </button>

      <!-- Tab: Favoriten -->
      <button
        id="tab-favorites"
        role="tab"
        :aria-selected="activeTab === 'favorites'"
        aria-controls="tabpanel-favorites"
        class="flex-1 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset relative"
        :class="[
          activeTab === 'favorites'
            ? 'text-primary border-b-2 border-primary -mb-px'
            : 'text-muted-foreground hover:text-foreground'
        ]"
        @click="selectTab('favorites')"
        @keydown="handleKeydown($event, 'favorites')"
      >
        Favoriten
        <!-- Favoriten-Zaehler als Badge (optional, wenn Favoriten vorhanden) -->
        <span
          v-if="favoritesStore.count > 0"
          class="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          {{ favoritesStore.count }}
        </span>
      </button>
    </div>

    <!-- Favoriten-Limit Fehlermeldung (REQ-17, Accessibility: role=alert) -->
    <div
      v-if="favoritesStore.limitError"
      role="alert"
      aria-live="assertive"
      class="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
    >
      <span class="flex-1">{{ favoritesStore.limitError }}</span>
      <button
        class="flex-shrink-0 text-red-500 hover:text-red-700 focus:outline-none"
        aria-label="Fehlermeldung schliessen"
        @click="favoritesStore.dismissLimitError()"
      >
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          aria-hidden="true"
        >
          <path
            d="M1.5 1.5l12 12m0-12l-12 12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <!-- Tab Panel: Empfohlen -->
    <div
      id="tabpanel-recommended"
      role="tabpanel"
      aria-labelledby="tab-recommended"
      v-show="activeTab === 'recommended'"
    >
      <RecommendedList @product-click="handleProductClick" />
    </div>

    <!-- Tab Panel: Favoriten -->
    <div
      id="tabpanel-favorites"
      role="tabpanel"
      aria-labelledby="tab-favorites"
      v-show="activeTab === 'favorites'"
    >
      <FavoritesList @product-click="handleProductClick" />
    </div>
  </div>
</template>
