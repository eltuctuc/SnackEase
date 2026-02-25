<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/lib/supabase'
import type { Product, Purchase } from '@/lib/types'

const userStore = useUserStore()
const products = ref<Product[]>([])
const purchases = ref<Purchase[]>([])
const isLoading = ref(false)
const selectedCategory = ref<string>('all')
const searchQuery = ref('')

const categories = [
  { id: 'all', label: 'Alle', icon: '🍽️' },
  { id: 'obst', label: 'Obst', icon: '🍎' },
  { id: 'proteinriegel', label: 'Protein', icon: '💪' },
  { id: 'shakes', label: 'Shakes', icon: '🥤' },
  { id: 'schokoriegel', label: 'Schoko', icon: '🍫' },
  { id: 'nüsse', label: 'Nüsse', icon: '🥜' },
  { id: 'getränke', label: 'Getränke', icon: '🧃' },
]

const filteredProducts = computed(() => {
  let result = products.value
  
  if (selectedCategory.value !== 'all') {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(query))
  }
  
  return result
})

import { computed } from 'vue'

async function loadProducts() {
  const { data } = await supabase.from('products').select('*').order('name')
  if (data) {
    products.value = data as Product[]
  }
}

async function buyProduct(product: Product) {
  if (!userStore.currentUser) return
  if (userStore.currentUser.credit < product.price) {
    alert('Nicht genug Guthaben!')
    return
  }
  
  isLoading.value = true
  
  try {
    // Deduct credit
    await userStore.updateCredit(-product.price)
    
    // Calculate health points
    const healthPoints: Record<string, number> = {
      obst: 3,
      nüsse: 2,
      proteinriegel: 2,
      shakes: 2,
      schokoriegel: 1,
      getränke: 1,
    }
    const points = healthPoints[product.category] || 1
    
    // Save purchase
    const purchase: Partial<Purchase> = {
      user_id: userStore.currentUser.id,
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      health_points: points,
      created_at: new Date().toISOString(),
    }
    
    await supabase.from('purchases').insert(purchase)
    await loadPurchases()
    
    alert(`✓ ${product.name} gekauft! +${points} Punkte`)
  } catch (error) {
    console.error('Purchase failed:', error)
    alert('Kauf fehlgeschlagen!')
  } finally {
    isLoading.value = false
  }
}

async function loadPurchases() {
  if (!userStore.currentUser) return
  const { data } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userStore.currentUser.id)
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (data) {
    purchases.value = data as Purchase[]
  }
}

onMounted(async () => {
  await userStore.loadUsers()
  userStore.loadFromSession()
  await loadProducts()
  await loadPurchases()
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Willkommen{{ userStore.currentUser ? ', ' + userStore.currentUser.name : '' }}!</h2>
    
    <!-- Search -->
    <div class="mb-6">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Produkte suchen..."
        class="w-full px-4 py-2 rounded-lg border border-input bg-background"
      />
    </div>
    
    <!-- Categories -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="selectedCategory = cat.id"
        :class="[
          'px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
          selectedCategory === cat.id 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        ]"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>
    
    <!-- Products Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-card rounded-lg border border-border p-4 shadow-card-sm"
      >
        <div class="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
          <span class="text-4xl">🍎</span>
        </div>
        <h3 class="font-semibold text-sm mb-1">{{ product.name }}</h3>
        <div class="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{{ product.calories }} kcal</span>
          <span v-if="product.is_vegan" class="text-green-600">🌱</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold text-lg">{{ product.price }}€</span>
          <button
            @click="buyProduct(product)"
            :disabled="isLoading || userStore.currentUser!.credit < product.price"
            class="bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            Kaufen
          </button>
        </div>
      </div>
    </div>
    
    <!-- Recent Purchases -->
    <div v-if="purchases.length > 0" class="bg-card rounded-lg border border-border p-4">
      <h3 class="font-bold mb-4">Letzte Käufe</h3>
      <div class="space-y-2">
        <div 
          v-for="purchase in purchases" 
          :key="purchase.id"
          class="flex items-center justify-between text-sm"
        >
          <span>{{ purchase.product_name }}</span>
          <span class="text-muted-foreground">-{{ purchase.price }}€</span>
        </div>
      </div>
    </div>
  </div>
</template>
