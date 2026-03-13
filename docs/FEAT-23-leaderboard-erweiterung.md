# Leaderboard-Erweiterung: Punktesystem

**Feature-ID:** FEAT-23
**Status:** Implementiert (mit offenen Bugs, siehe unten)
**Getestet am:** 2026-03-13

---

## Zusammenfassung

FEAT-23 erweitert das bestehende Leaderboard um einen dritten Tab "Gesamt-Punkte" und fuehrt ein vielschichtiges Belohnungssystem ein. Mitarbeiter sammeln Punkte fuer jede abgeholte Bestellung — mit Bonuspunkten fuer gesundes Kaufverhalten, schnelle Abholung, taeglich aufeinanderfolgende Nutzung und proteinreiche Produkte. Die Punkte-History ist auf der Profil-Seite einsehbar.

---

## Was wurde gemacht

### Hauptfunktionen

- Neuer "Gesamt-Punkte"-Tab im Leaderboard zwischen "Meistgekauft" und "Gesundheit"
- Automatische Punkte-Vergabe bei jeder abgeholten Bestellung (keine Nutzer-Aktion noetig)
- Zeitraum-Filter (Woche / Monat / Allzeit) auf dem Punkte-Tab
- Gesamt-Punktzahl und Transaktions-Historie auf der Profil-Seite

### Punktesystem-Regeln

Pro abgeholtem Produkt:
- +10 Punkte Basis (immer)
- +3 Punkte wenn Produkt vegan ist
- +2 Punkte wenn Produkt proteinreich ist (>= 15g Protein)
- +2 Punkte wenn Produkt zum Bestellzeitpunkt im Angebot war

Pro Bestellung zusaetzlich:
- +5 Punkte Schnelligkeits-Bonus wenn Abholung innerhalb von 30 Minuten nach Bestellung
- +20% Streak-Bonus (gerundet) wenn am Vortag ebenfalls eine Bestellung abgeholt wurde

### Benutzer-Flow

1. Mitarbeiter legt Produkte in den Warenkorb und bestellt
2. Mitarbeiter holt die Bestellung am Automaten ab (NFC oder PIN)
3. Beim Abholen werden automatisch Punkte berechnet und gutgeschrieben
4. Auf der Profil-Seite ist die Gesamt-Punktzahl sichtbar
5. Eine aufklappbare Aufschluesselung zeigt welche Boni fuer jede Transaktion vergeben wurden
6. Im Leaderboard-Tab "Gesamt-Punkte" sieht der Mitarbeiter, wo er im Vergleich steht

---

## Wie es funktioniert

### Fuer Benutzer

Nach dem Abholen einer Bestellung erscheinen die Punkte automatisch:
- Auf der Profil-Seite unter "Gesamt-Punkte" als prominente Zahl
- In der Transaktionsliste mit Datum, Produkt-Namen und Bonus-Aufschluesselung
- Im Leaderboard unter dem Tab "Gesamt-Punkte"

Der Streak-Bonus motiviert zur taeglichen Nutzung: wer an aufeinanderfolgenden Tagen abholt, bekommt 20% mehr Punkte.

### Technische Umsetzung

**Neue Datenbank-Tabelle:** `point_transactions` speichert jede Punkte-Vergabe mit allen Einzelkomponenten (Basis, Vegan, Protein, Angebot, Speed, Streak, Gesamt).

**Punkte-Berechnung:** Findet ausschliesslich serverseitig statt, atomar innerhalb derselben Datenbank-Transaktion wie der Bestell-Status-Wechsel auf "picked_up". Fehler bei der Punkte-Vergabe rollen auch den Status-Wechsel zurueck.

**Streak-Pruefung:** Per SQL-Query innerhalb der Transaktion: gibt es eine `point_transaction` des Nutzers vom Vortag?

**Angebots-Erkennung:** Anhand des `unitPrice` in `purchase_items` — wenn `unitPrice < products.price`, war das Produkt zum Bestellzeitpunkt im Angebot (EC-5 korrekt abgebildet).

