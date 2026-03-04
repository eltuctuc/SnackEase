/**
 * Unit-Tests für Constants
 * 
 * Testet alle Konfigurations-Werte:
 * - credits.ts (BALANCE_THRESHOLDS, RECHARGE_AMOUNTS, etc.)
 * - auth.ts
 * - ui.ts
 */

import { describe, it, expect } from 'vitest'
import { 
  BALANCE_THRESHOLDS, 
  RECHARGE_AMOUNTS, 
  MONTHLY_ALLOWANCE,
  RECHARGE_OPTIONS 
} from '~/constants/credits'

describe('Credits Constants', () => {
  describe('BALANCE_THRESHOLDS', () => {
    it('hat korrekte Schwellwerte definiert', () => {
      expect(BALANCE_THRESHOLDS.GOOD).toBe(20)
      expect(BALANCE_THRESHOLDS.WARNING).toBe(10)
    })

    it('GOOD ist größer als WARNING', () => {
      expect(BALANCE_THRESHOLDS.GOOD).toBeGreaterThan(BALANCE_THRESHOLDS.WARNING)
    })

    it('Schwellwerte sind positiv', () => {
      expect(BALANCE_THRESHOLDS.GOOD).toBeGreaterThan(0)
      expect(BALANCE_THRESHOLDS.WARNING).toBeGreaterThan(0)
    })
  })

  describe('RECHARGE_AMOUNTS', () => {
    it('hat alle drei Beträge definiert', () => {
      expect(RECHARGE_AMOUNTS.SMALL).toBe('10')
      expect(RECHARGE_AMOUNTS.STANDARD).toBe('25')
      expect(RECHARGE_AMOUNTS.LARGE).toBe('50')
    })

    it('Beträge sind Strings für API-Kompatibilität', () => {
      expect(typeof RECHARGE_AMOUNTS.SMALL).toBe('string')
      expect(typeof RECHARGE_AMOUNTS.STANDARD).toBe('string')
      expect(typeof RECHARGE_AMOUNTS.LARGE).toBe('string')
    })

    it('Beträge sind in aufsteigender Reihenfolge', () => {
      const amounts = [
        parseInt(RECHARGE_AMOUNTS.SMALL),
        parseInt(RECHARGE_AMOUNTS.STANDARD),
        parseInt(RECHARGE_AMOUNTS.LARGE)
      ]
      expect(amounts[0]).toBeLessThan(amounts[1])
      expect(amounts[1]).toBeLessThan(amounts[2])
    })
  })

  describe('MONTHLY_ALLOWANCE', () => {
    it('hat korrekten Betrag', () => {
      expect(MONTHLY_ALLOWANCE).toBe(25)
    })

    it('entspricht STANDARD RECHARGE_AMOUNT', () => {
      expect(MONTHLY_ALLOWANCE).toBe(parseInt(RECHARGE_AMOUNTS.STANDARD))
    })
  })

  describe('RECHARGE_OPTIONS', () => {
    it('hat drei Optionen', () => {
      expect(RECHARGE_OPTIONS).toHaveLength(3)
    })

    it('jede Option hat amount, label und description', () => {
      RECHARGE_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('amount')
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('description')
      })
    })

    it('Labels stimmen mit Amounts überein', () => {
      expect(RECHARGE_OPTIONS[0].label).toBe('10 €')
      expect(RECHARGE_OPTIONS[1].label).toBe('25 €')
      expect(RECHARGE_OPTIONS[2].label).toBe('50 €')
    })

    it('Options sind in korrekter Reihenfolge', () => {
      expect(RECHARGE_OPTIONS[0].description).toBe('Klein')
      expect(RECHARGE_OPTIONS[1].description).toBe('Standard')
      expect(RECHARGE_OPTIONS[2].description).toBe('Groß')
    })
  })

  describe('Business Logic', () => {
    it('Status "good" wenn Balance > GOOD threshold', () => {
      const balance = BALANCE_THRESHOLDS.GOOD + 1
      const status = balance > BALANCE_THRESHOLDS.GOOD ? 'good' : 
                     balance >= BALANCE_THRESHOLDS.WARNING ? 'warning' : 'critical'
      expect(status).toBe('good')
    })

    it('Status "warning" wenn Balance zwischen WARNING und GOOD', () => {
      const balance = (BALANCE_THRESHOLDS.GOOD + BALANCE_THRESHOLDS.WARNING) / 2
      const status = balance > BALANCE_THRESHOLDS.GOOD ? 'good' : 
                     balance >= BALANCE_THRESHOLDS.WARNING ? 'warning' : 'critical'
      expect(status).toBe('warning')
    })

    it('Status "critical" wenn Balance < WARNING', () => {
      const balance = BALANCE_THRESHOLDS.WARNING - 1
      const status = balance > BALANCE_THRESHOLDS.GOOD ? 'good' : 
                     balance >= BALANCE_THRESHOLDS.WARNING ? 'warning' : 'critical'
      expect(status).toBe('critical')
    })
  })
})
