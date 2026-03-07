# FEAT-19: Erweiterte Suche

## Status: Planned

## Abhaengigkeiten
- Benoetigt: FEAT-15 (App-Navigationsstruktur) - /search-Route und Layout muessen existieren
- Benoetigt: FEAT-16 (Warenkorb-System) - "In den Warenkorb"-Button auf Produktkarten
- Benoetigt: FEAT-18 (Empfehlungen & Favoriten) - Favoriten-Icon auf Produktkarten

---

## 1. Uebersicht

**Beschreibung:** Die /search-Seite (bisher leerer Platzhalter aus FEAT-15) erhaelt ihren vollstaendigen Inhalt. Mitarbeiter koennen per Volltext-Echtzeit-Suche (mit Debouncing) alle Produkte durchsuchen und die Ergebnisse mit vier Filtertypen einschraenken: Kategorie, Verfuegbarkeit, Preisbereich und Ernaehrungsform (Vegan / Glutenfrei). Filter werden als horizontal scrollbare Chips/Tags unterhalb des Suchfeldes angezeigt. Suchergebnisse erscheinen als Produktkarten mit "In den Warenkorb"-Button und Favoriten-Icon. Ein Klick auf die Karte oeffnet das bestehende ProductDetailModal. Die Sortierung ist standardmaessig nach Relevanz und kann auf Preis aufsteigend oder Preis absteigend umgestellt werden.

**Ziel:** Mitarbeitern eine schnelle, praezise Produktsuche bieten, die ueber den einfachen Kategorie-Filter des Dashboards hinausgeht.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich auf /search einen Suchbegriff eingeben und sofort passende Produkte sehen, ohne einen Suchbutton druecken zu muessen | Mitarbeiter | Must-Have |
| US-2 | Als Mitarbeiter moechte ich die Suchergebnisse nach Kategorie filtern, damit ich gezielt in einer Produktgruppe suchen kann | Mitarbeiter | Must-Have |
| US-3 | Als Mitarbeiter moechte ich ausschliesslich vorraetigen Produkte anzeigen lassen, damit ich keine Produkte sehe, die gerade nicht erhaeltlich sind | Mitarbeiter | Must-Have |
| US-4 | Als Mitarbeiter moechte ich die Suchergebnisse nach einem Preisbereich einschraenken, damit ich Produkte in meinem Budget finde | Mitarbeiter | Must-Have |
| US-5 | Als Mitarbeiter moechte ich vegane oder glutenfreie Produkte gezielt filtern, damit ich Produkte fuer meine Ernaehrungsform finde | Mitarbeiter | Must-Have |
| US-6 | Als Mitarbeiter moechte ich die Suchergebnisse nach Preis sortieren koennen, damit ich guenstigste oder teurste Produkte schnell finde | Mitarbeiter | Must-Have |
| US-7 | Als Mitarbeiter moechte ich direkt auf einer Produktkarte in den Warenkorb legen koennen, damit ich keine Detailseite oeffnen muss | Mitarbeiter | Must-Have |
| US-8 | Als Mitarbeiter moechte ich ein Produkt in der Suche per Herz-Icon als Favorit markieren, damit ich es schnell wiederfinde | Mitarbeiter | Must-Have |
| US-9 | Als Mitarbeiter moechte ich durch Klick auf eine Produktkarte das ProductDetailModal oeffnen, um alle Produktdetails zu sehen | Mitarbeiter | Must-Have |
| US-10 | Als Mitarbeiter moechte ich alle aktiven Filter auf einen Schlag zuruecksetzen koennen, damit ich mit einer leeren Suche neu starten kann | Mitarbeiter | Must-Have |
| US-11 | Als Mitarbeiter moechte ich sehen, wenn meine Suche und Filter keine Treffer ergeben, damit ich weiss, dass das Produkt nicht existiert | Mitarbeiter | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Suchfeld

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Die Seite /search zeigt oben ein Texteingabefeld als primaeres Suchelement | Must-Have |
| REQ-2 | Die Suche wird automatisch ausgeloest waehrend der Nutzer tippt (Auto-Search), ohne manuellen Suchbutton | Must-Have |
| REQ-3 | Zwischen letztem Tastendruck und Suchanfrage liegt ein Debounce von 300ms (Wiederverwendung des bestehenden useSearch.ts Composables mit autoSearch: true, debounceMs: 300) | Must-Have |
| REQ-4 | Das Suchfeld enthaelt einen Platzhalter-Text, z.B. "Produkte suchen..." | Must-Have |
| REQ-5 | Ist der Suchbegriff nicht leer, erscheint ein "X"-Button im Suchfeld zum Leeren des Suchbegriffs (clearQuery) | Must-Have |
| REQ-6 | Die Suche durchsucht den Produktnamen und die Produktbeschreibung (Volltext, case-insensitive) | Must-Have |
| REQ-7 | Eine leere Suche zeigt alle Produkte (gefiltert nach aktiven Filtern) an | Must-Have |

