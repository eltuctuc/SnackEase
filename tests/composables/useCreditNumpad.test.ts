/**
 * Unit-Tests fuer useCreditNumpad Composable (FEAT-24)
 *
 * Testet:
 * - Cent-zu-Euro-Formatierung
 * - Ziffern-Eingabe (pressDigit)
 * - Loeschen (pressBackspace) incl. EC-2 (leerer State)
 * - Button-Status (isButtonDisabled)
 * - Reset nach Aufladen
 * - localStorage: Zahlungsmethode schreiben + lesen
 * - Key-Schema korrekt
 * - Edge Cases: ungueltige Ziffern, MAX_CENTS-Schutz
 *
 * Ziel-Coverage: >= 80%
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCreditNumpad } from '~/composables/useCreditNumpad'

// ============================================================
// localStorage Mock
// ============================================================

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
  writable: true,
})

// ============================================================
// Tests
// ============================================================

describe('useCreditNumpad', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  // ============================================================
  // Initial State
  // ============================================================

  describe('Initial State', () => {
    it('startet mit Betrag 0 Cent', () => {
      const { amountCents } = useCreditNumpad()
      expect(amountCents.value).toBe(0)
    })

    it('zeigt "0,00 €" initial an', () => {
      const { formattedAmount } = useCreditNumpad()
      expect(formattedAmount.value).toBe('0,00 €')
    })

    it('Button ist initial deaktiviert', () => {
      const { isButtonDisabled } = useCreditNumpad()
      expect(isButtonDisabled.value).toBe(true)
    })

    it('default Zahlungsmethode ist paypal', () => {
      const { paymentMethod, DEFAULT_PAYMENT_METHOD } = useCreditNumpad()
      expect(paymentMethod.value).toBe('paypal')
      expect(DEFAULT_PAYMENT_METHOD).toBe('paypal')
    })
  })

  // ============================================================
  // Cent-zu-Euro-Formatierung
  // ============================================================

  describe('formattedAmount', () => {
    it('0 Cent → "0,00 €"', () => {
      const { formattedAmount } = useCreditNumpad()
      expect(formattedAmount.value).toBe('0,00 €')
    })

    it('1 Cent → "0,01 €"', () => {
      const { amountCents, formattedAmount } = useCreditNumpad()
      amountCents.value = 1
      expect(formattedAmount.value).toBe('0,01 €')
    })

    it('10 Cent → "0,10 €"', () => {
      const { amountCents, formattedAmount } = useCreditNumpad()
      amountCents.value = 10
      expect(formattedAmount.value).toBe('0,10 €')
    })

    it('100 Cent → "1,00 €"', () => {
      const { amountCents, formattedAmount } = useCreditNumpad()
      amountCents.value = 100
      expect(formattedAmount.value).toBe('1,00 €')
    })

    it('1050 Cent → "10,50 €"', () => {
      const { amountCents, formattedAmount } = useCreditNumpad()
      amountCents.value = 1050
      expect(formattedAmount.value).toBe('10,50 €')
    })

    it('999999 Cent → "9.999,99 €" (deutsches Tausendertrennzeichen)', () => {
      const { amountCents, formattedAmount } = useCreditNumpad()
      amountCents.value = 999999
      expect(formattedAmount.value).toBe('9.999,99 €')
    })
  })

  // ============================================================
  // pressDigit
  // ============================================================

  describe('pressDigit()', () => {
    it('Ziffer 1 hinzufuegen → 1 Cent', () => {
      const { pressDigit, amountCents } = useCreditNumpad()
      pressDigit(1)
      expect(amountCents.value).toBe(1)
    })

    it('Ziffern 1, 0, 0 eingeben → 100 Cent (1,00 €)', () => {
      const { pressDigit, amountCents } = useCreditNumpad()
      pressDigit(1)
      pressDigit(0)
      pressDigit(0)
      expect(amountCents.value).toBe(100)
    })

    it('Ziffern 1, 0, 5, 0 eingeben → 1050 Cent (10,50 €)', () => {
      const { pressDigit, amountCents } = useCreditNumpad()
      pressDigit(1)
      pressDigit(0)
      pressDigit(5)
      pressDigit(0)
      expect(amountCents.value).toBe(1050)
    })

    it('Alle Ziffern 0-9 sind gueltig', () => {
      for (let i = 0; i <= 9; i++) {
        const { pressDigit, amountCents } = useCreditNumpad()
        pressDigit(i)
        expect(amountCents.value).toBe(i)
      }
    })

    it('ungueltige Ziffer -1 wird ignoriert', () => {
      const { pressDigit, amountCents } = useCreditNumpad()
      pressDigit(-1)
      expect(amountCents.value).toBe(0)
    })

    it('ungueltige Ziffer 10 wird ignoriert', () => {
      const { pressDigit, amountCents } = useCreditNumpad()
      pressDigit(10)
      expect(amountCents.value).toBe(0)
    })

    it('MAX_CENTS-Schutz: Eingabe ueber 9.999,99 EUR wird abgelehnt', () => {
      const { pressDigit, amountCents } = useCreditNumpad()
      // Setze direkt nahe ans Limit
      amountCents.value = 999999
      // Weitere Ziffer wuerde 9999990 ergeben (> 9999999) — wird abgelehnt
      pressDigit(0)
      expect(amountCents.value).toBe(999999)
    })
  })

  // ============================================================
  // pressBackspace
  // ============================================================

  describe('pressBackspace()', () => {
    it('entfernt letzte Ziffer: 1050 → 105', () => {
      const { amountCents, pressBackspace } = useCreditNumpad()
      amountCents.value = 1050
      pressBackspace()
      expect(amountCents.value).toBe(105)
    })

    it('entfernt letzte Ziffer: 1 → 0', () => {
      const { amountCents, pressBackspace } = useCreditNumpad()
      amountCents.value = 1
      pressBackspace()
      expect(amountCents.value).toBe(0)
    })

    it('EC-2: Loeschen bei leerem State (0) bleibt 0 — kein Fehler', () => {
      const { amountCents, pressBackspace } = useCreditNumpad()
      expect(amountCents.value).toBe(0)
      pressBackspace()
      expect(amountCents.value).toBe(0)
    })

    it('mehrfaches Loeschen: 1234 → 123 → 12 → 1 → 0', () => {
      const { amountCents, pressBackspace } = useCreditNumpad()
      amountCents.value = 1234
      pressBackspace()
      expect(amountCents.value).toBe(123)
      pressBackspace()
      expect(amountCents.value).toBe(12)
      pressBackspace()
      expect(amountCents.value).toBe(1)
      pressBackspace()
      expect(amountCents.value).toBe(0)
    })
  })

  // ============================================================
  // isButtonDisabled
  // ============================================================

  describe('isButtonDisabled', () => {
    it('deaktiviert wenn Betrag = 0 Cent', () => {
      const { isButtonDisabled } = useCreditNumpad()
      expect(isButtonDisabled.value).toBe(true)
    })

    it('aktiv wenn Betrag > 0 Cent', () => {
      const { amountCents, isButtonDisabled } = useCreditNumpad()
      amountCents.value = 1
      expect(isButtonDisabled.value).toBe(false)
    })

    it('reaktiv: nach pressDigit wird Button aktiv', () => {
      const { pressDigit, isButtonDisabled } = useCreditNumpad()
      expect(isButtonDisabled.value).toBe(true)
      pressDigit(5)
      expect(isButtonDisabled.value).toBe(false)
    })

    it('reaktiv: nach reset wird Button deaktiviert', () => {
      const { amountCents, isButtonDisabled, reset } = useCreditNumpad()
      amountCents.value = 500
      expect(isButtonDisabled.value).toBe(false)
      reset()
      expect(isButtonDisabled.value).toBe(true)
    })
  })

  // ============================================================
  // reset
  // ============================================================

  describe('reset()', () => {
    it('setzt Betrag auf 0 zurueck', () => {
      const { amountCents, reset } = useCreditNumpad()
      amountCents.value = 1234
      reset()
      expect(amountCents.value).toBe(0)
    })

    it('formattedAmount zeigt nach reset wieder "0,00 €"', () => {
      const { amountCents, formattedAmount, reset } = useCreditNumpad()
      amountCents.value = 500
      reset()
      expect(formattedAmount.value).toBe('0,00 €')
    })
  })

  // ============================================================
  // localStorage — Zahlungsmethode
  // ============================================================

  describe('localStorage — Zahlungsmethode', () => {
    it('getStorageKey erzeugt korrekten Key', () => {
      const { getStorageKey } = useCreditNumpad()
      expect(getStorageKey(42)).toBe('snackease_payment_method_42')
      expect(getStorageKey(1)).toBe('snackease_payment_method_1')
    })

    it('savePaymentMethod speichert in localStorage', () => {
      const { savePaymentMethod } = useCreditNumpad()
      savePaymentMethod('visa', 5)
      expect(localStorageMock.getItem('snackease_payment_method_5')).toBe('visa')
    })

    it('savePaymentMethod speichert paypal', () => {
      const { savePaymentMethod } = useCreditNumpad()
      savePaymentMethod('paypal', 5)
      expect(localStorageMock.getItem('snackease_payment_method_5')).toBe('paypal')
    })

    it('savePaymentMethod speichert salary', () => {
      const { savePaymentMethod } = useCreditNumpad()
      savePaymentMethod('salary', 5)
      expect(localStorageMock.getItem('snackease_payment_method_5')).toBe('salary')
    })

    it('loadPaymentMethod liest gespeicherten Wert aus localStorage', () => {
      localStorageMock.setItem('snackease_payment_method_7', 'visa')
      const { loadPaymentMethod } = useCreditNumpad()
      expect(loadPaymentMethod(7)).toBe('visa')
    })

    it('loadPaymentMethod gibt DEFAULT_PAYMENT_METHOD zurueck wenn kein Wert gespeichert', () => {
      const { loadPaymentMethod, DEFAULT_PAYMENT_METHOD } = useCreditNumpad()
      expect(loadPaymentMethod(99)).toBe(DEFAULT_PAYMENT_METHOD)
    })

    it('loadPaymentMethod gibt DEFAULT_PAYMENT_METHOD zurueck bei ungueltigem gespeicherten Wert', () => {
      localStorageMock.setItem('snackease_payment_method_3', 'invalid_method')
      const { loadPaymentMethod, DEFAULT_PAYMENT_METHOD } = useCreditNumpad()
      expect(loadPaymentMethod(3)).toBe(DEFAULT_PAYMENT_METHOD)
    })

    it('loadPaymentMethod gibt DEFAULT_PAYMENT_METHOD zurueck wenn keine userId', () => {
      const { loadPaymentMethod, DEFAULT_PAYMENT_METHOD } = useCreditNumpad()
      expect(loadPaymentMethod()).toBe(DEFAULT_PAYMENT_METHOD)
    })

    it('savePaymentMethod tut nichts wenn keine userId', () => {
      const { savePaymentMethod } = useCreditNumpad()
      savePaymentMethod('visa')
      // Kein localStorage-Eintrag gesetzt
      expect(localStorageMock.length).toBe(0)
    })

    it('setPaymentMethod aendert paymentMethod reaktiv', () => {
      const { paymentMethod, setPaymentMethod } = useCreditNumpad()
      setPaymentMethod('visa', 1)
      expect(paymentMethod.value).toBe('visa')
    })

    it('refreshPaymentMethod laedt gespeicherte Methode', () => {
      localStorageMock.setItem('snackease_payment_method_9', 'salary')
      const { paymentMethod, refreshPaymentMethod } = useCreditNumpad()
      refreshPaymentMethod(9)
      expect(paymentMethod.value).toBe('salary')
    })

    it('alle drei Zahlungsmethoden sind speicher- und ladbar', () => {
      const methods = ['visa', 'paypal', 'salary'] as const
      for (const method of methods) {
        localStorageMock.clear()
        const { savePaymentMethod, loadPaymentMethod } = useCreditNumpad()
        savePaymentMethod(method, 1)
        expect(loadPaymentMethod(1)).toBe(method)
      }
    })
  })

  // ============================================================
  // Integrationstest: vollstaendiger Eingabe-Flow
  // ============================================================

  describe('Integrationstest: vollstaendiger Eingabe-Flow', () => {
    it('10,00 € eingeben: 1-0-0-0 → 1000 Cent', () => {
      const { pressDigit, amountCents, formattedAmount } = useCreditNumpad()
      pressDigit(1)
      pressDigit(0)
      pressDigit(0)
      pressDigit(0)
      expect(amountCents.value).toBe(1000)
      expect(formattedAmount.value).toBe('10,00 €')
    })

    it('25,00 € eingeben: 2-5-0-0 → 2500 Cent', () => {
      const { pressDigit, amountCents, formattedAmount } = useCreditNumpad()
      pressDigit(2)
      pressDigit(5)
      pressDigit(0)
      pressDigit(0)
      expect(amountCents.value).toBe(2500)
      expect(formattedAmount.value).toBe('25,00 €')
    })

    it('Eingabe + Korrektur + Reset', () => {
      const { pressDigit, pressBackspace, reset, amountCents, formattedAmount, isButtonDisabled } = useCreditNumpad()

      // 1-2-3 eingeben
      pressDigit(1)
      pressDigit(2)
      pressDigit(3)
      expect(amountCents.value).toBe(123)
      expect(isButtonDisabled.value).toBe(false)

      // Letzte Ziffer loeschen
      pressBackspace()
      expect(amountCents.value).toBe(12)

      // Alles zuruecksetzen
      reset()
      expect(amountCents.value).toBe(0)
      expect(formattedAmount.value).toBe('0,00 €')
      expect(isButtonDisabled.value).toBe(true)
    })
  })
})
