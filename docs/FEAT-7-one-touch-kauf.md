# One-Touch Kauf

**Feature-ID:** FEAT-7
**Status:** Abgeschlossen
**Getestet am:** 2026-03-04

---

## Zusammenfassung

Der One-Touch Kauf ermoeglicht es Nutzern, einen Snack mit einem einzigen Klick oder Tap zu kaufen - ohne Warenkorb, ohne mehrere Bestaetigungsschritte. Das Feature richtet sich besonders an Vielbeschaeftigte, die in kurzen Pausen schnell einen Snack kaufen moechten. Nach dem Kauf wird eine 4-stellige PIN generiert, mit der das Produkt am Automaten abgeholt werden kann.

---

## Was wurde gemacht

### Hauptfunktionen

- **One-Touch Kaufen-Button** auf jeder Produktkarte im Dashboard - ein einziger Klick loest den Kaufprozess aus
- **Guthaben-Pruefung in Echtzeit** - das System prueft vor jedem Kauf, ob ausreichend Guthaben vorhanden ist, und gibt eine verstaendliche Fehlermeldung wenn nicht
- **Automatischer Guthaben-Abzug** - der Produktpreis wird sofort und sicher nach dem Kauf vom Konto abgezogen
- **PIN-Generierung** - nach jedem Kauf wird automatisch eine 4-stellige PIN erstellt, die zum Abholen am Automaten benoetigt wird
- **Bonuspunkte-System** - gesunde Produkte geben mehr Bonuspunkte (Obst: 3 Punkte, Nuesse/Protein: 2 Punkte, Rest: 1 Punkt)
- **Erfolgsbestaetigung mit Modal** - nach dem Kauf oeffnet sich ein Vollbild-Modal mit PIN, Abholort und einem Countdown (2 Stunden Gueltigkeitsdauer)
- **Doppelklick-Schutz** - der Kaufen-Button wird waehrend der Transaktion deaktiviert, sodass versehentliche Mehrfachkaeufe verhindert werden

### Benutzer-Flow

1. Nutzer oeffnet die App und sieht den Produktkatalog mit dem aktuellen Guthaben oben rechts
2. Nutzer waehlt ein Produkt und sieht Preis, Bonuspunkte und den "Kaufen"-Button direkt auf der Produktkarte
3. Nutzer tippt auf "Kaufen" - der Button zeigt kurz eine Ladeanimation und wird deaktiviert
4. Das System prueft im Hintergrund Guthaben und Bestand
5. Bei Erfolg: Das Erfolgs-Modal oeffnet sich automatisch mit der generierten PIN, dem Abholort und dem Countdown
6. Bei Fehler (z.B. zu wenig Guthaben): Eine klare Fehlermeldung erscheint mit Details (vorhandenes vs. benoetiges Guthaben)
7. Das Guthaben in der Navigation wird sofort aktualisiert

---

## Wie es funktioniert

### Fuer Benutzer

Der Nutzer sieht im Produktkatalog auf jeder Produktkarte einen gruenen "Kaufen"-Button. Darunter steht der Preis sowie die erreichbaren Bonuspunkte. Ein Klick genuegt - das System erledigt alles im Hintergrund.

Bei einem erfolgreichen Kauf erscheint ein Modal-Fenster mit:
- Einer Bestaetigung ("Kauf erfolgreich!")
- Der 4-stelligen PIN zum Abholen (gross und gut lesbar dargestellt)
- Dem Abholort (z.B. "Nuernberg, Buero 1. OG")
- Einem Countdown, der anzeigt, wie lange die Bestellung noch gueltig ist (2 Stunden)
- Den Optionen "Mit NFC abholen" und "PIN am Automaten eingeben" (werden mit FEAT-11 aktiviert)

Ist das Guthaben nicht ausreichend, erscheint eine verstaendliche Fehlermeldung mit dem vorhandenen Betrag, dem benoetigen Betrag und dem Fehlbetrag.

Administratoren sehen keine Kaufen-Buttons - sie erhalten stattdessen einen Hinweis, dass sie als Admin keine Kaeufe taetigen koennen.

### Technische Umsetzung

Die Kernlogik des Kaufprozesses laeuft serverseitig in einer atomaren Datenbanktransaktion ab. Das bedeutet: Entweder werden alle Schritte (Guthaben abziehen, Bestand reduzieren, Kauf speichern, Transaktionslog erstellen) erfolgreich ausgefuehrt, oder bei einem Fehler wird alles rueckgaengig gemacht. Dadurch kann kein Guthaben verloren gehen und der Bestand kann nicht negativ werden.

Die PIN wird serverseitig generiert und zusammen mit dem Kaufeintrag in der Datenbank gespeichert. Der Ablaufzeitpunkt wird auf 2 Stunden nach dem Kauf gesetzt.