### 3.2 Filter-Chips

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-8 | Unterhalb des Suchfeldes erscheint eine horizontal scrollbare Chip-Leiste mit allen verfuegbaren Filtern | Must-Have |
| REQ-9 | Die Chip-Leiste ist in Gruppen gegliedert: zuerst Kategorie-Chips, dann Verfuegbarkeits-Chip, dann Preis-Chips, dann Ernaehrungs-Chips | Must-Have |
| REQ-10 | Kategorie-Chips: ein Chip pro Kategorie (Alle, Obst, Protein, Shakes, Schoki, Nuesse, Getraenke); "Alle" ist der Standard und deaktiviert den Kategorie-Filter | Must-Have |
| REQ-11 | Verfuegbarkeits-Chip: ein einzelner Toggle-Chip "Nur vorraetigen" (filtert auf stock > 0) | Must-Have |
| REQ-12 | Preis-Chips: vordefinierte Preisspannen als Chips (genaue Spannengrenzen entscheidet der UX Expert; Beispiel: "bis 1 Euro", "1-2 Euro", "ueber 2 Euro") | Must-Have |
| REQ-13 | Ernaehrungs-Chips: je ein Toggle-Chip fuer "Vegan" (filtert auf isVegan = true) und "Glutenfrei" (filtert auf isGlutenFree = true) | Must-Have |
| REQ-14 | Jeder aktive Filter-Chip ist visuell hervorgehoben (z.B. ausgefuellter Hintergrund statt Outline) | Must-Have |
| REQ-15 | Ein Klick auf einen aktiven Chip deaktiviert diesen Filter wieder | Must-Have |
| REQ-16 | Kategorie-Chips sind mutually exclusive (nur eine Kategorie gleichzeitig aktiv); Klick auf bereits aktiven Kategorie-Chip setzt Filter auf "Alle" zurueck | Must-Have |
| REQ-17 | Verfuegbarkeits-, Preis- und Ernaehrungs-Chips sind unabhaengig voneinander kombinierbar | Must-Have |
| REQ-18 | Mindestens ein Preis-Chip kann gleichzeitig mit Verfuegbarkeits- und Ernaehrungs-Chips aktiv sein | Must-Have |

### 3.3 Suchergebnisse

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-19 | Suchergebnisse werden als Produktkarten angezeigt (gleiche Karten-Komponente wie Dashboard und Produktkatalog) | Must-Have |
| REQ-20 | Jede Produktkarte zeigt: Produktbild, Name, Preis, "In den Warenkorb"-Button (FEAT-16), Favoriten-Icon (FEAT-18) | Must-Have |
| REQ-21 | Ein Klick auf die Produktkarte (nicht auf den Warenkorb-Button oder das Favoriten-Icon) oeffnet das ProductDetailModal.vue | Must-Have |
| REQ-22 | Gibt es keine Suchergebnisse, wird ein leerer Zustand mit Hinweistext angezeigt (z.B. "Kein Produkt gefunden. Versuche einen anderen Suchbegriff oder passe die Filter an.") | Must-Have |
| REQ-23 | Waehrend die Suchanfrage laeuft, wird ein Ladezustand angezeigt (Skeleton-Cards oder Spinner) | Must-Have |
| REQ-24 | Nur Produkte mit isActive = true werden in den Suchergebnissen angezeigt | Must-Have |

