# Contributing Guide

Dieses Dokument beschreibt die Entwicklungsrichtlinien für **SnackEase**.

---

## Versionierung

Wir verwenden **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

| Änderungstyp | Version | Beispiel | Beschreibung |
|--------------|---------|----------|--------------|
| **Bug Fix** | PATCH | 0.0.1 → 0.0.2 | Fehlerbehebungen ohne neue Funktionen |
| **Feature / User Story** | MINOR | 0.0.2 → 0.1.0 | Neue Funktionen, abwärtskompatibel |
| **Breaking Change** | MAJOR | 0.1.0 → 1.0.0 | Inkompatible API-Änderungen |

### Version aktualisieren

Bei **jedem** Merge in `main` muss die Version aktualisiert werden:

1. `package.json` - Feld `version` anpassen

```bash
# Beispiel: Version in package.json ändern
"version": "0.1.0"
```

---

## Workflow: Feature-Entwicklung

SnackEase verwendet einen 7-Phasen Workflow:

```
1. Requirements Engineer → 2. UX Expert → 3. Solution Architect → 4. Development → 5. QA Engineer → 6. UX Expert (optional) → 7. Deployment
```

### Phasen-Übersicht

| Phase | Agent | Aufgabe |
|-------|-------|---------|
| 1 | Requirements Engineer | Feature-Spec erstellen |
| 2 | UX Expert | User Flows, Wireframes |
| 3 | Solution Architect | Tech-Design |
| 4 | Development | Implementierung |
| 5 | QA Engineer | Testen, Bug-Reports |
| 6 | UX Expert (optional) | UX-Nachprüfung |
| 7 | Deployment | GitHub → Vercel |

---

## Git-Workflow

### Branching-Strategie

| Branch-Typ | Namenskonvention | Beispiel |
|------------|------------------|----------|
| Feature | `feature/FEAT-X-beschreibung` | `feature/FEAT-1-user-auth` |
| Bug Fix | `bugfix/FEAT-X-beschreibung` | `bugfix/FEAT-1-login-error` |
| Hotfix | `hotfix/beschreibung` | `hotfix/security-patch` |

### Workflow für Features

```bash
# 1. Aktuellen main-Branch holen
git checkout main
git pull origin main

# 2. Neuen Feature-Branch erstellen
git checkout -b feature/FEAT-1-user-auth

# 3. Entwickeln und committen
git add .
git commit -m "feat(FEAT-1): Add user authentication"

# 4. Branch pushen
git push -u origin feature/FEAT-1-user-auth

# 5. Pull Request erstellen (GitHub)
# 6. Code Review
# 7. Merge in main (nach Approval)
```

### Workflow für Bug Fixes

```bash
# 1. Bugfix-Branch erstellen
git checkout main
git pull origin main
git checkout -b bugfix/FEAT-1-fix-login

# 2. Bug fixen und committen
git add .
git commit -m "fix(FEAT-1): Fix login validation error"

# 3. Branch pushen und PR erstellen
git push -u origin bugfix/FEAT-1-fix-login
```

### Nach dem Merge

Nach erfolgreichem Merge in `main`:

1. **Version erhöhen** (siehe Versionierung oben)
2. **Lokalen Branch löschen**: `git branch -d feature/FEAT-1-user-auth`
3. **Remote Branch löschen**: `git push origin --delete feature/FEAT-1-user-auth`

---

## Commit-Konventionen

### Format

```
feat(FEAT-X): Kurze Beschreibung (max. 72 Zeichen)

Optionale ausführliche Beschreibung des Changes.
- Punkt 1
- Punkt 2
```

### Typen

| Typ | Beschreibung |
|-----|--------------|
| `feat` | Neues Feature |
| `fix` | Bug Fix |
| `refactor` | Refactoring |
| `docs` | Dokumentation |
| `style` | Styling-Änderungen |
| `test` | Tests |
| `chore` | Wartung |

### Beispiele

```bash
# Feature
git commit -m "feat(FEAT-1): Add user authentication with email login"

# Bug Fix
git commit -m "fix(FEAT-2): Fix balance not updating after purchase"

# Refactoring
git commit -m "refactor(FEAT-3): Extract product card component"

# Documentation
git commit -m "docs(FEAT-1): Update feature specification"

# QA Bug Fix
git commit -m "fix(FEAT-1): QA - Fix button color contrast"
```

---

## Code-Konventionen

### Vue.js

- **Composition API** mit `<script setup>` bevorzugen
- Komponenten in `src/components/` ablegen
- Composables in `src/composables/` ablegen
- TypeScript verwenden (keine `any`)

### Styling

- **Tailwind CSS** für alle Styles
- Component-spezifische Styles in `<style scoped>`
- Keine inline-Styles (außer dynamische Werte)

### Supabase

- Client in `src/lib/supabase.ts`
- Edge Functions in `supabase/functions/`
- RLS-Policies für Security

### Dateistruktur

```
src/
├── assets/              # Statische Assets
├── components/         # Vue Komponenten
│   ├── ui/            # Basis-Komponenten
│   └── [feature]/     # Feature-spezifische Komponenten
├── composables/        # Vue Composables
├── views/             # Seiten/Views
├── router/            # Vue Router
├── lib/
│   ├── supabase.ts    # Supabase Client
│   └── utils.ts       # Hilfsfunktionen
└── App.vue

supabase/
├── migrations/        # Database Migrations
└── functions/        # Edge Functions

features/              # Feature-Specs (FEAT-X.md)
bugs/                 # Bug-Reports
docs/                 # Feature-Dokumentation
```

---

## Feature-Spezifikationen

Alle Features werden nach dem SnackEase-Workflow dokumentiert:

| Phase | Dokumentation |
|-------|---------------|
| Requirements | `features/FEAT-X.md` |
| UX | `features/FEAT-X-user-flow.md`, `features/FEAT-X-wireframes.*` |
| Architecture | In `features/FEAT-X.md` |
| QA | `./bugs/FEAT-X-bugs.md` (falls Bugs) |
| Feature Docs | `docs/FEAT-X-feature-name.md` |

### Feature-ID Schema

- `FEAT-1` - User Authentication
- `FEAT-2` - Guthaben-System
- `FEAT-3` - Produktkatalog
- usw.

---

## Checkliste vor dem Merge

- [ ] Code kompiliert ohne Fehler (`npm run build`)
- [ ] Linting bestanden (`npm run lint`)
- [ ] TypeScript ohne Fehler (`npm run typecheck`)
- [ ] Tests bestanden (`npm run test`)
- [ ] Version in `package.json` aktualisiert
- [ ] Commit-Messages folgen Konvention
- [ ] Feature-Spec Status aktualisiert (falls zutreffend)
- [ ] QA-Test bestanden (keine Critical/High Bugs)

---

## Fragen?

Bei Fragen zum Workflow oder den Konventionen:
- Siehe `PROJECT_DEFINITION.md` für den vollständigen Workflow
- Siehe `.claude/agents/` für Agenten-Dokumentation
