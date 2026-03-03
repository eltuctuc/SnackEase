/**
 * POST /api/auth/login
 * 
 * Authentifizierungs-Endpunkt für User-Login mit Rate-Limiting
 * 
 * @description
 * Dieser Endpunkt:
 * - Prüft Login-Credentials (Email + Passwort)
 * - Validiert Email-Domain (@demo.de erforderlich)
 * - Prüft User-Rolle (nur 'admin' und 'mitarbeiter' erlaubt)
 * - Prüft ob Account aktiv ist (isActive = true)
 * - Erstellt Session-Cookie bei Erfolg
 * - Implementiert Rate-Limiting gegen Brute-Force
 * 
 * @route POST /api/auth/login
 * @access Public
 * 
 * @requestBody
 * ```json
 * {
 *   "email": "admin@demo.de",
 *   "password": "geheim123"
 * }
 * ```
 * 
 * @response Success
 * ```json
 * {
 *   "success": true,
 *   "user": {
 *     "id": 1,
 *     "email": "admin@demo.de",
 *     "name": "Admin User",
 *     "role": "admin",
 *     "location": "Nürnberg"
 *   }
 * }
 * ```
 * 
 * @response Error
 * ```json
 * {
 *   "success": false,
 *   "error": "Ungültige Anmeldedaten"
 * }
 * ```
 * 
 * @security
 * - Rate-Limiting: Max 5 Versuche pro IP in 15 Minuten
 * - Passwort-Hashing: bcrypt mit Salt
 * - Session-Cookie: httpOnly, sameSite='lax', secure in Production
 * 
 * @see src/constants/auth.ts für Konfigurations-Werte
 */

import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { RATE_LIMIT_CONFIG, SESSION_CONFIG, ALLOWED_EMAIL_DOMAIN, USER_ROLES } from '~/constants/auth';

// ========================================
// RATE LIMITING - In-Memory Store
// ========================================

/**
 * In-Memory-Map für Rate-Limiting
 * 
 * @description
 * Speichert Login-Versuche pro IP-Adresse mit Reset-Timestamp.
 * 
 * Key: Client-IP (String)
 * Value: { count: Anzahl Versuche, resetTime: Timestamp wann Counter resettet wird }
 * 
 * WICHTIG: In Production durch Redis ersetzen für Multi-Server-Setup!
 * Aktuell geht der State bei Server-Restart verloren.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Extrahiert Client-IP-Adresse aus Request
 * 
 * @param event - H3-Event-Objekt
 * @returns Client-IP als String, 'unknown' falls nicht ermittelbar
 * 
 * @description
 * Prüft folgende Quellen in dieser Reihenfolge:
 * 1. x-forwarded-for Header (bei Reverse Proxy / Load Balancer)
 * 2. remoteAddress vom Socket (direkte Verbindung)
 * 3. Fallback: 'unknown'
 * 
 * BEACHTE: Bei Load-Balancern kann x-forwarded-for mehrere IPs enthalten
 * (Client, Proxy1, Proxy2, ...). Wir nehmen die erste (Client-IP).
 */
function getClientIp(event: any): string {
  return event.node.req.headers['x-forwarded-for'] || 
         event.node.req.socket.remoteAddress || 
         'unknown';
}

/**
 * Prüft ob Rate-Limit für IP erreicht ist
 * 
 * @param clientIp - Client-IP-Adresse
 * @returns true wenn Request erlaubt, false wenn Limit erreicht
 * 
 * @description
 * Implementiert Sliding-Window-Rate-Limiting:
 * - Neuer Eintrag: Counter = 1, Reset in 15 Min
 * - Bestehender Eintrag nach Ablauf: Counter = 1, neues Reset-Zeitfenster
 * - Bestehender Eintrag innerhalb Fenster: Counter++
 * - Limit erreicht (≥5): Blockiere Request
 * 
 * Business-Regel: Max 5 Login-Versuche in 15 Minuten pro IP
 * (Konfiguration siehe: src/constants/auth.ts → RATE_LIMIT_CONFIG)
 */
function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);
  
  // Fall 1: Kein Record vorhanden ODER Zeitfenster abgelaufen → Neues Fenster starten
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { 
      count: 1, 
      resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS 
    });
    return true; // Request erlaubt
  }
  
  // Fall 2: Limit erreicht → Request blockieren
  if (record.count >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
    return false; // Request blockiert
  }
  
  // Fall 3: Innerhalb Limit → Counter erhöhen und erlauben
  record.count++;
  return true; // Request erlaubt
}

