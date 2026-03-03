/**
 * Products Store - Verwaltung des Produktkatalogs
 * 
 * @description
 * Dieser Store verwaltet:
 * - Produkt-Liste mit Filtern (Kategorie, Suche)
 * - Aktuell ausgewähltes Produkt (für Detail-Ansicht)
 * - Loading- und Error-States
 * 
 * Verwendet Composition API mit setup-Syntax (Best Practice).
 * 
 * @see src/types/product.ts für Product-Interface
 */

import type { Product } from '~/types'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const selectedProduct = ref<Product | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedCategory = ref<string>('alle')
  const searchQuery = ref<string>('')

  async function fetchProducts(category?: string, search?: string) {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (category && category !== 'alle') {
        queryParams.set('category', category)
      }
      if (search) {
        queryParams.set('search', search)
      }

      const queryString = queryParams.toString()
      const url = queryString ? `/api/products?${queryString}` : '/api/products'

      const data = await $fetch<Product[]>(url)
      products.value = data
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Laden der Produkte'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProductById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Product>(`/api/products/${id}`)
      selectedProduct.value = data
      return data
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Laden des Produkts'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function setCategory(category: string) {
    selectedCategory.value = category
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  return {
    products,
    selectedProduct,
    isLoading,
    error,
    selectedCategory,
    searchQuery,
    fetchProducts,
    fetchProductById,
    setCategory,
    setSearch,
  }
})
