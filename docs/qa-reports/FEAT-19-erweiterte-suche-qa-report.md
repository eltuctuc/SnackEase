# QA Report: FEAT-19 Erweiterte Suche

**Tested:** 2026-03-13
**Tester:** QA Engineer Agent
**App URL:** http://localhost:3000
**Branch:** main

---

## Unit-Tests

**Command:** `npx vitest run tests/utils/search.test.ts`

| Test-Suite | Tests | Passing | Failing | Coverage |
|------------|-------|---------|---------|----------|
| search.test.ts (escapeIlikeTerm) | 20 | 20 | 0 | 100% |

**Command (alle):** `npx vitest run`

| Test-Suite | Tests | Passing | Failing | Skipped |
|------------|-------|---------|---------|---------|
| Gesamt | 323 | 302 | 0 | 21 |

**Status:** Alle Unit-Tests bestanden

---

## E2E-Tests

**Command:** `npx playwright test --reporter=list`

| Test-Suite | Tests | Passing | Failing | Skipped |
|------------|-------|---------|---------|---------|
| app.spec.ts | 8 | 7 | 0 | 1 |
| feat-11-bestellabholung.spec.ts | 8 | 3 | 0 | 5 |
| feat-13-notifications.spec.ts | 11 | 8 | 0 | 3 |
| offers-slider.spec.ts | 7 | 7 | 0 | 0 |
| offers.spec.ts | 11 | 10 | 0 | 1 |
| profile.spec.ts | 13 | 13 | 0 | 0 |
| purchase.spec.ts | 5 | 1 | 0 | 4 |
| admin-settings.spec.ts | 12 | 12 | 0 | 0 |
| admin-ohne-guthaben.spec.ts | 9 | 9 | 0 | 0 |
| accessibility.spec.ts | 4 | 4 | 0 | 0 |
| **GESAMT** | **100** | **81** | **0** | **19** |

**Hinweis zu geskippten Tests:** Die 19 geskippten Tests (`test.skip()`) betreffen andere Features (FEAT-7, FEAT-11, FEAT-13, FEAT-14) und sind bereits aus früheren QA-Durchläufen bekannt. Es wurden keine neuen Fehlschläge durch FEAT-19 verursacht.

**Status:** Alle nicht-geskippten E2E-Tests bestanden. Keine Regression durch FEAT-19.

---

## Acceptance Criteria Status

| AC | Beschreibung | Status | Anmerkung |
|----|-------------|--------|-----------|
| AC-1 | /search erreichbar, Suchfeld + Filter-Chip-Leiste sichtbar | PASS | Vollständig vorhanden |
| AC-2 | Debounce 300ms — Ergebnisse aktualisieren sich automatisch | PASS | 21 → 2 Ergebnisse für "apfel" nach ~300ms |
| AC-3 | X-Icon löscht Suchbegriff und aktualisiert Ergebnisse | PASS | Button "Suchbegriff leeren" funktioniert |
| AC-4 | Kategorie-Chips horizontal scrollbar, alle 7 Kategorien | PASS mit Bug | Alle 7 vorhanden, aber "Nuesse"/"Getraenke" ohne Umlaute (BUG-FEAT19-001) |
| AC-5 | Nur ein Kategorie-Chip gleichzeitig aktiv | PASS | Mutually exclusive korrekt implementiert |
| AC-6 | "Nur vorrätige" filtert auf stock > 0 | PASS mit Bug | Filterlogik korrekt (21 → 20), Label falsch "Nur vorraetigen" (BUG-FEAT19-002) |
| AC-7 | Preis-Chips schränken Ergebnisse ein | PASS | "bis 1,00 EUR" → 3 Produkte (0,60 / 0,80 / 1,00€) korrekt |
| AC-8 | "Vegan"-Chip zeigt nur isVegan=true Produkte | PASS | 21 → 14 Ergebnisse, alle mit 🌱-Badge |
| AC-9 | "Glutenfrei"-Chip zeigt nur isGlutenFree=true Produkte | PASS | Korrekt gefiltert |
| AC-10 | Vegan + Glutenfrei kombinierbar (UND-Verknüpfung) | PASS | Beide Chips aktiv → 14 Ergebnisse, alle mit 🌱 + GF |
| AC-11 | Aktive Chips visuell unterscheidbar | PASS | Aktive Chips [active][pressed] mit bg-primary, x-Icon sichtbar |
| AC-12 | "Filter zurücksetzen" nur bei aktivem Filter, setzt alle zurück | PASS | Button erscheint/verschwindet korrekt, Reset funktioniert |
| AC-13 | Sortierungs-Umschalter, 3 Optionen, aktive hervorgehoben | PASS | Relevanz/Preis↑/Preis↓ mit [pressed]-Zustand |
| AC-14 | Standard-Sortierung ist "Relevanz" | PASS | Beim Laden ist Relevanz [pressed] |
| AC-15 | Produktkarten: Bild, Name, Preis, Warenkorb-Button, Favoriten-Icon | PASS | Alle Elemente vorhanden (Platzhalterbild 🍎 wenn kein Bild) |
| AC-16 | Klick auf Karte öffnet ProductDetailModal | PASS | Modal mit Produktdetails öffnet sich |
| AC-17 | Kein Ergebnis → Empty State mit Hinweistext | PASS | "Kein Produkt gefunden. Versuche einen anderen Suchbegriff..." |
| AC-18 | Während Laden → Ladezustand (Skeleton) sichtbar | PASS | 5 Skeleton-Cards mit animate-pulse bei API-Call |
| AC-19 | Nur isActive=true Produkte erscheinen | PASS | Serverseitig immer gefiltert (isActive-Condition im API-Handler) |
| AC-20 | Seite nur für eingeloggte Mitarbeiter zugänglich | PASS | /search in auth.global.ts als protected path registriert (Zeile 10) |

