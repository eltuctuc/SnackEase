# FEAT-11: Bestellabholung am Automaten

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-2 (Demo User Authentication) - für User-Identifikation
- Benötigt: FEAT-7 (One-Touch-Kauf) - für Bestellungen
- Benötigt: FEAT-12 (Bestandsverwaltung) - für Verfügbarkeitsprüfung

## 1. Overview

**Beschreibung:** Nutzer können ihre online gekauften Produkte am physischen Automaten abholen (simuliert als Demo).

**Ziel:** Realistische Simulation eines Abholprozesses mit NFC/PIN, inklusive 2-Stunden Abholfrist.

**Wichtig:** Dies ist eine **Demo-Simulation**! Es gibt keinen echten Automaten. Das Feature simuliert die Automaten-Integration für Demo-Zwecke.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich nach dem Kauf sehen, dass meine Bestellung am Automaten bereit steht | Must-Have |
| US-2 | Als Nutzer möchte ich die Abholung per NFC simulieren können | Must-Have |
| US-3 | Als Nutzer möchte ich alternativ eine PIN-Eingabe nutzen können | Must-Have |
| US-4 | Als Nutzer möchte ich sehen, wie lange meine Bestellung noch abholbar ist (2 Stunden) | Must-Have |
| US-5 | Als Nutzer möchte ich eine Benachrichtigung erhalten, wenn meine Bestellung nicht abgeholt wurde | Should-Have |
| US-6 | Als Nutzer möchte ich meine abgeholten Bestellungen in der Historie sehen | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Nach Kauf: Status "Bereit zur Abholung" anzeigen | Must-Have |
| REQ-2 | Countdown-Timer: 2 Stunden ab Kaufzeitpunkt | Must-Have |
| REQ-3 | NFC-Simulation: Button "Mit NFC abholen" | Must-Have |
| REQ-4 | PIN-Simulation: 4-stellige PIN anzeigen + Eingabefeld | Must-Have |
| REQ-5 | Automatische Stornierung + Guthaben-Rückerstattung nach 2 Stunden | Must-Have |
| REQ-6 | Bestätigungs-Animation nach erfolgreicher Abholung | Must-Have |
| REQ-7 | Bestellungen in 3 Stati: "Bereit", "Abgeholt", "Storniert" | Must-Have |
| REQ-8 | Erklärungstext für Demo-Tester ("Dies ist eine Simulation") | Must-Have |
| REQ-9 | Push-Benachrichtigung bei Stornierung (optional) | Should-Have |

## 4. Abholprozess

### Workflow: Nach dem Kauf

```
1. Nutzer kauft Produkt (FEAT-7)
       ↓
2. System erstellt Bestellung mit Status "pending_pickup"
       ↓
3. Nutzer sieht Bestätigungsseite:
   - ✅ "Bestellung erfolgreich!"
   - 📍 "Abholbar am Automaten (Standort: Nürnberg)"
   - ⏱️ "Noch 1h 59min Zeit"
   - 🔐 "Deine PIN: 1234"
   - 📲 "Oder: Mit NFC abholen"
       ↓
4. Nutzer navigiert zu /orders
   - Sieht offene Bestellung mit Countdown
```

### Workflow: Abholung mit NFC (Simulation)

```
1. Nutzer öffnet Bestellung
       ↓
2. Klickt "Mit NFC abholen"
       ↓
3. Animation: "NFC erkannt... Produkt wird ausgegeben"
       ↓
4. Nach 2 Sekunden: 
   - Status → "picked_up"
   - Toast: "Bestellung abgeholt! Guten Appetit!"
   - Countdown stoppt
```

### Workflow: Abholung mit PIN (Simulation)

```
1. Nutzer öffnet Bestellung
       ↓
2. Sieht "Deine PIN: 1234"
       ↓
3. Klickt "PIN eingeben"
       ↓
4. Modal öffnet sich: Eingabefeld
       ↓
5. Nutzer tippt PIN ein
       ↓
6. [Falsche PIN] → Fehlermeldung "PIN falsch"
       ↓
7. [Richtige PIN] → Animation: "Produkt wird ausgegeben"
       ↓
8. Status → "picked_up"
```

### Workflow: Automatische Stornierung

```
Hintergrund-Job (läuft jede Minute):
1. Prüfe alle Bestellungen mit Status "pending_pickup"
       ↓
2. Wenn (createdAt + 2 Stunden) < Jetzt:
       ↓
3. Status → "cancelled"
       ↓
4. Guthaben zurückerstatten (purchase.price → user.balance)
       ↓
5. Optional: Push-Benachrichtigung an Nutzer
```

## 5. Acceptance Criteria

- [ ] Nach Kauf: Bestellung mit Status "pending_pickup" erstellt
- [ ] Bestätigungsseite zeigt: Standort, PIN, Countdown
- [ ] NFC-Button: Simuliert Abholung, Status → "picked_up"
- [ ] PIN-Eingabe: Nur richtige PIN führt zu Abholung
- [ ] Countdown: Zeigt verbleibende Zeit in "Xh Xmin"
- [ ] Nach 2 Stunden: Automatische Stornierung + Guthaben zurück
- [ ] Bestellungen-Seite: Zeigt alle Bestellungen (bereit/abgeholt/storniert)
- [ ] Erklärungstext: "Dies ist eine Demo-Simulation" sichtbar

