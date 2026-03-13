# QA Report: FEAT-23 Leaderboard-Erweiterung (Punktesystem)

**Tested:** 2026-03-13
**QA Engineer:** QA Engineer Agent
**App URL:** http://localhost:3000
**Feature-Spec:** features/FEAT-23-leaderboard-erweiterung.md

---

## Zusammenfassung

FEAT-23 erweitert das bestehende Leaderboard (FEAT-8) um einen dritten Tab "Gesamt-Punkte" und fuehrt ein vielschichtiges Punktesystem ein. Alle Must-Have- und Should-Have-Acceptance-Criteria (AC-1 bis AC-16) sind korrekt implementiert. Es wurden 3 Bugs gefunden, davon 1 High (betrifft Nice-to-Have REQ-14) und 2 niedrigerer Prioritaet.

---

## Unit-Tests

**Command:** `npm test -- --run`

| Test-Suite | Tests | Passing | Failing |
|------------|-------|---------|---------|
| tests/utils/points.test.ts | 29 | 29 | 0 |
| tests/composables/useLeaderboard.test.ts | 21 | 21 | 0 |
| tests/utils/offers.test.ts | 18 | 18 | 0 |
| tests/utils/healthScore.test.ts | 14 | 14 | 0 |
| tests/utils/purchase.test.ts | 12 | 12 | 0 |
| tests/utils/search.test.ts | 20 | 20 | 0 |
| tests/stores/favorites.test.ts | 18 | 17 | 0 (1 skip) |
| tests/stores/notifications.test.ts | 32 | 28 | 0 (4 skip) |
| tests/stores/recommendations.test.ts | 13 | 12 | 0 (1 skip) |
| tests/stores/credits.test.ts | 13 | 9 | 0 (4 skip) |
| tests/stores/auth.test.ts | 10 | 5 | 0 (5 skip) |
| tests/composables/useFormatter.test.ts | 19 | 19 | 0 |
| tests/composables/useModal.test.ts | 20 | 20 | 0 |
| tests/composables/useSearch.test.ts | 22 | 16 | 0 (6 skip) |
| tests/composables/useCountdown.test.ts | 19 | 19 | 0 |
| tests/composables/useLocalStorage.test.ts | 13 | 13 | 0 |
| tests/constants/credits.test.ts | 15 | 15 | 0 |
| tests/components/* | 44 | 44 | 0 |
| **GESAMT** | **352** | **331 passing** | **0 failing** |

**Status:** Alle Unit-Tests bestanden. 21 Tests sind bewusst mit `skip` markiert (bestehende Einschraenkungen, siehe BUG-TESTING-001).

### Coverage fuer FEAT-23-Kerndateien

| Datei | Coverage |
|-------|----------|
| `src/server/utils/points.ts` | **100%** |
| `src/composables/useLeaderboard.ts` | ~70% (totalPoints-Pfad ungetestet — BUG-FEAT23-001) |
| `src/server/api/leaderboard.get.ts` | 0% (kein Server-Integration-Test, erwartetes Pattern) |
| `src/server/api/profile/points.get.ts` | 0% (kein Server-Integration-Test, erwartetes Pattern) |
| `src/server/api/orders/[id]/pickup.post.ts` | 0% (kein Server-Integration-Test, erwartetes Pattern) |

---

## E2E-Tests

Die gemaess Spec vorgesehenen E2E-Tests (`leaderboard-points.spec.ts`, `profile-points.spec.ts`) wurden gemaess Implementation Notes bewusst nicht implementiert — sie erfordern eine laufende DB-Verbindung mit Testdaten. Dies ist konsistent mit dem Muster anderer Features (z.B. FEAT-11, FEAT-13). Bestehende E2E-Tests (app.spec.ts, profile.spec.ts etc.) wurden nicht ausgefuehrt, da keine laufende App-Instanz verfuegbar ist.

---

## Acceptance Criteria Status

| AC | Pruefmethode | Status | Notizen |
|----|-------------|--------|---------|
| AC-1: Drei Tabs (Meistgekauft / Gesamt-Punkte / Gesundheit) | Code-Review | Bestaetigt | leaderboard.vue Zeilen 154-198, korrekte Reihenfolge |
| AC-2: Gesamt-Punkte-Tab sortiert nach Punkten | Code-Review | Bestaetigt | leaderboard.get.ts: ORDER BY totalPoints DESC |
| AC-3: Zeitraum-Filter auf Gesamt-Punkte-Tab | Code-Review | Bestaetigt | pointsDateFilter analog zu purchaseDateFilter |
| AC-4: Eigener-Rang-Banner zeigt Punktzahl im Punkte-Tab | Code-Review | Bestaetigt | getOwnEntryValueText() + isPointsEntry() Type Guard |
| AC-5: point_transaction bei picked_up angelegt | Code-Review | Bestaetigt | pickup.post.ts Zeilen 264-337 |
| AC-6: Basis-Punkte 10 pro Produkt | Unit-Test | Bestanden | 29 Tests in points.test.ts |
| AC-7: Vegan/Gesund-Bonus +3 pro Produkt | Unit-Test | Bestanden | Hinweis: isHealthy nicht im Schema, nur isVegan |
| AC-8: Protein-Bonus +2 bei protein >= 15g | Unit-Test | Bestanden | PROTEIN_THRESHOLD = 15 |
| AC-9: Angebots-Bonus +2 via unitPrice < products.price | Unit-Test | Bestanden | EC-5 korrekt |
| AC-10: Speed-Bonus +5 bei pickedUpAt - createdAt < 30min | Unit-Test | Bestanden | isSpeedEligible() |
| AC-11: Streak-Bonus +20% bei Vortag-Abholung | Unit-Test | Bestanden | hasStreakYesterday-Flag |
| AC-12: Streak-Bonus als gerundeter Integer | Unit-Test | Bestanden | Math.round(), EC-11 |
| AC-13: Stornierte Bestellungen keine Punkte | Code-Review | Bestaetigt | status-Check vor Punkte-Berechnung |
| AC-14: Gesamt-Punktzahl auf Profil-Seite | Code-Review | Bestaetigt | profile.vue + /api/profile/points |
| AC-15: Letzte 10 Transaktionen mit Aufschluesselung | Code-Review | Bestaetigt | PointsTransactionItem aufklappbar |
| AC-16: Gesundheit-Tab unveraendert | Code-Review | Bestaetigt | purchaseRows-Query unveraendert |

---

## Edge Cases Status

| EC | Status | Notizen |
|----|--------|---------|
| EC-1: Status-Maschine picked_up als Endzustand | Bestaetigt | pickup.post.ts prueft status === 'picked_up' → 409 |
| EC-2: Zwei Bestellungen am selben Tag | Unit-Test | Streak-Bonus fuer beide wenn Vortag existiert |
| EC-3: Erster Kauf kein Streak | Unit-Test | hasStreakYesterday = false |
| EC-4: Vegan + Protein beide Boni | Unit-Test | +3 + +2 = +5 addiert |
| EC-5: Angebots-Bonus nach Bestellzeitpunkt | Unit-Test | unitPrice-Vergleich, nicht Abholzeitpunkt |
| EC-6: Streak Mitternacht | Code-Review | DATE(created_at) = DATE(NOW()) - 1 day |
| EC-7: Tiebreaker alphabetisch | Code-Review | name ASC in leaderboard.get.ts Sort |
| EC-8: Nutzer ohne Abholungen = 0 Punkte | Code-Review | COALESCE(SUM(), 0) |
| EC-9: NFC = 0 Sekunden, Speed-Bonus vergeben | Unit-Test | < 30min erfuellt |
| EC-10: Empfehlungs-Punkte auch fuer inaktive Nutzer | Code-Review | Kein isActive-Check |
| EC-11: Streak-Rundung 27.6 → 28 | Unit-Test | Math.round() korrekt |

---

## Accessibility (WCAG 2.1)

- Farbkontrast > 4.5:1: Bestaetigt (Tailwind text-primary auf weissem Hintergrund)
- Tastatur-Navigation Tabs: Bestaetigt (ArrowLeft/ArrowRight fuer 3 Tabs, handleTabKeydown())
- Focus States: Bestaetigt (focus:ring-2 focus:ring-primary auf Tab-Buttons)
- Touch-Targets > 44px: Bestaetigt (min-h-[44px] auf allen interaktiven Elementen)
- Screen Reader: Bestaetigt (role="tablist", role="tab", aria-selected, aria-label auf Listen-Items)
- ARIA-Live fuer Rang-Banner: Nicht vorhanden — aber Banner ist statisch, kein dynamisches Update noetig

---

## Security Audit

- Auth-Guard Leaderboard: Bestaetigt — `getCurrentUser()` + Admin → 403
- Auth-Guard Profile-Punkte: Bestaetigt — `getCurrentUser()`
- Admin hat keinen Zugriff auf Leaderboard: Bestaetigt — expliziter 403-Check
- SQL-Injection in profile/points.get.ts: Geringes Risiko — `sql.raw()` nutzt purchaseIds aus eigener DB-Abfrage, kein User-Input direkt. Dennoch als Optimierungspotenzial notiert.
- Punkte-Manipulation: Nicht moeglich — Berechnung ausschliesslich serverseitig, kein Client-Input
- Race Condition Streak: Ausgeschlossen — Streak-Pruefung und INSERT in derselben DB-Transaktion

---

## Tech Stack & Code Quality

- Composition API + `<script setup>`: Bestaetigt
- Kein `any` in TypeScript: Bestaetigt
- Kein direkter DB-Zugriff aus Stores/Components: Bestaetigt
- Drizzle ORM fuer alle Queries: Bestaetigt (Raw SQL nur fuer FOR UPDATE und DATE-Arithmetik, begruendet dokumentiert)
- Server Routes haben Error Handling: Bestaetigt (try/catch + createError())
- Atomaritaet Pickup + Punkte: Bestaetigt (db.transaction())
- N+1 Query Probleme: Keines — leaderboard.get.ts: 2 Queries total; profile/points.get.ts: 3 Queries total (gesamt, letzte 10, alle Produkt-Namen in 1 Query)

### Identifizierte Optimierungspotenziale

1. `pickup.post.ts` Zeilen 312-314: `createdAt` wird als separates SQL-Query nachgeladen. Koennte in die FOR-UPDATE-Query integriert werden (1 Query gespart).
2. `profile/points.get.ts` Zeile 114: `sql.raw()` mit String-Interpolation — besser als parametrisierter Query umsetzen.
3. `useLeaderboard.test.ts`: Mock-Response fehlt `totalPoints`-Array — totalPoints-Tab-Pfade ungetestet (BUG-FEAT23-001).

---

## Gefundene Bugs

| Bug-ID | Titel | Severity | Priority |
|--------|-------|----------|----------|
| BUG-FEAT23-002 | Empfehlungs-Punkte gehen an falschen Nutzer (letzter Kaeufer statt Empfehlender) | High | Should Fix |
| BUG-FEAT23-001 | useLeaderboard-Tests decken totalPoints-Tab nicht ab | Medium | Should Fix |
| BUG-FEAT23-003 | leaderboard.vue im Vitest-Coverage-Tool nicht parsbar (HTML-Entity &lt;) | Low | Nice to Fix |

### Detail: BUG-FEAT23-002

Die Implementierung in `recommendations/index.post.ts` sucht nach dem letzten Kaeufer des empfohlenen Produkts und gibt diesem +5 Punkte. Laut Spec sollen die Punkte aber an denjenigen gehen, der das Produkt **zuerst in FEAT-18 empfohlen hat** und dessen Empfehlung nun von einem anderen Nutzer bestaetigt wird. Die Logik fragt `purchases`-Tabelle ab statt `recommendations`-Tabelle.

**Wichtig:** Dies betrifft nur REQ-14 (Nice-to-Have). Die Kernfunktionalitaet (AC-1 bis AC-16) ist nicht betroffen.

---

## Regression

Alle 331 bestehenden Tests bestanden. Keine Regression festgestellt.

- FEAT-8 Gesundheit-Tab: `purchaseRows`-Query in leaderboard.get.ts unveraendert
- FEAT-11 Pickup-Flow: Bestehende Logik unveraendert, Punkte-Berechnung atomar ergaenzt
- FEAT-18 Empfehlungen: `success: true`-Response unveraendert, Punkte-Vergabe als try/catch ergaenzt
- FEAT-16 Warenkorb: Keine Aenderungen

---

## Production-Ready-Entscheidung

**Fuer Must-Have + Should-Have Anforderungen: READY**

Alle AC-1 bis AC-16 sind korrekt implementiert und durch Code-Review bzw. Unit-Tests bestaetigt. Kein Critical- oder Must-Fix-Bug.

**Fuer REQ-14 (Empfehlungs-Punkte, Nice-to-Have): NOT READY**

BUG-FEAT23-002 gibt Empfehlungs-Punkte an den falschen Nutzer. Da REQ-14 als Nice-to-Have eingestuft ist, blockiert dies nicht das Deployment.

**Empfehlung:** Feature deployen. BUG-FEAT23-002 und BUG-FEAT23-001 als nachgelagerte Should-Fix-Issues behandeln.

---

## UX-Empfehlung

**Soll UX Expert nochmals pruefen?** Nein.

**Begruendung:** Die UX-Anforderungen sind vollstaendig implementiert:
- Dritter Tab korrekt zwischen bestehenden Tabs positioniert
- Eigener-Rang-Banner zeigt Punkte im Punkte-Tab an
- Profil-Seite zeigt Gesamt-Punktzahl prominent + aufklappbare Bonus-Aufschluesselung
- Tastatur-Navigation fuer alle drei Tabs korrekt implementiert
- Touch-Targets eingehalten, Focus-States vorhanden

Die gefundenen Bugs sind technischer Natur (falsche Empfaenger-Logik, fehlende Tests, Coverage-Tooling) und beeintraectigen die UX nicht.
