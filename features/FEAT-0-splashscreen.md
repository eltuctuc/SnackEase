# FEAT-0: Splashscreen

## Status: 🔵 Planned

## Abhängigkeiten
- Keine direkten Abhängigkeiten (erstes Feature beim App-Start)

## 1. Overview

**Beschreibung:** Begrüßungsbildschirm beim Start der App mit Logo und Ladeanimation.

**Ziel:** Professioneller erster Eindruck beim App-Start.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich beim Öffnen der App einen Begrüßungsbildschirm sehen | Should-Have |
| US-2 | Als Nutzer möchte ich, dass der Splashscreen automatisch zum Login weiterleitet | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | SnackEase Logo auf Splashscreen | Must-Have |
| REQ-2 | Ladeanimation (2-3 Sekunden) | Must-Have |
| REQ-3 | Automatische Weiterleitung zum Login nach Ladezeit | Must-Have |
| REQ-4 | "Dein Weg zu Gesundheit und Genuss" Slogan | Should-Have |

## 4. Timing

| Phase | Dauer |
|-------|-------|
| Splashscreen anzeigen | 2-3 Sekunden |
| Automatischer Übergang | Nach Ladezeit |

## 5. Acceptance Criteria

- [ ] SnackEase Logo wird angezeigt
- [ ] Ladeanimation ist sichtbar
- [ ] Nach 2-3 Sekunden automatischer Übergang zum Login
- [ ] Slogan "Dein Weg zu Gesundheit und Genuss" sichtbar

## 6. Flow

```
App Start
    ↓
Splashscreen (2-3s)
    ↓
Weiterleitung zu Login
```

## 7. Technische Hinweise

- Vue Router Guard für automatische Weiterleitung
- Timeout-Funktion für Ladezeit

## 8. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Langsames Netzwerk | Splashscreen bleibt bis Daten geladen |
| EC-2 | Bereits eingeloggter User | Direkt zum Dashboard |
