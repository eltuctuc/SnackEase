# FEAT-12: Bestandsverwaltung

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-5 (Admin-Basis) - für Admin-Zugriff
- Benötigt: FEAT-6 (Produktkatalog) - für Produktinformationen
- Benötigt: FEAT-10 (Erweitertes Admin-Dashboard) - für Admin-Oberfläche

## 1. Overview

**Beschreibung:** Admin kann den Bestand (Stückzahlen) aller Produkte im physischen Automaten verwalten.

**Ziel:** Transparenz über Produktverfügbarkeit und Möglichkeit zur Bestandsaktualisierung nach Nachlieferungen.

**Kontext:** Dies ist ein Demo-Feature zur Simulation eines physischen Automaten. Es gibt keinen echten Automaten, aber das System muss die Bestandsverwaltung simulieren.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin möchte ich den aktuellen Bestand aller Produkte im Automaten sehen | Must-Have |
| US-2 | Als Admin möchte ich den Bestand nach einer Nachlieferung aktualisieren | Must-Have |
| US-3 | Als Admin möchte ich mehrere Produkte gleichzeitig auffüllen (Bulk-Update) | Must-Have |
| US-4 | Als Admin möchte ich die Bestandshistorie sehen (wann wurde aufgefüllt) | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Übersicht aller Produkte mit aktueller Stückzahl | Must-Have |
| REQ-2 | Farbliche Kennzeichnung bei niedrigem Bestand (<=3 Stück = Rot) | Must-Have |
| REQ-3 | Bulk-Update: Mehrere Produkte gleichzeitig aktualisieren | Must-Have |
| REQ-4 | Bestandsinitialisierung über Seed-Daten (beim System-Reset) | Must-Have |
| REQ-5 | Automatische Bestandsreduzierung bei Kauf | Must-Have |
| REQ-6 | Nutzer sieht verfügbare Stückzahl im Produktkatalog | Must-Have |
| REQ-7 | Kaufen-Button wird deaktiviert bei 0 Stück | Must-Have |
| REQ-8 | Bestandshistorie (Log aller Änderungen) | Should-Have |

## 4. Bestandsverwaltungs-Workflow

```
Admin-Sicht:
1. Admin öffnet /admin/inventory
       ↓
2. Liste aller Produkte mit Stückzahlen
   - Grün: >3 Stück
   - Rot: <=3 Stück (Low Stock)
   - Grau: 0 Stück (Ausverkauft)
       ↓
3. Admin wählt Produkte aus (Checkboxen)
       ↓
4. Admin klickt "Bestand aktualisieren"
       ↓
5. Modal öffnet sich:
   - Für jedes ausgewählte Produkt:
     * Aktueller Bestand
     * Eingabefeld für neuen Bestand
     * Optional: "+10" Button (schnelles Auffüllen)
       ↓
6. Admin gibt neue Mengen ein
       ↓
7. "Speichern" klicken
       ↓
8. Bestand wird aktualisiert
       ↓
9. Toast: "Bestand aktualisiert für X Produkte"
```

```
Nutzer-Sicht:
1. Nutzer öffnet Produktkatalog
       ↓
2. Sieht unter jedem Produkt: "Noch X Stück verfügbar"
       ↓
3. Bei 0 Stück: "Kaufen" Button deaktiviert + "Nicht verfügbar"
       ↓
4. Bei >0 Stück: Kauf möglich
```

```
Kauf-Prozess (automatische Reduzierung):
1. Nutzer kauft Produkt
       ↓
2. System prüft Bestand (>=1 Stück?)
       ↓
3. [Wenn 0 Stück] → Fehlermeldung "Produkt nicht verfügbar"
       ↓
4. [Wenn >=1 Stück] → Bestand -1, Kauf durchführen
```

## 5. Acceptance Criteria

- [ ] Admin sieht Bestandsübersicht auf /admin/inventory
- [ ] Produkte mit <=3 Stück sind rot markiert
- [ ] Admin kann mehrere Produkte auswählen (Checkboxen)
- [ ] Bulk-Update: Bestand für mehrere Produkte gleichzeitig ändern
- [ ] Bei Kauf: Bestand wird automatisch -1
- [ ] Nutzer sieht Stückzahl im Produktkatalog ("Noch X Stück verfügbar")
- [ ] Bei 0 Stück: "Kaufen" Button deaktiviert
- [ ] Beim System-Reset: Bestand wird auf Seed-Werte zurückgesetzt

## 6. UI/UX Vorgaben

### Admin-Bestandsübersicht (/admin/inventory)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase Admin                    [Sandra] [Logout]│
├─────────────────────────────────────────────────────────────┤
│ Navigation (horizontal)                                      │
│ [Dashboard] [Nutzer] [Produkte] [Kategorien] [Bestand*]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Bestandsverwaltung                                          │
│                                                              │
│ [Filter: Kategorie ▾] [Filter: Status ▾] [Bestand akt.]    │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ [✓] Bild   Name         Kategorie    Bestand   Status    ││
│ ├──────────────────────────────────────────────────────────┤│
│ │ [ ] 🍎    Apfel         Obst         15        🟢 OK     ││
│ │ [ ] 🥜    Nüsse         Snacks        2        🔴 Niedrig││
│ │ [✓] 🍫    Schokolade    Süß           0        ⚫ Leer   ││
│ │ [ ] 🥤    Shake         Getränke     12        🟢 OK     ││
│ │ ...                                                       ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ Legende: 🟢 >3 Stück, 🔴 <=3 Stück, ⚫ 0 Stück             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Bulk-Update Modal

