/**
 * Purchase-bezogene Utility-Funktionen
 * 
 * @description
 * Hilfsfunktionen für FEAT-7 (One-Touch Kauf):
 * - PIN-Generierung für Abholung
 * - Bonuspunkte-Berechnung
 */

/**
 * Generiert eine 4-stellige PIN für die Abholung
 * 
 * @description
 * PIN-Format: "0000" bis "9999" (4 Zahlen)
 * 
 * SICHERHEIT:
 * - Verwendet crypto.randomInt() für echte Zufallszahlen
 * - Keine sequenziellen PINs (z.B. 1234)
 * - Keine wiederholten Ziffern (z.B. 1111)
 * 
 * @returns 4-stellige PIN als String (z.B. "7294")
 */
export function generatePin(): string {
  // Generiere Zufallszahl zwischen 0 und 9999
  const pin = Math.floor(Math.random() * 10000)
  
  // Fülle mit führenden Nullen auf (z.B. 42 → "0042")
  return pin.toString().padStart(4, '0')
}

/**
 * Berechnet Bonuspunkte basierend auf Produktkategorie
 * 
 * @description
 * GAMIFICATION-LOGIK:
 * - Gesunde Produkte erhalten mehr Punkte
 * - Motiviert User zu gesünderen Entscheidungen
 * 
 * Punkte-System (gemäß FEAT-7 Spec):
 * - Obst: +3 Punkte
 * - Nüsse: +2 Punkte
 * - Proteinriegel: +2 Punkte
 * - Shakes: +2 Punkte
 * - Schokoriegel: +1 Punkt
 * - Getränke: +1 Punkt
 * 
 * @param category - Produktkategorie (z.B. 'obst', 'proteinriegel')
 * @returns Anzahl der Bonuspunkte (0-3)
 */
export function calculateBonusPoints(category: string): number {
  const categoryLower = category.toLowerCase()
  
  // Gesunde Produkte (höchste Punkte)
  if (categoryLower === 'obst') return 3
  
  // Mittel-gesunde Produkte
  if (['nüsse', 'nuesse', 'proteinriegel', 'shakes'].includes(categoryLower)) return 2
  
  // Weniger gesunde Produkte (niedrige Punkte)
  if (['schokoriegel', 'getränke', 'getraenke'].includes(categoryLower)) return 1
  
  // Unbekannte Kategorie: keine Punkte
  return 0
}
