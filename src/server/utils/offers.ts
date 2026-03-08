/**
 * Angebots-bezogene Utility-Funktionen (FEAT-14)
 *
 * @description
 * Zentrale Preisberechnungs- und Aktivitätsprüfungs-Logik für Angebote.
 * Diese Funktionen werden an allen Stellen verwendet wo Angebotspreise
 * berechnet werden — niemals inline oder dupliziert.
 */

/**
 * Berechnet den Angebotspreis eines Produkts
 *
 * @param originalPrice - Originalpreis als number
 * @param discountType - Rabatttyp: 'percent' oder 'absolute'
 * @param discountValue - Rabattwert (z.B. 20 für 20% oder 0.50 für 0,50 EUR)
 * @returns Berechneter Angebotspreis als number, auf 2 Dezimalstellen gerundet
 *
 * @example
 * // 20% Rabatt auf 2,50 EUR → 2,00 EUR
 * calculateDiscountedPrice(2.50, 'percent', 20) // => 2.00
 *
 * // 0,50 EUR Rabatt auf 2,50 EUR → 2,00 EUR
 * calculateDiscountedPrice(2.50, 'absolute', 0.50) // => 2.00
 *
 * // 100% Rabatt → 0,00 EUR (nie negativ)
 * calculateDiscountedPrice(2.50, 'percent', 100) // => 0.00
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountType: 'percent' | 'absolute',
  discountValue: number,
): number {
  let discounted: number

  if (discountType === 'percent') {
    discounted = originalPrice * (1 - discountValue / 100)
  } else {
    discounted = originalPrice - discountValue
  }

  // Sicherung gegen negative Preise (EC-3: 100%-Rabatt ergibt 0,00 EUR)
  return Math.round(Math.max(0, discounted) * 100) / 100
}

/**
 * Prüft ob ein Angebot aktuell aktiv ist
 *
 * @param offer - Angebots-Objekt aus der DB
 * @returns true wenn das Angebot gerade aktiv ist
 *
 * @description
 * Aktiv-Logik:
 * - isActive === true (nicht manuell deaktiviert)
 * - startsAt <= NOW() (bereits gestartet)
 * - expiresAt > NOW() (noch nicht abgelaufen)
 */
export function isOfferCurrentlyActive(offer: {
  isActive: boolean
  startsAt: Date | string
  expiresAt: Date | string
}): boolean {
  if (!offer.isActive) return false

  const now = new Date()
  const startsAt = offer.startsAt instanceof Date ? offer.startsAt : new Date(offer.startsAt)
  const expiresAt = offer.expiresAt instanceof Date ? offer.expiresAt : new Date(offer.expiresAt)

  return startsAt <= now && expiresAt > now
}
