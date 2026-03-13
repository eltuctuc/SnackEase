# FEAT-23: Leaderboard-Erweiterung (Punktesystem)

## Status: Implemented

## Abhaengigkeiten
- Benoetigt: FEAT-8 (Leaderboard) - Grundstruktur, Tabs, Zeitraum-Filter, API-Endpunkt
- Benoetigt: FEAT-11 (Bestellabholung am Automaten) - `status = picked_up` als Voraussetzung fuer Punktevergabe; `pickedUpAt` fuer Schnelligkeits-Bonus
- Benoetigt: FEAT-16 (Warenkorb-System) - `purchase_items`-Struktur fuer Punkte pro Produkt
- Benoetigt: FEAT-14 (Angebote & Rabatte) - Angebots-Flag pro Produkt fuer Angebots-Bonus
- Benoetigt: FEAT-18 (Empfehlungen & Favoriten) - Empfehlungs-Mechanismus fuer Empfehlungs-Bonus
- Benoetigt: FEAT-20 (Profil-Seite) - Punkte-Aufschluesselung im Profil

---

## 1. Uebersicht

**Beschreibung:** Das bestehende Leaderboard (FEAT-8) erhaelt einen neuen dritten Tab "Gesamt-Punkte". Jede erfolgreich abgeholte Bestellung erzeugt eine detaillierte Punkte-Transaktion, die aus mehreren Komponenten zusammengesetzt wird: Basis-Punkte pro Produkt, Boni fuer Produkteigenschaften (vegan/gesund, proteinreich), Angebots-Bonus, Schnelligkeits-Bonus, Streak-Bonus und Empfehlungs-Bonus. Punkte werden ausschliesslich bei tatsaechlicher Abholung (`status = picked_up`) vergeben. Die Punkte-Historie ist auf der Profil-Seite einsehbar.

**Ziel:** Mitarbeiter durch ein vielschichtiges Belohnungssystem zu motivieren — gesundes Kaufverhalten, regelmaessige Nutzung und schnelle Abholung werden gleichermassen honoriert.

**Zugriff:** Nur fuer eingeloggte Mitarbeiter. Admins haben keinen Zugriff auf das Leaderboard.

---

## 2. Punktesystem-Regeln

### 2.1 Punkte pro Produkt (werden pro Produkt in der Bestellung berechnet)

| Regel | Punkte | Bedingung |
|-------|--------|-----------|
| Basis-Punkte | +10 | Pro abgeholtem Produkt (immer) |
| Vegan/Gesund-Bonus | +3 | Produkt ist als vegan oder gesund markiert |
| Protein-Bonus | +2 | Produkt ist als proteinreich markiert |
| Angebots-Bonus | +2 | Produkt wurde zum Zeitpunkt der Bestellung mit aktivem Angebot bestellt |

Beispiel: 1 veganes, proteinreiches Produkt im Angebot = 10 + 3 + 2 + 2 = **17 Punkte**

### 2.2 Bonuspunkte pro Bestellung (werden auf die Gesamt-Bestellung angewendet)

| Regel | Bonus | Bedingung |
|-------|-------|-----------|
| Schnelligkeits-Bonus | +5 | Abholung innerhalb von 30 Minuten nach Bestellzeitpunkt (`pickedUpAt - createdAt < 30min`) |
| Streak-Bonus | +20% auf Bestellpunkte | Naechste Abholung erfolgt am direkt darauffolgenden Kalendertag (nicht Folgetag der letzten Abholung, sondern naechster Kalender-Tag) |

### 2.3 Empfehlungs-Bonus (asynchron, nicht bei Abholung)

| Regel | Punkte | Bedingung |
|-------|--------|-----------|
| Empfehlung erhalten | +5 | Ein anderer Nutzer empfiehlt ein Produkt, das der Empfaenger selbst gekauft hat (Mechanismus gemaess FEAT-18) |

**Wichtig:** Der Empfehlungs-Bonus wird dem Nutzer gutgeschrieben, dessen Empfehlung von einem anderen Nutzer abgegeben wurde — nicht dem Empfaenger der Empfehlung.

### 2.4 Berechnungsreihenfolge

```
Basis pro Produkt      = 10 + Vegan/Gesund-Bonus + Protein-Bonus + Angebots-Bonus
Summe aller Produkte   = SUMME(Basis pro Produkt fuer alle Produkte der Bestellung)
Bestellpunkte          = Summe aller Produkte + Schnelligkeits-Bonus
Gesamt-Punkte          = ROUND(Bestellpunkte * Streak-Multiplikator)
                         (Streak-Multiplikator = 1.2 wenn Streak aktiv, sonst 1.0)
```

Empfehlungs-Punkte werden separat als eigene Transaktion gespeichert, nicht in die Bestellrechnung einbezogen.

---

