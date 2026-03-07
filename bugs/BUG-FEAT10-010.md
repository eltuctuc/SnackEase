# BUG-FEAT10-010: Nutzer-Erstellung erlaubt negatives oder Null-Startguthaben

**Feature:** FEAT-10 Erweitertes Admin-Dashboard
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-06
**App URL:** http://localhost:3000/admin/users

---

## Beschreibung

Der `/api/admin/users` POST-Endpunkt validiert das `startCredits`-Feld nicht. Es ist moeglich, einen Nutzer mit negativem Guthaben oder einem nicht-numerischen Wert anzulegen. Das Frontend validiert den Wert zwar durch `min="0"` im HTML-Input, aber diese Client-seitige Validierung kann einfach umgangen werden (direkter API-Aufruf oder Browser-DevTools).

**Betroffene Datei:** `src/server/api/admin/users/index.post.ts` (Zeile 42-44)

```typescript
await db.insert(userCredits).values({
  userId: newUser[0].id,
  balance: String(startCredits || 25),  // Kein Check ob startCredits negativ oder NaN ist
});
```

Ein negativer `startCredits`-Wert (z.B. `-100`) wird direkt in die DB geschrieben. Durch `String(startCredits || 25)` wird nur `0` und `undefined`/`null` auf 25 gesetzt - negative Werte werden durchgelassen.

## Steps to Reproduce

1. Admin einloggen
2. Direkten API-Aufruf ausfuehren:
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=user_1" \
  -d '{"name": "Test User", "location": "Nürnberg", "startCredits": -50}'
```
3. Nutzer wird mit -50 EUR Guthaben angelegt

## Expected Behavior

API gibt HTTP 400 zurueck mit Fehlermeldung: "Startguthaben muss 0 oder positiv sein"

## Actual Behavior

Nutzer wird mit negativem Startguthaben angelegt. Der Nutzer koennte theoretisch Bestellungen nicht aufgeben (da kein Guthaben), aber der Daten-Integritaets-Constraint fehlt vollstaendig.

## Environment

- Browser: Alle (API-Endpunkt direkt)
- Device: Alle
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-4: Demo Guthaben - negative Werte koennen Guthaben-Logik stoeren

---

## Attachments

- Screenshots: keine
- Logs: keine

## Loesungsvorschlag

Im Server-Handler Validierung hinzufuegen:
```typescript
const credits = typeof startCredits === 'number' ? startCredits : 25;
if (credits < 0) {
  throw createError({ statusCode: 400, message: 'Startguthaben kann nicht negativ sein' });
}
```
