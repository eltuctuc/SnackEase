# BUG-FEAT18-001: GET /api/recommendations schlägt mit 500 Server Error fehl — "function min() does not exist"

**Feature:** FEAT-18 Empfehlungen & Favoriten
**Severity:** Critical
**Priority:** Must Fix
**Gefunden am:** 2026-03-12
**Behoben am:** 2026-03-12
**Status:** Behoben
**App URL:** http://localhost:3000

---

## Beschreibung

Der API-Endpunkt `GET /api/recommendations` wirft bei jedem Aufruf einen 500 Server Error. Die Fehlermeldung im Server-Log lautet:

```
Error fetching recommendations: function min() does not exist
```

Der Fehler tritt in der `orderBy`-Klausel des Drizzle-Queries auf. Die Zeile:

```typescript
sql`min(${recommendations.created_at}) asc`
```

wird von Drizzle ORM falsch interpoliert. Drizzle expandiert `${recommendations.created_at}` als Column-Reference-Objekt und nicht als SQL-String `"recommendations"."created_at"`. Die erzeugte SQL enthält dadurch kein gültiges `MIN()`-Argument, was PostgreSQL/Neon mit "function min() does not exist" ablehnt.

Betroffen ist Zeile 61 in `src/server/api/recommendations/index.get.ts`:

```typescript
sql`min(${recommendations.created_at}) asc`,
```

Das Feld heißt im Drizzle-Schema `createdAt` (camelCase), die direkte Referenz via `recommendations.created_at` (snake_case) ist in diesem raw-SQL-Kontext nicht korrekt.

## Auswirkung

Die gesamte "Empfohlen"-Tab-Ansicht ist für alle Nutzer dauerhaft kaputt. AC-1, AC-3, AC-8, AC-9, AC-15 sind blockiert.

## Steps to Reproduce

1. Einloggen als beliebiger Mitarbeiter
2. Dashboard öffnen
3. Tab "Empfohlen" ist aktiv (Standard)
4. Fehlermeldung erscheint: `[GET] "/api/recommendations": 500 Server Error`
5. Im Browser-DevTools: Response 500, Server-Log zeigt `function min() does not exist`

## Expected Behavior

`GET /api/recommendations` gibt Top-10-Produkte mit `recommendationCount` zurück.

## Actual Behavior

```
HTTP 500 Server Error
"function min() does not exist"
```

Der "Empfohlen"-Tab zeigt dauerhaft die Fehlermeldung `[GET] "/api/recommendations": 500 Server Error`.

## Root Cause

Drizzle ORM interpoliert Column-References in raw `sql\`\`` Templates als parameterisierte Werte, nicht als SQL-Identifier. Die korrekte Schreibweise für `MIN()` in einem GROUP BY-Kontext ist entweder:

- `sql\`min("recommendations"."created_at") asc\`` (reines SQL, keine Drizzle-Interpolation)
- oder der Import von `min` aus `drizzle-orm` und Verwendung als `orderBy(sql\`count(...) desc\`, min(recommendations.createdAt).asc())`

## Environment

- Browser: Chrome (Playwright)
- Device: Desktop
- OS: macOS

---

## Abhängigkeiten

### Zu anderen Features
- FEAT-18: Blockiert AC-1, AC-3, AC-8, AC-9, AC-15

---

## Attachments

- Server-Log: `/tmp/snackease-dev.log`