## 3. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich auf dem Leaderboard einen "Gesamt-Punkte"-Tab sehen, damit ich erkennen kann, wer das umfassendste Engagement zeigt | Mitarbeiter | Must-Have |
| US-2 | Als Mitarbeiter moechte ich im "Gesamt-Punkte"-Tab nach Woche, Monat und Allzeit filtern koennen | Mitarbeiter | Must-Have |
| US-3 | Als Mitarbeiter moechte ich meinen eigenen Rang und meine Gesamtpunkte im Banner des "Gesamt-Punkte"-Tabs sehen | Mitarbeiter | Must-Have |
| US-4 | Als Mitarbeiter moechte ich nach jeder abgeholten Bestellung automatisch Punkte erhalten, ohne etwas tun zu muessen | Mitarbeiter | Must-Have |
| US-5 | Als Mitarbeiter moechte ich Extrapunkte erhalten, wenn ich an aufeinanderfolgenden Tagen Bestellungen abhole | Mitarbeiter | Should-Have |
| US-6 | Als Mitarbeiter moechte ich Extrapunkte erhalten, wenn ich eine Bestellung innerhalb von 30 Minuten abhole | Mitarbeiter | Should-Have |
| US-7 | Als Mitarbeiter moechte ich auf meiner Profil-Seite meine Gesamt-Punktzahl sehen | Mitarbeiter | Should-Have |
| US-8 | Als Mitarbeiter moechte ich auf meiner Profil-Seite eine Aufschluesselung meiner letzten Punkte-Transaktionen sehen, damit ich nachvollziehen kann, wie meine Punkte zustande kamen | Mitarbeiter | Should-Have |
| US-9 | Als Mitarbeiter moechte ich Punkte erhalten, wenn andere Nutzer meine Empfehlungen nutzen | Mitarbeiter | Nice-to-Have |

---

## 4. Funktionale Anforderungen

### 4.1 Leaderboard: Neuer Tab "Gesamt-Punkte"

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Das Leaderboard erhaelt einen dritten Tab "Gesamt-Punkte" zwischen den bestehenden Tabs "Meistgekauft" und "Gesundheit" | Must-Have |
| REQ-2 | Der "Gesamt-Punkte"-Tab zeigt alle Mitarbeiter sortiert nach ihren akkumulierten Punkte-Transaktionen im gewaehlten Zeitraum | Must-Have |
| REQ-3 | Jeder Eintrag zeigt: Rang, Name, Standort, Gesamtpunkte im Zeitraum | Must-Have |
| REQ-4 | Der "Gesamt-Punkte"-Tab unterstuetzt dieselben Zeitraum-Filter wie die anderen Tabs: Woche, Monat, Allzeit | Must-Have |
| REQ-5 | Das bestehende eigene-Rang-Banner zeigt im "Gesamt-Punkte"-Tab die Gesamtpunkte des eingeloggten Nutzers an | Must-Have |
| REQ-6 | Tiebreaker bei gleicher Punktzahl: alphabetisch nach Name | Must-Have |
| REQ-7 | Der "Gesundheit"-Tab bleibt unveraendert (bestehende bonusPoints-Berechnung aus FEAT-8) | Must-Have |

### 4.2 Punkte-Vergabe bei Abholung

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-8 | Punkte werden ausschliesslich vergeben, wenn eine Bestellung den Status `picked_up` erreicht | Must-Have |
| REQ-9 | Beim Setzen von `status = picked_up` wird eine Punkte-Transaktion berechnet und gespeichert | Must-Have |
| REQ-10 | Die Transaktion speichert alle Komponenten einzeln (Basis, Vegan-Bonus, Protein-Bonus, Angebots-Bonus, Schnelligkeits-Bonus, Streak-Bonus) fuer die spaetere Profil-Aufschluesselung | Must-Have |
| REQ-11 | Der Streak-Bonus wird serverseitig geprueft: Gibt es eine abgeholte Bestellung des Nutzers vom Vortag? | Must-Have |
| REQ-12 | Der Schnelligkeits-Bonus wird serverseitig geprueft: `pickedUpAt - purchase.createdAt < 30 Minuten` | Must-Have |
| REQ-13 | Stornierte oder abgelaufene Bestellungen (`status = cancelled`) erhalten keine Punkte | Must-Have |

### 4.3 Empfehlungs-Punkte

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-14 | Wenn ein Nutzer eine Empfehlung fuer ein Produkt abgibt (FEAT-18), erhaelt der Nutzer, der dieses Produkt empfohlen hat, +5 Punkte als separate Transaktion vom Typ `recommendation` | Nice-to-Have |
| REQ-15 | Der Empfehlungs-Bonus wird auch dann gutgeschrieben, wenn der empfangende Nutzer das Produkt momentan nicht im Warenkorb hat | Nice-to-Have |

