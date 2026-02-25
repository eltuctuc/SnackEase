# FEAT-3: Admin-Basis (Demo-Modus)

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-1 (User Switcher) - für Admin-Rolle
- Benötigt: FEAT-2 (Demo-Guthaben) - für Reset-Funktion

## 1. Overview

**Beschreibung:** Basis-Admin-Funktionen für die Demo: System-Reset und Demo-Nutzer anlegen.

**Ziel:** Ermöglicht dem Demo-Admin das Verwalten des Demo-Systems ohne komplexe Authentifizierung.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin möchte ich alle Demo-Daten zurücksetzen können | Must-Have |
| US-2 | Als Admin möchte ich neue Demo-Nutzer anlegen können | Must-Have |
| US-3 | Als Admin möchte ich Guthaben aller Nutzer zurücksetzen können | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Admin-Bereich nur für dedizierten Admin-Nutzer zugänglich | Must-Have |
| REQ-2 | System-Reset: Alle Käufe, Transaktionen zurücksetzen, Guthaben auf Startwert | Must-Have |
| REQ-3 | Neuen Demo-Nutzer anlegen (Name, Standort, Startguthaben) | Must-Have |
| REQ-4 | Bestätigungsdialog vor Reset | Must-Have |

## 4. Admin-Zugang

**Demo-Admin Account:**
- Username: `admin`
- Passwort: `admin123` (hardcoded für Demo)
- Rolle: `admin`

Der Admin-Zugang unterscheidet sich vom User Switcher - hier kann man tatsächlich administrative Aktionen durchführen.

## 5. Funktionen

### 5.1 System-Reset

**Funktion:** Setzt alle Demo-Daten zurück auf Startzustand.

**Zurücksetzen:**
- Alle Käufe löschen
- Transaktionshistorie löschen
- Guthaben aller Nutzer auf初始-Wert zurücksetzen (25€)
- Leaderboard zurücksetzen

**Nicht zurücksetzen:**
- Produktkatalog
- Admin-Account
- Demo-Nutzer (außer wenn gewünscht)

### 5.2 Demo-Nutzer anlegen

**Felder:**
| Feld | Typ | Pflicht | Standard |
|------|-----|---------|----------|
| Name | Text | Ja | - |
| Standort | Select (Nürnberg/Berlin) | Ja | Nürnberg |
| Startguthaben | Number (0-100) | Nein | 25€ |
| Rolle | Select (Mitarbeiter/Admin) | Nein | Mitarbeiter |

### 5.3 Guthaben-Reset

**Funktion:** Setzt Guthaben aller Nutzer auf Standard (25€) zurück, ohne Käufe zu löschen.

## 6. Acceptance Criteria

- [ ] Admin-Login mit admin/admin123 funktioniert
- [ ] Admin-Bereich nur für eingeloggten Admin sichtbar
- [ ] System-Reset zeigt Bestätigungsdialog
- [ ] Nach Reset sind alle Werte auf Startzustand
- [ ] Neuer Demo-Nutzer kann angelegt werden
- [ ] Guthaben-Reset funktioniert

## 7. UI/UX Vorgaben

- Admin-Bereich über eigenes Icon/Menü im Header erreichbar
- Reset-Funktion mit prominentem "Gefahr"-Hinweis (rot)
- Bestätigungsmodal mit Eingabefeld zur Bestätigung ("RESET" eintippen)

## 8. Technische Hinweise

- Tabelle `users` mit Feld `role` (admin/mitarbeiter)
- Admin-Bereich in separater Route `/admin`
- Reset über SQL-Function in Supabase
- Authentifizierung via Supabase Auth (固定 admin credentials)

## 9. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Admin-Login mit falschem Passwort | Fehlermeldung, max. 5 Versuche |
| EC-2 | Reset während aktiver Kauf | Reset nach Abschluss aller Käufe |
| EC-3 | Neuer Nutzer mit bereits existierendem Namen | Fehlermeldung "Name bereits vergeben" |
| EC-4 | Standort "Online" hinzufügen | Nur Nürnberg/Berlin erlaubt |
| EC-5 | Admin löscht sich selbst | Mindestens ein Admin-Account muss existieren |
