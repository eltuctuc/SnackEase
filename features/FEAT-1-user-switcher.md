# FEAT-1: User Switcher (Demo-Modus)

## Status: 🔵 Planned

## Abhängigkeiten
- Keine direkten Abhängigkeiten

**Beschreibung:** Ermöglicht das Umschalten zwischen verschiedenen Demo-Nutzern, um die App-Funktionalität zu demonstrieren.

**Ziel:** Keine echte Registrierung - schneller Wechsel zwischen vordefinierten Demo-Profilen.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Demo-Admin möchte ich zwischen Nutzern wechseln, um verschiedene Szenarien zu testen | Must-Have |
| US-2 | Als Demo-Admin möchte ich sehen welcher Nutzer aktuell aktiv ist | Must-Have |
| US-3 | Als Demo-Admin möchte ich schnell zwischen Nutzern mit unterschiedlichen Guthaben-Ständen wechseln | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Dropdown oder Modal zum Auswählen des aktiven Demo-Nutzers | Must-Have |
| REQ-2 | Anzeige des aktuellen Nutzers (Name, Avatar, Standort) | Must-Have |
| REQ-3 | Persistenz des gewählten Nutzers im Session Storage | Must-Have |
| REQ-4 | Mindestens 5 vordefinierte Demo-Nutzer mit unterschiedlichen Profilen | Must-Have |

## 4. Demo-Nutzer Profile

| Name | Standort | Startguthaben | Rolle |
|------|----------|---------------|-------|
| Nina Neuanfang | Nürnberg | 25€ | Junior-Anwältin, Neuling |
| Maxine Snackliebhaber | Berlin | 15€ | Rechtsanwältin, Vielkäuferin |
| Lucas Gesundheitsfan | Nürnberg | 30€ | Paralegal, Vegetarisch |
| Alex Gelegenheitskäufer | Berlin | 20€ | Büro-Manager, Casual |
| Tom Schnellkäufer | Nürnberg | 10€ | Rechtsanwalt, Minimalist |

## 5. Acceptance Criteria

- [ ] User Switcher ist in der App sichtbar (z.B. in Header oder Profilbereich)
- [ ] Alle 5 Demo-Nutzer sind auswählbar
- [ ] Nach Auswahl wechselt die App zum gewählten Nutzerkontext
- [ ] Guthaben, Kaufhistorie und Leaderboard-Rang beziehen sich auf den gewählten Nutzer
- [ ] Beim Neuladen der Seite bleibt der gewählte Nutzer erhalten (Session Storage)

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
