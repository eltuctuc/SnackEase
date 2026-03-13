/**
 * Unit-Tests fuer Punkte-Berechnungs-Utility (FEAT-23)
 *
 * Testet:
 * - calculatePointTransaction() — alle Bonus-Kombinationen
 * - isSpeedEligible()
 * - hasOfferBonus()
 *
 * Ziel-Coverage: 100% fuer points.ts
 */

import { describe, it, expect } from 'vitest'
import {
  calculatePointTransaction,
  isSpeedEligible,
  hasOfferBonus,
  BASE_POINTS_PER_PRODUCT,
  SPEED_BONUS,
  PROTEIN_THRESHOLD,
} from '~/server/utils/points'

// ==========================================
// Hilfsdaten
// ==========================================

const now = new Date('2026-03-13T10:00:00.000Z')

/** Bestellung mit createdAt = now */
const purchase = { createdAt: now }

/** Einfaches normales Produkt (nicht vegan, kein Protein, kein Angebot) */
const normalProduct = {
  id: 1,
  price: 2.50,
  isVegan: false,
  protein: null,
}

/** Veganes Produkt */
const veganProduct = {
  id: 2,
  price: 3.00,
  isVegan: true,
  protein: null,
}

/** Proteinreiches Produkt (>= 15g) */
const proteinProduct = {
  id: 3,
  price: 2.00,
  isVegan: false,
  protein: 20,
}

/** Veganes + proteinreiches Produkt */
const veganAndProteinProduct = {
  id: 4,
  price: 2.50,
  isVegan: true,
  protein: 15, // exakt am Schwellwert
}

/** Produkt mit Angebot (unitPrice < product.price) */
const productOnOffer = {
  id: 5,
  price: 3.00,
  isVegan: false,
  protein: null,
}

// Abholung innerhalb von 30 Minuten (15 Minuten nach Bestellung)
const fastPickup = new Date(now.getTime() + 15 * 60 * 1000)

// Abholung nach mehr als 30 Minuten (45 Minuten nach Bestellung)
const slowPickup = new Date(now.getTime() + 45 * 60 * 1000)

// ==========================================
// isSpeedEligible
// ==========================================

describe('isSpeedEligible', () => {
  it('gibt true zurueck wenn Abholung < 30 Minuten', () => {
    expect(isSpeedEligible(now, fastPickup)).toBe(true)
  })

  it('gibt false zurueck wenn Abholung >= 30 Minuten', () => {
    expect(isSpeedEligible(now, slowPickup)).toBe(false)
  })

  it('gibt true zurueck bei exakt 29:59 (NFC-Sofortabholung, EC-9)', () => {
    const almostThirty = new Date(now.getTime() + 29 * 60 * 1000 + 59 * 1000)
    expect(isSpeedEligible(now, almostThirty)).toBe(true)
  })

  it('gibt false zurueck bei exakt 30:00 (Grenzfall, < nicht <=)', () => {
    const exactThirty = new Date(now.getTime() + 30 * 60 * 1000)
    expect(isSpeedEligible(now, exactThirty)).toBe(false)
  })

  it('akzeptiert ISO-Strings als Eingabe', () => {
    expect(isSpeedEligible(now.toISOString(), fastPickup.toISOString())).toBe(true)
  })
})

// ==========================================
// hasOfferBonus
// ==========================================

describe('hasOfferBonus', () => {
  it('gibt true zurueck wenn unitPrice < productPrice (Angebot war aktiv)', () => {
    expect(hasOfferBonus(2.00, 3.00)).toBe(true)
  })

  it('gibt false zurueck wenn unitPrice === productPrice (kein Angebot)', () => {
    expect(hasOfferBonus(3.00, 3.00)).toBe(false)
  })

  it('gibt false zurueck wenn unitPrice > productPrice (sollte nicht vorkommen)', () => {
    expect(hasOfferBonus(4.00, 3.00)).toBe(false)
  })
})

// ==========================================
// calculatePointTransaction — Grundfaelle
// ==========================================