### 3.4 Sortierung

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-25 | Oberhalb oder neben der Ergebnisliste gibt es einen Sortierungs-Umschalter mit drei Optionen: "Relevanz", "Preis aufsteigend", "Preis absteigend" | Must-Have |
| REQ-26 | Standard-Sortierung beim Laden der Seite ist "Relevanz" | Must-Have |
| REQ-27 | Bei Sortierung "Relevanz": Produkte, bei denen der Suchbegriff im Namen vorkommt, erscheinen vor Produkten, bei denen er nur in der Beschreibung vorkommt; bei leerer Suche ist die Reihenfolge alphabetisch nach Name | Must-Have |
| REQ-28 | Bei Sortierung "Preis aufsteigend": guenstigstes Produkt zuerst | Must-Have |
| REQ-29 | Bei Sortierung "Preis absteigend": teuerstes Produkt zuerst | Must-Have |
| REQ-30 | Der aktuell aktive Sortierungsmodus ist visuell gekennzeichnet | Must-Have |

### 3.5 Filter zuruecksetzen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-31 | Ist mindestens ein Filter aktiv (ausser "Alle" bei Kategorie), erscheint ein "Filter zuruecksetzen"-Button oder -Link | Must-Have |
| REQ-32 | Ein Klick auf "Filter zuruecksetzen" deaktiviert alle aktiven Filter und setzt die Sortierung auf "Relevanz" zurueck; der Suchbegriff im Textfeld bleibt erhalten | Must-Have |

---

## 4. Datenmodell

Kein neues Datenbankschema erforderlich. Die Suche nutzt die bestehende `products`-Tabelle mit folgenden Feldern:

| Feld | Typ | Verwendung |
|------|-----|------------|
| `name` | text | Volltext-Suche (ILIKE) |
| `description` | text | Volltext-Suche (ILIKE) |
| `category` | text | Kategorie-Filter |
| `price` | text | Preis-Filter und Sortierung (cast zu numeric fuer Vergleich) |
| `stock` | integer | Verfuegbarkeits-Filter (stock > 0) |
| `isVegan` | boolean | Vegan-Filter |
| `isGlutenFree` | boolean | Glutenfrei-Filter |
| `isActive` | boolean | Immer gefiltert (nur isActive = true) |

---

## 5. API-Erweiterung

Der bestehende GET /api/products Endpunkt wird um Query-Parameter erweitert:

| Parameter | Typ | Beschreibung | Beispiel |
|-----------|-----|--------------|---------|
| `q` | string | Suchbegriff (Volltext, ILIKE gegen name + description) | `?q=Apfel` |
| `category` | string | Kategorie-Filter | `?category=Obst` |
| `inStock` | boolean | Nur vorraetigen (stock > 0) | `?inStock=true` |
| `minPrice` | number | Preis ab (inklusiv) | `?minPrice=1.00` |
| `maxPrice` | number | Preis bis (inklusiv) | `?maxPrice=2.00` |
| `isVegan` | boolean | Nur vegane Produkte | `?isVegan=true` |
| `isGlutenFree` | boolean | Nur glutenfreie Produkte | `?isGlutenFree=true` |
| `sortBy` | string | Sortierungsfeld: `relevance`, `price_asc`, `price_desc` | `?sortBy=price_asc` |

Alle Parameter sind optional und koennen kombiniert werden. Fehlende Parameter bedeuten: kein Filter / Standard-Sortierung.

**Response (unveraendert):** Array von Produkt-Objekten (bestehende Produktstruktur).

---

## 6. Acceptance Criteria

