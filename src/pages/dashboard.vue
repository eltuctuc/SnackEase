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
import BalanceCard from '~/components/dashboard/BalanceCard.vue'
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

// ========================================
// REACTIVE STATE
// ========================================

/** Aktuell ausgewähltes Produkt für Detail-Ansicht */
const selectedProductDetail = ref<Product | null>(null)

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
    // User ist eingeloggt → Daten laden
    await creditsStore.fetchBalance()
    await productsStore.fetchProducts()
  }
})

// ========================================
// EVENT HANDLERS - Auth & Navigation
// ========================================

/**
 * Meldet den User ab und leitet zum Login weiter
 * 
 * @description
 * Ruft den Store-Action auf, der:
 * - Session-Cookie löscht
 * - Store-State zurücksetzt
 * - Zur Login-Page navigiert
 */
const logout = () => {
  authStore.logout()
}

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
 * Sucht nach Produkten mit aktuellem Suchbegriff und aktiver Kategorie.
 */
const handleSearch = (query: string) => {
  productsStore.fetchProducts(productsStore.selectedCategory, query)
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
// COMPUTED PROPERTIES - Derived State
// ========================================

/**
 * Zeigt Admin-Link nur für Admin-User
 * 
 * @description
 * Bestimmt ob der "Admin-Bereich"-Link angezeigt wird.
 * Nur Admins haben Zugriff auf /admin Routes.
 */
const showAdminLink = computed(() => {
  return authStore.user?.role === 'admin'
})
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header mit User-Info -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
          <p v-if="authStore.user" class="text-sm text-muted-foreground mt-1">
            Angemeldet als {{ authStore.user.name }} 
            <span v-if="authStore.user.location">({{ authStore.user.location }})</span>
            <span class="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
              {{ authStore.user.role }}
            </span>
          </p>
        </div>
        
        <button 
          @click="logout"
          class="py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
        >
          Abmelden
        </button>
      </div>
      
      <!-- Admin-Link -->
      <NuxtLink 
        v-if="showAdminLink"
        to="/admin"
        class="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
      >
        → Admin-Bereich
      </NuxtLink>

      <!-- Balance Card Component -->
      <div class="grid gap-6 mb-8">
        <BalanceCard
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
  </div>
</template>
