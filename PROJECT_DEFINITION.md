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

**Agent:** `.claude/agents/developer.md`

**Aufgaben:**
- Backend umsetzen (Neon + Drizzle ORM, Nuxt Server API Routes)
- Frontend umsetzen (Nuxt 3 / Vue.js)
- Feature als "In Progress" → "Implemented" markieren
- Implementation Notes in `features/FEAT-X.md` dokumentieren

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
└── src/                              # Nuxt 3 App
    ├── components/                    # Vue-Komponenten
    ├── pages/                         # Nuxt Seiten (automatisches Routing)
    ├── stores/                        # Pinia State Management
    ├── middleware/                    # Nuxt Middleware (z.B. auth.global.ts)
    ├── server/
    │   ├── api/                       # Nuxt Server API Routes
    │   └── db/                        # Neon Client + Drizzle Schema
    └── assets/                        # CSS, Bilder
```

---

## Technisches Setup

### Architektur: Nuxt 3 Full-Stack mit Server API Routes

**Prinzip:** Daten werden über Nuxt Server API Routes abgefragt. Die DB-Kommunikation findet ausschließlich serverseitig statt (kein direkter DB-Zugriff vom Browser). Nur bei Änderungen werden API-Calls gemacht.

### Verwendete Technologien

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Framework | Nuxt 3 | 3.9+ |
| Frontend | Vue.js (Composition API) | 3.4+ |
| State Management | Pinia + @pinia/nuxt | 2.x |
| Datenbank | Neon (PostgreSQL, serverless) | - |
| ORM | Drizzle ORM | 0.29.x |
| Auth | Custom (bcryptjs + HttpOnly Cookie) | - |
| Styling | Tailwind CSS (@nuxtjs/tailwindcss) | 3.x |
| Deployment | Vercel | - |

### NPM Dependencies

```json
{
  "dependencies": {
    "nuxt": "^3.9.0",
    "vue": "^3.4.0",
    "pinia": "^2.1.7",
    "@pinia/nuxt": "^0.5.1",
    "@neondatabase/serverless": "^0.9.0",
    "drizzle-orm": "^0.29.0",
    "bcryptjs": "^3.0.3"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.10.0",
    "drizzle-kit": "^0.21.0",
    "typescript": "^5.3.0",
    "vue-tsc": "^1.8.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### State Management (Pinia)

- **userStore:** Verwaltet aktuellen Nutzer, User-Switching, Guthaben
- **Daten werden bei Start geladen** und gecached
- **Session Storage** für Persistenz des gewählten Nutzers

### Backend-Kommunikation (Neon + Drizzle ORM)

Nuxt Server API Routes kommunizieren serverseitig mit Neon:
1. Auth-Calls: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
2. Bei Aktionen: Nur bei Datenänderungen (Kauf, Reset, Update)

**DB-Schema:** `src/server/db/schema.ts` (Drizzle ORM)
**DB-Client:** `src/server/db/index.ts` (Neon serverless + Drizzle)

**Keine WebSockets** - keine Echtzeit-Synchronisierung nötig für Demo.

### Admin-System mit Differenziertem Reset

Der Admin kann wählen, welche Daten zurückgesetzt werden:
- [ ] Nur Guthaben
- [ ] Nur Käufe/Historie
- [ ] Nur Leaderboard
- [ ] Alles

### Setup-Schritte

1. `npm install` ausführen
2. `.env.example` nach `.env` kopieren und `DATABASE_URL` (Neon Connection String) eintragen
3. `npm run dev` für lokalen Entwicklungsserver
4. Neon-Datenbank mit Tabellen: `users`, `snacks` (via Drizzle Schema in `src/server/db/schema.ts`)

### Design-System

- Tailwind CSS mit Custom Theme aus `resources/snack-ease-theme/`
- CSS Variables für Farben (Light/Dark Mode)
- Mulish Font via Google Fonts

---

## Technische Anforderungen

| Komponente | Technologie |
|------------|-------------|
| Framework | Nuxt 3 (Full-Stack) |
| Frontend | Vue.js (Composition API + `<script setup>`) |
| Backend | Neon (PostgreSQL, serverless) + Drizzle ORM |
| Server API | Nuxt Server Routes (`src/server/api/`) |
| Auth | Custom (bcryptjs + HttpOnly Cookie) |
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
- **2026-02-27:** Developer Agent erstellt (`.claude/agents/developer.md`) für Phase 4
- **2026-02-27:** Solution Architect Handoff-Befehle korrigiert (frontend-dev.md → developer.md)
- **2026-02-27:** Tech-Stack korrigiert: Supabase → Neon + Drizzle ORM, Vue.js → Nuxt 3
