<!--
  Dashboard - Hauptseite für Mitarbeiter & Admins

  Diese Seite orchestriert die Haupt-Components:
  - BalanceCard: Guthaben-Anzeige mit Auflade-Buttons
  - ProductGrid: Produktkatalog mit Suche und Filtern
  - RechargeModal: Modal für Guthaben-Aufladung
  - ProductDetailModal: Modal für Produkt-Details

  REFACTORING: Die meiste UI-Logik wurde in wiederverwendbare
  Components extrahiert. Diese Seite kümmert sich nur noch um:
  - State-Management (Stores)
  - Event-Handling zwischen Components
  - Routing und Auth

  @page
-->

<script setup lang="ts">
import type { Product, ProductCategoryOption } from '~/types'
import { useCartStore } from '~/stores/cart'
import { useFavoritesStore } from '~/stores/favorites'
import BalanceCard from '~/components/dashboard/BalanceCard.vue'
import AdminInfoBanner from '~/components/dashboard/AdminInfoBanner.vue'
import OffersSlider from '~/components/dashboard/OffersSlider.vue'
import DashboardTabs from '~/components/dashboard/DashboardTabs.vue'
import ProductGrid from '~/components/dashboard/ProductGrid.vue'
import RechargeModal from '~/components/dashboard/RechargeModal.vue'
import ProductDetailModal from '~/components/dashboard/ProductDetailModal.vue'

// ========================================
// COMPOSABLES
// ========================================

/**
 * useModal für Recharge-Modal
 *
 * Verwaltet Show/Hide-State und Keyboard-Handling (ESC)
 */
const {
  isOpen: showRechargeModal,
  open: openRechargeModal,
  close: closeRechargeModal,
} = useModal()

/**
 * useModal für Product-Detail-Modal
 *
 * Verwaltet Show/Hide-State und Keyboard-Handling (ESC)
 */
const {
  isOpen: showProductDetail,
  open: openProductDetailModal,
  close: closeProductDetailModal,
} = useModal()

// ========================================
// ROUTER & STORES
// ========================================

const router = useRouter()
const authStore = useAuthStore()
const creditsStore = useCreditsStore()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

// ========================================
// REACTIVE STATE
// ========================================

/** Aktuell ausgewähltes Produkt für Detail-Ansicht */
const selectedProductDetail = ref<Product | null>(null)

/** Verhindert Flash von Default-Store-Werten — erst true wenn alle Daten geladen sind */
const pageReady = ref(false)

/** FEAT-18: Aktiver Tab auf dem Dashboard (nie persistiert, REQ-5) */
const activeTab = ref<'recommended' | 'favorites'>('recommended')

// ========================================
// CONSTANTS - Kategorien
// ========================================

/**
 * Verfügbare Produkt-Kategorien mit Icons
 *
 * Diese werden als Filter-Buttons über dem Produktkatalog angezeigt.
 * Die Kategorie 'alle' zeigt alle Produkte ohne Filter.
 */
const categories: ProductCategoryOption[] = [
  { id: 'alle', label: 'Alle', icon: '🍎' },
  { id: 'obst', label: 'Obst', icon: '🍎' },
  { id: 'proteinriegel', label: 'Protein', icon: '💪' },
  { id: 'shakes', label: 'Shakes', icon: '🥤' },
  { id: 'schokoriegel', label: 'Schoki', icon: '🍫' },
  { id: 'nuesse', label: 'Nüsse', icon: '🥜' },
  { id: 'getraenke', label: 'Getränke', icon: '🧃' },
]

// ========================================
// LIFECYCLE - Component Initialization
// ========================================

/**
 * Component-Mounted-Hook
 *
 * @description
 * Initialisiert die Dashboard-Seite beim Laden:
 *
 * 1. Auth-Check:
 *    - Prüft ob User eingeloggt ist (via Cookie)
 *    - Leitet zu /login weiter falls nicht authentifiziert
 *
 * 2. Daten laden:
 *    - Guthaben-Stand abrufen (GET /api/credits/balance)
 *    - Produkt-Katalog laden (GET /api/products)
 *
 * WICHTIG: Keyboard-Events werden jetzt von Components selbst gehandelt
 */
