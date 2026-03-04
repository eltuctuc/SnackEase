/**
 * Purchases Store - Verwaltung des One-Touch Kaufprozesses (FEAT-7)
 * 
 * @description
 * Dieser Store verwaltet:
 * - Kauf-Prozess (purchase Action)
 * - Aktive Käufe (status='pending_pickup')
 * - Loading- und Error-States
 * - Integration mit Credits Store (Guthaben-Update)
 * 
 * Verwendet Composition API mit setup-Syntax (Best Practice).
 * Alle DB-Operationen erfolgen über Server API Routes (kein direkter DB-Zugriff).
 * 
 * @see src/types/purchase.ts für Type-Definitionen
 * @see src/server/api/purchases.post.ts für Backend-Logik
 */

import type { PurchaseWithProduct, PurchaseResponse } from '~/types'

export const usePurchasesStore = defineStore('purchases', () => {
  // ========================================
  // STATE - Reactive Properties
  // ========================================
  
  /** Liste aller aktiven Käufe (pending_pickup) */
  const activePurchases = ref<PurchaseWithProduct[]>([])
  
  /** Letzter erfolgreicher Kauf (für Success-Modal) */
  const lastPurchase = ref<PurchaseWithProduct | null>(null)
  
  /** Loading-State für UI-Feedback während API-Calls */
  const isLoading = ref(false)
  
  /** Error-State für Fehleranzeige in UI */
  const error = ref<string | null>(null)

  // ========================================
  // ACTIONS - API Calls
  // ========================================
  
  /**
   * Kauft ein Produkt (One-Touch)
   * 
   * @param productId - ID des zu kaufenden Produkts
   * @returns Promise mit PurchaseResponse (success + purchase | error)
   * 
   * @description
   * Führt den Kauf-Prozess durch:
   * 1. API-Call zu POST /api/purchases
   * 2. Bei Erfolg:
   *    - Speichert Purchase in lastPurchase (für Modal)
   *    - Aktualisiert Credits-Store (neues Guthaben)
   *    - Returned { success: true, purchase, newBalance }
   * 3. Bei Fehler:
   *    - Setzt error-State (für Toast)
   *    - Returned { success: false, error }
   * 
   * Integration mit anderen Stores:
   * - useCreditsStore: Guthaben wird automatisch aktualisiert
   * - useProductsStore: Optional, könnte Bestand aktualisieren (FEAT-12)
   * 
   * @see src/server/api/purchases.post.ts
   * @see src/components/dashboard/PurchaseButton.vue für Usage
   */
  async function purchase(productId: number): Promise<PurchaseResponse> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<PurchaseResponse>('/api/purchases', {
        method: 'POST',
        body: { productId },
      })

      if (data.success) {
        // Erfolgreicher Kauf
        lastPurchase.value = data.purchase
        
        // Credits-Store aktualisieren (Guthaben wurde abgezogen)
        const creditsStore = useCreditsStore()
        creditsStore.balance = data.newBalance
        
        return data
      } else {
        // Fehler vom Backend (nicht genug Guthaben, etc.)
        error.value = data.error
        return data
      }
    } catch (err: unknown) {
      // Netzwerk-Fehler oder Server-Fehler
      const e = err as { data?: { message?: string }; message?: string }
      const errorMessage = e.data?.message || e.message || 'Fehler beim Kauf'
      error.value = errorMessage
      
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lädt alle aktiven Käufe des Users
   * 
   * @description
   * Für FEAT-11 (Bestellabholung):
   * - Zeigt Liste aller "pending_pickup" Käufe
   * - Mit PIN, Countdown, Standort
   * 
   * Aktuell nicht benötigt für FEAT-7 MVP,
   * aber vorbereitet für spätere Erweiterung.
   */
  async function fetchActivePurchases() {
    isLoading.value = true
    error.value = null

    try {
      // TODO: GET /api/purchases Endpunkt erstellen (FEAT-11)
      // const data = await $fetch<PurchaseWithProduct[]>('/api/purchases')
      // activePurchases.value = data
      
      // Placeholder für MVP
      activePurchases.value = []
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Laden der Käufe'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Setzt lastPurchase zurück (z.B. nach Modal-Schließen)
   */
  function clearLastPurchase() {
    lastPurchase.value = null
  }

  // ========================================
  // RETURN - Public API
  // ========================================
  
  return {
    // State
    activePurchases,
    lastPurchase,
    isLoading,
    error,
    
    // Actions
    purchase,
    fetchActivePurchases,
    clearLastPurchase,
  }
})
