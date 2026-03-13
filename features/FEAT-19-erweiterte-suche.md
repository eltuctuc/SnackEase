# FEAT-19: Erweiterte Suche

## Status: Implemented

## Abhaengigkeiten
- Benoetigt: FEAT-15 (App-Navigationsstruktur) - /search-Route und Layout muessen existieren
- Benoetigt: FEAT-16 (Warenkorb-System) - "In den Warenkorb"-Button auf Produktkarten
- Benoetigt: FEAT-18 (Empfehlungen & Favoriten) - Favoriten-Icon auf Produktkarten

## Wireframes

| Screen | Datei |
|--------|-------|
| Suche (/search) | `resources/high-fidelity/suche.png` |

> Wireframes zeigen Struktur und Informationsarchitektur. Die visuelle Umsetzung richtet sich nach `resources/moodboard.png`, dem Tailwind-Theme und dem UX Expert Review. Fehlt ein Wireframe fuer einen Screen, muss vor der Umsetzung die Informationsarchitektur, das Navigationskonzept und die Darstellung mit dem User geklaert werden.

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

- [x] AC-1: Die Seite /search ist erreichbar und zeigt ein Suchfeld sowie die Filter-Chip-Leiste
- [x] AC-2: Beim Tippen im Suchfeld werden Ergebnisse nach 300ms Pause automatisch aktualisiert (Debounce)
- [x] AC-3: Das "X"-Icon im Suchfeld loescht den Suchbegriff und aktualisiert die Ergebnisse sofort
- [x] AC-4: Kategorie-Chips sind horizontal scrollbar und zeigen alle 7 Kategorien (Alle, Obst, Protein, Shakes, Schoki, Nuesse, Getraenke)
- [x] AC-5: Nur ein Kategorie-Chip kann gleichzeitig aktiv sein
- [x] AC-6: Der Verfuegbarkeits-Chip "Nur vorraetigen" filtert korrekt auf stock > 0
- [x] AC-7: Preis-Chips schraenken die Ergebnisse auf den jeweiligen Preisbereich ein
- [x] AC-8: "Vegan"-Chip zeigt ausschliesslich Produkte mit isVegan = true
- [x] AC-9: "Glutenfrei"-Chip zeigt ausschliesslich Produkte mit isGlutenFree = true
- [x] AC-10: Vegan- und Glutenfrei-Chip koennen gleichzeitig aktiv sein (UND-Verknuepfung)
- [x] AC-11: Aktive Chips sind visuell von inaktiven Chips unterscheidbar
- [x] AC-12: "Filter zuruecksetzen"-Button erscheint nur bei mindestens einem aktiven Filter und setzt alle Filter zurueck
- [x] AC-13: Sortierungs-Umschalter zeigt drei Optionen; aktive Option ist visuell hervorgehoben
- [x] AC-14: Standard-Sortierung ist "Relevanz" beim Laden der Seite
- [x] AC-15: Produktkarten zeigen Produktbild, Name, Preis, Warenkorb-Button und Favoriten-Icon
- [x] AC-16: Klick auf Produktkarte (ausser Warenkorb-Button und Favoriten-Icon) oeffnet ProductDetailModal
- [x] AC-17: Kein Suchergebnis → leerer Zustand mit erklaerenden Hinweistext
- [x] AC-18: Waehrend Laden → Ladezustand (Skeleton oder Spinner) sichtbar
- [x] AC-19: Nur Produkte mit isActive = true erscheinen in den Ergebnissen
- [x] AC-20: Die Seite ist nur fuer eingeloggte Mitarbeiter zugaenglich (Auth-Guard greift)

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

---

## Solution Architect Design

### Bestehende Architektur (gepruefte Grundlage)

Vor dem Design wurden folgende Bestandteile geprueft:

- `src/server/api/products/index.get.ts` — existiert und wird erweitert (kein Neubau)
- `src/composables/useSearch.ts` — existiert bereits mit `autoSearch` + `debounceMs` Unterstuetzung (VueUse `watchDebounced`)
- `src/pages/search.vue` — leerer Platzhalter aus FEAT-15, wird vollstaendig ersetzt
- `src/components/dashboard/ProductGrid.vue` — zeigt Pattern fuer Produktkarten + FavoriteIcon + PurchaseButton
- `src/components/dashboard/ProductDetailModal.vue` — bestehende Modal-Komponente, wird wiederverwendet
- `src/server/db/schema.ts` — `products.price` ist `text`-Typ (wichtig fuer serverseitigen CAST)

---

### Komponenten-Struktur

