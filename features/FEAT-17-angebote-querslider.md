# FEAT-17: Angebote-Querslider

## Status: Planned

## Abhaengigkeiten
- Benoetigt: FEAT-14 (Angebote & Rabatte) — `product_offers`-Tabelle und `activeOffer`-Feld in GET /api/products muss existieren
- Benoetigt: FEAT-15 (App-Navigationstruktur) — Dashboard-Layout mit neuem Header/Footer muss existieren
- Benoetigt: FEAT-16 (Warenkorb-System) — "In den Warenkorb"-Funktion muss existieren
- Integriert in: `src/pages/dashboard.vue` — direkt unterhalb von `BalanceCard.vue`

---

## 1. Uebersicht

**Beschreibung:** Auf dem Mitarbeiter-Dashboard wird unterhalb des Guthabenbereichs ein horizontaler Querslider eingeblendet, der alle aktuell aktiven Angebote anzeigt. Jede Karte zeigt Produktbild, Produktname, Angebotspreis und ein Rabatt-Badge. Ein Klick auf die Karte oeffnet das `ProductDetailModal` (wo der Originalpreis durchgestrichen angezeigt wird). Direkt auf der Karte gibt es ausserdem einen "In den Warenkorb"-Button. Gibt es keine aktiven Angebote, wird der Slider vollstaendig ausgeblendet — keine Leer-Sektion.

**Ziel:** Aktive Angebote prominent und aufmerksamkeitsstark auf dem Dashboard praesentieren, damit Mitarbeiter sie sofort entdecken und davon profitieren koennen.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich auf dem Dashboard auf einen Blick sehen, welche Produkte gerade im Angebot sind, damit ich keine guenstigen Angebote verpasse | Mitarbeiter | Must-Have |
| US-2 | Als Mitarbeiter moechte ich den Slider horizontal scrollen koennen, um alle laufenden Angebote durchzublaettern | Mitarbeiter | Must-Have |
| US-3 | Als Mitarbeiter moechte ich auf eine Angebots-Karte tippen koennen, um das Produkt-Detail-Modal mit vollem Preisvergleich (Originalpreis durchgestrichen + Angebotspreis) zu oeffnen | Mitarbeiter | Must-Have |
| US-4 | Als Mitarbeiter moechte ich ein Produkt direkt aus dem Slider per Button in den Warenkorb legen koennen, ohne zuvor das Detail-Modal oeffnen zu muessen | Mitarbeiter | Must-Have |
| US-5 | Als Mitarbeiter moechte ich, dass der Slider gar nicht erscheint wenn keine Angebote aktiv sind, damit das Dashboard sauber und aufgeraumt bleibt | Mitarbeiter | Must-Have |

---

## 3. Funktionale Anforderungen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Der Slider wird nur angezeigt, wenn mindestens ein Produkt ein aktiv laufendes Angebot hat (`isActive === true AND startsAt <= NOW AND expiresAt > NOW`) | Must-Have |
| REQ-2 | Der Slider zeigt 2,5 Karten gleichzeitig — 2 vollstaendig sichtbar, die dritte angeschnitten als visueller Hinweis auf weitere Inhalte | Must-Have |
| REQ-3 | Jede Karte zeigt: Produktbild (quadratisch, abgerundete Ecken), Produktname, Angebotspreis und ein Rabatt-Badge (z.B. "-20%" oder "-0,50 EUR") | Must-Have |
| REQ-4 | Auf jeder Karte befindet sich ein "In den Warenkorb"-Button (Warenkorb-Icon aus Teenyicons 1.0) | Must-Have |
| REQ-5 | Klick auf die Karte (nicht auf den Button) oeffnet `ProductDetailModal` mit dem jeweiligen Produkt — das Modal zeigt Originalpreis durchgestrichen + Angebotspreis | Must-Have |
| REQ-6 | Klick auf den "In den Warenkorb"-Button legt das Produkt in den Warenkorb (1x) ohne Modal zu oeffnen | Must-Have |
| REQ-7 | Der Slider hat einen Abschnittstitel, z.B. "Aktuelle Angebote" | Must-Have |
| REQ-8 | Daten werden aus dem bereits vorhandenen GET /api/products-Endpunkt gelesen (kein neuer API-Endpoint noetig) — gefiltert auf Produkte mit `activeOffer !== null` | Must-Have |
| REQ-9 | Alle Icons ausschliesslich aus Teenyicons 1.0 (npm-Paket `teenyicons`) | Must-Have |

---

## 4. Acceptance Criteria

