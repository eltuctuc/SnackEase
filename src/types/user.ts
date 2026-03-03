/**
 * User-bezogene TypeScript-Definitionen
 * 
 * Dieses File enthält alle User-relevanten Interfaces und Types,
 * um Code-Duplikation zu vermeiden und Type-Safety zu gewährleisten.
 */

/**
 * Basis-User-Objekt wie es aus der Datenbank kommt
 * 
 * @property id - Eindeutige User-ID (Primary Key)
 * @property email - Email-Adresse (muss @demo.de Domain haben)
 * @property name - Anzeigename des Users (optional)
 * @property role - Benutzerrolle ('admin' | 'mitarbeiter' | 'user')
 * @property location - Standort des Users ('Nürnberg' | 'Berlin')
 */
export interface User {
  id: number
  email: string
  name: string | null
  role: string
  location: string | null
}

/**
 * Vollständiges User-Objekt mit allen DB-Feldern
 * Wird hauptsächlich in Admin-Bereichen verwendet
 */
export interface UserWithMetadata extends User {
  isActive: boolean
  createdAt: Date
}

/**
 * Login-Credentials für Authentifizierung
 * 
 * @property email - Muss @demo.de Domain haben (siehe login.post.ts:47)
 * @property password - Klartext-Passwort (wird mit bcrypt verglichen)
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Generische API-Response-Struktur für Success/Error-Handling
 * 
 * @template T - Typ der Response-Daten bei Erfolg
 * 
 * @example
 * ```typescript
 * // Success-Response
 * const response: ApiResponse<User> = {
 *   success: true,
 *   data: { id: 1, email: 'test@demo.de', ... }
 * }
 * 
 * // Error-Response
 * const response: ApiResponse<User> = {
 *   success: false,
 *   error: 'Ungültige Anmeldedaten'
 * }
 * ```
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Login-Response-Struktur
 * Wird von /api/auth/login zurückgegeben
 */
export interface LoginResponse {
  success: boolean
  user?: User
  error?: string
}

/**
 * Me-Response-Struktur
 * Wird von /api/auth/me zurückgegeben (Session-Check)
 */
export interface MeResponse {
  success: boolean
  user: User | null
}
