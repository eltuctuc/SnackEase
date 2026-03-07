# BUG-FEAT12-005: Bulk-Update Modal — "Max"-Button setzt auf 50, nicht auf 999

**Feature:** FEAT-12 Bestandsverwaltung
**Severity:** Low
**Priority:** Nice to Fix
**Gefunden am:** 2026-03-07
**App URL:** http://localhost:3000

---

## Beschreibung

Im Bulk-Update Modal gibt es einen "Max"-Button, der den Bestand auf einen bestimmten Maximalwert setzen soll. Laut Feature-Spec und API-Validierung ist der Maximalwert 999 (Kommentar in `index.patch.ts`: "Bestandswert muss zwischen 0 und 999 liegen").

Der "Max"-Button im Frontend setzt jedoch nur auf `50`:

```typescript
// inventory.vue Zeile 415
@click="bulkValues[item.productId] = 50"
```

Das widerspricht der API-Validierung (Max: 999) und der UX-Erwartung ("Max" = Maximaler Wert).

**Betroffene Datei:** `src/pages/admin/inventory.vue` (Zeile 415)

## Steps to Reproduce

1. Als Admin `/admin/inventory` öffnen
2. Mindestens ein Produkt auswählen (Checkbox)
3. "Bestand aktualisieren" klicken
4. Im Modal auf "Max" klicken
5. Wert im Eingabefeld prüfen

## Expected Behavior

"Max" setzt den Wert auf 999 (API-Maximum), oder der Button ist beschriftet mit "Max (50)" wenn 50 tatsächlich das gewollte Maximum ist.

## Actual Behavior

"Max"-Button setzt Wert auf 50, nicht auf 999.

## Root Cause

Hardcoded-Wert `50` statt der Konstante `999` (dem API-Maximum). Das `addStock`-Composable nutzt bereits `Math.min(999, ...)` als Obergrenze, der "Max"-Button ist aber inkonsistent.

Lösung: `bulkValues[item.productId] = 999` verwenden, oder den Wert aus einer gemeinsamen Konstante ziehen.

## Environment

- Browser: Chrome, Firefox, Safari
- Device: Desktop
- OS: macOS

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- Keine

---

## Attachments

- Logs: Keine
- Screenshots: Keine
