# FEAT-23: Leaderboard-Erweiterung (Punktesystem)

## Status: Planned

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

- [ ] AC-1: Das Leaderboard zeigt drei Tabs: "Meistgekauft", "Gesamt-Punkte", "Gesundheit"
- [ ] AC-2: Der Tab "Gesamt-Punkte" zeigt alle Mitarbeiter sortiert nach akkumulierten Punkten im gewaehlten Zeitraum
- [ ] AC-3: Zeitraum-Filter (Woche / Monat / Allzeit) funktioniert auf dem "Gesamt-Punkte"-Tab korrekt
- [ ] AC-4: Das eigene-Rang-Banner zeigt im "Gesamt-Punkte"-Tab die korrekte Punktzahl
- [ ] AC-5: Nach Abholung einer Bestellung (status = picked_up) wird eine `point_transaction` angelegt
- [ ] AC-6: Basis-Punkte: 10 Punkte pro abgeholtem Produkt werden korrekt summiert
- [ ] AC-7: Vegan/Gesund-Bonus: +3 pro qualifiziertem Produkt wird korrekt addiert
- [ ] AC-8: Protein-Bonus: +2 pro qualifiziertem Produkt wird korrekt addiert
- [ ] AC-9: Angebots-Bonus: +2 pro Produkt mit aktivem Angebot zum Bestellzeitpunkt wird korrekt addiert
- [ ] AC-10: Schnelligkeits-Bonus: +5 werden vergeben, wenn pickedUpAt - createdAt < 30 Minuten
- [ ] AC-11: Streak-Bonus: +20% werden vergeben, wenn der Nutzer am Vortag eine Bestellung abgeholt hat
- [ ] AC-12: Streak-Bonus wird als gerundeter Integer gespeichert (kein Dezimalwert)
- [ ] AC-13: Stornierte Bestellungen erhalten keine Punkte-Transaktion
- [ ] AC-14: Auf der Profil-Seite ist die Gesamt-Punktzahl (Allzeit) sichtbar
- [ ] AC-15: Auf der Profil-Seite sind die letzten 10 Punkte-Transaktionen mit Aufschluesselung sichtbar
- [ ] AC-16: Der "Gesundheit"-Tab bleibt unveraendert und funktioniert wie bisher

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
