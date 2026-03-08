<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const productId = route.params.id

// Cart Store
const cartStore = useCartStore()

// Produktdaten (Platzhalter fuer FEAT-16)
const product = ref({
  id: Number(productId),
  name: 'Beispiel-Produkt',
  description: 'Dies ist ein Beispielprodukt mit leckerem Geschmack.',
  price: 2.50,
  calories: 150,
  fat: 8,
  sugar: 12,
  image: '/images/snacks/placeholder.png'
})

// Mengenauswahl
const quantity = ref(1)

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function increaseQuantity() {
  quantity.value++
}

function addToCart() {
  cartStore.addItem({
    productId: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image
  }, quantity.value)
}
</script>

<template>
  <div class="pb-24">
    <!-- Produktbild-Bereich (Platzhalter) -->
    <div class="bg-muted h-64 flex items-center justify-center">
      <span class="text-muted-foreground">Produktbild</span>
    </div>

    <!-- Produktinfos -->
    <div class="p-4 space-y-4">
      <!-- Kategorie + Name -->
      <div>
        <span class="text-xs text-muted-foreground uppercase tracking-wide">Snacks</span>
        <h1 class="text-2xl font-bold text-foreground">{{ product.name }}</h1>
      </div>

      <!-- Mengenauswahl -->
      <div class="flex items-center justify-between py-3 border-y border-border">
        <span class="font-medium">Menge</span>
        <div class="flex items-center gap-3">
          <button
            @click="decreaseQuantity"
            :disabled="quantity <= 1"
            class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          <span class="w-8 text-center font-medium text-lg">{{ quantity }}</span>
          <button
            @click="increaseQuantity"
            class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Produktbeschreibung -->
      <div>
        <h2 class="font-semibold mb-2">Beschreibung</h2>
        <p class="text-muted-foreground">{{ product.description }}</p>
      </div>

      <!-- Naehrwert-Infos -->
      <div>
        <h2 class="font-semibold mb-2">Naehrwerte (pro 100g)</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-3 bg-muted rounded-lg">
            <div class="text-lg font-bold">{{ product.calories }}</div>
            <div class="text-xs text-muted-foreground">Kalorien</div>
          </div>
          <div class="text-center p-3 bg-muted rounded-lg">
            <div class="text-lg font-bold">{{ product.fat }}g</div>
            <div class="text-xs text-muted-foreground">Fett</div>
          </div>
          <div class="text-center p-3 bg-muted rounded-lg">
            <div class="text-lg font-bold">{{ product.sugar }}g</div>
            <div class="text-xs text-muted-foreground">Zucker</div>
          </div>
        </div>
      </div>

      <!-- Vorbestellen Button -->
      <button
        @click="addToCart"
        class="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Vorbestellen - {{ (product.price * quantity).toFixed(2) }} EUR
      </button>
    </div>
  </div>
</template>
