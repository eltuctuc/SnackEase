# FEAT-1: Admin Authentication

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-0 (Splashscreen) - erster Screen beim App-Start

## 1. Overview

**Beschreibung:** Ermöglicht dem Admin, sich am System anzumelden und abzumelden.

**Ziel:** Sichere Admin-Anmeldung mit Email/Passwort für den Admin-Bereich.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin möchte ich mich mit Email und Passwort anmelden | Must-Have |
| US-2 | Als Admin möchte ich nach der Arbeit mich wieder abmelden | Must-Have |
| US-3 | Als Admin möchte ich sehen, ob ich eingeloggt bin | Must-Have |
| US-4 | Als Admin möchte ich bei falschem Passwort eine Fehlermeldung sehen | Must-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Login-Formular mit Email und Passwort | Must-Have |
| REQ-2 | Anmeldung nur für admin@demo.de | Must-Have |
| REQ-3 | Passwort: admin123 | Must-Have |
| REQ-4 | Logout-Funktion | Must-Have |
| REQ-5 | Session-Persistenz (eingeloggt bleiben nach Reload) | Must-Have |
| REQ-6 | Fehlermeldung bei falschen Credentials | Must-Have |

## 4. Login-Daten

| Rolle | Email | Passwort |
|-------|-------|----------|
| Admin | admin@demo.de | demo123 |

## 5. Acceptance Criteria

- [ ] Login-Formular mit Email und Passwort Feldern
- [ ] Nur admin@demo.de kann sich als Admin anmelden
- [ ] Falsches Passwort zeigt Fehlermeldung
- [ ] Nach erfolgreichem Login: Weiterleitung zum Admin-Dashboard
- [ ] Logout-Button sichtbar wenn eingeloggt
- [ ] Nach Logout: Zurück zur Login-Seite

## 6. UI/UX Vorgaben

- Login-Seite mit SnackEase Branding
- Email-Feld mit @demo.de Domain-Hinweis
- "Anmelden" Button prominent
- "Abmelden" im Header wenn eingeloggt

## 7. Technische Hinweise

- Supabase Auth für Session-Management
- Session Storage für Persistenz
- Admin-Rolle in users-Tabelle

## 8. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Falsches Passwort | "Ungültige Anmeldedaten" Fehlermeldung |
| EC-2 | Andere Email als admin@demo.de | "Zugriff verweigert" - nur Admin erlaubt |
| EC-3 | Session abgelaufen | Automatisch ausloggen |
| EC-4 | Mehrfache falsche Versuche | Max 5 Versuche, dann temporär sperren |
