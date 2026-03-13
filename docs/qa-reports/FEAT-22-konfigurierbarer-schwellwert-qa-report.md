# QA Report: FEAT-22 Konfigurierbarer Nachbestellschwellwert

**Feature-ID:** FEAT-22
**Tested:** 2026-03-13
**App URL:** http://localhost:3001
**Status:** NOT Production Ready (2 High-Bugs offen)

---

## Zusammenfassung

FEAT-22 implementiert einen konfigurierbaren Nachbestellschwellwert pro Produkt, der den bisher hartkodiert 3 ablöst. Das Feature wurde vollständig implementiert und ist funktional grösstenteils korrekt. Zwei High-Severity-Bugs wurden identifiziert, die vor dem Produktivgang behoben werden müssen.

---

## Test-Ergebnisse

### Unit-Tests

**Command:** `npm test -- --run`

| Test-Suite | Tests | Passing | Failing |
|------------|-------|---------|---------|
| Alle Test-Suites | 302 | 302 | 0 |
| (davon geskippt) | 21 | — | — |

**Status:** Alle Unit-Tests bestanden

### E2E-Tests

**Command:** `npx playwright test --reporter=list`

| Ergebnis | Anzahl |
|----------|--------|
| Passing | 80 |
| Skipped (bewusst) | 20 |
| Failing | 0 |

**Status:** Alle E2E-Tests bestanden. Die 20 geskippten Tests betreffen Legacy FEAT-7 One-Touch-Kauf (durch FEAT-16 Warenkorb ersetzt).

---

## Acceptance Criteria

| AC | Beschreibung | Status | Notes |
|----|-------------|--------|-------|
| AC-1 | `products`-Tabelle hat `stockThreshold` (integer, default 3) | Bestanden | schema.ts Zeile 68 |
| AC-2 | Alle bestehenden Produkte haben nach Migration `stockThreshold = 3` | Bestanden | 21/21 Produkte geprüft |
| AC-3 | Erstellen-Modal zeigt "Nachbestellschwellwert" vorausgefüllt mit 3 | Bestanden | spinbutton "Nachbestellschwellwert" = "3" |
| AC-4 | Bearbeiten-Modal zeigt gespeicherten `stockThreshold` | FEHLGESCHLAGEN | Zeigt immer 3 — BUG-FEAT22-002 |
| AC-5 | Bestandsverwaltung zeigt `stockThreshold` pro Zeile editierbar | Bestanden | Alle 21 Produkte korrekt |
| AC-6 | Änderung in /admin/inventory wird gespeichert und sofort reflektiert | Bestanden | Erfolgsmeldung + Tabellen-Reload |
| AC-7 | Kaufprozess nutzt `products.stockThreshold` statt hardkodierter 3 | Bestanden | purchases.post.ts Schritt 6 |
| AC-8 | Auffüllen über Schwellwert löscht Low-Stock-Warnung | Bestanden | inventory.patch.ts EC-3-Logik |
| AC-9 | Schwellwert < 1 wird mit Validierungsfehlermeldung abgelehnt | Bestanden | "Schwellwert muss mindestens 1 sein" |
| AC-10 | Icons verwenden ausschliesslich Teenyicons | Bestanden | Nur SVG-Pfade aus Teenyicons in Navigation |

**Ergebnis: 9/10 Acceptance Criteria bestanden**

---

## Edge Cases

| EC | Szenario | Status | Notes |
|----|---------|--------|-------|
| EC-1 | Schwellwert 0 oder negativ | Bestanden | Getestet mit 0 und -5, beide korrekt abgelehnt |
| EC-2 | Schwellwert höher als Bestand | Bestanden | In inventory.patch.ts implementiert |
| EC-3 | Schwellwert niedriger als Bestand (Warnung aktiv) | Bestanden | Status-Wechsel "Leer" → "Niedrig" → "OK" getestet |
| EC-4 | Bestand exakt = Schwellwert (Grenzfall) | Bestanden | stock=3, threshold=3 → Status "Niedrig" (korrekt <=) |
| EC-5 | Concurrent Updates | Bestanden | Last-Write-Wins, kein Locking nötig |
| EC-6 | Dezimalzahl als Schwellwert | Bestanden | Math.floor() in Frontend |

---

## Gefundene Bugs

### BUG-FEAT22-001 — AdminSidebar fehlt "Bestand"-Tab (High / Must Fix)

**Datei:** `/bugs/BUG-FEAT22-001.md`

Die Desktop-Sidebar (`AdminSidebar.vue`) enthält nur 5 Tabs. Der "Bestand"-Tab mit Link zu `/admin/inventory` fehlt. Auf Desktop-Viewports (>= 768px) ist die neue Inventory-Seite nicht über die Navigation erreichbar — nur durch direkte URL-Eingabe.

