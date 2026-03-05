# BUG-FEAT6-010: Suchfeld hat kein programmatisches Label (WCAG 1.3.1 / 4.1.2)

**Feature:** FEAT-6 Produktkatalog
**Severity:** High
**Priority:** Must Fix
**Gefunden am:** 2026-03-05
**App URL:** http://localhost:3000/dashboard

---

## Beschreibung

Das Suchfeld im `ProductGrid.vue` hat weder ein zugehöriges `<label>`-Element noch ein `aria-label`- oder `aria-labelledby`-Attribut. Screen Reader können das Eingabefeld deshalb nicht korrekt ansagen — sie lesen nur den Platzhalter-Text "Produkte suchen..." vor, der laut WCAG 2.1 kein ausreichender Ersatz für ein programmatisches Label ist.

Betroffen: WCAG 2.1 AA, SC 1.3.1 (Info and Relationships) und SC 4.1.2 (Name, Role, Value).

## Steps to Reproduce

1. Navigiere zu http://localhost:3000/dashboard als Mitarbeiter
2. Öffne VoiceOver (macOS) oder NVDA (Windows)
3. Navigiere mit Tab zum Suchfeld im Produktkatalog
4. Screen Reader gibt nur den Platzhalter "Produkte suchen..." aus — kein programmatisches Label

## Expected Behavior

Screen Reader kündigt korrekt an: "Produkte suchen, Suchfeld" oder vergleichbar.
Das Eingabefeld benötigt entweder:
- Ein `<label for="product-search">Produkte suchen</label>` mit passender `id`
- Oder ein `aria-label="Produkte suchen"` direkt am `<input>`

## Actual Behavior

Das `<input>`-Element hat weder `<label>` noch `aria-label`. Nur der `placeholder`-Text "Produkte suchen..." ist vorhanden — kein gültiges WCAG-konformes Label.

## Betroffene Datei

`src/components/dashboard/ProductGrid.vue`, Zeile 142–149:
```html
<input
  v-model="searchQuery"
  @keyup.enter="handleSearch"
  type="text"
  placeholder="Produkte suchen..."
  class="w-full px-4 py-2 pl-10 border border-border rounded-lg ..."
/>
```

## Mögliche Lösung

Option A — `aria-label` hinzufügen (minimal-invasiv):
```html
<input
  v-model="searchQuery"
  ...
  aria-label="Produkte suchen"
  placeholder="Produkte suchen..."
/>
```

Option B — Sichtbares `<label>` (bevorzugt für WCAG):
```html
<label for="product-search" class="sr-only">Produkte suchen</label>
<input
  id="product-search"
  v-model="searchQuery"
  ...
/>
```

## Environment

- Browser: Alle (Screen Reader abhängig)
- Device: Desktop/Mobile
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keiner

### Zu anderen Features
- FEAT-6: Produktkatalog — WCAG-Anforderung

---

## Attachments

- Screenshots: —
- Logs: —
