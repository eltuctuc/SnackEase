# FEAT-2: Demo User Authentication

## Status: ✅ Implementiert

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

- [x] Login-Formular mit Email und Passwort
- [x] Nur @demo.de Domains erlaubt (VALIDIERUNG HINZUGEFÜGT)
- [x] Falsches Passwort zeigt Fehlermeldung
- [x] Nach Login: Weiterleitung zur Startseite
- [x] Eingeloggter User wird im Header angezeigt
- [x] Logout-Funktion vorhanden
- [x] Nach Abmeldung: Zurück zur Login-Seite

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

## 11. Tech-Design (Solution Architect)

### 11.1 Bestehende Architektur

**Vorhandene Komponenten:**
- `/pages/login.vue` - Login-Seite (Admin-Login)
- `/pages/dashboard.vue` - Geschützte Seite
- `/server/api/auth/login.post.ts` - Login-Endpoint
- `/server/api/auth/logout.post.ts` - Logout-Endpoint
- `/server/api/auth/me.get.ts` - Aktueller User
- `/stores/auth.ts` - Pinia Auth Store
- `/server/db/schema.ts` - users Tabelle

### 11.2 Component-Struktur

```
Login-Seite (login.vue) - ERWEITERT
├── SnackEase Header
├── Persona-Auswahl-Bereich (NEU)
│   ├── Persona-Karte: Nina (Nürnberg, 25€)
│   ├── Persona-Karte: Maxine (Berlin, 15€)
│   ├── Persona-Karte: Lucas (Nürnberg, 30€)
│   ├── Persona-Karte: Alex (Berlin, 20€)
│   ├── Persona-Karte: Tom (Nürnberg, 10€)
│   └── "Als Admin anmelden" Button
├── Passwort-Eingabefeld
├── "Anmelden" Button
└── Demo-Passwort Hinweis

Header (AppHeader) - ERWEITERT
├── Logo
├── User-Info (Name + Standort) - NEU
└── Logout Button
```

### 11.3 Daten-Model

**users Tabelle (existiert bereits):**
- id: Eindeutige ID
- email: Demo-Email (@demo.de)
- name: Vollständiger Name
- role: "mitarbeiter" (neu) oder "admin"
- passwordHash: bcrypt Hash von "demo123"
- location: Standort (Nürnberg/Berlin) - NEU

**Was neu hinzukommt:**
- location-Feld in users Tabelle
- 5 neue Demo-User Datensätze

### 11.4 Tech-Entscheidungen

**Warum keine neue Tabelle?**
→ users Tabelle existiert bereits aus FEAT-1, wir erweitern sie nur

**Warum bcrypt für Passwort?**
→ Bereits in FEAT-1 verwendet, gleiche Sicherheitsstandards

**Warum Cookie-basierte Session?**
→ Funktioniert bereits aus FEAT-0/1, SSR-fähig

### 11.5 API Änderungen

| Endpoint | Änderung |
|----------|----------|
| POST /api/auth/login | Erweitern: auch mitarbeiter-Rolle erlauben |
| GET /api/auth/me | Bereits vorhanden, funktioniert für alle Rollen |
| POST /api/auth/logout | Bereits vorhanden, keine Änderung nötig |

### 11.6 Dependencies

**Keine neuen Packages nötig:**
- bcryptjs: Bereits installiert
- Drizzle ORM: Bereits installiert
- Pinia: Bereits installiert

---

## 12. Checklist für Implementierung

- [x] Backend: login.post.ts erweitern (mitarbeiter erlauben)
- [x] Backend: location-Feld zu users Tabelle hinzufügen
- [x] Backend: Seed-Daten für 5 Personas erstellen
- [x] Frontend: login.vue mit Persona-Auswahl erweitern
- [x] Frontend: dashboard.vue mit User-Info erweitern
- [x] Frontend: Auth Store mit isMitarbeiterGetter erweitern
- [x] Test: Login als Demo-User
- [x] Test: Logout und zurück zur Login-Seite

---

## QA Test Results

**Getestet:** 2026-02-27
**App URL:** http://localhost:3000
**Tester:** QA Engineer

### Acceptance Criteria Status

| AC | Status | Notes |
|----|--------|-------|
| AC-1: Login-Formular mit Email und Passwort | ✅ | |
| AC-2: Nur @demo.de Domains erlaubt | ✅ | Domain-Validierung implementiert |
| AC-3: Falsches Passwort zeigt Fehlermeldung | ✅ | "Ungültige Anmeldedaten" |
| AC-4: Nach Login: Weiterleitung zur Startseite | ✅ | |
| AC-5: Eingeloggter User wird im Header angezeigt | ✅ | |
| AC-6: Logout-Funktion vorhanden | ✅ | |
| AC-7: Nach Abmeldung: Zurück zur Login-Seite | ✅ | |

### Edge Cases Status

| EC | Status | Notes |
|----|--------|-------|
| EC-1: Falsches Passwort | ✅ | "Ungültige Anmeldedaten" |
| EC-2: Andere Domain als @demo.de | ✅ | "Nur demo.de Emails erlaubt" |
| EC-3: User nicht vorhanden | ✅ | "Ungültige Anmeldedaten" |
| EC-4: Session abgelaufen | ✅ | User wird ausgeloggt |
| EC-5: Admin als mitarbeiter | ✅ | Funktioniert |

### Security

- ✅ Input Validation funktioniert
- ✅ Auth-Checks korrekt (Rolle wird geprüft)
- ✅ Rate Limiting aktiv (5 Versuche/15min)
- ✅ Domain-Validierung implementiert

### Regression

- ✅ FEAT-1 (Admin Auth) funktioniert noch
- ✅ Login/Logout funktioniert für alle Rollen

---

## ✅ Production Ready

**Empfehlung UX Expert:** ❌ Nicht nötig

**Begründung:** Alle Acceptance Criteria erfüllt, alle Bugs behoben, Security und Regression Tests bestanden.
