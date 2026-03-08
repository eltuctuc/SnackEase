<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useCreditsStore } from '~/stores/credits'

const cartStore = useCartStore()
const authStore = useAuthStore()
const creditsStore = useCreditsStore()

const isCheckingOut = ref(false)
const checkoutError = ref<string | null>(null)
const checkoutSuccess = ref(false)
const checkoutData = ref<{
  orderId: number
  pickupPin: string
  expiresAt: string
  totalPrice: number
} | null>(null)

// Gateway laden
onMounted(async () => {
  await creditsStore.fetchBalance()
})

// Gesamtpreis
const totalPrice = computed(() => cartStore.totalPrice)

// Guthaben
const currentBalance = computed(() => creditsStore.balance)

// Warnung wenn Guthaben möglicherweise nicht ausreicht
const showInsufficientFundsWarning = computed(() => {
  if (currentBalance.value === null) return false
  return totalPrice.value > parseFloat(currentBalance.value.toString())
})

// Checkout-Funktion
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

// Menge erhöhen
function incrementQuantity(productId: number) {
  const item = cartStore.items.find(i => i.productId === productId)
  if (item) {
    cartStore.updateQuantity(productId, item.quantity + 1)
  }
}

// Menge verringern
function decrementQuantity(productId: number) {
  const item = cartStore.items.find(i => i.productId === productId)
  if (item) {
    cartStore.updateQuantity(productId, item.quantity - 1)
  }
}

// Produkt entfernen
function removeProduct(productId: number) {
  cartStore.removeItem(productId)
}

// Erfolgsmeldung schließen
function closeSuccess() {
  checkoutSuccess.value = false
  checkoutData.value = null
}
</script>

<template>
  <div class="pb-20">
    <!-- Erfolgsmeldung nach Checkout -->
    <div
      v-if="checkoutSuccess"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
          <p class="text-3xl font-bold text-primary tracking-widest">{{ checkoutData?.pickupPin }}</p>
        </div>

        <div class="text-sm text-muted-foreground mb-6">
          <p>Gesamtpreis: <span class="font-semibold">{{ checkoutData?.totalPrice.toFixed(2) }}€</span></p>
        </div>

        <button
          @click="closeSuccess"
          class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Verstanden
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="p-4 pb-2">
      <h1 class="text-2xl font-bold text-foreground">Warenkorb</h1>
      <p class="text-muted-foreground text-sm">
        {{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'Artikel' : 'Artikel' }}
      </p>
    </div>

    <!-- Warenkorb leer -->
    <div v-if="cartStore.isEmpty" class="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <svg class="w-20 h-20 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <h2 class="text-lg font-semibold text-foreground mb-2">Dein Warenkorb ist leer</h2>
      <p class="text-muted-foreground mb-4">Entdecke unsere Produkte und lege sie in den Warenkorb.</p>
      <NuxtLink
        to="/dashboard"
        class="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        Zum Produktkatalog
      </NuxtLink>
    </div>

    <!-- Warenkorb Inhalt -->
    <div v-else class="px-4 pb-32">
      <!-- Fehlermeldung -->
      <div
        v-if="checkoutError"
        class="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"
      >
        <p class="text-red-600 dark:text-red-400 text-sm">{{ checkoutError }}</p>
      </div>

      <!-- Produkte -->
      <div class="space-y-3">
        <div
          v-for="item in cartStore.items"
          :key="item.productId"
          class="bg-card border border-border rounded-xl p-4"
        >
          <div class="flex gap-4">
            <!-- Bild -->
            <div class="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">{{ item.name }}</h3>
              <p class="text-primary font-medium">{{ item.price.toFixed(2) }}€</p>

              <!-- Menge + Buttons -->
              <div class="flex items-center gap-3 mt-2">
                <button
                  @click="decrementQuantity(item.productId)"
                  class="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Menge verringern"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>

                <span class="w-8 text-center font-medium text-foreground">{{ item.quantity }}</span>

                <button
                  @click="incrementQuantity(item.productId)"
                  class="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                  aria-label="Menge erhöhen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <button
                  @click="removeProduct(item.productId)"
                  class="ml-auto w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
                  aria-label="Entfernen"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Zeilenpreis -->
            <div class="text-right">
              <p class="font-semibold text-foreground">{{ (item.price * item.quantity).toFixed(2) }}€</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Zusammenfassung -->
      <div class="fixed bottom-[68px] left-0 right-0 bg-card border-t border-border p-4">
        <div class="max-w-7xl mx-auto">
          <!-- Guthaben-Warnung -->
          <div
            v-if="showInsufficientFundsWarning"
            class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3"
          >
            <p class="text-yellow-700 dark:text-yellow-400 text-sm">
              Achtung: Dein Guthaben ({{ currentBalance?.toFixed(2) }}€) reicht möglicherweise nicht aus.
              Das Guthaben wird beim Abholen am Automaten abgezogen.
            </p>
          </div>

          <!-- Gesamt -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-muted-foreground">Gesamtpreis</span>
            <span class="text-xl font-bold text-foreground">{{ totalPrice.toFixed(2) }}€</span>
          </div>

          <!-- Checkout Button -->
          <button
            @click="handleCheckout"
            :disabled="isCheckingOut || cartStore.isEmpty"
            class="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  </div>
</template>
