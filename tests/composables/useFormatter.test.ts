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
      
      expect(formatPrice('2.5')).toMatch(/2,50\s€/)
      expect(formatPrice('10')).toMatch(/10,00\s€/)
      expect(formatPrice('1234.56')).toMatch(/1\.234,56\s€/)
    })

    it('formatiert Number-Preis korrekt', () => {
      const { formatPrice } = useFormatter()
      
      expect(formatPrice(2.5)).toMatch(/2,50\s€/)
      expect(formatPrice(10)).toMatch(/10,00\s€/)
      expect(formatPrice(1234.56)).toMatch(/1\.234,56\s€/)
    })

    it('behandelt invalide Eingaben', () => {
      const { formatPrice } = useFormatter()
      
      expect(formatPrice('invalid')).toMatch(/0,00\s€/)
      expect(formatPrice('')).toMatch(/0,00\s€/)
    })

    it('zeigt immer 2 Dezimalstellen', () => {
      const { formatPrice } = useFormatter()
      
      expect(formatPrice('5')).toMatch(/5,00\s€/)
      expect(formatPrice('5.1')).toMatch(/5,10\s€/)
      expect(formatPrice('5.123')).toMatch(/5,12\s€/)
    })
  })

  describe('formatDate', () => {
    it('formatiert ISO-String korrekt', () => {
      const { formatDate } = useFormatter()
      
      const result = formatDate('2026-03-04T10:30:00Z')
      // Kann "04.03.26" oder "04.03.2026" sein, je nach Browser-Locale
      expect(result).toMatch(/04\.03\.(20)?26/)
    })

    it('formatiert Date-Objekt korrekt', () => {
      const { formatDate } = useFormatter()
      
      const date = new Date(2026, 2, 4) // März = Index 2
      const result = formatDate(date)
      // Kann "04.03.26" oder "04.03.2026" sein, je nach Browser-Locale
      expect(result).toMatch(/04\.03\.(20)?26/)
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
      
      expect(formatPercent(0.25)).toMatch(/25\s%/)
      expect(formatPercent(0.5)).toMatch(/50\s%/)
      expect(formatPercent(1)).toMatch(/100\s%/)
    })

    it('respektiert Dezimalstellen-Parameter', () => {
      const { formatPercent } = useFormatter()
      
      expect(formatPercent(0.333, 0)).toMatch(/33\s%/)
      expect(formatPercent(0.333, 1)).toMatch(/33,3\s%/)
      expect(formatPercent(0.333, 2)).toMatch(/33,30\s%/)
    })

    it('formatiert Werte > 100% korrekt', () => {
      const { formatPercent } = useFormatter()
      
      expect(formatPercent(1.5)).toMatch(/150\s%/)
      expect(formatPercent(2.5)).toMatch(/250\s%/)
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
      // Kann "1,2 Tsd." oder "1234" sein, je nach Browser
      expect(result).toMatch(/1[.,\s]?(2|234)/)
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
