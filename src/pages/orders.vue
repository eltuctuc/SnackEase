<!--
  Bestellübersicht — /orders (FEAT-11)

  Zeigt alle Bestellungen des eingeloggten Nutzers:
  - Filter-Dropdown (Alle / Bereit / Abgeholt / Storniert)
  - Leerer Zustand wenn keine Bestellungen vorhanden
  - NFC-Abholung direkt auf der Seite
  - PIN-Abholung über Modal
  - Demo-Hinweis für Tester

  @page
-->

<script setup lang="ts">
import OrderCard from '~/components/orders/OrderCard.vue'
import PinInputModal from '~/components/orders/PinInputModal.vue'
import NfcPickupAnimation from '~/components/orders/NfcPickupAnimation.vue'
import type { PurchaseWithProduct } from '~/types'

// ========================================
// ROUTER & STORES
// ========================================

const router = useRouter()
const authStore = useAuthStore()
const purchasesStore = usePurchasesStore()
const creditsStore = useCreditsStore()

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

  // Bestellungen laden
  await purchasesStore.fetchOrders()

  // Guthaben laden (für Header-Anzeige nach möglicher Rückerstattung)
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
const filteredOrders = computed((): PurchaseWithProduct[] => {
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
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Meine Bestellungen</h1>
        <p v-if="pendingCount > 0" class="text-sm text-muted-foreground mt-1">
          {{ pendingCount }} Bestellung{{ pendingCount === 1 ? '' : 'en' }} bereit zur Abholung
        </p>
      </div>

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
