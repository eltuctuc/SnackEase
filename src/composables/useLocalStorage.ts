/**
 * useLocalStorage - Composable für persistente Storage-Verwaltung
 * 
 * @description
 * Wrapper um VueUse's useStorage für typsichere LocalStorage-Nutzung.
 * 
 * Nutzt VueUse's useStorage für:
 * - ✅ Automatische Serialization/Deserialization
 * - ✅ SSR-Safe (kein window-Check nötig)
 * - ✅ Reaktive Updates (sync zwischen Tabs)
 * - ✅ TypeScript-Support
 * - ✅ Automatisches Error-Handling
 * 
 * @example Einfache Verwendung
 * ```vue
 * <script setup>
 * const { lastSearch, recentProducts } = useLocalStorageState()
 * 
 * // Wert setzen
 * lastSearch.value = 'Apfel'
 * 
 * // Wert lesen
 * console.log(lastSearch.value) // 'Apfel'
 * 
 * // Automatisch persistiert in localStorage!
 * </script>
 * ```
 * 
 * @example Mit Custom-Werten
 * ```vue
 * <script setup>
 * const customValue = useStorage('my-key', 'default-value')
 * </script>
 * ```
 */

import { useStorage } from '@vueuse/core'

/**
 * Storage-Keys für SnackEase
 * 
 * @description
 * Zentrale Definition aller Storage-Keys verhindert Tippfehler
 * und ermöglicht einfaches Refactoring.
 */
export const STORAGE_KEYS = {
  /** Letzter Suchbegriff im Produktkatalog */
  LAST_SEARCH_QUERY: 'snackease_last_search_query',
  
  /** Zuletzt gewählte Kategorie */
  LAST_SELECTED_CATEGORY: 'snackease_last_category',
  
  /** Zuletzt angesehene Produkte (IDs) */
  RECENT_PRODUCTS: 'snackease_recent_products',
  
  /** User-Präferenzen (Dark Mode, etc. - für zukünftige Features) */
  USER_PREFERENCES: 'snackease_user_preferences',
} as const

/**
 * Return-Type von useLocalStorageState
 */
export interface UseLocalStorageStateReturn {
  /** Letzter Suchbegriff (persistiert) */
  lastSearchQuery: Ref<string>
  
  /** Zuletzt gewählte Kategorie (persistiert) */
  lastSelectedCategory: Ref<string>
  
  /** Zuletzt angesehene Produkte (persistiert, max 10) */
  recentProducts: Ref<number[]>
  
  /** Fügt Produkt zu Recent-Liste hinzu */
  addRecentProduct: (productId: number) => void
  
  /** Löscht alle persistierten Daten */
  clearAll: () => void
}

/**
 * Composable für persistente LocalStorage-Verwaltung
 * 
 * @description
 * Bietet typsicheren Zugriff auf häufig verwendete Storage-Values.
 * Alle Werte sind reaktiv und werden automatisch synchronisiert.
 * 
 * @returns Storage-Refs und Utility-Funktionen
 */
export function useLocalStorageState(): UseLocalStorageStateReturn {
  // ========================================
  // STORAGE REFS - VueUse Integration
  // ========================================
  
  /**
   * Letzter Suchbegriff
   * 
   * @description
   * Wird automatisch gespeichert wenn User sucht.
   * Beim nächsten Besuch wird der letzte Suchbegriff wiederhergestellt.
   * 
   * VORTEILE von useStorage (VueUse):
   * - ✅ Automatische Serialization (String/JSON)
   * - ✅ SSR-Safe (kein localStorage-Check nötig)
   * - ✅ Reaktive Updates
   * - ✅ Sync zwischen Browser-Tabs
   */
  const lastSearchQuery = useStorage<string>(
    STORAGE_KEYS.LAST_SEARCH_QUERY,
    '' // Default-Value
  )

  /**
   * Zuletzt gewählte Kategorie
   * 
   * @description
   * Speichert die letzte Kategorie-Auswahl.
   * User sieht beim nächsten Besuch die gleiche Kategorie.
   */
  const lastSelectedCategory = useStorage<string>(
    STORAGE_KEYS.LAST_SELECTED_CATEGORY,
    'alle' // Default: Alle Kategorien
  )

  /**
   * Zuletzt angesehene Produkte (IDs)
   * 
   * @description
   * Array von Produkt-IDs (max 10, neueste zuerst).
   * Wird automatisch als JSON serialisiert/deserialisiert.
   */
  const recentProducts = useStorage<number[]>(
    STORAGE_KEYS.RECENT_PRODUCTS,
    [] // Default: Leeres Array
  )

  // ========================================
  // METHODS
  // ========================================
  
  /**
   * Fügt Produkt zu Recent-Liste hinzu
   * 
   * @param productId - ID des Produkts
   * 
   * @description
   * - Entfernt Duplikate (falls Produkt bereits in Liste)
   * - Fügt Produkt an erste Position ein
   * - Limitiert auf maximal 10 Produkte
   * 
   * @example
   * addRecentProduct(42)
   * // recentProducts.value = [42, ...]
   * 
   * addRecentProduct(42) // Nochmal
   * // recentProducts.value = [42, ...] (keine Duplikate!)
   */
  const addRecentProduct = (productId: number) => {
    // Entferne Duplikat falls vorhanden
    const filtered = recentProducts.value.filter(id => id !== productId)
    
    // Füge an erste Position ein
    filtered.unshift(productId)
    
    // Limitiere auf max 10
    recentProducts.value = filtered.slice(0, 10)
  }

  /**
   * Löscht alle persistierten Daten
   * 
   * @description
   * Setzt alle Storage-Values auf ihre Default-Werte zurück.
   * Nützlich für "Alle Daten löschen"-Feature.
   */
  const clearAll = () => {
    lastSearchQuery.value = ''
    lastSelectedCategory.value = 'alle'
    recentProducts.value = []
  }

  // ========================================
  // RETURN
  // ========================================
  
  return {
    lastSearchQuery,
    lastSelectedCategory,
    recentProducts,
    addRecentProduct,
    clearAll,
  }
}
