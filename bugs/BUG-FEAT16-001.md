# BUG-FEAT16-001: Warenkorb-Icon im Header verlinkt auf /cart statt /orders

**Feature:** FEAT-16 Warenkorb-System
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-12
**App URL:** http://localhost:3000

---

## Beschreibung

Das Warenkorb-Icon in `UserHeader.vue` verlinkt auf `/cart` statt auf `/orders`. Laut REQ-6 und US-6 soll ein Tap auf das Warenkorb-Icon den User direkt zur `/orders`-Seite führen. Die `/cart`-Seite existiert als separates Dokument, ist aber laut Implementation Notes kein Teil des FEAT-16-Hauptflows (UserTabBar zeigt bereits korrekt auf `/orders`). Die Inkonsistenz fuehrt dazu, dass Icon im Header und Tab-Bar-Navigation auf unterschiedliche Seiten zeigen.

## Steps to Reproduce

1. Als eingeloggter Mitarbeiter die App öffnen (http://localhost:3000/dashboard)
2. Ein Produkt in den Warenkorb legen
3. Auf das Warenkorb-Icon im Header (obere rechte Ecke) tippen
4. Beobachten: User landet auf /cart statt auf /orders

## Expected Behavior

Tap auf das Warenkorb-Icon im Header fuehrt den User zu /orders (Vorbestellungsseite mit integriertem Warenkorb) — analog zur UserTabBar-Navigation.

## Actual Behavior

Tap auf das Warenkorb-Icon im Header fuehrt den User zu /cart (separate Warenkorb-Seite, die nicht Teil des FEAT-16-Hauptflows ist).

## Code-Referenz

```
src/components/navigation/UserHeader.vue, Zeile 47:
<NuxtLink to="/cart" ...>  // sollte to="/orders" sein
```

## Environment

- Browser: Alle (Code-Review-Befund)
- Device: Mobile + Desktop
- OS: alle

---

## Abhängigkeiten

### Zu anderen Features
- FEAT-16: Kernfeature — Warenkorb-Flow soll ueber /orders laufen

---

## Attachments

- Screenshots: keine
- Logs: keine
