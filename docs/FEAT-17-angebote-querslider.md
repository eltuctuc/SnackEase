# Angebote-Querslider

**Feature-ID:** FEAT-17
**Status:** Implementiert
**Getestet am:** 2026-03-09

---

## Zusammenfassung

Der Angebote-Querslider zeigt auf dem Mitarbeiter-Dashboard direkt unterhalb der Guthaben-Karte alle aktuell aktiven Produktangebote als horizontal scrollbare Karten an. Mitarbeiter koennen Angebote auf einen Blick entdecken und Produkte direkt aus dem Slider in den Warenkorb legen — ohne den Produktkatalog durchsuchen zu muessen.

---

## Was wurde gemacht

### Hauptfunktionen

- Horizontaler Slider mit Angebots-Produktkarten auf dem Dashboard
- Jede Karte zeigt Produktbild, Produktname, Angebotspreis und ein Rabatt-Badge ("-20%" oder "-0,50 EUR")
- Direktkauf: Warenkorb-Button auf jeder Karte legt Produkt sofort in den Warenkorb
- Detail-Ansicht: Klick auf die Kartenflaeche oeffnet das Produkt-Detail-Modal mit durchgestrichenem Originalpreis
- Slider blendet sich vollstaendig aus wenn keine aktiven Angebote vorhanden sind
- Responsive: Mobile 2,5 Karten / Tablet 3,5 Karten / Desktop vollstaendiges Grid
- Skeleton-Loader verhindert Layout-Shift beim Laden
- Nur fuer Mitarbeiter sichtbar — Admins sehen keinen Slider

### Benutzer-Flow

1. Mitarbeiter oeffnet die App und landet auf dem Dashboard
2. Slider "Aktuelle Angebote" erscheint unterhalb der Guthaben-Karte
3. Auf Mobile sind 2 Karten vollstaendig sichtbar, die dritte leicht angeschnitten (Scroll-Signal)
4. Mitarbeiter sieht Produktbild, Name, Angebotspreis und Rabatt-Badge auf jeder Karte
5. Variante A — Schnellkauf: Warenkorb-Button klicken → Produkt direkt im Warenkorb, kein Modal
6. Variante B — Details lesen: Auf Kartenflaeche klicken → Detail-Modal mit vollstaendigen Infos und durchgestrichenem Originalpreis
7. Horizontal scrollen um weitere Angebote zu sehen

---

## Wie es funktioniert

### Fuer Benutzer

Auf dem Dashboard sehen Mitarbeiter direkt unter dem Guthaben-Bereich einen Bereich mit der Ueberschrift "Aktuelle Angebote". Dort erscheinen Produktkarten fuer alle Produkte die gerade im Sonderangebot sind. Jede Karte zeigt:

- Das Produktbild (oder ein Platzhalter-Icon wenn kein Bild hinterlegt ist)
- Den Produktnamen (bei langen Namen abgeschnitten)
- Den guenstigeren Angebotspreis
- Ein rotes Badge das den Rabatt anzeigt (z.B. "-20%" oder "-0,50 EUR")
- Einen Warenkorb-Button am unteren Kartenrand

Der Slider scrollt horizontal auf dem Smartphone per Finger-Wischen, auf dem Desktop per Maus. Auf groesseren Bildschirmen werden alle Karten als Grid angezeigt ohne scrollen zu muessen.

Wenn keine Angebote aktiv sind, verschwindet der ganze Slider-Bereich und das Dashboard sieht wie gewohnt aus.

### Technische Umsetzung

Das Feature besteht aus zwei neuen Vue-Komponenten:

**OffersSlider.vue** — Wrapper-Komponente die:
- Alle Produkte clientseitig auf solche mit `activeOffer !== null` filtert
- Den Slider-Container mit nativem CSS (overflow-x + scroll-snap) rendert
- Einen Skeleton-Loader waehrend des Ladens anzeigt
- Sich vollstaendig ausblendet wenn keine Angebote vorhanden sind

**OfferSliderCard.vue** — Einzelne Karte die:
- Produktbild mit Fallback-Platzhalter zeigt
- Das Rabatt-Badge berechnet (Prozent oder absoluter Betrag)
- `open-detail`-Event bei Karten-Klick emittiert
- `add-to-cart`-Event bei Warenkorb-Button-Klick emittiert (mit event.stopPropagation)
- Vollstaendige ARIA-Attribute fuer Barrierefreiheit hat

Beide Komponenten sind in `dashboard.vue` eingebunden. Der Slider liest Daten aus dem bestehenden Produkt-Store — kein neuer API-Endpunkt. Der Angebotspreis wird clientseitig nur fuer die Anzeige verwendet; beim Checkout berechnet der Server den Preis neu (Sicherheit gegen Preis-Manipulation).

**Verwendete Technologien:**
- Vue 3 Composition API + `<script setup>` + TypeScript
- Tailwind CSS (responsive Breiten via calc(), xl:grid-cols-4)
- Natives CSS scroll-snap (kein JS-Carousel)
- Pinia Stores (useProductsStore, useCartStore)
- Teenyicons (cart.svg inline als SVG)

---

## Screenshots

Wireframe-Referenz: `resources/high-fidelity/produkte.png` zeigt den Angebote-Bereich direkt unterhalb der Guthaben-Anzeige.

---

## Abhaengigkeiten

- FEAT-14 (Angebote & Rabatte) — `product_offers`-Tabelle und `activeOffer`-Feld in GET /api/products
- FEAT-15 (App-Navigationstruktur) — Dashboard-Layout mit Header/Footer
- FEAT-16 (Warenkorb-System) — `cartStore.addItem()`-Funktion fuer den Warenkorb-Button

---

## Getestet

- Acceptance Criteria: Alle 10 bestanden
- Edge Cases: Alle 7 bestanden
- Unit-Tests: 31 Tests (15 OfferSliderCard + 16 OffersSlider), alle bestanden
- E2E-Tests (FEAT-17): 7 Tests, alle bestanden
- E2E-Tests (Gesamt): 51 von 70 bestanden, 19 bewusst geskippt, 0 fehlgeschlagen
- Cross-Browser: Chromium (via Playwright)
- Responsive: Mobile calc-Breiten / Desktop Grid implementiert
- Accessibility: WCAG 2.1 AA — ARIA-Labels, role="region", focus-visible, min. 44px Touch-Targets
- Security: Keine neuen API-Endpunkte, Preisberechnung serverseitig beim Checkout
- Regression: Keine — BUG-FEAT17-001 behoben und verifiziert

---

## Offene Punkte

- Kein Toast-Feedback nach Warenkorb-Aktion — nur Badge-Counter im Header aendert sich (bewusste Entscheidung laut Tech-Design; kann in Folge-Feature durch Toast-System ergaenzt werden)
- Keine Pfeil-Navigation im Slider bei Desktop (bewusste Entscheidung: Desktop nutzt Grid statt Slider)

## Naechste Schritte

- FEAT-18 (Empfehlungen & Favoriten) — OfferSliderCard.vue koennte wiederverwendet werden
- FEAT-19 (Erweiterte Suche) — Naehrwertfilter fuer Lucas (Gesundheitsfan) adressieren

---

## Kontakt

Bei Fragen zu diesem Feature: Developer Agent / QA Engineer Agent
