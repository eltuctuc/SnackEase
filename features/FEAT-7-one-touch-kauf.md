# FEAT-7: One-Touch Kauf

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-2 (Demo User Authentication) - für User-Identifikation
- Benötigt: FEAT-4 (Demo-Guthaben) - für Guthaben-Prüfung
- Benötigt: FEAT-6 (Produktkatalog) - für Produktinformationen

## Nachfolgende Features
- Wird erweitert durch: FEAT-11 (Bestellabholung am Automaten) - fügt Abholstatus und PIN hinzu
- Wird erweitert durch: FEAT-12 (Bestandsverwaltung) - fügt Bestandsprüfung vor Kauf hinzu

## 1. Overview

**Beschreibung:** Ermöglicht den Kauf eines Produkts mit nur einem Klick/Tap (digital-only).

**Ziel:** Schnellster möglicher Kaufprozess für Vielbeschäftigte.

**Scope:** Dieses Feature deckt nur den **digitalen Kaufprozess** ab. Die physische Abholung am Automaten wird in FEAT-11 umgesetzt.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich ein Produkt mit einem Klick kaufen | Must-Have |
| US-2 | Als Nutzer möchte ich eine Bestätigung nach dem Kauf sehen | Must-Have |
| US-3 | Als Nutzer möchte ich wissen, ob genug Guthaben vorhanden ist | Must-Have |
| US-4 | Als Nutzer möchte ich Bonuspunkte für gesunde Produkte sammeln | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | One-Touch Button auf jedem Produkt | Must-Have |
| REQ-2 | Direkter Kauf ohne Warenkorb | Must-Have |
| REQ-3 | Guthaben-Prüfung vor Kauf | Must-Have |
| REQ-4 | Erfolgsbestätigung (Animation/Toast) | Must-Have |
| REQ-5 | Automatischer Guthaben-Abzug | Must-Have |
| REQ-6 | Kontaktlose Abwicklung (kein Scan/Checkout) | Must-Have |
| REQ-7 | Bonuspunkte für gesunde Produkte | Should-Have |

## 4. Kaufprozess

```
1. Nutzer klickt "Kaufen" auf Produkt
       ↓
2. System prüft Guthaben (API-Call)
       ↓
   [Wenn nicht genug] → Fehlermeldung → Abbruch
       ↓
3. System prüft Bestand (FEAT-12)
       ↓
   [Wenn 0 Stück] → Fehlermeldung "Nicht verfügbar" → Abbruch
       ↓
4. [Wenn genug Guthaben UND Bestand] → Transaktion:
   - Guthaben abziehen
   - Bestand -1 (FEAT-12)
   - Kauf speichern mit Status "pending_pickup" (FEAT-11)
   - PIN generieren (FEAT-11)
   - Bonuspunkte berechnen
       ↓
5. Erfolgsbestätigung anzeigen
   → Weiterleitung zur Abholseite (FEAT-11)
       ↓
6. Leaderboard aktualisieren (Bonus-Punkte)
       ↓
7. [Wenn Bestand <= 3] → Low-Stock-Benachrichtigung erstellen (FEAT-13)
```

## 5. Bonuspunkte-Logik (Optional)

| Produkttyp | Punkte |
|------------|--------|
| Obst | +3 Punkte |
| Nüsse | +2 Punkte |
| Proteinriegel | +2 Punkte |
| Shakes | +2 Punkte |
| Schokoriegel | +1 Punkt |
| Getränke | +1 Punkt |

## 6. Acceptance Criteria

- [ ] "Kaufen" Button auf jedem Produkt sichtbar
- [ ] Bei genug Guthaben UND Bestand >0: Kauf wird durchgeführt
- [ ] Bei zu wenig Guthaben: Fehlermeldung "Nicht genug Guthaben"
- [ ] Bei Bestand = 0: "Kaufen" Button deaktiviert + Fehlermeldung (FEAT-12)
- [ ] Nach Kauf: Bestätigungsseite mit Abholinformationen (FEAT-11)
- [ ] Guthaben wird sofort aktualisiert
- [ ] Bestand wird sofort reduziert (FEAT-12)
- [ ] Kauf wird mit Status "pending_pickup" gespeichert (FEAT-11)
- [ ] PIN wird generiert (FEAT-11)
- [ ] Expiresát wird gesetzt (createdAt + 2 Stunden) (FEAT-11)

## 7. UI/UX Vorgaben

### Produktkarte (Kaufen-Button)

- "Kaufen" Button prominent auf Produktkarte
- Bei Bestand = 0: Button deaktiviert + "Nicht verfügbar" Text (FEAT-12)
- Bei Bestand <= 3: Warnung "Nur noch X Stück verfügbar" (FEAT-12)
- Bei Klick: Kurze Ladeanimation (0.5s)
- Aktuelles Guthaben immer sichtbar
- Farbiger Button (grün oder Markenfarbe)

### Nach erfolgreichem Kauf

- **Weiterleitung zur Abholseite** (FEAT-11) statt einfachem Toast
- Abholseite zeigt:
  - ✅ "Bestellung erfolgreich!"
  - 📍 Standort
  - ⏱️ Countdown (2 Stunden)
  - 🔐 PIN
  - 📲 "Mit NFC abholen" / "PIN eingeben" Buttons
- Optional: Toast "Gekauft! → Zur Abholung" mit Link