onMounted(async () => {
  // Auth-Check: User-Session aus Cookie wiederherstellen
  await authStore.initFromCookie()

  // Redirect zu Login falls nicht authentifiziert
  if (!authStore.user) {
    router.push('/login')
  } else {
    // Admin hat kein Guthaben → fetchBalance() NICHT aufrufen (verhindert 403-Fehler)
    // Mitarbeiter: beides parallel laden → schneller, kein Flash von Default-Werten
    if (authStore.isAdmin) {
      await productsStore.fetchProducts()
    } else {
      // FEAT-18: fetchFavorites parallel laden fuer Herz-Icons auf Produktkarten
      await Promise.all([
        creditsStore.fetchBalance(),
        productsStore.fetchProducts(),
        favoritesStore.fetchFavorites(),
      ])
    }
    pageReady.value = true
  }
})

// ========================================
// EVENT HANDLERS - Balance Card
// ========================================

/**
 * Schließt das Recharge-Modal und resettet Error
 *
 * @description
 * Erweitert den useModal close() mit zusätzlichem Error-Reset.
 */
const handleCloseRechargeModal = () => {
  closeRechargeModal()
  creditsStore.error = null
}

/**
 * Führt Guthaben-Aufladung durch
 *
 * @param amount - Auflade-Betrag ('10' | '25' | '50')
 *
 * @description
 * Wird von RechargeModal getriggert wenn User auf "Jetzt aufladen" klickt.
 * Ruft Store-Action auf die den API-Call macht.
 */
const handleRecharge = async (amount: string) => {
  await creditsStore.recharge(amount)
}

/**
 * Löst Monatspauschale-Abruf aus
 *
 * @description
 * Mitarbeiter können einmal pro Monat 25€ Pauschale abrufen.
 * Backend prüft ob User bereits in diesem Monat abgerufen hat.
 */
const handleMonthly = async () => {
  if (creditsStore.isLoading) return
  await creditsStore.receiveMonthly()
}

/**
 * Schließt Fehlermeldung in Balance-Card
 */
const dismissBalanceError = () => {
  creditsStore.error = null
}

// ========================================
// EVENT HANDLERS - Product Grid
// ========================================

/**
 * Führt Produkt-Suche aus
 *
 * @param query - Suchbegriff
 *
 * @description
 * Wird getriggert durch:
 * - Enter-Taste im Suchfeld
 * - Klick auf "Suchen"-Button
 *
 * BUG-FEAT6-001 Fix: Bei aktiver Suche wird Kategorie auf "alle" zurückgesetzt,
 * damit kategorie-übergreifend gesucht wird (wie Amazon/eBay Standard).
 */
const handleSearch = (query: string) => {
  if (query.trim()) {
    // Bei aktiver Suche: Kategorie auf "alle" zurücksetzen
    productsStore.setCategory('alle')
    productsStore.fetchProducts('alle', query)
  } else {
    // Leere Suche: Aktuelle Kategorie beibehalten
    productsStore.fetchProducts(productsStore.selectedCategory, '')
  }
}

/**
 * Setzt Kategorie-Filter und lädt gefilterte Produkte
 *
 * @param category - Kategorie-ID (z.B. 'obst', 'shakes', 'alle')
 */
const handleCategorySelect = (category: string) => {
  productsStore.setCategory(category)
  productsStore.fetchProducts(category, '')
}

/**
 * Öffnet Produkt-Detail-Modal
 *
 * @param product - Angeklicktes Produkt
 *
 * @description
 * - Setzt selectedProduct
 * - Öffnet Modal via useModal
 */
const handleProductClick = (product: Product) => {
  selectedProductDetail.value = product
  openProductDetailModal()
}

/**
 * Schließt Produkt-Detail-Modal
 *
 * @description
 * Erweitert den useModal close() mit Product-Reset.
 */
const handleCloseProductDetailModal = () => {
  closeProductDetailModal()
  selectedProductDetail.value = null
}

// ========================================
// EVENT HANDLERS - Offers Slider (FEAT-17)
// ========================================

/**
 * Oeffnet Produkt-Detail-Modal aus dem Angebots-Slider heraus.
 * Analog zu handleProductClick im ProductGrid.
 *
 * @param product - Angeklicktes Angebots-Produkt
 */
const handleOfferCardClick = (product: Product) => {
  selectedProductDetail.value = product
  openProductDetailModal()
}

/**
 * Legt ein Produkt aus dem Angebots-Slider direkt in den Warenkorb.
 * Verwendet den Angebotspreis (activeOffer.discountedPrice) als Preis.
 *
 * @param product - Produkt mit aktivem Angebot
 */
