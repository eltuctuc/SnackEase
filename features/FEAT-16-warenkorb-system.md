# FEAT-16: Warenkorb-System

## Status: Planned

## Abhaengigkeiten
- Benoetigt: FEAT-15 (App-Navigationstruktur) — Header mit Warenkorb-Icon und Badge-Platzhalter muss bereits existieren
- Benoetigt: FEAT-6 (Produktkatalog) — Produkte muessen abrufbar sein
- Loest ab: FEAT-7 (One-Touch Kauf) — der bisherige Sofort-Kauf wird vollstaendig durch den Warenkorb-Flow ersetzt
- Voraussetzung fuer: FEAT-20 (Profil) — Bestellverlauf (abgeholte Bestellungen) wird dort angezeigt

---

## 1. Uebersicht

**Beschreibung:** Mitarbeiter koennen Produkte in einen Warenkorb legen, Mengen anpassen und anschliessend eine Vorbestellung aufgeben. Eine Vorbestellung umfasst alle Produkte des Warenkorbs als eine Einheit mit einem einzigen Abholcode (PIN). Das Guthaben wird erst beim Abholen am Automaten abgezogen — nicht bei der Vorbestellung. Der Warenkorb-Inhalt wird im localStorage gespeichert und bleibt ueber Seitenreloads hinweg erhalten.

**Ziel:** Den bisherigen One-Touch-Kauf durch einen durchdachten Warenkorb-Flow ersetzen, der mehrere Produkte pro Bestellung ermoeglicht, flexibler ist und das Guthaben erst beim echten Abholen belastet.

**Kernprinzip — Guthaben-Zeitpunkt:**
- Vorbestellung aufgeben = kein Guthaben-Abzug
- Produkte am Automaten abholen = Guthaben wird abgezogen
- Bestellung laeuft ab ohne Abholung = verfaellt einfach, kein Refund noetig

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich ein Produkt per Tap in meinen Warenkorb legen, damit ich mehrere Produkte auf einmal vorbestellen kann | Mitarbeiter | Must-Have |
| US-2 | Als Mitarbeiter moechte ich die Menge eines Produkts im Warenkorb erhoehen oder verringern (+/- Buttons), damit ich z.B. 2x Cola bestellen kann | Mitarbeiter | Must-Have |
| US-3 | Als Mitarbeiter moechte ich ein Produkt vollstaendig aus dem Warenkorb entfernen koennen | Mitarbeiter | Must-Have |
| US-4 | Als Mitarbeiter moechte ich im Header sehen, wie viele Artikel sich in meinem Warenkorb befinden (Badge am Warenkorb-Icon) | Mitarbeiter | Must-Have |
| US-5 | Als Mitarbeiter moechte ich meinen Warenkorb auf der Vorbestellungsseite (/orders) uebersichtlich sehen (Produkte, Mengen, Einzelpreise, Gesamtpreis), damit ich vor der Bestellung pruefen kann, was ich bestelle | Mitarbeiter | Must-Have |
| US-6 | Als Mitarbeiter moechte ich den Warenkorb per Tap auf das Icon im Header direkt erreichen (Weiterleitung zu /orders) | Mitarbeiter | Must-Have |
| US-7 | Als Mitarbeiter moechte ich per "Vorbestellung aufgeben"-Button alle Produkte im Warenkorb als eine Bestellung aufgeben und dabei einen einzigen Abholcode (PIN) erhalten | Mitarbeiter | Must-Have |
| US-8 | Als Mitarbeiter moechte ich nach der Vorbestellung sofort den Abholcode (PIN) und den Countdown sehen, damit ich weiss wann meine Bestellung ablaeuft | Mitarbeiter | Must-Have |
| US-9 | Als Mitarbeiter moechte ich meine aktiven Vorbestellungen (pending_pickup) auf der /orders-Seite sehen, mit Countdown und Abholoptionen (NFC oder PIN) | Mitarbeiter | Must-Have |
| US-10 | Als Mitarbeiter moechte ich, dass mein Warenkorb nach einer erfolgreichen Vorbestellung automatisch geleert wird | Mitarbeiter | Must-Have |
| US-11 | Als Mitarbeiter moechte ich sehen, wie viel Guthaben meine aktuelle Bestellung kosten wird (Gesamtpreis im Warenkorb), damit ich weiss ob mein Guthaben ausreicht | Mitarbeiter | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Warenkorb: Produkte hinzufuegen (Produktkatalog)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Auf jeder Produktkarte gibt es eine Schaltflaeche "In den Warenkorb" (bzw. ein "+"-Icon), mit der das Produkt in den Warenkorb gelegt wird | Must-Have |
| REQ-2 | Wenn das Produkt bereits im Warenkorb ist, zeigt die Produktkarte stattdessen +/- Buttons zur Mengenaenderung direkt auf der Karte | Must-Have |
| REQ-3 | Beim Hinzufuegen eines Produkts wird die Menge um 1 erhoeht (nicht durch einen neuen Eintrag) | Must-Have |
| REQ-4 | Das Warenkorb-Badge im Header aktualisiert sich sofort reaktiv beim Hinzufuegen/Entfernen | Must-Have |
| REQ-5 | Produkte mit Bestand 0 (ausverkauft) koennen nicht in den Warenkorb gelegt werden — der Hinzufuegen-Button ist deaktiviert | Must-Have |

