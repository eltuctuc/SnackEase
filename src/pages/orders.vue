<!--
  Bestellübersicht — /orders (FEAT-11 + FEAT-16)

  Zeigt:
  1. Warenkorb-Sektion (wenn Artikel im Warenkorb)
     - CartItemRow pro Produkt (Menge +/- , Entfernen)
     - CartSummary mit Gesamtpreis + Guthaben-Warnung
     - Checkout-Button mit Ladezustand

  2. Aktive-Vorbestellungen-Sektion
     - Filter-Dropdown (Alle / Bereit / Abgeholt / Storniert)
     - OrderCard für Mehrprodukt-Bestellungen (collapsible)
     - NFC-Abholung direkt auf der Seite
     - PIN-Abholung über Modal

  @page
-->

<script setup lang="ts">
import OrderCard from '~/components/orders/OrderCard.vue'
import PinInputModal from '~/components/orders/PinInputModal.vue'
import NfcPickupAnimation from '~/components/orders/NfcPickupAnimation.vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useCreditsStore } from '~/stores/credits'
import { usePurchasesStore } from '~/stores/purchases'

// ========================================
// ROUTER & STORES
// ========================================

const router = useRouter()
const authStore = useAuthStore()
const purchasesStore = usePurchasesStore()
const creditsStore = useCreditsStore()
const cartStore = useCartStore()

// ========================================
// REACTIVE STATE
// ========================================

/** Aktiver Statusfilter */
type FilterOption = 'all' | 'pending_pickup' | 'picked_up' | 'cancelled'
const activeFilter = ref<FilterOption>('all')

/** ID der Bestellung für die gerade eine NFC-Abholung läuft */
const nfcPickupOrderId = ref<number | null>(null)

/** Ob die NFC-Animation sichtbar ist */
const showNfcAnimation = ref(false)

/** ID der Bestellung für die das PIN-Modal offen ist */
const pinModalOrderId = ref<number | null>(null)

/** Fehlermeldung im PIN-Modal */
const pinModalError = ref<string | null>(null)

/** Anzahl falscher PIN-Versuche (pro Modal-Sitzung) */
const pinAttempts = ref(0)

const MAX_PIN_ATTEMPTS = 3

// Checkout State
const isCheckingOut = ref(false)
const checkoutError = ref<string | null>(null)
const checkoutSuccess = ref(false)
const checkoutData = ref<{
  orderId: number
  pickupPin: string
  expiresAt: string
  totalPrice: number
} | null>(null)

// ========================================
// LIFECYCLE
// ========================================

onMounted(async () => {
  // Auth-Check
  await authStore.initFromCookie()

  if (!authStore.user) {
    router.push('/login')
    return
  }

  // Warenkorb mit User-ID verknüpfen
  if (authStore.user.id) {
    cartStore.setUserId(authStore.user.id)
  }

  // Bestellungen laden
  await purchasesStore.fetchOrders()

  // Guthaben laden
  if (!authStore.isAdmin) {
    creditsStore.fetchBalance()
  }
})

// ========================================
// COMPUTED
// ========================================

/** Filteroption-Labels */
const filterOptions = [
  { value: 'all' as FilterOption, label: 'Alle' },
  { value: 'pending_pickup' as FilterOption, label: 'Bereit' },
  { value: 'picked_up' as FilterOption, label: 'Abgeholt' },
  { value: 'cancelled' as FilterOption, label: 'Storniert' },
]

/** Gefilterte Bestellungen */
const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') {
    return purchasesStore.allOrders
  }
  return purchasesStore.allOrders.filter((o) => o.status === activeFilter.value)
})

/** Anzahl aktiver Bestellungen (für Tab-Badge) */
const pendingCount = computed(
  () => purchasesStore.allOrders.filter((o) => o.status === 'pending_pickup').length
)

/** PIN-Modal gesperrt nach 3 Fehlversuchen */
const isPinLocked = computed(() => pinAttempts.value >= MAX_PIN_ATTEMPTS)

/** Ist gerade eine Abholung für eine bestimmte Bestellung aktiv? */
function isOrderPickingUp(orderId: number): boolean {
  return nfcPickupOrderId.value === orderId || purchasesStore.isPickingUp
}

