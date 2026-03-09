# FEAT-17: Angebote-Querslider

## Status: Implemented

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
| REQ-2 | Der Slider ist responsiv: auf Mobilgeraeten werden 2,5 Karten gleichzeitig angezeigt (2 vollstaendig + Anschnitt als Scroll-Signal). Ab Tablet (768px+) werden 3,5 Karten angezeigt. Ab Desktop (1280px+) werden alle Angebots-Karten in einem Grid dargestellt (kein Slider-Scroll mehr, sondern vollstaendige Uebersicht, z.B. 4 Karten pro Zeile). | Must-Have |
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
- [ ] AC-3: Das Layout ist responsiv — auf Mobile (< 768px) sind 2,5 Karten sichtbar (horizontaler Scroll), auf Tablet (768px–1279px) 3,5 Karten (horizontaler Scroll), auf Desktop (1280px+) werden alle Karten als Grid ohne Scroll angezeigt (4 Karten pro Zeile)
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
- Slider-Scrollverhalten (Mobile/Tablet): natives CSS `overflow-x: auto` mit `scroll-snap-type: x mandatory` (kein JS-Carousel-Plugin)
- Kartenbreite responsiv per Tailwind-Breakpoints:
  - Mobile (< 768px): `calc((100% - Abstand) / 2.5)` — 2,5 Karten sichtbar
  - Tablet (768px–1279px): `calc((100% - Abstand) / 3.5)` — 3,5 Karten sichtbar
  - Desktop (1280px+): Grid-Layout, kein `overflow-x`, 4 Karten pro Zeile (oder weniger wenn weniger Angebote vorhanden)
- Icons: ausschliesslich Teenyicons 1.0 (`teenyicons` npm-Paket)

---

## 8. Abhaengigkeiten von bestehender Architektur

- `src/pages/dashboard.vue` — `OffersSlider.vue` wird nach `BalanceCard.vue` eingefuegt
- `src/components/dashboard/BalanceCard.vue` — bleibt unveraendert, Slider folgt darunter
- `src/components/dashboard/ProductDetailModal.vue` — wird unveraendert wiederverwendet
- `src/server/api/products/index.get.ts` — muss `activeOffer`-Feld zurueckgeben (nach FEAT-14 implementiert)
- Warenkorb-Store (FEAT-16) — `addToCart(product)`-Funktion wird vom Slider-Button aufgerufen

---

## 9. UX Design

### Wireframe-Abgleich

Das Wireframe `resources/high-fidelity/produkte.png` zeigt den "Angebote"-Bereich direkt unterhalb der Guthaben-Anzeige — exakt die Position, die FEAT-17 vorschreibt. Die zwei nebeneinander angezeigten Karten decken sich mit REQ-2 (2,5 Karten sichtbar). Das Moodboard (`resources/moodboard.png`) bestaetigt das Kartenlayout mit Produktbild links und Name/Preis rechts.

Diskrepanz: Das Wireframe zeigt keine angeschnittene dritte Karte und zeigt nur die mobile Ansicht. REQ-2 fordert bewusst 2,5 sichtbare Karten auf Mobile als etabliertes Scroll-Signal (Affordance). Auf Desktop wird stattdessen ein vollstaendiges Grid gezeigt — kein Slider-Scrollen, da der Platz ausreicht, alle Karten darzustellen. Kein Klaerungsbedarf.

### Personas-Abdeckung

