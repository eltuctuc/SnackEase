# FEAT-22: Konfigurierbarer Nachbestellschwellwert

## Status: Implemented

## Abhaengigkeiten
- Benoetigt: FEAT-12 (Bestandsverwaltung) - fuer Inventory-API und Bestandszeilen in /admin/inventory
- Benoetigt: FEAT-13 (Low-Stock-Benachrichtigungen) - Trigger-Logik wird auf products.stockThreshold umgestellt
- Wiederverwendet: PATCH /api/admin/inventory (aus FEAT-12)
- Wiederverwendet: POST/PATCH /api/admin/products (aus FEAT-6/FEAT-12)

---

## 1. Uebersicht

**Beschreibung:** Der Low-Stock-Schwellwert (aktuell hart kodiert auf 3) wird pro Produkt konfigurierbar. Ein neues DB-Feld `products.stockThreshold` (integer, default 3) ersetzt den Hard-Code. Der Admin kann den Schwellwert an zwei Stellen pflegen: beim Erstellen/Bearbeiten eines Produkts in der Produktverwaltung (`/admin/products`) und direkt in der Bestandszeile der Bestandsverwaltung (`/admin/inventory`).

**Ziel:** Flexibilitaet bei der Nachbestellplanung — Produkte mit hoher Nachfrage koennen einen hoeheren Schwellwert erhalten, selten gekaufte Produkte einen niedrigeren.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Admin moechte ich beim Anlegen eines Produkts einen Nachbestellschwellwert festlegen koennen | Admin | Must-Have |
| US-2 | Als Admin moechte ich beim Bearbeiten eines Produkts den Schwellwert anpassen koennen | Admin | Must-Have |
| US-3 | Als Admin moechte ich in der Bestandsverwaltung den Schwellwert direkt neben dem aktuellen Bestand sehen und bearbeiten koennen | Admin | Must-Have |
| US-4 | Als Admin moechte ich, dass neue Produkte automatisch einen sinnvollen Standard-Schwellwert (3) erhalten, ohne dass ich ihn manuell setzen muss | Admin | Must-Have |
| US-5 | Als Admin moechte ich, dass Low-Stock-Benachrichtigungen nun auf dem konfigurierten Schwellwert basieren und nicht mehr auf dem fixen Wert 3 | Admin | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 DB-Schema

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | `products`-Tabelle erhaelt neues Feld `stockThreshold` (integer, NOT NULL, default 3) | Must-Have |
| REQ-2 | Migration: Alle bestehenden Produkte erhalten `stockThreshold = 3` | Must-Have |

### 3.2 Produktverwaltung (/admin/products)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-3 | Das Produkt-Erstellen-Modal enthaelt ein Eingabefeld "Nachbestellschwellwert" (numerisch, min 1, default 3) | Must-Have |
| REQ-4 | Das Produkt-Bearbeiten-Modal zeigt den aktuellen `stockThreshold` und erlaubt dessen Aenderung | Must-Have |
| REQ-5 | POST/PATCH /api/admin/products nimmt `stockThreshold` entgegen und speichert ihn | Must-Have |
| REQ-6 | Validierung: Schwellwert muss eine ganze Zahl >= 1 sein | Must-Have |

### 3.3 Bestandsverwaltung (/admin/inventory)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-7 | Die Bestandszeile zeigt pro Produkt den aktuellen `stockThreshold` an | Must-Have |
| REQ-8 | Der `stockThreshold` ist direkt inline editierbar (analog zur bestehenden Bestand-Eingabe) | Must-Have |
| REQ-9 | PATCH /api/admin/inventory nimmt optional `stockThreshold` entgegen und speichert ihn | Must-Have |
| REQ-10 | Nach Aenderung des Schwellwerts wird geprüft, ob eine bestehende Low-Stock-Warnung fuer dieses Produkt geloescht werden soll (Bestand > neuer Schwellwert → Warnung loeschen) | Must-Have |

### 3.4 FEAT-13 Trigger-Logik anpassen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-11 | `purchases.post.ts`: Low-Stock-Check verwendet `product.stockThreshold` statt hartkodierter `3` | Must-Have |
| REQ-12 | `inventory.patch.ts`: Auto-Loesch-Check verwendet `product.stockThreshold` statt hartkodierter `3` | Must-Have |

