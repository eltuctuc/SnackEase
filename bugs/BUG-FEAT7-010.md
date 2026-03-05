# BUG-FEAT7-010: PurchaseSuccessModal fehlt role="dialog", aria-modal, aria-labelledby (WCAG 4.1.2)

**Feature:** FEAT-7 One-Touch Kauf
**Severity:** High
**Priority:** Must Fix
**Gefunden am:** 2026-03-05
**App URL:** http://localhost:3000/dashboard

---

## Beschreibung

Das `PurchaseSuccessModal.vue` (Kauf-Bestätigungs-Modal nach erfolgreichem Kauf) fehlen die WCAG-erforderlichen ARIA-Attribute für Modaldialoge. Im Vergleich dazu haben `RechargeModal.vue` und `ProductDetailModal.vue` korrekte `role="dialog"`, `aria-modal="true"` und `aria-labelledby`-Attribute.

Fehlende Attribute:
1. `role="dialog"` — Identifiziert das Element als modaler Dialog für Assistive Technologies
2. `aria-modal="true"` — Verhindert, dass Screen Reader Inhalte außerhalb des Modals ankündigen
3. `aria-labelledby` — Verknüpft den Modal mit seiner Überschrift "Kauf erfolgreich!"

Laut WCAG 2.1 AA, SC 4.1.2 (Name, Role, Value) und ARIA-Best-Practices muss ein Modal-Dialog diese Attribute haben.

Zusätzlich fehlt ein **Focus-Trap**: Wenn das Modal geöffnet wird, gibt es kein automatisches Focus-Management. Der Fokus bleibt auf dem "Kaufen"-Button. Screen-Reader-Nutzer und Tastatur-Nutzer können das Modal nicht sofort bedienen.

## Steps to Reproduce

1. Navigiere zu http://localhost:3000/dashboard als Mitarbeiter mit ausreichend Guthaben
2. Klicke auf "Kaufen" bei einem verfügbaren Produkt
3. Das Kauf-Bestätigungs-Modal öffnet sich
4. Öffne Accessibility-Inspector (z.B. axe DevTools, NVDA, VoiceOver)
5. Der Modal-Container hat keine `role="dialog"`, kein `aria-modal` und kein `aria-labelledby`
6. Mit Tastatur-Navigation bleibt der Fokus nicht im Modal

## Expected Behavior

Der Modal-Container sollte folgende ARIA-Attribute haben:
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="purchase-success-title"
  ...
>
  <h2 id="purchase-success-title">Kauf erfolgreich!</h2>
  ...
</div>
```

Beim Öffnen des Modals sollte der Fokus automatisch auf den ersten fokussierbaren Element (z.B. "Modal schließen"-Button) gesetzt werden.

## Actual Behavior

Der innere Modal-`<div>` in `PurchaseSuccessModal.vue` hat nur `data-testid="purchase-success-modal"` und `@click.stop` — kein ARIA-Role, kein aria-modal, kein aria-labelledby.

```html
<div
  class="bg-card rounded-lg border shadow-lg max-w-md w-full p-6 relative"
  @click.stop
  data-testid="purchase-success-modal"
>
  <!-- Kein role="dialog", aria-modal, aria-labelledby -->
```

## Betroffene Datei

`src/components/dashboard/PurchaseSuccessModal.vue`, Zeile 148–152:
```html
<div
  class="bg-card rounded-lg border shadow-lg max-w-md w-full p-6 relative"
  @click.stop
  data-testid="purchase-success-modal"
>
```

## Vergleich: Korrekte Implementierung in RechargeModal.vue

```html
<div
  class="..."
  role="dialog"
  aria-modal="true"
  aria-labelledby="recharge-modal-title"
>
```

## Environment

- Browser: Alle (Screen Reader abhängig)
- Device: Desktop/Mobile
- OS: macOS (VoiceOver), Windows (NVDA)

---

## Abhängigkeiten

### Zu anderen Bugs
- Keiner

### Zu anderen Features
- FEAT-7: One-Touch Kauf — WCAG 4.1.2 Anforderung

---

## Attachments

- Screenshots: —
- Logs: —