const handleAddToCartFromSlider = (product: Product) => {
  const price = product.activeOffer
    ? parseFloat(product.activeOffer.discountedPrice)
    : parseFloat(product.price)

  cartStore.addItem(
    {
      productId: product.id,
      name: product.name,
      price,
      image: product.imageUrl ?? undefined,
    },
    1,
  )
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8">
    <!-- Lade-Skeleton bis alle Daten bereit sind (verhindert Flash von Default-Werten) -->
    <template v-if="!pageReady">
      <div class="grid gap-6 mb-8">
        <!-- Admin-Skeleton: Neutraler Info-Banner ohne Buttons -->
        <div v-if="authStore.isAdmin" class="rounded-lg p-6 border-2 bg-blue-50 border-blue-200 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-300"></div>
            <div class="flex-1">
              <div class="h-4 bg-blue-300 rounded w-32 mb-2"></div>
              <div class="h-3 bg-blue-200 rounded w-48"></div>
            </div>
          </div>
        </div>

        <!-- Mitarbeiter-Skeleton: BalanceCard mit Buttons -->
        <div v-else class="rounded-lg p-6 border-2 bg-gray-100 border-gray-200 animate-pulse">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="h-3 bg-gray-300 rounded w-16 mb-2"></div>
              <div class="h-10 bg-gray-300 rounded w-28"></div>
            </div>
            <div class="w-4 h-4 rounded-full bg-gray-300"></div>
          </div>
          <div class="flex gap-3">
            <div class="flex-1 h-12 bg-gray-300 rounded-lg"></div>
            <div class="flex-1 h-12 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
      <div class="rounded-lg border bg-gray-50 p-8 animate-pulse">
        <div class="h-4 bg-gray-300 rounded w-1/4 mb-6"></div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div v-for="i in 6" :key="i" class="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </template>

    <!-- Echte Inhalte erst wenn alle Daten geladen sind -->
    <template v-else>
      <!-- Balance-Bereich: AdminInfoBanner fuer Admin, BalanceCard fuer Mitarbeiter -->
      <div class="grid gap-6 mb-8">
        <!-- Admin: zeigt Info-Banner statt Guthaben-Karte -->
        <AdminInfoBanner v-if="authStore.isAdmin" />

        <!-- Mitarbeiter: zeigt Guthaben-Karte mit allen Aktionen -->
        <BalanceCard
          v-else
          :balance="creditsStore.balance"
          :balance-status="creditsStore.balanceStatus"
          :last-recharged-at="creditsStore.lastRechargedAt"
          :is-loading="creditsStore.isLoading"
          :error="creditsStore.error"
          @open-recharge-modal="openRechargeModal"
          @request-monthly="handleMonthly"
          @dismiss-error="dismissBalanceError"
        />
      </div>

      <!-- Angebots-Querslider (FEAT-17) — nur fuer Mitarbeiter, nicht fuer Admins -->
      <OffersSlider
        v-if="!authStore.isAdmin"
        :products="productsStore.products"
        :is-loading="productsStore.isLoading"
        @open-detail="handleOfferCardClick"
        @add-to-cart="handleAddToCartFromSlider"
      />

      <!-- FEAT-18: Tab-Umschalter "Empfohlen" / "Favoriten" — nur fuer Mitarbeiter -->
      <DashboardTabs
        v-if="!authStore.isAdmin"
        :active-tab="activeTab"
        @tab-change="activeTab = $event"
        @product-click="handleProductClick"
      />

      <!-- Product Grid Component -->
      <ProductGrid
        :products="productsStore.products"
        :categories="categories"
        :selected-category="productsStore.selectedCategory"
        :is-loading="productsStore.isLoading"
        :error="productsStore.error"
        @select-category="handleCategorySelect"
        @search="handleSearch"
        @product-click="handleProductClick"
      />
    </template>
  </div>

  <!-- Recharge Modal Component -->
  <RechargeModal
    :show="showRechargeModal"
    :is-loading="creditsStore.isLoading"
    :error="creditsStore.error"
    @close="handleCloseRechargeModal"
    @recharge="handleRecharge"
    @dismiss-error="dismissBalanceError"
  />

  <!-- Product Detail Modal Component -->
  <ProductDetailModal
    :show="showProductDetail"
    :product="selectedProductDetail"
    @close="handleCloseProductDetailModal"
  />
</template>
