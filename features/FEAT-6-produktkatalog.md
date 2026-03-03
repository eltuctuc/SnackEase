# FEAT-6: Produktkatalog

## Status: ✅ Implementiert

## Abhängigkeiten
- Benötigt: FEAT-4 (Demo-Guthaben) - für Preis-Anzeige und Kauf-Integration

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
| EC-4 | Netzwerkfehler beim Laden | Error-Message mit Retry-Button |
| EC-5 | Leere Suchergebnisse | "Keine Produkte gefunden für '[Suchbegriff]'" |
| EC-6 | Sehr viele Produkte (>100) | Pagination oder Virtual Scrolling |

---

## 11. UX Design

### 11.1 Personas-Abdeckung

| Persona | Bedürfnis im Produktkatalog | Abgedeckt? |
|---------|------------------------------|------------|
| Nina Neuanfang | Einfache Übersicht, klare Kategorien | ✅ |
| Maxine Snackliebhaber | Nährwerte, Favoriten-Zugang | ✅ |
| Lucas Gesundheitsfan | Vegan/Glutenfrei Filter, detaillierte Nährwerte | ✅ |
| Tom Schnellkäufer | One-Touch Kauf (kommt in FEAT-7) | ⚠️ |

**Pain Points adressiert:**
- Maxine: Nährwerte und Verfügbarkeit werden angezeigt
- Lucas: Vegan/Glutenfrei Filter, detaillierte Nährwerte
- Nina: Einfache Grid-Darstellung, intuitive Kategorien

### 11.2 User Flow: Produkt durchsuchen

```
1. User öffnet App
2. User sieht Produkt-Grid
3. User klickt auf Kategorie-Filter (oder "Alle")
4. User gibt Suchbegriff ein (optional)
5. Produkte werden gefiltert angezeigt
6. User klickt auf Produkt
7. Detailansicht öffnet sich
8. User sieht Nährwerte, Preis, Verfügbarkeit
```

**Alternative Flows:**
- User startet mit Suche → direkt filtern
- User kombiniert Kategorie + Suche

### 11.3 Wireframe: Produkt-Grid

```
┌─────────────────────────────────────┐
│ ← SnackEase              [🔍] [👤] │  Header
├─────────────────────────────────────┤
│ [🔍 Suchen...                    ] │  Suchfeld
├─────────────────────────────────────┤
│ [Alle] [🍎] [💪] [🥤] [🍫] [🥜] [🧃] │  Kategorien
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 🍎  │ │ 🍌  │ │ 🥜  │ │ 🥤  │   │  Produkt-Grid
│ │ Apfel│ │Banane│ │Nüsse │ │Shake │   │  2-4 Spalten
│ │ 1€   │ │ 2€   │ │ 3€   │ │ 4€   │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 🍫  │ │ 🍎  │ │ 💪  │ │ 🥜  │   │
│ │Riegel│ │Apfel│ │Bar  │ │Nüsse │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
└─────────────────────────────────────┘
```

### 11.4 Wireframe: Produkt-Detail

```
┌─────────────────────────────────────┐
│ ← Zurück     Produkt        [Kaufen]│  Header
├─────────────────────────────────────┤
│                                     │
│           [Produkt-Bild]            │
│                                     │
│         Produkt Name                │
│              2,50 €                │
│                                     │
│    ┌─────────────────────────┐     │
│    │  Nährwerte pro 100g:    │     │
│    │  ───────────────────    │     │
│    │  Kalorien:  250 kcal   │     │
│    │  Protein:    10g        │     │
│    │  Zucker:    15g         │     │
│    │  Fett:      8g         │     │
│    └─────────────────────────┘     │
│                                     │
│    🟢 Vegan  │ 🟡 Glutenfrei      │
│                                     │
│    Allergene: enthält Nüsse         │
│                                     │
│              ●●●●○ (5 vorrätig)    │
│                                     │
└─────────────────────────────────────┘
```

### 11.5 Accessibility (WCAG 2.1 AA)

- ✅ Farbkontrast > 4.5:1 (Text auf Hintergrund)
- ✅ Farbcodierung mit Text-Label ergänzt (Kategorien: Icon + Text)
- ✅ Tastatur-Navigation: Tab-Reihenfolge logisch
- ✅ Screen Reader: aria-label für Buttons, role für Status
- ✅ Touch-Targets: Mindestens 44x44px
- ✅ Fokus-Indikator: Sichtbare Markierung bei Auswahl
- ✅ Fehlermeldungen: Klar und verständlich