// ========================================
// MAIN HANDLER
// ========================================

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // SCHRITT 1: Rate-Limiting prüfen
  // ----------------------------------------
  
  const clientIp = getClientIp(event);
  
  if (!checkRateLimit(clientIp)) {
    // Rate-Limit erreicht → Request blockieren
    // BEACHTE: Kein HTTP-Error werfen, sondern JSON-Response für bessere UX
    return { success: false, error: 'Zu viele Versuche. Bitte später erneut versuchen.' };
  }
  
  // ----------------------------------------
  // SCHRITT 2: Request-Body validieren
  // ----------------------------------------
  
  const body = await readBody(event);
  const { email, password } = body;

  // Validierung: Email und Passwort müssen vorhanden sein
  if (!email || !password) {
    return { success: false, error: 'Email und Passwort erforderlich' };
  }

  // ----------------------------------------
  // SCHRITT 3: Email-Domain validieren
  // ----------------------------------------
  
  /**
   * BUSINESS-REGEL: Nur @demo.de Emails erlaubt
   * 
   * WICHTIG: In Production auf echte Firmen-Domain umstellen!
   * Verhindert, dass externe Personen Accounts erstellen können.
   * 
   * @see src/constants/auth.ts → ALLOWED_EMAIL_DOMAIN
   */
  if (!email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
    return { success: false, error: `Nur ${ALLOWED_EMAIL_DOMAIN} Emails erlaubt` };
  }

  // ----------------------------------------
  // SCHRITT 4: User in DB suchen
  // ----------------------------------------
  
  // BEACHTE: Email wird lowercase gespeichert (case-insensitive Login)
  const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

  if (!user[0]) {
    // User nicht gefunden → Generische Fehlermeldung (Security Best Practice)
    // Verhindert User-Enumeration (Angreifer kann nicht prüfen ob Email existiert)
    return { success: false, error: 'Ungültige Anmeldedaten' };
  }

  // ----------------------------------------
  // SCHRITT 5: User-Rolle prüfen
  // ----------------------------------------
  
  /**
   * BUSINESS-REGEL: Nur Admins und Mitarbeiter dürfen sich einloggen
   * 
   * Normale 'user'-Rolle ist aktuell nicht implementiert.
   * Zukünftig könnte 'user' für Gäste/externe Personen verwendet werden.
   */
  if (user[0].role !== USER_ROLES.ADMIN && user[0].role !== USER_ROLES.MITARBEITER) {
    return { success: false, error: 'Zugriff verweigert' };
  }

  // ----------------------------------------
  // SCHRITT 6: Account-Status prüfen
  // ----------------------------------------
  
  /**
   * BUSINESS-REGEL: Deaktivierte Accounts können sich nicht einloggen
   * 
   * Admins können User-Accounts über /admin/users deaktivieren.
   * Verhindert Login ohne Account-Löschung (Soft-Delete-Pattern).
   */
  if (user[0].isActive === false) {
    return { success: false, error: 'Account ist deaktiviert' };
  }

  // ----------------------------------------
  // SCHRITT 7: Passwort verifizieren
  // ----------------------------------------
  
  /**
   * Passwort-Vergleich mit bcrypt
   * 
   * SICHERHEIT:
   * - Passwörter werden niemals im Klartext gespeichert
   * - bcrypt verwendet Salting & Hashing (sehr langsam → Brute-Force schwierig)
   * - passwordHash kann null sein bei automatisch generierten Accounts
   * 
   * @see src/server/api/admin/users/index.post.ts für Account-Erstellung
   */
  const isValid = await bcrypt.compare(password, user[0].passwordHash || '');

  if (!isValid) {
    // Passwort falsch → Generische Fehlermeldung (Security Best Practice)
    return { success: false, error: 'Ungültige Anmeldedaten' };
  }

  // ----------------------------------------
  // SCHRITT 8: Session-Cookie erstellen
  // ----------------------------------------
  
  /**
   * Auth-Cookie mit User-ID setzen
   * 
   * SICHERHEIT:
   * - httpOnly: true → Cookie nicht via JavaScript auslesbar (XSS-Schutz)
   * - secure: nur in Production → HTTPS-only (Man-in-the-Middle-Schutz)
   * - sameSite: 'lax' → CSRF-Schutz (Cookie nur bei Same-Site-Requests)
   * - maxAge: 7 Tage → User muss sich nach 1 Woche neu einloggen
   * 
   * Format: "user_{id}" (z.B. "user_1")
   * Wird in allen geschützten Routes via getUserIdFromCookie() ausgelesen.
   * 
   * @see src/server/utils/auth.ts → getUserIdFromCookie()
   * @see src/constants/auth.ts → SESSION_CONFIG
   */
  setCookie(event, SESSION_CONFIG.COOKIE_NAME, `user_${user[0].id}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_CONFIG.MAX_AGE,
    path: SESSION_CONFIG.PATH,
  });

  // ----------------------------------------
  // SCHRITT 9: Success-Response mit User-Daten
  // ----------------------------------------
  
  /**
   * Erfolgreiche Authentifizierung
   * 
   * BEACHTE: Passwort-Hash wird NICHT zurückgegeben (Security)
   * Nur öffentliche User-Daten werden an Frontend gesendet.
   */
  return {
    success: true,
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      location: user[0].location,
    },
  };
});