## 8. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **Atomare Transaktion:** 
  1. Guthaben prüfen
  2. Bestand prüfen (FEAT-12)
  3. Guthaben abziehen
  4. Bestand reduzieren -1 (FEAT-12)
  5. Kauf speichern mit Status "pending_pickup"
  6. PIN generieren (FEAT-11)
  7. Punkte berechnen (optional)
  8. Low-Stock-Benachrichtigung prüfen (FEAT-13)
- **Tabellen:** 
  - `purchases` (neu) - mit Abholfeldern (FEAT-11)
  - `inventory` (FEAT-12) - für Bestandsprüfung
  - `low_stock_notifications` (FEAT-13) - optional nach Kauf

### Datenmodell

```typescript
// server/db/schema.ts
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  bonusPoints: integer('bonus_points').default(0),
  
  // Für FEAT-11 (Bestellabholung):
  status: varchar('status', { length: 20 }).default('pending_pickup').notNull(),
  // Status: 'pending_pickup', 'picked_up', 'cancelled'
  
  pickupPin: varchar('pickup_pin', { length: 4 }).notNull(),
  // 4-stellige PIN (z.B. "1234")
  
  pickupLocation: varchar('pickup_location', { length: 50 }).default('Nürnberg').notNull(),
  // Standort des Automaten
  
  expiresAt: timestamp('expires_at').notNull(),
  // createdAt + 2 Stunden
  
  pickedUpAt: timestamp('picked_up_at'),
  // NULL wenn noch nicht abgeholt
  
  cancelledAt: timestamp('cancelled_at'),
  // NULL wenn nicht storniert
  
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Hinweis:** Diese Felder werden in FEAT-11 detailliert beschrieben, müssen aber bereits bei FEAT-7-Implementation angelegt werden.

### Implementierungs-Beispiel (Pseudo-Code)

```typescript
// server/api/purchases.post.ts
export default defineEventHandler(async (event) => {
  const { productId } = await readBody(event);
  const user = await getCurrentUser(event);
  
  // 1. Produkt laden
  const product = await getProductById(productId);
  
  // 2. Guthaben prüfen
  if (user.balance < product.price) {
    throw createError({
      statusCode: 400,
      message: 'Nicht genug Guthaben'
    });
  }
  
  // 3. Bestand prüfen (FEAT-12)
  const inventory = await getInventory(productId);
  if (inventory.stockQuantity <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Produkt nicht verfügbar'
    });
  }
  
  // 4. Transaktion: Kauf durchführen
  await db.transaction(async (tx) => {
    // Guthaben abziehen
    await tx.update(users)
      .set({ balance: sql`${users.balance} - ${product.price}` })
      .where(eq(users.id, user.id));
    
    // Bestand reduzieren (FEAT-12)
    await tx.update(inventory)
      .set({ stockQuantity: sql`${inventory.stockQuantity} - 1` })
      .where(eq(inventory.productId, productId));
    
    // Kauf speichern
    const purchase = await tx.insert(purchases).values({
      userId: user.id,
      productId: product.id,
      price: product.price,
      bonusPoints: calculateBonusPoints(product),
      status: 'pending_pickup', // FEAT-11
      pickupPin: generatePin(), // FEAT-11
      pickupLocation: 'Nürnberg, Büro 1. OG', // FEAT-11
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // FEAT-11
    }).returning();
    
    // Low-Stock-Benachrichtigung prüfen (FEAT-13)
    const newStock = inventory.stockQuantity - 1;
    if (newStock <= 3) {
      await createLowStockNotification(productId, newStock);
    }
    
    return purchase;
  });
  
  return { success: true, purchase };
});
```

## 9. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/purchases` | POST | Kauf tätigen |

### Request Body

```json
{
  "productId": 1
}
```

### Response (Erfolg)

```json
{
  "success": true,
  "purchase": {
    "id": 123,
    "productId": 1,
    "productName": "Apfel",
    "price": "1.50",
    "status": "pending_pickup",
    "pickupPin": "1234",
    "pickupLocation": "Nürnberg, Büro 1. OG",
    "expiresAt": "2026-03-04T12:30:00Z",
    "createdAt": "2026-03-04T10:30:00Z"
  },
  "newBalance": "23.50"
}
```

### Response (Fehler: Nicht genug Guthaben)

```json
{
  "success": false,
  "error": "Nicht genug Guthaben",
  "currentBalance": "1.00",
  "requiredAmount": "1.50"
}
```

### Response (Fehler: Nicht verfügbar - FEAT-12)

```json
{
  "success": false,
  "error": "Produkt nicht verfügbar",
  "stockQuantity": 0
}
```

## 10. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Nicht genug Guthaben | Fehlermeldung "Nicht genug Guthaben", Kauf abgebrochen |
| EC-2 | Produkt nicht mehr vorrätig (0 Stück) | "Kaufen" Button deaktiviert, Fehlermeldung "Nicht verfügbar" (FEAT-12) |
| EC-3 | Doppelter Klick | Debounce, nur ein Kauf |
| EC-4 | DB-Fehler während Transaktion | Rollback: Guthaben NICHT abgezogen, Bestand NICHT reduziert, Kauf NICHT gespeichert |
| EC-5 | Parallele Käufe (Race Condition bei Bestand) | Row-Level Lock auf inventory-Tabelle, nur ein Kauf gewinnt (FEAT-12) |
| EC-6 | Bestand wird 0 durch diesen Kauf | "Kaufen" Button wird sofort deaktiviert für andere Nutzer (FEAT-12) |
| EC-7 | Admin deaktiviert Produkt während Kauf | Validierung: Kauf nur bei aktiven Produkten |
