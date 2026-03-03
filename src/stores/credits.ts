/**
 * Credits Store - Verwaltung des Guthaben-Systems
 * 
 * @description
 * Dieser Store verwaltet:
 * - Aktuellen Guthabenstand des eingeloggten Users
 * - Guthaben-Status (good/warning/critical für farbliche Anzeige)
 * - Auflade-Funktionen (manuell + Monatspauschale)
 * - Loading- und Error-States
 * 
 * Verwendet Composition API mit setup-Syntax (Best Practice).
 * Alle DB-Operationen erfolgen über Server API Routes (kein direkter DB-Zugriff).
 * 
 * @see src/types/credits.ts für Type-Definitionen
 * @see src/constants/credits.ts für Schwellwerte und Konstanten
 */

import type { BalanceStatus } from '~/types'
import type { CreditsBalanceResponse, CreditsRechargeResponse, CreditsMonthlyResponse } from '~/types'

export const useCreditsStore = defineStore('credits', () => {
  // ========================================
  // STATE - Reactive Properties
  // ========================================
  
  /** Aktuelles Guthaben als String (wegen Decimal-Precision) */
  const balance = ref('0')
  
  /** Letztes Auflade-Datum (ISO-8601 String oder null) */
  const lastRechargedAt = ref<string | null>(null)
  
  /** Loading-State für UI-Feedback während API-Calls */
  const isLoading = ref(false)
  
  /** Error-State für Fehleranzeige in UI */
  const error = ref<string | null>(null)

  // ========================================
  // COMPUTED - Derived State
  // ========================================
  
  /**
   * Guthaben als Zahl für Berechnungen
   * 
   * @description
   * Konvertiert String-Balance zu Number für:
   * - Status-Berechnung (good/warning/critical)
   * - Numerische Vergleiche
   * 
   * Fallback auf 0 falls Parsing fehlschlägt.
   */
  const balanceNumeric = computed(() => parseFloat(balance.value) || 0)

  /**
   * Guthaben-Status für farbliche UI-Kennzeichnung
   * 
   * @description
   * Bestimmt Status basierend auf Schwellwerten:
   * - 'good': Balance > 20€ (grün)
   * - 'warning': Balance 10-20€ (gelb)
   * - 'critical': Balance < 10€ (rot)
   * 
   * Schwellwerte definiert in: src/constants/credits.ts (BALANCE_THRESHOLDS)
   * 
   * @returns {BalanceStatus} 'good' | 'warning' | 'critical'
   */
  const balanceStatus = computed((): BalanceStatus => {
    const value = balanceNumeric.value
    if (value > 20) return 'good'
    if (value >= 10) return 'warning'
    return 'critical'
  })

  // ========================================
  // ACTIONS - API Calls
  // ========================================
  
  /**
   * Lädt aktuellen Guthabenstand vom Server
   * 
   * @description
   * Ruft GET /api/credits/balance auf und aktualisiert Store-State.
   * Wird aufgerufen:
   * - Beim Dashboard-Mount (initiale Daten)
   * - Nach erfolgreicher Aufladung (optional, da Response newBalance enthält)
   * 
   * @see src/server/api/credits/balance.get.ts
   */
  async function fetchBalance() {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<CreditsBalanceResponse>('/api/credits/balance')

      balance.value = data.balance
      lastRechargedAt.value = data.lastRechargedAt
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Laden des Guthabens'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lädt Guthaben auf (manuell)
   * 
   * @param amount - Auflade-Betrag als String ('10' | '25' | '50')
   * @returns Promise mit success-Flag und optionaler error-Message
   * 
   * @description
   * Ruft POST /api/credits/recharge mit gewähltem Betrag auf.
   * 
   * Bei Erfolg:
   * - Aktualisiert balance im Store (aus Response)
   * - Setzt lastRechargedAt auf aktuellen Timestamp
   * - Returned { success: true }
   * 
   * Bei Fehler:
   * - Setzt error im Store (für UI-Anzeige)
   * - Returned { success: false, error: '...' }
   * 
   * @see src/server/api/credits/recharge.post.ts
   * @see src/constants/credits.ts für erlaubte Beträge
   */
  async function recharge(amount: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<CreditsRechargeResponse>('/api/credits/recharge', {
        method: 'POST',
        body: { amount },
      })

      if (data.success) {
        balance.value = data.newBalance
        lastRechargedAt.value = new Date().toISOString()
        return { success: true }
      }

      return { success: false, error: data.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const errorMessage = e.data?.message || 'Fehler beim Aufladen'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Abruf der Monatspauschale (25€)
   * 
   * @returns Promise mit success-Flag und optionaler error-Message
   * 
   * @description
   * Mitarbeiter können einmal pro Monat 25€ Pauschale abrufen.
   * Backend prüft ob User bereits in diesem Monat abgerufen hat.
   * 
   * Ruft POST /api/credits/monthly auf (ohne Body).
   * 
   * Bei Erfolg:
   * - Aktualisiert balance im Store (+25€)
   * - Setzt lastRechargedAt auf aktuellen Timestamp
   * - Returned { success: true }
   * 
   * Bei Fehler (z.B. "Bereits in diesem Monat abgerufen"):
   * - Setzt error im Store (für UI-Anzeige)
   * - Returned { success: false, error: '...' }
   * 
   * @see src/server/api/credits/monthly.post.ts
   * @see src/constants/credits.ts → MONTHLY_ALLOWANCE (25€)
   */
  async function receiveMonthly(): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<CreditsMonthlyResponse>('/api/credits/monthly', {
        method: 'POST',
      })

      if (data.success) {
        balance.value = data.newBalance
        lastRechargedAt.value = new Date().toISOString()
        return { success: true }
      }

      return { success: false, error: data.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const errorMessage = e.data?.message || 'Fehler bei Monatspauschale'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // ========================================
  // RETURN - Public API
  // ========================================
  
  /**
   * Store-Exports
   * 
   * @description
   * Alle State-Properties und Actions die von Components
   * verwendet werden können.
   * 
   * WICHTIG: Nur explizit exportierte Properties sind public.
   * Interne Helper-Funktionen werden NICHT exportiert.
   */
  return {
    // State
    balance,
    lastRechargedAt,
    isLoading,
    error,
    
    // Computed
    balanceNumeric,
    balanceStatus,
    
    // Actions
    fetchBalance,
    recharge,
    receiveMonthly,
  }
})