- [ ] AC-1: Slider erscheint auf `/dashboard` unterhalb von `BalanceCard.vue`, wenn mindestens ein aktives Angebot existiert
- [ ] AC-2: Slider ist bei null aktiven Angeboten vollstaendig unsichtbar (kein leerer Abschnitt, kein Placeholder-Text)
- [ ] AC-3: Genau 2,5 Karten sind gleichzeitig sichtbar — Scrollrichtung ist horizontal, vertikal wird nicht gescrollt
- [ ] AC-4: Jede Karte zeigt Produktbild, Produktname, Angebotspreis und Rabatt-Badge korrekt an
- [ ] AC-5: Klick auf Karte (Kartenflaeche) oeffnet `ProductDetailModal` mit Originalpreis durchgestrichen
- [ ] AC-6: Klick auf den Warenkorb-Button legt Produkt in den Warenkorb und oeffnet kein Modal
- [ ] AC-7: Rabatt-Badge zeigt Prozent-Rabatte als "-X%" und absolute Rabatte als "-X,XX EUR" an
- [ ] AC-8: Slider-Daten werden clientseitig aus GET /api/products gefiltert — kein separater API-Call
- [ ] AC-9: Alle Icons stammen aus Teenyicons 1.0
- [ ] AC-10: Slider funktioniert auf Mobilgeraeten per Touch-Swipe und auf Desktop per Maus-Scroll/Drag

---

## 5. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Genau 1 aktives Angebot | Slider zeigt 1 Karte, kein Anschnitt — kein horizontales Scrollen moeglich |
| EC-2 | Genau 2 aktive Angebote | Slider zeigt 2 Karten vollstaendig, kein Anschnitt — kein Scrollen noetig |
| EC-3 | Angebot laeuft waehrend der Sitzung ab | Nach naechstem API-Refresh (Seitenreload oder Polling) verschwindet die Karte aus dem Slider; laeuft das letzte Angebot ab, verschwindet der gesamte Slider |
| EC-4 | Produkt ohne Bild hat ein aktives Angebot | Platzhalter-Bild wird angezeigt (analoges Verhalten wie im Produktkatalog) |
| EC-5 | "In den Warenkorb"-Button geklickt waehrend Guthaben nicht ausreicht | Button fuehrt Aktion aus (Warenkorb-Logik aus FEAT-16 entscheidet), kein Sondverhalten im Slider selbst |
| EC-6 | Sehr langer Produktname | Name wird abgeschnitten (1-2 Zeilen max., CSS `line-clamp`) |
| EC-7 | Sehr viele aktive Angebote (z.B. 20+) | Slider scrollt durch alle Karten; keine Paginierung, nur freies horizontales Scrollen |

---

## 6. Komponenten

| Komponente | Beschreibung |
|------------|--------------|
| `src/components/dashboard/OffersSlider.vue` | Wrapper-Komponente: laedt gefilterte Angebots-Produkte, rendert Slider-Container und Titel, blendet sich aus wenn keine Angebote vorhanden |
| `src/components/dashboard/OfferSliderCard.vue` | Einzelne Angebots-Karte: Bild, Name, Preis, Badge, Warenkorb-Button — emittiert `open-detail` und `add-to-cart` Events |

Die Komponente `src/components/dashboard/ProductDetailModal.vue` wird unveraendert wiederverwendet.

---

## 7. Technische Anforderungen

- Kein neuer API-Endpoint — Daten kommen aus dem bestehenden GET /api/products (bereits mit `activeOffer`-Feld nach FEAT-14)
- Slider-Scrollverhalten: natives CSS `overflow-x: auto` mit `scroll-snap-type: x mandatory` (kein JS-Carousel-Plugin)
- Kartenbreite: ca. `calc((100% - X px) / 2.5)` sodass exakt 2,5 Karten sichtbar sind
- Icons: ausschliesslich Teenyicons 1.0 (`teenyicons` npm-Paket)

---

## 8. Abhaengigkeiten von bestehender Architektur

- `src/pages/dashboard.vue` — `OffersSlider.vue` wird nach `BalanceCard.vue` eingefuegt
- `src/components/dashboard/BalanceCard.vue` — bleibt unveraendert, Slider folgt darunter
- `src/components/dashboard/ProductDetailModal.vue` — wird unveraendert wiederverwendet
- `src/server/api/products/index.get.ts` — muss `activeOffer`-Feld zurueckgeben (nach FEAT-14 implementiert)
- Warenkorb-Store (FEAT-16) — `addToCart(product)`-Funktion wird vom Slider-Button aufgerufen
