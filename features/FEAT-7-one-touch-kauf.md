# FEAT-7: One-Touch Kauf

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-2 (Demo User Authentication) - für User-Identifikation
- Benötigt: FEAT-4 (Demo-Guthaben) - für Guthaben-Prüfung
- Benötigt: FEAT-6 (Produktkatalog) - für Produktinformationen

## 1. Overview

**Beschreibung:** Ermöglicht den Kauf eines Produkts mit nur einem Klick/Tap.

**Ziel:** Schnellster möglicher Kaufprozess für Vielbeschäftigte.

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
3. [Wenn genug] → Guthaben abziehen + Kauf speichern
       ↓
4. Erfolgsbestätigung anzeigen
       ↓
5. Leaderboard aktualisieren (Bonus-Punkte)
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
- [ ] Bei genug Guthaben: Kauf wird durchgeführt
- [ ] Bei zu wenig Guthaben: Fehlermeldung "Nicht genug Guthaben"
- [ ] Nach Kauf: Bestätigungsanimation/-toast
- [ ] Guthaben wird sofort aktualisiert
- [ ] Kauf wird in Historie gespeichert

## 7. UI/UX Vorgaben

- "Kaufen" Button prominent auf Produktkarte
- Bei Klick: Kurze Ladeanimation (0.5s)
- Erfolgsbestätigung: Check-Animation + "Gekauft!" Text
- Aktuelles Guthaben immer sichtbar
- Farbiger Button (grün oder Markenfarbe)

## 8. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **Atomare Transaktion:** 
  1. Guthaben prüfen
  2. Guthaben abziehen
  3. Kauf speichern
  4. Punkte berechnen (optional)
- **Tabelle:** `purchases` (neu)

### Datenmodell

```typescript
// server/db/schema.ts
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  bonusPoints: integer('bonus_points').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## 9. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/purchases` | POST | Kauf tätigen |

## 10. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Nicht genug Guthaben | Fehlermeldung, Kauf abgebrochen |
| EC-2 | Produkt nicht mehr vorrätig | "Nicht mehr verfügbar" |
| EC-3 | Doppelter Klick | Debounce, nur ein Kauf |
| EC-4 | DB-Fehler | Rollback, Guthaben nicht abgezogen |
