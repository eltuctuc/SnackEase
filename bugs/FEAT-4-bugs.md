# Bug Report: FEAT-4 Demo-Guthaben

**Tested:** 2026-02-28
**App URL:** http://localhost:3000
**Tester:** QA Engineer + UX Expert

---

## Zusammenfassung

- **Bugs gefunden:** 4
- **Severity:** 1 Critical, 2 High, 1 Medium
- **Hinweis:** Einige Bugs sollen in FEAT-9 (Admin ohne Guthaben) behoben werden
- **Status:** BUG-2, BUG-3 und BUG-4 wurden gefixt

---

## Bugs

### BUG-1: Admin kann Guthaben sehen und aufladen ⚠️ OFFEN
- **Severity:** Critical
- **Priority:** Must Fix (in FEAT-9)
- **Steps to Reproduce:**
  1. Als Admin einloggen (admin@demo.de / admin123)
  2. Dashboard öffnen
  3. Guthaben-Karte ist sichtbar
- **Expected:** Admin sollte KEIN Guthaben sehen
- **Actual:** Admin sieht Guthaben mit Auflade-Buttons
- **Fix in:** FEAT-9 (Admin ohne Guthaben)

---

### BUG-2: Keine Fehlermeldung im UI bei API-Fehlern ✅ FIXED
- **Severity:** High
- **Priority:** Should Fix
- **Fix:** Error State wird jetzt im UI angezeigt
- **Location:** `src/pages/dashboard.vue`
- **Änderungen:**
  - Error Message Box unter Monatspauschale-Button
  - Error Message Box im Modal
  - dismissError Funktion zum Schließen

---

### BUG-3: Debounce unvollständig implementiert ✅ FIXED
- **Severity:** Medium
- **Priority:** Should Fix
- **Fix:** Buttons zeigen jetzt Loading State und sind disabled
- **Location:** `src/pages/dashboard.vue`
- **Änderungen:**
  - "Guthaben aufladen" Button: disabled während isLoading
  - "Monatspauschale" Button: zeigt "Wird geladen..." statt "..."
  - Modal "Jetzt aufladen" Button: disabled während isRecharging

---

### BUG-4: Accessibility WCAG 2.1 nicht konform ✅ FIXED
- **Severity:** High
- **Priority:** Should Fix
- **Fix:** ARIA-Attribute hinzugefügt für Screen Reader Support
- **Location:** `src/pages/dashboard.vue`
- **Änderungen:**
  - Balance-Card: role="status", aria-live="polite"
  - Guthaben-Status: role="img" mit aria-label
  - Buttons: aria-label für alle Action-Buttons
  - Modal: role="dialog", aria-modal="true", aria-labelledby
  - Close-Button: aria-label="Modal schließen"
  - Error-Messages: role="alert" für Screen Reader
  - Option-Buttons: aria-pressed für Auswahl-Status
  - Escape-Key: Schließt Modal mit Tastatur

---

## API Testing Results

| Test | Endpoint | Result |
|------|----------|--------|
| GET Balance | `/api/credits/balance` | ✅ Returns correct balance |
| POST Recharge (25€) | `/api/credits/recharge` | ✅ Increases balance |
| POST Monthly | `/api/credits/monthly` | ✅ Adds 25€ |
| POST Recharge (invalid) | `/api/credits/recharge` | ✅ Returns validation error |
| Build | `npm run build` | ✅ Successful |

---

## Acceptance Criteria

| AC | Status | Notes |
|----|--------|-------|
| AC-1: Guthaben wird auf Startseite angezeigt | ✅ | Funktioniert |
| AC-2: Aufladen-Button öffnet Modal | ✅ | Funktioniert |
| AC-3: Ladeanimation 2-3 Sekunden | ✅ | Funktioniert |
| AC-4: Guthaben erhöht sich | ✅ | Funktioniert |
| AC-5: Guthaben-Abzug bei Kauf | ⚠️ | Nicht implementiert (FEAT-7) |
| AC-6: Negatives Guthaben verhindert Kauf | ⚠️ | Nicht implementiert (FEAT-7) |
| AC-7: Monatspauschale funktioniert | ✅ | Funktioniert |

---

## Edge Cases

| EC | Status | Notes |
|----|--------|-------|
| EC-1: Nicht genug Guthaben | ⚠️ | Nicht implementiert (FEAT-7) |
| EC-2: Guthaben = 0 | ✅ | Button sichtbar |
| EC-3: Mehrfaches Klicken | ✅ | Debounce via disabled |
| EC-4: DB-Fehler | ✅ | Error-Message im UI |

---

## Accessibility Check (WCAG 2.1 AA)

| Prüfpunkt | Status |
|-----------|--------|
| Farbkontrast > 4.5:1 | ✅ |
| Farbcodierung + Text-Label | ✅ |
| Tastatur-Navigation | ✅ |
| Screen Reader Support | ✅ |
| Touch-Targets > 44x44px | ✅ |
| Fokus-Indikator | ✅ |
| Fehlermeldungen verständlich | ✅ |
| Escape-Taste schließt Modal | ✅ |

---

## Security Check

- ✅ Input Validation (Betrag muss 10/25/50 sein)
- ✅ Auth-Checks vorhandel
- ❌ **KEINE Admin-Rollenprüfung** - wird in FEAT-9 behoben

---

## Tech Stack & Code Quality

- ✅ Composition API + `<script setup>` verwendet
- ✅ Kein `any` in TypeScript
- ✅ Kein direkter DB-Zugriff aus Stores/Components
- ✅ Drizzle ORM für alle Queries
- ✅ Server Routes haben Error Handling
- ✅ Error-States in UI implementiert

---

## ✅ Production Ready Entscheidung

**⚠️ Bedingt bereit** - BUG-1 (Critical Security) wird in FEAT-9 behoben

Alle anderen Bugs sind behoben. FEAT-4 ist funktional vollständig und barrierefrei.
