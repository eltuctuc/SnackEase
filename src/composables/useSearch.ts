/**
 * useSearch - Composable für Suche und Filter
 * 
 * @description
 * Wiederverwendbare Logik für Search/Filter-Funktionalität:
 * - Search-Query-Management
 * - Debouncing für Auto-Search
 * - Filter-State-Management
 * - Kombinierte Query-Building
 * 
 * @example Basic Usage
 * ```vue
 * <script setup>
 * const { query, filter, search, setFilter } = useSearch({
 *   onSearch: (searchQuery, filterValue) => {
 *     productsStore.fetchProducts(filterValue, searchQuery)
 *   }
 * })
 * 
 * // In Template:
 * <input v-model="query" @keyup.enter="search" />
 * <button @click="setFilter('obst')">Obst</button>
 * </script>
 * ```
 * 
 * @example Mit Auto-Search (Debouncing)
 * ```vue
 * <script setup>
 * const { query } = useSearch({
 *   autoSearch: true,
 *   debounceMs: 500, // Suche nach 500ms Pause
 *   onSearch: (q, f) => fetch(q, f)
 * })
 * 
 * // Sucht automatisch während Typing
 * </script>
 * ```
 */

import { ref, watch } from 'vue'

/**
 * Optionen für useSearch Composable
 */
export interface UseSearchOptions {
  /**
   * Initialer Suchbegriff
   * @default ''
   */
  initialQuery?: string
  
  /**
   * Initialer Filter-Wert
   * @default ''
   */
  initialFilter?: string
  
  /**
   * Aktiviert automatische Suche während Typing (mit Debouncing)
   * @default false
   */
  autoSearch?: boolean
  
  /**
   * Debounce-Delay in Millisekunden für Auto-Search
   * @default 300
   */
  debounceMs?: number
  
  /**
   * Callback der bei Suche aufgerufen wird
   * 
   * @param query - Suchbegriff
   * @param filter - Aktueller Filter-Wert
   */
  onSearch?: (query: string, filter: string) => void
  
  /**
   * Callback der bei Filter-Änderung aufgerufen wird
   * 
   * @param filter - Neuer Filter-Wert
   */
  onFilterChange?: (filter: string) => void
}

/**
 * Return-Type von useSearch
 */
export interface UseSearchReturn {
  /** Aktueller Suchbegriff (reactive) */
  query: Ref<string>
  
  /** Aktueller Filter-Wert (reactive) */
  filter: Ref<string>
  
  /** Triggert Suche mit aktuellem Query und Filter */
  search: () => void
  
  /** Setzt neuen Filter-Wert und triggert optional Suche */
  setFilter: (newFilter: string, triggerSearch?: boolean) => void
  
  /** Resettet Query und Filter auf Initial-Werte */
  reset: () => void
  
  /** Löscht nur den Suchbegriff (behält Filter) */
  clearQuery: () => void
}

/**
 * Composable für Search/Filter-State-Management
 * 
 * @param options - Optionale Konfiguration
 * @returns Search-State und Control-Funktionen
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    initialQuery = '',
    initialFilter = '',
    autoSearch = false,
    debounceMs = 300,
    onSearch,
    onFilterChange,
  } = options

  // ========================================
  // STATE
  // ========================================
  
  /** Aktueller Suchbegriff */
  const query = ref(initialQuery)
  
  /** Aktueller Filter-Wert (z.B. Kategorie) */
  const filter = ref(initialFilter)
  
  /** Debounce-Timer für Auto-Search */
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  // ========================================
  // METHODS
  // ========================================
  
  /**
   * Führt Suche mit aktuellem Query und Filter aus
   * 
   * @description
   * Ruft onSearch-Callback mit aktuellen Werten auf.
   * Wird getriggert durch:
   * - Manuellen search()-Call
   * - Auto-Search (mit Debouncing)
   * - Filter-Änderung (optional)
   */
  const search = () => {
    onSearch?.(query.value, filter.value)
  }

  /**
   * Setzt neuen Filter-Wert
   * 
   * @param newFilter - Neuer Filter-Wert (z.B. 'obst', 'shakes')
   * @param triggerSearch - Ob Suche direkt getriggert werden soll
   * 
   * @description
   * - Aktualisiert filter-State
   * - Ruft onFilterChange-Callback auf
   * - Triggert optional Suche (Standard: true)
   */
  const setFilter = (newFilter: string, triggerSearch = true) => {
    filter.value = newFilter
    onFilterChange?.(newFilter)
    
    if (triggerSearch) {
      search()
    }
  }

  /**
   * Resettet Query und Filter auf Initial-Werte
   * 
   * @description
   * Nützlich für "Alle Filter zurücksetzen"-Button.
   * Triggert Suche mit Initial-Werten.
   */
  const reset = () => {
    query.value = initialQuery
    filter.value = initialFilter
    search()
  }

  /**
   * Löscht nur den Suchbegriff
   * 
   * @description
   * Behält Filter bei, löscht nur Query.
   * Nützlich für "X"-Button im Suchfeld.
   */
  const clearQuery = () => {
    query.value = ''
    search()
  }

  // ========================================
  // AUTO-SEARCH (mit Debouncing)
  // ========================================
  
  /**
   * Watcher für Auto-Search während Typing
   * 
   * @description
   * Wenn autoSearch aktiviert ist:
   * - Wartet debounceMs nach letzter Änderung
   * - Triggert dann automatisch Suche
   * 
   * Verhindert API-Call bei jedem Tastendruck!
   * 
   * BEISPIEL:
   * User tippt "Apfel":
   * - "A" → Warte 300ms
   * - "p" → Reset Timer, warte 300ms
   * - "f" → Reset Timer, warte 300ms
   * - "e" → Reset Timer, warte 300ms
   * - "l" → Reset Timer, warte 300ms
   * - 300ms Pause → Suche nach "Apfel"
   */
  if (autoSearch) {
    watch(query, () => {
      // Clear existierenden Timer
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
      
      // Neuer Timer: Suche nach Pause
      debounceTimeout = setTimeout(() => {
        search()
      }, debounceMs)
    })
  }

  // ========================================
  // RETURN
  // ========================================
  
  return {
    query,
    filter,
    search,
    setFilter,
    reset,
    clearQuery,
  }
}
