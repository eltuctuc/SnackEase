# SnackEase - Projektdefinition

## Übersicht

**Projektname:** SnackEase  
**Zweck:** Employee Snack Kiosk App zur Motivation von Mitarbeitern an den Standorten Nürnberg und Berlin  
**Plattform:** Web  
**Scope:** Full-Stack (Frontend + Backend)

**Dokumentation:**
- [docs/PRD.md](docs/PRD.md) - Product Requirements Document
- [docs/](docs/) - Personas, Requirements, User Flows, Feature-Docs
- [resources/](resources/) - Design-Assets, Wireframes, Prozess-Vorlagen

---

## Workflow: Feature-Entwicklung

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│ REQUIREMENT │────▶│ UX-EXPERT  │────▶│ SOLUTION ARCHITECT  │
│     (1)     │     │     (2)    │     │       (3)          │
└─────────────┘     └─────────────┘     └─────────────────────┘
                                                  │
                                                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│  DEPLOYMENT │◀────│ QA-ENGINEER │◀────│    DEVELOPMENT      │
│     (7)     │     │     (5)    │     │       (4)          │
└─────────────┘     └─────────────┘     └─────────────────────┘
                          │
                          ▼ (optional)
                   ┌─────────────┐
                   │ UX-EXPERT   │
                   │     (6)     │
                   └─────────────┘
```

---

## Phase 1: REQUIREMENTS ENGINEER

**Agent:** `.claude/agents/requirements-engineer.md`

**Aufgaben:**
- Feature-Anforderungen erheben
- User Stories erstellen
- Acceptance Criteria definieren
- Edge Cases identifizieren
- **PRD.md aktualisieren** mit neuen Features
- Feature in `features/FEAT-X.md` dokumentieren

**Deliverable:** `features/FEAT-X-feature-name.md`

---

## Phase 2: UX EXPERT

**Agent:** `.claude/agents/ux-expert.md`

**Aufgaben:**
- Personas-Validierung
- User Flows erstellen
- Wireframes entwickeln
- Accessibility-Prüfung (konzeptionell)

**Deliverables:**
- `features/FEAT-X-user-flow.md`
- `features/FEAT-X-wireframes.*`

---

## Phase 3: SOLUTION ARCHITECT

**Agent:** `.claude/agents/solution-architect.md`

**WICHTIG:** Noch KEINE Programmierung!

**Aufgaben:**
- Component-Struktur visualisieren
- Datenmodell beschreiben
- Tech-Entscheidungen begründen
- Dependencies auflisten

**Deliverables:** In `features/FEAT-X.md`

---

## Phase 4: DEVELOPMENT

**Agent:** General Agent / Developer

**Aufgaben:**
- Backend umsetzen (Supabase)
- Frontend umsetzen (Vue.js)
- Feature als "In Progress" markieren

---

## Phase 5: QA ENGINEER

**Agent:** `.claude/agents/qa-engineer.md`

**Aufgaben:**
- Acceptance Criteria testen
- Edge Cases testen
- Cross-Browser / Responsive testen
- Accessibility testen (WCAG 2.1)
- Security Audit
- **Bugs dokumentieren:** `./bugs/FEAT-X-bugs.md`
- **Erfolgsfall dokumentieren:** in `features/FEAT-X.md`
- **Feature-Dokumentation:** `./docs/FEAT-X-feature-name.md`
- **Empfehlung abgeben:** UX Expert nochmals nötig?

**Deliverables:**
- `./bugs/FEAT-X-bugs.md` (falls Bugs gefunden)
- QA-Section in `features/FEAT-X.md` (nur bei Erfolg)
- `./docs/FEAT-X-feature-name.md` (Feature-Dokumentation)

---

## Phase 6: UX EXPERT (optional)

**Agent:** `.claude/agents/ux-expert.md`

**Wann:** Nur wenn QA Engineer empfiehlt

**Aufgaben:**
- UX-Vorgaben gegen Implementierung prüfen
- Accessibility nachbessern falls nötig

---

## Phase 7: DEPLOYMENT

**Aufgaben:**
- Code zu GitHub pushen
- Vercel Deployment auslösen

---

## Verzeichnis-Struktur

```
SnackEase/
├── .claude/
│   └── agents/
├── .agents/
│   └── skills/
├── docs/
│   ├── PRD.md
│   ├── personas/
│   ├── requirements/
│   ├── user-flows/
│   └── FEAT-X-feature-name.md
├── resources/
│   ├── processes/
│   ├── wireframes/
│   ├── high-fidelity/
│   └── snack-ease-theme/
├── features/
├── bugs/
└── src/                              # Vue.js Frontend
    ├── components/                    # Vue-Komponenten
    ├── views/                         # Seiten (Home, Admin)
    ├── stores/                       # Pinia State Management
    ├── lib/                          # Supabase Client, Typen
    ├── router/                       # Vue Router
    └── assets/                       # CSS, Bilder