### 3.2 Warenkorb: Persistenz

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-6 | Der Warenkorb wird im localStorage des Browsers gespeichert (Key: `snackease_cart_[userId]`) | Must-Have |
| REQ-7 | Der Warenkorb bleibt nach einem Seitenreload erhalten | Must-Have |
| REQ-8 | Der Warenkorb ist User-spezifisch: Beim User-Wechsel (User Switcher, FEAT-3) wird der Warenkorb des neuen Users geladen | Must-Have |
| REQ-9 | Nach einem erfolgreichen Checkout (Vorbestellung aufgeben) wird der Warenkorb im localStorage geleert | Must-Have |
| REQ-10 | Beim Ausloggen wird der Warenkorb aus dem localStorage entfernt | Must-Have |

### 3.3 Vorbestellungsseite (/orders): Warenkorb-Sektion

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-11 | Die /orders-Seite hat eine dedizierte "Warenkorb"-Sektion oben auf der Seite | Must-Have |
| REQ-12 | Wenn der Warenkorb leer ist, zeigt die Sektion einen Hinweistext ("Dein Warenkorb ist leer") und einen Link zum Produktkatalog | Must-Have |
| REQ-13 | Wenn der Warenkorb Produkte enthaelt, werden diese als Liste angezeigt: Produktname, Menge, Einzelpreis, Zeilengesamtpreis | Must-Have |
| REQ-14 | Der Gesamtpreis aller Produkte im Warenkorb wird unten in der Warenkorb-Sektion angezeigt | Must-Have |
| REQ-15 | Jede Zeile hat +/- Buttons zur Mengenaenderung und einen "Entfernen"-Button | Must-Have |
| REQ-16 | Ein "Vorbestellung aufgeben"-Button loest den Checkout aus (disabled wenn Warenkorb leer) | Must-Have |
| REQ-17 | Wenn der Gesamtpreis das verfuegbare Guthaben des Users uebersteigt, wird eine Warnung angezeigt ("Guthaben moeglicherweise nicht ausreichend") — der Button bleibt aktiv, da das Guthaben erst beim Abholen abgezogen wird | Must-Have |

### 3.4 Checkout: Vorbestellung aufgeben

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-18 | Der Checkout erstellt eine einzige Bestellung (eine Zeile in `purchases`) mit allen Produkten des Warenkorbs (n:m-Verknuepfung ueber `purchase_items`) | Must-Have |
| REQ-19 | Die Bestellung erhaelt einen generierten 4-stelligen PIN als Abholcode | Must-Have |
| REQ-20 | Die Bestellung erhaelt einen Ablauf-Zeitstempel (expiresAt) — Zeitraum wird vom Solution Architect definiert (analog zu FEAT-11) | Must-Have |
| REQ-21 | Der Abholstandort (pickupLocation) wird bei der Vorbestellung gesetzt — Logik analog zu bestehendem FEAT-11 | Must-Have |
| REQ-22 | Nach erfolgreichem Checkout wird der Warenkorb geleert und die neue Bestellung erscheint sofort in der "Aktive Vorbestellungen"-Sektion | Must-Have |
| REQ-23 | Waehrend des Checkout-Vorgangs ist der Button disabled und zeigt einen Ladezustand | Must-Have |
| REQ-24 | Das Guthaben wird beim Checkout NICHT abgezogen — der Abzug erfolgt erst beim Abholen am Automaten | Must-Have |

