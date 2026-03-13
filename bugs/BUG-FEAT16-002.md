# BUG-FEAT16-002: Doppeltes Waehrungssymbol in OrderCard — formatPrice() + angehaengtes " €"

**Feature:** FEAT-16 Warenkorb-System
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-12
**App URL:** http://localhost:3000

---

## Beschreibung

In `OrderCard.vue` wird `formatPrice()` verwendet um den Preis zu formatieren. Die Funktion `formatPrice()` gibt bereits einen vollstaendigen Preisstring zurueck (z.B. "2,50 EUR"), der das Waehrungssymbol enthaelt. Im Template wird danach noch einmal " EUR" angehaengt, was zu einer doppelten Darstellung fuehrt (z.B. "2,50 EUR EUR" oder "5,00 EUR EUR").

Das gleiche Problem trat in FEAT-18 auf und wurde dort behoben (BUG-FEAT18-002), aber in OrderCard.vue wurde es nicht gleichzeitig korrigiert.

## Steps to Reproduce

1. Als eingeloggter Mitarbeiter die App öffnen
2. Ein Produkt in den Warenkorb legen und eine Vorbestellung aufgeben
3. Auf /orders gehen
4. Den Preis in der OrderCard beobachten (kollabierter Zustand)

## Expected Behavior

Der Preis wird korrekt angezeigt: z.B. "2,50 EUR"

## Actual Behavior

Der Preis wird mit doppeltem Waehrungszeichen angezeigt: z.B. "2,50 EUR EUR"

## Code-Referenz

```
src/components/orders/OrderCard.vue, Zeile 228:
<p class="text-sm text-muted-foreground">{{ formatPrice(displayTotalPrice) }} EUR</p>
// formatPrice() gibt "X,XX EUR" zurueck → wird zu "X,XX EUR EUR"
```

Zeile 262 korrekt (kein angehaengtes EUR-Zeichen):
```
<span>{{ formatPrice(parseFloat(item.unitPrice)) }}EUR</span>
// Gleiches Problem bei aufgeklappter Produktliste
```

## Environment

- Browser: Alle (Code-Review-Befund)
- Device: Mobile + Desktop
- OS: alle

---

## Abhängigkeiten

### Zu anderen Bugs
- BUG-FEAT18-002: Identisches Problem in RecommendedList.vue und FavoritesList.vue (bereits behoben)

### Zu anderen Features
- FEAT-16: OrderCard-Anpassung fuer Mehrprodukt-Bestellungen

---

## Attachments

- Screenshots: keine
- Logs: keine