- [ ] AC-1: Die Seite /search ist erreichbar und zeigt ein Suchfeld sowie die Filter-Chip-Leiste
- [ ] AC-2: Beim Tippen im Suchfeld werden Ergebnisse nach 300ms Pause automatisch aktualisiert (Debounce)
- [ ] AC-3: Das "X"-Icon im Suchfeld loescht den Suchbegriff und aktualisiert die Ergebnisse sofort
- [ ] AC-4: Kategorie-Chips sind horizontal scrollbar und zeigen alle 7 Kategorien (Alle, Obst, Protein, Shakes, Schoki, Nuesse, Getraenke)
- [ ] AC-5: Nur ein Kategorie-Chip kann gleichzeitig aktiv sein
- [ ] AC-6: Der Verfuegbarkeits-Chip "Nur vorraetigen" filtert korrekt auf stock > 0
- [ ] AC-7: Preis-Chips schraenken die Ergebnisse auf den jeweiligen Preisbereich ein
- [ ] AC-8: "Vegan"-Chip zeigt ausschliesslich Produkte mit isVegan = true
- [ ] AC-9: "Glutenfrei"-Chip zeigt ausschliesslich Produkte mit isGlutenFree = true
- [ ] AC-10: Vegan- und Glutenfrei-Chip koennen gleichzeitig aktiv sein (UND-Verknuepfung)
- [ ] AC-11: Aktive Chips sind visuell von inaktiven Chips unterscheidbar
- [ ] AC-12: "Filter zuruecksetzen"-Button erscheint nur bei mindestens einem aktiven Filter und setzt alle Filter zurueck
- [ ] AC-13: Sortierungs-Umschalter zeigt drei Optionen; aktive Option ist visuell hervorgehoben
- [ ] AC-14: Standard-Sortierung ist "Relevanz" beim Laden der Seite
- [ ] AC-15: Produktkarten zeigen Produktbild, Name, Preis, Warenkorb-Button und Favoriten-Icon
- [ ] AC-16: Klick auf Produktkarte (ausser Warenkorb-Button und Favoriten-Icon) oeffnet ProductDetailModal
- [ ] AC-17: Kein Suchergebnis → leerer Zustand mit erklaerenden Hinweistext
- [ ] AC-18: Waehrend Laden → Ladezustand (Skeleton oder Spinner) sichtbar
- [ ] AC-19: Nur Produkte mit isActive = true erscheinen in den Ergebnissen
- [ ] AC-20: Die Seite ist nur fuer eingeloggte Mitarbeiter zugaenglich (Auth-Guard greift)

---

## 7. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Suchbegriff enthaelt Sonderzeichen (z.B. "&", "%", "_") | Zeichen werden vor dem ILIKE-Query escaped; kein SQL-Fehler, keine Ergebnisse wenn kein Produkt passt |
| EC-2 | Suchbegriff ist nur Leerzeichen | Wird wie eine leere Suche behandelt (trim() vor dem API-Call) |
| EC-3 | Suchbegriff ist sehr lang (>100 Zeichen) | API nimmt nur die ersten 100 Zeichen entgegen (serverseitiges Limit); keine Fehlermeldung fuer den User |
| EC-4 | Kategorie-Filter aktiv + Suchbegriff ergibt keine Treffer | Leerer Zustand mit Hinweis; Nutzer sieht "Filter zuruecksetzen"-Button |
| EC-5 | Preis-Chip aktiv + Verfuegbarkeits-Chip aktiv, aber kein Produkt erfuellt beide Bedingungen | Leerer Zustand — kein Fehler |
| EC-6 | Alle Produkte sind nicht vorraetigen (stock = 0) und "Nur vorraetigen" ist aktiv | Leerer Zustand mit Hinweistext; kein Fehlerzustand |
| EC-7 | Nutzer aktiviert mehrere Filter und wechselt gleichzeitig den Suchbegriff | Alle aktiven Filter bleiben erhalten; Suche wird nach Debounce mit allen kombinierten Parametern ausgefuehrt |
| EC-8 | Produktkarte: Klick auf "In den Warenkorb"-Button oeffnet NICHT das ProductDetailModal | Button-Klick ist isoliert und stoppt Event-Propagation |
| EC-9 | Produktkarte: Klick auf Favoriten-Icon oeffnet NICHT das ProductDetailModal | Icon-Klick ist isoliert und stoppt Event-Propagation |
| EC-10 | Nutzer navigiert via Tab-Bar weg von /search und kehrt zurueck | Such-State (Suchbegriff, aktive Filter, Sortierung) wird nicht persistiert — Seite startet im Initialzustand |
| EC-11 | Produkt wird waehrend aktiver Suche vom Admin deaktiviert (isActive = false) | Naechste Suchanfrage (z.B. nach Filter-Aenderung) liefert das Produkt nicht mehr; kein Echtzeit-Push |
| EC-12 | Preisfeld in DB ist text-Typ — Sortierung nach Preis benoetigt CAST zu numeric | Serverseitiger CAST: ORDER BY CAST(price AS numeric) — kein Fehler bei gueltigen Preisformaten |
| EC-13 | Nutzer ist nicht eingeloggt und ruft /search direkt auf | Bestehender Auth-Guard in auth.global.ts leitet zu /login weiter |

