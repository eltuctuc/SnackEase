<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()
const creditsStore = useCreditsStore()
const productsStore = useProductsStore()

const showRechargeModal = ref(false)
const selectedAmount = ref<string | null>(null)
const isRecharging = ref(false)
const rechargeSuccess = ref(false)
const showProductDetail = ref(false)
const selectedProductDetail = ref<any>(null)
const searchQuery = ref('')

const categories = [
  { id: 'alle', label: 'Alle', icon: '🍎' },
  { id: 'obst', label: 'Obst', icon: '🍎' },
  { id: 'proteinriegel', label: 'Protein', icon: '💪' },
  { id: 'shakes', label: 'Shakes', icon: '🥤' },
  { id: 'schokoriegel', label: 'Schoki', icon: '🍫' },
  { id: 'nuesse', label: 'Nüsse', icon: '🥜' },
  { id: 'getraenke', label: 'Getränke', icon: '🧃' },
]

const RECHARGE_OPTIONS = [
  { amount: '10', label: '10 €', description: 'Klein' },
  { amount: '25', label: '25 €', description: 'Standard' },
  { amount: '50', label: '50 €', description: 'Groß' },
]

const balanceColorClass = computed(() => {
  switch (creditsStore.balanceStatus) {
    case 'good': return 'bg-green-100 border-green-300 text-green-800'
    case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    case 'critical': return 'bg-red-100 border-red-300 text-red-800'
    default: return 'bg-gray-100 border-gray-300 text-gray-800'
  }
})

const balanceDotClass = computed(() => {
  switch (creditsStore.balanceStatus) {
    case 'good': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
})

const logout = () => {
  authStore.logout()
}

const selectAmount = (amount: string) => {
  selectedAmount.value = amount
}

const handleRecharge = async () => {
  if (!selectedAmount.value || isRecharging.value) return

  isRecharging.value = true
  rechargeSuccess.value = false

  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

  const result = await creditsStore.recharge(selectedAmount.value)

  isRecharging.value = false

  if (result.success) {
    rechargeSuccess.value = true
    setTimeout(() => {
      showRechargeModal.value = false
      rechargeSuccess.value = false
      selectedAmount.value = null
    }, 1500)
  }
}

const handleMonthly = async () => {
  if (creditsStore.isLoading) return

  await creditsStore.receiveMonthly()
}

const dismissError = () => {
  creditsStore.error = null
}

const closeModalAndReset = () => {
  showRechargeModal.value = false
  selectedAmount.value = null
  creditsStore.error = null
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showRechargeModal.value) {
    closeModalAndReset()
  }
  if (e.key === 'Escape' && showProductDetail.value) {
    closeProductDetail()
  }
}

onMounted(async () => {
  await authStore.initFromCookie()
  
  if (!authStore.user) {
    router.push('/login')
  } else {
    await creditsStore.fetchBalance()
    await productsStore.fetchProducts()
  }
  
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

const handleSearch = () => {
  productsStore.fetchProducts(productsStore.selectedCategory, searchQuery.value)
}

const selectCategory = (category: string) => {
  productsStore.setCategory(category)
  productsStore.fetchProducts(category, searchQuery.value)
}

const openProductDetail = (product: any) => {
  selectedProductDetail.value = product
  showProductDetail.value = true
}

const closeProductDetail = () => {
  showProductDetail.value = false
  selectedProductDetail.value = null
}

const formatPrice = (price: string) => {
  return parseFloat(price).toFixed(2)
}

const filteredProducts = computed(() => {
  return productsStore.products || []
})

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
