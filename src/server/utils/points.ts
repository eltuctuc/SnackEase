/**
 * Punkte-Berechnungs-Utility (FEAT-23)
 *
 * @description
 * Zentrale Logik fuer die Berechnung von Punkte-Transaktionen.
 * Wird in pickup.post.ts verwendet und ist isoliert testbar.
 *
 * Berechnungsregeln (gemaess FEAT-23 Spec):
 * - Basis-Punkte: 10 pro abgeholtem Produkt (inkl. Menge)
 * - Vegan/Gesund-Bonus: +3 pro Produkt mit isVegan = true oder isHealthy = true
 * - Protein-Bonus: +2 pro Produkt mit protein >= PROTEIN_THRESHOLD
 * - Angebots-Bonus: +2 pro Produkt, bei dem unitPrice < products.price (Angebot war aktiv)
 * - Schnelligkeits-Bonus: +5 wenn pickedUpAt - purchase.createdAt < 30 Minuten
 * - Streak-Bonus: +20% (gerundet) wenn Vortag-Abholung existiert
 */

/** Mindest-Protein-Wert fuer den Protein-Bonus (in Gramm) */
export const PROTEIN_THRESHOLD = 15

/** Basis-Punkte pro abgeholtem Produkt */
export const BASE_POINTS_PER_PRODUCT = 10

/** Vegan/Gesund-Bonus pro qualifiziertem Produkt */
export const VEGAN_BONUS_PER_PRODUCT = 3

/** Protein-Bonus pro qualifiziertem Produkt */
export const PROTEIN_BONUS_PER_PRODUCT = 2

/** Angebots-Bonus pro Produkt mit aktivem Angebot */
export const OFFER_BONUS_PER_PRODUCT = 2

/** Schnelligkeits-Bonus bei Abholung < 30 Minuten */
export const SPEED_BONUS = 5

/** Schnelligkeits-Grenze in Millisekunden (30 Minuten) */
export const SPEED_THRESHOLD_MS = 30 * 60 * 1000

/** Streak-Multiplikator (1.2 = +20%) */
export const STREAK_MULTIPLIER = 1.2

// ========================================
// Eingabe-Typen
// ========================================

export interface PointPurchaseItem {
  productId: number
  quantity: number
  /** Tatsaechlich bezahlter Preis zum Bestellzeitpunkt */
  unitPrice: number
}

export interface PointProduct {
  id: number
  /** Regulaerer Produktpreis (ohne Angebot) */
  price: number
  isVegan: boolean
  /** Protein-Gehalt in Gramm (null wenn nicht angegeben) */
  protein: number | null
}

export interface PointPurchase {
  createdAt: Date | string
}

// ========================================
// Ausgabe-Typ
// ========================================

export interface PointTransactionResult {
  basePoints: number
  veganBonus: number
  proteinBonus: number
  offerBonus: number
  speedBonus: number
  streakBonus: number
  totalPoints: number
}

// ========================================
// Hilfsfunktionen
// ========================================

/**
 * Prueft ob die Abholung innerhalb des Schnelligkeits-Grenzwerts liegt
 */
export function isSpeedEligible(
  purchaseCreatedAt: Date | string,
  pickedUpAt: Date | string,
): boolean {
  const created = purchaseCreatedAt instanceof Date ? purchaseCreatedAt : new Date(purchaseCreatedAt)
  const pickedUp = pickedUpAt instanceof Date ? pickedUpAt : new Date(pickedUpAt)
  return pickedUp.getTime() - created.getTime() < SPEED_THRESHOLD_MS
}

/**
 * Prueft ob ein Produkt einen Angebots-Bonus erhaelt.
 * Massgeblich ist ob unitPrice < products.price (Angebot war zum Bestellzeitpunkt aktiv, EC-5).
 */
export function hasOfferBonus(unitPrice: number, productPrice: number): boolean {
  return unitPrice < productPrice
}

// ========================================
// Hauptfunktion
// ========================================

/**
 * Berechnet eine Punkte-Transaktion fuer eine abgeholte Bestellung.
 *
 * @param purchase         - Bestellung (createdAt fuer Schnelligkeits-Pruefung)
 * @param purchaseItems    - Produkte der Bestellung mit Menge und bezahltem Preis
 * @param products         - Produkt-Stammdaten (isVegan, protein, price)
 * @param pickedUpAt       - Abhol-Zeitstempel
 * @param hasStreakYesterday - true wenn der Nutzer gestern schon abgeholt hat (DB-Pruefung bereits erfolgt)
 * @returns Alle Punktekomponenten und die Gesamtsumme
 */
export function calculatePointTransaction(
  purchase: PointPurchase,
  purchaseItems: PointPurchaseItem[],
  products: PointProduct[],
  pickedUpAt: Date | string,
  hasStreakYesterday: boolean,
): PointTransactionResult {
  // Produkt-Map fuer O(1)-Lookup
  const productMap = new Map<number, PointProduct>()
  for (const p of products) {
    productMap.set(p.id, p)
  }

  let basePoints = 0
  let veganBonus = 0
  let proteinBonus = 0
  let offerBonus = 0

  // Pro Produkt (Menge wird beruecksichtigt)
  for (const item of purchaseItems) {
    const product = productMap.get(item.productId)
    if (!product) continue

    const qty = item.quantity

    // Basis-Punkte: 10 pro Einheit
    basePoints += BASE_POINTS_PER_PRODUCT * qty

    // Vegan-Bonus: +3 pro Einheit wenn isVegan
    if (product.isVegan) {
      veganBonus += VEGAN_BONUS_PER_PRODUCT * qty
    }

    // Protein-Bonus: +2 pro Einheit wenn protein >= Schwellwert
    if (product.protein !== null && product.protein >= PROTEIN_THRESHOLD) {
      proteinBonus += PROTEIN_BONUS_PER_PRODUCT * qty
    }

    // Angebots-Bonus: +2 pro Einheit wenn unitPrice < product.price
    if (hasOfferBonus(item.unitPrice, product.price)) {
      offerBonus += OFFER_BONUS_PER_PRODUCT * qty
    }
  }

  // Schnelligkeits-Bonus: +5 wenn pickedUpAt - createdAt < 30min
  const speed = isSpeedEligible(purchase.createdAt, pickedUpAt) ? SPEED_BONUS : 0

  // Vor-Streak-Summe
  const beforeStreak = basePoints + veganBonus + proteinBonus + offerBonus + speed

  // Streak-Bonus: 20% auf Vor-Streak-Summe, gerundet (EC-11)
  const streakRaw = hasStreakYesterday ? beforeStreak * (STREAK_MULTIPLIER - 1) : 0
  const streakBonus = Math.round(streakRaw)

  // Gesamt-Punkte
  const totalPoints = beforeStreak + streakBonus

  return {
    basePoints,
    veganBonus,
    proteinBonus,
    offerBonus,
    speedBonus: speed,
    streakBonus,
    totalPoints,
  }
}