### 3.5 Vorbestellungsseite (/orders): Aktive Vorbestellungen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-25 | Unterhalb der Warenkorb-Sektion gibt es eine Sektion "Aktive Vorbestellungen" | Must-Have |
| REQ-26 | Angezeigt werden alle Bestellungen des eingeloggten Users mit Status `pending_pickup` | Must-Have |
| REQ-27 | Jede Bestellung zeigt: Liste der bestellten Produkte (Name + Menge), Gesamtpreis, Abholcode (PIN), Countdown bis Ablauf, NFC- und PIN-Abholbuttons | Must-Have |
| REQ-28 | Die bestehenden Komponenten OrderCard.vue, PinInputModal.vue, NfcPickupAnimation.vue und useCountdown.ts werden wiederverwendet und auf die neue Mehrprodukt-Struktur angepasst | Must-Have |
| REQ-29 | Wenn keine aktiven Vorbestellungen vorhanden sind, zeigt die Sektion einen entsprechenden Hinweistext | Must-Have |
| REQ-30 | Abgelaufene oder stornierte Bestellungen erscheinen NICHT in dieser Sektion (Cron-Job entfernt sie wie bisher) | Must-Have |

### 3.6 Guthaben-Abzug beim Abholen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-31 | Das Guthaben des Users wird erst beim Abholvorgang (POST /api/orders/[id]/pickup) abgezogen | Must-Have |
| REQ-32 | Wenn das Guthaben zum Abholzeitpunkt nicht ausreicht, wird die Abholung abgelehnt mit Fehlermeldung ("Guthaben nicht ausreichend") | Must-Have |
| REQ-33 | Der Cron-Job storniert abgelaufene Bestellungen — kein Refund noetig (da kein Guthaben abgezogen wurde) | Must-Have |

### 3.7 Abloesung von FEAT-7 (One-Touch Kauf)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-34 | Der bisherige "Sofort kaufen"-Button auf Produktkarten wird durch "In den Warenkorb" ersetzt | Must-Have |
| REQ-35 | Die direkte Kauflogik in POST /api/purchases (sofortiger Guthaben-Abzug) wird durch den neuen Warenkorb-Checkout ersetzt | Must-Have |

---

## 4. Datenmodell (Anforderungen — Design obliegt Solution Architect)

### 4.1 Neue Tabelle: purchase_items (n:m zwischen purchases und products)

Die bestehende `purchases`-Tabelle speichert eine Bestellung als Einheit. Jede Bestellung kann mehrere Produkte enthalten. Dafuer wird eine neue Verknuepfungstabelle benoetigt:

```
Tabelle: purchase_items
- id (serial, PK)
- purchaseId (FK -> purchases.id, ON DELETE CASCADE)
- productId (FK -> products.id)
- quantity (integer, >= 1)
- unitPrice (decimal) — Preis zum Bestellzeitpunkt (mit aktivem Angebot, falls vorhanden)
- createdAt (timestamp)
```

### 4.2 Anpassung: purchases-Tabelle

Die bestehende `purchases`-Tabelle muss angepasst werden:

```
Anpassungen an purchases:
- Das bisherige Feld `productId` (Einzelprodukt) entfaellt oder wird durch purchase_items ersetzt
- Neues Feld: `totalPrice` (decimal) — Gesamtpreis aller Produkte zum Bestellzeitpunkt
- Guthaben-Abzug-Logik: Verlagerung von purchases.post.ts zu orders/[id]/pickup.post.ts
- Cron-Job-Refund-Logik entfaellt (kein Guthaben abgezogen -> kein Refund noetig)
```

**Hinweis:** Das genaue Schema-Design und die Migration obliegen dem Solution Architect.

### 4.3 Warenkorb: Client-seitige Datenstruktur (localStorage)