**Root Cause:** `AdminSidebar.vue` Zeile 7-14 — `tabs`-Array wurde nicht um den Bestand-Eintrag erweitert (nur `AdminTabBar.vue` wurde angepasst).

**Fix:** Analog zu `AdminTabBar.vue` den Bestand-Tab mit `archive`-Icon in `AdminSidebar.vue` eintragen.

---

### BUG-FEAT22-002 — Produkt-Bearbeiten-Modal zeigt stockThreshold immer als 3 (High / Must Fix)

**Datei:** `/bugs/BUG-FEAT22-002.md`

Das Bearbeiten-Modal in `/admin/products` zeigt für "Nachbestellschwellwert" immer 3, unabhängig vom tatsächlich gespeicherten Wert. Öffnet ein Admin das Bearbeiten-Modal und speichert ohne Anpassung, wird der Schwellwert auf 3 zurückgesetzt.

**Root Cause:** `GET /api/admin/products` (`index.get.ts`) enthält kein `stockThreshold: products.stockThreshold` im `.select()`-Block. Die API-Response gibt das Feld nicht zurück — `openEditModal` fällt auf den Fallback `product.stockThreshold ?? 3` zurück.

**Fix:** `stockThreshold: products.stockThreshold` in den `.select()`-Block von `src/server/api/admin/products/index.get.ts` aufnehmen.

---

## Accessibility (WCAG 2.1)

- Farbkontrast > 4.5:1: OK (grüne/gelbe/rote Status-Badges mit angepassten Textfarben)
- Tastatur-Navigation: OK (alle Inputs und Buttons per Tab erreichbar)
- Focus States: OK (`focus:ring-2 focus:ring-primary` auf allen Inputs)
- ARIA-Labels: OK (`aria-label` auf allen Spinbuttons in der Inventory-Tabelle)
- Touch-Targets > 44px: OK (Speichern-Buttons und Inputs ausreichend gross)
- Screen Reader: OK (semantisches HTML, `<table>` mit korrekten `<th>`-Elementen)

---

## Security Audit

- Auth-Guard: `onMounted` mit `authStore.initFromCookie()` + Redirect zu `/login` bei fehlendem User — korrekt
- Role-Guard: Redirect zu `/dashboard` wenn `role !== 'admin'` — korrekt
- Validierung doppelt vorhanden: Frontend (`isNaN`, `< 1`) und Server-API (`createError 400`)
- DB-Zugriff: Nur über Server-API-Routes, nie aus Vue-Komponenten oder Pinia-Stores
- SQL-Injection: Drizzle ORM verhindert Injection durch parametrisierte Queries

---

## Tech Stack & Code Quality

| Check | Status |
|-------|--------|
| Composition API + `<script setup>` | Korrekt |
| Kein `any` in TypeScript | Korrekt |
| Props und Interfaces vollständig getypt | Korrekt |
| Kein direkter DB-Zugriff aus Frontend | Korrekt |
| Drizzle ORM für alle Queries | Korrekt |
| Server Routes mit try/catch + createError | Korrekt |
| Auth-Checks in geschützten Routes | Korrekt |
| Kein localStorage/sessionStorage direkt | Korrekt |
| Map-Reaktivität korrekt gelöst | Korrekt (Reassignment-Pattern) |

### Identifizierte Optimierungspotenziale

1. **N+1 Query nach Save:** `handleSave` in `inventory.vue` ruft nach jedem erfolgreichen Speichern `fetchInventory()` auf (kompletter Reload aller 21 Produkte). Bei grösserem Produktsortiment wäre ein optimistisches Update performanter.
2. **Fallback-Wert in `getEditRow`:** Zeile 96 enthält `threshold: 3` als Hardcode-Fallback. Nach Fix von BUG-FEAT22-002 ist dieser Fallback redundant.

---

## Regression

80 E2E-Tests bestanden (20 bewusst geskippt). Keine bestehenden Features wurden durch FEAT-22 beschädigt.

---

## Entscheidung

**NOT Production Ready**

Die zwei gefundenen High-Bugs (BUG-FEAT22-001 und BUG-FEAT22-002) müssen vor dem Go-Live behoben werden. Beide Bugs betreffen Kernfunktionalität des Features:
- BUG-FEAT22-001: Die neue Inventory-Seite ist auf Desktop nicht erreichbar
- BUG-FEAT22-002: Das Bearbeiten-Modal überschreibt gespeicherte Schwellwerte mit Default 3

**UX-Empfehlung:** Kein weiteres UX-Review nötig nach Bug-Fix. Die UX-Konzeption ist korrekt umgesetzt.
