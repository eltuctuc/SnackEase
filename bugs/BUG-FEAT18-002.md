# BUG-FEAT18-002: Doppeltes €-Zeichen in RecommendedList.vue und FavoritesList.vue

**Feature:** FEAT-18 Empfehlungen & Favoriten
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-12
**Behoben am:** 2026-03-12
**Status:** Behoben
**App URL:** http://localhost:3000

---

## Beschreibung

In den neuen FEAT-18-Komponenten `RecommendedList.vue` und `FavoritesList.vue` werden Preise mit doppeltem Euro-Zeichen angezeigt, z.B. "2,20 € €" statt "2,20 €".

Die Ursache ist, dass `useFormatter().formatPrice()` bereits ein Währungssymbol in die Ausgabe einbettet (via `Intl.NumberFormat` mit `style: 'currency'`), aber in den Templates ein zusätzliches ` €` angehängt wird:

```html
<!-- RecommendedList.vue Zeile 131, 133, 137 -->
{{ formatPrice(product.price) }} €
```

`formatPrice("2.20")` gibt `"2,20 €"` zurück, und das Template fügt ` €` hinzu → `"2,20 € €"`.

**Hinweis:** Dieser Bug existiert als Vorlage auch bereits in `ProductGrid.vue` (Pre-existing aus FEAT-14). FEAT-18 hat das fehlerhafte Pattern kopiert und in zwei neue Komponenten eingebracht.

## Auswirkung

Alle Preisanzeigen in RecommendedList und FavoritesList sind falsch formatiert. Nicht kritisch für Funktionalität, aber falsche Darstellung für alle Nutzer.

## Steps to Reproduce

1. Einloggen als Mitarbeiter
2. Dashboard öffnen
3. Tab "Favoriten" öffnen
4. Mindestens ein Produkt als Favorit hinzufügen
5. Preis der Favoriten-Karte anschauen → zeigt "2,50 € €"

Oder:
1. Empfohlen-Tab öffnen (sobald BUG-FEAT18-001 behoben)
2. Produktpreis in der Liste ansehen → zeigt doppeltes €

## Expected Behavior

Preis wird korrekt angezeigt: "2,50 €"

## Actual Behavior

Preis wird doppelt mit Euro-Zeichen angezeigt: "2,50 € €"

## Betroffene Dateien

- `src/components/recommendations/RecommendedList.vue` — Zeilen 131, 133, 137
- `src/components/recommendations/FavoritesList.vue` — Zeilen 98, 100, 104

Auch pre-existing in:
- `src/components/dashboard/ProductGrid.vue` — Zeilen 231, 233, 237

## Environment

- Browser: Chrome (Playwright), Desktop
- OS: macOS

---

## Abhängigkeiten

### Zu anderen Bugs
- Pre-existing Bug in `ProductGrid.vue` (gleicher Fehler, nicht FEAT-18-spezifisch)

### Zu anderen Features
- FEAT-14: Ursprung des Bugs durch Angebotspreis-Anzeige

---

## Attachments

- Keine Screenshots benötigt (reproduzierbar)
