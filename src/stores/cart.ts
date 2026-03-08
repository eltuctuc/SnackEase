import { defineStore } from 'pinia'

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)

  // Computed: Anzahl der Artikel im Warenkorb
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // Computed: Gesamtsumme
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  // Artikel zum Warenkorb hinzufuegen
  function addItem(product: Omit<CartItem, 'quantity'>, quantity: number = 1) {
    const existingItem = items.value.find(item => item.productId === product.productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      })
    }
  }

  // Artikelmenge aendern
  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  // Artikel aus Warenkorb entfernen
  function removeItem(productId: number) {
    const index = items.value.findIndex(i => i.productId === productId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  // Warenkorb leeren
  function clearCart() {
    items.value = []
  }

  // Warenkorb vom Server laden ( fuer FEAT-16)
  async function fetchCart() {
    isLoading.value = true
    try {
      const data = await $fetch<CartItem[]>('/api/cart')
      if (data) {
        items.value = data
      }
    } catch (error) {
      console.error('Fehler beim Laden des Warenkorbs:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Warenkorb auf Server speichern ( fuer FEAT-16)
  async function saveCart() {
    try {
      await $fetch('/api/cart', {
        method: 'POST',
        body: { items: items.value }
      })
    } catch (error) {
      console.error('Fehler beim Speichern des Warenkorbs:', error)
    }
  }

  return {
    items,
    isLoading,
    itemCount,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    saveCart
  }
})