**Verwendete Technologien:**
- Nuxt 3 mit Vue 3 (Composition API, `<script setup>`)
- Pinia Store (`purchases.ts`) fuer State-Management im Frontend
- Neon PostgreSQL (WebSocket-Driver) fuer ACID-konforme Datenbanktransaktionen
- Drizzle ORM fuer alle Datenbankzugriffe (kein Raw SQL)
- TypeScript mit vollstaendig typisierten Interfaces (`src/types/purchase.ts`)
- Nuxt UI fuer Button-Komponenten und Modal

**Neue Dateien:**

| Datei | Zweck |
|-------|-------|
| `src/server/api/purchases.post.ts` | API-Endpunkt POST /api/purchases (atomare Transaktion) |
| `src/server/utils/purchase.ts` | PIN-Generierung und Bonuspunkte-Berechnung |
| `src/stores/purchases.ts` | Pinia Store fuer Kauf-Zustandsverwaltung |
| `src/components/dashboard/PurchaseButton.vue` | One-Touch Kaufen-Button mit Ladeanimation |
| `src/components/dashboard/PurchaseSuccessModal.vue` | Erfolgsbestaetigung mit PIN und Countdown |
| `src/types/purchase.ts` | TypeScript-Interfaces fuer Purchase-Objekte |
| `tests/utils/purchase.test.ts` | Unit-Tests fuer PIN-Generierung und Bonuspunkte |
| `tests/e2e/purchase.spec.ts` | E2E-Tests fuer den Kaufprozess |

**API-Endpunkt:**

`POST /api/purchases` mit `{ productId: number }` im Request-Body.

Die Response enthaelt bei Erfolg das vollstaendige Purchase-Objekt (inklusive PIN, Ablaufzeit und Abholort) sowie das neue Kontoguthaben.

---

## Screenshots

Screenshots koennen unter `docs/screenshots/` abgelegt werden. Die Wireframes in der Feature-Spec (`features/FEAT-7-one-touch-kauf.md`, Sektion 12) zeigen das gewuenschte UI-Layout fuer:
- Screen 1: Produktkatalog mit Kaufen-Buttons
- Screen 2: Erfolgsbestaetigung mit PIN
- Screen 3: Fehlermeldung bei zu wenig Guthaben

---

## Abhaengigkeiten

- **FEAT-2** (Demo User Authentication) - fuer User-Identifikation; der Kaufprozess ist an den eingeloggten Nutzer gebunden
- **FEAT-4** (Demo-Guthaben) - fuer die Guthaben-Pruefung und den automatischen Abzug nach dem Kauf
- **FEAT-6** (Produktkatalog) - fuer Produktinformationen (Preis, Kategorie, Bestand); der PurchaseButton wird in die bestehende ProductGrid-Komponente integriert

**Folgefeatures (werden FEAT-7 erweitern):**
- **FEAT-11** (Bestellabholung am Automaten) - aktiviert die NFC- und PIN-Buttons im Success-Modal und ermoeglicht die physische Abholung
- **FEAT-12** (Bestandsverwaltung) - fuegt Bestandsprueufng und Low-Stock-Warnungen ("Nur noch X Stueck!") hinzu
- **FEAT-13** (Low-Stock-Benachrichtigungen) - sendet Benachrichtigungen wenn der Bestand eines Produkts knapp wird

---

## Getestet

- Acceptance Criteria: Alle 10 bestanden (10/10)
- Edge Cases: 5 von 7 bestanden, 2 durch FEAT-11/12 bedingt
- Unit-Tests: 122/122 bestanden, Coverage 97%
- E2E-Tests: Login-Flow und Happy Path bestaetigt
- Cross-Browser: Chrome getestet
- Responsive: Mobile und Desktop
- Accessibility: Native `<button>`-Elemente, Touch-Targets min. 44x44px (ARIA-Labels empfohlen fuer folgende Iteration)
- Security: Auth-Checks, Admin-Guard, Drizzle ORM (kein SQL-Injection-Risiko), atomare Transaktion (ACID)
- Regression: FEAT-2, FEAT-4 und FEAT-6 nicht beeintraechtigt

**Behobene Bugs:**
- BUG-FEAT7-001 (Critical): Fehlende atomare Transaktion - behoben durch Umstieg auf WebSocket-Driver mit Transaktionsunterstuetzung
- BUG-FEAT7-002 (High): E2E-Test Login-Flow - behoben
- BUG-FEAT7-003 (Medium): Admin sah Kaufen-Buttons - behoben durch Conditional Rendering

---

## Naechste Schritte

- FEAT-11 implementieren: NFC- und PIN-Abholung am Automaten (Success-Modal-Buttons aktivieren)
- FEAT-12 implementieren: Bestandsverwaltung mit Low-Stock-Warnungen auf Produktkarten
- FEAT-13 implementieren: Push-Benachrichtigungen bei niedrigem Bestand
- Accessibility verbessern: ARIA-Labels zu Kaufen-Buttons hinzufuegen (`aria-label="Apfel kaufen fuer 1,50 Euro"`)
- PIN-Sicherheit haerten: `Math.random()` durch `crypto.randomInt()` ersetzen (fuer Production-Umgebung)

---

## Kontakt

Bei Fragen zu diesem Feature: Development-Team / Solution Architect
