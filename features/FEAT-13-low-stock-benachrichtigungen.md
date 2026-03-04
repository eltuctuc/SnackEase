# FEAT-13: Low-Stock-Benachrichtigungen

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-5 (Admin-Basis) - für Admin-Zugriff
- Benötigt: FEAT-12 (Bestandsverwaltung) - für Bestandsdaten und Schwellwerte

## 1. Overview

**Beschreibung:** Admin erhält automatische Benachrichtigungen, wenn Produktbestände unter einen definierten Schwellwert fallen.

**Ziel:** Proaktive Nachbestellung ermöglichen, um Ausfälle zu vermeiden.

**Schwellwert:** Fest bei ≤3 Stück (wie in FEAT-12 definiert).

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin möchte ich benachrichtigt werden, wenn ein Produkt unter 3 Stück fällt | Must-Have |
| US-2 | Als Admin möchte ich alle Low-Stock-Warnungen zentral sehen | Must-Have |
| US-3 | Als Admin möchte ich Benachrichtigungen als "gelesen" markieren können | Should-Have |
| US-4 | Als Admin möchte ich E-Mail-Benachrichtigungen erhalten (optional) | Nice-to-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | In-App Benachrichtigung bei Low-Stock (Badge im Header) | Must-Have |
| REQ-2 | Liste aller Low-Stock-Produkte auf /admin/notifications | Must-Have |
| REQ-3 | Echtzeit-Benachrichtigung nach Kauf (wenn Schwellwert erreicht) | Must-Have |
| REQ-4 | "Gelesen" markieren (einzeln oder alle) | Should-Have |
| REQ-5 | E-Mail-Benachrichtigung an Admin (optional) | Nice-to-Have |
| REQ-6 | Warnungen verschwinden automatisch nach Auffüllen (>3 Stück) | Must-Have |

## 4. Benachrichtigungs-Workflow

### Trigger: Nach Kauf

```
1. Nutzer kauft Produkt (FEAT-7)
       ↓
2. Bestand wird reduziert (FEAT-12)
       ↓
3. [Wenn Bestand <= 3 Stück]
       ↓
4. System erstellt Low-Stock-Benachrichtigung
       ↓
5. Admin sieht Badge im Header: 🔔 (1)
       ↓
6. Optional: E-Mail an Admin
```

### Trigger: Manuelles Auffüllen

```
1. Admin füllt Bestand auf (FEAT-12)
       ↓
2. [Wenn neuer Bestand > 3 Stück]
       ↓
3. System entfernt Low-Stock-Warnung automatisch
       ↓
4. Badge-Zähler wird aktualisiert
```

### Admin-Sicht: Benachrichtigungen ansehen

```
1. Admin klickt auf Benachrichtigungs-Badge
       ↓
2. Dropdown oder Weiterleitung zu /admin/notifications
       ↓
3. Liste aller Low-Stock-Produkte:
   - Produktname
   - Aktueller Bestand
   - Zeitpunkt der Warnung
   - Button "Bestand auffüllen" → Link zu /admin/inventory
       ↓
4. Admin kann Benachrichtigungen als "gelesen" markieren
```

## 5. Acceptance Criteria

- [ ] Bei Bestand ≤3 Stück: Low-Stock-Benachrichtigung erstellt
- [ ] Badge im Admin-Header zeigt Anzahl ungelesener Warnungen
- [ ] /admin/notifications listet alle Low-Stock-Produkte
- [ ] "Bestand auffüllen" Button leitet zu /admin/inventory
- [ ] Nach Auffüllen (>3 Stück): Warnung verschwindet automatisch
- [ ] "Gelesen" markieren: Badge-Zähler wird aktualisiert
- [ ] Optional: E-Mail bei Low-Stock

## 6. UI/UX Vorgaben

