# BUG-FEAT10-011: N+1 Query Problem in /api/admin/products (index.get.ts)

**Feature:** FEAT-10 Erweitertes Admin-Dashboard
**Severity:** Low
**Priority:** Nice to Fix
**Gefunden am:** 2026-03-06
**App URL:** http://localhost:3000/admin/products

---

## Beschreibung

Der `/api/admin/products` GET-Endpunkt hat ein N+1-nahes Query-Problem: Die Kategorie-Links werden fuer alle Produkte auf einmal geladen (eine zweite Query), aber ohne WHERE-Einschraenkung auf die spezifischen Produkt-IDs. Das bedeutet, die zweite Query laedt **alle** `product_categories`-Eintraege der Datenbank, nicht nur die fuer die angezeigten Produkte.

**Betroffene Datei:** `src/server/api/admin/products/index.get.ts` (Zeile 37-53)

```typescript
if (productIds.length > 0) {
  const categoryLinks = await db
    .select({
      productId: productCategories.productId,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(productCategories)
    .innerJoin(categories, eq(productCategories.categoryId, categories.id));
    // FEHLT: .where(inArray(productCategories.productId, productIds))
    // Laedt ALLE product_categories, nicht nur die der aktuellen Produkte
}
```

Bei wachsender Datenbank werden alle Junction-Tabellen-Eintraege geladen, auch wenn nur ein Teil der Produkte angezeigt wird (z.B. durch kuenftige Paginierung).

## Steps to Reproduce

1. Viele Produkte in der Datenbank haben
2. GET /api/admin/products aufrufen
3. Datenbank-Query-Log pruefenkatze: Zweite Query hat kein WHERE-Clause auf productId

## Expected Behavior

Zweite Query filtert nur auf die Produkt-IDs der ersten Query:
```sql
SELECT ... FROM product_categories
INNER JOIN categories ON ...
WHERE product_categories.product_id IN (1, 2, 3, ...)
```

## Actual Behavior

Zweite Query laedt alle Eintraege:
```sql
SELECT ... FROM product_categories
INNER JOIN categories ON ...
-- Kein WHERE-Filter
```

## Environment

- Browser: Alle
- Device: Server-seitig
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-12: Bestandsverwaltung - koennte bei mehr Produkten spaeter Performance-Problem werden

---

## Attachments

- Screenshots: keine
- Logs: keine

## Loesungsvorschlag

`inArray`-Import ist bereits vorhanden in der Datei (via `eq`-Import aus drizzle-orm). Einfach WHERE-Clause erganzen:
```typescript
.where(inArray(productCategories.productId, productIds))
```
