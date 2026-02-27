# FEAT-3: User Switcher (Login Flow)

## Status: 🔵 Planned

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

- [ ] User kann sich abmelden (Logout)
- [ ] Nach Logout: Zurück zur Login-Seite
- [ ] Login-Seite zeigt Persona-Auswahl (5 Personas + Admin)
- [ ] User kann sich als anderer Demo-User anmelden
- [ ] User kann sich als Admin anmelden
- [ ] Guthaben, Käufe sind user-spezifisch (bei FEAT-4/7)

## 6. UI/UX Vorgaben

- Login-Seite mit Persona-Karten (Bild/Icon, Name, Standort)
- Aktuell ausgewählter User hervorgehoben
- "Als Admin anmelden" als separate Option
- Password-Feld für alle (einheitlich: demo123)

## 7. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **users-Tabelle:** Bereits existiert (FEAT-1, FEAT-2)
- **Session:** Cookie-basiert (useCookie, wie FEAT-1/2)
- **Keine Supabase Auth** - eigenes Cookie-System
- **location-Feld:** In users-Tabelle für Standort-Anzeige

## 8. Persona-Auswahl UI

### Option A: Kartenansicht
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Nina      │ │   Maxine    │ │   Lucas     │
│  Nürnberg   │ │   Berlin    │ │   Nürnberg  │
│   25€       │ │   15€       │ │   30€       │
└─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Alex     │ │    Tom      │ │    Admin    │
│   Berlin    │ │   Nürnberg  │ │  (anders)  │
│    20€      │ │    10€      │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Option B: Dropdown + Login-Formular
- Dropdown mit allen Personas
- Nach Auswahl: Email + Passwort

## 9. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Cookie deaktiviert | Fallback: Error-Message |
| EC-2 | Ungültige User-ID | Zurück zur Login-Seite |
| EC-3 | Alle Demo-Nutzer gelöscht | Mindestens Default behalten |
| EC-4 | Passwort vergessen (demo123) | Hinweis auf Login-Seite |

---

## 10. Implementierungs-Details

### 10.1 Login-Seite erweitern

Bestehende `/login.vue` erweitern:
1. Persona-Auswahl oberhalb des Login-Formulars
2. Bei Persona-Auswahl: Email vorab ausfüllen
3. Admin-Option separat

### 10.2 Auth Store

Bestehenden Store nutzen (bereits implementiert in FEAT-1):
- `user.role` unterscheidet admin vs mitarbeiter
- Header zeigt entsprechend an