```

---

## Technisches Setup

### Architektur: Frontend-lastig mit minimierter Backend-Kommunikation

**Prinzip:** Daten werden einmal geladen und im Frontend gecached. Nur für Persistierung (Speichern) wird Supabase verwendet.

### Verwendete Technologien

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Frontend Framework | Vue.js | 3.4+ |
| Build Tool | Vite | 5.x |
| State Management | Pinia | 2.x |
| Routing | Vue Router | 4.x |
| Backend | Supabase | 2.x |
| Styling | Tailwind CSS | 3.x |
| Deployment | Vercel | - |

### NPM Dependencies

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "~5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^2.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "tailwindcss-animate": "^1.0.0"
  }
}
```

### State Management (Pinia)

- **userStore:** Verwaltet aktuellen Nutzer, User-Switching, Guthaben
- **Daten werden bei Start geladen** und gecached
- **Session Storage** für Persistenz des gewählten Nutzers

### Backend-Kommunikation (Supabase)

Minimale API-Calls:
1. Beim Start: Alle Daten laden (Users, Products, Purchases)
2. Bei Aktion: Nur bei Änderungen (Kauf, Reset, Update)

**Keine WebSockets** - keine Echtzeit-Synchronisierung nötig für Demo.

### Admin-System mit Differenziertem Reset

Der Admin kann wählen, welche Daten zurückgesetzt werden:
- [ ] Nur Guthaben
- [ ] Nur Käufe/Historie
- [ ] Nur Leaderboard
- [ ] Alles

### Setup-Schritte

1. `npm install` ausführen
2. `.env.example` nach `.env` kopieren und Supabase-URL/Key eintragen
3. `npm run dev` für lokalen Entwicklungsserver
4. Supabase-Datenbank mit Tabellen: `users`, `products`, `purchases`

### Design-System

- Tailwind CSS mit Custom Theme aus `resources/snack-ease-theme/`
- CSS Variables für Farben (Light/Dark Mode)
- Mulish Font via Google Fonts

---

## Technische Anforderungen

| Komponente | Technologie |
|------------|-------------|
| Frontend | Vue.js (Composition API) |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | E-Mail/Passwort (Supabase Auth) |
| Deployment | Vercel |

---

## Phasen Status

| Phase | Beschreibung | Status |
|-------|--------------|--------|
| 1. Requirements | Feature-Specs erstellen | ⏳ Offen |
| 2. UX Expert | User Flows, Wireframes | ⏳ Offen |
| 3. Solution Architect | Tech-Design | ⏳ Offen |
| 4. Development | Implementierung | ⏳ Offen |
| 5. QA Engineer | Testen, Bug-Reports | ⏳ Offen |
| 6. UX Expert (optional) | UX-Nachprüfung | ⏳ Offen |
| 7. Deployment | GitHub → Vercel | ⏳ Offen |

---

## Änderungshistorie

- **2026-02-24:** Projektdefinition erstellt mit 7-Phasen Workflow
- **2026-02-24:** Agenten definiert und Bugs-Ordner angelegt
- **2026-02-25:** Ordner umbenannt: `ressources/` → `resources/` (englisch)
- **2026-02-25:** Ordner umbenannt: `abläufe/` → `processes/` (englisch)
- **2026-02-25:** Verzeichnis-Struktur in Projektdefinition dokumentiert
- **2026-02-25:** Technisches Setup: Vue.js + Pinia + Supabase + Vite
- **2026-02-25:** FEAT-3 aktualisiert: Differenziertes Reset-System
- **2026-02-25:** Frontend-lastige Architektur dokumentiert (minimale Backend-Calls)