/** Warenkorb-Summe */
const cartTotalPrice = computed(() => cartStore.totalPrice)

/** Guthaben-Warnung */
const showInsufficientFundsWarning = computed(() => {
  return cartTotalPrice.value > creditsStore.balanceNumeric
})

// ========================================
// EVENT HANDLER: Warenkorb
// ========================================

function incrementQuantity(productId: number) {
  const item = cartStore.items.find(i => i.productId === productId)
  if (item) {
    cartStore.updateQuantity(productId, item.quantity + 1)
  }
}

function decrementQuantity(productId: number) {
  const item = cartStore.items.find(i => i.productId === productId)
  if (item) {
    cartStore.updateQuantity(productId, item.quantity - 1)
  }
}

function removeFromCart(productId: number) {
  cartStore.removeItem(productId)
}

async function handleCheckout() {
  if (cartStore.isEmpty || isCheckingOut.value) return

  isCheckingOut.value = true
  checkoutError.value = null

  try {
    const items = cartStore.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))

    const response = await $fetch<{
      success: boolean
      error?: string
      orderId?: number
      pickupPin?: string
      expiresAt?: string
      totalPrice?: string
    }>('/api/purchases', {
      method: 'POST',
      body: {
        items,
        pickupLocation: authStore.user?.location || 'Nürnberg'
      }
    })

    if (response.success && response.orderId && response.pickupPin && response.expiresAt) {
      // Warenkorb leeren
      cartStore.clearCart()

      // Erfolgsmeldung
      checkoutData.value = {
        orderId: response.orderId,
        pickupPin: response.pickupPin,
        expiresAt: response.expiresAt,
        totalPrice: parseFloat(response.totalPrice || '0')
      }
      checkoutSuccess.value = true

      // Bestellungen neu laden
      await purchasesStore.fetchOrders()

      // Guthaben aktualisieren
      await creditsStore.fetchBalance()
    } else {
      checkoutError.value = response.error || 'Fehler beim Checkout'
    }
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    checkoutError.value = err.data?.message || 'Ein Fehler ist aufgetreten'
  } finally {
    isCheckingOut.value = false
  }
}

function closeCheckoutSuccess() {
  checkoutSuccess.value = false
  checkoutData.value = null
}

// ========================================
// EVENT HANDLER: NFC-Abholung
// ========================================

async function handlePickupNfc(orderId: number) {
  if (showNfcAnimation.value) return // Debounce: verhindert Doppelklick

  nfcPickupOrderId.value = orderId
  showNfcAnimation.value = true
  // Die eigentliche API wird nach der Animation aufgerufen (handleNfcAnimationDone)
}

async function handleNfcAnimationDone() {
  showNfcAnimation.value = false

  if (nfcPickupOrderId.value === null) return

  const orderId = nfcPickupOrderId.value
  const result = await purchasesStore.pickupOrder(orderId, 'nfc')

  nfcPickupOrderId.value = null

  if (result.success) {
    // Guthaben neu laden (Bestellung könnte refunded sein wenn parallel storniert)
    if (!authStore.isAdmin) {
      await creditsStore.fetchBalance()
    }
  }
}

// ========================================
// EVENT HANDLER: PIN-Abholung
// ========================================

function handlePickupPin(orderId: number) {
  pinModalOrderId.value = orderId
  pinModalError.value = null
  pinAttempts.value = 0
}

async function handlePinConfirm(pin: string) {
  if (pinModalOrderId.value === null) return

  const result = await purchasesStore.pickupOrder(pinModalOrderId.value, 'pin', pin)

  if (result.success) {
    // Erfolg: Modal schließen
    pinModalOrderId.value = null
    pinModalError.value = null
    pinAttempts.value = 0

    // Guthaben neu laden
    if (!authStore.isAdmin) {
      await creditsStore.fetchBalance()
    }
  } else {
    // Fehler: Versuch zählen, Fehlermeldung anzeigen
    pinAttempts.value++
    const verbleibend = MAX_PIN_ATTEMPTS - pinAttempts.value

    if (pinAttempts.value >= MAX_PIN_ATTEMPTS) {
      pinModalError.value = 'Maximale Versuche erreicht. Bitte lade die Seite neu.'
    } else {
      pinModalError.value = `PIN falsch. Noch ${verbleibend} Versuch${verbleibend === 1 ? '' : 'e'}.`
    }
  }
}

