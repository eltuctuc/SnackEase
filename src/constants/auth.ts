/**
 * Auth-Konstanten für SnackEase
 * 
 * Diese Datei enthält alle Authentifizierungs-relevanten Konstanten
 * wie Rate-Limiting, Session-Konfiguration und Validierungs-Regeln.
 */

/**
 * Rate-Limiting-Konfiguration für Login-Endpunkt
 * 
 * @description
 * Schützt vor Brute-Force-Attacken durch Limitierung der Login-Versuche
 * pro IP-Adresse innerhalb eines Zeitfensters.
 * 
 * Business-Regel:
 * - Maximal 5 Login-Versuche pro IP
 * - Zeitfenster: 15 Minuten (900.000 ms)
 * - Nach Erreichen des Limits: User muss 15 Min warten
 * 
 * WICHTIG: In Production sollte ein Redis-basiertes Rate-Limiting
 * verwendet werden für Load-Balancer-Szenarien.
 */
export const RATE_LIMIT_CONFIG = {
  /** Maximale Anzahl Login-Versuche pro IP */
  MAX_ATTEMPTS: 5,
  
  /** Zeitfenster in Millisekunden (15 Minuten) */
  WINDOW_MS: 15 * 60 * 1000,
} as const

/**
 * Session-Cookie-Konfiguration
 * 
 * @description
 * Bestimmt Lebensdauer und Sicherheits-Settings des Auth-Cookies.
 * 
 * SICHERHEIT:
 * - httpOnly: true → Cookie nicht via JavaScript auslesbar (XSS-Schutz)
 * - secure: nur in Production → HTTPS-only
 * - sameSite: 'lax' → CSRF-Schutz
 */
export const SESSION_CONFIG = {
  /** Cookie-Name für Auth-Token */
  COOKIE_NAME: 'auth_token',
  
  /** Session-Dauer in Sekunden (7 Tage) */
  MAX_AGE: 60 * 60 * 24 * 7,
  
  /** Cookie-Path (alle Routes) */
  PATH: '/',
} as const

/**
 * Erlaubte Email-Domain für Login
 * 
 * @description
 * Nur Emails mit dieser Domain können sich einloggen.
 * 
 * WICHTIG: In Production auf echte Firmen-Domain umstellen
 * (z.B. '@unternehmen.de')
 */
export const ALLOWED_EMAIL_DOMAIN = '@demo.de'

/**
 * Erlaubte User-Rollen
 * 
 * @description
 * - 'admin': Voller Zugriff auf Admin-Panel
 * - 'mitarbeiter': Zugriff auf Dashboard + Produktkatalog
 * - 'user': (aktuell nicht verwendet) Zukünftig für externe User
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MITARBEITER: 'mitarbeiter',
  USER: 'user',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