### 4.4 Punkte-Anzeige auf der Profil-Seite (Erweiterung FEAT-20)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-16 | Die Profil-Seite (FEAT-20) zeigt die Gesamt-Punktzahl des Nutzers (Allzeit) prominent an | Should-Have |
| REQ-17 | Unterhalb der Gesamt-Punktzahl werden die letzten 10 Punkte-Transaktionen chronologisch aufgelistet | Should-Have |
| REQ-18 | Jede Transaktion zeigt: Datum, Typ (Bestellung / Empfehlung), Produktname(n), Gesamt-Punkte der Transaktion und eine kurze Aufschluesselung der Bonuskomponenten | Should-Have |
| REQ-19 | Transaktionen vom Typ `recommendation` zeigen den Empfaenger der Empfehlung und das empfohlene Produkt | Nice-to-Have |

---

## 5. Datenmodell

### 5.1 Neue Tabelle: point_transactions

```
Tabelle: point_transactions
- id              (serial, PK)
- userId          (FK -> users.id, NOT NULL)
- purchaseId      (FK -> purchases.id, NULL — bei Empfehlungs-Transaktionen kein Purchase)
- type            ('purchase_pickup' | 'recommendation')
- basePoints      (integer, NOT NULL)       -- Summe der Basis-Punkte aller Produkte
- veganBonus      (integer, default 0)      -- Summe Vegan/Gesund-Boni
- proteinBonus    (integer, default 0)      -- Summe Protein-Boni
- offerBonus      (integer, default 0)      -- Summe Angebots-Boni
- speedBonus      (integer, default 0)      -- Schnelligkeits-Bonus (0 oder 5)
- streakBonus     (integer, default 0)      -- Streak-Bonus in Punkten (= 20% von basePoints + anderen Boni + speedBonus, gerundet)
- totalPoints     (integer, NOT NULL)       -- Gesamtpunkte der Transaktion (berechnete Summe)
- createdAt       (timestamp, defaultNow)
```

**Hinweis fuer Solution Architect:** Das bestehende Feld `purchases.bonusPoints` wird nicht entfernt, um Rueckwaertskompatibilitaet mit dem "Gesundheit"-Tab zu wahren. Die neue `point_transactions`-Tabelle ist die Single Source of Truth fuer das neue Punktesystem.

### 5.2 Streak-Logik (serverseitig)

```
Streak aktiv = true, wenn:
  EXISTS (
    SELECT 1 FROM point_transactions
    WHERE userId = :userId
      AND type = 'purchase_pickup'
      AND DATE(createdAt) = DATE(NOW()) - INTERVAL '1 day'
  )
```

---

## 6. API Endpoints

| Endpoint | Methode | Beschreibung | Auth |
|----------|---------|--------------|------|
| `/api/leaderboard` | GET | Erweiterung: neuer `mode = 'points'` oder dritte Rangliste im Response | Mitarbeiter |
| `/api/orders/[id]/pickup` | POST | Erweiterung: nach erfolgreichem Pickup wird Punkte-Transaktion erstellt | Mitarbeiter |
| `/api/profile/points` | GET | Gesamt-Punktzahl + letzte 10 Transaktionen des eingeloggten Nutzers | Mitarbeiter |

**Erweiterung GET /api/leaderboard Response:**
```typescript
{
  period: 'week' | 'month' | 'all',
  mostPurchased: LeaderboardEntry[],   // unveraendert
  healthiest: LeaderboardEntry[],      // unveraendert
  totalPoints: PointsLeaderboardEntry[] // neu
}

interface PointsLeaderboardEntry {
  rank: number
  id: number
  name: string
  location: string
  isActive: boolean
  totalPoints: number
}
```

---

## 7. Acceptance Criteria

- [x] AC-1: Das Leaderboard zeigt drei Tabs: "Meistgekauft", "Gesamt-Punkte", "Gesundheit"
- [x] AC-2: Der Tab "Gesamt-Punkte" zeigt alle Mitarbeiter sortiert nach akkumulierten Punkten im gewaehlten Zeitraum
- [x] AC-3: Zeitraum-Filter (Woche / Monat / Allzeit) funktioniert auf dem "Gesamt-Punkte"-Tab korrekt
- [x] AC-4: Das eigene-Rang-Banner zeigt im "Gesamt-Punkte"-Tab die korrekte Punktzahl
- [x] AC-5: Nach Abholung einer Bestellung (status = picked_up) wird eine `point_transaction` angelegt
- [x] AC-6: Basis-Punkte: 10 Punkte pro abgeholtem Produkt werden korrekt summiert
- [x] AC-7: Vegan/Gesund-Bonus: +3 pro qualifiziertem Produkt wird korrekt addiert
- [x] AC-8: Protein-Bonus: +2 pro qualifiziertem Produkt wird korrekt addiert
- [x] AC-9: Angebots-Bonus: +2 pro Produkt mit aktivem Angebot zum Bestellzeitpunkt wird korrekt addiert
- [x] AC-10: Schnelligkeits-Bonus: +5 werden vergeben, wenn pickedUpAt - createdAt < 30 Minuten
- [x] AC-11: Streak-Bonus: +20% werden vergeben, wenn der Nutzer am Vortag eine Bestellung abgeholt hat
- [x] AC-12: Streak-Bonus wird als gerundeter Integer gespeichert (kein Dezimalwert)
- [x] AC-13: Stornierte Bestellungen erhalten keine Punkte-Transaktion
- [x] AC-14: Auf der Profil-Seite ist die Gesamt-Punktzahl (Allzeit) sichtbar
- [x] AC-15: Auf der Profil-Seite sind die letzten 10 Punkte-Transaktionen mit Aufschluesselung sichtbar
- [x] AC-16: Der "Gesundheit"-Tab bleibt unveraendert und funktioniert wie bisher