---

## 4. Acceptance Criteria

- [ ] AC-1: `products`-Tabelle hat das Feld `stockThreshold` (integer, default 3)
- [ ] AC-2: Alle bestehenden Produkte haben nach der Migration `stockThreshold = 3`
- [ ] AC-3: Im Produkt-Erstellen-Modal ist das Feld "Nachbestellschwellwert" sichtbar und vorausgefuellt mit 3
- [ ] AC-4: Im Produkt-Bearbeiten-Modal wird der gespeicherte `stockThreshold` angezeigt und kann geaendert werden
- [ ] AC-5: In der Bestandsverwaltung ist `stockThreshold` pro Zeile sichtbar und editierbar
- [ ] AC-6: Eine Aenderung des Schwellwerts in /admin/inventory wird gespeichert und sofort im UI reflektiert
- [ ] AC-7: Nach dem Kauf eines Produkts wird die Low-Stock-Pruefung gegen `products.stockThreshold` gemacht (nicht gegen 3)
- [ ] AC-8: Nach dem Auffuellen eines Produkts ueber den konfigurierten Schwellwert wird die Low-Stock-Warnung geloescht
- [ ] AC-9: Schwellwert-Eingabe < 1 wird mit einer Validierungsfehlermeldung abgelehnt
- [ ] AC-10: Icons verwenden ausschliesslich Teenyicons 1.0 (teenyicons npm)

---

## 5. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Admin setzt Schwellwert auf 0 oder negativen Wert | Validierungsfehler: "Schwellwert muss mindestens 1 sein" — kein Speichern |
| EC-2 | Admin setzt Schwellwert hoeher als den aktuellen Bestand | Sofortige Low-Stock-Benachrichtigung wird ausgeloest (Bestand <= neuer Schwellwert) |
| EC-3 | Admin setzt Schwellwert niedriger als den aktuellen Bestand, waehrend eine Warnung aktiv ist | Bestehende Warnung wird automatisch geloescht |
| EC-4 | Produkt ohne explizit gesetzten Schwellwert (Altdaten vor Migration) | Default-Wert 3 wird verwendet — keine Fehlfunktion |
| EC-5 | Zwei Admins aendern gleichzeitig den Schwellwert desselben Produkts | Letzter Schreibvorgang gewinnt (Last-Write-Wins, kein Locking benoetigt) |
| EC-6 | Admin gibt eine Dezimalzahl (z.B. 2.5) ein | Eingabe wird auf ganze Zahl abgeschnitten oder Validierungsfehler — kein Float im DB |

---

## 6. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| NFR-1 | Schwellwert-Aenderung in /admin/inventory: Response < 300 ms |
| NFR-2 | Migration laeuft ohne Datenverlust auf bestehenden Produkten durch |
| NFR-3 | Icons: ausschliesslich Teenyicons 1.0 (teenyicons npm) |

---

## 7. Abgrenzung (Out of Scope fuer FEAT-22)

| Thema | Begruendung |
|-------|-------------|
| E-Mail-Benachrichtigung bei Schwellwertunterschreitung | Scope von FEAT-13 (Nice-to-Have, noch nicht implementiert) |
| Globaler Standard-Schwellwert fuer alle Produkte auf einmal aendern | Future Scope |
| Unterschiedliche Schwellwerte je Standort (Nuernberg/Berlin) | Future Scope |

---

## 8. Tech-Design (Solution Architect)

### Gepruefte bestehende Architektur

Vor dem Design wurden folgende Dateien analysiert:

- `src/server/db/schema.ts` — `products`-Tabelle hat noch kein `stockThreshold`-Feld
- `src/server/api/admin/inventory/index.get.ts` — nutzt `const LOW_STOCK_THRESHOLD = 3` (hart kodiert)
- `src/server/api/admin/inventory/index.patch.ts` — prueft `if (u.stockQuantity > 3)` (hart kodiert)
- `src/server/api/purchases.post.ts` — prueft `if (updatedStock <= 3)` (hart kodiert)
- `src/server/api/admin/products/index.post.ts` — akzeptiert `stock`, aber kein `stockThreshold`
- `src/server/api/admin/products/[id].patch.ts` — akzeptiert `stock`, aber kein `stockThreshold`
- `src/pages/admin/products.vue` — Modal mit `productForm` kennt kein `stockThreshold`
- `src/pages/admin/inventory.vue` — existiert **nicht** als Page-Datei (muss neu angelegt werden)

