# FEAT-20: Profil-Seite

## Status: Planned

## Abhaengigkeiten
- Benoetigt: FEAT-15 (App-Navigationsstruktur) - /profile-Route und Tab-Bar-Navigation muessen existieren
- Benoetigt: FEAT-16 (Warenkorb-System) - purchase_items-Struktur fuer abgeholte Bestellungen im Verlauf

---

## 1. Uebersicht

**Beschreibung:** Die /profile-Seite (bisher leerer Platzhalter aus FEAT-15) erhaelt ihren vollstaendigen Inhalt. Mitarbeiter sehen dort ihre persoenlichen Stammdaten (Name, Standort, aktuelles Guthaben) im Nur-Lese-Modus, interaktive Statistiken mit einem Zeitraum-Filter (7 Tage / 30 Tage / 90 Tage / Alle Zeit), einen chronologischen Bestellverlauf aller abgeholten Bestellungen sowie einen Logout-Button. Die Statistiken umfassen Gesamtausgaben, Anzahl der Bestellungen, das meistgekaufte Lieblingsprodukt und einen Gesundheits-Score von 1-10. Der Gesundheits-Score wird serverseitig auf Basis von Kalorien, Zucker, Fett und Boni fuer vegane oder glutenfreie Produkte berechnet. Ein hoehrer Score bedeutet gesuneder Einkauf.

**Ziel:** Mitarbeitern eine persoenliche Uebersicht ueber ihr Kaufverhalten, ihre Ausgaben und ihre Ernaehrungsgewohnheiten bieten.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich auf /profile meinen Namen, meinen Standort und mein aktuelles Guthaben sehen, damit ich meine Account-Daten im Blick habe | Mitarbeiter | Must-Have |
| US-2 | Als Mitarbeiter moechte ich meine Gesamtausgaben im gewaehlten Zeitraum sehen, damit ich weiss, wie viel ich fuer Snacks ausgegeben habe | Mitarbeiter | Must-Have |
| US-3 | Als Mitarbeiter moechte ich sehen, wie viele Bestellungen ich im gewaehlten Zeitraum abgeholt habe, damit ich mein Kaufverhalten einschaetzen kann | Mitarbeiter | Must-Have |
| US-4 | Als Mitarbeiter moechte ich mein Lieblingsprodukt (meistgekauftes Produkt) im gewaehlten Zeitraum sehen, damit ich erkenne, was ich am haeufigsten kaufe | Mitarbeiter | Must-Have |
| US-5 | Als Mitarbeiter moechte ich meinen Gesundheits-Score (1-10) im gewaehlten Zeitraum sehen, damit ich einschaetzen kann, wie ausgewogen meine Snack-Wahl war | Mitarbeiter | Must-Have |
| US-6 | Als Mitarbeiter moechte ich den Zeitraum fuer Statistiken und Bestellverlauf auf 7 Tage, 30 Tage, 90 Tage oder Alle Zeit umstellen koennen, damit ich verschiedene Zeitraeume vergleichen kann | Mitarbeiter | Must-Have |
| US-7 | Als Mitarbeiter moechte ich alle meine abgeholten Bestellungen im gewaehlten Zeitraum chronologisch sehen, damit ich nachvollziehen kann, was ich wann gekauft habe | Mitarbeiter | Must-Have |
| US-8 | Als Mitarbeiter moechte ich fuer jede abgeholte Bestellung die enthaltenen Produkte, den Gesamtbetrag und das Abhol-Datum sehen, damit ich einzelne Bestellungen nachvollziehen kann | Mitarbeiter | Must-Have |
| US-9 | Als Mitarbeiter moechte ich mich ueber einen Logout-Button abmelden koennen, damit ich meinen Account sicher verlassen kann | Mitarbeiter | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Profil-Header (Stammdaten)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Der obere Bereich der Seite zeigt den Namen des eingeloggten Mitarbeiters | Must-Have |
| REQ-2 | Der Standort des Mitarbeiters (Berlin oder Nuernberg) wird angezeigt | Must-Have |
| REQ-3 | Das aktuelle Guthaben des Mitarbeiters wird angezeigt (in Euro, z.B. "12,50 Euro") | Must-Have |
| REQ-4 | Die Stammdaten sind ausschliesslich lesend — es gibt keine Bearbeitungsfunktion | Must-Have |