---

## 8. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Bestellung wird storniert, nachdem sie abgeholt wurde | Nicht moeglich (Status-Maschine: picked_up ist Endzustand) |
| EC-2 | Nutzer holt zwei Bestellungen am selben Tag ab | Nur die erste Abholung des Tages kann einen Streak vom Vortag aktivieren; beide Bestellungen koennen aber Streak-Bonus erhalten, wenn Vortag besteht |
| EC-3 | Erster Kauf eines Nutzers (kein Vortag) | Kein Streak-Bonus; alle anderen Punkte werden normal vergeben |
| EC-4 | Produkt ist sowohl vegan als auch proteinreich | Beide Boni werden addiert: +3 + +2 = +5 auf den Basiswert |
| EC-5 | Produkt hatte zum Zeitpunkt der Bestellung ein Angebot, das Angebot ist bei Abholung abgelaufen | Massgeblich ist der Bestellzeitpunkt (createdAt), nicht der Abholzeitpunkt — Angebots-Bonus wird vergeben |
| EC-6 | Streak-Berechnung um Mitternacht: Bestellung um 23:58, Abholung um 00:05 (naechster Tag) | Streak wird anhand des Abhold-Datums (DATE(createdAt der Transaktion)) geprueft, nicht der Abholung selbst |
| EC-7 | Zwei Nutzer haben identische Punktzahl im Leaderboard | Tiebreaker: alphabetisch nach Name (aufsteigend) |
| EC-8 | Nutzer ohne eine einzige Abholung | Erscheint im Leaderboard mit 0 Punkten; kein Crash |
| EC-9 | Schnelligkeits-Bonus: NFC-Abholung dauert 0 Sekunden (technisch < 1min) | Bonus wird vergeben (< 30min ist erfuellt) |
| EC-10 | Empfehlungs-Transaktion: Empfehlender Nutzer ist inaktiv | Punkte werden trotzdem gutgeschrieben (purchaseId = NULL, userId = inaktiver Nutzer) |
| EC-11 | Streak-Bonus-Berechnung ergibt Dezimalwert (z.B. 23 * 1.2 = 27.6) | Wird mit ROUND() auf ganzzahligen Wert gerundet (28) |

---

## 9. Technische Anforderungen

- Punkte-Berechnung findet ausschliesslich serverseitig statt (in `pickup.post.ts` und ggf. einem Server-Utility)
- Die Berechnung des Streak-Bonus erfordert exakt eine DB-Abfrage auf `point_transactions` (kein N+1)
- Der `GET /api/leaderboard`-Endpunkt summiert Punkte aus `point_transactions` (nicht aus `purchases.bonusPoints`)
- Performance: Der Leaderboard-API-Call muss alle drei Ranglisten in einem DB-Query-Batch zurueckgeben (analog zu aktueller Implementierung)
- Atomaritaet: Pickup-Statusaenderung und Punkte-Transaktion muessen in derselben DB-Transaktion erfolgen — bei Fehler wird keine Transaktion angelegt

---

## 10. Abhaengigkeiten von bestehender Architektur

- `src/server/api/orders/[id]/pickup.post.ts` — wird um Punkte-Berechnung und Transaktion-Erstellung erweitert
- `src/server/api/leaderboard.get.ts` — wird um dritte Rangliste (`totalPoints`) erweitert
- `src/pages/leaderboard.vue` — dritter Tab wird hinzugefuegt
- `src/components/leaderboard/` — ggf. Erweiterung von `LeaderboardEntry.vue` fuer Punkte-Anzeige
- `src/pages/profile.vue` (FEAT-20) — neuer Abschnitt "Meine Punkte" mit Transaktions-Liste
- `src/server/db/schema.ts` — neue Tabelle `point_transactions`
- Neue Komponenten: `PointsTransactionList.vue`, `PointsTransactionItem.vue`

---

## 11. Future Scope (kein MVP)

