<!--
  ProductDetailModal - Detailansicht für einzelnes Produkt
  
  Diese Komponente zeigt alle verfügbaren Informationen zu einem Produkt:
  - Produktbild (oder Fallback-Icon)
  - Preis und Name
  - Beschreibung
  - Nährwerte (Kalorien, Protein, Zucker, Fett)
  - Badges (Vegan, Glutenfrei)
  - Allergene
  - Verfügbarkeit (Stock)
  
  @component
-->

<script setup lang="ts">
import type { Product } from '~/types'
import RecommendButton from '~/components/recommendations/RecommendButton.vue'

// ========================================
// COMPOSABLES & STORES
// ========================================

/** useFormatter für Preis-Formatierung */
const { formatPrice } = useFormatter()

// FEAT-18: Empfehlungs-State fuer ProductDetailModal
const authStore = useAuthStore()
const recommendationsStore = useRecommendationsStore()

/** Lokaler Empfehlungs-State fuer das geoeffnete Produkt */
const localRecommendationCount = ref(0)
const localIsRecommendedByMe = ref(false)
const isRecommendLoading = ref(false)

// ========================================
// PROPS & EMITS
// ========================================

/**
 * Props für ProductDetailModal
 *
 * @property show - Steuert Sichtbarkeit des Modals
 * @property product - Produkt-Objekt das angezeigt werden soll (null = kein Produkt)
 */
interface Props {
  show: boolean
  product: Product | null
}

const props = defineProps<Props>()

/**
 * Events die diese Komponente emitted
 *
 * @event close - User möchte Modal schließen (X-Button, Backdrop, ESC, Schließen-Button)
 */
const emit = defineEmits<{
  close: []
}>()

// ========================================
// WATCHERS
// ========================================

/**
 * FEAT-18: Wenn ein Produkt geoeffnet wird, Empfehlungs-State initialisieren.
 * Versucht zunächst Daten aus dem recommendations Store zu nehmen (falls in Top-10).
 * Andernfalls: Zähler auf 0, isRecommendedByMe auf false.
 */
watch(() => props.product, async (newProduct) => {
  if (!newProduct) {
    localRecommendationCount.value = 0
    localIsRecommendedByMe.value = false
    return
  }

  // Aus Top-10-Store laden (falls vorhanden)
  const storeProduct = recommendationsStore.products.find(p => p.id === newProduct.id)
  if (storeProduct) {
    localRecommendationCount.value = storeProduct.recommendationCount
    localIsRecommendedByMe.value = storeProduct.isRecommendedByMe
  } else {
    // Produkt ist nicht in Top-10: Zähler per API laden
    try {
      const result = await $fetch<{ recommendationCount: number; isRecommendedByMe: boolean }>(
        `/api/recommendations/${newProduct.id}`
      )
      localRecommendationCount.value = result.recommendationCount
      localIsRecommendedByMe.value = result.isRecommendedByMe
    } catch {
      // Nicht-Kritisch: Fallback auf 0
      localRecommendationCount.value = 0
      localIsRecommendedByMe.value = false
    }
  }
})

// ========================================
// METHODS
// ========================================

/**
 * Schließt Modal
 */
const closeModal = () => {
  emit('close')
}

/**
 * FEAT-18: Toggelt Empfehlung fuer das aktuell angezeigte Produkt.
 * Optimistisches UI: sofortige Zustandsaenderung, Rollback bei Fehler.
 */
