# BUG-TESTING-001: Store-Tests sind Platzhalter - keine echten Tests fur auth/credits Stores

**Feature:** Ubergreifend (Testing-Infrastruktur)
**Severity:** High
**Priority:** Should Fix
**Status:** Offen
**Gefunden am:** 2026-03-04
**App URL:** N/A (Testing)

---

## Beschreibung

Die Store-Test-Dateien fur `auth.ts` und `credits.ts` sind mit `describe.skip` markiert und enthalten nur Platzhalter-Tests mit `expect(true).toBe(true)`. Es gibt keinerlei echte Tests fur die kritischen Stores. Die Test-Analyse-Datei (TEST-ANALYSIS.md) dokumentiert dies bereits, aber der Fix wurde nicht durchgefuhrt.

Die Gesamt-Coverage liegt bei nur **9.9%** - weit unter dem Ziel von 80%.

---

## Betroffene Dateien

- `tests/stores/auth.test.ts` - 7 Tests, alle mit `describe.skip` und Dummy-Asserts
- `tests/stores/credits.test.ts` - 8 Tests, alle mit `describe.skip` und Dummy-Asserts
- `src/stores/auth.ts` - 0% Coverage
- `src/stores/credits.ts` - 0% Coverage
- `src/middleware/auth.global.ts` - 0% Coverage

---

## Test Output

```
npm test -- --run

 Tests  83 passed | 21 skipped (104)

 Test Files  5 passed | 2 skipped (7)
```

Die 2 ubersprungenen Test-Dateien sind auth.test.ts und credits.test.ts.

---

## Coverage Report

```
File               | % Stmts | % Branch | % Funcs | % Lines
src/stores/auth.ts |       0 |        0 |       0 |       0
src/stores/credits |       0 |        0 |       0 |       0
auth.global.ts     |       0 |        0 |       0 |       0
login.post.ts      |       0 |        0 |       0 |       0
All files          |     9.9 |     9.66 |   15.55 |    9.93
```

---

## Expected Behavior

- Store-Tests sind aktiv (kein `describe.skip`)
- Tests prufen tatsachliche Store-Logik (Login, Logout, Balance-Status, etc.)
- Coverage > 80% fur kritische Stores
- Store-Tests verwenden `createPinia()` oder aquivalentes Setup

---

## Actual Behavior

- Auth-Store: 7 Tests, alle skippen (kein Code wird getestet)
- Credits-Store: 8 Tests, alle skippen (kein Code wird getestet)
- Alle Store-Tests haben `expect(true).toBe(true)` als Platzhalter
- TEST-ANALYSIS.md beschreibt Problem (defineStore-Mock fehlt) aber Fix wurde nie umgesetzt

---

## Root Cause

Laut TEST-ANALYSIS.md:
```
ReferenceError: defineStore is not defined
```
`defineStore` von Pinia wird nicht korrekt in der Vitest-Konfiguration bereitgestellt.
Als temporare Losung wurden die Tests mit `describe.skip` deaktiviert statt das Mock-Setup zu fixen.

---

## Environment

- Node.js: (aus package.json)
- Vitest: v4.0.18
- OS: macOS

---

## Abhangigkeiten

### Zu anderen Features
- FEAT-1 (Admin Auth): auth Store nicht getestet
- FEAT-2 (Demo User Auth): auth Store nicht getestet
- FEAT-4 (Guthaben): credits Store nicht getestet