| Persona | Profitiert | Begruendung |
|---------|-----------|-------------|
| Nina Neuanfang (24, neu) | Hoch | Der Slider bietet ihr einen niedrigschwelligen Einstieg: Angebote sind sofort sichtbar ohne aktive Suche. Kein Wissen ueber den Produktkatalog notwendig — die App zeigt, was gerade guenstig ist. |
| Maxine Snackliebhaber (32, Stammkundin) | Sehr hoch | Maxine will ihr Guthaben optimal einsetzen. Der Slider zeigt ihr auf einem Blick, welche Lieblingsprodukte gerade reduziert sind — spart Suchzeit und unterstuetzt bewusste Kaufentscheidungen. |
| Lucas Gesundheitsfan (28, ernährungsbewusst) | Mittel | Lucas profitiert wenn Gesundheitsprodukte im Angebot sind. Der Slider zeigt ihm Angebote, aber ohne Naehrwertfilter ist die Relevanz fuer ihn eingeschraenkt. Klick auf die Karte oeffnet das Modal mit vollstaendigen Produktinfos — das genuegt als Bruecke. |
| Alex Gelegenheitskaeufer (40) | Sehr hoch | Alex hat wenig Zeit. Der Slider ermoeglicht einen Impulskauf in zwei Schritten: Angebot sehen -> direkt in den Warenkorb. Das ist maximale Effizienz fuer gelegentliche Nutzer. |
| Tom Schnellkaeufer (35) | Sehr hoch | Toms Kernbeduerfnis ist Geschwindigkeit. Der "In den Warenkorb"-Button direkt auf der Karte (ohne Modal-Umweg) erfuellt dieses Beduerfnis optimal. |
| Mia Entdeckerin (27) | Hoch | Mia erkundet gerne neue Funktionen. Der Slider ist ein neues UI-Pattern im Dashboard — sie wird ihn aktiv nutzen und entdecken. |
| Sarah Teamkapitaen / Martin Meeting (45/37) | Mittel | Bei Team-Bestellungen koennen Angebote helfen, das Budget zu schonen. Direkter Mehrwert ist aber geringer als bei Einzelpersonen. |

### User Flow: Angebots-Querslider nutzen

**Akteur:** Maxine Snackliebhaber (stellvertretend fuer alle Mitarbeiter)
**Ziel:** Ein Angebot entdecken und in den Warenkorb legen

#### Hauptflow: Direktkauf aus dem Slider

```
1. Maxine oeffnet die App — Splashscreen erscheint kurz, dann Dashboard
2. Dashboard laedt — BalanceCard zeigt aktuelles Guthaben (z.B. 18,50 EUR)
3. Slider "Aktuelle Angebote" erscheint direkt darunter
   - 2 vollstaendige Karten sichtbar, 3. Karte angeschnitten = Scroll-Signal
4. Maxine erkennt ein bekanntes Produkt im Angebot
   - Karte zeigt: Produktbild | Produktname | Angebotspreis | Rabatt-Badge ("-20%")
5. Maxine tippt auf den Warenkorb-Button der Karte
   - Produkt (1x) wird in den Warenkorb gelegt
   - Kein Modal oeffnet sich
   - Visuelles Feedback (z.B. kurze Animation am Warenkorb-Icon im Header)
6. Maxine scrollt horizontal weiter, sieht weitere Angebote
7. Bei Interesse an einem weiteren Produkt: Schritt 5 wiederholen
8. Maxine wechselt zur "Kaufen"-Tab um Warenkorb abzuschliessen
```

#### Alternativflow: Detail-Ansicht vor Kauf

```
1-4. Wie Hauptflow
5b. Maxine kennt das Produkt nicht gut genug — sie tippt auf die Kartenflaeche
    - ProductDetailModal oeffnet sich
    - Originalpreis durchgestrichen + Angebotspreis klar sichtbar
    - Produktbeschreibung und weitere Informationen einsehbar
6b. Maxine entscheidet sich: "In den Warenkorb" im Modal oder Modal schliessen
```

#### Fehler-Flow: Keine aktiven Angebote

```
1. Maxine oeffnet Dashboard
2. GET /api/products liefert keine Produkte mit activeOffer != null
3. OffersSlider.vue blendet sich vollstaendig aus — keine leere Sektion
4. Dashboard zeigt direkt die Empfehlungen/Produktliste darunter
5. Kein Hinweis auf "momentan keine Angebote" — sauberes Layout
```

#### Fehler-Flow: Angebot laeuft waehrend Sitzung ab

```
1. Maxine sieht Angebots-Karte
2. Angebot laeuft serverseitig ab (Cron-Job)
3. Naechster Seitenreload: Karte verschwindet aus Slider
4. War es das letzte Angebot: gesamter Slider verschwindet
5. Kein Fehler — nahtloser Uebergang
```

### Layout-Struktur Dashboard (mit FEAT-17)

**Mobile (< 768px) — Slider mit 2,5 Karten:**
```
┌─────────────────────────────────────┐
│ Header: "SnackEase"  [Warenkorb-Icon] │
├─────────────────────────────────────┤
│ BalanceCard                            │
│ Guthaben: 18,50 EUR  [====----]        │
├─────────────────────────────────────┤
│ Aktuelle Angebote                      │  <- Abschnittstitel (REQ-7)
│ ┌──────────┐ ┌──────────┐ ┌──────── │
│ │ [Bild]   │ │ [Bild]   │ │ [Bi     │  <- 2,5 Karten, horizontal scrollbar
│ │ Name     │ │ Name     │ │ Nam     │
│ │ 2,50 EUR │ │ 1,80 EUR │ │ ...     │
│ │ -20%     │ │ -0,50EUR │ │         │
│ │ [Korb]   │ │ [Korb]   │ │ [Ko     │
│ └──────────┘ └──────────┘ └──────── │
├─────────────────────────────────────┤
│ Produktliste / Empfehlungen            │
└─────────────────────────────────────┘
```