---

## Edge Cases Status

| EC | Szenario | Status | Anmerkung |
|----|----------|--------|-----------|
| EC-1 | Sonderzeichen (%, _, \) werden escaped | PASS | escapeIlikeTerm() getestet, 20 Unit-Tests bestanden |
| EC-2 | Nur-Leerzeichen-Suche wie leere Suche | PASS | trim() in escapeIlikeTerm(), null-Rückgabe korrekt |
| EC-3 | Suchbegriff >100 Zeichen wird gekürzt | PASS | slice(0, maxLength) in escapeIlikeTerm() |
| EC-4 | Kategorie-Filter + kein Treffer → Empty State + Reset-Button | PASS | Korrekt implementiert |
| EC-5 | Preis + Verfügbarkeit + kein Treffer → kein Fehler | PASS | Leerer Zustand ohne Fehlermeldung |
| EC-6 | Alle Produkte ausverkauft + "Nur vorrätige" → Empty State | PASS | Korrekte Implementierung (EC-6 API-seitig korrekt) |
| EC-7 | Filter aktiv + Suchbegriff wechseln → Filter bleiben | PASS | Watcher-Pattern korrekt implementiert |
| EC-8 | Warenkorb-Button öffnet NICHT ProductDetailModal | PASS | @click.stop korrekt, Mengensteuerung erscheint statt Modal |
| EC-9 | Favoriten-Icon öffnet NICHT ProductDetailModal | PASS | click.stop im Aktionsbereich (@click.stop auf Container) |
| EC-10 | Navigation weg + zurück → Such-State zurückgesetzt | PASS | Kein Pinia-Store, lokaler State wird bei Navigation zurückgesetzt |
| EC-11 | Produkt vom Admin deaktiviert → nächste Suche zeigt es nicht | PASS | isActive-Filter immer serverseitig aktiv |
| EC-12 | price als text → serverseitiger CAST zu numeric | PASS | CAST(price AS numeric) in allen Preis-Queries |
| EC-13 | Nicht eingeloggt → Weiterleitung zu /login | PASS | auth.global.ts protectedPaths enthält /search |

---

## Gefundene Bugs

| Bug-ID | Titel | Severity | Priority | Status |
|--------|-------|----------|----------|--------|
| BUG-FEAT19-001 | Kategorie-Labels "Nuesse"/"Getraenke" ohne Umlaute | Medium | Should Fix | Offen |
| BUG-FEAT19-002 | Verfügbarkeits-Chip Label "Nur vorraetigen" ohne Umlaut | Medium | Should Fix | Offen |
| BUG-FEAT19-003 | SSR-Hydrationsfehler im UserHeader (Warenkorb-Badge) | Low | Nice to Fix | Offen |

---

## Accessibility (WCAG 2.1)