```
┌─────────────────────────────────────────────────────────────┐
│                 Bestand aktualisieren                  [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Ausgewählte Produkte: 2                                     │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Schokolade                                            │   │
│ │ Aktuell: 0 Stück                                      │   │
│ │ Neu: [____10____] [+10] [+20] [Max]                 │   │
│ │                                                       │   │
│ │ Nüsse                                                 │   │
│ │ Aktuell: 2 Stück                                      │   │
│ │ Neu: [____15____] [+10] [+20] [Max]                 │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│              [Abbrechen]  [Speichern]                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Nutzer-Produktkatalog (mit Bestandsanzeige)

```
┌──────────┐
│ [Bild]   │
│ Apfel    │
│ 1.50 €   │
│ ✅ Noch 15 Stück verfügbar
│ [Kaufen] │
└──────────┘

┌──────────┐
│ [Bild]   │
│ Nüsse    │
│ 2.50 €   │
│ ⚠️ Nur noch 2 Stück verfügbar
│ [Kaufen] │
└──────────┘

┌──────────┐
│ [Bild]   │
│ Schoko   │
│ 1.80 €   │
│ ❌ Nicht verfügbar
│ [Ausverkauft] (deaktiviert)
└──────────┘
```

## 7. Technische Anforderungen

### Datenmodell (Erweiterung)

```typescript
// server/db/schema.ts

// Neue Tabelle: inventory
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull().unique(),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(3).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id), // Admin-ID
});

// Neue Tabelle: inventory_history (Optional, für Should-Have)
export const inventoryHistory = pgTable('inventory_history', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  changedBy: integer('changed_by').references(() => users.id).notNull(),
  oldQuantity: integer('old_quantity').notNull(),
  newQuantity: integer('new_quantity').notNull(),
  changeType: varchar('change_type', { length: 20 }).notNull(), // 'purchase', 'restock', 'reset'
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Seed-Daten (Beispiel)

```typescript
// Bei System-Reset oder Initial-Seed:
const defaultInventory = [
  { productId: 1, stockQuantity: 15 }, // Apfel
  { productId: 2, stockQuantity: 10 }, // Nüsse
  { productId: 3, stockQuantity: 8 },  // Proteinriegel
  { productId: 4, stockQuantity: 12 }, // Shake
  { productId: 5, stockQuantity: 20 }, // Wasser
  // ... alle Produkte
];
```

## 8. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|--------|--------------|
| `/api/admin/inventory` | GET | Bestandsübersicht abrufen |
| `/api/admin/inventory` | PATCH | Bestand aktualisieren (Bulk) |
| `/api/inventory/:productId` | GET | Bestand für ein Produkt (für Nutzer) |

### Beispiel-Requests

**GET /api/admin/inventory**
```json
{
  "inventory": [
    {
      "productId": 1,
      "productName": "Apfel",
      "stockQuantity": 15,
      "lowStockThreshold": 3,
      "status": "ok",
      "updatedAt": "2026-03-04T10:30:00Z"
    },
    {
      "productId": 2,
      "productName": "Nüsse",
      "stockQuantity": 2,
      "lowStockThreshold": 3,
      "status": "low",
      "updatedAt": "2026-03-04T09:15:00Z"
    }
  ]
}
```

**PATCH /api/admin/inventory**
```json
{
  "updates": [
    { "productId": 2, "stockQuantity": 15 },
    { "productId": 5, "stockQuantity": 10 }
  ]
}
```

## 9. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Kauf bei 0 Stück | Fehlermeldung "Produkt nicht verfügbar", Kauf abgebrochen |
| EC-2 | Parallele Käufe (Race Condition) | Datenbanksperre (Row-Level Lock), nur ein Kauf gewinnt |
| EC-3 | Admin setzt negativen Bestand | Validierung: Min. 0, Fehlermeldung |
| EC-4 | Bestand aktualisieren bei laufender Bestellung | Erlaubt, aber Warnung "Produkt hat offene Bestellungen" |
| EC-5 | System-Reset | Bestand wird auf Seed-Werte zurückgesetzt |
| EC-6 | Produkt deaktiviert (FEAT-10) | Bestand bleibt erhalten, aber nicht kaufbar |
| EC-7 | Bulk-Update mit ungültigen Werten | Validierung: Alle oder keine Änderung (Transaktion) |
| EC-8 | Nutzer kauft zeitgleich mit Admin-Bestandsänderung | Datenbanksperre, eine Operation gewinnt |

## 10. Performance-Anforderungen

- **Bestandsübersicht laden:** <300ms
- **Bulk-Update:** <500ms (auch bei 50+ Produkten)
- **Bestandsabfrage für Nutzer:** <100ms (gecacht im Frontend)

## 11. Security

- **Nur Admin-Zugriff:** Alle `/api/admin/inventory` Endpoints nur für Admin-Rolle
- **Validierung:** Bestandswerte zwischen 0 und 999
- **Audit-Log:** Alle Änderungen in `inventory_history` protokolliert

## 12. Abhängigkeiten zu anderen Features

- **FEAT-7 (One-Touch-Kauf):** Muss erweitert werden um Bestandsprüfung
- **FEAT-11 (Bestellabholung):** Benötigt Bestandsinfo für Abholung
- **FEAT-13 (Low-Stock-Benachrichtigungen):** Nutzt `lowStockThreshold` aus dieser Tabelle

## 13. Hinweise für Entwickler

- **Atomare Transaktionen:** Bestandsreduzierung und Kauf-Speicherung in einer DB-Transaktion
- **Row-Level Locks:** Bei Kauf-Prozess `FOR UPDATE` verwenden um Race Conditions zu vermeiden
- **Frontend-Caching:** Bestandszahlen für 30 Sekunden cachen (nicht kritisch für Demo)

---

**Status:** 🔵 Planned  
**Nächster Schritt:** Nach Approval → Solution Architect (Tech-Design)