### 3.2 Zeitraum-Filter

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-5 | Unterhalb des Profil-Headers befindet sich ein Zeitraum-Umschalter mit vier Optionen: "7 Tage", "30 Tage", "90 Tage", "Alle Zeit" | Must-Have |
| REQ-6 | Standard-Zeitraum beim Laden der Seite ist "30 Tage" | Must-Have |
| REQ-7 | Ein Wechsel des Zeitraums aktualisiert sowohl die Statistiken als auch den Bestellverlauf gleichzeitig | Must-Have |
| REQ-8 | Der aktuell aktive Zeitraum ist visuell hervorgehoben (z.B. ausgefuellter Hintergrund) | Must-Have |

### 3.3 Statistiken

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-9 | Die Statistik-Sektion zeigt vier Kennzahlen: Ausgaben gesamt, Anzahl Bestellungen, Lieblingsprodukt, Gesundheits-Score | Must-Have |
| REQ-10 | "Ausgaben gesamt": Summe aller Kaufpreise der abgeholten Bestellungen (status = picked_up) im gewaehlten Zeitraum, in Euro mit zwei Nachkommastellen | Must-Have |
| REQ-11 | "Anzahl Bestellungen": Gesamtanzahl der abgeholten Bestellungen (status = picked_up) im gewaehlten Zeitraum | Must-Have |
| REQ-12 | "Lieblingsprodukt": das Produkt mit der hoechsten Bestellhaeufigkeit (Anzahl Vorkommen in purchase_items) im gewaehlten Zeitraum; bei Gleichstand wird alphabetisch das erste Produkt angezeigt | Must-Have |
| REQ-13 | Hat der Mitarbeiter im gewaehlten Zeitraum keine Bestellungen, wird fuer das Lieblingsprodukt "Noch keine Bestellungen" angezeigt | Must-Have |
| REQ-14 | "Gesundheits-Score": ganzzahliger Wert von 1 bis 10; serverseitig berechnet aus den Naehrwerten (calories, sugar, fat) und Boni fuer vegane/glutenfreie Produkte der abgeholten Bestellungen im gewaehlten Zeitraum; hoeher = gesuender | Must-Have |
| REQ-15 | Hat der Mitarbeiter im gewaehlten Zeitraum keine Bestellungen, wird der Gesundheits-Score nicht berechnet und stattdessen ein Hinweis angezeigt (z.B. "Noch kein Score") | Must-Have |
| REQ-16 | Alle vier Statistiken werden gleichzeitig in einem API-Call abgerufen (ein Endpunkt fuer alle Profil-Statistiken des eingeloggten Nutzers) | Must-Have |

### 3.4 Bestellverlauf

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-17 | Der Bestellverlauf listet alle abgeholten Bestellungen (status = picked_up) des eingeloggten Mitarbeiters im gewaehlten Zeitraum | Must-Have |
| REQ-18 | Die Bestellungen sind chronologisch absteigend sortiert (neueste zuerst) | Must-Have |
| REQ-19 | Jede Bestellkarte zeigt: Abhol-Datum (pickedUpAt), Gesamtbetrag der Bestellung, Liste der enthaltenen Produkte (Name + Menge aus purchase_items) | Must-Have |
| REQ-20 | Gibt es im gewaehlten Zeitraum keine abgeholten Bestellungen, wird ein leerer Zustand mit Hinweistext angezeigt (z.B. "Keine Bestellungen in diesem Zeitraum") | Must-Have |
| REQ-21 | Der Bestellverlauf zeigt ausschliesslich Bestellungen mit status = picked_up; stornierte oder noch ausstehende Bestellungen werden nicht angezeigt | Must-Have |