### 11.6 UX-Empfehlungen

1. **Ladeanimation** während Produkte laden - für bessere UX
2. **Leerer Zustand** - freundliche Nachricht wenn keine Produkte
3. **Suchfeld** - debounced für Performance
4. **Kategorie-Filter** - visuelle Rückmeldung wenn aktiv
5. **Preis-Anzeige** - prominent, immer sichtbar
6. **Verfügbarkeit** - farbcodiert (grün=vorrätig, rot=nicht vorrätig)

---

## 12. Tech-Design (Solution Architect)

### 12.1 Bestehende Architektur

**Vorhandene Tabellen:**
- `users` (id, email, name, role, passwordHash, location, isActive, createdAt)
- `user_credits` (id, userId, balance, lastRechargedAt, createdAt, updatedAt)
- `credit_transactions` (id, userId, amount, type, description, createdAt)
- `snacks` (id, name, description, price, available, imageUrl, createdAt)

**Vorhandene API Routes:**
- `/api/credits/balance` - Guthaben abrufen
- `/api/credits/recharge` - Guthaben aufladen
- `/api/credits/monthly` - Monatspauschale

### 12.2 Component-Struktur

```
Dashboard / Startseite
├── ProduktGrid Component
│   ├── Suchfeld (oben fixiert)
│   ├── KategorieFilter (Tabs oder Buttons)
│   └── ProduktKarte (wiederholt)
│       ├── ProduktBild
│       ├── ProduktName
│       ├── Preis
│       ├── Verfügbarkeits-Icon
│       └── Vegan/Vegetarisch-Icon
├── ProduktDetail Modal oder Seite
│   ├── Großes Bild
│   ├── Name und Preis
│   ├── Nährwerte (Kalorien, Protein, Zucker, Fett)
│   ├── Allergene
│   ├── Vegan/Glutenfrei Tags
│   └── Verfügbarkeit
└── Loading State / Error State
```

### 12.3 Daten-Model

**Neue Tabelle: products**

Jedes Produkt hat:
- Eindeutige ID
- Name (max. 100 Zeichen)
- Beschreibung (optional)
- Kategorie (Obst, Proteinriegel, Shakes, Schokoriegel, Nüsse, Getränke)
- Preis (in Euro)
- Bild-URL (optional)
- Nährwerte: Kalorien, Protein, Zucker, Fett (pro 100g)
- Allergene (Array: z.B. ["Nüsse", "Laktose"])
- Vegetarisch/Vegan/Glutenfrei (Boolean Flags)
- Lagerbestand (Anzahl)
- Erstellungsdatum

**Gespeichert in:** Neon PostgreSQL (neue Tabelle `products`)

### 12.4 Backend-Bedarf

**Neue API Routes:**

| Komponente | Art | Beschreibung |
|------------|-----|--------------|
| Produkte laden | GET /api/products | Alle Produkte mit Filter (Kategorie, Suche) |
| Einzelnes Produkt | GET /api/products/:id | Produkt-Details |

**Paramter für GET /api/products:**
- `category` (optional): Filter nach Kategorie
- `search` (optional): Suchbegriff für PostgreSQL ILIKE

### 12.5 Tech-Entscheidungen

**Warum neue Tabelle `products` statt `snacks`?**
→ Option B vom User gewählt: Klare Trennung zwischen Snacks (einfach) und Products (mit erweiterten Attributen wie Nährwerte)

**Warum PostgreSQL ILIKE für Suche?**
→ Einfach zu implementieren, PostgreSQL unterstützt Case-insensitive Suche nativ

**Warum Neon + Drizzle?**
→ Bestehende Infrastruktur wird genutzt, kein Wechsel nötig

### 12.6 Dependencies

**Keine neuen Packages nötig!**

- Bestehende: Drizzle ORM, Nuxt
- UI: Nutze bestehende UI-Patterns (Tailwind CSS)

### 12.7 Seed-Daten

**15-20 Produkte für Demo:**
- 3-4 Obst (Apfel, Banane, Orange, etc.)
- 3-4 Proteinriegel
- 2-3 Shakes
- 3 Schokoriegel
- 2-3 Nüsse
- 2-3 Getränke

Jedes Produkt hat vollständige Nährwerte und Allergene.

### 12.8 Wiederverwendung

- Auth-System: Cookie-Session aus FEAT-1/2/3
- Dashboard-Layout: Bestehendes Layout wiederverwenden
- Fehlerbehandlung: Nutze bestehende Pattern für Error States
