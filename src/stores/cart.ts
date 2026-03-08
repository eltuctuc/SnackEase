import { defineStore } from 'pinia'

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
}

const STORAGE_PREFIX = 'snackease_cart_'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const userId = ref<number | null>(null)

  // Storage-Key basierend auf User-ID
  const storageKey = computed(() => {
    return userId.value ? `${STORAGE_PREFIX}${userId.value}` : null
  })

  // Computed: Anzahl der Artikel im Warenkorb
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // Computed: Gesamtsumme
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  // Computed: Ist Warenkorb leer?
  const isEmpty = computed(() => items.value.length === 0)

  // Warenkorb aus localStorage laden
  function loadFromStorage() {
    if (!storageKey.value) return

    try {
      const stored = localStorage.getItem(storageKey.value)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          items.value = parsed
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Warenkorbs aus localStorage:', error)
    }
  }

  // Warenkorb in localStorage speichern
  function saveToStorage() {
    if (!storageKey.value) return

    try {
      localStorage.setItem(storageKey.value, JSON.stringify(items.value))
    } catch (error) {
      console.error('Fehler beim Speichern des Warenkorbs in localStorage:', error)
    }
  }

  // User-ID setzen und Warenkorb laden
  function setUserId(id: number) {
    userId.value = id
    loadFromStorage()
  }

  // Warenkorb leeren und Storage löschen
  function clearCart() {
    items.value = []
    if (storageKey.value) {
      localStorage.removeItem(storageKey.value)
    }
  }

  // Warenkorb-Key löschen (bei Logout)
  function logout() {
    clearCart()
    userId.value = null
  }

  // Artikel zum Warenkorb hinzufügen
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

    saveToStorage()
  }

  // Artikelmenge ändern
  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
        saveToStorage()
      }
    }
  }

  // Artikel aus Warenkorb entfernen
  function removeItem(productId: number) {
    const index = items.value.findIndex(i => i.productId === productId)
    if (index !== -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  // Prüfen ob Produkt im Warenkorb ist
  function hasProduct(productId: number): boolean {
    return items.value.some(item => item.productId === productId)
  }

  // Produktmenge im Warenkorb abrufen
  function getQuantity(productId: number): number {
    const item = items.value.find(i => i.productId === productId)
    return item?.quantity ?? 0
  }

  return {
    items,
    isLoading,
    itemCount,
    totalPrice,
    isEmpty,
    storageKey,
    setUserId,
    clearCart,
    logout,
    addItem,
    updateQuantity,
    removeItem,
    hasProduct,
    getQuantity,
    loadFromStorage,
    saveToStorage
  }
})
