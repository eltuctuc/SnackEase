# FEAT-3: User Switcher (Login Flow)

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-1 (Admin Authentication)
- Benötigt: FEAT-2 (Demo User Authentication)

## 1. Overview

**Beschreibung:** Ermöglicht das Umschalten zwischen Demo-Nutzern nach Abmeldung. Der User Switcher ist NICHT in der App sichtbar, sondern Teil des Login-Flows.

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
| REQ-2 | User-Auswahl auf Login-Seite (Dropdown oder Karten) | Must-Have |
| REQ-3 | Nach User-Auswahl: Passwort-Eingabe | Must-Have |
| REQ-4 | Separate Login-Seiten für Admin und Demo-User ODER kombinierte Seite | Must-Have |

## 4. Login-Flow

```
1. User auf Login-Seite
       ↓
2. Auswahl: Admin ODER Demo-User
       ↓
   [Admin] → admin@demo.de + Passwort
       ↓
   [Demo-User] → Andere @demo.de Email + Passwort
       ↓
3. Passwort eingeben
       ↓
4. [Wenn korrekt] → Weiterleitung zur App
       ↓
5. [Logout] → Zurück zu Schritt 1
```

## 5. Acceptance Criteria

- [ ] User kann sich abmelden (Logout)
- [ ] Nach Logout: Zurück zur Login-Seite
- [ ] Login-Seite ermöglicht User-Auswahl
- [ ] User kann sich als anderer Demo-User anmelden
- [ ] User kann sich als Admin anmelden
- [ ] Guthaben, Käufe sind user-spezifisch

## 6. UI/UX Vorgaben

- User Switcher sollte prominent aber nicht dominant platziert sein
- Avatar oder Initialen des aktuellen Nutzers anzeigen
- Bei hover oder click Dropdown mit allen Demo-Nutzern

## 7. Technische Hinweise

- Nutzer-Daten werden in Supabase als `demo_users` Tabelle gespeichert
- Session Storage für aktuellen Nutzer (`current_demo_user_id`)
- Keine echte Authentifizierung erforderlich

## 8. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Session Storage ist deaktiviert | Fallback auf lokalen Storage oder Standard-Nutzer |
| EC-2 | Ungültige User-ID im Storage | Zurücksetzen auf Standard-Nutzer |
| EC-3 | Alle Demo-Nutzer gelöscht | Mindestens einen Default-Nutzer behalten |