```
src/pages/search.vue  (Haupt-Seite, ersetzt Platzhalter)
├── SearchInput.vue  (Suchfeld mit X-Button)
├── FilterChips.vue  (horizontal scrollbare Chip-Leiste)
│   ├── FilterChip.vue  (Kategorie "Alle")
│   ├── FilterChip.vue  (Kategorie "Obst", "Protein", "Shakes", ...)
│   ├── FilterChip.vue  (Verfuegbarkeit "Nur vorraetigen")
│   ├── FilterChip.vue  (Preis "bis 1 €", "1–2 €", "ueber 2 €")
│   ├── FilterChip.vue  (Ernaehrung "Vegan")
│   └── FilterChip.vue  (Ernaehrung "Glutenfrei")
├── SortSelector.vue  (Umschalter: Relevanz / Preis auf- / absteigend)
├── SearchResultsGrid.vue  (Produktkarten-Grid + Loading + EmptyState)
│   ├── [ProductGrid-Karte]  (gleicher Kartenaufbau wie dashboard/ProductGrid.vue)
│   │   ├── FavoriteIcon.vue  (FEAT-18, bereits vorhanden)
│   │   └── PurchaseButton.vue  (FEAT-16, bereits vorhanden)
│   └── EmptyState.vue  (shared, bereits vorhanden aus FEAT-18)
└── ProductDetailModal.vue  (FEAT-6/16, bereits vorhanden — wird unveraendert wiederverwendet)
```

Neue Dateien: `search/SearchInput.vue`, `search/FilterChips.vue`, `search/FilterChip.vue`, `search/SortSelector.vue`, `search/SearchResultsGrid.vue`

Wiederverwendet ohne Aenderung: `dashboard/ProductDetailModal.vue`, `recommendations/FavoriteIcon.vue`, `dashboard/PurchaseButton.vue`, `shared/EmptyState.vue`

---

### Daten-Modell

Kein neues Datenbankschema. Die bestehende `products`-Tabelle enthaelt alle benoetigen Felder:

```
Produkt (bereits vorhanden):
- name            Text      → Volltext-Suche (ILIKE)
- description     Text      → Volltext-Suche (ILIKE)
- category        Text      → Kategorie-Filter (exakter Match)
- price           Text      → Preis-Filter + Sortierung (serverseitiger CAST zu numeric)
- stock           Integer   → Verfuegbarkeits-Filter (> 0)
- isVegan         Boolean   → Ernaehrungs-Filter
- isGlutenFree    Boolean   → Ernaehrungs-Filter
- isActive        Boolean   → immer gefiltert (nur true)
```

Besonderheit: `products.price` ist im Schema als `text` definiert (historisch gewachsen). Alle Preisvergleiche und Preissortierungen erfordern daher einen expliziten CAST zu `numeric` in der Datenbankabfrage. Die bestehende API-Logik enthaelt diesen Hinweis bereits als Kommentar (EC-12).

---

### API-Erweiterung: GET /api/products

Der bestehende Endpunkt wird um sechs neue optionale Query-Parameter erweitert. Bestehende Parameter (`category`, `search`) bleiben unveraendert und rueckwaertskompatibel.

**Neue Parameter zusaetzlich zu den bestehenden:**

| Parameter | Woher kommt er | Was bewirkt er serverseitig |
|-----------|---------------|----------------------------|
| `q` | Suchfeld (ersetzt/ergaenzt `search`) | ILIKE gegen `name` UND `description` (OR-Verknuepfung) |
| `inStock` | Verfuegbarkeits-Chip | `stock > 0` |
| `minPrice` | Preis-Chip | `CAST(price AS numeric) >= minPrice` |
| `maxPrice` | Preis-Chip | `CAST(price AS numeric) <= maxPrice` |
| `isVegan` | Vegan-Chip | `isVegan = true` |
| `isGlutenFree` | Glutenfrei-Chip | `isGlutenFree = true` |
| `sortBy` | SortSelector | `ORDER BY`-Klausel (siehe unten) |

Alle Filter werden als AND-Verknuepfung kombiniert — identisch zum bestehenden Muster mit dem `conditions`-Array im Handler.

**Besonderheit beim Suchparameter:** Der neue Parameter heisst `q` (statt `search`) um die Suche ueber `name` UND `description` zu erweitern. Der bestehende `search`-Parameter (nur `name`) bleibt als Legacy fuer andere Aufrufer erhalten.

