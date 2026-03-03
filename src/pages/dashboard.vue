<script setup lang="ts">
/**
 * Dashboard - Hauptseite für Mitarbeiter & Admins
 * 
 * Diese Komponente zeigt:
 * - Guthaben-Stand mit farblicher Statusanzeige (grün/gelb/rot)
 * - Auflade-Funktionen (manuell + Monatspauschale)
 * - Produktkatalog mit Suche und Kategorie-Filtern
 * - Produkt-Details in Modal-Ansicht
 * 
 * @component
 */

import { RECHARGE_OPTIONS, BALANCE_THRESHOLDS } from '~/constants/credits'
import { RECHARGE_SIMULATION, SUCCESS_MODAL_AUTO_CLOSE_DELAY } from '~/constants/ui'
import type { Product, ProductCategoryOption } from '~/types'

// ========================================
// ROUTER & STORES
// ========================================

const router = useRouter()
const authStore = useAuthStore()
const creditsStore = useCreditsStore()
const productsStore = useProductsStore()

// ========================================
// REACTIVE STATE - Modal & UI
// ========================================

/** Zeigt/Versteckt das Guthaben-Auflade-Modal */
const showRechargeModal = ref(false)

/** Aktuell ausgewählter Auflade-Betrag ('10' | '25' | '50') */
const selectedAmount = ref<string | null>(null)

/** Loading-State während der Aufladung (für UI-Feedback) */
const isRecharging = ref(false)

/** Success-State nach erfolgreicher Aufladung (zeigt Checkmark) */
const rechargeSuccess = ref(false)

/** Zeigt/Versteckt das Produkt-Detail-Modal */
const showProductDetail = ref(false)

/** Aktuell ausgewähltes Produkt für Detail-Ansicht */
const selectedProductDetail = ref<Product | null>(null)

/** Suchbegriff für Produkt-Suche */
const searchQuery = ref('')

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
// COMPUTED PROPERTIES - Balance Styling
// ========================================

/**
 * Dynamische CSS-Klassen für Guthaben-Anzeige basierend auf Status
 * 
 * @description
 * Bestimmt die Hintergrund- und Textfarbe der Balance-Card:
 * - 'good' (> 20€): Grün - Ausreichend Guthaben
 * - 'warning' (10-20€): Gelb - Bald aufladen
 * - 'critical' (< 10€): Rot - Dringend aufladen
 * 
 * Schwellwerte definiert in: src/constants/credits.ts (BALANCE_THRESHOLDS)
 */
const balanceColorClass = computed(() => {
  switch (creditsStore.balanceStatus) {
    case 'good': return 'bg-green-100 border-green-300 text-green-800'
    case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    case 'critical': return 'bg-red-100 border-red-300 text-red-800'
    default: return 'bg-gray-100 border-gray-300 text-gray-800'
  }
})

/**
 * Dynamische CSS-Klassen für Guthaben-Status-Indikator-Dot
 * 
 * Kleiner farbiger Punkt (Dot) rechts neben dem Guthaben-Betrag.
 */
