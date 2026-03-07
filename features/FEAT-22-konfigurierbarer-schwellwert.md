# FEAT-22: Konfigurierbarer Nachbestellschwellwert

## Status: Planned

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
