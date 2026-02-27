# FEAT-6: Produktkatalog

## Status: 🔵 Planned

## Abhängigkeiten
- Keine direkten Abhängigkeiten

## 1. Overview

**Beschreibung:** Anzeige aller verfügbaren Snacks und Getränke mit Kategorien, Suche und Produktdetails.

**Ziel:** Übersichtliche Darstellung des Produktangebots mit allen relevanten Informationen.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich alle Produkte auf einen Blick sehen | Must-Have |
| US-2 | Als Nutzer möchte ich nach Kategorien filtern | Must-Have |
| US-3 | Als Nutzer möchte ich nach Produktnamen suchen | Must-Have |
| US-4 | Als Nutzer möchte ich Details zu einem Produkt sehen (Nährwerte, Inhaltsstoffe) | Must-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Übersicht aller Produkte als Grid oder Liste | Must-Have |
| REQ-2 | Kategorien: Obst, Proteinriegel, Shakes, Schokoriegel, Nüsse, Getränke | Must-Have |
| REQ-3 | Suchfeld mit Echtzeit-Filterung | Must-Have |
| REQ-4 | Kategorie-Filter (eine oder mehrere) | Must-Have |
| REQ-5 | Produktdetail-Ansicht: Bild, Name, Preis, Nährwerte, Allergene | Must-Have |
| REQ-6 | Verfügbarkeitsanzeige (vorrätig/nicht vorrätig) | Must-Have |

## 4. Kategorien

| Kategorie | Farbe | Icon |
|-----------|-------|------|
| Obst | Grün | 🍎 |
| Proteinriegel | Blau | 💪 |
| Shakes | Lila | 🥤 |
| Schokoriegel | Braun | 🍫 |
| Nüsse | Orange | 🥜 |
| Getränke | Cyan | 🧃 |

## 5. Produkt-Datenmodell (Neon/Drizzle)

```typescript
// server/db/schema.ts
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'obst' | 'proteinriegel' | 'shakes' | 'schokoriegel' | 'nuesse' | 'getraenke'
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  calories: integer('calories'),
  protein: integer('protein'),
  sugar: integer('sugar'),
  fat: integer('fat'),
  allergens: text('allergens').array(),
  isVegan: boolean('is_vegan').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  stock: integer('stock').default(10),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## 6. Acceptance Criteria

- [ ] Alle Produkte werden im Grid angezeigt
- [ ] Kategorie-Filter funktioniert (alle/ausgewählte)
- [ ] Suchfeld filtert Produkte nach Namen
- [ ] Klick auf Produkt öffnet Detailansicht
- [ ] Nährwerte und Allergene werden angezeigt
- [ ] Nicht vorrätige Produkte sind markiert

## 7. UI/UX Vorgaben

- Grid-Layout mit 2-4 Spalten (responsive)
- Suchfeld oben fixiert
- Kategorien als Filter-Buttons oder Tabs
- Produktkarte: Bild, Name, Preis, vegetarisch/vegan Icon

## 8. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **Tabelle:** `products` (neu erstellen)
- **Seed-Daten:** 15-20 Produkte für Demo
- **Suche:** PostgreSQL ILIKE
- **Kategorien:** Enum oder Text-Feld

## 9. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/products` | GET | Alle Produkte (mit Filter) |
| `/api/products/:id` | GET | Einzelnes Produkt |

## 10. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Keine Produkte gefunden | "Keine Produkte verfügbar" Nachricht |
| EC-2 | Produkt nicht vorrätig | Deaktiviert, nicht kaufbar |
| EC-3 | Sehr langer Produktname | Textabschneiden mit "..." |