function handlePinCancel() {
  pinModalOrderId.value = null
  pinModalError.value = null
  pinAttempts.value = 0
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20 md:pb-0 md:pl-56 pt-14 md:pt-0">
    <UserHeader />

    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Checkout-Erfolg Modal -->
      <div
        v-if="checkoutSuccess"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        data-testid="purchase-success-modal"
      >
        <div class="bg-card border border-border rounded-xl p-6 max-w-sm w-full text-center">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 class="text-xl font-bold text-foreground mb-2">Vorbestellung aufgegeben!</h2>
          <p class="text-muted-foreground mb-4">Deine Bestellung wurde erstellt. Du kannst sie jetzt am Automaten abholen.</p>

          <div class="bg-muted rounded-lg p-4 mb-4">
            <p class="text-sm text-muted-foreground mb-1">Abholcode (PIN)</p>
            <p class="text-3xl font-bold text-primary tracking-widest" data-testid="pickup-pin">{{ checkoutData?.pickupPin }}</p>
          </div>

          <div class="text-sm text-muted-foreground mb-6">
            <p>Gesamtpreis: <span class="font-semibold">{{ checkoutData?.totalPrice.toFixed(2) }}€</span></p>
          </div>

          <!-- Abholung-Buttons -->
          <div class="flex flex-col gap-3 mb-4">
            <button
              @click="checkoutData && handlePickupNfc(checkoutData.orderId)"
              data-testid="modal-nfc-button"
              class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Mit NFC abholen
            </button>

            <button
              @click="checkoutData && handlePickupPin(checkoutData.orderId)"
              data-testid="modal-pin-button"
              class="w-full bg-card border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              PIN am Automaten eingeben
            </button>
          </div>

          <button
            @click="closeCheckoutSuccess"
            class="w-full text-muted-foreground py-2 text-sm hover:text-foreground transition-colors"
          >
            Jetzt nicht
          </button>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Vorbestellung & Bestellungen</h1>
        <p v-if="pendingCount > 0" class="text-sm text-muted-foreground mt-1">
          {{ pendingCount }} Bestellung{{ pendingCount === 1 ? '' : 'en' }} bereit zur Abholung
        </p>
      </div>

      <!-- ======================================== -->
      <!-- WARENKORB-SEKTION (wenn Artikel vorhanden) -->
      <!-- ======================================== -->
      <div v-if="!cartStore.isEmpty" class="mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-4">Warenkorb</h2>

        <!-- Fehlermeldung -->
        <div
          v-if="checkoutError"
          class="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"
        >
          <p class="text-red-600 dark:text-red-400 text-sm">{{ checkoutError }}</p>
        </div>

        <!-- Warenkorb-Artikel -->
        <div class="space-y-3 mb-4">
          <div
            v-for="item in cartStore.items"
            :key="item.productId"
            class="bg-card border border-border rounded-xl p-4"
          >
            <div class="flex items-center gap-3">
              <!-- Bild -->
              <div class="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              <!-- Name & Preis -->
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-foreground truncate">{{ item.name }}</h3>
                <p class="text-sm text-primary">{{ item.price.toFixed(2) }}€</p>
              </div>

              <!-- Menge-Steuerung -->
              <div class="flex items-center gap-2">
                <button
                  @click="decrementQuantity(item.productId)"
                  class="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Menge verringern"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>

                <span class="w-6 text-center font-medium text-foreground text-sm">{{ item.quantity }}</span>

                <button
                  @click="incrementQuantity(item.productId)"
                  class="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Menge erhöhen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <!-- Zeilenpreis -->
              <div class="text-right min-w-[60px]">
                <p class="font-semibold text-foreground text-sm">{{ (item.price * item.quantity).toFixed(2) }}€</p>
              </div>

              <!-- Entfernen-Button -->
              <button
                @click="removeFromCart(item.productId)"
                class="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
                aria-label="Entfernen"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Zusammenfassung -->
        <div class="bg-card border border-border rounded-xl p-4">
          <!-- Guthaben-Warnung -->
          <div
            v-if="showInsufficientFundsWarning"
            class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3"
          >
            <p class="text-yellow-700 dark:text-yellow-400 text-sm">
              Achtung: Dein Guthaben ({{ creditsStore.balanceNumeric.toFixed(2) }}€) reicht möglicherweise nicht aus.
              Das Guthaben wird beim Abholen am Automaten abgezogen.
            </p>
          </div>

          <!-- Gesamt -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-muted-foreground">Gesamtpreis</span>
            <span class="text-xl font-bold text-foreground">{{ cartTotalPrice.toFixed(2) }}€</span>
          </div>

          <!-- Checkout Button -->
          <button
            @click="handleCheckout"
            :disabled="isCheckingOut || cartStore.isEmpty"
            class="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="checkout-button"
          >
            <svg v-if="isCheckingOut" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isCheckingOut">Wird verarbeitet...</span>
            <span v-else>Vorbestellung aufgeben</span>
          </button>
        </div>
      </div>

      <!-- ======================================== -->
      <!-- AKTIVE VORBESTELLUNGEN -->
      <!-- ======================================== -->

      <!-- Demo-Hinweis -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <span class="font-medium">Demo-Hinweis:</span>
        Dies ist eine Simulation eines Smart-Vending-Systems. Klicke "Mit NFC abholen" um
        den Abholprozess zu simulieren, oder gib deine PIN ein.
      </div>

      <!-- Filter-Dropdown -->
      <div class="flex items-center gap-3 mb-4">
        <label for="order-filter" class="text-sm text-muted-foreground">Filter:</label>
        <select
          id="order-filter"
          v-model="activeFilter"
          class="text-sm border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="order-filter"
        >
          <option
            v-for="option in filterOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Lade-State -->
      <div v-if="purchasesStore.isLoading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="h-36 bg-muted rounded-lg animate-pulse"
        />
      </div>

      <!-- Fehler-State -->
      <div
        v-else-if="purchasesStore.error"
        class="bg-destructive/10 border border-destructive rounded-lg p-4 text-sm text-destructive"
        role="alert"
      >
        {{ purchasesStore.error }}
      </div>

      <!-- Bestellliste -->
      <div v-else-if="filteredOrders.length > 0" class="space-y-3" data-testid="orders-list">
        <OrderCard
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
          :is-picking-up="isOrderPickingUp(order.id)"
          @pickup-nfc="handlePickupNfc"
          @pickup-pin="handlePickupPin"
        />
      </div>

      <!-- Leerer Zustand -->
      <div
        v-else
        class="text-center py-16"
        data-testid="orders-empty"
      >
        <div class="text-6xl mb-4">📦</div>

        <h2 class="text-xl font-semibold text-foreground mb-2">
          <template v-if="activeFilter === 'all'">
            Noch keine Bestellungen
          </template>
          <template v-else-if="activeFilter === 'pending_pickup'">
            Keine Bestellungen bereit
          </template>
          <template v-else-if="activeFilter === 'picked_up'">
            Noch nichts abgeholt
          </template>
          <template v-else>
            Keine stornierten Bestellungen
          </template>
        </h2>

        <p class="text-muted-foreground mb-6 max-w-xs mx-auto">
          <template v-if="activeFilter === 'all'">
            Kaufe deinen ersten Snack und hole ihn am Automaten ab!
          </template>
          <template v-else>
            Wechsle den Filter um andere Bestellungen anzuzeigen.
          </template>
        </p>

        <NuxtLink
          v-if="activeFilter === 'all'"
          to="/dashboard"
          class="inline-flex items-center gap-2 py-2.5 px-5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Zum Produktkatalog
        </NuxtLink>
      </div>
    </div>

    <!-- NFC-Animation (Fullscreen-Overlay) -->
    <NfcPickupAnimation
      :is-visible="showNfcAnimation"
      @done="handleNfcAnimationDone"
    />

    <!-- PIN-Modal -->
    <PinInputModal
      :is-open="pinModalOrderId !== null"
      :error-message="pinModalError ?? undefined"
      :is-locked="isPinLocked"
      :is-loading="purchasesStore.isPickingUp"
      @confirm="handlePinConfirm"
      @cancel="handlePinCancel"
    />
  </div>
</template>
