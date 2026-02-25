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
│       ├── requirements-engineer.md
│       ├── ux-expert.md
│       ├── solution-architect.md
│       └── qa-engineer.md
├── .agents/
│   └── skills/                      # Installierte Skills
├── docs/
│   ├── PRD.md                       # Product Requirements Document
│   ├── personas/                    # Persona-Details
│   ├── requirements/                # Funktionale Anforderungen
│   ├── user-flows/                  # Dokumentierte User Flows
│   └── FEAT-X-feature-name.md       # Feature-Dokumentation (QA)
├── resources/
│   ├── processes/                    # Vorlagen & Hilfsmittel für Feature-Erstellung
│   ├── wireframes/                  # Wireframe-Entwürfe
│   ├── high-fidelity/               # High-Fidelity-Designs
│   ├── snack-ease-theme/            # Design-System (Tailwind, CSS)
│   └── *.png                        # Moodboard, Screenflow
├── features/
│   ├── FEAT-1-user-authentication.md
│   ├── FEAT-1-user-flow.md
│   ├── FEAT-1-wireframes.md
│   └── ...
├── bugs/
│   └── FEAT-1-bugs.md              # QA Bug-Reports
└── src/                             # Frontend Code
```

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