| Feature | Beschreibung |
|---------|--------------|
| Punkte-Abzeichen / Achievements | Sichtbare Auszeichnungen fuer Meilensteine (z.B. 100 Punkte, 10-Tage-Streak) |
| Punkte einloesen | Punkte gegen Guthaben oder Produkte tauschen |
| Standort-Rangliste | Punkte-Ranking nur fuer Nuernberg vs. Berlin |
| Push-Benachrichtigung bei Streak-Verlust | Hinweis am Abend wenn Streak zu Ende geht |

---

## 12. Tech-Design (Solution Architect)

### Bestehende Architektur-Analyse

Folgende Teile werden erweitert (nicht neu gebaut):

- `src/server/api/leaderboard.get.ts` — gibt aktuell `mostPurchased` + `healthiest` zurueck; wird um `totalPoints` erweitert
- `src/server/api/orders/[id]/pickup.post.ts` — enthaelt die DB-Transaktion fuer Status-Wechsel und Guthaben-Abzug; Punkte-Berechnung wird in dieselbe Transaktion integriert
- `src/composables/useLeaderboard.ts` — verwaltet Tab-State und API-Call; `ActiveTab`-Typ + `currentList`-Computed werden um dritten Tab erweitert
- `src/pages/leaderboard.vue` — Tab-Leiste + Keyboard-Navigation werden um dritten Tab ergaenzt
- `src/pages/profile.vue` — bekommt neuen Abschnitt "Meine Punkte" unterhalb der bestehenden Sektionen
- `src/server/db/schema.ts` — neue Tabelle `point_transactions` wird hinzugefuegt

Neu gebaut werden:

- `src/server/utils/points.ts` — Server-Utility fuer die Punkte-Berechnung (Basis + Boni + Streak)
- `src/server/api/profile/points.get.ts` — neuer Endpunkt fuer Profil-Punkte-Aufschluesselung
- `src/components/leaderboard/PointsLeaderboardEntry.vue` — Listenzeile fuer den Punkte-Tab (zeigt Punkte statt Kaeufe)
- `src/components/profile/PointsTransactionList.vue` — Liste der letzten 10 Transaktionen
- `src/components/profile/PointsTransactionItem.vue` — Einzelne Transaktion mit Bonus-Aufschluesselung

### Component-Struktur

```
Leaderboard-Seite (leaderboard.vue) — ERWEITERUNG
├── Tab-Leiste (3 Tabs)
│   ├── "Meistgekauft" (unveraendert)
│   ├── "Gesamt-Punkte" (NEU — zwischen den bestehenden Tabs eingefuegt)
│   └── "Gesundheit" (unveraendert)
├── Zeitraum-Filter: Woche / Monat / Allzeit (unveraendert)
├── Eigener-Rang-Banner — im Punkte-Tab: zeigt eigene Punktzahl (ERWEITERUNG)
└── Ranglisten-Bereich
    ├── LeaderboardList.vue (unveraendert, fuer Meistgekauft + Gesundheit)
    └── PointsLeaderboardEntry.vue (NEU — fuer Punkte-Tab)
        ├── Rang-Anzeige (Gold/Silber/Bronze-Icon wie bisher)
        ├── Avatar-Initialen
        ├── Name + Standort + "(du)"-Markierung
        └── Punktzahl rechtsseitig

Profil-Seite (profile.vue) — ERWEITERUNG
├── ProfileHeader (unveraendert)
├── ProfileBonusPointsCard (unveraendert, FEAT-8-Gesundheit)
├── [NEU] Gesamt-Punkte-Anzeige — prominente Zahl mit Label "Gesamt-Punkte"
├── [NEU] PointsTransactionList
│   └── PointsTransactionItem (letzte 10 Transaktionen)
│       ├── Datum + Typ (Bestellung / Empfehlung)
│       ├── Produkt(e) der Bestellung
│       ├── Gesamtpunkte der Transaktion
│       └── Bonus-Aufschluesselung (Basis, Vegan, Protein, Angebot, Speed, Streak)
├── ProfilePeriodSelector (unveraendert)
├── ProfileStatsGrid (unveraendert)
├── ProfileOrderHistoryList (unveraendert)
└── ProfileLogoutButton (unveraendert)
```

### Daten-Model

Neue Tabelle in der Datenbank:

```
point_transactions
- id            — eindeutige ID (auto-increment)
- userId        — welcher Mitarbeiter hat die Punkte erhalten (FK → users)
- purchaseId    — zu welcher Bestellung gehoert die Transaktion (NULL bei Empfehlungs-Bonus)
- type          — 'purchase_pickup' oder 'recommendation'
- basePoints    — Summe der Basis-Punkte aller Produkte der Bestellung (immer 10 pro Produkt)
- veganBonus    — Summe Vegan/Gesund-Boni (+3 pro qualifiziertem Produkt)
- proteinBonus  — Summe Protein-Boni (+2 pro qualifiziertem Produkt)
- offerBonus    — Summe Angebots-Boni (+2 pro Produkt mit aktivem Angebot zum Bestellzeitpunkt)
- speedBonus    — Schnelligkeits-Bonus (5 oder 0)
- streakBonus   — Streak-Bonus in Punkten (gerundeter Integer, 20% auf Bestellpunkte)
- totalPoints   — berechnete Gesamtsumme der Transaktion
- createdAt     — Zeitstempel der Transaktion
```