```typescript
// Key: snackease_cart_[userId]
interface CartItem {
  productId: number
  name: string
  price: number        // Preis zum Zeitpunkt des Hinzufuegens (inkl. Angebot falls aktiv)
  quantity: number
  imageUrl?: string
}

type Cart = CartItem[]
```

**Hinweis:** Der Preis im Warenkorb ist ein Anzeigewert. Der verbindliche Preis wird serverseitig beim Checkout berechnet.

---

## 5. Acceptance Criteria

- [ ] AC-1: Ein Mitarbeiter kann ein Produkt per Tap in den Warenkorb legen
- [ ] AC-2: Dasselbe Produkt kann mehrfach hinzugefuegt werden — die Menge erhoeht sich (kein doppelter Eintrag)
- [ ] AC-3: Das Warenkorb-Badge im Header zeigt die korrekte Gesamtanzahl an Artikeln (Summe aller Mengen)
- [ ] AC-4: Das Badge zeigt keine "0" an — es verschwindet wenn der Warenkorb leer ist
- [ ] AC-5: Der Warenkorb bleibt nach einem Browser-Reload erhalten (localStorage)
- [ ] AC-6: Nach einem User-Wechsel zeigt der Header den Warenkorb des neuen Users
- [ ] AC-7: Die /orders-Seite zeigt eine "Warenkorb"-Sektion mit allen Produkten, Mengen und dem Gesamtpreis
- [ ] AC-8: In der Warenkorb-Sektion koennen Mengen per +/- angepasst werden
- [ ] AC-9: Ein Produkt kann aus dem Warenkorb entfernt werden
- [ ] AC-10: Der "Vorbestellung aufgeben"-Button ist deaktiviert wenn der Warenkorb leer ist
- [ ] AC-11: Nach Tap auf "Vorbestellung aufgeben" wird eine Bestellung erstellt — der Warenkorb wird geleert
- [ ] AC-12: Die neue Bestellung erscheint sofort in der "Aktive Vorbestellungen"-Sektion mit PIN und Countdown
- [ ] AC-13: Das Guthaben des Users wird beim Checkout NICHT abgezogen
- [ ] AC-14: Das Guthaben wird beim Abholvorgang (NFC oder PIN) abgezogen
- [ ] AC-15: Wenn das Guthaben zum Abholzeitpunkt nicht ausreicht, wird die Abholung abgelehnt
- [ ] AC-16: Aktive Vorbestellungen zeigen: Produktliste, Menge, Gesamtpreis, PIN, Countdown, Abholbuttons
- [ ] AC-17: Abgelaufene Bestellungen erscheinen nicht in der "Aktive Vorbestellungen"-Sektion
- [ ] AC-18: Stornierte Bestellungen erscheinen nicht auf der /orders-Seite
- [ ] AC-19: Ausverkaufte Produkte (Bestand 0) koennen nicht in den Warenkorb gelegt werden
- [ ] AC-20: Beim Ausloggen wird der Warenkorb aus dem localStorage entfernt

---

