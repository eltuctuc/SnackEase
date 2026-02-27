# FEAT-3: User Switcher (Login Flow)

## Status: 🟢 Implemented

## Abhängigkeiten
- Benötigt: FEAT-1 (Admin Authentication)
- Benötigt: FEAT-2 (Demo User Authentication)

## 1. Overview

**Beschreibung:** Ermöglicht das Umschalten zwischen Demo-Nutzern nach Abmeldung. Der User Switcher ist Teil des Login-Flows - nach Logout kann ein anderer User ausgewählt werden.

**Ziel:** Realistischer User-Wechsel durch Ausloggen und als anderer User wieder Einloggen.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als eingeloggter Nutzer möchte ich mich abmelden können | Must-Have |
| US-2 | Als abgemeldeter Nutzer möchte ich einen anderen Demo-Nutzer auswählen | Must-Have |
| US-3 | Als abgemeldeter Nutzer möchte ich mich als Admin anmelden | Must-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Logout führt zur Login-Seite mit User-Auswahl | Must-Have |
| REQ-2 | User-Auswahl auf Login-Seite (Karten oder Liste) | Must-Have |
| REQ-3 | Nach User-Auswahl: Passwort-Eingabe (demo123 für alle) | Must-Have |
| REQ-4 | Kombinierte Login-Seite für Admin und Demo-User | Must-Have |

## 4. Login-Flow

```
1. User auf Login-Seite
       ↓
2. Auswahl: Admin ODER Demo-User (Persona-Karten)
       ↓
   [Admin] → admin@demo.de + Passwort
       ↓
   [Demo-User] → Persona auswählen + Passwort (demo123)
       ↓
3. [Wenn korrekt] → Weiterleitung zur App
       ↓
4. [Logout] → Zurück zu Schritt 1
```

## 5. Acceptance Criteria

- [x] User kann sich abmelden (Logout)
- [x] Nach Logout: Zurück zur Login-Seite
- [x] Login-Seite zeigt 6 Persona-Karten (5 Personas + Admin)
- [x] Jede Persona-Karte zeigt: Name, Standort, Guthaben
- [x] User kann Persona auswählen und sich anmelden
- [x] Admin-Login funktioniert über Admin-Persona-Karte
- [x] Passwort für alle: demo123

## 6. UI/UX Vorgaben

- Login-Seite mit Persona-Karten (6 Karten: 5 Personas + Admin)
- Guthaben auf jeder Persona-Karte anzeigen
- Aktuell ausgewählter User hervorgehoben
- Password-Feld für alle (einheitlich: demo123)
- Kein separater Admin-Button - Admin als normale Karte

## 7. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **users-Tabelle:** Bereits existiert (FEAT-1, FEAT-2)
- **Session:** Cookie-basiert (useCookie, wie FEAT-1/2)
- **Keine Supabase Auth** - eigenes Cookie-System
- **location-Feld:** In users-Tabelle für Standort-Anzeige

## 8. Persona-Auswahl UI

