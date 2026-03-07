/**
 * API-Response-Definitionen für Server-Endpunkte
 * 
 * Dieses File enthält alle TypeScript-Interfaces für API-Responses,
 * um Type-Safety zwischen Frontend und Backend zu gewährleisten.
 */

import type { User } from './user'

/**
 * Response-Struktur für Credits-Balance-Abfrage
 * Endpoint: GET /api/credits/balance
 * 
 * @property userId - ID des Users (für Verifizierung)
 * @property balance - Aktuelles Guthaben als String (wegen Decimal-Precision)
 * @property lastRechargedAt - Letztes Auflade-Datum (ISO-8601 String oder null)
 */
export interface CreditsBalanceResponse {
  userId: number
  balance: string
  lastRechargedAt: string | null
}

/**
 * Response-Struktur für Credits-Aufladung
 * Endpoint: POST /api/credits/recharge
 * 
 * @property success - Ob die Aufladung erfolgreich war
 * @property newBalance - Neuer Guthabenstand als String
 * @property message - Erfolgs- oder Fehlermeldung für User-Anzeige
 */
export interface CreditsRechargeResponse {
  success: boolean
  newBalance: string
  message: string
}

/**
 * Response-Struktur für Monatspauschale
 * Endpoint: POST /api/credits/monthly
 * 
 * Struktur identisch zu CreditsRechargeResponse
 */
export interface CreditsMonthlyResponse {
  success: boolean
  newBalance: string
  message: string
}

/**
 * Response-Struktur für User-Liste (Admin)
 * Endpoint: GET /api/admin/users
 */
export interface AdminUsersResponse {
  users: Array<User & {
    isActive: boolean
    createdAt: Date
  }>
}

/**
 * Response-Struktur für User-Erstellung (Admin)
 * Endpoint: POST /api/admin/users
 */
export interface AdminCreateUserResponse {
  success: boolean
  user: User
  email: string
  password: string
}

/**
 * Request-Body für User-Erstellung (Admin)
 * Endpoint: POST /api/admin/users
 * 
 * @property name - Anzeigename für den neuen User
 * @property location - Standort ('Nürnberg' | 'Berlin')
 * @property startCredits - Initiales Guthaben (Standard: 25€)
 */
export interface AdminCreateUserRequest {
  name: string
  location: 'Nürnberg' | 'Berlin'
  startCredits: number
}

/**
 * Response-Struktur für Admin-Statistiken
 * Endpoint: GET /api/admin/stats
 */
export interface AdminStatsResponse {
  totalUsers: number
  activeUsers: number
  totalCreditsIssued: string
  totalProducts: number
}