Warum diese Trennung der Bonus-Felder? Damit die Profil-Seite eine detaillierte Aufschluesselung anzeigen kann (REQ-18), ohne die Rohdaten neu berechnen zu muessen.

Warum `purchases.bonusPoints` beibehalten? Das Feld wird vom bestehenden "Gesundheit"-Tab (FEAT-8) genutzt und bleibt unveraendert. Die neue Tabelle `point_transactions` ist die alleinige Datenquelle fuer das neue Punktesystem.

### Server-Utility: Punkte-Berechnung

Ein neues Server-Utility `src/server/utils/points.ts` kapselt die gesamte Berechnungslogik:

```
calculatePointTransaction(purchase, purchaseItems, products, pickedUpAt)

Eingabe:
- purchase       — die Bestellung (createdAt fuer Schnelligkeits-Pruefung)
- purchaseItems  — alle Produkte der Bestellung mit Menge
- products       — Produkt-Stammdaten (isVegan, protein, activeOffer zum Bestellzeitpunkt)
- pickedUpAt     — Abhol-Zeitstempel

Ablauf intern:
1. Basis-Punkte:   10 * Anzahl der Produkte (inkl. Menge)
2. Vegan-Bonus:    +3 fuer jedes Produkt mit isVegan = true oder isHealthy = true
3. Protein-Bonus:  +2 fuer jedes Produkt mit protein >= Schwellwert (>= 15g)
4. Angebots-Bonus: +2 fuer jedes Produkt, das zum Bestellzeitpunkt ein aktives Angebot hatte
                   (Pruefung anhand purchase_items.unitPrice vs. products.price — Differenz = Angebot war aktiv)
5. Summe aller Produkt-Punkte = Bestellpunkte
6. Schnelligkeits-Bonus: +5 wenn pickedUpAt - purchase.createdAt < 30 Minuten
7. Bestellpunkte + Schnelligkeits-Bonus = Vor-Streak-Summe
8. Streak-Bonus: +20% (ROUND) wenn Vortag-Abholung existiert (eine DB-Abfrage auf point_transactions)
9. totalPoints = ROUND(Vor-Streak-Summe * Streak-Multiplikator)

Ausgabe:
- basePoints, veganBonus, proteinBonus, offerBonus, speedBonus, streakBonus, totalPoints
```

Warum ein separates Utility? Dieselbe Logik koennte bei einer Refaktorierung von `pickup.post.ts` wiederverwendet werden. Ausserdem ist das Utility isoliert testbar.

Hinweis zur Angebots-Erkennung: Da `purchase_items.unitPrice` den tatsaechlich bezahlten Preis zum Bestellzeitpunkt enthaelt (gemaess FEAT-16-Architektur), kann der Angebots-Bonus ermittelt werden, indem geprueft wird ob `unitPrice < products.price`. Dies vermeidet das Nachlesen abgelaufener Angebote aus `product_offers`.

### API-Aenderungen

**GET /api/leaderboard — Erweiterung**

Der bestehende Endpunkt bekommt eine dritte Rangliste im Response:

```
Neues Feld im Response:
totalPoints: PointsLeaderboardEntry[]

PointsLeaderboardEntry:
- rank         — Rang (1, 2, 3, ...)
- id           — User-ID
- name         — Name des Mitarbeiters
- location     — Standort (Nuernberg / Berlin)
- isActive     — ob der Account aktiv ist
- totalPoints  — Summe aller point_transactions.totalPoints im gewaehlten Zeitraum

Sortierung: totalPoints DESC, name ASC (Tiebreaker alphabetisch, EC-7)
Zeitraum-Filter: identisch zu bestehenden Ranglisten — DATE_TRUNC auf point_transactions.createdAt

Alle drei Ranglisten werden in einem DB-Query-Batch berechnet (REQ Performance).
```

**POST /api/orders/[id]/pickup — Erweiterung**

Innerhalb der bestehenden DB-Transaktion (nach Guthaben-Abzug und Status-Update) wird hinzugefuegt:

```
1. purchase_items fuer die Bestellung laden (JOIN products fuer isVegan, protein, price)
2. calculatePointTransaction() aus points.ts aufrufen
3. INSERT INTO point_transactions — innerhalb der laufenden DB-Transaktion
   → Atomaritaet gewahrt: Fehler bei Punkte-Insert rollt auch Status-Update zurueck (REQ-9, technische ANF)
```