### 3.5 Logout

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-22 | Am Ende der Seite befindet sich ein Logout-Button | Must-Have |
| REQ-23 | Ein Klick auf den Logout-Button ruft die bestehende logout()-Funktion des auth-Stores auf und leitet den Nutzer zu /login weiter | Must-Have |
| REQ-24 | Der Logout-Button ist visuell klar als destruktive Aktion erkennbar (z.B. rote Farbe oder Outline-Stil) | Must-Have |

---

## 4. Datenmodell

Kein neues Datenbankschema erforderlich. Die Profil-Seite nutzt ausschliesslich bestehende Tabellen:

| Tabelle | Felder | Verwendung |
|---------|--------|------------|
| `users` | `name`, `location`, `balance` | Profil-Header (Stammdaten) |
| `purchases` | `id`, `userId`, `totalAmount`, `status`, `pickedUpAt`, `createdAt` | Bestellverlauf (filter: status = picked_up) |
| `purchase_items` | `purchaseId`, `productId`, `quantity`, `price` | Produkte je Bestellung |
| `products` | `name`, `calories`, `sugar`, `fat`, `isVegan`, `isGlutenFree` | Gesundheits-Score-Berechnung, Lieblingsprodukt-Name |

---

## 5. API

Ein neuer Endpunkt liefert alle Profil-Daten des eingeloggten Mitarbeiters in einem Call:

### GET /api/profile/stats?period=30d

**Query-Parameter:**

| Parameter | Werte | Beschreibung |
|-----------|-------|--------------|
| `period` | `7d`, `30d`, `90d`, `all` | Zeitraum fuer Statistiken und Bestellverlauf |

**Response:**

```json
{
  "user": {
    "name": "string",
    "location": "string",
    "balance": "string"
  },
  "stats": {
    "totalSpent": "string",
    "orderCount": "number",
    "favoriteProduct": {
      "name": "string",
      "count": "number"
    } | null,
    "healthScore": "number" | null
  },
  "orders": [
    {
      "id": "number",
      "pickedUpAt": "string (ISO 8601)",
      "totalAmount": "string",
      "items": [
        {
          "productName": "string",
          "quantity": "number",
          "price": "string"
        }
      ]
    }
  ]
}
```

Der Endpunkt ist nur fuer eingeloggte Mitarbeiter zugaenglich (kein Admin-Zugriff). Die Session-Identifikation erfolgt ueber das bestehende HttpOnly-Cookie.

---

## 6. Gesundheits-Score — Berechnungsanforderungen

Die genaue Formel obliegt dem Solution Architect. Die fachlichen Anforderungen sind:

| Anforderung | Beschreibung |
|-------------|--------------|
| Eingabedaten | Alle purchase_items des Mitarbeiters im gewaehlten Zeitraum (nur status = picked_up), verknuepft mit den Naehrwertfeldern der Produkte |
| Skalierung | Der Ausgabewert ist ein ganzzahliger Score zwischen 1 (sehr ungesund) und 10 (sehr gesund) |
| Richtung | Hoeher = gesuender: wenig Kalorien, wenig Zucker, wenig Fett fuehren zu einem hoeheren Score |
| Bonuspunkte | Produkte mit isVegan = true oder isGlutenFree = true erhalten einen positiven Beitrag |
| Leerer Zeitraum | Wenn keine abgeholten Bestellungen im Zeitraum existieren, wird null zurueckgegeben |
| Fehlende Naehrwerte | Produkte ohne Naehrwertdaten (null-Felder) werden bei der Score-Berechnung uebersprungen |

---

## 7. Acceptance Criteria

