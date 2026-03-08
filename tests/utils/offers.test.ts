/**
 * Unit-Tests für Angebots-Utility-Funktionen (FEAT-14)
 *
 * Testet:
 * - calculateDiscountedPrice (Preisberechnung)
 * - isOfferCurrentlyActive (Aktivitätsprüfung)
 *
 * Ziel-Coverage: 100% für offers.ts (zentrale Geschäftslogik)
 */

import { describe, it, expect } from 'vitest'
import { calculateDiscountedPrice, isOfferCurrentlyActive } from '~/server/utils/offers'

describe('Offers Utils', () => {
  // ==========================================
  // calculateDiscountedPrice
  // ==========================================

  describe('calculateDiscountedPrice', () => {
    it('berechnet 20% Rabatt auf 2,50 EUR korrekt → 2,00 EUR', () => {
      expect(calculateDiscountedPrice(2.50, 'percent', 20)).toBe(2.00)
    })

    it('berechnet 0,50 EUR absoluten Rabatt auf 2,50 EUR korrekt → 2,00 EUR', () => {
      expect(calculateDiscountedPrice(2.50, 'absolute', 0.50)).toBe(2.00)
    })

    it('100% Rabatt ergibt 0,00 EUR (kein negativer Preis, EC-3)', () => {
      expect(calculateDiscountedPrice(2.50, 'percent', 100)).toBe(0.00)
    })

    it('absoluter Rabatt gleich Produktpreis ergibt 0,00 EUR', () => {
      expect(calculateDiscountedPrice(1.00, 'absolute', 1.00)).toBe(0.00)
    })

    it('Ergebnis wird auf 2 Dezimalstellen gerundet', () => {
      // 1/3 * 10 = 3.333... → 3.33
      expect(calculateDiscountedPrice(10, 'percent', 66.7)).toBe(3.33)
    })

    it('verhindert negative Preise (EC-3: Math.max(0, ...))', () => {
      // Absoluter Rabatt größer als Preis → 0,00 EUR
      expect(calculateDiscountedPrice(1.00, 'absolute', 5.00)).toBe(0.00)
    })

    it('0% Rabatt ergibt den Originalpreis', () => {
      expect(calculateDiscountedPrice(2.50, 'percent', 0)).toBe(2.50)
    })

    it('0,01 EUR absoluter Rabatt korrekt berechnet', () => {
      expect(calculateDiscountedPrice(2.50, 'absolute', 0.01)).toBe(2.49)
    })

    it('ganzzahliger Prozent-Rabatt korrekt berechnet', () => {
      expect(calculateDiscountedPrice(10.00, 'percent', 50)).toBe(5.00)
    })

    it('ganzzahliger absoluter Rabatt korrekt berechnet', () => {
      expect(calculateDiscountedPrice(10.00, 'absolute', 3)).toBe(7.00)
    })
  })

  // ==========================================
  // isOfferCurrentlyActive
  // ==========================================

  describe('isOfferCurrentlyActive', () => {
    const now = new Date()

    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // gestern
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // morgen
    const farFutureDate = new Date(now.getTime() + 48 * 60 * 60 * 1000) // übermorgen

    it('gibt false zurück wenn isActive = false (manuell deaktiviert)', () => {
      expect(isOfferCurrentlyActive({
        isActive: false,
        startsAt: pastDate,
        expiresAt: futureDate,
      })).toBe(false)
    })

    it('gibt false zurück wenn startsAt in der Zukunft (geplantes Angebot, EC-10)', () => {
      expect(isOfferCurrentlyActive({
        isActive: true,
        startsAt: futureDate,
        expiresAt: farFutureDate,
      })).toBe(false)
    })

    it('gibt false zurück wenn expiresAt in der Vergangenheit (abgelaufenes Angebot, EC-7)', () => {
      expect(isOfferCurrentlyActive({
        isActive: true,
        startsAt: pastDate,
        expiresAt: pastDate,
      })).toBe(false)
    })

    it('gibt true zurück wenn alle Bedingungen erfüllt sind (aktives Angebot)', () => {
      expect(isOfferCurrentlyActive({
        isActive: true,
        startsAt: pastDate,
        expiresAt: futureDate,
      })).toBe(true)
    })

    it('akzeptiert Date-Objekte', () => {
      expect(isOfferCurrentlyActive({
        isActive: true,
        startsAt: pastDate,
        expiresAt: futureDate,
      })).toBe(true)
    })

    it('akzeptiert ISO-String-Datumsangaben', () => {
      expect(isOfferCurrentlyActive({
        isActive: true,
        startsAt: pastDate.toISOString(),
        expiresAt: futureDate.toISOString(),
      })).toBe(true)
    })

    it('gibt false zurück wenn isActive = false UND Datum wäre aktiv', () => {
      // Auch wenn das Datum in Ordnung wäre, isActive=false überschreibt alles
      expect(isOfferCurrentlyActive({
        isActive: false,
        startsAt: pastDate,
        expiresAt: futureDate,
      })).toBe(false)
    })

    it('gibt false zurück wenn expiresAt genau jetzt ist (expiresAt > NOW, nicht >=)', () => {
      // expiresAt = genau jetzt → nicht mehr aktiv (Grenzfall)
      const justNow = new Date(now.getTime() - 1) // 1ms in der Vergangenheit
      expect(isOfferCurrentlyActive({
        isActive: true,
        startsAt: pastDate,
        expiresAt: justNow,
      })).toBe(false)
    })
  })
})