---

## 8. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| NFR-1 | Debounce von 300ms verhindert unnoetige API-Calls bei schnellem Tippen |
| NFR-2 | Suchanfrage-Response < 400ms (serverseitig, bei Standard-Datenmenge) |
| NFR-3 | Die Seite ist vollstaendig responsiv (Mobile First; Chips scrollbar auf kleinen Screens) |
| NFR-4 | Keine doppelte Filter-Logik — ein einziger API-Call mit allen kombinierten Parametern |
| NFR-5 | Icons ausschliesslich aus Teenyicons 1.0 (npm: teenyicons) |

---

## 9. UI-Komponenten

| Komponente | Beschreibung |
|------------|--------------|
| `src/pages/search.vue` | Haupt-Seite /search — ersetzt den FEAT-15-Platzhalter |
| `src/components/search/SearchInput.vue` | Suchfeld mit X-Button (Wiederverwendung useSearch.ts) |
| `src/components/search/FilterChips.vue` | Horizontal scrollbare Chip-Leiste mit allen Filtergruppen |
| `src/components/search/FilterChip.vue` | Einzelner Chip (aktiv/inaktiv, mit Label und optionalem Icon) |
| `src/components/search/SortSelector.vue` | Sortierungs-Umschalter (Relevanz / Preis aufsteigend / Preis absteigend) |
| `src/components/search/SearchResultsGrid.vue` | Grid-Layout fuer Produktkarten inkl. Ladezustand und leerem Zustand |
| `ProductCard.vue` | Bestehende Produktkarte (wird wiederverwendet, kein neuer Code) |
| `ProductDetailModal.vue` | Bestehendes Modal (wird wiederverwendet, kein neuer Code) |

**Wiederverwendete Composables:**
- `src/composables/useSearch.ts` — Query-State + Debouncing (autoSearch: true, debounceMs: 300)

---

## 10. Technische Anforderungen

- Routing: Bestehende /search-Route aus FEAT-15 (keine Aenderung am Router)
- API: GET /api/products wird um optionale Query-Parameter erweitert (serverseitige Filterung, kein clientseitiges Filtern)
- Preisvergleich: Serverseitiger CAST von products.price (text) zu numeric fuer Preis-Filter und Preis-Sortierung
- Volltext-Suche: PostgreSQL ILIKE fuer case-insensitive Suche; kein FTS-Index erforderlich bei erwarteter Produktanzahl
- Auth: /search ist in auth.global.ts als Protected Path eingetragen (bereits aus FEAT-15)
- State: Kein Pinia-Store notwendig — lokaler Komponenten-State auf der search.vue-Seite genuegt
- Icons: Teenyicons 1.0 (npm: teenyicons)

---

## 11. Abgrenzung (Out of Scope fuer FEAT-19)

| Thema | Begruendung |
|-------|-------------|
| Suchhistorie / zuletzt gesucht | Eigenes Feature, erfordert Persistenz |
| Autocomplete / Suggestions | Eigenes Feature, erfordert separaten API-Endpunkt |
| Algolia / externe Suchmaschine | Overkill fuer aktuelle Produktanzahl |
| Admin-seitige Suche | Admins nutzen bestehende Tabellen-Filter in /admin/products |
| Persistenz des Such-States ueber Navigation | Kein Bedarf laut Entscheidung; Seite startet immer im Initialzustand |