## 6. UI/UX Vorgaben

### Bestätigungsseite (nach Kauf)

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    ✅ Bestellung erfolgreich!               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  📦 Apfel (1.50 €)                                 │    │
│  │                                                     │    │
│  │  📍 Abholbar am Automaten                          │    │
│  │     Standort: Nürnberg, Büro 1. OG                │    │
│  │                                                     │    │
│  │  ⏱️ Noch 1h 59min Zeit                             │    │
│  │     (Countdown läuft)                              │    │
│  │                                                     │    │
│  │  🔐 Deine PIN: 1234                                │    │
│  │                                                     │    │
│  │  ┌──────────────────┐  ┌──────────────────┐       │    │
│  │  │ 📲 Mit NFC abhol │  │ 🔢 PIN eingeben   │       │    │
│  │  └──────────────────┘  └──────────────────┘       │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ℹ️ Dies ist eine Demo-Simulation. Es gibt keinen echten   │
│     Automaten. Klicke "Mit NFC abholen" um die Abholung    │
│     zu simulieren.                                          │
│                                                              │
│                    [Zu meinen Bestellungen]                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Bestellungen-Seite (/orders)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase                           [Nina] [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Meine Bestellungen                                          │
│                                                              │
│ [Filter: Alle ▾]                                            │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🟡 Bereit zur Abholung                                   ││
│ │                                                           ││
│ │ Apfel (1.50 €)                                           ││
│ │ 📍 Standort: Nürnberg, Büro 1. OG                        ││
│ │ ⏱️ Noch 1h 32min Zeit                                     ││
│ │ 🔐 PIN: 1234                                              ││
│ │                                                           ││
│ │ [📲 Mit NFC abholen]  [🔢 PIN eingeben]                  ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ ✅ Abgeholt                                               ││
│ │                                                           ││
│ │ Shake (3.00 €)                                           ││
│ │ 📍 Standort: Nürnberg, Büro 1. OG                        ││
│ │ ✓ Abgeholt am: 04.03.2026 10:15 Uhr                     ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ ❌ Storniert (nicht abgeholt)                             ││
│ │                                                           ││
│ │ Nüsse (2.50 €)                                           ││
│ │ ❌ Nicht abgeholt innerhalb 2 Stunden                     ││
│ │ 💰 Guthaben wurde zurückerstattet                         ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### PIN-Eingabe Modal

```
┌─────────────────────────────────────────────────────────────┐
│                      PIN eingeben                      [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Bitte gib deine 4-stellige PIN ein, um die Bestellung      │
│  am Automaten abzuholen.                                    │
│                                                              │
│  Deine PIN: 1234                                            │
│                                                              │
│  ┌─────────────────────────────────────┐                    │
│  │ [____] [____] [____] [____]         │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
│  (Automatische Eingabe per Ziffernblock)                    │
│                                                              │
│              [Abbrechen]  [Bestätigen]                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 7. Technische Anforderungen

### Datenmodell (Erweiterung zu FEAT-7)

```typescript
// server/db/schema.ts

// Erweiterung der purchases-Tabelle
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  bonusPoints: integer('bonus_points').default(0),
  
  // NEU für FEAT-11:
  status: varchar('status', { length: 20 }).default('pending_pickup').notNull(),
  // Status: 'pending_pickup', 'picked_up', 'cancelled'
  
  pickupPin: varchar('pickup_pin', { length: 4 }).notNull(),
  // 4-stellige PIN (z.B. "1234")
  
  pickupLocation: varchar('pickup_location', { length: 50 }).default('Nürnberg').notNull(),
  // Standort des Automaten
  
  expiresAt: timestamp('expires_at').notNull(),
  // Kaufzeitpunkt + 2 Stunden
  
  pickedUpAt: timestamp('picked_up_at'),
  // NULL wenn noch nicht abgeholt
  
  cancelledAt: timestamp('cancelled_at'),
  // NULL wenn nicht storniert
  
  createdAt: timestamp('created_at').defaultNow(),
});
```

### PIN-Generierung

```typescript
// utils/generatePin.ts
export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
```

### Countdown-Logik (Frontend)

```typescript
// composables/useCountdown.ts
export function useCountdown(expiresAt: Date) {
  const now = ref(new Date());
  const remaining = computed(() => {
    const diff = expiresAt.getTime() - now.value.getTime();
    if (diff <= 0) return { hours: 0, minutes: 0, expired: true };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, expired: false };
  });
  
  // Update jede Sekunde
  const interval = setInterval(() => {
    now.value = new Date();
  }, 1000);
  
  onUnmounted(() => clearInterval(interval));
  
  return remaining;
}
```

### Cron-Job: Automatische Stornierung

```typescript
// server/jobs/cancelExpiredOrders.ts
export async function cancelExpiredOrders() {
  const now = new Date();
  
  const expiredOrders = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.status, 'pending_pickup'),
        lt(purchases.expiresAt, now)
      )
    );
  
  for (const order of expiredOrders) {
    // Transaktion: Status + Guthaben zurück
    await db.transaction(async (tx) => {
      // Status → cancelled
      await tx.update(purchases)
        .set({ 
          status: 'cancelled', 
          cancelledAt: now 
        })
        .where(eq(purchases.id, order.id));
      
      // Guthaben zurückerstatten
      await tx.update(users)
        .set({ 
          balance: sql`${users.balance} + ${order.price}` 
        })
        .where(eq(users.id, order.userId));
    });
    
    // Optional: Push-Benachrichtigung
    // await sendPushNotification(order.userId, ...);
  }
}

