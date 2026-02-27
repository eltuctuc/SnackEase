# FEAT-4: Demo-Guthaben-System

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-1 (Admin Authentication) - für Admin-Funktionen
- Benötigt: FEAT-2 (Demo User Authentication) - für User-spezifisches Guthaben
- Benötigt: FEAT-3 (User Switcher) - für User-Wechsel

## 1. Overview

**Beschreibung:** Simuliertes Guthaben-System für die Demo. Guthaben wird nicht wirklich aufgeladen, nur die UI zeigt den Guthabenstand und Simulation des Aufladens.

**Ziel:** Realistische Demonstration des Guthaben-Systems ohne echte Payment-Integration.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Demo-Nutzer möchte ich mein aktuelles Guthaben sehen | Must-Have |
| US-2 | Als Demo-Nutzer möchte ich mein Guthaben per Klick aufladen | Must-Have |
| US-3 | Als Demo-Nutzer möchte ich eine kurze Ladezeit beim Aufladen sehen | Should-Have |
| US-4 | Als Demo-Nutzer möchte ich sehen, wann mein Guthaben zuletzt aufgeladen wurde | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Anzeige des aktuellen Guthabens auf der Startseite | Must-Have |
| REQ-2 | "Guthaben aufladen" Button mit Auswahlmöglichkeit (10€, 25€, 50€) | Must-Have |
| REQ-3 | Simulation der Aufladung mit 2-3 Sekunden Ladezeit | Must-Have |
| REQ-4 | Guthaben-Abzug bei Käufen | Must-Have |
| REQ-5 | Monatliche Gutschrift (simuliert) - 25€ am 1. des Monats | Must-Have |
| REQ-6 | Nicht verbrauchtes Guthaben wird übertragen | Must-Have |

## 4. Startguthaben pro Persona

| Persona | Startguthaben |
|---------|---------------|
| Nina Neuanfang | 25€ |
| Maxine Snackliebhaber | 15€ |
| Lucas Gesundheitsfan | 30€ |
| Alex Gelegenheitskäufer | 20€ |
| Tom Schnellkäufer | 10€ |

## 5. Auflade-Optionen

| Betrag | Beschreibung |
|--------|--------------|
| 10€ | Kleine Aufladung |
| 25€ | Standard (entspricht Monatspauschale) |
| 50€ | Große Aufladung |

## 6. Simulation Logik

1. **Startguthaben:** Jeder Demo-Nutzer erhält initial Guthaben lt. Tabelle oben
2. **Monatliche Gutschrift:** Button "Monatspauschale erhalten" (simuliert 1. des Monats)
3. **Aufladen:** Button zeigt Ladebalken, nach 2-3 Sekunden ist Guthaben verfügbar
4. **Übertrag:** Restguthaben bleibt erhalten (kein Verfall)

## 7. Acceptance Criteria

- [ ] Guthaben wird auf Startseite angezeigt
- [ ] Aufladen-Button öffnet Modal mit Betrag-Auswahl
- [ ] Nach Klick auf Aufladen: Ladeanimation 2-3 Sekunden
- [ ] Nach Ladezeit: Guthaben erhöht sich um gewählten Betrag
- [ ] Guthaben-Abzug bei Kauf wird korrekt berechnet
- [ ] Negatives Guthaben verhindert Kauf

## 8. UI/UX Vorgaben

- Guthaben prominent auf Startseite (Header oder oberer Bereich)
- Farbcodierung: Grün bei >20€, Gelb bei 10-20€, Rot bei <10€
- Aufladen-Button deutlich sichtbar
- Ladeanimation während Aufladung (Spinner oder Fortschrittsbalken)

## 9. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **Neue Tabelle:** `user_credits` (oder Feld in `users`)
- **Schema:**
  ```typescript
  // Option A: Separate Tabelle
  userCredits = pgTable('user_credits', {
    userId: integer('user_id').references(() => users.id),
    balance: decimal('balance', { precision: 10, scale: 2 }).default('0'),
    lastRechargedAt: timestamp('last_recharged_at'),
  });
  
  // Option B: Feld in users-Tabelle
  // balance: decimal('balance', { precision: 10, scale: 2 }).default('0')
  ```
- **Kein echter Payment-Provider** - nur Simulation
- **Transaktionen:** In Neon DB speichern für Historie

## 10. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Nicht genug Guthaben | Kauf verweigern, Fehlermeldung |
| EC-2 | Guthaben = 0 | "Guthaben aufladen" Button prominent |
| EC-3 | Mehrfaches Klicken auf Aufladen | Debounce, nur ein Request |
| EC-4 | DB-Fehler beim Aufladen | Rollback, Fehlermeldung |

---

## 11. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/credits/balance` | GET | Aktuelles Guthaben holen |
| `/api/credits/recharge` | POST | Guthaben aufladen |

## 12. Datenmodell (Neon/Drizzle)

```typescript
// server/db/schema.ts - Erweiterung
export const userCredits = pgTable('user_credits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
  lastRechargedAt: timestamp('last_recharged_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'recharge' | 'purchase'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
```