### Admin-Header mit Badge

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase Admin    [🔔 3]         [Sandra] [Logout] │
│                            └─── Badge mit Anzahl             │
└─────────────────────────────────────────────────────────────┘
```

### Benachrichtigungs-Dropdown (beim Klick auf Badge)

```
┌─────────────────────────────────────────────────────────────┐
│                  🔔 Benachrichtigungen                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ⚠️ Nüsse (2 Stück)                                          │
│    Warnung seit: 04.03.2026 10:30                           │
│    [Bestand auffüllen] [Gelesen]                            │
│                                                              │
│ ⚠️ Schokolade (0 Stück)                                     │
│    Warnung seit: 04.03.2026 09:15                           │
│    [Bestand auffüllen] [Gelesen]                            │
│                                                              │
│ ⚠️ Proteinriegel (3 Stück)                                  │
│    Warnung seit: 04.03.2026 08:45                           │
│    [Bestand auffüllen] [Gelesen]                            │
│                                                              │
│                    [Alle als gelesen markieren]             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Benachrichtigungs-Seite (/admin/notifications)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase Admin    [🔔 3]         [Sandra] [Logout] │
├─────────────────────────────────────────────────────────────┤
│ Navigation (horizontal)                                      │
│ [Dashboard] [Nutzer] [Produkte] [Bestand] [Benachr.*]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Low-Stock-Benachrichtigungen                                │
│                                                              │
│ [Filter: Alle ▾] [Filter: Ungelesen]  [Alle als gelesen]   │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ ⚠️ Kritisch: 0 Stück                                     ││
│ │                                                           ││
│ │ Schokolade                                               ││
│ │ Kategorie: Süß                                           ││
│ │ Warnung seit: 04.03.2026 09:15 Uhr                       ││
│ │                                                           ││
│ │ [Bestand auffüllen]  [Als gelesen markieren]            ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ ⚠️ Niedrig: 2 Stück                                      ││
│ │                                                           ││
│ │ Nüsse                                                    ││
│ │ Kategorie: Snacks                                        ││
│ │ Warnung seit: 04.03.2026 10:30 Uhr                       ││
│ │                                                           ││
│ │ [Bestand auffüllen]  [Als gelesen markieren]            ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 7. Technische Anforderungen

### Datenmodell

```typescript
// server/db/schema.ts

export const lowStockNotifications = pgTable('low_stock_notifications', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  stockQuantity: integer('stock_quantity').notNull(), // Bestand zum Zeitpunkt der Warnung
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

// Index für schnelle Abfragen
// CREATE INDEX idx_lowstock_unread ON low_stock_notifications (is_read, product_id);
```

### Trigger-Logik (nach Kauf)

```typescript
// server/api/purchases.post.ts (Erweiterung zu FEAT-7)

export default defineEventHandler(async (event) => {
  // ... bestehender Kauf-Code ...
  
  // NACH Bestandsreduzierung:
  const updatedStock = await getProductStock(productId);
  
  if (updatedStock <= 3) {
    // Prüfe ob bereits eine Warnung existiert
    const existingNotification = await db
      .select()
      .from(lowStockNotifications)
      .where(eq(lowStockNotifications.productId, productId))
      .limit(1);
    
    if (existingNotification.length === 0) {
      // Neue Warnung erstellen
      await db.insert(lowStockNotifications).values({
        productId,
        stockQuantity: updatedStock,
      });
      
      // Optional: E-Mail senden
      // await sendLowStockEmail(productId, updatedStock);
    }
  }
  
  // ... Rest des Kauf-Codes ...
});
```

### Auto-Entfernung bei Auffüllen

```typescript
// server/api/admin/inventory.patch.ts (Erweiterung zu FEAT-12)

export default defineEventHandler(async (event) => {
  const { updates } = await readBody(event);
  
  for (const update of updates) {
    const { productId, stockQuantity } = update;
    
    // Bestand aktualisieren
    await db.update(inventory)
      .set({ stockQuantity, updatedAt: new Date() })
      .where(eq(inventory.productId, productId));
    
    // Wenn Bestand > 3: Warnung entfernen
    if (stockQuantity > 3) {
      await db.delete(lowStockNotifications)
        .where(eq(lowStockNotifications.productId, productId));
    }
  }
  
  return { success: true };
});
```

### E-Mail-Benachrichtigung (Optional)

