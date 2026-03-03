/**
 * Unit-Tests für useFormatter Composable
 * 
 * Testet alle Formatierungs-Funktionen:
 * - formatPrice()
 * - formatDate()
 * - formatNumber()
 * - formatPercent()
 * - formatCompact()
 */

import { describe, it, expect } from 'vitest'
import { useFormatter } from '~/composables/useFormatter'

describe('useFormatter', () => {
  describe('formatPrice', () => {
    it('formatiert String-Preis korrekt', () => {
      const { formatPrice } = useFormatter()
      
      expect(formatPrice('2.5')).toBe('2,50 €')
      expect(formatPrice('10')).toBe('10,00 €')
      expect(formatPrice('1234.56')).toBe('1.234,56 €')
    })

    it('formatiert Number-Preis korrekt', () => {
      const { formatPrice } = useFormatter()
      
      expect(formatPrice(2.5)).toBe('2,50 €')
      expect(formatPrice(10)).toBe('10,00 €')
      expect(formatPrice(1234.56)).toBe('1.234,56 €')
    })

    it('behandelt invalide Eingaben', () => {
      const { formatPrice } = useFormatter()
      
      expect(formatPrice('invalid')).toBe('0,00 €')
      expect(formatPrice('')).toBe('0,00 €')
    })

    it('zeigt immer 2 Dezimalstellen', () => {
      const { formatPrice } = useFormatter()
      
      expect(formatPrice('5')).toBe('5,00 €')
      expect(formatPrice('5.1')).toBe('5,10 €')
      expect(formatPrice('5.123')).toBe('5,12 €')
    })
  })

  describe('formatDate', () => {
    it('formatiert ISO-String korrekt', () => {
      const { formatDate } = useFormatter()
      
      const result = formatDate('2026-03-04T10:30:00Z')
      expect(result).toBe('04.03.2026')
    })

    it('formatiert Date-Objekt korrekt', () => {
      const { formatDate } = useFormatter()
      
      const date = new Date(2026, 2, 4) // März = Index 2
      const result = formatDate(date)
      expect(result).toBe('04.03.2026')
    })

    it('gibt null zurück für null-Input', () => {
      const { formatDate } = useFormatter()
      
      expect(formatDate(null)).toBe(null)
    })

    it('gibt null zurück für invalides Datum', () => {
      const { formatDate } = useFormatter()
      
      expect(formatDate('invalid-date')).toBe(null)
    })
  })

  describe('formatNumber', () => {
    it('formatiert Zahlen mit Tausender-Trennzeichen', () => {
      const { formatNumber } = useFormatter()
      
      expect(formatNumber(1234)).toBe('1.234')
      expect(formatNumber(1234567)).toBe('1.234.567')
      expect(formatNumber(1000000)).toBe('1.000.000')
    })

    it('respektiert Dezimalstellen-Parameter', () => {
      const { formatNumber } = useFormatter()
      
      expect(formatNumber(1234.567, 1)).toBe('1.234,6')
      expect(formatNumber(1234.567, 2)).toBe('1.234,57')
      expect(formatNumber(1234.567, 0)).toBe('1.235')
    })

    it('formatiert kleine Zahlen korrekt', () => {
      const { formatNumber } = useFormatter()
      
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(42)).toBe('42')
      expect(formatNumber(999)).toBe('999')
    })
  })

  describe('formatPercent', () => {
    it('formatiert Prozent-Werte korrekt', () => {
      const { formatPercent } = useFormatter()
      
      expect(formatPercent(0.25)).toBe('25 %')
      expect(formatPercent(0.5)).toBe('50 %')
      expect(formatPercent(1)).toBe('100 %')
    })

    it('respektiert Dezimalstellen-Parameter', () => {
      const { formatPercent } = useFormatter()
      
      expect(formatPercent(0.333, 0)).toBe('33 %')
      expect(formatPercent(0.333, 1)).toBe('33,3 %')
      expect(formatPercent(0.333, 2)).toBe('33,30 %')
    })

    it('formatiert Werte > 100% korrekt', () => {
      const { formatPercent } = useFormatter()
      
      expect(formatPercent(1.5)).toBe('150 %')
      expect(formatPercent(2.5)).toBe('250 %')
    })
  })

  describe('formatCompact', () => {
    it('formatiert kleine Zahlen unverändert', () => {
      const { formatCompact } = useFormatter()
      
      expect(formatCompact(999)).toBe('999')
    })

    it('formatiert Tausende kompakt', () => {
      const { formatCompact } = useFormatter()
      
      const result = formatCompact(1234)
      expect(result).toMatch(/1.*Tsd\.?/)
    })

    it('formatiert Millionen kompakt', () => {
      const { formatCompact } = useFormatter()
      
      const result = formatCompact(1234567)
      expect(result).toMatch(/1.*Mio\.?/)
    })

    it('formatiert Milliarden kompakt', () => {
      const { formatCompact } = useFormatter()
      
      const result = formatCompact(1234567890)
      expect(result).toMatch(/1.*Mrd\.?/)
    })
  })

  describe('Custom Locale', () => {
    it('respektiert Custom-Locale-Einstellung', () => {
      const { formatPrice } = useFormatter({ locale: 'en-US', currency: 'USD' })
      
      expect(formatPrice(12.5)).toBe('$12.50')
    })
  })
})