- [ ] AC-1: Die Seite /profile ist erreichbar und zeigt Name, Standort und Guthaben des eingeloggten Mitarbeiters
- [ ] AC-2: Die Stammdaten sind ausschliesslich lesend — es gibt keine Bearbeiten-Schaltflaeche oder -Eingabe
- [ ] AC-3: Der Zeitraum-Umschalter zeigt vier Optionen: "7 Tage", "30 Tage", "90 Tage", "Alle Zeit"
- [ ] AC-4: Standard-Zeitraum beim ersten Laden ist "30 Tage"
- [ ] AC-5: Der aktive Zeitraum ist visuell hervorgehoben
- [ ] AC-6: Ein Wechsel des Zeitraums aktualisiert Statistiken und Bestellverlauf gleichzeitig
- [ ] AC-7: Statistik "Ausgaben gesamt" zeigt die korrekte Summe der abgeholten Bestellungen im gewaehlten Zeitraum
- [ ] AC-8: Statistik "Anzahl Bestellungen" zeigt die korrekte Anzahl abgeholter Bestellungen im gewaehlten Zeitraum
- [ ] AC-9: Statistik "Lieblingsprodukt" zeigt das meistgekaufte Produkt im gewaehlten Zeitraum
- [ ] AC-10: Statistik "Gesundheits-Score" zeigt einen Wert zwischen 1 und 10
- [ ] AC-11: Bei Zeitraum ohne Bestellungen zeigen Lieblingsprodukt und Gesundheits-Score einen Hinweistext statt eines Wertes
- [ ] AC-12: Der Bestellverlauf zeigt nur Bestellungen mit status = picked_up
- [ ] AC-13: Bestellungen sind chronologisch absteigend sortiert (neueste zuerst)
- [ ] AC-14: Jede Bestellkarte zeigt Abhol-Datum, Gesamtbetrag und enthaltene Produkte mit Menge
- [ ] AC-15: Kein Bestellverlauf im Zeitraum → leerer Zustand mit Hinweistext sichtbar
- [ ] AC-16: Der Logout-Button ist sichtbar und fuehrt nach Klick zur /login-Seite
- [ ] AC-17: Nach dem Logout ist der Nutzer nicht mehr eingeloggt (Session ungueltig)
- [ ] AC-18: Die Seite /profile ist nur fuer eingeloggte Mitarbeiter zugaenglich; nicht eingeloggte User werden zu /login weitergeleitet
- [ ] AC-19: Admins haben keinen Zugriff auf /profile

---

## 8. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Mitarbeiter hat noch nie eine Bestellung abgeholt | Statistiken zeigen 0 Euro, 0 Bestellungen, "Noch keine Bestellungen" beim Lieblingsprodukt, "Noch kein Score" beim Gesundheits-Score; Bestellverlauf zeigt leeren Zustand |
| EC-2 | Zeitraum "7 Tage" aber alle Bestellungen liegen weiter zurueck | Statistiken zeigen 0 / leer; Bestellverlauf zeigt leeren Zustand — kein Fehler |
| EC-3 | Zeitraum "Alle Zeit" mit sehr vielen Bestellungen | Bestellverlauf wird vollstaendig geladen; ggf. seitenweises Laden (Pagination oder Infinite Scroll) — Entscheidung obliegt Solution Architect |
| EC-4 | Zwei Produkte sind gleich oft gekauft (Gleichstand Lieblingsprodukt) | Alphabetisch erstes Produkt wird als Lieblingsprodukt angezeigt |
| EC-5 | Produkt aus Bestellverlauf wurde zwischenzeitlich vom Admin geloescht oder deaktiviert | Produktname wird aus purchase_items.productName oder JOIN angezeigt; Anzeige bleibt stabil (historische Daten) |
| EC-6 | Alle Produkte im Zeitraum haben keine Naehrwertdaten (null) | Gesundheits-Score wird nicht berechnet, "Noch kein Score" wird angezeigt — kein Fehler |
| EC-7 | Mitarbeiter hat negatives oder sehr hohes Guthaben (Randwert) | Guthaben wird unveraendert angezeigt (keine Formatierungsfehler) |
| EC-8 | Mitarbeiter klickt Logout-Button waehrend API-Anfrage noch laeuft | Logout wird ausgefuehrt, laufende Anfrage wird ignoriert (kein Fehler-Toast) |
| EC-9 | Session laeuft ab waehrend Mitarbeiter die Profil-Seite offen hat und er wechselt den Zeitraum | Naechster API-Call gibt 401 zurueck; bestehender Auth-Guard leitet zu /login weiter |
| EC-10 | Mitarbeiter ruft /profile direkt per URL-Eingabe auf ohne eingeloggt zu sein | auth.global.ts Middleware leitet zu /login weiter |