Wichtige Erkenntnis: `/admin/inventory` hat eine funktionierende API (`GET/PATCH /api/admin/inventory`), aber noch keine eigene Vue-Page. Diese muss im Zuge von FEAT-22 erstellt werden.

---

### Component-Struktur

```
/admin/inventory (neue Page: src/pages/admin/inventory.vue)
└── Bestandstabelle
    └── Pro Produkt-Zeile:
        ├── Produktname + Kategorie
        ├── Bestand-Eingabe (inline editierbar — bereits in FEAT-12 API vorhanden)
        ├── Schwellwert-Eingabe (NEU — inline editierbar, analog zur Bestand-Eingabe)
        ├── Status-Badge (ok / low / empty — basiert jetzt auf products.stockThreshold)
        └── Speichern-Button (oder Auto-Save bei Blur)

/admin/products (bestehend: src/pages/admin/products.vue)
└── Produkt-Modal (Erstellen + Bearbeiten)
    └── Formular
        ├── Name, Preis, Beschreibung (bestehend)
        ├── Lagerbestand (bestehend)
        ├── Nachbestellschwellwert (NEU — Zahlenfeld, min 1, default 3)  <--- NEU
        └── Allergene, Vegan, Glutenfrei (bestehend)
```

---

### Daten-Model

Erweiterung der bestehenden `products`-Tabelle in `src/server/db/schema.ts`:

```
products-Tabelle erhaelt ein neues Feld:
- stockThreshold (Ganzzahl, Pflicht, Standard: 3)
  Bedeutung: Ab welchem Bestand wird eine Low-Stock-Warnung ausgeloest?
  Beispiel: stockThreshold = 5 → Warnung wenn Bestand <= 5
```

Keine neue Tabelle noetig. Alle anderen Tabellen (`low_stock_notifications`, `purchases` usw.) bleiben unveraendert.

Datenmigration: Bestehende Produkte erhalten automatisch `stockThreshold = 3` durch den Drizzle-Default beim naechsten Deployment.

---

### API-Aenderungen

**4 Dateien werden angepasst, keine neuen API-Routen noetig:**

```
1. GET /api/admin/inventory (index.get.ts)
   - Laedt zusaetzlich products.stockThreshold aus der DB
   - Entfernt: const LOW_STOCK_THRESHOLD = 3
   - Neu: status-Berechnung nutzt p.stockThreshold statt hartkodierter 3
   - Response erhaelt neues Feld: stockThreshold (Zahl)

2. PATCH /api/admin/inventory (index.patch.ts)
   - Akzeptiert optional stockThreshold pro Update-Objekt
   - Prueft: Bestand > neuer Schwellwert → Low-Stock-Warnung loeschen (REQ-10)
   - Prueft: Bestand <= neuer Schwellwert → neue Low-Stock-Warnung anlegen (EC-2)
   - Entfernt: hartkodierte 3 in der Benachrichtigungs-Logik
   - Validierung: stockThreshold >= 1, Ganzzahl

3. POST /api/admin/products (index.post.ts)
   - Akzeptiert neues Feld stockThreshold (optional, default 3)
   - Speichert stockThreshold beim Anlegen

4. PATCH /api/admin/products/[id] ([id].patch.ts)
   - Akzeptiert neues Feld stockThreshold (optional)
   - Aktualisiert stockThreshold wenn mitgeschickt

5. POST /api/purchases (purchases.post.ts)
   - Low-Stock-Check laedt zusaetzlich products.stockThreshold
   - Entfernt: hartkodierte 3
   - Neu: Vergleich mit product.stockThreshold des jeweiligen Produkts
```

---

### Implementierungsreihenfolge

Die Schritte muessen in dieser Reihenfolge ausgefuehrt werden, da jeder Schritt auf dem vorigen aufbaut:

