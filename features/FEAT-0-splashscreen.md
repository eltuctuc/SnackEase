# FEAT-0: Splashscreen mit Preloading

## Status: 🔵 Planned

## Abhängigkeiten
- Keine direkten Abhängigkeiten (erstes Feature beim App-Start)

## 1. Overview

**Beschreibung:** Begrüßungsbildschirm beim Start der App mit Logo und Ladeanimation. Lädt alle Programmdaten (Styles, Komponenten, Layouts) vor, damit die App danach flüssig läuft.

**Ziel:** 
- Professioneller erster Eindruck beim App-Start
- Alle Programmdaten vorladen für flüssige Nutzung
- Ähnlich wie bei Computerspielen: längere Ladezeit beim Start, dafür keine Wartezeiten danach

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich beim Öffnen der App einen Begrüßungsbildschirm sehen | Must-Have |
| US-2 | Als Nutzer möchte ich, dass alle Programmdaten vorgeladen werden | Must-Have |
| US-3 | Als Nutzer möchte ich nach dem Login eine flüssige App-Nutzung erleben | Must-Have |
| US-4 | Als Nutzer möchte ich, dass der Splashscreen automatisch zum Login weiterleitet | Must-Have |

## 3. Was wird beim Splashscreen geladen (Programmdaten)

### Zu ladende Ressourcen:
| Ressource | Beschreibung |
|-----------|--------------|
| Styles | Alle Tailwind CSS, Theme-Variablen |
| Komponenten | Vue-Komponenten für alle Screens |
| Layouts | App-Layout, Header, Footer |
| Assets | Icons, Bilder, Fonts |
| Router | Alle Routen vorregistrieren |

### Was NICHT beim Splashscreen geladen wird:
- ❌ User-Daten (Guthaben, Käufe)
- ❌ Leaderboard-Daten
- ❌ Sensible Daten

**Diese werden nach dem Login geladen** (Lazy Loading).

## 4. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | SnackEase Logo auf Splashscreen | Must-Have |
| REQ-2 | Ladeanimation während des Preloadings | Must-Have |
| REQ-3 | Alle Programmdaten vorladen | Must-Have |
| REQ-4 | "Dein Weg zu Gesundheit und Genuss" Slogan | Should-Have |
| REQ-5 | Fortschrittsanzeige (Progress Bar oder Prozent) | Should-Have |
| REQ-6 | Automatische Weiterleitung zum Login nach Ladezeit | Must-Have |

## 5. Timing

| Phase | Dauer |
|-------|-------|
| Splashscreen + Preloading | 2-5 Sekunden (je nach Verbindungsgeschwindigkeit) |
| Weiterleitung | Nach Abschluss des Preloadings |

## 6. Flow

```
App Start
    ↓
Splashscreen + Preloading (Styles, Komponenten, Assets)
    ↓
[Progress Bar zeigt Fortschritt]
    ↓
Alle Programmdaten geladen
    ↓
Weiterleitung zu Login
    ↓
[NACH LOGIN: User-Daten laden]
```

## 7. Acceptance Criteria

- [ ] SnackEase Logo wird angezeigt
- [ ] Ladeanimation / Progress Bar ist sichtbar
- [ ] Alle Programmdaten werden vor dem Login geladen
- [ ] Nach Abschluss: automatischer Übergang zum Login
- [ ] Slogan "Dein Weg zu Gesundheit und Genuss" sichtbar
- [ ] User-Daten werden NICHT vor dem Login geladen

## 8. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Langsames Netzwerk | Splashscreen bleibt bis alle Programmdaten geladen |
| EC-2 | Bereits eingeloggter User | Direkt zum Dashboard (trotzdem Preloading) |
| EC-3 | Preloading fehlgeschlagen | Fehlermeldung + Retry-Option |
| EC-4 | Browser-Cache aktiv | Schnellerer Durchlauf möglich |

---

## Tech-Design (Solution Architect)

### Component-Struktur

```
App
├── SplashscreenView
│   ├── Logo (SnackEase)
│   ├── Slogan
│   └── ProgressBar (Ladefortschritt)
│
└── (Alle anderen Komponenten werden vorgeladen)
    ├── LoginView
    ├── HomeView
    ├── AdminView
    ├── ProductCard
    ├── UserSwitcher
    └── ...
```

### Daten-Model (Programmdaten)

**Was wird gespeichert/vorgeladen:**
- CSS / Tailwind Styles
- Vue Komponenten (alle Views)
- Icons (via Icon-Library)
- Fonts (Mulish)
- Router-Konfiguration

**Wo:** Browser Cache / Memory (keine Datenbank)

### Tech-Entscheidungen

**Warum Preloading beim Splashscreen?**
→ Ähnlich wie bei Computerspielen: Einmal längere Ladezeit beim Start, dafür danach flüssige Navigation ohne Wartezeiten.

**Was wird NICHT vorgeladen (Lazy Loading nach Login):**
- User-spezifische Daten (Guthaben, Käufe)
- Leaderboard (wird bei Anzeige aktualisiert)
- Produktdetails (werden bei Bedarf geladen)

**Vorteile:**
- Schnelle Navigation zwischen Screens nach dem Login
- Keine Ladezeiten bei Klick auf andere Bereiche
- Professionelles "App-Feeling"

### Dependencies

Benötigte Packages:
- Keine neuen Packages nötig
- Nutzt Vite's built-in Code Splitting
- Vue's async components für Lazy Loading

### Implementierungs-Hinweis

**Frontend Developer:** Nutze Vite's `preloadModules` oder lade alle Router-Views mit `defineAsyncComponent` vor.

---

## User Review

> "Passt das Design? Gibt es Fragen?"
