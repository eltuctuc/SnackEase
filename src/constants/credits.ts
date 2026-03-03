/**
 * Credits/Guthaben-Konstanten für SnackEase
 * 
 * Diese Datei enthält alle Schwellwerte und Konfigurationen
 * für das Guthaben-System, um Magic Numbers zu vermeiden.
 */

/**
 * Schwellwerte für Guthaben-Status-Anzeige
 * 
 * @description
 * Diese Werte bestimmen die farbliche Kennzeichnung des Guthabens
 * in der UI (grün/gelb/rot).
 * 
 * Business-Regel:
 * - Guthaben > 20€: User hat ausreichend Guthaben (grün)
 * - Guthaben 10-20€: Warnung, bald aufladen (gelb)
 * - Guthaben < 10€: Kritisch, dringend aufladen nötig (rot)
 */
export const BALANCE_THRESHOLDS = {
  /** Ab diesem Wert wird Guthaben als "gut" angezeigt (grün) */
  GOOD: 20,
  
  /** Ab diesem Wert wird Guthaben als "Warnung" angezeigt (gelb) */
  WARNING: 10,
  
  /** Unter diesem Wert ist Guthaben "kritisch" (rot) */
  // CRITICAL: implizit < WARNING (10€)
} as const

/**
 * Erlaubte Auflade-Beträge in Euro
 * 
 * @description
 * Diese Beträge können im Recharge-Modal ausgewählt werden.
 * Backend-Validierung erfolgt in: src/server/api/credits/recharge.post.ts:6
 * 
 * Business-Regel:
 * - 10€: Kleiner Betrag für gelegentliche Nutzer
 * - 25€: Standard-Betrag (entspricht Monatspauschale)
 * - 50€: Großer Betrag für Vielnutzer / Kostenoptimierung
 */
export const RECHARGE_AMOUNTS = {
  SMALL: '10',
  STANDARD: '25',
  LARGE: '50',
} as const

/**
 * Monatspauschale in Euro
 * 
 * @description
 * Betrag, den Mitarbeiter monatlich als Pauschale erhalten können.
 * Verhindert, dass Mitarbeiter mehrfach pro Monat die Pauschale abrufen.
 * 
 * Backend-Logik: src/server/api/credits/monthly.post.ts
 */
export const MONTHLY_ALLOWANCE = 25

/**
 * UI-Konstanten für Recharge-Modal
 * 
 * @description
 * Vordefinierte Optionen für das Auflade-Modal mit Labels und Beschreibungen
 * für bessere UX.
 */
export const RECHARGE_OPTIONS = [
  { 
    amount: RECHARGE_AMOUNTS.SMALL, 
    label: `${RECHARGE_AMOUNTS.SMALL} €`, 
    description: 'Klein' 
  },
  { 
    amount: RECHARGE_AMOUNTS.STANDARD, 
    label: `${RECHARGE_AMOUNTS.STANDARD} €`, 
    description: 'Standard' 
  },
  { 
    amount: RECHARGE_AMOUNTS.LARGE, 
    label: `${RECHARGE_AMOUNTS.LARGE} €`, 
    description: 'Groß' 
  },
] as const