// In Nitro: server/plugins/cronJobs.ts
export default defineNitroPlugin(() => {
  // Jede Minute prüfen
  setInterval(cancelExpiredOrders, 60 * 1000);
});
```

## 8. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|--------|--------------|
| `/api/orders` | GET | Alle Bestellungen des Nutzers |
| `/api/orders/:id` | GET | Details einer Bestellung |
| `/api/orders/:id/pickup` | POST | Bestellung abholen (NFC oder PIN) |

### Beispiel-Requests

**GET /api/orders**
```json
{
  "orders": [
    {
      "id": 1,
      "productName": "Apfel",
      "price": "1.50",
      "status": "pending_pickup",
      "pickupPin": "1234",
      "pickupLocation": "Nürnberg, Büro 1. OG",
      "expiresAt": "2026-03-04T12:30:00Z",
      "createdAt": "2026-03-04T10:30:00Z"
    },
    {
      "id": 2,
      "productName": "Shake",
      "price": "3.00",
      "status": "picked_up",
      "pickedUpAt": "2026-03-04T10:15:00Z",
      "createdAt": "2026-03-04T09:00:00Z"
    }
  ]
}
```

**POST /api/orders/:id/pickup**
```json
// Mit PIN
{
  "method": "pin",
  "pin": "1234"
}

// Mit NFC (Simulation)
{
  "method": "nfc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bestellung erfolgreich abgeholt!",
  "order": {
    "id": 1,
    "status": "picked_up",
    "pickedUpAt": "2026-03-04T11:00:00Z"
  }
}
```

## 9. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Falsche PIN eingegeben | Fehlermeldung "PIN falsch", max. 3 Versuche |
| EC-2 | Bestellung bereits abgeholt | "Diese Bestellung wurde bereits abgeholt" |
| EC-3 | Bestellung abgelaufen (>2 Stunden) | Status "cancelled", Abholung nicht mehr möglich |
| EC-4 | Nutzer versucht Abholung nach Stornierung | "Bestellung wurde storniert, Guthaben zurückerstattet" |
| EC-5 | Parallele Abholversuche (Doppelklick) | Debounce, nur eine Abholung |
| EC-6 | Cron-Job läuft während Abholung | Datenbanksperre, eine Operation gewinnt |
| EC-7 | Countdown auf 0 während Nutzer auf Seite | Auto-Reload oder Toast: "Bestellung abgelaufen" |
| EC-8 | Nutzer hat mehrere offene Bestellungen | Alle anzeigen, jeweils mit eigenem Countdown |

## 10. Demo-Erklärungen

Da es keinen echten Automaten gibt, müssen Demo-Tester verstehen, was simuliert wird:

### Erklärungstext auf Bestätigungsseite

```
ℹ️ Demo-Hinweis:
Dies ist eine Simulation eines Smart-Vending-Systems. 
In der Realität würde der Automat die Bestellung per NFC 
oder PIN-Eingabe ausgeben. Klicke "Mit NFC abholen" um 
den Abholprozess zu simulieren.
```

### Hilfe-Tooltip bei NFC-Button

```
💡 So funktioniert's:
1. In der Realität: Halte dein Handy an den Automaten
2. In der Demo: Klicke diesen Button
3. Ergebnis: Produkt wird ausgegeben (simuliert)
```

## 11. Performance-Anforderungen

- **Bestellungen laden:** <200ms
- **NFC-Abholung (Simulation):** 2s Animation
- **PIN-Validierung:** <100ms
- **Countdown-Update:** Jede Sekunde (Frontend)
- **Cron-Job:** Jede Minute (Backend)

## 12. Security

- **PIN-Validierung:** Backend prüft PIN, nicht Frontend
- **Rate Limiting:** Max. 3 PIN-Versuche pro Bestellung
- **Autorisierung:** Nutzer kann nur eigene Bestellungen abholen

## 13. Abhängigkeiten zu anderen Features

- **FEAT-7 (One-Touch-Kauf):** Muss erweitert werden um `status`, `pickupPin`, `expiresAt`
- **FEAT-12 (Bestandsverwaltung):** Bei Abholung wird Bestand **nicht** erneut reduziert (bereits bei Kauf reduziert)
- **FEAT-13 (Low-Stock-Benachrichtigungen):** Keine direkte Abhängigkeit

---

**Status:** 🔵 Planned  
**Nächster Schritt:** Nach Approval → Solution Architect (Tech-Design)