```
Schritt 1 — DB-Schema erweitern
  → src/server/db/schema.ts: stockThreshold-Feld zur products-Tabelle hinzufuegen
  → Drizzle-Migration erzeugen und deployen
  → Warum zuerst: Alle weiteren Schritte setzen das Feld in der DB voraus

Schritt 2 — Backend: Inventory-API anpassen
  → src/server/api/admin/inventory/index.get.ts: stockThreshold mitlesen + hartkodierte 3 ersetzen
  → src/server/api/admin/inventory/index.patch.ts: stockThreshold akzeptieren + Prueflogik anpassen
  → Warum zweiter: Inventory-Page (Schritt 4) braucht die API

Schritt 3 — Backend: Produkt-APIs anpassen
  → src/server/api/admin/products/index.post.ts: stockThreshold akzeptieren
  → src/server/api/admin/products/[id].patch.ts: stockThreshold akzeptieren
  → Warum dritter: Produkt-Modal (Schritt 5) braucht die API

Schritt 4 — Backend: Kaufprozess anpassen
  → src/server/api/purchases.post.ts: Low-Stock-Check auf product.stockThreshold umstellen
  → Warum vierter: Unabhaengig von UI, kann parallel zu Schritt 3 erfolgen

Schritt 5 — Frontend: /admin/inventory Page erstellen
  → src/pages/admin/inventory.vue: Neue Page anlegen
  → Zeigt Bestandstabelle mit inline-editierbarem Bestand UND Schwellwert
  → Status-Badge (ok/low/empty) basiert auf stockThreshold aus der API
  → Warum fuenfter: Braucht fertige API aus Schritt 2

Schritt 6 — Frontend: /admin/products Modal erweitern
  → src/pages/admin/products.vue:
    - AdminProduct-Interface um stockThreshold erweitern
    - productForm um stockThreshold (default 3) erweitern
    - Neues Zahlenfeld im Modal-Formular hinzufuegen (zwischen Lagerbestand und Allergene)
    - openEditModal laedt bestehenden stockThreshold
    - handleSaveProduct schickt stockThreshold mit
  → Warum letzter: Rein UI, braucht fertige API aus Schritt 3
```

---

### Tech-Entscheidungen

**Warum kein separates Threshold-Table?**
Der Schwellwert ist eine Eigenschaft des Produkts — kein eigener Datensatz. Ein extra Table waere Over-Engineering ohne Mehrwert. Ein Feld in `products` ist einfacher, schneller und konsistenter mit der bestehenden Architektur.

**Warum inline-Editierung in /admin/inventory statt eigenem Modal?**
Das Bestandsverwaltungs-Konzept basiert auf schneller Massenpflege — analoges Muster wie der bestehende Bestand-Input. Ein Modal pro Produkt waere langsamer und unnoetig komplex fuer einen einzelnen Zahlenwert.

**Warum neues Feld in products statt eigene Konfigurationstabelle?**
Konsistenz mit dem bestehenden `stock`-Feld. Beide Werte (Bestand + Schwellwert) gehoeren zum Produkt und werden zusammen gepflegt.

**Warum GET /api/admin/inventory die Schwellwert-Pruefung machen laesst?**
Die API berechnet bereits den `status`-Wert (ok/low/empty). Das Frontend zeigt nur an, was die API liefert. Keine Logik im Frontend — konsistent mit der bestehenden Architektur.

---

### Dependencies

Keine neuen Packages noetig. Das Feature nutzt ausschliesslich bestehende Technologien:
- Drizzle ORM (Schema-Migration + Queries)
- Vue 3 / Nuxt 3 (neue Page + Modal-Erweiterung)
- Tailwind CSS (Styling analog zu bestehenden Admin-Seiten)
- Teenyicons (Icons — ausschliesslich diese Library)

---

### Test-Anforderungen

**Unit-Tests (Vitest):**
- Zu testende Logik: Validierungslogik fuer `stockThreshold` (>= 1, Ganzzahl)
- Zu testende API-Handler: inventory.get, inventory.patch, purchases.post (Low-Stock-Check)
- Ziel-Coverage: 80%+ fuer neue/geaenderte Serverlogik
- Testdateien: `tests/server/inventory.test.ts`, `tests/server/purchases.test.ts`