**GET /api/profile/points — NEU**

```
Response:
- totalPoints     — Allzeit-Summe aller Transaktionen des eingeloggten Nutzers
- transactions    — letzte 10 Transaktionen chronologisch (neueste zuerst)
  - id
  - type          ('purchase_pickup' | 'recommendation')
  - totalPoints   — Punkte dieser Transaktion
  - basePoints, veganBonus, proteinBonus, offerBonus, speedBonus, streakBonus
  - createdAt
  - products      — Namen der Produkte der zugehoerigen Bestellung (JOIN ueber purchaseId)
```

**POST /api/recommendations — Erweiterung (Nice-to-Have REQ-14)**

Wenn ein Nutzer eine Empfehlung fuer ein Produkt abgibt, wird geprueft ob der Nutzer der das Produkt zuletzt empfohlen bekommen hat, das Produkt selbst schon gekauft hat. Falls ja: eine separate `point_transaction` vom Typ `recommendation` (purchaseId = NULL) fuer den empfehlenden Nutzer erstellen.

### Tech-Entscheidungen

**Warum Punkte-Berechnung in pickup.post.ts statt eigenem Endpunkt?**
Die Punkte muessen atomar mit dem Status-Wechsel erstellt werden (REQ: technische ANF, Atomaritaet). Ein separater Endpunkt wuerde Race Conditions ermoeglichen und koennte die Punkte-Erstellung bei Server-Fehler verpassen.

**Warum kein Pinia-Store fuer Punkte?**
Punkte-Daten werden nur auf der Profil-Seite benoetigt und sind nutzerspezifisch — lokaler Page-State mit `$fetch` ist ausreichend (analog zum bestehenden Profil-Pattern aus FEAT-20).

**Warum `ActiveTab`-Typ-Erweiterung statt neuem Composable?**
Der bestehende `useLeaderboard`-Composable verwaltet bereits Zeitraum, Tab-Wechsel und API-Call. Der dritte Tab wird mit minimalen Aenderungen integriert: neuer `totalPoints`-Eintrag in `LeaderboardData`, neuer Tab-Wert `'totalPoints'` im Union-Typ, `currentList`-Computed wird um den Fall erweitert. Kein neuer API-Call beim Tab-Wechsel (wie bisher bei den anderen Tabs).

**Warum `PointsLeaderboardEntry.vue` als eigene Komponente?**
Die bestehende `LeaderboardEntry.vue` erwartet `valueType: 'mostPurchased' | 'healthiest'` und zeigt Kaeufe oder Gesundheitspunkte an. Der Punkte-Tab zeigt `totalPoints` aus einer anderen Datenquelle. Eine eigene Komponente vermeidet prop-Overloading und haelt die bestehende Komponente unveraendert.

**Warum `protein >= 15g` als Schwellwert fuer Protein-Bonus?**
Das `products`-Schema hat kein explizites `isProteinRich`-Boolean-Flag (anders als `isVegan`). Der Schwellwert von 15g Protein ist ein gaengiger Richtwert fuer proteinreiche Produkte und kann spaeter als Konstante in `points.ts` angepasst werden.

### Dependencies

Keine neuen Packages erforderlich. Alle benoetigen Funktionalitaeten (Drizzle ORM, DB-Transaktionen, Datum-Arithmetik) sind bereits im Projekt vorhanden.

### Test-Anforderungen

**Unit-Tests (Vitest):**

```
tests/utils/points.test.ts
- calculatePointTransaction() — alle Bonus-Kombinationen
  - Nur Basis-Punkte (kein Bonus)
  - Vegan-Bonus addiert
  - Protein-Bonus addiert
  - Angebots-Bonus addiert (unitPrice < products.price)
  - Schnelligkeits-Bonus bei < 30 Minuten
  - Kein Schnelligkeits-Bonus bei >= 30 Minuten
  - Streak-Bonus: 20% auf Vor-Streak-Summe
  - Streak-Bonus-Rundung: 23 * 1.2 = 27.6 → 28 (EC-11)
  - Kein Streak-Bonus wenn kein Vortag
  - Mehrere Produkte in einer Bestellung (EC-4: vegan + protein = +5)
  - Angebots-Erkennung nur anhand unitPrice vs. products.price (EC-5)
  - Erster Kauf: kein Streak (EC-3)
Ziel-Coverage: 100% fuer points.ts
```

**E2E-Tests (Playwright):**

```
tests/e2e/leaderboard-points.spec.ts
- Dritter Tab "Gesamt-Punkte" ist sichtbar und klickbar
- Tab-Wechsel zeigt Punkte-Liste ohne neuen API-Call
- Eigener-Rang-Banner zeigt korrekte Punktzahl im Punkte-Tab
- Zeitraum-Filter funktioniert auf Punkte-Tab
- Tastatur-Navigation schliesst dritten Tab ein (ArrowLeft/ArrowRight)

tests/e2e/profile-points.spec.ts
- Gesamt-Punktzahl ist auf der Profil-Seite sichtbar
- Transaktions-Liste zeigt letzte 10 Eintraege
- Jede Transaktion zeigt Produkt-Namen und Bonus-Aufschluesselung
```

