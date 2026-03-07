# BUG-FEAT10-012: Kein UNIQUE Constraint auf product_categories - Doppelte Verknuepfungen moeglich

**Feature:** FEAT-10 Erweitertes Admin-Dashboard
**Severity:** High
**Priority:** Must Fix
**Gefunden am:** 2026-03-06
**App URL:** http://localhost:3000

---

## Beschreibung

Die `product_categories`-Tabelle hat keinen UNIQUE Constraint auf `(productId, categoryId)`. Das bedeutet, ein Produkt kann derselben Kategorie mehrfach zugeordnet werden. Dies kann passieren durch:

1. Gleichzeitige parallele API-Aufrufe (Race Condition)
2. Bei Kategorie-Neuanlage mit bestehenden Kategorie-IDs
3. Beim Produkt-Update wenn `categoryIds` dieselbe ID doppelt enthaelt

**Betroffene Datei:** `src/server/db/schema.ts` (Zeile 86-93)

```typescript
export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  // FEHLT: uniqueIndex('product_category_unique').on(productCategories.productId, productCategories.categoryId)
});
```

Im Delete-Handler gibt es zwar eine manuelle Duplikat-Pruefung (Zeile 94-103 in `[id].delete.ts`), aber diese ist nur ein Workaround fuer das fehlende Constraint und deckt nicht alle Code-Pfade ab.

## Steps to Reproduce

1. Gleichzeitig zwei PATCH-Requests an `/api/admin/products/:id` senden mit denselben `categoryIds`
2. Oder: Im Produkt-Create-Request ein Array mit doppelten Kategorie-IDs senden:
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=user_1" \
  -d '{"name": "Test", "price": "1.00", "categoryIds": [1, 1]}'
```
3. Zwei identische Eintraege in `product_categories` werden angelegt

## Expected Behavior

Datenbank wirft einen UNIQUE-Constraint-Fehler. Die API gibt HTTP 409 mit Fehlermeldung zurueck oder dedupliziert die IDs vor dem Einfuegen.

## Actual Behavior

Doppelte Eintraege werden angelegt. Das fuehrt dazu, dass die Kategorie in der Admin-UI doppelt angezeigt wird und bei der Loeschung falsche Zahlen bei `productCount` entstehen (zaehlt Duplikate mit).

## Environment

- Browser: Alle (API-Endpunkt direkt)
- Device: Alle
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- BUG-FEAT10-011: N+1 Query Problem - betrifft dieselbe Tabelle

### Zu anderen Features
- FEAT-10: EC-1 (Kategorie loeschen mit Produkten) - productCount koennte durch Duplikate falsch sein

---

## Attachments

- Screenshots: keine
- Logs: keine

## Loesungsvorschlag

1. DB-Migration: UNIQUE Constraint auf `(product_id, category_id)` in `product_categories`
2. Alternativ: In `index.post.ts` und `[id].patch.ts` die `categoryIds` vor dem Einfuegen deduplizieren:
```typescript
const uniqueCategoryIds = [...new Set(categoryIds)];
```
