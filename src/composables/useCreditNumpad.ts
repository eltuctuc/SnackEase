/**
 * useCreditNumpad — Composable fuer die Cent-basierte Betragseingabe (FEAT-24)
 *
 * Verwaltet den Betrag-State und die Zahlungsmethode fuer /profile/credit.
 *
 * Betrag-Logik:
 * - Intern gespeichert als Integer in Cent (z.B. 1050 = 10,50 EUR)
 * - Eingabe: Ziffern 0-9 werden rechts angehaengt (Cent-basiert)
 * - Loeschen: letzte Ziffer entfernen
 * - Anzeige: immer im Format "10,50 €"
 *
 * Zahlungsmethode:
 * - Persistiert in localStorage, Key: snackease_payment_method_[userId]
 * - Werte: 'visa' | 'paypal' | 'salary'
 * - Default: 'paypal'
 */

import { ref, computed } from 'vue'

export type PaymentMethod = 'visa' | 'paypal' | 'salary'

const PAYMENT_METHOD_STORAGE_KEY_PREFIX = 'snackease_payment_method_'
const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'paypal'
const MAX_CENTS = 9_999_99 // 9.999,99 EUR — Schutz vor ueberlangem Input

export function useCreditNumpad(userId?: number) {
  // ============================================================
  // Betrag-State (in Cent)
  // ============================================================

  const amountCents = ref<number>(0)

  // ============================================================
  // Betrag-Anzeige
  // ============================================================

  /**
   * Formatiert den Cent-Betrag als deutsches Waehrungsformat.
   * 0 Cent → "0,00 €"
   * 1 Cent → "0,01 €"
   * 1050 Cent → "10,50 €"
   */
  const formattedAmount = computed((): string => {
    const euros = amountCents.value / 100
    return euros.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  })

  // ============================================================
  // Button-State
  // ============================================================

  /** Button deaktiviert wenn Betrag = 0 Cent */
  const isButtonDisabled = computed((): boolean => amountCents.value === 0)

  // ============================================================
  // Numpad-Aktionen
  // ============================================================

  /**
   * Haengt eine Ziffer rechts an den Betrag an.
   * Beispiel: 105 + Taste "3" → 1053 (10,53 €)
   * Schutz: Kein Ueberschreiten von MAX_CENTS
   */
  function pressDigit(digit: number): void {
    if (digit < 0 || digit > 9 || !Number.isInteger(digit)) return

    const newValue = amountCents.value * 10 + digit
    if (newValue <= MAX_CENTS) {
      amountCents.value = newValue
    }
  }

  /**
   * Entfernt die letzte Ziffer.
   * Beispiel: 1053 → 105
   * Bei 0: bleibt 0 (EC-2: kein Fehler)
   */
  function pressBackspace(): void {
    amountCents.value = Math.floor(amountCents.value / 10)
  }

  /**
   * Setzt den Betrag auf 0 zurueck.
   * Wird nach erfolgreichem Aufladen aufgerufen (P1-Anforderung).
   */
  function reset(): void {
    amountCents.value = 0
  }

  // ============================================================
  // Zahlungsmethode
  // ============================================================

  function getStorageKey(uid: number): string {
    return `${PAYMENT_METHOD_STORAGE_KEY_PREFIX}${uid}`
  }

  /**
   * Laedt die gespeicherte Zahlungsmethode aus localStorage.
   * Gibt DEFAULT_PAYMENT_METHOD zurueck wenn kein User oder kein gespeicherter Wert.
   */
  function loadPaymentMethod(uid?: number): PaymentMethod {
    if (!uid) return DEFAULT_PAYMENT_METHOD

    // SSR-Schutz: localStorage nur im Browser verfuegbar
    if (typeof window === 'undefined') return DEFAULT_PAYMENT_METHOD

    const stored = window.localStorage.getItem(getStorageKey(uid))
    if (stored === 'visa' || stored === 'paypal' || stored === 'salary') {
      return stored
    }
    return DEFAULT_PAYMENT_METHOD
  }

  /**
   * Speichert die Zahlungsmethode in localStorage.
   */
  function savePaymentMethod(method: PaymentMethod, uid?: number): void {
    if (!uid) return
    if (typeof window === 'undefined') return

    window.localStorage.setItem(getStorageKey(uid), method)
  }

  const paymentMethod = ref<PaymentMethod>(loadPaymentMethod(userId))

  /**
   * Aendert und speichert die Zahlungsmethode.
   */
  function setPaymentMethod(method: PaymentMethod, uid?: number): void {
    paymentMethod.value = method
    savePaymentMethod(method, uid ?? userId)
  }

  /**
   * Laedt die Zahlungsmethode erneut aus localStorage (bei User-Wechsel oder Seitenaufruf).
   */
  function refreshPaymentMethod(uid?: number): void {
    paymentMethod.value = loadPaymentMethod(uid ?? userId)
  }

  return {
    // Betrag
    amountCents,
    formattedAmount,
    isButtonDisabled,
    pressDigit,
    pressBackspace,
    reset,
    // Zahlungsmethode
    paymentMethod,
    setPaymentMethod,
    savePaymentMethod,
    loadPaymentMethod,
    refreshPaymentMethod,
    // Konstanten fuer Tests
    DEFAULT_PAYMENT_METHOD,
    getStorageKey,
  }
}
