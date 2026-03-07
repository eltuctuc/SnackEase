# BUG-FEAT12-002: System-Reset setzt alle Produkte auf pauschal 10 Stück statt auf Seed-Werte

**Feature:** FEAT-12 Bestandsverwaltung
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-07
**App URL:** http://localhost:3000

---

## Beschreibung

Die Spec (EC-5 / REQ-4) verlangt: "Beim System-Reset: Bestand wird auf **Seed-Werte** zurückgesetzt." Die Seed-Werte sind produktspezifisch (z.B. Apfel: 15, Nüsse: 10, Proteinriegel: 8, Shake: 12, Wasser: 20).

Die aktuelle Implementierung in `reset.post.ts` setzt pauschal alle Produkte auf `stock = 10`:

```typescript
await tx.update(products).set({ stock: 10 }).execute();
```

Das ist ein Einheitswert, kein produktspezifischer Seed-Wert.

**Betroffene Datei:** `src/server/api/admin/reset.post.ts` (Zeile 31)

## Steps to Reproduce

1. Als Admin einloggen
2. Produktbestand für Produkte auf unterschiedliche Werte setzen (z.B. Apfel: 15, Nüsse: 2)
3. System-Reset durchführen
4. Bestandsübersicht öffnen

## Expected Behavior

Jedes Produkt wird auf seinen produktspezifischen Seed-Wert zurückgesetzt (z.B. Apfel: 15, Nüsse: 10).

## Actual Behavior

Alle Produkte werden auf 10 gesetzt, unabhängig von den ursprünglichen Seed-Werten. Ein Produkt das ursprünglich 20 Stück hatte wird jetzt auf 10 gesetzt.

## Root Cause

Es gibt keinen `defaultStock`-Wert im Datenbankschema oder eine separate Seed-Tabelle. Der Reset kann daher nicht auf "echte" Seed-Werte zurücksetzen. Der Einheitswert 10 ist ein Kompromiss, der aber nicht der Spec entspricht.

Lösungsoptionen:
1. Einen `defaultStock`-Wert in der `products`-Tabelle hinzufügen, den der Reset nutzt
2. Eine Konstanten-Map im Reset-Handler hinterlegen
3. Dokumentieren, dass der Reset auf 10 normiert (wenn akzeptierbar)

## Environment

- Browser: Alle
- Device: Desktop
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-12: EC-5 verletzt

---

## Attachments

- Logs: Keine
- Screenshots: Keine