**ILIKE-Escaping (EC-1):** Vor dem Einbau in die SQL-Abfrage werden die Sonderzeichen `%`, `_` und `\` im Suchbegriff escaped (z.B. `%` → `\%`). Dies verhindert ungewollte Wildcard-Interpretation durch PostgreSQL. Der Suchbegriff wird zusaetzlich auf 100 Zeichen gekuerzt (EC-3) und per `trim()` von fuehrendem/folgendem Leerzeichen bereinigt (EC-2).

---

### Sortier-Logik (serverseitig)

Die Sortierung wird vollstaendig serverseitig ueber den `sortBy`-Parameter gesteuert:

**Relevanz (Standard):**
Beim Suchbegriff: Produkte deren Name den Begriff enthaelt kommen zuerst, danach Produkte wo er nur in der Beschreibung vorkommt. Technisch umgesetzt mit einem berechneten Sortierschluessel (CASE WHEN name ILIKE ... THEN 0 ELSE 1 END), der als erste ORDER-BY-Spalte verwendet wird, danach alphabetisch nach Name.

Bei leerer Suche: alphabetisch nach Name.

**Preis aufsteigend / absteigend:**
ORDER BY CAST(price AS numeric) ASC/DESC — benoetigt wegen des text-Typs zwingend den CAST.

---

### State-Management auf search.vue (kein Pinia-Store)

Die gesamte Filter- und Such-Logik lebt als lokaler reaktiver State direkt auf der `search.vue`-Seite. Dies ist bewusst einfach gehalten, da der State nicht ausserhalb der Seite benoetigt wird (EC-10: kein Persistieren beim Navigieren).

```
Lokaler State auf search.vue:
- query           String    → Suchbegriff (via useSearch.ts)
- selectedCategory String   → aktive Kategorie ('' = Alle)
- onlyInStock     Boolean   → Verfuegbarkeits-Filter
- minPrice        Number|null → aktive Preisuntergrenze
- maxPrice        Number|null → aktive Preisobergrenze
- isVegan         Boolean
- isGlutenFree    Boolean
- sortBy          String    → 'relevance' | 'price_asc' | 'price_desc'
- isLoading       Boolean   → waehrend API-Call
- products        Array     → Suchergebnisse
- selectedProduct Product|null → fuer ProductDetailModal
```

**useSearch.ts wird wiederverwendet** mit `autoSearch: true, debounceMs: 300`. Der `onSearch`-Callback baut alle aktiven Filter als Query-String zusammen und sendet einen einzigen API-Call an `GET /api/products`.

**Computed-Property `hasActiveFilters`** prueft ob mindestens ein Filter (ausser Kategorie "Alle") aktiv ist — steuert die Sichtbarkeit des "Filter zuruecksetzen"-Buttons (REQ-31).

**Wenn ein Filter-Chip geaendert wird:** sofortige Suche (kein Debounce), da kein Tastendruck-Szenario vorliegt. Nur das Suchfeld nutzt den 300ms-Debounce.

---

### useSearch.ts Composable (Wiederverwendung)

Das Composable ist bereits vollstaendig vorhanden und unterstuetzt alle benoetigen Optionen:

- `query` — reaktiver Suchbegriff (v-model im SearchInput.vue)
- `clearQuery()` — X-Button im Suchfeld
- `autoSearch: true` — loest Suche waehrend Tippen aus
- `debounceMs: 300` — verzoegert API-Call um 300ms nach letztem Tastendruck

Keine Aenderungen am Composable erforderlich.

---

### Tech-Entscheidungen und Begruendungen

**Warum serverseitige Filterung statt clientseitiger Filterung?**
Der bestehende Endpunkt liefert bereits serverseitig gefilterte Produkte. Alle neuen Filter werden ebenfalls serverseitig angewendet. Dies entspricht NFR-4 (ein einziger API-Call mit allen kombinierten Parametern) und haelt die Produktliste konsistent mit dem Berechtigungssystem (isActive-Filter laeuft immer mit).

**Warum kein neuer Pinia-Store?**
Der Such-State ist vollstaendig lokal zu `/search`. Er wird beim Verlassen der Seite zurueckgesetzt (EC-10). Ein Store wuerde unnoetige Komplexitaet erzeugen.

**Warum keine neue Produktkarten-Komponente?**
Das Dashboard-`ProductGrid.vue` enthaelt bereits alle visuellen Bausteine (FavoriteIcon, PurchaseButton, Preis mit Angebot-Anzeige, Vegan/GF-Badges). Die `SearchResultsGrid.vue` uebernimmt dasselbe Karten-Layout, sodass kein doppelter Karten-Code entsteht.

**Warum ILIKE statt PostgreSQL Full-Text-Search (tsvector)?**
Bei der erwarteten Produktanzahl (< 1.000 Produkte) ist ILIKE performant genug (NFR-2: < 400ms). Ein FTS-Index wuerde zusaetzliche Schema-Migration und Wartung erfordern. ILIKE ist einfacher und ausreichend.

**Warum werden Preis-Chips mit festen Grenzen definiert?**
Die Grenzen werden als Konstante in `FilterChips.vue` definiert (z.B. `[{ label: 'bis 1 €', max: 1 }, { label: '1–2 €', min: 1, max: 2 }, { label: 'ueber 2 €', min: 2 }]`). Damit kann nur ein Preis-Chip gleichzeitig aktiv sein (mutually exclusive wie Kategorie-Chips) und der API-Call bekommt immer klare `minPrice`/`maxPrice`-Werte.

---

### Dependencies

Keine neuen Packages erforderlich. Alle benoetigen Libraries sind bereits installiert:

- `@vueuse/core` — bereits vorhanden (genutzt in `useSearch.ts` fuer `watchDebounced`)
- `drizzle-orm` — bereits vorhanden (SQL-Erweiterung im bestehenden Handler)

---

### Test-Anforderungen

**Unit-Tests (Vitest):**

| Was | Datei | Was wird getestet |
|-----|-------|-------------------|
| ILIKE-Escaping-Helfer | `tests/utils/search.test.ts` | %, _, \ werden korrekt escaped; leere Strings; nur-Leerzeichen; 100-Zeichen-Limit |
| Filter-Kombinationen API | `tests/api/products.test.ts` | q + category + inStock + minPrice/maxPrice + isVegan/isGlutenFree kombiniert; sortBy-Varianten |

Coverage-Ziel: 80%+ fuer neue Logik im API-Handler

**E2E-Tests (Playwright):**

| Flow | Datei |
|------|-------|
| Suche nach Begriff → Ergebnisse erscheinen nach Debounce | `tests/e2e/search.spec.ts` |
| Kategorie-Chip aktivieren → Filter greift, nur ein Chip aktiv | `tests/e2e/search.spec.ts` |
| Mehrere Filter kombinieren → AND-Verknuepfung korrekt | `tests/e2e/search.spec.ts` |
| Filter zuruecksetzen → alle Chips inaktiv, Suchbegriff bleibt | `tests/e2e/search.spec.ts` |
| Produktkarte klicken → ProductDetailModal oeffnet sich | `tests/e2e/search.spec.ts` |
| Warenkorb-Button klicken → Modal oeffnet sich NICHT (EC-8) | `tests/e2e/search.spec.ts` |
| Kein Ergebnis → EmptyState sichtbar | `tests/e2e/search.spec.ts` |
| Ladeindikator sichtbar waehrend API-Call | `tests/e2e/search.spec.ts` |

Browser: Chromium

---

## UX Expert Review

### Personas-Abdeckung

| Persona | Relevanz | Bewertung | Begruendung |
|---------|----------|-----------|-------------|
| Nina Neuanfang (Einsteiger) | Mittel | Gut | Neue Mitarbeiter finden schnell alle Produkte per Freitext ohne das Katalog-Grid zu kennen. Der Initialzustand ohne vorausgewaehlte Filter ist fuer Einsteiger verstaendlich. |
| Maxine Snackliebhaber (Stammkunde) | Hoch | Sehr gut | Favoriten-Icon auf der Karte erreichbar; Verfuegbarkeits-Filter beseitigt ihren groessten Pain Point (ausverkaufte Wunschprodukte). Schnelle Wiederholung dank Debounce-Suche. |
| Lucas Gesundheitsfan (Ernaehrungs-Filter) | Hoch | Sehr gut | Vegan- und Glutenfrei-Chips direkt kombinierbar — loest seinen bisherigen Pain Point vollstaendig. Ernaehrungs-Filter prominent und ohne Umweg erreichbar. |

Gesamtbewertung: Alle drei Kern-Personas werden durch FEAT-19 deutlich besser bedient als durch das bestehende Dashboard-Grid.

---

### Wireframe-Analyse

Das Wireframe `suche.png` zeigt:

- Suchfeld oben mit Lupe-Icon und "Search"-Placeholder — entspricht REQ-1/REQ-4.
- Filter-Leiste darunter mit horizontal scrollbaren Chips ("Filtername x", "Langer Filtername x"). Die Chips haben ein "x"-Icon zum individuellen Entfernen eines aktiven Filters — das ist zusaetzlich zum globalen "Filter zuruecksetzen"-Button aus REQ-31.
- Trichter-Icon rechts neben der Filter-Leiste — deutet auf Sortierung hin. Interpretation: Dieses Icon soll den `SortSelector.vue` aufrufen (Inline-Umschalter oder kompaktes Dropdown).
- Produktkarten als Listenansicht (nicht als Grid) — die Karten nehmen die volle Breite ein und zeigen: Produktbild links, Name und Preis rechts. Diese Listenstruktur weicht vom 2-spaltigen Grid des Dashboards ab.
- Tab-Bar unten mit "Suche" als aktiver Tab (zweite Position).

**Diskrepanz zum Feature-Spec (Listenansicht vs. Grid):** REQ-19 und die Komponente `SearchResultsGrid.vue` implizieren ein Grid-Layout, das Wireframe zeigt jedoch eine einspaltigen Listenansicht (Full-Width-Karten). Empfehlung: Listenansicht priorisieren — auf mobilen Geraeten schlaegt Lesbarkeit ein enges 2-Spalten-Grid.

**Diskrepanz zu REQ-31 (Einzeln vs. Global):** Das Wireframe zeigt ein "x" direkt an jedem aktiven Chip, nicht nur einen globalen "Filter zuruecksetzen"-Button. Beide Pattern sollten implementiert werden: x-Icon am Chip (Einzel-Entfernen) und globaler Reset-Link (Alles loeschen).

---

### Filter-Chip Design

#### Visueller Zustand

| Zustand | Hintergrund | Text | Beschreibung |
|---------|-------------|------|--------------|
| Inaktiv | `bg-secondary` (#E2E8EE) | `text-secondary-foreground` (#1E2D3D) | Standard-Chip |
| Aktiv | `bg-primary` (#1B4D40) | `text-primary-foreground` (weiss) | Ausgefuellt, dunkelgruen |
| Aktiv mit Hover | `bg-primary/90` | `text-primary-foreground` | Leichtes Aufhellen |
| Inaktiv mit Hover | `bg-secondary/80` | `text-secondary-foreground` | Dezentes Feedback |

Empfohlene Tailwind-Klassen fuer inaktiven Chip:
`px-3 py-2.5 rounded-pill text-sm font-medium bg-secondary text-secondary-foreground whitespace-nowrap transition-colors`

Empfohlene Tailwind-Klassen fuer aktiven Chip:
`px-3 py-2.5 rounded-pill text-sm font-medium bg-primary text-primary-foreground whitespace-nowrap transition-colors`

- Chips verwenden `rounded-pill` (9999px) — konsistent mit bestehenden CTA-Buttons im Theme.
- `py-2.5` ergibt zusammen mit `text-sm` (24px line-height) eine Touch-Zone von ca. 44px Gesamthoehe (WCAG 2.5.5 konform).
- Aktive Chips mit "x"-Icon: Icon (`teenyicons/outline/x-small`) rechts neben dem Label mit `ml-1.5`, Touch-Bereich des Icons mindestens 20x20px innen.
- Optionaler visueller Trennstrich zwischen Chip-Gruppen: `w-px h-5 bg-border mx-2 self-center flex-shrink-0` als Separator zwischen Kategorie, Verfuegbarkeit, Preis und Ernaehrung.

#### Chip-Gruppen Reihenfolge (fest)

1. Kategorien: Alle / Obst / Protein / Shakes / Schoki / Nuesse / Getraenke
2. Verfuegbarkeit: "Nur vorraetigen"
3. Preisbereich: "bis 1,00 EUR" / "1,00-2,00 EUR" / "ab 2,00 EUR"
4. Ernaehrung: "Vegan" / "Glutenfrei"

---

### Preis-Spannen-Definition

Basierend auf dem Snack-Kiosk-Sortiment (Obst, Protein-Riegel, Shakes, Getraenke, Nuesse) und einem monatlichen Mitarbeiter-Guthaben von 25 EUR werden folgende drei Preis-Buckets empfohlen:

| Chip-Label | minPrice | maxPrice | Rationale |
|------------|----------|----------|-----------|
| "bis 1,00 EUR" | — | 1.00 | Impuls-Kauf, Obst, guenstige Snacks |
| "1,00 – 2,00 EUR" | 1.00 | 2.00 | Mittelklasse: Riegel, Nuesse, Getraenke |
| "ab 2,00 EUR" | 2.00 | — | Premium: Shakes, spezielle Produkte |

Diese Grenzen decken den typischen Preisraum von ca. 0,50 EUR bis 4,00 EUR vollstaendig ab. Kein Produkt faellt zwischen Buckets, da die Grenzen inklusiv behandelt werden.

API-Parameter:
- "bis 1,00 EUR": `?maxPrice=1.00`
- "1,00 – 2,00 EUR": `?minPrice=1.00&maxPrice=2.00`
- "ab 2,00 EUR": `?minPrice=2.00`

Preis-Chips sind mutually exclusive (analog zu Kategorie-Chips) — mehrere Preis-Buckets gleichzeitig ergaeben keinen sinnvollen Filter. Dies bestaetigt die Implementierung in `FilterChips.vue` (Solution Architect: Preis-Chips als Konstanten-Array).

---

### Mobile UX

#### Horizontales Chip-Scrolling

```
<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
  <!-- Chips -->