const balanceDotClass = computed(() => {
  switch (creditsStore.balanceStatus) {
    case 'good': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-500'
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
// EVENT HANDLERS - Recharge Modal
// ========================================

/**
 * Setzt den ausgewählten Auflade-Betrag
 * 
 * @param amount - Auflade-Betrag als String ('10' | '25' | '50')
 */
const selectAmount = (amount: string) => {
  selectedAmount.value = amount
}

/**
 * Führt die Guthaben-Aufladung durch
 * 
 * @description
 * Workflow:
 * 1. Zeigt Loading-Spinner (isRecharging = true)
 * 2. Simuliert Ladezeit für bessere UX (2-3 Sekunden)
 *    HINWEIS: In Production würde hier echter Payment-Flow stattfinden
 * 3. Ruft Backend-API auf (POST /api/credits/recharge)
 * 4. Bei Erfolg: Zeigt Success-Checkmark und schließt Modal nach 1.5s
 * 5. Bei Fehler: Zeigt Fehlermeldung im Modal
 * 
 * @remarks
 * Das Delay ist bewusst gewählt, um dem User ein natürliches Gefühl
 * für die "Verarbeitung" zu geben. Sofortige Reaktion würde unnatürlich wirken.
 */
const handleRecharge = async () => {
  // Guard: Verhindere Doppel-Klicks oder Aufladung ohne Betrag
  if (!selectedAmount.value || isRecharging.value) return

  isRecharging.value = true
  rechargeSuccess.value = false

  // Simuliere realistische Ladezeit (2-3 Sekunden)
  // TODO: In Production durch echten Payment-Provider ersetzen
  await new Promise(resolve => 
    setTimeout(
      resolve, 
      RECHARGE_SIMULATION.BASE_DELAY + Math.random() * RECHARGE_SIMULATION.RANDOM_DELAY_MAX
    )
  )

  // Backend-Call: Guthaben aufladen
  const result = await creditsStore.recharge(selectedAmount.value)

  isRecharging.value = false

  // Bei Erfolg: Success-State anzeigen und Modal auto-close
  if (result.success) {
    rechargeSuccess.value = true
    setTimeout(() => {
      showRechargeModal.value = false
      rechargeSuccess.value = false
      selectedAmount.value = null
    }, SUCCESS_MODAL_AUTO_CLOSE_DELAY)
  }
  // Bei Fehler: Fehlermeldung bleibt im Modal sichtbar (aus Store)
}

/**
 * Löst Monatspauschale-Abruf aus
 * 
 * @description
 * Mitarbeiter können einmal pro Monat 25€ Pauschale abrufen.
 * Backend prüft ob User bereits in diesem Monat abgerufen hat.
 * 
 * Siehe: src/server/api/credits/monthly.post.ts
 */
const handleMonthly = async () => {
  // Guard: Verhindere Doppel-Klicks während Loading
  if (creditsStore.isLoading) return

  await creditsStore.receiveMonthly()
}

/**
 * Schließt die Fehlermeldung in der Balance-Card oder im Modal
 * 
 * @description
 * Setzt den Error-State im Credits-Store zurück, sodass
 * die Fehlermeldung aus dem UI verschwindet.
 */
const dismissError = () => {
  creditsStore.error = null
}

/**
 * Schließt das Recharge-Modal und setzt alle States zurück
 * 
 * @description
 * Wird aufgerufen bei:
 * - Klick auf "X"-Button
 * - Klick auf Modal-Backdrop
 * - ESC-Taste
 */
const closeModalAndReset = () => {
  showRechargeModal.value = false
  selectedAmount.value = null
  creditsStore.error = null
}

// ========================================
// EVENT HANDLERS - Keyboard Navigation
// ========================================

/**
 * Globaler Keyboard-Event-Handler für Modal-Steuerung
 * 
 * @description
 * Ermöglicht Schließen von Modals via ESC-Taste für bessere UX.
 * 
 * Unterstützte Keys:
 * - ESC: Schließt aktuell offenes Modal (Recharge oder Product-Detail)
 * 
 * @param e - Keyboard-Event
 */
const handleKeydown = (e: KeyboardEvent) => {
  // ESC-Taste: Schließe Recharge-Modal falls offen
  if (e.key === 'Escape' && showRechargeModal.value) {
    closeModalAndReset()
  }
  // ESC-Taste: Schließe Product-Detail-Modal falls offen
  if (e.key === 'Escape' && showProductDetail.value) {
    closeProductDetail()
  }
}

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
 * 3. Event-Listener:
 *    - Registriert globalen Keydown-Handler für ESC-Taste
 * 
 * WICHTIG: Keyboard-Events nur im Browser registrieren (SSR-Safe-Check)
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
  
  // SSR-Safe: Keyboard-Events nur im Browser registrieren
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

// ========================================
// EVENT HANDLERS - Product Search & Filter
// ========================================

/**
 * Führt Produkt-Suche aus
 * 
 * @description
 * Wird getriggert durch:
 * - Enter-Taste im Suchfeld
 * - Klick auf "Suchen"-Button
 * 
 * Sucht nach Produkten mit aktuellem Suchbegriff und aktiver Kategorie.
 * Backend führt ILIKE-Query durch (case-insensitive).
 */
const handleSearch = () => {
  productsStore.fetchProducts(productsStore.selectedCategory, searchQuery.value)
}

/**
 * Setzt Kategorie-Filter und lädt gefilterte Produkte
 * 
 * @param category - Kategorie-ID (z.B. 'obst', 'shakes', 'alle')
 * 
 * @description
 * - Speichert Kategorie im Store
 * - Lädt Produkte mit neuem Filter (behält Suchbegriff bei)
 */
const selectCategory = (category: string) => {
  productsStore.setCategory(category)
  productsStore.fetchProducts(category, searchQuery.value)
}

// ========================================
// EVENT HANDLERS - Product Detail Modal
// ========================================

/**
 * Öffnet das Produkt-Detail-Modal
 * 
 * @param product - Das anzuzeigende Produkt
 * 
 * @description
 * Zeigt detaillierte Informationen zum Produkt:
 * - Nährwerte (Kalorien, Protein, Zucker, Fett)
 * - Allergene
 * - Verfügbarkeit (Stock)
 * - Vegan/Glutenfrei-Badges
 */
const openProductDetail = (product: Product) => {
  selectedProductDetail.value = product
  showProductDetail.value = true
}

/**
 * Schließt das Produkt-Detail-Modal
 * 
 * @description
 * Wird aufgerufen bei:
 * - Klick auf "Schließen"-Button
 * - Klick auf Modal-Backdrop
 * - ESC-Taste
 */
const closeProductDetail = () => {
  showProductDetail.value = false
  selectedProductDetail.value = null
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Formatiert Preis-String zu 2 Dezimalstellen
 * 
 * @param price - Preis als String (z.B. "2.5" oder "10")
 * @returns Formatierter Preis mit 2 Dezimalstellen (z.B. "2.50")
 * 
 * @description
 * Preise werden in der DB als String gespeichert (Decimal-Precision).
 * Diese Funktion stellt sicher, dass sie immer mit 2 Nachkommastellen
 * angezeigt werden (z.B. "2.50 €" statt "2.5 €").
 */
const formatPrice = (price: string): string => {
  return parseFloat(price).toFixed(2)
}

// ========================================
// COMPUTED PROPERTIES - Derived State
// ========================================

/**
 * Gefilterte Produkt-Liste
 * 
 * @description
 * Gibt die Produkte aus dem Store zurück (bereits gefiltert durch API).
 * Computed Property für Reaktivität bei Store-Updates.
 * 
 * Fallback auf leeres Array falls Store noch keine Daten hat.
 */
const filteredProducts = computed(() => {
  return productsStore.products || []
})

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
      
      <NuxtLink 
        v-if="showAdminLink"
        to="/admin"
        class="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
      >
        → Admin-Bereich
      </NuxtLink>

      <div class="grid gap-6 mb-8">
          <div 
            :class="['rounded-lg p-6 border-2 transition-all', balanceColorClass]"
            role="status"
            aria-live="polite"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium opacity-80" id="balance-label">Guthaben</p>
                <p class="text-4xl font-bold" aria-labelledby="balance-label">
                  <span aria-live="polite">{{ creditsStore.balance }}</span> €
                </p>
              </div>
              <div 
                :class="['w-4 h-4 rounded-full', balanceDotClass]"
                role="img"
                :aria-label="'Guthaben-Status: ' + creditsStore.balanceStatus"
              ></div>
            </div>
            
            <div class="flex gap-3">
              <button 
                @click="showRechargeModal = true"
                :disabled="creditsStore.isLoading"
                aria-label="Guthaben aufladen"
                class="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guthaben aufladen
              </button>
              
              <button 
                @click="handleMonthly"
                :disabled="creditsStore.isLoading"
                aria-label="Monatspauschale erhalten, erhöht Guthaben um 25 Euro"
                class="flex-1 py-3 px-4 border-2 border-current rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ creditsStore.isLoading ? 'Wird geladen...' : 'Monatspauschale +25€' }}
              </button>
            </div>
          
          <p v-if="creditsStore.lastRechargedAt" class="text-xs mt-3 opacity-70">
            Zuletzt aufgeladen: {{ new Date(creditsStore.lastRechargedAt).toLocaleDateString('de-DE') }}
          </p>
          
          <p v-if="creditsStore.error" class="text-xs mt-3 text-red-600 bg-red-50 p-2 rounded" role="alert">
            {{ creditsStore.error }}
            <button @click="dismissError" class="ml-2 underline" aria-label="Fehlermeldung schließen">✕</button>
          </p>
        </div>
      </div>

      <div class="bg-card rounded-lg border p-6">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-foreground mb-4">Produktkatalog</h2>
          
          <div class="flex flex-col sm:flex-row gap-4 mb-4">
            <div class="relative flex-1">
              <input
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

          <div class="flex flex-wrap gap-2" role="group" aria-label="Kategorien auswählen">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectCategory(category.id)"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                productsStore.selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-primary/20'
              ]"
            >
              {{ category.icon }} {{ category.label }}
            </button>
          </div>
        </div>

        <div v-if="productsStore.isLoading" class="text-center py-12">
          <p class="text-muted-foreground">Produkte werden geladen...</p>
        </div>

        <div v-else-if="productsStore.error" class="text-center py-12">
          <p class="text-red-500">{{ productsStore.error }}</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Keine Produkte gefunden.</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            @click="openProductDetail(product)"
            class="bg-background border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div class="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center text-4xl">
              {{ product.imageUrl ? '' : '🍎' }}
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                class="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 class="font-medium text-foreground text-sm truncate">{{ product.name }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-lg font-bold text-primary">{{ formatPrice(product.price) }} €</span>
              <span v-if="product.stock === 0" class="text-xs text-red-500">Ausverkauft</span>
            </div>
            <div class="flex gap-1 mt-2">
              <span v-if="product.isVegan" class="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">🌱</span>
              <span v-if="product.isGlutenFree" class="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">GF</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="showRechargeModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeModalAndReset"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 id="modal-title" class="text-xl font-bold">Guthaben aufladen</h2>
            <button 
              @click="closeModalAndReset"
              class="text-muted-foreground hover:text-foreground p-1"
              aria-label="Modal schließen"
            >
              ✕
            </button>
          </div>

          <div v-if="rechargeSuccess" class="text-center py-8" role="status" aria-live="polite">
            <div class="text-4xl mb-4" aria-hidden="true">✓</div>
            <p class="text-lg font-medium text-green-600">Guthaben erfolgreich aufgeladen!</p>
          </div>

          <div v-else-if="isRecharging" class="text-center py-8">
            <div class="mb-4">
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary transition-all duration-300"
                  style="width: 100%"
                ></div>
              </div>
            </div>
            <p class="text-lg font-medium">Wird aufgeladen...</p>
          </div>

          <div v-else>
            <p class="text-sm text-muted-foreground mb-4">Wähle einen Betrag:</p>
            
            <div v-if="creditsStore.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              {{ creditsStore.error }}
              <button @click="dismissError" class="ml-2 underline" aria-label="Fehlermeldung schließen">✕</button>
            </div>
            
            <div class="grid grid-cols-3 gap-3 mb-6" role="group" aria-label="Auflade-Beträge auswählen">
              <button
                v-for="option in RECHARGE_OPTIONS"
                :key="option.amount"
                @click="selectAmount(option.amount)"
                :aria-pressed="selectedAmount === option.amount"
                :class="[
                  'p-4 rounded-lg border-2 transition-all text-center',
                  selectedAmount === option.amount 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                ]"
              >
                <p class="text-2xl font-bold">{{ option.label }}</p>
                <p class="text-xs text-muted-foreground">{{ option.description }}</p>
              </button>
            </div>

            <button 
              @click="handleRecharge"
              :disabled="!selectedAmount || isRecharging"
              aria-label="Guthaben mit gewählten Betrag aufladen"
              class="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isRecharging ? 'Wird aufgeladen...' : 'Jetzt aufladen' }}
            </button>
          </div>
        </div>
      </div>

      <div 
        v-if="showProductDetail && selectedProductDetail" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeProductDetail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <div class="bg-background rounded-lg max-w-lg w-full p-6 border shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-4">
            <h2 id="product-detail-title" class="text-xl font-bold">{{ selectedProductDetail.name }}</h2>
            <button 
              @click="closeProductDetail"
              class="text-muted-foreground hover:text-foreground p-1"
              aria-label="Modal schließen"
            >
              ✕
            </button>
          </div>

          <div class="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center text-6xl">
            {{ selectedProductDetail.imageUrl ? '' : '🍎' }}
            <img
              v-if="selectedProductDetail.imageUrl"
              :src="selectedProductDetail.imageUrl"
              :alt="selectedProductDetail.name"
              class="w-full h-full object-cover rounded-lg"
            />
          </div>

          <p class="text-2xl font-bold text-primary mb-4">{{ formatPrice(selectedProductDetail.price) }} €</p>

          <p v-if="selectedProductDetail.description" class="text-muted-foreground mb-4">
            {{ selectedProductDetail.description }}
          </p>

          <div class="flex flex-wrap gap-2 mb-4">
            <span v-if="selectedProductDetail.isVegan" class="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">🌱 Vegan</span>
            <span v-if="selectedProductDetail.isGlutenFree" class="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">🍞 Glutenfrei</span>
            <span v-if="selectedProductDetail.stock === 0" class="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">❌ Ausverkauft</span>
            <span v-else class="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">📦 {{ selectedProductDetail.stock }} verfügbar</span>
          </div>

          <div v-if="selectedProductDetail.calories || selectedProductDetail.protein || selectedProductDetail.sugar || selectedProductDetail.fat" class="border-t pt-4">
            <h3 class="font-medium mb-3">Nährwerte (pro 100g)</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div v-if="selectedProductDetail.calories" class="flex justify-between">
                <span class="text-muted-foreground">Kalorien</span>
                <span>{{ selectedProductDetail.calories }} kcal</span>
              </div>
              <div v-if="selectedProductDetail.protein" class="flex justify-between">
                <span class="text-muted-foreground">Protein</span>
                <span>{{ selectedProductDetail.protein }}g</span>
              </div>
              <div v-if="selectedProductDetail.sugar" class="flex justify-between">
                <span class="text-muted-foreground">Zucker</span>
                <span>{{ selectedProductDetail.sugar }}g</span>
              </div>
              <div v-if="selectedProductDetail.fat" class="flex justify-between">
                <span class="text-muted-foreground">Fett</span>
                <span>{{ selectedProductDetail.fat }}g</span>
              </div>
            </div>
          </div>

          <div v-if="selectedProductDetail.allergens && selectedProductDetail.allergens.length > 0" class="border-t pt-4 mt-4">
            <h3 class="font-medium mb-2">Allergene</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="allergen in selectedProductDetail.allergens" 
                :key="allergen"
                class="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded"
              >
                ⚠️ {{ allergen }}
              </span>
            </div>
          </div>

          <button 
            @click="closeProductDetail"
            class="w-full mt-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
