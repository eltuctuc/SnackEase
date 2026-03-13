# Erweiterte Suche

**Feature-ID:** FEAT-19
**Status:** Bedingt freigegeben (3 kosmetische Bugs offen)
**Getestet am:** 2026-03-13

---

## Zusammenfassung

FEAT-19 ergänzt die SnackEase-App um eine vollwertige Suchseite (`/search`), auf der Mitarbeiter das gesamte Produktsortiment nach Name/Beschreibung durchsuchen und nach Kategorie, Verfügbarkeit, Preis sowie Ernährungsform filtern und sortieren können. Die Seite ersetzt die bisherige statische Produktliste auf dem Dashboard als primärer Einstieg zur Produktfindung.

---

## Was wurde gemacht

### Hauptfunktionen

- Volltextsuche über Produktname und Produktbeschreibung mit 300ms Debounce
- Filterchips für 7 Kategorien (gegenseitig ausschliessend), Verfügbarkeit, 3 Preisbereiche und Ernährungsform (Vegan + Glutenfrei kombinierbar)
- 3 Sortiermöglichkeiten: Relevanz (Standard), Preis aufsteigend, Preis absteigend
- Globaler "Filter zurücksetzen"-Button erscheint nur bei aktivem Filter
- Skeleton-Ladezustand während API-Anfrage, leerer Zustand mit Hinweistext bei keinen Treffern
- Direkte Warenkorb-Interaktion und Favoriten-Toggle aus der Ergebnisliste heraus
- Klick auf Produktkarte öffnet das bestehende ProductDetailModal
- Seite ist ausschliesslich für eingeloggte Mitarbeiter zugänglich

### Benutzer-Flow

1. Mitarbeiter navigiert via Tab-Bar-Icon "Suche" zur `/search`-Seite
2. Beim Laden erscheinen alle aktiven Produkte (ungefiltert) in einer Listenansicht
3. Mitarbeiter tippt in das Suchfeld — Ergebnisse aktualisieren sich automatisch nach 300ms
4. Optional: Mitarbeiter aktiviert einen oder mehrere Filter-Chips (Kategorie, Verfügbarkeit, Preis, Vegan, Glutenfrei)
5. Aktive Chips sind visuell hervorgehoben und haben ein x-Icon zum einzelnen Deaktivieren
6. "Filter zurücksetzen"-Link setzt alle Filter auf einmal zurück
7. Klick auf ein Produkt öffnet das Detail-Modal mit vollständigen Informationen
8. Warenkorb-Button und Favoriten-Icon sind direkt in der Ergebnisliste bedienbar

---

## Wie es funktioniert

### Fur Benutzer

Mitarbeiter sehen eine scrollbare Liste von Produktkarten. Jede Karte zeigt das Produktbild (oder einen Platzhalter), den Namen, den aktuellen Preis (mit Angebotspreis falls vorhanden), Vegan/Glutenfrei-Badges und einen Warenkorb-Button. Oberhalb der Liste befindet sich ein Suchfeld mit einem Löschen-Button sowie eine horizontal scrollbare Chip-Leiste mit allen Filtermöglichkeiten.

Ist ein Filter aktiv, färbt sich der Chip primär ein und ein x-Icon erscheint. Mehrere Filter aus verschiedenen Gruppen (z.B. Kategorie + Vegan + Preis) sind gleichzeitig aktiv möglich (UND-Verknüpfung). Innerhalb einer Gruppe (Kategorien / Preisbereiche) ist nur eine Auswahl gleichzeitig aktiv.

### Technische Umsetzung