const handleRecommendToggle = async (productId: number) => {
  if (isRecommendLoading.value) return
  isRecommendLoading.value = true

  const wasRecommended = localIsRecommendedByMe.value
  const prevCount = localRecommendationCount.value

  // Optimistisches Update
  localIsRecommendedByMe.value = !wasRecommended
  localRecommendationCount.value = wasRecommended ? prevCount - 1 : prevCount + 1

  try {
    if (wasRecommended) {
      const result = await $fetch<{ success: boolean; recommendationCount: number }>(
        `/api/recommendations/${productId}`,
        { method: 'DELETE' }
      )
      localRecommendationCount.value = result.recommendationCount
    } else {
      const result = await $fetch<{ success: boolean; recommendationCount: number }>(
        '/api/recommendations',
        { method: 'POST', body: { productId } }
      )
      localRecommendationCount.value = result.recommendationCount
    }

    // Top-10-Store aktualisieren (falls Produkt darin enthalten)
    recommendationsStore.updateProductRecommendationState(
      productId,
      localIsRecommendedByMe.value,
      localRecommendationCount.value,
    )
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    // 409: bereits empfohlen — silent ignore
    if (err.statusCode !== 409) {
      // Rollback
      localIsRecommendedByMe.value = wasRecommended
      localRecommendationCount.value = prevCount
    }
  } finally {
    isRecommendLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="show && product" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
    >
      <div class="bg-background rounded-lg max-w-lg w-full p-6 border shadow-xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex justify-between items-start mb-4">
          <h2 id="product-detail-title" class="text-xl font-bold">{{ product.name }}</h2>
          <button 
            @click="closeModal"
            class="text-muted-foreground hover:text-foreground p-1"
            aria-label="Modal schließen"
          >
            ✕
          </button>
        </div>

        <!-- Produktbild -->
        <div class="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center text-6xl">
          <!-- Fallback Icon wenn kein Bild vorhanden -->
          <span v-if="!product.imageUrl" aria-hidden="true">🍎</span>
          <!-- Produktbild -->
          <img
            v-else
            :src="product.imageUrl"
            :alt="product.name"
            class="w-full h-full object-cover rounded-lg"
          />
        </div>

        <!-- Preis: Originalpreis durchgestrichen + Angebotspreis wenn Angebot aktiv (FEAT-17) -->
        <div class="flex items-baseline gap-3 mb-4">
          <!-- Angebotspreis (hervorgehoben, nur wenn Angebot aktiv) -->
          <p
            v-if="product.activeOffer"
            class="text-2xl font-bold text-primary"
          >
            {{ formatPrice(product.activeOffer.discountedPrice) }} €
          </p>
          <!-- Originalpreis: durchgestrichen wenn Angebot aktiv, ansonsten normal -->
          <p
            :class="[
              product.activeOffer
                ? 'text-base text-muted-foreground line-through'
                : 'text-2xl font-bold text-primary',
            ]"
          >
            {{ formatPrice(product.price) }} €
          </p>
        </div>

        <!-- Beschreibung -->
        <p v-if="product.description" class="text-muted-foreground mb-4">
          {{ product.description }}
        </p>

        <!-- Badges (Vegan, Glutenfrei, Stock) -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span 
            v-if="product.isVegan" 
            class="text-sm bg-green-100 text-green-700 px-2 py-1 rounded"
          >
            🌱 Vegan
          </span>
          <span 
            v-if="product.isGlutenFree" 
            class="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
          >
            🍞 Glutenfrei
          </span>
          <span 
            v-if="product.stock === 0" 
            class="text-sm bg-red-100 text-red-700 px-2 py-1 rounded"
          >
            ❌ Ausverkauft
          </span>
          <span 
            v-else 
            class="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded"
          >
            📦 {{ product.stock }} verfügbar
          </span>
        </div>

        <!-- Nährwerte -->
        <div 
          v-if="product.calories || product.protein || product.sugar || product.fat" 
          class="border-t pt-4"
        >
          <h3 class="font-medium mb-3">Nährwerte (pro 100g)</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div v-if="product.calories" class="flex justify-between">
              <span class="text-muted-foreground">Kalorien</span>
              <span>{{ product.calories }} kcal</span>
            </div>
            <div v-if="product.protein" class="flex justify-between">
              <span class="text-muted-foreground">Protein</span>
              <span>{{ product.protein }}g</span>
            </div>
            <div v-if="product.sugar" class="flex justify-between">
              <span class="text-muted-foreground">Zucker</span>
              <span>{{ product.sugar }}g</span>
            </div>
            <div v-if="product.fat" class="flex justify-between">
              <span class="text-muted-foreground">Fett</span>
              <span>{{ product.fat }}g</span>
            </div>
          </div>
        </div>

        <!-- Allergene -->
        <div 
          v-if="product.allergens && product.allergens.length > 0" 
          class="border-t pt-4 mt-4"
        >
          <h3 class="font-medium mb-2">Allergene</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="allergen in product.allergens" 
              :key="allergen"
              class="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded"
            >
              ⚠️ {{ allergen }}
            </span>
          </div>
        </div>

        <!-- FEAT-18: Empfehlungs-Button (nur fuer Mitarbeiter, REQ-7) -->
        <div v-if="!authStore.isAdmin" class="mt-4">
          <RecommendButton
            :product-id="product.id"
            :is-recommended="localIsRecommendedByMe"
            :recommendation-count="localRecommendationCount"
            :is-loading="isRecommendLoading"
            @toggle="handleRecommendToggle"
          />
        </div>

        <!-- Schließen Button -->
        <button
          @click="closeModal"
          class="w-full mt-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
        >
          Schließen
        </button>
      </div>
    </div>
  </Teleport>
</template>