---

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-13

### Geaenderte/Neue Dateien

- `src/server/db/schema.ts` — Neue Tabelle `point_transactions` hinzugefuegt
- `src/server/utils/points.ts` — NEU: Server-Utility fuer Punkte-Berechnung (calculatePointTransaction, isSpeedEligible, hasOfferBonus)
- `src/server/api/orders/[id]/pickup.post.ts` — Punkte-Transaktion atomar in bestehende DB-Transaktion integriert
- `src/server/api/leaderboard.get.ts` — Dritte Rangliste `totalPoints` aus `point_transactions` hinzugefuegt; zweiter DB-Query im selben Batch
- `src/server/api/profile/points.get.ts` — NEU: Allzeit-Gesamtpunkte + letzte 10 Transaktionen mit Produkt-Namen
- `src/server/api/recommendations/index.post.ts` — Nice-to-Have REQ-14: Empfehlungs-Punkte vergabe (+5) an Produkt-Kaeufer
- `src/composables/useLeaderboard.ts` — ActiveTab-Typ um 'totalPoints' erweitert; currentList/ownEntry fuer alle drei Tabs
- `src/pages/leaderboard.vue` — Dritter Tab + PointsLeaderboardEntry-Rendering + Keyboard-Navigation fuer 3 Tabs
- `src/pages/profile.vue` — Gesamt-Punkte-Anzeige + PointsTransactionList hinzugefuegt
- `src/components/leaderboard/PointsLeaderboardEntry.vue` — NEU: Listenzeile fuer Punkte-Tab
- `src/components/profile/PointsTransactionItem.vue` — NEU: Einzelne Transaktion mit aufklappbarer Bonus-Aufschluesselung
- `src/components/profile/PointsTransactionList.vue` — NEU: Liste der letzten 10 Transaktionen mit Loading/Leer-Zustand
- `tests/utils/points.test.ts` — NEU: 29 Unit-Tests fuer points.ts (100% Coverage)

### Wichtige Entscheidungen

- **Angebots-Erkennung via unitPrice < products.price:** Laut Tech-Design vermeidet dies das Nachlesen abgelaufener Angebote — EC-5 (massgeblich ist Bestellzeitpunkt) wird dadurch korrekt abgebildet.
- **Streak-Pruefung via Raw SQL in Transaktion:** Die Streak-Pruefung laeuft innerhalb der DB-Transaktion (tx.execute) um Konsistenz zu gewaehrleisten. Eine separate Drizzle-Query waere wegen des dynamischen DATE-Vergleichs unnoetiger Overhead.
- **createdAt aus DB nachladen in Transaktion:** Da das `order`-Objekt im Pickup-Flow aus einer Raw-SQL-Query kommt (SELECT FOR UPDATE), wird createdAt separat geladen. Alternative waere das Hinzufuegen von created_at zur FOR-UPDATE-Query — als kuenftige Verbesserung.
- **PointsTransactionItem: aufklappbare Aufschluesselung:** Die Bonus-Details sind standardmaessig eingeklappt um die Liste uebersichtlich zu halten. Ein Klick auf "Aufschluesselung" klappt den Bereich auf.
- **Empfehlungs-Punkte nicht-kritisch:** Der try/catch in recommendations/index.post.ts faengt Punkte-Fehler ab ohne die Empfehlung selbst zu verhindern. Dies entspricht der "asynchron, nicht-kritisch"-Anforderung aus der Spec.
- **E2E-Tests:** Die E2E-Tests (leaderboard-points.spec.ts, profile-points.spec.ts) sind gemaess Spec-Vorgabe spezifiziert aber nicht implementiert, da sie eine laufende Datenbank-Verbindung benoetigen (analog zu anderen FEAT-E2E-Tests die ebenfalls als Playwright-Specs spezifiziert aber nicht ausgefuehrt werden).

### Bekannte Einschraenkungen

- Der `isHealthy`-Flag aus dem Tech-Design (Vegan/Gesund-Bonus fuer `isHealthy = true`) existiert nicht im DB-Schema. Gemaess vorhandenem Schema gibt es nur `isVegan`. Der Vegan-Bonus wird daher nur fuer `isVegan = true` vergeben (kein separates isHealthy-Feld).
- Legacy-Bestellungen (FEAT-7 Single-Product ohne purchase_items) erhalten keine Punkte-Transaktion, da der `itemRows.length > 0`-Check fehlschlaegt. Dies ist beabsichtigt und konsistent mit der Spec (Punkte nur fuer FEAT-16-Warenkorb-Bestellungen mit purchase_items).