---

## 9. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| NFR-1 | API-Response des Profil-Endpunkts < 500ms (serverseitig, bei Standard-Datenmenge) |
| NFR-2 | Statistiken und Bestellverlauf werden in einem einzigen API-Call geladen (kein Waterfall) |
| NFR-3 | Die Seite ist vollstaendig responsiv (Mobile First) |
| NFR-4 | Waehrend des Ladens werden Skeleton-Elemente statt leerer Bereiche angezeigt |
| NFR-5 | Icons ausschliesslich aus Teenyicons 1.0 (npm: teenyicons) |
| NFR-6 | Kein direkter DB-Zugriff aus dem Browser — alle Daten kommen ausschliesslich ueber den Nuxt Server API Endpunkt |

---

## 10. UI-Komponenten

| Komponente | Beschreibung |
|------------|--------------|
| `src/pages/profile.vue` | Haupt-Seite /profile — ersetzt den FEAT-15-Platzhalter |
| `src/components/profile/ProfileHeader.vue` | Oberer Bereich mit Name, Standort, Guthaben |
| `src/components/profile/PeriodSelector.vue` | Zeitraum-Umschalter (7T / 30T / 90T / Alle) |
| `src/components/profile/StatsGrid.vue` | Grid mit den vier Statistik-Kacheln |
| `src/components/profile/StatCard.vue` | Einzelne Statistik-Kachel (Label + Wert + Icon) |
| `src/components/profile/HealthScoreCard.vue` | Gesundheits-Score-Kachel mit Score-Visualisierung (1-10) |
| `src/components/profile/OrderHistoryList.vue` | Liste aller abgeholten Bestellungen |
| `src/components/profile/OrderHistoryItem.vue` | Einzelne Bestellkarte (Datum, Betrag, Produkte) |
| `src/components/profile/LogoutButton.vue` | Logout-Schaltflaeche (ruft auth-Store logout() auf) |

---

## 11. Technische Anforderungen

- Routing: Bestehende /profile-Route aus FEAT-15 (keine Aenderung am Router)
- API: Neuer Endpunkt GET /api/profile/stats mit Query-Parameter `period` (7d | 30d | 90d | all)
- Auth: /profile ist in auth.global.ts als Protected Path eingetragen (bereits aus FEAT-15)
- Auth-Pruefung: onMounted als Auth-Guard (konsistentes Pattern gemaess Projekt-Architektur)
- Session: Identifikation des eingeloggten Nutzers ueber bestehendes HttpOnly-Cookie
- State: Lokaler Komponenten-State auf profile.vue genuegt; kein neuer Pinia-Store notwendig
- Gesundheits-Score: Berechnung ausschliesslich serverseitig in der API-Route
- Icons: Teenyicons 1.0 (npm: teenyicons)
- Datumsformatierung: Abhol-Datum (pickedUpAt) wird in deutschem Format angezeigt (DD.MM.YYYY HH:MM)

---

## 12. Abgrenzung (Out of Scope fuer FEAT-20)

| Thema | Begruendung |
|-------|-------------|
| Profil-Daten bearbeiten (Name, Passwort) | Explizit ausgeschlossen — Profil-Seite ist rein lesend |
| Profilbild / Avatar | Out of Scope fuer MVP |
| Push-Benachrichtigungen oder Erinnerungen | Eigenes Feature |
| Export der Bestellhistorie (PDF/CSV) | Out of Scope fuer MVP |
| Pagination des Bestellverlaufs (genaue Umsetzung) | Entscheidung obliegt Solution Architect (EC-3) |
| Vergleich mit anderen Mitarbeitern | Leaderboard (FEAT-8) ist das zustaendige Feature |
| Admin-Profil-Seite | Admins haben kein /profile (kein Zugriff gemaess Architektur) |