## 6. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | User legt ein Produkt in den Warenkorb, das bis zum Checkout ausverkauft wird | Checkout-API prueft Bestand serverseitig; Fehlermeldung: "Produkt [Name] ist nicht mehr verfuegbar" |
| EC-2 | User hat 5 Einheiten eines Produkts im Warenkorb, aber nur 3 sind auf Lager | Checkout-API prueft Bestand; Fehlermeldung mit Hinweis auf verfuegbare Menge |
| EC-3 | User hat unzureichendes Guthaben bei der Abholung | Abholung wird abgelehnt, Bestellung bleibt aktiv (User kann spaeteren Zeitpunkt versuchen oder Bestellung verfaellt) |
| EC-4 | User gibt zwei Vorbestellungen kurz hintereinander auf | Beide Bestellungen sind unabhaengig mit je eigenem PIN — beide erscheinen in der Aktive-Vorbestellungen-Sektion |
| EC-5 | Produkt im Warenkorb erhaelt ein neues Angebot nach dem Hinzufuegen | Der im localStorage gespeicherte Preis ist nur Anzeige — serverseitig wird beim Checkout der aktuelle Preis berechnet |
| EC-6 | Produkt im Warenkorb hat sein Angebot verloren (Preis gestiegen) | Serverseitig wird beim Checkout der aktuelle Normalpreis verwendet; Warenkorb-Anzeige kann veraltet sein — eine Warnung ist optional |
| EC-7 | User loescht den Browser-Cache / localStorage manuell | Warenkorb geht verloren — akzeptiertes Verhalten, kein Fehler |
| EC-8 | User switcht zu anderem User (FEAT-3) mit gefuelltem Warenkorb | Aktueller Warenkorb wird gespeichert; der Warenkorb des neuen Users wird geladen |
| EC-9 | Warenkorb enthaelt ein Produkt, das inzwischen vom Admin geloescht wurde | Checkout-API prueft Produkt-Existenz; Fehlermeldung: "Produkt [Name] ist nicht mehr im Sortiment" |
| EC-10 | Cron-Job storniert eine abgelaufene Bestellung waeread User auf /orders schaut | Bestellung verschwindet beim naechsten Polling-Intervall aus der Aktive-Vorbestellungen-Sektion (reaktiv) |
| EC-11 | User hat aktive Vorbestellung und gibt erneut eine Vorbestellung auf | Erlaubt — mehrere parallele Vorbestellungen sind moeglich; alle erscheinen in der Sektion |
| EC-12 | Warenkorb enthaelt nur ein Produkt, Menge wird auf 0 reduziert (via "-"-Button) | Produkt wird automatisch aus dem Warenkorb entfernt |

---

## 7. Validierungsregeln

| Feld | Regel |
|------|-------|
| Menge pro Produkt | Mindestens 1, Maximum: verfuegbarer Bestand (serverseitig geprueft beim Checkout) |
| Warenkorb-Groesse | Kein hartes Limit im MVP — serverseitig wird Bestand geprueft |
| Guthaben beim Checkout | Keine Validierung noetig (Abzug erst bei Abholung) |
| Guthaben bei Abholung | Muss >= totalPrice der Bestellung sein |
| Produktverfuegbarkeit | Serverseitig beim Checkout geprueft (nicht nur clientseitig) |

---

## 8. API Endpoints

| Endpoint | Methode | Beschreibung | Auth |
|----------|---------|--------------|------|
| `/api/orders` | GET | Aktive Bestellungen des eingeloggten Users (pending_pickup) — bestehend, wird angepasst um purchase_items zu inkludieren | User |
| `/api/purchases` | POST | Warenkorb-Checkout: erstellt Bestellung mit allen Produkten, KEIN Guthaben-Abzug | User |
| `/api/orders/[id]/pickup` | POST | Abholung per NFC oder PIN — Guthaben-Abzug erfolgt hier | User |

**Wichtige Aenderungen gegenueber FEAT-7/FEAT-11:**

```
POST /api/purchases (neu):
- Input: { items: [{ productId, quantity }][], pickupLocation }
- Bestandspruefung fuer alle Produkte (SELECT FOR UPDATE)
- Erstellt einen purchases-Eintrag + purchase_items-Eintraege
- Kein Guthaben-Abzug
- Output: { orderId, pickupPin, expiresAt, totalPrice, items[] }

POST /api/orders/[id]/pickup (angepasst):
- Guthaben-Abzug: user.balance -= order.totalPrice
- Bestandsabzug: product.stock -= item.quantity (fuer alle purchase_items)
- Prueft: Guthaben >= totalPrice
- Analog zu bestehendem Rate Limiting fuer PIN-Versuche
```

---

## 9. Pinia Store: useCartStore

Ein neuer Pinia Store verwaltet den Warenkorb-Zustand:

```typescript
// Verantwortlichkeiten (kein Code-Design — nur funktionale Anforderungen):
// - Warenkorb-Items laden aus localStorage beim App-Start
// - Items hinzufuegen, Menge erhoehen/verringern, entfernen
// - Gesamtanzahl-Getter (fuer Header-Badge)
// - Gesamtpreis-Getter (fuer Anzeige in /orders)
// - Warenkorb leeren (nach Checkout oder Logout)
// - Automatisches Persistieren in localStorage bei jeder Aenderung
// - User-gebundener Key: snackease_cart_[userId]
```

---

## 10. Betroffene Dateien (Bestandsanalyse)

