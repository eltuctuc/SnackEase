/**
 * favorites Store (FEAT-18)
 *
 * Verwaltet private Favoriten-Liste + Toggle-State fuer alle Produktkarten.
 * Optimistisches UI: Toggle wirkt sofort im UI, Rollback bei API-Fehler.
 * favoriteIds als Set fuer O(1)-Lookup bei jedem Produktkarten-Render.
 */

import { defineStore } from 'pinia'
import type { Product } from '~/types'

export interface FavoriteProduct extends Product {
  addedAt: string
}

export const useFavoritesStore = defineStore('favorites', () => {
  // ----------------------------------------
  // STATE
  // ----------------------------------------

  /** Private Favoriten-Liste (neueste zuerst) */
  const favoritesRef = ref<FavoriteProduct[]>([])

  /**
   * Set mit Produkt-IDs fuer O(1)-Lookup.
   * Wird synchron mit favoritesRef gehalten.
   */
  const favoriteIds = ref<Set<number>>(new Set())

  const isLoading = ref(false)

  /**
   * Spezifischer Fehler fuer das 10er-Limit (REQ-17).
   * Wird nach 5 Sekunden automatisch zurueckgesetzt.
   */
  const limitError = ref<string | null>(null)

  let limitErrorTimeout: ReturnType<typeof setTimeout> | null = null

  // ----------------------------------------
  // COMPUTED
  // ----------------------------------------

  const count = computed(() => favoritesRef.value.length)

  // ----------------------------------------
  // HELPERS
  // ----------------------------------------

  /**
   * Prueft ob ein Produkt in den Favoriten ist (O(1)-Lookup).
   */
  function isFavorite(productId: number): boolean {
    return favoriteIds.value.has(productId)
  }

  /**
   * Setzt limitError und startet 5-Sekunden-Auto-Reset-Timer.
   */
  function setLimitError(message: string): void {
    limitError.value = message
    if (limitErrorTimeout) clearTimeout(limitErrorTimeout)
    limitErrorTimeout = setTimeout(() => {
      limitError.value = null
    }, 5000)
  }

  /**
   * Baut favoriteIds-Set aus favoritesRef neu auf.
   * Muss nach jedem favoritesRef-Update aufgerufen werden.
   */
  function syncFavoriteIds(): void {
    favoriteIds.value = new Set(favoritesRef.value.map(f => f.id))
  }

  // ----------------------------------------
  // ACTIONS
  // ----------------------------------------

  /**
   * Laedt die private Favoriten-Liste des eingeloggten Nutzers.
   * Wird in onMounted() des Dashboards aufgerufen (parallel zu anderen Fetches).
   */
  async function fetchFavorites(): Promise<void> {
    isLoading.value = true

    try {
      const response = await $fetch<{ favorites: FavoriteProduct[] }>('/api/favorites')
      favoritesRef.value = response.favorites
      syncFavoriteIds()
    } catch (e: unknown) {
      console.error('fetchFavorites error:', e)
      // Kein globaler Error-State da fetchFavorites im Hintergrund laeuft
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggelt den Favoriten-Status fuer ein Produkt (optimistisches UI mit Rollback).
   *
   * Pattern:
   * 1. isFavorite(productId) pruefen
   * 2. Wenn noch kein Favorit: favoriteIds + favorites[] sofort erweitern
   * 3. Wenn bereits Favorit: favoriteIds + favorites[] sofort verkleinern
   * 4. API-Call absenden
   * 5. Bei Fehler (inkl. 422 Limit): Optimistisches Update zuruecksetzen
   * 6. limitError bei 422 setzen
   */
  async function toggleFavorite(productId: number, productData: Product): Promise<void> {
    const wasAlreadyFavorite = isFavorite(productId)

    if (wasAlreadyFavorite) {
      // ---- REMOVE OPTIMISTISCH ----
      const snapshotFavorites = [...favoritesRef.value]
      favoritesRef.value = favoritesRef.value.filter(f => f.id !== productId)
      syncFavoriteIds()

      try {
        await $fetch(`/api/favorites/${productId}`, { method: 'DELETE' })
      } catch (e: unknown) {
        // Rollback
        favoritesRef.value = snapshotFavorites
        syncFavoriteIds()
        console.error('toggleFavorite (remove) error:', e)
      }
    } else {
      // ---- ADD OPTIMISTISCH ----
      // Limit-Pruefung clientseitig (verhindert unnoetige API-Calls)
      if (count.value >= 10) {
        setLimitError(
          'Maximale Anzahl von 10 Favoriten erreicht. Bitte entferne zuerst ein Produkt aus deinen Favoriten.'
        )
        return
      }

      const snapshotFavorites = [...favoritesRef.value]

      // Optimistisch hinzufuegen (neuestes zuerst)
      const newFavorite: FavoriteProduct = {
        ...productData,
        addedAt: new Date().toISOString(),
      }
      favoritesRef.value = [newFavorite, ...favoritesRef.value]
      syncFavoriteIds()

      try {
        await $fetch('/api/favorites', {
          method: 'POST',
          body: { productId },
        })
      } catch (e: unknown) {
        // Rollback
        favoritesRef.value = snapshotFavorites
        syncFavoriteIds()

        const err = e as { statusCode?: number; message?: string; data?: { message?: string } }
        if (err.statusCode === 422) {
          const message =
            err.data?.message ??
            err.message ??
            'Maximale Anzahl von 10 Favoriten erreicht. Bitte entferne zuerst ein Produkt aus deinen Favoriten.'
          setLimitError(message)
        } else {
          console.error('toggleFavorite (add) error:', e)
        }
      }
    }
  }

  /**
   * Schliesst die Limit-Fehlermeldung manuell.
   */
  function dismissLimitError(): void {
    limitError.value = null
    if (limitErrorTimeout) {
      clearTimeout(limitErrorTimeout)
      limitErrorTimeout = null
    }
  }

  return {
    favorites: favoritesRef,
    favoriteIds,
    isLoading,
    limitError,
    count,
    isFavorite,
    fetchFavorites,
    toggleFavorite,
    dismissLimitError,
  }
})
