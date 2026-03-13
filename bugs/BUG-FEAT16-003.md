# BUG-FEAT16-003: REQ-12 nicht erfuellt — kein Hinweistext bei leerem Warenkorb auf /orders

**Feature:** FEAT-16 Warenkorb-System
**Severity:** Low
**Priority:** Nice to Fix
**Gefunden am:** 2026-03-12
**App URL:** http://localhost:3000

---

## Beschreibung

REQ-12 verlangt: "Wenn der Warenkorb leer ist, zeigt die [Warenkorb-]Sektion einen Hinweistext ('Dein Warenkorb ist leer') und einen Link zum Produktkatalog."

In der aktuellen Implementierung wird die gesamte Warenkorb-Sektion mit `v-if="!cartStore.isEmpty"` ausgeblendet, wenn der Warenkorb leer ist. Es gibt keinen Hinweistext und keinen Link zum Produktkatalog in dieser Sektion.

Die Seite `/cart.vue` implementiert den leeren Zustand korrekt, aber `/orders.vue` nicht.

Hinweis: Die Seite zeigt weiterhin Bestellungen und einen Link zum Produktkatalog im "Leerer Zustand" der Bestellliste — aber der spezifische Hinweistext fuer den leeren Warenkorb in der Warenkorb-Sektion fehlt.

## Steps to Reproduce

1. Als eingeloggter Mitarbeiter die App öffnen
2. Warenkorb leeren (alle Artikel entfernen oder frischer Start)
3. Zu /orders navigieren
4. Beobachten: Die Warenkorb-Sektion erscheint gar nicht

## Expected Behavior

Die Warenkorb-Sektion wird immer angezeigt. Bei leerem Warenkorb zeigt sie den Hinweistext "Dein Warenkorb ist leer" und einen Link zum Produktkatalog (/dashboard).

## Actual Behavior

Die Warenkorb-Sektion ist bei leerem Warenkorb komplett ausgeblendet (v-if="!cartStore.isEmpty"). Der User sieht keine Warenkorb-Sektion und keinen Hinweis.

## Code-Referenz

```
src/pages/orders.vue, Zeile 369:
<div v-if="!cartStore.isEmpty" class="mb-8">
  <!-- Warenkorb-Sektion: nur sichtbar wenn Artikel vorhanden -->
```

REQ-12 fordert stattdessen eine always-visible Sektion mit Empty-State.

## Environment

- Browser: Alle (Code-Review-Befund)
- Device: Mobile + Desktop
- OS: alle

---

## Abhängigkeiten

### Zu anderen Features
- FEAT-16: Kernfeature Warenkorb-System

---

## Attachments

- Screenshots: keine
- Logs: keine