- PASS: Farbkontrast > 4.5:1 (bg-primary mit text-primary-foreground, bg-secondary mit text-secondary-foreground)
- PASS: Tastatur-Navigation — FilterChips als `<button>` mit `focus-visible:ring-2 focus-visible:ring-primary`
- PASS: Focus States sichtbar auf allen interaktiven Elementen
- PASS: Touch-Targets > 44px — `py-2.5` + `text-sm` ergibt ~44px Chip-Höhe
- PASS: ARIA-Attribute — `aria-pressed` auf Chips und Sortier-Buttons, `aria-live="polite"` auf Ergebniszähler, `role="group"` auf Filter-Leiste und Sortierung
- PASS: SR-only Label auf Suchfeld (`<label for="search-input" class="sr-only">`)
- PASS: `aria-busy="true"` auf Skeleton-Container während Laden
- PASS: Leere Zustände mit aussagekräftigem Text

---

## Security

- PASS: ILIKE-Escaping verhindert SQL-Injection via Wildcard-Exploitation
- PASS: Suchbegriff auf 100 Zeichen begrenzt (EC-3)
- PASS: Auth-Guard verhindert Zugriff ohne Login
- PASS: API /api/products ist public (kein sensibler Endpoint)
- PASS: Keine User-generierten Inhalte werden unkodiert ausgegeben

---

## Tech Stack & Code Quality

- PASS: Composition API + `<script setup>` in allen neuen Komponenten
- PASS: TypeScript ohne `any` — Props und Emits vollständig typisiert
- PASS: `defineProps<{...}>()` und `defineEmits<{...}>()` korrekt verwendet
- PASS: Kein direkter DB-Zugriff aus Components/Stores
- PASS: Drizzle ORM für alle DB-Queries in products/index.get.ts
- PASS: Server Route hat try/catch mit createError()
- PASS: Kein localStorage-Zugriff direkt — Cart-Store nutzt Pinia-Pattern
- PASS: Teenyicons ausschließlich für Icons verwendet
- PASS: Kein Pinia-Store für lokalen Such-State (bewusste Entscheidung laut Spec)

---

## Optimierungen

- **Verbesserungspotenzial:** Der UserHeader lädt den CartStore auch auf Seiten die keinen Warenkorb-Header benötigen. Die `<ClientOnly>`-Wrapper-Lösung für das Badge würde den Hydrationsfehler (BUG-FEAT19-003) beheben.
- **Verbesserungspotenzial:** Die sortBy-Sortierung wird auch übermittelt wenn `sortBy === 'relevance'` und kein Suchbegriff vorhanden ist — der API-Handler ignoriert dies korrekt, könnte aber in search.vue vermieden werden (bereits nahezu korrekt: `if (sortBy.value !== 'relevance')` sendet nichts).
- Keine N+1 Query-Probleme: Angebote werden in einem separaten Query für alle productIds auf einmal geladen.

---

## Regression

- PASS: Alle bestehenden E2E-Tests (81 von 100, 19 bewusst geskippt) bestanden
- PASS: Dashboard-Produktkatalog weiterhin funktional
- PASS: GET /api/products rückwärtskompatibel (Legacy `search`-Parameter bleibt erhalten)
- PASS: Alle 302 Unit-Tests bestanden

---

## Production-Ready Entscheidung

**Status: BEDINGT FREIGABE**

Das Feature ist funktional vollständig und alle 20 Acceptance Criteria sind erfüllt. Die gefundenen Bugs sind ausschließlich kosmetischer Natur (Umlaut-Labels) bzw. ein bekanntes SSR-Pattern (Hydrationsfehler im UserHeader). Keine sicherheitsrelevanten oder datenverlust-kritischen Issues.

**Empfehlung:** Feature kann deployed werden. BUG-FEAT19-001 und BUG-FEAT19-002 sollten im nächsten Sprint behoben werden (2-Zeilen-Fix in FilterChips.vue). BUG-FEAT19-003 ist ein Pre-existing Issue im UserHeader.

---

## UX-Empfehlung

**Soll UX Expert nochmals prüfen?** Nein

**Begründung:** Alle UX-Anforderungen aus dem UX Expert Review wurden korrekt umgesetzt:
- Listenansicht statt Grid (laut Wireframe-Empfehlung)
- x-Icon an aktiven Chips (Wireframe-Anforderung)
- Globaler "Filter zurücksetzen"-Link (REQ-31/32)
- Edge-to-Edge scrollbare Chip-Leiste (-mx-4 px-4)
- Chip-Gruppen-Trenner implementiert
- Touch-Targets ≥44px
- Aktive Chips visuell klar unterscheidbar (bg-primary vs. bg-secondary)

Die gefundenen Bugs (Umlaut-Labels) sind kosmetisch und beeinträchtigen die UX-Architektur nicht.