</div>
```

- `overflow-x-auto` mit `-mx-4 px-4` sorgt dafuer, dass Chips bis an den Screen-Rand reichen (Edge-to-Edge-Scroll).
- `scrollbar-hide` blendet die Scrollbar auf Desktop aus — auf Mobile ohnehin nicht sichtbar.
- `pb-2` verhindert, dass der untere Schatten von aktiven Chips abgeschnitten wird.
- Scroll-Indikator: Ein subtiler Verlauf am rechten Ende der Leiste (`from-transparent to-background` via `after:`-Pseudo-Element oder Wrapper-Gradient) signalisiert weitere Chips.
- Die Chip-Leiste scrollt unabhaengig vom Rest der Seite — kein `overflow: hidden` auf dem Parent.
- `whitespace-nowrap` auf jedem Chip verhindert Zeilenumbruch.

#### Ergebnisliste (Listenansicht gemaess Wireframe)

- Mobile (Standardfall): Einspaltiges Full-Width-Layout, Flex-Spalte mit `gap-3`.
- Produktbild: 56x56px, `rounded-lg`, `object-cover`, links in der Karte.
- Karten-Mindesthoehe: 72px fuer Touch-Targets.
- Ab `sm` (640px): Optional 2-spaltiges Grid moeglich, Listenansicht bleibt aber bevorzugt fuer Lesbarkeit.

---

### Ladezustand (Skeleton-Cards)

Skeleton-Cards imitieren die Struktur der echten Produktkarte in der Listenansicht:

```
┌─────────────────────────────────────────────┐
│  [56x56 Graublock]  [────────── 60% ──────] │
│                     [────── 35% ────]       │
└─────────────────────────────────────────────┘
```

Implementierung:
- 4-6 Skeleton-Karten werden gleichzeitig angezeigt (fuellt den Viewport).
- Farbe: `bg-muted` (#EBECF0) mit `animate-pulse`-Animation (bereits im Theme-Keyframe definiert).
- Abmessungen spiegeln die echte Karte: Bildplatzhalter 56x56px abgerundet, zwei Textzeilen-Platzhalter mit unterschiedlicher Breite.
- Der Skeleton erscheint unmittelbar nach dem Debounce-Trigger, nicht erst nach 300ms Wartezeit.

Kein Spinner: Ein Spinner mitten auf der Seite erzeugt Layout-Shift und ist weniger informativ. Skeleton-Cards behalten das Layout stabil und reduzieren die wahrgenommene Ladezeit.

---

### Empty State

Der Empty State erscheint wenn keine Produkte die Such- und Filterbedingungen erfuellen.

Visuelles Design:

```
┌─────────────────────────────────────────────┐
│                                             │
│      [Teenyicons search, 48px, muted]       │
│                                             │
│       Kein Produkt gefunden                 │
│       (font-semibold, text-foreground)      │
│                                             │
│  Versuche einen anderen Suchbegriff         │
│  oder passe die Filter an.                  │
│  (text-sm, text-muted-foreground)           │
│                                             │
│       [Filter zuruecksetzen]                │
│  (nur wenn Filter aktiv, text-accent)       │
│                                             │
└─────────────────────────────────────────────┘
```

- Icon: `teenyicons/outline/search` (oder `teenyicons/outline/zoom-out`), 48px, `text-muted-foreground`.
- Ueberschrift: "Kein Produkt gefunden" — `text-base font-semibold text-foreground`.
- Subtext: "Versuche einen anderen Suchbegriff oder passe die Filter an." — `text-sm text-muted-foreground`.
- CTA: "Filter zuruecksetzen" nur wenn `hasActiveFilters === true` — Textueller Link in `text-accent` (Teal, #3AACA7). Kein Button, da der CTA dezent bleiben soll.
- Wiederverwendung der bestehenden `EmptyState.vue` aus `src/components/shared/EmptyState.vue` (eingefuehrt in FEAT-18). Props: icon, title, description, optionaler action-Slot fuer den Link.
- Empty State erscheint erst nach abgeschlossenem API-Call (nicht waehrend des Tippens).

---

### Sortierungs-Umschalter (SortSelector.vue)

Empfehlung: Segmented Control (Inline), kein Dropdown.

Ein Dropdown waere bei drei Optionen ueberdimensioniert und erfordert einen zusaetzlichen Tap. Ein Segmented Control ist sofort scanbar und benoetigt nur eine Interaktion.

Layout-Konzept:

```
┌────────────────────────────────────────────────────┐
│  [Relevanz]  [Preis (aufsteigend)]  [Preis (abst.)] │
└────────────────────────────────────────────────────┘
```

Klassen-Konzept:
- Wrapper: `inline-flex rounded-lg border border-border bg-background p-0.5 gap-0.5`
- Inaktives Segment: `px-3 py-1 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors`
- Aktives Segment: `px-3 py-1 rounded-md text-sm bg-primary text-primary-foreground font-medium`

Icons (Teenyicons):
- "Relevanz": kein Icon oder `teenyicons/outline/sort-ascending`
- "Preis aufsteigend": `teenyicons/outline/arrow-up` + Text "Preis"
- "Preis absteigend": `teenyicons/outline/arrow-down` + Text "Preis"

Platzierung: Direkt oberhalb der Ergebnisliste, als eigene Zeile (100% Breite) oder rechtbuendig neben einer Treffer-Anzahl.

Wireframe-Abgleich: Das Trichter-Icon rechts in der Filter-Leiste koennte den SortSelector ausloesen. Empfehlung: SortSelector direkt inline anzeigen statt in einem Modal oder Drawer — spart einen Tap und ist auf Mobile gut lesbar.

---

### Accessibility-Pruefung (WCAG 2.1 AA)

| Kriterium | Status | Massnahme fuer Developer |
|-----------|--------|--------------------------|
| Farbkontrast Chips inaktiv: `text-secondary-foreground` (#1E2D3D) auf `bg-secondary` (#E2E8EE) | Ca. 9:1 — besteht AA | Kein Handlungsbedarf |
| Farbkontrast Chips aktiv: weiss auf `bg-primary` (#1B4D40) | Ca. 12:1 — besteht AAA | Kein Handlungsbedarf |
| Farbkontrast Muted Text (#5D6C7E) auf Hintergrund (#F4F6F9) | >= 4.5:1 (laut Theme-Kommentar) — besteht AA | Kein Handlungsbedarf |
| Touch-Targets Chips | Mindestens 44x44px Tap-Zone (WCAG 2.5.5) | `py-2.5` auf jedem Chip-Button sicherstellen |
| Touch-Target Favoriten-Icon | Bereits in FavoriteIcon.vue vorhanden | Unveraendert uebernehmen |
| ARIA-Labels Filter-Leiste | Fehlt bisher | `role="group"` + `aria-label="Produkte filtern"` auf dem Chip-Container |
| ARIA-Zustand Chips | Fehlt bisher | `aria-pressed="true/false"` auf jedem Chip-Button (Toggle-Button-Semantik) |
| ARIA-Label Suchfeld | Erforderlich | `<label for="search-input" class="sr-only">Produkte suchen</label>` — Pattern bereits in ProductGrid.vue vorhanden |
| Live-Region fuer Ergebnisse | Fehlt bisher | `aria-live="polite"` auf dem Ergebniscontainer — informiert Screen Reader ueber Aktualisierungen |
| Keyboard-Navigation | Standardmaessig OK | Tab-Reihenfolge: Suchfeld → Chips → Sortierung → Ergebnisliste (DOM-Reihenfolge genuegt) |
| Kontrast Skeleton | Ladezustand ohne Text | Kein Kontrast-Anforderung; `animate-pulse` reicht als visuelle Angabe |

---

### UX-Empfehlungen fuer den Developer

1. **Listenansicht statt Grid umsetzen:** Das Wireframe zeigt Full-Width-Karten, kein 2-Spalten-Grid. Produktbild links (56x56px), Name und Preis rechts, Warenkorb-Button und Favoriten-Icon am rechten Rand. Statt `SearchResultsGrid.vue` als Grid-Wrapper ein `flex flex-col gap-3` verwenden.

2. **Chip-Leiste Edge-to-Edge scrollbar machen:** `overflow-x-auto -mx-4 px-4` damit Chips visuell bis zum Bildschirmrand laufen. Scroll-Verlauf (weisser Gradient) am rechten Ende als Hinweis auf weitere Chips.

3. **x-Icon an aktiven Chips ergaenzen:** Zusaetzlich zum globalen "Filter zuruecksetzen"-Button ein x-Icon direkt am Chip implementieren (laut Wireframe). Teenyicons: `x-small-outline`. `@click.stop` nicht vergessen um Event-Propagation zu stoppen.

4. **Preis-Chips mutually exclusive behandeln:** Wie Kategorie-Chips — nur ein Preis-Bucket gleichzeitig aktiv. Das ist in der Solution Architect Implementierung bereits als Konstanten-Array vorgesehen, muss aber im Toggle-Handler explizit umgesetzt werden.

5. **EmptyState.vue wiederverwenden:** Bestehende Komponente aus FEAT-18 nutzen. Den optionalen Action-Slot fuer den "Filter zuruecksetzen"-Link verwenden. Kein neuer Empty-State-Code.

6. **Skeleton statt Spinner:** 4-6 Skeleton-Karten mit `animate-pulse` und `bg-muted`. Der Skeleton erscheint sofort nach Debounce-Trigger. Kein Spinner, kein Layout-Shift.

7. **SortSelector als Segmented Control:** Kein Dropdown. Drei Segmente inline, `rounded-lg border` als Wrapper, aktives Segment `bg-primary text-white`. Direkt inline platzieren, kein Modal.

8. **ARIA-Attribute setzen:** `role="group"` und `aria-label` auf Filter-Leiste, `aria-pressed` auf Chips, `aria-live="polite"` auf Ergebniscontainer. Geringer Aufwand, grosser Accessibility-Gewinn.

9. **Scroll-Position bei Modal-Close beibehalten:** Wenn der User aus dem ProductDetailModal zurueckkehrt, soll die Scroll-Position der Ergebnisliste erhalten bleiben. Kein automatisches Scroll-to-Top beim Schliessen des Modals.

10. **Empty State erst nach API-Antwort zeigen:** Den Empty State nicht waehrend des Tippens anzeigen (waere bei jedem Zwischenzustand des Suchbegriffs sichtbar). Erst wenn der Debounce abgelaufen und das API-Ergebnis zurueckgekehrt ist und leer ist.

---

### User Flow: Produkt per Ernaehrungs-Filter finden (Lucas-Szenario)

**Akteur:** Lucas Gesundheitsfan
**Ziel:** Vegane und glutenfreie Produkte im aktuellen Sortiment finden

**Schritte:**
1. Lucas tippt auf Tab "Suche" in der unteren Navigation.
2. /search laedt im Initialzustand: Suchfeld leer, alle Filter inaktiv, alle aktiven Produkte sichtbar.
3. Lucas scrollt die Chip-Leiste horizontal bis zu den Ernaehrungs-Chips.
4. Lucas tippt auf "Vegan" — Chip wird aktiv (dunkelgruen), Ergebnisliste aktualisiert sich sofort.
5. Lucas tippt zusaetzlich auf "Glutenfrei" — beide Chips aktiv, Ergebnisse weiter eingeschraenkt.
6. Lucas sieht die gefilterte Produktliste (nur Produkte mit isVegan=true UND isGlutenFree=true).
7. Lucas tippt auf eine Produktkarte — ProductDetailModal oeffnet sich.
8. Lucas schliesst das Modal — er ist wieder auf /search, beide Filter weiterhin aktiv.

**Alternativer Flow (keine Treffer):**
- Nach Schritt 6: Ergebnisliste ist leer.
- Empty State erscheint mit "Kein Produkt gefunden" und "Filter zuruecksetzen"-Link.
- Lucas entfernt einen Filter via x-Icon am Chip oder klickt "Filter zuruecksetzen".

---

### User Flow: Schnellkauf per Suche (Maxine-Szenario)

**Akteur:** Maxine Snackliebhaber
**Ziel:** Bekannten Snack schnell finden und direkt in den Warenkorb legen

**Schritte:**
1. Maxine oeffnet /search.
2. Maxine tippt "Apfel" ins Suchfeld.
3. Nach 300ms Debounce: API-Call, Skeleton-Cards erscheinen kurz.
4. Ergebnisse laden: Produkte mit "Apfel" im Namen erscheinen zuerst (Relevanz-Sortierung).
5. Maxine sieht direkt den Warenkorb-Button auf der Karte und tippt ihn an.
6. PurchaseButton-Feedback (bestehendes Pattern aus FEAT-16 — kein Modal-Oeffnen).
7. Maxine ist fertig ohne das ProductDetailModal oeffnen zu muessen.

---

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-13

### Geaenderte/Neue Dateien

- `src/server/api/products/index.get.ts` — Erweitert um neue Query-Parameter: `q`, `inStock`, `minPrice`, `maxPrice`, `isVegan`, `isGlutenFree`, `sortBy`; ILIKE-Suche ueber name + description; serverseitiger CAST fuer Preis-Filter/Sortierung; Relevanz-Sortierung mit CASE WHEN
- `src/server/utils/search.ts` — Neu: `escapeIlikeTerm()` Funktion fuer ILIKE-Escaping (%, _, \), Trimming (EC-2) und Laengen-Limit (EC-3)
- `src/components/search/SearchInput.vue` — Neu: Suchfeld mit Lupe-Icon links, X-Button rechts bei nicht-leerem Wert, SR-only Label, v-model
- `src/components/search/FilterChip.vue` — Neu: Toggle-Chip aktiv/inaktiv, x-Icon an aktiven Chips (Wireframe-Anforderung), aria-pressed, rounded-full, py-2.5 fuer 44px Touch-Target
- `src/components/search/FilterChips.vue` — Neu: Horizontale Chip-Leiste edge-to-edge (-mx-4 px-4), 4 Gruppen mit Trennlinien, Preis-Buckets mutually exclusive, v-model Bindings fuer alle Filter
- `src/components/search/SortSelector.vue` — Neu: Segmented Control (kein Dropdown), 3 Optionen mit Pfeil-Icons (Teenyicons), aktives Segment bg-primary, v-model
- `src/components/search/SearchResultsGrid.vue` — Neu: Listenansicht (flex flex-col gap-3), Skeleton-Cards animate-pulse, EmptyState.vue Wiederverwendung, Warenkorb-Mengensteuerung +/-, Favoriten-Icon, event.stop-Propagation fuer EC-8/EC-9
- `src/pages/search.vue` — Vollstaendig: lokaler Filter-State, hasActiveFilters computed, useSearch-Composable mit debounceMs 300, watcher fuer Filter-Aenderungen, performSearch(), ProductDetailModal-Integration
- `tests/utils/search.test.ts` — Neu: 20 Tests fuer escapeIlikeTerm (Escaping, Trimming, Laengen-Limit, Kombinationen); Tippfehler in Test-Erwartung behoben (test\%pro statt test\%pr)

### Wichtige Entscheidungen

- **Listenansicht statt Grid:** Laut Wireframe-Analyse (UX Expert Review) einspaltiges Full-Width-Layout implementiert statt 2-spaltigem Grid — bessere Lesbarkeit auf Mobile
- **Preis-Chips mutually exclusive:** Konsistenz mit Kategorie-Chips; mehrere Preis-Buckets gleichzeitig ergaeben keinen sinnvollen Filter
- **Kein Pinia-Store:** Lokaler Komponenten-State auf search.vue genuegt (EC-10: kein Persistieren beim Navigieren)
- **ILIKE statt FTS:** Performant genug bei erwarteter Produktanzahl (< 1.000), kein Schema-Migrations-Aufwand
- **Test-Bugfix:** Der Kombinationstest hatte einen Tippfehler in der expect-Zeile — Kommentar war korrekt ("test\%pro"), Erwartung zeigte aber "test\%pr" (fehlerhaft). Korrigiert auf "test\%pro".

### Bekannte Einschraenkungen

- Keine E2E-Tests implementiert (Playwright) — die Spec nennt sie als Anforderung, sie benoetigen eine laufende App-Instanz mit Test-Daten; sollten in einem separaten QA-Schritt ergaenzt werden
- EmptyState.vue unterstuetzt nur die Icons 'heart' | 'thumb-up' | 'star' | 'info' | 'x' — fuer den Suche-Empty-State wird 'info' verwendet (kein 'search'-Icon verfuegbar ohne Aenderung der shared Komponente)

---

## Offene Bugs

Keine offenen Bugs.
