# SnackEase

Employee Snack Kiosk App zur Motivation von Mitarbeitern an den Standorten Nürnberg und Berlin.

---

## Schnellstart

```bash
# Dependencies installieren
npm install

# Entwicklung starten
npm run dev

# Build für Produktion
npm run build
```

---

## Projekt-Struktur

```
SnackEase/
├── .claude/agents/      # Agenten Definitionen
├── .agents/skills/      # Installierte Skills
├── docs/                # Dokumentation
│   ├── prd.md          # Product Requirements
│   └── test-konzept.md # Test-Konzept
├── features/            # Feature Spezifikationen (FEAT-*.md)
├── resources/           # Design Assets (Wireframes, HiFi, Theme)
├── bugs/                # Bug-Reports
└── src/                # Vue.js Frontend Code
```

---

## Wichtige Dokumente

| Dokument | Beschreibung |
|----------|---------------|
| PROJECT_DEFINITION.md | Projekt-Definition & Workflow |
| docs/prd.md | Product Requirements Document |
| docs/test-konzept.md | Test-Konzept (Testpyramide) |

---

## Tech Stack

- **Frontend:** Vue.js 3 + TypeScript + Vite
- **State:** Pinia
- **Backend:** Supabase
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## Login (Demo)

| Rolle | Email | Passwort |
|-------|-------|----------|
| Admin | admin@demo.de | demo123 |
| Nina | nina@demo.de | demo123 |
| Maxine | maxine@demo.de | demo123 |
| Lucas | lucas@demo.de | demo123 |
| Alex | alex@demo.de | demo123 |
| Tom | tom@demo.de | demo123 |

---

## Development Workflow

1. **Requirements Engineer** → Feature Spec erstellen
2. **UX Expert** → Design prüfen
3. **Solution Architect** → Tech-Design erstellen
4. **Development** → Implementieren
5. **QA Engineer** → Testen
6. **Deployment** → Veröffentlichen

Siehe PROJECT_DEFINITION.md für Details.
