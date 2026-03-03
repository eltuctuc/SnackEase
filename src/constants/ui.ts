/**
 * UI-Konstanten für SnackEase
 * 
 * Diese Datei enthält alle UI-relevanten Konstanten wie
 * Delays, Timeouts und Animations-Konfigurationen.
 */

/**
 * Simuliertes Recharge-Delay in Millisekunden
 * 
 * @description
 * Simuliert eine realistische Ladezeit für die Guthaben-Aufladung,
 * um dem User ein natürliches UX-Gefühl zu vermitteln.
 * 
 * In Production würde hier ein echter API-Call stattfinden.
 * 
 * @constant BASE_DELAY - Basis-Delay (2 Sekunden)
 * @constant RANDOM_DELAY_MAX - Maximale zusätzliche Random-Verzögerung (1 Sekunde)
 * 
 * Gesamte Delay-Range: 2.0 - 3.0 Sekunden
 */
export const RECHARGE_SIMULATION = {
  /** Basis-Delay in ms (2 Sekunden) */
  BASE_DELAY: 2000,
  
  /** Maximale zusätzliche Random-Verzögerung in ms (1 Sekunde) */
  RANDOM_DELAY_MAX: 1000,
} as const

/**
 * Auto-Close-Delay für Success-Modal in Millisekunden
 * 
 * @description
 * Nach erfolgreicher Guthaben-Aufladung wird das Modal automatisch
 * nach dieser Zeit geschlossen, damit der User den neuen Guthabenstand sieht.
 */
export const SUCCESS_MODAL_AUTO_CLOSE_DELAY = 1500 // 1.5 Sekunden