**Desktop (1280px+) — vollstaendiges Grid, kein Scroll:**
```
┌──────────────────────────────────────────────────────────────────┐
│ Header: "SnackEase"                             [Warenkorb-Icon]  │
├──────────────────────────────────────────────────────────────────┤
│ BalanceCard                                                        │
├──────────────────────────────────────────────────────────────────┤
│ Aktuelle Angebote                                                  │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│ │ [Bild]   │  │ [Bild]   │  │ [Bild]   │  │ [Bild]   │          │
│ │ Name     │  │ Name     │  │ Name     │  │ Name     │          │
│ │ 2,50 EUR │  │ 1,80 EUR │  │ 3,00 EUR │  │ 0,90 EUR │          │
│ │ -20%     │  │ -0,50EUR │  │ -15%     │  │ -10%     │          │
│ │ [Korb]   │  │ [Korb]   │  │ [Korb]   │  │ [Korb]   │          │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
├──────────────────────────────────────────────────────────────────┤
│ Produktliste / Empfehlungen                                        │
└──────────────────────────────────────────────────────────────────┘
```

### Accessibility-Pruefung (WCAG 2.1)

| Kriterium | Status | Massnahme in Spec / Empfehlung |
|-----------|--------|-------------------------------|
| 1.1.1 Nicht-Text-Inhalt (A) | Warnung | Produktbilder benoetigen `alt`-Attribut mit Produktname. EC-4 (Platzhalter-Bild) muss ebenfalls `alt` haben (z.B. "Produktbild nicht verfuegbar"). Empfehlung: In OfferSliderCard.vue `alt`-Prop als Pflichtfeld definieren. |
| 1.3.1 Info und Beziehungen (A) | Warnung | Rabatt-Badge muss semantisch als Zusatzinfo erkennbar sein, nicht nur visuell. Empfehlung: `<span aria-label="20 Prozent Rabatt">-20%</span>` oder aequivalente ARIA-Beschriftung. |
| 1.4.1 Verwendung von Farbe (A) | Erfuellt | Rabatt-Badge kommuniziert Rabatt nicht nur durch Farbe — der Prozentwert/-Betrag ist als Text sichtbar (REQ-3, AC-7). |
| 1.4.3 Kontrast (Minimum) (AA) | Zu pruefen | Moodboard zeigt ein helles Blau (#C5D5E8 ca.) als Hintergrund und dunklen Text. Kontrast muss >= 4.5:1 fuer Normaltext sein. Rabatt-Badge-Farbe (im Wireframe orangerot/dunkelrot) gegen hellen Hintergrund muss geprueft werden. Empfehlung: Farbwerte aus Tailwind-Theme explizit gegenprufen. |
| 1.4.4 Textgroesse (AA) | Empfehlung | Kartentext muss mindestens 14-16px sein. Bei mobiler Karte mit ~120px Breite (2.5er-Split) ist die verfuegbare Textbreite eng — line-clamp (EC-6) verhindert Overflow, aber die Mindestschriftgroesse muss gewahrt bleiben. |
| 2.1.1 Tastatur (A) | Warnung | Horizontales Slider-Scrollen per Tastatur muss moeglich sein. Native CSS-Scroll-Snap unterstuetzt Arrow-Keys im Browser bei korrektem `tabindex` und `role`. Empfehlung: Slider-Container `role="region"` mit `aria-label="Aktuelle Angebote"`, Karten per Tab fokussierbar. |
| 2.1.3 Tastatur (ohne Ausnahmen) (AAA) | Optional | Nicht Pflicht fuer AA-Konformitaet, aber empfohlen: Arrow-Key-Navigation innerhalb des Sliders. |
| 2.4.3 Fokus-Reihenfolge (A) | Warnung | Bei horizontalem Slider kann die Tab-Reihenfolge verwirrend sein. Empfehlung: Fokus laeuft linear von Karte 1 zu Karte N, dann weiter im DOM — kein Fokus-Trap. |
| 2.4.6 Ueberschriften und Beschriftungen (AA) | Erfuellt | Abschnittstitel "Aktuelle Angebote" (REQ-7) dient als visueller und semantischer Anker. Empfehlung: Als `<h2>` oder `<h3>` je nach DOM-Hierarchie rendern, nicht als `<div>`. |
| 2.5.3 Bezeichnung im zugaenglichen Namen (A) | Warnung | Warenkorb-Button zeigt nur ein Icon (REQ-4). Empfehlung: `aria-label="[Produktname] in den Warenkorb legen"` — damit ist der Button auch ohne visuellen Kontext verstaendlich. |
| 2.5.5 Zielgroesse (AA, WCAG 2.2) | Erfuellt | Touch-Target fuer Warenkorb-Button muss >= 44x44px sein (WCAG 2.1 Empfehlung, WCAG 2.2 AA 24x24px Minimum). Bei kompakter Kartengroesse sicherstellen, dass der Button ausreichend Padding hat. Empfehlung: mindestens 44x44px Touchflaeche per CSS padding. |
| 3.1.1 Sprache der Seite (A) | Erfuellt | Gesamte App ist auf Deutsch — kein spezifischer Handlungsbedarf fuer diesen Slider. |
| 3.3.1 Fehlererkennung (A) | Nicht anwendbar | Der Slider hat kein Formular, keine Nutzereingabe ausser Touch/Click. |
| 4.1.2 Name, Rolle, Wert (A) | Warnung | Interaktive Elemente (Karte als Klickflaeche, Warenkorb-Button) muessen korrekte ARIA-Rollen haben. Empfehlung: Karte als `<button>` oder `role="button"` mit korrektem `aria-label="[Produktname] — Angebot anzeigen"` rendern. |

**Gesamtbewertung:** Die Spec ist grundsaetzlich WCAG-2.1-AA-konform umsetzbar. Folgende Punkte muessen bei der Implementation explizit adressiert werden, da die Spec sie noch nicht vorschreibt:

1. `alt`-Attribute fuer alle Produktbilder (Pflicht)
2. `aria-label` fuer Warenkorb-Button mit Produktname (Pflicht)
3. Slider-Container mit `role="region"` und `aria-label` (Pflicht)
4. Abschnittstitel als semantisches Heading-Element (Empfehlung)
5. Tastatur-Fokus und Tab-Reihenfolge testen (Empfehlung)

### UX-Empfehlungen fuer den Solution Architect

1. **Scroll-Affordance und responsives Layout sicherstellen:** Die 2,5-Karten-Regel (REQ-2) gilt nur auf Mobile. Auf Tablet wechselt auf 3,5 Karten, auf Desktop (1280px+) auf ein vollstaendiges Grid (kein Scroll). Der Kartenbreiten-Calc muss per Tailwind-Breakpoints gesteuert werden. Empfehlung: Padding-Trick statt calc() fuer den Scroll-Anschnitt — `padding-right: [Kartenbreite * 0.5]` am Container-Ende (nur Mobile/Tablet).

2. **Warenkorb-Feedback:** Wenn der User den Warenkorb-Button drueckt (REQ-6), benoetigt er sofortiges Feedback. Empfehlung: Kurze Bounce-Animation des Warenkorb-Icons im Header oder ein "Hinzugefuegt"-Toast fuer 1,5 Sekunden. Ohne Feedback ist die Interaktion fuer Tom (Schnellkaeufer) und Alex (Gelegenheitskaeufer) unklar.

3. **Ladestate:** Beim initialen Dashboard-Load muessen die Slider-Karten einen Skeleton-Loader zeigen (nicht einfach leer bleiben). Verhindert Layout-Shift (CLS-Problem) und kommuniziert, dass Daten geladen werden.

4. **EC-1 / EC-2 (1-2 Angebote):** Bei nur 1 oder 2 Karten keinen leeren Weissraum rechts lassen. Empfehlung: Slider-Container links-ausgerichtet bleiben, keine Zentrierung versuchen — das Wireframe zeigt links-buendige Karten.

5. **Lucas (Gesundheitsfan) — Pain Point nicht geloest:** Der Slider zeigt keine Naehrwertinfos auf der Karte. Das ist bewusst (Platz), aber Lucas muss durch einen Tap auf die Karte ins Modal. Empfehlung: Im Modal soll die Naehrwert-Sektion prominent sein — das ist bereits im Produktdetail-Wireframe angelegt und kein FEAT-17-Scope, aber relevant fuer FEAT-19 (Erweiterte Suche).

### Fazit UX-Validierung

Die Feature-Spec FEAT-17 ist solide und gut auf die Personas ausgerichtet. Die staerksten Nutzniesser sind Tom (Schnellkaeufer), Alex (Gelegenheitskaeufer) und Maxine (Stammkundin). Nina (Neuanfang) profitiert von der Entdeckbarkeit ohne Vorwissen.

Offene UX-Luecken, die in der Spec erwaehnt, aber nicht spezifiziert sind:
- Visuelles Feedback nach Warenkorb-Aktion fehlt in den Acceptance Criteria (empfehle AC-11 ergaenzen)
- Skeleton-Loader beim Laden fehlt in den Requirements (empfehle REQ-10 ergaenzen)
- ARIA-Labels fuer interaktive Elemente fehlen in den technischen Anforderungen (empfehle Ergaenzung in Abschnitt 7)

Diese Luecken sind keine Blocker, sollten aber beim Solution Architect und in den QA-Checks adressiert werden.

---

## 10. Tech-Design (Solution Architect)

### Geprueft: Bestehende Architektur

Vor dem Design wurden folgende bestehende Strukturen analysiert:

**Wiederverwendbare Komponenten:**
- `src/components/offers/OfferBadge.vue` — zeigt aktuell nur "Angebot aktiv" (generisch). Fuer den Slider benoetigen wir den konkreten Rabattwert ("-20%" oder "-0,50 EUR"). Diese Komponente wird NICHT wiederverwendet — `OfferSliderCard.vue` berechnet und zeigt das Badge direkt.
- `src/components/dashboard/ProductDetailModal.vue` — wird unveraendert wiederverwendet. Das Modal erhaelt das volle Produkt-Objekt inkl. `activeOffer`-Feld. Der Developer muss pruefen, ob das Modal den Originalpreis bereits durchgestrichen darstellt — falls nicht, ist eine kleine Erweiterung des Modals notig (kein neuer Scope, da das Modal das Produktobjekt komplett kennt).

**Bestehende Daten-Infrastruktur:**
- `src/stores/products.ts` — `productsStore.products` enthaelt nach `fetchProducts()` bereits alle Produkte mit `activeOffer: {...} | null`. Der Slider filtert clientseitig — kein zusaetzlicher API-Call noetig.
- `src/stores/cart.ts` — `addItem(product, quantity)` ist die Funktion zum Hinzufuegen (nicht `addToCart`). Der Developer muss das Produkt-Objekt in das `CartItem`-Format mappen (productId, name, price, image).
- `src/pages/dashboard.vue` — laedt Produkte bereits via `productsStore.fetchProducts()` beim `onMounted`. Die `OffersSlider.vue`-Komponente kann direkt auf `productsStore.products` zugreifen — kein doppelter API-Call.

**Wichtiger Befund — Admin-Sichtbarkeit:**
Die Dashboard-Page rendert fuer Admins und Mitarbeiter. Der Angebote-Slider darf NUR fuer Mitarbeiter (nicht Admins) sichtbar sein. Die `OffersSlider.vue`-Komponente wird in `dashboard.vue` mit `v-if="!authStore.isAdmin"` umschlossen — analog zum bestehenden Pattern bei `BalanceCard.vue`.

---

### Component-Struktur

```
src/pages/dashboard.vue (bestehend, minimal erweitert)
├── BalanceCard.vue (bestehend, unveraendert)
├── OffersSlider.vue (NEU) — nur fuer Mitarbeiter, nicht fuer Admins
│   ├── Abschnittstitel "Aktuelle Angebote" (semantisches Heading)
│   ├── Slider-Container (horizontales Scroll-Wrapper, native CSS)
│   │   └── OfferSliderCard.vue (NEU) — fuer jedes Angebot-Produkt
│   │       ├── Produktbild (quadratisch, abgerundete Ecken, Platzhalter bei fehlendem Bild)
│   │       ├── Rabatt-Badge (z.B. "-20%" oder "-0,50 EUR")
│   │       ├── Produktname (max. 2 Zeilen, abgeschnitten per CSS)
│   │       ├── Angebotspreis (hervorgehoben)
│   │       └── Warenkorb-Button (Teenyicons-Icon, mit aria-label)
│   └── Skeleton-Loader (waehrend Produkte noch laden — 3 graue Karten)
└── ProductGrid.vue (bestehend, unveraendert)

Wiederverwendet (unveraendert):
└── src/components/dashboard/ProductDetailModal.vue
```

**Sichtbarkeitslogik von `OffersSlider.vue`:**

```
Wird vollstaendig ausgeblendet wenn:
- Kein Mitarbeiter eingeloggt (Admin-View)
- productsStore noch laedt (zeigt Skeleton)
- Keine Produkte mit activeOffer !== null vorhanden (EC-1 Sonderfall: auch 1 Karte zeigt keinen Anschnitt)
```

---

### Daten-Modell

Es werden keine neuen Datenbanktabellen oder API-Endpunkte benoetigt.

**Angebots-Produkte (clientseitig gefiltert):**

Der `productsStore` haelt nach dem bestehenden `fetchProducts()`-Aufruf alle Produkte. `OffersSlider.vue` filtert diese Liste clientseitig:

```
Jedes Angebots-Produkt hat (bereits vorhanden durch FEAT-14):
- id (Produkt-ID)
- name (Produktname)
- price (Originalpreis in Cent oder Dezimal)
- imageUrl (optionales Bild, kann null sein)
- activeOffer (Objekt mit):
  - discountType ("percentage" oder "absolute")
  - discountValue (Rabattwert, z.B. 20 fuer 20% oder 0.50 fuer 50 Cent)
  - startsAt (Startzeit)
  - expiresAt (Ablaufzeit)
  - isActive (boolean)
```

**Berechnung des Rabatt-Badges (clientseitig in `OfferSliderCard.vue`):**

```
Wenn discountType = "percentage":
  Badge zeigt: "-[discountValue]%"  (z.B. "-20%")

Wenn discountType = "absolute":
  Badge zeigt: "-[discountValue] EUR"  (z.B. "-0,50 EUR")

Angebotspreis = Originalpreis minus Rabatt (Berechnung wie in src/server/utils/offers.ts)
```

**Wichtig:** Der Server gibt `activeOffer` nur zurueck, wenn das Angebot serverseitig aktiv ist (`isActive = true AND startsAt <= NOW AND expiresAt > NOW`). Die clientseitige Filterung prueft nur `product.activeOffer !== null`.

---

### Tech-Entscheidungen

**Warum kein neuer API-Endpunkt?**
Die Angebots-Daten sind bereits im `GET /api/products`-Response enthalten (FEAT-14). Ein separater Endpunkt wuerden einen zweiten API-Call erzeugen und doppelte Server-Last bedeuten. Clientseitige Filterung ist hier der richtige Ansatz.

**Warum natives CSS-Scrollen statt einer Carousel-Library?**
Eine Carousel-Library (z.B. Swiper.js) wuerde eine neue Abhaengigkeit einfuehren, die Performance kostet und Zugaenglichkeit verkompliziert. Natives `overflow-x: auto` mit `scroll-snap-type: x mandatory` und `scroll-snap-align: start` auf den Karten liefert:
- Perfektes Touch-Scrollen auf iOS und Android (nativ unterstuetzt)
- Desktop-Maus-Scroll und -Drag funktioniert im Browser ohne JS
- Tastatur-Navigation via Tab funktioniert automatisch
- Kein zusaetzliches JavaScript, kein Bundle-Overhead

**Warum 2,5 Karten auf Mobile, Grid auf Desktop?**
Das halbe Anschneiden der dritten Karte ist ein etabliertes mobiles UX-Pattern (Scroll-Affordance) — auf dem kleinen Display signalisiert es, dass weitere Inhalte scrollen. Auf Desktop gibt es genuegend Platz, alle Angebotskarten gleichzeitig zu zeigen. Ein Slider-Scrollen auf Desktop waere ungewohnt und versteckt Inhalte unnoetig. Das Grid-Layout auf Desktop ist die bessere Wahl: uebersichtlich, kein versteckter Inhalt, keine awkward Scroll-Interaktion mit der Maus.

**Kartenbreiten-Berechnung:**
- Mobile: `calc((100% - [Abstand]) / 2.5)` — Slider mit overflow-x
- Tablet: `calc((100% - [Abstand]) / 3.5)` — Slider mit overflow-x
- Desktop (1280px+): Grid mit `grid-cols-4` (oder weniger wenn < 4 Angebote vorhanden)

Bei 1-2 Angeboten (EC-1, EC-2) auf Mobile/Tablet scrollen keine weiteren Karten — die vorhandenen werden links-buendig angezeigt ohne leeren Weissraum.

**Warum Skeleton-Loader?**
Waehrend `productsStore.isLoading = true` wuerde der Slider kurz fehlen und dann erscheinen — ein Layout-Shift (CLS). Drei graue Skeleton-Karten verhindern das und kommunizieren, dass Inhalte geladen werden. Das ist analog zum bestehenden Skeleton-Pattern in `dashboard.vue`.

**Warum `OfferSliderCard.vue` separat und nicht in `OffersSlider.vue` inline?**
Trennbarkeit und Testbarkeit. Die Karte hat eigene Logik (Badge-Berechnung, Event-Emission, Bild-Fallback). Als separate Komponente kann sie isoliert getestet werden. Ausserdem ermoeglicht es spaetere Wiederverwendung (z.B. in FEAT-18 Empfehlungen).

**Warum kein eigenes Composable fuer den Slider?**
Der Slider hat keine komplexe State-Logik — er filtert nur `productsStore.products` und leitet Events weiter. Ein eigenes Composable waere Overengineering. Die Filterung passiert als computed property direkt in `OffersSlider.vue`.

**Feedback nach Warenkorb-Aktion:**
Laut UX-Design (Abschnitt 9, UX-Empfehlung 2) benoetigt der User sofortiges Feedback. Die Implementierung nutzt den bestehenden `cartStore.itemCount` — der Warenkorb-Icon-Badge im `UserHeader.vue` aendert sich automatisch, da er reaktiv an `itemCount` gebunden ist. Kein zusaetzlicher Toast notig, aber der Developer kann optional einen kurzen Bounce-Effekt am Header-Icon ergaenzen.

---

### Dependencies

Keine neuen Packages erforderlich. Alle benoetigen Mittel sind bereits vorhanden:

```
Bereits installiert und verwendbar:
- teenyicons (Warenkorb-Icon auf der Karte)
- Pinia + useProductsStore (Datenquelle)
- Pinia + useCartStore (addItem-Funktion)
- Tailwind CSS (Styling, Scroll-Snap via Utility-Klassen oder direkte CSS-Properties)
```

---

### Integration in dashboard.vue

Die Dashboard-Page benoetigt folgende minimale Erweiterungen:

```
Neue Importe:
- OffersSlider.vue

Neuer Event-Handler:
- handleOfferCardClick(product) — setzt selectedProductDetail + oeffnet ProductDetailModal
  (analog zu bestehendem handleProductClick)

Template-Erweiterung:
- OffersSlider wird zwischen BalanceCard und ProductGrid eingefuegt
- Nur sichtbar wenn authStore.isAdmin === false
- Uebergibt: products (aus productsStore), isLoading (aus productsStore)
- Empfaengt: open-detail-Event, add-to-cart-Event
```

---

### Test-Anforderungen

#### Unit-Tests (Vitest)

Zu testende Einheit: `OffersSlider.vue` (als Komponenten-Test)

| Test | Beschreibung |
|------|--------------|
| Slider-Ausblendung | Slider ist nicht sichtbar wenn keine Produkte mit activeOffer vorhanden |
| Slider-Anzeige | Slider zeigt korrekte Anzahl Karten wenn Angebote vorhanden |
| Filterlogik | Nur Produkte mit activeOffer !== null werden als Karten gerendert |
| Skeleton | Skeleton-Karten werden angezeigt waehrend isLoading === true |

Zu testende Einheit: `OfferSliderCard.vue` (als Komponenten-Test)

| Test | Beschreibung |
|------|--------------|
| Badge Prozent | Bei discountType "percentage" zeigt Badge "-X%" |
| Badge Absolut | Bei discountType "absolute" zeigt Badge "-X,XX EUR" |
| Bild-Fallback | Karte zeigt Platzhalter wenn imageUrl null ist |
| Event open-detail | Klick auf Kartenflaeche emittiert open-detail mit Produkt |
| Event add-to-cart | Klick auf Warenkorb-Button emittiert add-to-cart, kein open-detail |
| Name-Clamp | Langer Produktname wird nach 2 Zeilen abgeschnitten (visuell per CSS) |

Ziel-Coverage: 80%+ fuer neue Komponenten

Testpfade:
- `tests/components/dashboard/OffersSlider.test.ts`
- `tests/components/dashboard/OfferSliderCard.test.ts`

#### E2E-Tests (Playwright)

Kritische User-Flows:

| Flow | Beschreibung |
|------|--------------|
| Slider sichtbar | Dashboard zeigt Slider wenn aktive Angebote existieren |
| Slider unsichtbar | Dashboard zeigt keinen Slider wenn keine Angebote vorhanden |
| Warenkorb-Button | Klick auf Warenkorb-Button erhoeht Warenkorb-Zaehler im Header |
| Karten-Klick | Klick auf Kartenflaeche oeffnet ProductDetailModal |
| Modal-Inhalt | Modal zeigt Produktname und Preisinformationen korrekt |
| Kein Modal bei Button | Warenkorb-Button-Klick oeffnet kein Modal |

Browser: Chromium (Standard)
Testpfad: `tests/e2e/offers-slider.spec.ts`

#### Test-Daten-Anforderung

Fuer E2E-Tests muss mindestens ein Produkt mit einem aktiven Angebot in der Test-Datenbank vorhanden sein. Der Developer prueft, ob die bestehende Test-Daten-Fixtures dieses abdecken oder ob eine Ergaenzung noetig ist.

---

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-09

### Geaenderte/Neue Dateien

- `src/components/dashboard/OfferSliderCard.vue` — NEU: Einzelne Angebots-Karte mit Badge-Berechnung, Bild-Fallback, Events (open-detail, add-to-cart), ARIA-Attribute, Teenyicons cart.svg inline
- `src/components/dashboard/OffersSlider.vue` — NEU: Wrapper-Komponente mit Filterlogik (activeOffer !== null), responsivem Slider (Mobile 2,5 / Tablet 3,5 / Desktop Grid), Skeleton-Loader, ARIA region
- `src/pages/dashboard.vue` — Erweitert: OffersSlider eingebunden (nur fuer Mitarbeiter, v-if="!authStore.isAdmin"), handleOfferCardClick + handleAddToCartFromSlider Handler, useCartStore Import
- `src/components/dashboard/ProductDetailModal.vue` — Minimal erweitert: Originalpreis durchgestrichen + Angebotspreis wenn activeOffer vorhanden
- `tests/components/dashboard/OfferSliderCard.test.ts` — NEU: 15 Unit-Tests (Badge, Bild-Fallback, Events, ARIA)
- `tests/components/dashboard/OffersSlider.test.ts` — NEU: 16 Unit-Tests (Filterlogik, Skeleton, ARIA, Event-Weiterleitung)
- `tests/e2e/offers-slider.spec.ts` — NEU: 7 E2E-Tests (Slider sichtbar, Warenkorb-Button, Modal, Admin-Guard)

### Wichtige Entscheidungen

- **Explizite Vue-Imports in Komponenten:** `computed` aus 'vue' und `useFormatter` aus '~/composables/useFormatter' werden explizit importiert, damit die Komponenten im Vitest-Test-Kontext ohne Nuxt Auto-Imports funktionieren. Im Nuxt-Produktivbetrieb haben explizite Imports Vorrang vor Auto-Imports — kein Unterschied im Verhalten.
- **Angebotspreis im Warenkorb:** `handleAddToCartFromSlider` in dashboard.vue nutzt `activeOffer.discountedPrice` als Preis fuer den CartStore. Der Server berechnet den Endpreis beim Checkout nochmals serverseitig — clientseitige Preisangabe ist nur fuer die Warenkorb-Anzeige.
- **OfferBadge.vue nicht wiederverwendet:** Wie im Tech-Design vorgesehen berechnet `OfferSliderCard.vue` das Badge direkt, da der benoetate Rabattwert-Text von OfferBadge.vue nicht unterstuetzt wird.
- **Scroll-Affordance:** Kein Padding-Trick noetig — die Tailwind `calc()`-Breiten erzeugen automatisch den Anschnitt der n+1. Karte als Scroll-Signal.
- **E2E-Test-Daten:** Der E2E-Test erstellt via Admin-API ein Angebot falls keines existiert, damit die Tests reproduzierbar sind. Falls das API-Setup fehlschlaegt, werden die abhaengigen Tests mit `test.skip()` uebersprungen.

### Bekannte Einschraenkungen

- Der Slider nutzt keine Paginierung — bei sehr vielen Angeboten (EC-7: 20+) ist freies horizontales Scrollen moeglich, aber keine Navigation per Pfeil-Buttons.
- Kein Toast-Feedback nach "In den Warenkorb" -- das Badge-Counter-Update im UserHeader (reaktiv an cartStore.itemCount) ist das einzige Feedback wie im Tech-Design vorgesehen.