### Zu aendernde bestehende Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/server/api/purchases/index.post.ts` | Vollstaendig umschreiben: Mehrprodukt-Checkout, kein Guthaben-Abzug |
| `src/server/api/orders/index.get.ts` | Erweitern: purchase_items mit zurueckgeben |
| `src/server/api/orders/[id]/pickup.post.ts` | Guthaben-Abzug und Bestandsabzug hierher verlagern |
| `src/server/plugins/cronJobs.ts` | Refund-Logik entfernen (kein Guthaben abgezogen) |
| `src/server/db/schema.ts` | Neue Tabelle purchase_items, Anpassung purchases |
| `src/pages/orders.vue` | Vollstaendig umbauen: Warenkorb-Sektion + Aktive-Vorbestellungen-Sektion |
| `src/components/orders/OrderCard.vue` | Anpassen fuer Mehrprodukt-Bestellungen |
| `src/components/navigation/UserHeader.vue` | Warenkorb-Badge an useCartStore binden (Platzhalter aus FEAT-15 befuellen) |
| `src/pages/dashboard.vue` | "Sofort kaufen"-Button ersetzen durch "In den Warenkorb" |

### Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/stores/cart.ts` | Pinia Store fuer Warenkorb (localStorage-Persistenz, User-gebunden) |
| `src/components/cart/CartItemRow.vue` | Zeile in Warenkorb-Sektion (Produktname, Menge +/-, Preis, Entfernen) |
| `src/components/cart/CartSummary.vue` | Warenkorb-Zusammenfassung (Gesamtpreis, Guthaben-Warnung, Checkout-Button) |

---

## 11. Architekturelle Anforderungen (fuer Solution Architect)

Die folgenden Punkte beduersen einer expliziten technischen Entscheidung durch den Solution Architect:

| Thema | Anforderung | Hinweis |
|-------|-------------|---------|
| DB-Schema | `purchase_items`-Tabelle und Anpassung `purchases` | Migration der bestehenden Daten beachten |
| Guthaben-Zeitpunkt | Verlagerung des Abzugs von purchases.post.ts nach pickup.post.ts | Bestehende Race-Condition-Logik (SELECT FOR UPDATE) muss erhalten bleiben |
| Bestandspruefung | Beim Checkout: alle Produkte in einer Transaktion pruefen und sperren | Analog zu bestehendem SELECT FOR UPDATE in FEAT-7 |
| Cron-Job | Refund-Logik entfernen — nur noch Stornierung abgelaufener Bestellungen | Kein Breaking Change fuer Bestellungen die bereits picked_up sind |
| localStorage-Schluessel | Format `snackease_cart_[userId]` oder alternative Strategie | User-Switcher (FEAT-3) muss korrekt funktionieren |

---

## 12. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| NFR-1 | Warenkorb-Badge aktualisiert sich reaktiv ohne Seitenreload (Pinia reaktiv) |
| NFR-2 | Checkout-API prueft Bestand und Produkt-Existenz serverseitig — keine reine Client-Validierung |
| NFR-3 | Preisberechnung erfolgt serverseitig beim Checkout — localStorage-Preise sind nur Anzeigewerte |
| NFR-4 | Race Conditions beim gleichzeitigen Checkout mehrerer User (Bestandspruefung) werden per SELECT FOR UPDATE verhindert |
| NFR-5 | Die Seite /orders bleibt responsiv: Mobile-First, Desktop nutzt mehr Platz (analog zu FEAT-15-Layout) |

---

## 13. Abgrenzung (Out of Scope fuer FEAT-16)

| Thema | Zustaendiges Feature |
|-------|---------------------|
| Bestellverlauf (abgeholte Bestellungen anzeigen) | FEAT-20 (Profil) |
| Verlauf stornierter Bestellungen | Nicht geplant (kein Guthaben abgezogen, kein Handlungsbedarf) |
| Produkt-Suche | FEAT-19 |
| Wiederholungsbestellung aus Verlauf | FEAT-20 oder spaeteres Feature |
| Angebots-Preise im Warenkorb (FEAT-14) | FEAT-14 muss mit FEAT-16 koordiniert werden — Solution Architect beruecksichtigt beide |
