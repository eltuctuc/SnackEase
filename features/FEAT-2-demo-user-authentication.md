# FEAT-2: Demo User Authentication

## Status: 🔵 Planned

## Abhängigkeiten
- Keine direkten Abhängigkeiten

## 1. Overview

**Beschreibung:** Ermöglicht Demo-Nutzern (Personas) sich am System anzumelden und abzumelden.

**Ziel:** Realistische Anmeldung mit Email/Passwort für verschiedene Personas.

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
| REQ-5 | Session-Persistenz | Must-Have |
| REQ-6 | Nach Abmeldung: Zurück zur Login-Seite mit User-Auswahl | Must-Have |

## 4. Demo-Nutzer (Personas)

| Persona | Email | Standort | Startguthaben | Rolle |
|---------|-------|----------|---------------|-------|
| Nina Neuanfang | nina@demo.de | Nürnberg | 25€ | Junior-Anwältin, Neuling |
| Maxine Snackliebhaber | maxine@demo.de | Berlin | 15€ | Rechtsanwältin, Vielkäuferin |
| Lucas Gesundheitsfan | lucas@demo.de | Nürnberg | 30€ | Paralegal, Vegetarisch |
| Alex Gelegenheitskäufer | alex@demo.de | Berlin | 20€ | Büro-Manager, Casual |
| Tom Schnellkäufer | tom@demo.de | Nürnberg | 10€ | Rechtsanwalt, Minimalist |

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
- Login-Maske zeigt alle verfügbaren Demo-Nutzer (optional als Vorschlag)
- Logout im Header mit User-Namen

## 7. Technische Hinweise

- Supabase Auth für Session-Management
- Session Storage für Persistenz
- Nutzer-Rolle: mitarbeiter

## 8. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Falsches Passwort | "Ungültige Anmeldedaten" Fehlermeldung |
| EC-2 | Andere Domain als @demo.de | "Nur demo.de Emails erlaubt" |
| EC-3 | User nicht vorhanden | "Account nicht gefunden" |
| EC-4 | Session abgelangen | Automatisch ausloggen |