describe('calculatePointTransaction', () => {

  // ==========================================
  // Nur Basis-Punkte
  // ==========================================

  it('berechnet nur Basis-Punkte fuer ein normales Produkt (kein Bonus)', () => {
    const items = [{ productId: 1, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], slowPickup, false)

    expect(result.basePoints).toBe(BASE_POINTS_PER_PRODUCT) // 10
    expect(result.veganBonus).toBe(0)
    expect(result.proteinBonus).toBe(0)
    expect(result.offerBonus).toBe(0)
    expect(result.speedBonus).toBe(0)
    expect(result.streakBonus).toBe(0)
    expect(result.totalPoints).toBe(BASE_POINTS_PER_PRODUCT) // 10
  })

  it('berechnet Basis-Punkte fuer mehrere Produkte', () => {
    const items = [
      { productId: 1, quantity: 1, unitPrice: 2.50 },
      { productId: 3, quantity: 1, unitPrice: 2.00 },
    ]
    const result = calculatePointTransaction(purchase, items, [normalProduct, proteinProduct], slowPickup, false)

    // 10 (normal) + 10 (protein-Basis) + 2 (protein-Bonus) = 22
    expect(result.basePoints).toBe(20) // 2 Produkte × 10
    expect(result.proteinBonus).toBe(2)
    expect(result.totalPoints).toBe(22)
  })

  // ==========================================
  // Vegan-Bonus
  // ==========================================

  it('addiert Vegan-Bonus fuer veganes Produkt (+3)', () => {
    const items = [{ productId: 2, quantity: 1, unitPrice: 3.00 }]
    const result = calculatePointTransaction(purchase, items, [veganProduct], slowPickup, false)

    expect(result.basePoints).toBe(10)
    expect(result.veganBonus).toBe(3)
    expect(result.totalPoints).toBe(13)
  })

  // ==========================================
  // Protein-Bonus
  // ==========================================

  it('addiert Protein-Bonus fuer proteinreiches Produkt (+2)', () => {
    const items = [{ productId: 3, quantity: 1, unitPrice: 2.00 }]
    const result = calculatePointTransaction(purchase, items, [proteinProduct], slowPickup, false)

    expect(result.basePoints).toBe(10)
    expect(result.proteinBonus).toBe(2)
    expect(result.totalPoints).toBe(12)
  })

  it('addiert KEINEN Protein-Bonus wenn Protein unter Schwellwert', () => {
    const lowProtein = { id: 6, price: 2.00, isVegan: false, protein: PROTEIN_THRESHOLD - 1 }
    const items = [{ productId: 6, quantity: 1, unitPrice: 2.00 }]
    const result = calculatePointTransaction(purchase, items, [lowProtein], slowPickup, false)

    expect(result.proteinBonus).toBe(0)
  })

  it('addiert Protein-Bonus wenn Protein exakt am Schwellwert (>= 15g)', () => {
    const exactProtein = { id: 7, price: 2.00, isVegan: false, protein: PROTEIN_THRESHOLD }
    const items = [{ productId: 7, quantity: 1, unitPrice: 2.00 }]
    const result = calculatePointTransaction(purchase, items, [exactProtein], slowPickup, false)

    expect(result.proteinBonus).toBe(2)
  })

  it('addiert keinen Protein-Bonus wenn protein null', () => {
    const items = [{ productId: 1, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], slowPickup, false)

    expect(result.proteinBonus).toBe(0)
  })

  // ==========================================
  // Angebots-Bonus
  // ==========================================

  it('addiert Angebots-Bonus wenn unitPrice < product.price (EC-5)', () => {
    const items = [{ productId: 5, quantity: 1, unitPrice: 2.00 }] // unitPrice < 3.00
    const result = calculatePointTransaction(purchase, items, [productOnOffer], slowPickup, false)

    expect(result.offerBonus).toBe(2)
    expect(result.totalPoints).toBe(12)
  })

  it('addiert KEINEN Angebots-Bonus wenn unitPrice === product.price', () => {
    const items = [{ productId: 5, quantity: 1, unitPrice: 3.00 }] // kein Angebot
    const result = calculatePointTransaction(purchase, items, [productOnOffer], slowPickup, false)

    expect(result.offerBonus).toBe(0)
  })

  // ==========================================
  // Schnelligkeits-Bonus
  // ==========================================

  it('addiert Schnelligkeits-Bonus bei Abholung < 30 Minuten (+5)', () => {
    const items = [{ productId: 1, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], fastPickup, false)

    expect(result.speedBonus).toBe(SPEED_BONUS) // 5
    expect(result.totalPoints).toBe(15) // 10 + 5
  })

  it('addiert KEINEN Schnelligkeits-Bonus bei Abholung >= 30 Minuten', () => {
    const items = [{ productId: 1, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], slowPickup, false)

    expect(result.speedBonus).toBe(0)
    expect(result.totalPoints).toBe(10)
  })

  // ==========================================
  // Streak-Bonus
  // ==========================================

  it('addiert Streak-Bonus von 20% wenn hasStreakYesterday = true', () => {
    // 10 Punkte * 1.2 = 12, Streak-Anteil = 2
    const items = [{ productId: 1, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], slowPickup, true)

    expect(result.streakBonus).toBe(2) // 20% von 10
    expect(result.totalPoints).toBe(12) // 10 + 2
  })

  it('addiert KEINEN Streak-Bonus wenn hasStreakYesterday = false (EC-3: Erster Kauf)', () => {
    const items = [{ productId: 1, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], slowPickup, false)

    expect(result.streakBonus).toBe(0)
  })

  it('rundet Streak-Bonus korrekt: 23 * 1.2 = 27.6 → streakBonus = 5 (EC-11)', () => {
    // Um 23 Punkte vor Streak zu bekommen: 2 Produkte (20) + speed (5) - 2 = 23
    // Zwei normale Produkte + Schnelligkeits-Bonus = 20 + 5 = 25 → 25 * 0.2 = 5.0 → 5
    // Fuer 23 Punkte: 2 normale Produkte + vegan-Bonus (3) = 23
    const twoNormal = [
      { productId: 1, quantity: 1, unitPrice: 2.50 }, // 10 + 0 = 10
      { productId: 2, quantity: 1, unitPrice: 3.00 }, // 10 + 3 = 13
    ]
    // Gesamt vor Streak: 10 + 13 = 23, kein Speed-Bonus (slowPickup)
    const result = calculatePointTransaction(purchase, twoNormal, [normalProduct, veganProduct], slowPickup, true)

    // 23 * 0.2 = 4.6 → ROUND = 5
    expect(result.basePoints).toBe(20)
    expect(result.veganBonus).toBe(3)
    expect(result.streakBonus).toBe(5) // ROUND(4.6) = 5
    expect(result.totalPoints).toBe(28) // 23 + 5
  })

  it('rundet Streak-Bonus auf naechste ganze Zahl (EC-11: 27.6 → 28)', () => {
    // 23 * 1.2 = 27.6 → gesamt = 28 (ROUND)
    // Brauchen exakt 23 Punkte vor Streak ohne speedBonus:
    // normalProduct (10) + veganProduct (13) = 23
    const items = [
      { productId: 1, quantity: 1, unitPrice: 2.50 },
      { productId: 2, quantity: 1, unitPrice: 3.00 },
    ]
    const result = calculatePointTransaction(purchase, items, [normalProduct, veganProduct], slowPickup, true)
    expect(result.totalPoints).toBe(28) // ROUND(23 * 1.2) = ROUND(27.6) = 28
  })

  // ==========================================
  // Kombinationen (EC-4)
  // ==========================================

  it('EC-4: Produkt ist vegan UND proteinreich — beide Boni addiert (+3 +2)', () => {
    const items = [{ productId: 4, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [veganAndProteinProduct], slowPickup, false)

    expect(result.veganBonus).toBe(3)
    expect(result.proteinBonus).toBe(2)
    expect(result.totalPoints).toBe(15) // 10 + 3 + 2
  })

  it('alle Boni gleichzeitig: vegan + protein + angebot + speed + streak', () => {
    // veganAndProteinProduct im Angebot + schnelle Abholung + Streak
    const items = [{ productId: 4, quantity: 1, unitPrice: 1.50 }] // unitPrice < 2.50 → Angebot
    const result = calculatePointTransaction(purchase, items, [veganAndProteinProduct], fastPickup, true)

    // Basis = 10, vegan = 3, protein = 2, offer = 2, speed = 5
    // Vor-Streak = 22
    // Streak-Bonus = ROUND(22 * 0.2) = ROUND(4.4) = 4
    expect(result.basePoints).toBe(10)
    expect(result.veganBonus).toBe(3)
    expect(result.proteinBonus).toBe(2)
    expect(result.offerBonus).toBe(2)
    expect(result.speedBonus).toBe(5)
    expect(result.streakBonus).toBe(4) // ROUND(4.4) = 4
    expect(result.totalPoints).toBe(26) // 22 + 4
  })

  // ==========================================
  // Menge > 1
  // ==========================================

  it('Menge 2: Boni werden mit Menge multipliziert', () => {
    const items = [{ productId: 2, quantity: 2, unitPrice: 3.00 }]
    const result = calculatePointTransaction(purchase, items, [veganProduct], slowPickup, false)

    expect(result.basePoints).toBe(20)   // 10 × 2
    expect(result.veganBonus).toBe(6)    // 3 × 2
    expect(result.totalPoints).toBe(26)  // 20 + 6
  })

  // ==========================================
  // Produkt nicht in products-Liste
  // ==========================================

  it('ignoriert Produkte die nicht in der products-Liste sind', () => {
    const items = [{ productId: 999, quantity: 1, unitPrice: 2.00 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], slowPickup, false)

    // productId 999 nicht in products → keine Punkte
    expect(result.basePoints).toBe(0)
    expect(result.totalPoints).toBe(0)
  })

  // ==========================================
  // Leere Bestellung
  // ==========================================

  it('leere Bestellung ergibt 0 Punkte', () => {
    const result = calculatePointTransaction(purchase, [], [], slowPickup, false)

    expect(result.basePoints).toBe(0)
    expect(result.totalPoints).toBe(0)
    expect(result.streakBonus).toBe(0)
  })

  // ==========================================
  // EC-2: Zwei Bestellungen am selben Tag
  // ==========================================

  it('EC-2: Streak-Bonus auch fuer zweite Abholung am selben Tag wenn Vortag existiert', () => {
    // hasStreakYesterday wird serverseitig geprueft — hier einfach true uebergeben
    const items = [{ productId: 1, quantity: 1, unitPrice: 2.50 }]
    const result = calculatePointTransaction(purchase, items, [normalProduct], slowPickup, true)
    expect(result.streakBonus).toBeGreaterThan(0)
  })
})