```typescript
// server/utils/sendLowStockEmail.ts

export async function sendLowStockEmail(productId: number, stockQuantity: number) {
  const product = await getProductById(productId);
  const admin = await getAdminUser();
  
  // Beispiel mit Resend oder Nodemailer
  await sendEmail({
    to: admin.email,
    subject: `⚠️ Low Stock: ${product.name} (${stockQuantity} Stück)`,
    html: `
      <h2>Low-Stock-Warnung</h2>
      <p>Das Produkt <strong>${product.name}</strong> hat nur noch <strong>${stockQuantity} Stück</strong> im Automaten.</p>
      <p>Bitte Nachbestellung veranlassen.</p>
      <a href="https://snackease.app/admin/inventory">Bestand auffüllen</a>
    `,
  });
}
```

## 8. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|--------|--------------|
| `/api/admin/notifications` | GET | Alle Low-Stock-Benachrichtigungen |
| `/api/admin/notifications/:id/read` | POST | Benachrichtigung als gelesen markieren |
| `/api/admin/notifications/read-all` | POST | Alle als gelesen markieren |

### Beispiel-Requests

**GET /api/admin/notifications**
```json
{
  "notifications": [
    {
      "id": 1,
      "productId": 2,
      "productName": "Nüsse",
      "productCategory": "Snacks",
      "stockQuantity": 2,
      "isRead": false,
      "createdAt": "2026-03-04T10:30:00Z"
    },
    {
      "id": 2,
      "productId": 5,
      "productName": "Schokolade",
      "productCategory": "Süß",
      "stockQuantity": 0,
      "isRead": false,
      "createdAt": "2026-03-04T09:15:00Z"
    }
  ],
  "unreadCount": 2
}
```

**POST /api/admin/notifications/:id/read**
```json
{
  "success": true,
  "message": "Benachrichtigung als gelesen markiert"
}
```

## 9. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Mehrere Käufe gleichzeitig | Nur eine Warnung pro Produkt (keine Duplikate) |
| EC-2 | Bestand fällt von 5 auf 0 (mehrere Käufe) | Nur eine Warnung (beim ersten Unterschreiten von 3) |
| EC-3 | Admin füllt auf, dann Kauf reduziert wieder auf ≤3 | Neue Warnung wird erstellt |
| EC-4 | Admin markiert als "gelesen", dann weiterer Kauf | Bestehende Warnung bleibt (Bestand bleibt ≤3) |
| EC-5 | Bestand bei 3, Admin "gelesen", dann Bestand auf 2 | Keine neue Warnung (bereits existiert) |
| EC-6 | System-Reset | Alle Warnungen werden gelöscht |
| EC-7 | E-Mail-Versand fehlschlägt | Fehler loggen, aber Warnung trotzdem erstellen |

## 10. Performance-Anforderungen

- **Benachrichtigungen laden:** <200ms
- **Badge-Aktualisierung:** Echtzeit (max. 1s Verzögerung)
- **"Gelesen" markieren:** <100ms

## 11. Security

- **Nur Admin-Zugriff:** Alle Endpoints nur für Admin-Rolle
- **Validierung:** Nur existierende Benachrichtigungen können gelesen werden

## 12. Abhängigkeiten zu anderen Features

- **FEAT-7 (One-Touch-Kauf):** Trigger für Low-Stock-Benachrichtigungen
- **FEAT-12 (Bestandsverwaltung):** Nutzt `lowStockThreshold` und Auto-Entfernung bei Auffüllen
- **FEAT-10 (Erweitertes Admin-Dashboard):** Benachrichtigungs-Badge im Admin-Header

## 13. Hinweise für Entwickler

- **Duplikate vermeiden:** Vor dem Erstellen einer Warnung prüfen ob bereits eine existiert
- **Transaktionen:** Bestandsreduzierung + Warnung-Erstellung in einer Transaktion
- **E-Mail-Rate-Limiting:** Max. 1 E-Mail pro Produkt pro Tag (um Spam zu vermeiden)

---

**Status:** 🔵 Planned  
**Nächster Schritt:** Nach Approval → Solution Architect (Tech-Design)
