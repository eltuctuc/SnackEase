# BUG-FEAT21-001: Doppelter h1-Heading auf /admin/settings — E2E-Test schlaegt fehl (Strict Mode Violation)

**Feature:** FEAT-21 Admin Einstellungsseite
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-09
**Behoben am:** 2026-03-10
**Status:** Behoben
**App URL:** http://localhost:3000

---

## Beschreibung

Auf der Seite `/admin/settings` existieren zwei `<h1>`-Elemente gleichzeitig im DOM:

1. `AdminHeader.vue` rendert `<h1>Einstellungen</h1>` (Seitentitel im Fixed-Header, `text-lg font-semibold`)
2. `settings.vue` rendert `<h1>Einstellungen</h1>` (Seiten-Header im Content-Bereich, `text-2xl font-bold`)

Zusaetzlich matcht Playwright's `getByRole('heading', { name: 'Einstellungen' })` auch den `<h2>` "Weitere Einstellungen", da der Name "Einstellungen" darin enthalten ist — insgesamt 3 Treffer.

Dies fuehrt zu zwei Problemen:

1. **E2E-Test schlaegt fehl:** Playwright's Strict Mode erlaubt keinen nicht-eindeutigen Selektor. Der Test `AC-1: /admin/settings ist erreichbar und zeigt vollstaendigen Inhalt` schlaegt mit "strict mode violation" fehl.
2. **Accessibility-Verstos (WCAG 2.1 1.3.1):** Mehrere `<h1>` auf einer Seite verletzen die Dokumentstruktur. Eine HTML-Seite sollte nur einen `<h1>` als primaere Uberschrift haben.

Das Problem existiert auf allen Admin-Seiten, da `AdminHeader.vue` immer einen `<h1>` mit dem Seitentitel rendert.

## Steps to Reproduce

1. Als Admin einloggen (admin@demo.de / admin123)
2. `/admin/settings` aufrufen
3. Im Browser-DevTools: `document.querySelectorAll('h1')` ausfuehren
4. Ergebnis: 2 `<h1>`-Elemente sichtbar

Oder alternativ:

1. E2E-Test ausfuehren: `npx playwright test tests/e2e/admin-settings.spec.ts --reporter=line`
2. Test "AC-1" schlaegt fehl mit:

```
Error: strict mode violation: getByRole('heading', { name: 'Einstellungen' }) resolved to 3 elements:
    1) <h1 class="text-lg font-semibold text-foreground">Einstellungen</h1>  (AdminHeader)
    2) <h1 class="text-2xl font-bold text-foreground">Einstellungen</h1>    (settings.vue)
    3) <h2 class="text-sm font-semibold ...">Weitere Einstellungen</h2>      (Abschnitt-Header)
```

## Expected Behavior

- Nur ein `<h1>` pro Seite im DOM
- E2E-Test erkennt eindeutig den Seiten-Content-Header und besteht
- WCAG 2.1 Konformitaet bzgl. Dokumentstruktur

## Actual Behavior

- Zwei `<h1>`-Elemente gleichzeitig im DOM (AdminHeader + settings.vue Content)
- E2E-Test schlaegt fehl wegen Strict Mode Violation
- Semantische Accessibility-Verletzung

## Loesungsoptionen

**Option A (Bevorzugt): AdminHeader.vue verwendet `<p>` oder `<span>` statt `<h1>`**
- Der Seitentitel im Fixed-Header ist visuell ein Header, semantisch aber kein Dokument-Haupttitel
- Wechsel zu `<p class="... font-semibold">` oder `<span role="presentation">` loest das Problem projektübergreifend

**Option B: E2E-Test-Selektor praezisieren**
- Statt `getByRole('heading', { name: 'Einstellungen' })` verwenden: `page.locator('.max-w-2xl h1')` oder `page.locator('h1').nth(1)`
- Loest nur das Test-Problem, nicht das Accessibility-Problem

**Option C: settings.vue verwendet `<h2>` statt `<h1>` fuer den Content-Header**
- Semantisch korrekt wenn AdminHeader den primaeren `<h1>` setzt
- Erfordert konsistente Anpassung aller Admin-Seiten

## Environment

- Browser: Chromium (Playwright)
- Device: Desktop
- OS: macOS 25.3.0

---

## Abhaengigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-15: AdminHeader.vue wurde in FEAT-15 implementiert — das doppelte-h1-Pattern ist dort entstanden

---

## Attachments

- Screenshot: `test-results/admin-settings-FEAT-21-Adm-28a67-zeigt-vollstaendigen-Inhalt-chromium/test-failed-1.png`
- Error-Context: `test-results/admin-settings-FEAT-21-Adm-28a67-zeigt-vollstaendigen-Inhalt-chromium/error-context.md`

---

## Fix-Dokumentation

**Geaenderte Dateien:**
- `src/components/navigation/AdminHeader.vue` — Beide `<h1>`-Elemente (mit und ohne `v-if="!showBackButton"`) wurden zu einem einzigen `<p>` zusammengefasst. Tailwind-Klassen (`text-lg font-semibold text-foreground`) bleiben identisch, sodass das visuelle Aussehen unveraendert ist.
- `tests/e2e/admin-settings.spec.ts` — Test AC-1 verwendet jetzt `{ name: 'Einstellungen', exact: true }` um den Partial-Match auf "Weitere Einstellungen" zu verhindern.

**Entscheidung:** Option A (bevorzugt laut Bug-Report) wurde umgesetzt. Da alle 6 Admin-Seiten (index, settings, notifications, users, products, categories) bereits eigene `<h1>`-Elemente im Content-Bereich haben, ist der Header-Titel nur eine visuelle Navigations-Hilfe ohne semantische Heading-Bedeutung. Das `<p>`-Element mit identischen Klassen stellt WCAG-Konformitaet sicher.

**Test-Ergebnis:** 16/16 Tests bestehen.
