/**
 * Credits-bezogene TypeScript-Definitionen
 * 
 * Dieses File enthält alle Guthaben-relevanten Types und Enums.
 */

/**
 * Guthaben-Status für farbliche Kennzeichnung in der UI
 * 
 * @description
 * - 'good': Guthaben > 20€ (grün)
 * - 'warning': Guthaben 10-20€ (gelb)
 * - 'critical': Guthaben < 10€ (rot)
 * 
 * Siehe: credits.ts:9-14 für Berechnungs-Logik
 */
export type BalanceStatus = 'good' | 'warning' | 'critical'

/**
 * Erlaubte Auflade-Beträge
 * 
 * Diese Beträge können via POST /api/credits/recharge aufgeladen werden.
 * Siehe: recharge.post.ts:6
 * 
 * @description
 * - '10': Kleiner Betrag für gelegentliche Nutzer
 * - '25': Standard-Betrag (entspricht Monatspauschale)
 * - '50': Großer Betrag für Vielnutzer
 */
export type AllowedRechargeAmount = '10' | '25' | '50'

/**
 * Auflade-Option für UI-Darstellung
 * Wird im Recharge-Modal verwendet
 * 
 * @property amount - Betrag als String (siehe AllowedRechargeAmount)
 * @property label - Display-Label mit €-Zeichen (z.B. "10 €")
 * @property description - Kurzbeschreibung (z.B. "Klein", "Standard", "Groß")
 */
export interface RechargeOption {
  amount: AllowedRechargeAmount
  label: string
  description: string
}

/**
 * Transaktions-Typ für Credit-Transactions-Tabelle
 * 
 * @description
 * - 'recharge': Manuelles Aufladen durch User
 * - 'monthly': Monatspauschale (+25€)
 * - 'purchase': Kauf eines Produkts (zukünftig)
 */
export type TransactionType = 'recharge' | 'monthly' | 'purchase'