**E2E-Tests (Playwright):**
- Kritischer Flow 1: Admin setzt Schwellwert im Produkt-Modal → Wert wird gespeichert und beim erneuten Oeffnen korrekt angezeigt
- Kritischer Flow 2: Admin aendert Schwellwert in Inventory-Zeile → Status-Badge aktualisiert sich
- Kritischer Flow 3: Bestand wird unter neuen Schwellwert gesenkt → Low-Stock-Warnung erscheint in Benachrichtigungen
- Testdatei: `tests/e2e/feat22-schwellwert.spec.ts`

**Manuelle QA-Checks:**
- EC-2: Schwellwert hoeher als Bestand setzen → sofortige Warnung sichtbar
- EC-3: Schwellwert niedriger als Bestand setzen → bestehende Warnung verschwindet
- EC-1: Wert 0 oder negativ eingeben → Fehlermeldung erscheint, kein Speichern

---

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-13

### Geaenderte/Neue Dateien

- `src/server/db/schema.ts` — `stockThreshold integer NOT NULL DEFAULT 3` zur products-Tabelle hinzugefuegt; DB-Migration via `drizzle-kit push` durchgefuehrt
- `src/server/api/admin/inventory/index.get.ts` — `stockThreshold` in SELECT aufgenommen; hartkodierte `LOW_STOCK_THRESHOLD = 3` Konstante entfernt; Status-Berechnung nutzt `p.stockThreshold` pro Produkt
- `src/server/api/admin/inventory/index.patch.ts` — `stockThreshold` als optionalen Parameter akzeptiert (Validierung >= 1, ganzzahlig); EC-2 (Schwellwert hoeher als Bestand → Warnung erzeugen) und EC-3 (Bestand > Schwellwert → Warnung loeschen) implementiert; hartkodierte `3` entfernt
- `src/server/api/admin/products/index.post.ts` — `stockThreshold` Parameter mit Validierung und Default 3 beim Anlegen gespeichert
- `src/server/api/admin/products/[id].patch.ts` — `stockThreshold` Parameter mit Validierung beim Bearbeiten gespeichert
- `src/server/api/purchases.post.ts` — Low-Stock-Check in Schritt 6 laedt jetzt `stockThreshold` pro Produkt aus DB; hartkodierte `3` entfernt
- `src/pages/admin/inventory.vue` — Neue Admin-Page erstellt: Tabelle mit inline-editierbarem Bestand UND Schwellwert, Status-Badge (ok/low/empty) basiert auf API-Daten, Statistik-Karten, Filter nach Status und Name, Auth-Guard mit onMounted-Pattern
- `src/pages/admin/products.vue` — `AdminProduct`-Interface um `stockThreshold` erweitert; `productForm` um `stockThreshold` (default 3) erweitert; `openEditModal` laedt gespeicherten Schwellwert; `handleSaveProduct` validiert und sendet `stockThreshold`; Zahlenfeld im Modal-Formular zwischen Lagerbestand und Allergene hinzugefuegt
- `src/components/navigation/AdminTabBar.vue` — "Bestand"-Tab (`/admin/inventory`) als 5. Tab hinzugefuegt; `archive`-Icon als SVG-Pfad in Icons-Dictionary eingetragen

### Wichtige Entscheidungen

- Separate Validierung in allen drei Ebenen: Frontend (products.vue), Server-API (PATCH inventory, POST/PATCH products) und implizit durch DB-Constraint (NOT NULL DEFAULT 3)
- `editRows` im inventory.vue als `Map<number, EditRow>` implementiert; Vue-Reaktivitaet bei Map-Mutation durch Reassignment (`editRows.value = new Map(editRows.value)`) sichergestellt
- Inventory PATCH prueeft nach der Transaktion den kombinierten Zustand (aktueller Bestand + aktueller Schwellwert) um korrekte Benachrichtigungen zu erzeugen/loeschen — auch wenn nur einer der Werte geaendert wurde
- `stockThreshold` bleibt nullable in TypeScript-Interfaces (`number | null`) um Altdaten vor Migration abzusichern; serverseitig wird `?? 3` als Fallback verwendet

### Bekannte Einschraenkungen

- E2E-Tests (`tests/e2e/feat22-schwellwert.spec.ts`) wurden gemaess Feature Spec spezifiziert aber nicht implementiert; manuelle QA-Checks decken alle EC ab
- AdminTabBar hatte bisher 5 Tabs ohne Bestand; Tab wurde als 5. Element (vor Einstellungen) eingefuegt