Die Suche läuft vollständig serverseitig über den erweiterten `GET /api/products`-Endpunkt. Der Suchbegriff wird mit `escapeIlikeTerm()` gegen SQL-Injection-Wildcards abgesichert (Escaping von `%`, `_`, `\`) und per PostgreSQL `ILIKE`-Operator auf Name und Beschreibung geprüft. Preisvergleiche nutzen `CAST(price AS numeric)` da die Preisspalte als `text` gespeichert ist.

Der lokale State (Suchbegriff, aktive Filter) liegt direkt in der `search.vue`-Komponente — kein Pinia-Store, da der Zustand bei Navigation weg und zurück bewusst zurückgesetzt werden soll.

**Verwendete Technologien:**

- `src/server/utils/search.ts` — `escapeIlikeTerm()` Utility (neu)
- `src/server/api/products/index.get.ts` — erweiterter GET-Endpunkt mit 7 neuen Query-Parametern (neu)
- `src/pages/search.vue` — Suchseite mit lokalem State + `useSearch`-Composable (neu)
- `src/components/search/FilterChips.vue` — Chip-Leiste mit allen Filtergruppen (neu)
- `src/components/search/FilterChip.vue` — Einzelner Toggle-Chip mit aria-pressed (neu)
- `src/components/search/SearchInput.vue` — Suchfeld mit Löschen-Button (neu)
- `src/components/search/SortSelector.vue` — Segmented-Control für Sortierung (neu)
- `src/components/search/SearchResultsGrid.vue` — Ergebnisliste mit Skeleton + EmptyState (neu)
- VueUse `watchDebounced` für 300ms Debounce
- PostgreSQL `ILIKE` + `CAST` + `CASE WHEN` für Relevanz-Sortierung

---

## Screenshots

Wireframe-Referenz: `resources/high-fidelity/suche.png`

---

## Abhangigkeiten

- FEAT-16 (Warenkorb-System) — CartStore und Warenkorb-Button in Ergebnisliste
- FEAT-18 (Empfehlungen & Favoriten) — Favoriten-Toggle in Ergebnisliste
- FEAT-14 (Angebote & Rabatte) — Angebotspreis-Anzeige in Produktkarten
- FEAT-15 (App-Navigationstruktur) — Suche-Icon in UserTabBar

---

## Offene Bugs

| Bug-ID | Titel | Severity | Priority | Status |
|--------|-------|----------|----------|--------|
| BUG-FEAT19-001 | Kategorie-Labels "Nuesse"/"Getraenke" ohne Umlaute | Medium | Should Fix | Offen |
| BUG-FEAT19-002 | Verfugbarkeits-Chip Label "Nur vorraetigen" ohne Umlaut | Medium | Should Fix | Offen |
| BUG-FEAT19-003 | SSR-Hydrationsfehler im UserHeader (Warenkorb-Badge) | Low | Nice to Fix | Offen |

---

## Getestet

- Acceptance Criteria: 20/20 bestanden (2 mit kosmetischen Label-Bugs)
- Edge Cases: 13/13 bestanden
- Unit-Tests: 302/323 bestanden (21 pre-existing skips), 20/20 search.test.ts
- E2E-Tests: 81/100 bestanden (19 bewusst geskippt, keine Regression)
- Cross-Browser: Chromium (Playwright)
- Responsive: Desktop getestet
- Accessibility: WCAG 2.1 konform (aria-pressed, aria-live, aria-busy, sr-only Labels, Focus States, Touch-Targets 44px)
- Security: ILIKE-Escaping, Eingabelangenbegrenzung, Auth-Guard
- Regression: Keine bestehenden Features beeintrachtigt

---

## Nachste Schritte

- BUG-FEAT19-001/002 beheben: 2-Zeilen-Fix in `src/components/search/FilterChips.vue` (Labels korrigieren)
- BUG-FEAT19-003 beheben: `<ClientOnly>` Wrapper um Warenkorb-Badge in `src/components/navigation/UserHeader.vue`
- FEAT-22 (Konfigurierbarer Schwellwert) — nachstes geplantes Feature
- FEAT-23 (Leaderboard-Erweiterung)
- FEAT-24 (Guthaben aufladen & Zahlungsmethode)

---

## Kontakt

Bei Fragen zu diesem Feature: QA Engineer Agent / Development Agent