**Verwendete Technologien:**
- Nuxt 3 Server API Routes
- Drizzle ORM + Neon (PostgreSQL)
- Vue 3 Composition API
- Pinia (kein Store noetig — lokaler Page-State auf Profil-Seite)

---

## Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/server/utils/points.ts` | Punkte-Berechnungs-Utility (100% Unit-Test-Coverage) |
| `src/server/api/profile/points.get.ts` | API: Allzeit-Punkte + letzte 10 Transaktionen |
| `src/components/leaderboard/PointsLeaderboardEntry.vue` | Listeneintrag im Punkte-Tab |
| `src/components/profile/PointsTransactionList.vue` | Transaktionsliste auf Profil-Seite |
| `src/components/profile/PointsTransactionItem.vue` | Einzelne Transaktion mit aufklappbarer Aufschluesselung |
| `tests/utils/points.test.ts` | 29 Unit-Tests fuer die Punkte-Berechnungslogik |

### Erweiterte Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/server/db/schema.ts` | Neue Tabelle `point_transactions` |
| `src/server/api/orders/[id]/pickup.post.ts` | Punkte-Transaktion atomar integriert |
| `src/server/api/leaderboard.get.ts` | Dritte Rangliste `totalPoints` |
| `src/server/api/recommendations/index.post.ts` | Empfehlungs-Punkte (Nice-to-Have, BUG-FEAT23-002 offen) |
| `src/composables/useLeaderboard.ts` | ActiveTab um 'totalPoints' erweitert |
| `src/pages/leaderboard.vue` | Dritter Tab + Tastatur-Navigation fuer 3 Tabs |
| `src/pages/profile.vue` | Gesamt-Punkte-Anzeige + PointsTransactionList |

---

## Abhaengigkeiten

- FEAT-8: Leaderboard-Grundstruktur (Tabs, Zeitraum-Filter, API)
- FEAT-11: `status = picked_up` als Voraussetzung fuer Punkte-Vergabe; `pickedUpAt` fuer Speed-Bonus
- FEAT-16: `purchase_items`-Struktur fuer Punkte pro Produkt
- FEAT-14: `unitPrice` vs. `products.price` fuer Angebots-Bonus-Erkennung
- FEAT-20: Profil-Seite als Ort der Punkte-Anzeige

---

## Getestet

- Acceptance Criteria: Alle 16 bestanden (Code-Review + Unit-Tests)
- Edge Cases: Alle 11 bestanden
- Cross-Browser: Nicht getestet (keine laufende App-Instanz)
- Responsive: Nicht getestet (keine laufende App-Instanz)
- Accessibility: WCAG 2.1 Anforderungen bestaetigt per Code-Review
- Security: Kein Security-Issue gefunden
- Regression: Alle 331 bestehenden Tests bestanden

---

## Bekannte Einschraenkungen

- `isHealthy`-Flag existiert nicht im DB-Schema — Vegan/Gesund-Bonus nur fuer `isVegan = true`
- Legacy-Bestellungen (FEAT-7 ohne purchase_items) erhalten keine Punkte (beabsichtigt)
- E2E-Tests nicht implementiert (erfordern laufende DB mit Testdaten)

---

## Offene Bugs

| Bug-ID | Titel | Severity | Priority |
|--------|-------|----------|----------|
| BUG-FEAT23-002 | Empfehlungs-Punkte gehen an falschen Nutzer | High | Should Fix |
| BUG-FEAT23-001 | useLeaderboard-Tests decken totalPoints-Tab nicht ab | Medium | Should Fix |
| BUG-FEAT23-003 | leaderboard.vue im Coverage-Tool nicht parsbar | Low | Nice to Fix |

---

## Nächste Schritte

- BUG-FEAT23-002 beheben: Empfehlungs-Punkte korrekt an urspruenglichen Empfehlenden vergeben
- BUG-FEAT23-001 beheben: useLeaderboard-Tests um totalPoints-Tab erweitern
- FEAT-24: Guthaben aufladen & Zahlungsmethode

---

## Kontakt

Bei Fragen zu diesem Feature: Developer Agent / QA Engineer Agent
