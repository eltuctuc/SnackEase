/**
 * recommendations Store (FEAT-18)
 *
 * Verwaltet Top-10-Empfehlungen + Toggle-State.
 * Optimistisches UI: Toggle wirkt sofort im UI, Rollback bei API-Fehler.
 */

import { defineStore } from 'pinia'
import type { Product } from '~/types'

export interface RecommendedProduct extends Product {
  recommendationCount: number
  isRecommendedByMe: boolean
}

export const useRecommendationsStore = defineStore('recommendations', () => {
  // ----------------------------------------
  // STATE
  // ----------------------------------------

  /** Top-10 empfohlene Produkte */
  const products = ref<RecommendedProduct[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ----------------------------------------
  // ACTIONS
  // ----------------------------------------

  /**
   * Laedt die Top-10-Empfehlungsliste vom Server.
   * Wird lazy geladen (erst wenn Tab "Empfohlen" aktiviert wird).
   */
  async function fetchTopRecommendations(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ products: RecommendedProduct[] }>('/api/recommendations')
      products.value = response.products
    } catch (e: unknown) {
      const err = e as { message?: string }
      error.value = err.message ?? 'Fehler beim Laden der Empfehlungen'
      console.error('fetchTopRecommendations error:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggelt die Empfehlung fuer ein Produkt (optimistisches UI mit Rollback).
   *
   * Pattern:
   * 1. Snapshot des aktuellen Zustands merken
   * 2. UI sofort aktualisieren (optimistisch)
   * 3. API-Call absenden
   * 4. Bei Fehler: Snapshot wiederherstellen
   * 5. Bei Erfolg: recommendationCount aus API-Response uebernehmen
   */
  async function toggleRecommendation(productId: number): Promise<void> {
    const productIndex = products.value.findIndex(p => p.id === productId)

    if (productIndex === -1) {
      // Produkt nicht in Top-10 — nur API-Call ohne UI-Update
      try {
        await $fetch('/api/recommendations', {
          method: 'POST',
          body: { productId },
        })
      } catch {
        // Silent ignore fuer 409 (bereits empfohlen)
      }
      return
    }

    // Snapshot fuer Rollback
    const snapshot = products.value[productIndex]
    const wasRecommended = snapshot.isRecommendedByMe

    // Optimistisches UI-Update
    products.value[productIndex] = {
      ...snapshot,
      isRecommendedByMe: !wasRecommended,
      recommendationCount: wasRecommended
        ? snapshot.recommendationCount - 1
        : snapshot.recommendationCount + 1,
    }

    try {
      if (wasRecommended) {
        // Empfehlung zurueckziehen
        const result = await $fetch<{ success: boolean; recommendationCount: number }>(
          `/api/recommendations/${productId}`,
          { method: 'DELETE' }
        )
        // Kanonischen Wert vom Server uebernehmen
        if (products.value[productIndex]) {
          products.value[productIndex] = {
            ...products.value[productIndex],
            recommendationCount: result.recommendationCount,
          }
        }
      } else {
        // Empfehlung hinzufuegen
        const result = await $fetch<{ success: boolean; recommendationCount: number }>(
          '/api/recommendations',
          { method: 'POST', body: { productId } }
        )
        // Kanonischen Wert vom Server uebernehmen
        if (products.value[productIndex]) {
          products.value[productIndex] = {
            ...products.value[productIndex],
            recommendationCount: result.recommendationCount,
          }
        }
      }
    } catch (e: unknown) {
      const err = e as { statusCode?: number }
      // 409: Bereits empfohlen — silent ignore, Rollback
      if (err.statusCode === 409) {
        products.value[productIndex] = snapshot
        return
      }
      // Alle anderen Fehler: Rollback
      products.value[productIndex] = snapshot
      console.error('toggleRecommendation error:', e)
    }
  }

  /**
   * Aktualisiert isRecommendedByMe und recommendationCount fuer ein einzelnes Produkt
   * in der Top-10-Liste (wird vom ProductDetailModal aufgerufen nach Toggle).
   */
  function updateProductRecommendationState(
    productId: number,
    isRecommendedByMe: boolean,
    recommendationCount: number,
  ): void {
    const productIndex = products.value.findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      products.value[productIndex] = {
        ...products.value[productIndex],
        isRecommendedByMe,
        recommendationCount,
      }
    }
  }

  return {
    products,
    isLoading,
    error,
    fetchTopRecommendations,
    toggleRecommendation,
    updateProductRecommendationState,
  }
})
