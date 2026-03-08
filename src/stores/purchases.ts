/**
 * Purchases Store - Verwaltung des One-Touch Kaufprozesses (FEAT-7)
 * und Bestellabholung (FEAT-11)
 *
 * @description
 * Dieser Store verwaltet:
 * - Kauf-Prozess (purchase Action)
 * - Alle Bestellungen des Users (allOrders)
 * - Abholungs-Prozess (pickupOrder)
 * - Loading- und Error-States
 * - Integration mit Credits Store (Guthaben-Update)
 *
 * Verwendet Composition API mit setup-Syntax (Best Practice).
 * Alle DB-Operationen erfolgen über Server API Routes (kein direkter DB-Zugriff).
 *
 * @see src/types/purchase.ts für Type-Definitionen
 * @see src/server/api/purchases.post.ts für Backend-Logik
 * @see src/server/api/orders/index.get.ts für Bestellungen laden
 * @see src/server/api/orders/[id]/pickup.post.ts für Abholung
 */

import type { PurchaseWithProduct, PurchaseResponse, Order } from '~/types'

export const usePurchasesStore = defineStore('purchases', () => {
  // ========================================
  // STATE - Reactive Properties
  // ========================================

  /** Liste aller Bestellungen des Users (alle Stati) - FEAT-16: Order mit items */
  const allOrders = ref<Order[]>([])

  /** Letzter erfolgreicher Kauf (für Success-Modal) */
  const lastPurchase = ref<PurchaseWithProduct | null>(null)

  /** Loading-State für UI-Feedback während API-Calls */
  const isLoading = ref(false)

  /** Error-State für Fehleranzeige in UI */
  const error = ref<string | null>(null)

  /** Loading-State speziell für Abholungsvorgang */
  const isPickingUp = ref(false)

  /** Fehler bei der Abholung (z.B. falsche PIN) */
  const pickupError = ref<string | null>(null)

  // ========================================
  // COMPUTED - Derived State
  // ========================================

  /** Aktive Bestellungen (pending_pickup) */
  const activePurchases = computed(() =>
    allOrders.value.filter((o) => o.status === 'pending_pickup')
  )

  // ========================================
  // ACTIONS - API Calls
  // ========================================

  /**
   * Kauft ein Produkt (One-Touch)
   *
   * @param productId - ID des zu kaufenden Produkts
   * @returns Promise mit PurchaseResponse (success + purchase | error)
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
        // Erfolgreicher Kauf (FEAT-7 One-Touch - veraltet, wird für Abwärtskompatibilität behalten)
        lastPurchase.value = data.purchase

        // Hinweis: allOrders wird hier nicht aktualisiert - FEAT-16 (Warenkorb) nutzt checkout in orders.vue
        // Neue Bestellungen werden über fetchOrders() geladen

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
   * Lädt alle Bestellungen des eingeloggten Users
   *
   * @description
   * Ruft GET /api/orders auf und füllt allOrders (alle Stati).
   * Implementiert FEAT-11 (ersetzt den alten fetchActivePurchases-Stub).
   *
   * @see src/server/api/orders/index.get.ts
   */
  async function fetchOrders(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<{ orders: Order[] }>('/api/orders')
      // API returns Order[] with items, cast to Order type
      allOrders.value = data.orders as unknown as Order[]
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string }
      error.value = e.data?.message || e.message || 'Fehler beim Laden der Bestellungen'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Holt eine Bestellung ab (NFC oder PIN)
   *
   * @param id - Bestell-ID
   * @param method - Abholmethode: "nfc" oder "pin"
   * @param pin - PIN (nur bei method="pin" erforderlich)
   * @returns Promise mit Erfolgs-Status
   *
   * @description
   * Bei Erfolg:
   * - Status in allOrders auf "picked_up" setzen
   * - pickedUpAt aktualisieren
   *
   * Bei Fehler (z.B. falsche PIN):
   * - pickupError wird gesetzt
   * - Status bleibt unverändert
   *
   * @see src/server/api/orders/[id]/pickup.post.ts
   */
  async function pickupOrder(
    id: number,
    method: 'nfc' | 'pin',
    pin?: string
  ): Promise<{ success: boolean; error?: string }> {
    isPickingUp.value = true
    pickupError.value = null

    try {
      const body: { method: string; pin?: string } = { method }
      if (method === 'pin' && pin) {
        body.pin = pin
      }

      const data = await $fetch<{ success: true; order: { id: number; status: string; pickedUpAt: string } }>(
        `/api/orders/${id}/pickup`,
        {
          method: 'POST',
          body,
        }
      )

      // Bestellung in allOrders aktualisieren
      const index = allOrders.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        allOrders.value[index] = {
          ...allOrders.value[index],
          status: 'picked_up',
          pickedUpAt: data.order.pickedUpAt,
        }
      }

      return { success: true }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string }
      const errorMessage = e.data?.message || e.message || 'Fehler bei der Abholung'
      pickupError.value = errorMessage

      return { success: false, error: errorMessage }
    } finally {
      isPickingUp.value = false
    }
  }

  /**
   * Setzt lastPurchase zurück (z.B. nach Modal-Schließen)
   */
  function clearLastPurchase() {
    lastPurchase.value = null
  }

  /**
   * Setzt pickupError zurück
   */
  function clearPickupError() {
    pickupError.value = null
  }

  // ========================================
  // RETURN - Public API
  // ========================================

  return {
    // State
    allOrders,
    activePurchases,
    lastPurchase,
    isLoading,
    error,
    isPickingUp,
    pickupError,

    // Actions
    purchase,
    fetchOrders,
    pickupOrder,
    clearLastPurchase,
    clearPickupError,
  }
})
