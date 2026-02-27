# FEAT-2: Demo User Authentication

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-1 (Admin Authentication) - Login-System existiert bereits

## 1. Overview

**Beschreibung:** Ermöglicht Demo-Nutzern (Mitarbeiter-Personas) sich am System anzumelden und abzumelden.

**Ziel:** Realistische Anmeldung mit Email/Passwort für verschiedene Persona-Profile.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Demo-Nutzer möchte ich mich mit Email und Passwort anmelden | Must-Have |
| US-2 | Als Demo-Nutzer möchte ich nach der Nutzung mich wieder abmelden | Must-Have |
| US-3 | Als Demo-Nutzer möchte ich sehen, wer ich bin | Must-Have |
| US-4 | Als Demo-Nutzer möchte ich meine Persona-Eigenschaften im Profil sehen | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Login-Formular mit Email und Passwort | Must-Have |
| REQ-2 | Anmeldung nur für @demo.de Emails | Must-Have |
| REQ-3 | Gleiches Passwort für alle Demo-User: demo123 | Must-Have |
| REQ-4 | Logout-Funktion | Must-Have |
| REQ-5 | Session-Persistenz (eingeloggt bleiben nach Reload) | Must-Have |
| REQ-6 | Nach Abmeldung: Zurück zur Login-Seite mit User-Auswahl | Must-Have |

## 4. Demo-Nutzer (Personas)

| Persona | Email | Standort | Startguthaben | Rolle |
|---------|-------|----------|---------------|-------|
| Nina Neuanfang | nina@demo.de | Nürnberg | 25€ | mitarbeiter |
| Maxine Snackliebhaber | maxine@demo.de | Berlin | 15€ | mitarbeiter |
| Lucas Gesundheitsfan | lucas@demo.de | Nürnberg | 30€ | mitarbeiter |
| Alex Gelegenheitskäufer | alex@demo.de | Berlin | 20€ | mitarbeiter |
| Tom Schnellkäufer | tom@demo.de | Nürnberg | 10€ | mitarbeiter |

## 5. Acceptance Criteria

- [ ] Login-Formular mit Email und Passwort
- [ ] Nur @demo.de Domains erlaubt
- [ ] Falsches Passwort zeigt Fehlermeldung
- [ ] Nach Login: Weiterleitung zur Startseite
- [ ] Eingeloggter User wird im Header angezeigt
- [ ] Logout-Funktion vorhanden
- [ ] Nach Abmeldung: Zurück zur Login-Seite

## 6. UI/UX Vorgaben

- Login-Seite mit SnackEase Branding
- Login-Maske zeigt alle verfügbaren Demo-Nutzer (als Auswahl)
- Logout im Header mit User-Namen

## 7. Technische Hinweise

- **Neon Database** mit Drizzle ORM (wie FEAT-1)
- **Cookie-basierte Session** (useCookie, SSR-fähig)
- **Role:** `mitarbeiter` (unterscheidet sich von `admin`)
- **Passwort-Hashing:** bcrypt (wie Admin)
- **User-Tabelle:** `users` (existiert bereits aus FEAT-1)
- Seed-Daten: 5 Demo-User mit bcrypt-hashed "demo123"

### API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/auth/login` | POST | Login (erweitert für mitarbeiter-Rolle) |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Aktuellen User holen |

## 8. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Falsches Passwort | "Ungültige Anmeldedaten" Fehlerm EC-2 |eldung |
| Andere Domain als @demo.de | "Nur demo.de Emails erlaubt" |
| EC-3 | User nicht vorhanden | "Account nicht gefunden" |
| EC-4 | Session abgelaufen | Automatisch ausloggen |
| EC-5 | Admin versucht sich als mitarbeiter anzumelden | Funktioniert (gleiches System) |

---

## 9. UX Design

### 9.1 Personas-Abdeckung

| Persona | Erfüllte Bedürfnisse | Status |
|---------|----------------------|--------|
| Nina Neuanfang (P1) | Einfache Anmeldung, klare Anleitung | ✅ Muss einfach sein |
| Maxine Snackliebhaber (P2) | Schneller Login für Stammnutzer | ✅ Ein Klick bevorzugt |
| Lucas Gesundheitsfan (P3) | Anmeldung ohne Hürden | ✅ Standard |
| Alex Gelegenheitskäufer (P4) | Unkomplizierte Anmeldung | ✅ Muss schnell gehen |
| Tom Schnellkäufer (P8) | Minimaler Aufwand | ✅ One-Click bevorzugt |

### 9.2 User Flow: Login

```
┌────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ Login-Seite    │────▶│ Persona-Auswahl │────▶│ Passwort-Eingabe │
│ (FEAT-0)      │     │ (5 Personas)    │     │ (demo123)        │
└────────────────┘     └─────────────────┘     └────────┬─────────┘
                                                        │
                       ┌──────────────┐    ┌─────────────┴────────────┐
                       │ Startseite   │◀───│ Fehler:                 │
                       │ (Dashboard)  │    │ "Ungültige Anmeldedaten"│
                       └──────────────┘    └────────────────────────┘
```

**Alternativer Flow (Admin):**
```
Login-Seite → "Als Admin anmelden" → admin@demo.de + admin123 → /admin
```

