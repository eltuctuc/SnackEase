/**
 * Unit-Tests für Purchase Utility-Funktionen (FEAT-7)
 * 
 * Testet:
 * - PIN-Generierung
 * - Bonuspunkte-Berechnung
 */

import { describe, it, expect } from 'vitest'
import { generatePin, calculateBonusPoints } from '~/server/utils/purchase'

describe('Purchase Utils', () => {
  describe('generatePin', () => {
    it('sollte eine 4-stellige PIN generieren', () => {
      const pin = generatePin()
      expect(pin).toHaveLength(4)
    })

    it('sollte nur Zahlen enthalten', () => {
      const pin = generatePin()
      expect(pin).toMatch(/^\d{4}$/)
    })

    it('sollte unterschiedliche PINs generieren', () => {
      const pin1 = generatePin()
      const pin2 = generatePin()
      const pin3 = generatePin()
      
      // Statistisch sollten die meisten PINs unterschiedlich sein
      const pins = new Set([pin1, pin2, pin3])
      expect(pins.size).toBeGreaterThan(1)
    })

    it('sollte führende Nullen korrekt behandeln', () => {
      // Teste mehrfach, um statistisch PINs mit führenden Nullen zu erwischen
      const pins = Array.from({ length: 100 }, () => generatePin())
      
      // Alle PINs sollten genau 4 Zeichen haben
      pins.forEach(pin => {
        expect(pin).toHaveLength(4)
        expect(pin).toMatch(/^\d{4}$/)
      })
    })
  })

  describe('calculateBonusPoints', () => {
    it('sollte 3 Punkte für Obst geben', () => {
      expect(calculateBonusPoints('obst')).toBe(3)
      expect(calculateBonusPoints('Obst')).toBe(3)
      expect(calculateBonusPoints('OBST')).toBe(3)
    })

    it('sollte 2 Punkte für Nüsse geben', () => {
      expect(calculateBonusPoints('nüsse')).toBe(2)
      expect(calculateBonusPoints('nuesse')).toBe(2)
      expect(calculateBonusPoints('Nüsse')).toBe(2)
    })

    it('sollte 2 Punkte für Proteinriegel geben', () => {
      expect(calculateBonusPoints('proteinriegel')).toBe(2)
      expect(calculateBonusPoints('Proteinriegel')).toBe(2)
    })

    it('sollte 2 Punkte für Shakes geben', () => {
      expect(calculateBonusPoints('shakes')).toBe(2)
      expect(calculateBonusPoints('Shakes')).toBe(2)
    })

    it('sollte 1 Punkt für Schokoriegel geben', () => {
      expect(calculateBonusPoints('schokoriegel')).toBe(1)
      expect(calculateBonusPoints('Schokoriegel')).toBe(1)
    })

    it('sollte 1 Punkt für Getränke geben', () => {
      expect(calculateBonusPoints('getränke')).toBe(1)
      expect(calculateBonusPoints('getraenke')).toBe(1)
      expect(calculateBonusPoints('Getränke')).toBe(1)
    })

    it('sollte 0 Punkte für unbekannte Kategorien geben', () => {
      expect(calculateBonusPoints('unbekannt')).toBe(0)
      expect(calculateBonusPoints('')).toBe(0)
      expect(calculateBonusPoints('test')).toBe(0)
    })

    it('sollte case-insensitive sein', () => {
      expect(calculateBonusPoints('OBST')).toBe(3)
      expect(calculateBonusPoints('ObSt')).toBe(3)
      expect(calculateBonusPoints('oBsT')).toBe(3)
    })
  })
})
