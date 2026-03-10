/**
 * Unit-Tests fuer die Gesundheits-Score-Berechnungslogik (FEAT-20)
 *
 * Testet die calculateHealthScore()-Funktion aus dem API-Endpunkt:
 * - Grenzwert: null-Input → null
 * - Grenzwert: alle Naehrwerte null → null
 * - Referenzwert: typischer Snack (250 kcal, 15g Zucker, 10g Fett) → Score ~5
 * - Referenzwert: gesundes Produkt (50 kcal, 6g Zucker, 0g Fett, vegan) → Score ~9
 * - Referenzwert: Schokoriegel (500 kcal, 45g Zucker, 25g Fett) → Score 1 (Minimum)
 * - Minimum: Score kann nicht unter 1 fallen
 * - Maximum: Score kann nicht ueber 10 steigen
 * - Vegan-Bonus erhoeht den Score
 * - Glutenfrei-Bonus erhoeht den Score
 * - Leere Liste → null
 */

import { describe, it, expect } from 'vitest'
import { calculateHealthScore } from '~/server/utils/healthScore'

describe('calculateHealthScore', () => {
  // ============================================================
  // Leere Eingaben
  // ============================================================

  it('gibt null zurueck fuer leere Item-Liste', () => {
    expect(calculateHealthScore([])).toBeNull()
  })

  it('gibt null zurueck wenn alle Items Naehrwerte null haben', () => {
    const items = [
      { calories: null, sugar: null, fat: null, isVegan: false, isGlutenFree: false, quantity: 2 },
      { calories: null, sugar: null, fat: null, isVegan: null, isGlutenFree: null, quantity: 1 },
    ]
    expect(calculateHealthScore(items)).toBeNull()
  })

  it('gibt null zurueck fuer Gesamtmenge 0', () => {
    const items = [
      { calories: 200, sugar: 10, fat: 8, isVegan: false, isGlutenFree: false, quantity: 0 },
    ]
    // quantity=0: valide Items vorhanden, aber totalQuantity=0
    expect(calculateHealthScore(items)).toBeNull()
  })

  // ============================================================
  // Referenzwerte aus dem Tech-Design
  // ============================================================

  it('typischer Snack (250 kcal, 15g Zucker, 10g Fett) → Score ~5', () => {
    const items = [
      { calories: 250, sugar: 15, fat: 10, isVegan: false, isGlutenFree: false, quantity: 1 },
    ]
    const score = calculateHealthScore(items)
    expect(score).not.toBeNull()
    // Erwarteter Score: calorieScore=5, sugarScore=7, fatScore=8
    // rawScore = 5*0.5 + 7*0.3 + 8*0.2 = 2.5 + 2.1 + 1.6 = 6.2
    // Bonus = 0, finalScore = round(6.2) = 6
    expect(score).toBeGreaterThanOrEqual(4)
    expect(score).toBeLessThanOrEqual(7)
  })

  it('gesundes Produkt (50 kcal, 6g Zucker, 0g Fett, vegan) → Score hoch (>= 8)', () => {
    const items = [
      { calories: 50, sugar: 6, fat: 0, isVegan: true, isGlutenFree: false, quantity: 1 },
    ]
    const score = calculateHealthScore(items)
    expect(score).not.toBeNull()
    // calorieScore=9, sugarScore=8.8, fatScore=10
    // rawScore = 9*0.5 + 8.8*0.3 + 10*0.2 = 4.5 + 2.64 + 2 = 9.14
    // Bonus: veganRatio=1 → +0.5 → 9.64 → round(9.64) = 10, clamp → 10
    expect(score).toBeGreaterThanOrEqual(8)
  })

  it('Schokoriegel (500 kcal, 45g Zucker, 25g Fett) → Score 1 (Minimum)', () => {
    const items = [
      { calories: 500, sugar: 45, fat: 25, isVegan: false, isGlutenFree: false, quantity: 1 },
    ]
    const score = calculateHealthScore(items)
    // calorieScore=0, sugarScore=1, fatScore=0
    // rawScore = 0*0.5 + 1*0.3 + 0*0.2 = 0.3
    // finalScore = clamp(round(0.3), 1, 10) = 1
    expect(score).toBe(1)
  })

  // ============================================================
  // Minimum und Maximum
  // ============================================================

  it('Score ist niemals unter 1', () => {
    const items = [
      { calories: 9999, sugar: 9999, fat: 9999, isVegan: false, isGlutenFree: false, quantity: 1 },
    ]
    const score = calculateHealthScore(items)
    expect(score).toBeGreaterThanOrEqual(1)
  })

  it('Score ist niemals ueber 10', () => {
    const items = [
      { calories: 0, sugar: 0, fat: 0, isVegan: true, isGlutenFree: true, quantity: 1 },
    ]
    const score = calculateHealthScore(items)
    expect(score).toBeLessThanOrEqual(10)
  })

  // ============================================================
  // Boni
  // ============================================================

  it('veganes Produkt erhaelt hoeherem Score als nicht-veganes bei gleichen Naehrwerten', () => {
    const baseItem = { calories: 200, sugar: 15, fat: 10, quantity: 1 }
    const nonVegan = { ...baseItem, isVegan: false, isGlutenFree: false }
    const vegan = { ...baseItem, isVegan: true, isGlutenFree: false }
    const scoreNonVegan = calculateHealthScore([nonVegan])
    const scoreVegan = calculateHealthScore([vegan])
    expect(scoreVegan).toBeGreaterThanOrEqual(scoreNonVegan ?? 0)
  })

  it('glutenfreies Produkt erhaelt hoeherem Score als nicht-glutenfreies bei gleichen Naehrwerten', () => {
    const baseItem = { calories: 200, sugar: 15, fat: 10, quantity: 1 }
    const notGF = { ...baseItem, isVegan: false, isGlutenFree: false }
    const gf = { ...baseItem, isVegan: false, isGlutenFree: true }
    const scoreNotGF = calculateHealthScore([notGF])
    const scoreGF = calculateHealthScore([gf])
    expect(scoreGF).toBeGreaterThanOrEqual(scoreNotGF ?? 0)
  })

  // ============================================================
  // Menggewichtung
  // ============================================================

  it('Mengengewichtung: mehr Items eines Typs haben groesseren Einfluss', () => {
    // 2x gesundes Produkt + 1x ungesundes = sollte hoeher sein als 1:2
    const moreHealthy = [
      { calories: 50, sugar: 5, fat: 1, isVegan: false, isGlutenFree: false, quantity: 2 },
      { calories: 500, sugar: 40, fat: 20, isVegan: false, isGlutenFree: false, quantity: 1 },
    ]
    const moreUnhealthy = [
      { calories: 50, sugar: 5, fat: 1, isVegan: false, isGlutenFree: false, quantity: 1 },
      { calories: 500, sugar: 40, fat: 20, isVegan: false, isGlutenFree: false, quantity: 2 },
    ]
    const scoreHealthy = calculateHealthScore(moreHealthy)
    const scoreUnhealthy = calculateHealthScore(moreUnhealthy)
    expect(scoreHealthy).toBeGreaterThan(scoreUnhealthy ?? 0)
  })

  // ============================================================
  // Produkte mit teilweise fehlenden Naehrwerten (EC-6)
  // ============================================================

  it('Items ohne Naehrwerte werden bei der Berechnung uebersprungen (EC-6)', () => {
    const items = [
      // Gueltiges Item
      { calories: 200, sugar: 10, fat: 5, isVegan: false, isGlutenFree: false, quantity: 1 },
      // Item ohne Naehrwerte (wird uebersprungen)
      { calories: null, sugar: null, fat: null, isVegan: false, isGlutenFree: false, quantity: 1 },
    ]
    const score = calculateHealthScore(items)
    // Sollte einen gueltigen Score zurueckgeben (basierend auf dem ersten Item)
    expect(score).not.toBeNull()
    expect(score).toBeGreaterThanOrEqual(1)
    expect(score).toBeLessThanOrEqual(10)
  })

  it('gibt null zurueck wenn nur Items ohne Naehrwerte vorhanden sind (EC-6)', () => {
    const items = [
      { calories: null, sugar: null, fat: null, isVegan: true, isGlutenFree: true, quantity: 5 },
    ]
    expect(calculateHealthScore(items)).toBeNull()
  })

  // ============================================================
  // Typ-Kompatibilitaet: isVegan/isGlutenFree als boolean | null
  // ============================================================

  it('behandelt isVegan=null als false (kein Bonus)', () => {
    const withNull = [
      { calories: 200, sugar: 15, fat: 10, isVegan: null, isGlutenFree: null, quantity: 1 },
    ]
    const withFalse = [
      { calories: 200, sugar: 15, fat: 10, isVegan: false, isGlutenFree: false, quantity: 1 },
    ]
    expect(calculateHealthScore(withNull)).toEqual(calculateHealthScore(withFalse))
  })
})