### 9.3 Wireframe: Login-Seite

```
┌─────────────────────────────────────────┐
│              🍎 SnackEase               │
│                                         │
│         Willkommen zurück!              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Wähle dein Profil:            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │  Nina     │  │  Maxine   │          │
│  │  Nürnberg │  │  Berlin   │          │
│  │  25€ 💰  │  │  15€ 💰   │          │
│  └───────────┘  └───────────┘          │
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │  Lucas    │  │  Alex     │          │
│  │  Nürnberg │  │  Berlin   │          │
│  │  30€ 💰   │  │  20€ 💰   │          │
│  └───────────┘  └───────────┘          │
│                                         │
│  ┌───────────┐                          │
│  │  Tom      │                          │
│  │  Nürnberg │                          │
│  │  10€ 💰  │                          │
│  └───────────┘                          │
│                                         │
│  ─────── ODER ───────                   │
│                                         │
│  [ Als Admin anmelden  ]               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Passwort: [●●●●●●●]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [  Anmelden  ]                        │
│                                         │
│  Passwort für Demo: demo123             │
└─────────────────────────────────────────┘
```

### 9.4 Accessibility (WCAG 2.1)

| Kriterium | Status | Hinweis |
|-----------|--------|---------|
| Farbkontrast (4.5:1) | ✅ | Text auf Karten lesbar |
| Tastatur-Navigation | ✅ | Tab-Reihenfolge: Persona → Passwort → Button |
| Screen Reader | ✅ | aria-label für Karten, Button |
| Focus-Indikatoren | ✅ | Sichtbare Fokus-Ringe |
| Fehlermeldungen | ✅ | Klar verständlich (EC-1, EC-2) |
| Touch-Targets (44x44px) | ⚠️ | Persona-Karten mindestens 48x48px |
| Keine Zeitlimits | ✅ | Kein Session-Timeout während Eingabe |

### 9.5 UX-Empfehlungen

| ID | Empfehlung | Priorität | Begründung |
|----|------------|-----------|------------|
| UX-1 | Persona-Karten mit Initialen/Avatar | Medium | Schneller Wiedererkennung |
| UX-2 | Aktuelles Guthaben auf Karte | High | Tom/Maxine wollen schnell sehen |
| UX-3 | "demo123" als Hinweis unter Passwort | Low | Für Nina (Neuling) hilfreich |
| UX-4 | Passwort-Sichtbarkeit-Toggle | Medium | Eye-Icon für Barrierefreiheit |
| UX-5 | Enter-Taste für Submit | High | Power-User (Tom, Maxine) |
| UX-6 | Loading-State beim Login | Medium | Erwartungshaltung |
| UX-7 | "Angemeldet als [Name]" im Header | High | Klare Identifikation |
| UX-8 | Logout mit Bestätigung (optional) | Low | Unbeabsichtigtes Logout verhindern |

### 9.6 Pain Points der Personas

| Persona | Pain Point | Lösung in UX |
|---------|-----------|--------------|
| Nina (P1) | Überfordert von Infos | Einfache Persona-Karten, nicht überladen |
| Maxine (P2) | Will schnell rein | One-Click Login nach Auswahl |
| Lucas (P3) | Keine speziellen Anforderungen | Standard-Flow |
| Alex (P4) | Zeitmangel | Minimaler Flow |
| Tom (P8) | Will minimalen Aufwand | Passwort voreingestellt oder Auto-Fill |

---

## 10. Implementierungs-Details

### 10.1 Login.post.ts Erweiterung

Der bestehende `/api/auth/login` muss erweitert werden:

```typescript
// Bestehende Admin-Logik (FEAT-1)
if (user[0].role !== 'admin') {
  return { success: false, error: 'Zugriff verweigert' };
}

// NEU: Auch mitarbeiter erlauben
if (user[0].role !== 'admin' && user[0].role !== 'mitarbeiter') {
  return { success: false, error: 'Zugriff verweigert' };
}
```

### 10.2 Seed-Daten

Alle 5 Personas in `users` Tabelle einfügen:

```typescript
// Seed-Beispiel (bcrypt hash von "demo123")
const demoUsers = [
  { email: 'nina@demo.de', name: 'Nina Neuanfang', role: 'mitarbeiter', location: 'Nürnberg' },
  { email: 'maxine@demo.de', name: 'Maxine Snackliebhaber', role: 'mitarbeiter', location: 'Berlin' },
  { email: 'lucas@demo.de', name: 'Lucas Gesundheitsfan', role: 'mitarbeiter', location: 'Nürnberg' },
  { email: 'alex@demo.de', name: 'Alex Gelegenheitskäufer', role: 'mitarbeiter', location: 'Berlin' },
  { email: 'tom@demo.de', name: 'Tom Schnellkäufer', role: 'mitarbeiter', location: 'Nürnberg' },
];
```

### 10.3 Auth Store Anpassungen

Bestehenden Store erweitern für Demo-User:

```typescript
getters: {
  isAdmin: (state) => state.user?.role === 'admin',
  isMitarbeiter: (state) => state.user?.role === 'mitarbeiter',
}
```
