/**
 * Unit-Tests für useLocalStorage Composable
 * 
 * Testet LocalStorage-Verwaltung:
 * - Persistenz von Suchbegriffen, Kategorien, Produkten
 * - addRecentProduct Funktion
 * - clearAll Funktion
 * - STORAGE_KEYS
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorageState, STORAGE_KEYS } from '~/composables/useLocalStorage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('STORAGE_KEYS', () => {
    it('hat korrekte Storage-Keys definiert', () => {
      expect(STORAGE_KEYS.LAST_SEARCH_QUERY).toBe('snackease_last_search_query')
      expect(STORAGE_KEYS.LAST_SELECTED_CATEGORY).toBe('snackease_last_category')
      expect(STORAGE_KEYS.RECENT_PRODUCTS).toBe('snackease_recent_products')
      expect(STORAGE_KEYS.USER_PREFERENCES).toBe('snackease_user_preferences')
    })
  })

  describe('Initial State', () => {
    it('startet mit leerem Suchbegriff', () => {
      const { lastSearchQuery } = useLocalStorageState()
      
      expect(lastSearchQuery.value).toBe('')
    })

    it('startet mit default Kategorie "alle"', () => {
      const { lastSelectedCategory } = useLocalStorageState()
      
      expect(lastSelectedCategory.value).toBe('alle')
    })

    it('startet mit leerem Recent-Products Array', () => {
      const { recentProducts } = useLocalStorageState()
      
      expect(recentProducts.value).toEqual([])
    })
  })

  describe('lastSearchQuery', () => {
    it('speichert Suchbegriff', () => {
      const { lastSearchQuery } = useLocalStorageState()
      
      lastSearchQuery.value = 'Apfel'
      
      expect(lastSearchQuery.value).toBe('Apfel')
    })
  })

  describe('lastSelectedCategory', () => {
    it('speichert Kategorie', () => {
      const { lastSelectedCategory } = useLocalStorageState()
      
      lastSelectedCategory.value = 'obst'
      
      expect(lastSelectedCategory.value).toBe('obst')
    })

    it('hat "alle" als Default-Wert', () => {
      const { lastSelectedCategory } = useLocalStorageState()
      
      expect(lastSelectedCategory.value).toBe('alle')
    })
  })

  describe('recentProducts', () => {
    it('speichert Produkt-Array', () => {
      const { recentProducts } = useLocalStorageState()
      
      recentProducts.value = [1, 2, 3]
      
      expect(recentProducts.value).toEqual([1, 2, 3])
    })
  })

  describe('addRecentProduct()', () => {
    it('fügt Produkt zu Recent-Liste hinzu', () => {
      const { recentProducts, addRecentProduct } = useLocalStorageState()
      
      addRecentProduct(42)
      
      expect(recentProducts.value).toEqual([42])
    })

    it('fügt neuestes Produkt an erste Position', () => {
      const { recentProducts, addRecentProduct } = useLocalStorageState()
      
      addRecentProduct(1)
      addRecentProduct(2)
      addRecentProduct(3)
      
      expect(recentProducts.value).toEqual([3, 2, 1])
    })

    it('entfernt Duplikate', () => {
      const { recentProducts, addRecentProduct } = useLocalStorageState()
      
      addRecentProduct(1)
      addRecentProduct(2)
      addRecentProduct(1) // Schon vorhanden
      
      expect(recentProducts.value).toEqual([1, 2])
    })

    it('begrenzt auf maximal 10 Produkte', () => {
      const { recentProducts, addRecentProduct } = useLocalStorageState()
      
      for (let i = 1; i <= 15; i++) {
        addRecentProduct(i)
      }
      
      expect(recentProducts.value.length).toBe(10)
      expect(recentProducts.value).toEqual([15, 14, 13, 12, 11, 10, 9, 8, 7, 6])
    })
  })

  describe('clearAll()', () => {
    it('setzt alle Werte auf Defaults zurück', () => {
      const { lastSearchQuery, lastSelectedCategory, recentProducts, clearAll } = useLocalStorageState()
      
      lastSearchQuery.value = 'Test'
      lastSelectedCategory.value = 'obst'
      recentProducts.value = [1, 2, 3]
      
      clearAll()
      
      expect(lastSearchQuery.value).toBe('')
      expect(lastSelectedCategory.value).toBe('alle')
      expect(recentProducts.value).toEqual([])
    })
  })
})