### Option A: Kartenansicht (RECOMMENDED)
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Nina      │ │   Maxine    │ │   Lucas     │
│  Nürnberg   │ │   Berlin    │ │   Nürnberg  │
│   25€       │ │   15€       │ │   30€       │
└─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Alex     │ │    Tom      │ │    Admin     │
│   Berlin    │ │   Nürnberg  │ │  Nürnberg   │
│    20€      │ │    10€      │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```
- Admin wird als normale Persona-Karte angezeigt
- Guthaben wird auf jeder Karte angezeigt

## 9. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Cookie deaktiviert | Fallback: Error-Message |
| EC-2 | Ungültige User-ID | Zurück zur Login-Seite |
| EC-3 | Alle Demo-Nutzer gelöscht | Mindestens Default behalten |
| EC-4 | Passwort vergessen (demo123) | Hinweis auf Login-Seite |

---

## 11. UX Design

### Personas-Abdeckung

| Persona | Nutzen | Status |
|---------|--------|--------|
| Nina (Neuanfang) | ✓ Guthaben sofort sichtbar | ✅ |
| Maxine (Stammkunde) | ✓ Schneller User-Wechsel | ✅ |
| Lucas (Gesundheitsfan) | ✓ Guthaben-Übersicht | ✅ |
| Tom (Schnellkäufer) | ✓ One-Click Persona-Auswahl | ✅ |
| Alex (Gelegenheitskäufer) | ✓ Einfache Karten-Oberfläche | ✅ |

### User Flow

```
1. User ist eingeloggt
2. User klickt "Abmelden" (Logout)
3. System löscht Session-Cookie
4. User sieht Login-Seite mit 6 Persona-Karten
5. User wählt Persona-Karte (klick/tap)
6. Persona ist markiert (hervorgehoben)
7. Passwort-Feld ist fokussiert
8. User gibt "demo123" ein
9. User klickt "Anmelden"
10. System validiert Credentials
11. Bei Erfolg: Weiterleitung zur App
```

**Alternativer Flow (Admin):**
- Admin-Karte auswählen → admin@demo.de + demo123 → Dashboard

### Accessibility (WCAG 2.1 AA)

- ✅ Farbkontrast > 4.5:1 (Cards: Text auf Hintergrund)
- ✅ Tastatur-Navigation: Tab-Reihenfolge logisch
- ✅ Screen Reader: Alt-Texte für Persona-Bilder, ARIA-Labels
- ✅ Touch-Targets: Mindestens 44x44px
- ✅ Fokus-Indikator: Hervorhebung bei Auswahl
- ✅ Fehlermeldungen: Klar und verständlich

### UX Empfehlungen

1. **Persona-Karten:** Visuell unterscheidbar (verschiedene Avatare/Icons)
2. **Guthaben-Anzeige:** Prominent, gut lesbar
3. **Auswahl-Zustand:** Deutliche Hervorhebung (Border, Shadow, Farbe)
4. **Passwort-Feld:** Auto-Fokus nach Persona-Auswahl
5. **Ladezeit:** Persona-Daten aus DB (cached für Performance)
6. **Feedback:** Lade-Spinner bei Login-Versuch

---

## Tech-Design (Solution Architect)

### Bestehende Architektur

**Bereits vorhanden:**
- Login-Seite: `/src/pages/login.vue` (5 Personas + Admin-Button)
- Auth APIs: `login.post.ts`, `me.get.ts`, `logout.post.ts`
- Users-Tabelle: `id, email, name, role, location`
- Auth Store: Pinia Store mit Cookie-basierter Session

### Component-Struktur

```
Login-Seite (/login.vue)
├── "SnackEase" Titel
├── Persona-Auswahl (6 Karten - Grid)
│   ├── Nina (Nürnberg, Guthaben)
│   ├── Maxine (Berlin, Guthaben)
│   ├── Lucas (Nürnberg, Guthaben)
│   ├── Alex (Berlin, Guthaben)
│   ├── Tom (Nürnberg, Guthaben)
│   └── Admin (Nürnberg)
├── Passwort-Eingabe (auto-fokus nach Auswahl)
├── "Anmelden" Button
└── Passwort-Hinweis (demo123)
```

**Änderungen:**
- Admin-Button entfernen → Admin als 6. Persona-Karte
- Guthaben auf jeder Persona-Karte anzeigen
- Passwort-Feld: Auto-Fokus nach Persona-Auswahl

### Daten-Model

**Persona-Daten (aus DB):**
- Email (für Login)
- Name (Anzeige)
- Standort (Anzeige)
- Rolle (admin/mitarbeiter)
- Guthaben (Anzeige)

**Woher?** Aus `users` Tabelle in Neon
- Keine neue Tabelle nötig
- Erweiterung der bestehenden Persona-Abfrage

### Tech-Entscheidungen

**Warum Persona-Karten statt Dropdown?**
→ Bessere UX: Alle Optionen auf einen Blick sichtbar
→ Schnellere Auswahl: Ein Klick statt zwei
→ Guthaben direkt sichtbar

**Warum Admin als Karte?**
→ Konsistenz: Einheitliches UI für alle User-Typen
→ Keine separaten Flows nötig

**Warum kein neues Backend?**
→ Bestehende Auth-APIs reichen aus
→ Persona-Daten bereits in users-Tabelle

### Dependencies

**Keine neuen Packages nötig:**
- Bestehende Tailwind CSS Klassen reichen
- Bestehende Pinia Store wiederverwenden

---

## Handoff an Developer

### 12.1 Login-Seite erweitern

Bestehende `/login.vue` erweitern:
1. Persona-Auswahl (6 Karten) oberhalb des Login-Formulars
2. Admin als 6. Persona-Karte (nicht separater Button)
3. Bei Persona-Auswahl: Email vorab ausfüllen + Passwort-Feld fokussieren
4. Guthaben auf jeder Karte anzeigen

### 12.2 Auth Store

Bestehenden Store nutzen (bereits implementiert in FEAT-1):
- `user.role` unterscheidet admin vs mitarbeiter
- `user.guthaben` für Guthaben-Anzeige auf Karten

---

## Implementation Notes

**Status:** 🟡 In Progress
**Developer:** Developer Agent
**Datum:** 2026-02-27

### Geänderte/Neue Dateien
- `src/pages/login.vue` – Erweitert: 6 Persona-Karten, Guthaben-Anzeige, Admin als Karte, Passwort-Auto-Fokus
- `src/server/seed.ts` – Admin Passwort auf demo123 geändert

### Wichtige Entscheidungen
- Admin als 6. Persona-Karte (statt separater Button) – Konsistentes UI
- Guthaben hardcoded im Frontend – Einfache Lösung für Demo, kann später via DB erweitert werden
- Passwort auto-focus nach Auswahl – UX-Verbesserung für schnellen Login

### Bekannte Einschränkungen
- Guthaben wird im Frontend hardcodiert (25€, 15€, 30€, 20€, 10€, -)
- Für FEAT-4 (Demo Guthaben) muss DB-Schema erweitert werden
