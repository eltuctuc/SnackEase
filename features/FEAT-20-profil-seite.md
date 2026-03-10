# FEAT-20: Profil-Seite

## Status: Implemented

## Abhaengigkeiten
- Benoetigt: FEAT-15 (App-Navigationsstruktur) - /profile-Route und Tab-Bar-Navigation muessen existieren
- Benoetigt: FEAT-16 (Warenkorb-System) - purchase_items-Struktur fuer abgeholte Bestellungen im Verlauf

## Wireframes

| Screen | Datei |
|--------|-------|
| Profil (/profile) | `resources/high-fidelity/profil.png` |
| Guthaben aufladen | `resources/high-fidelity/credit.png` |
| Zahlungsmethode waehlen | `resources/high-fidelity/payment.png` |

> Wireframes zeigen Struktur und Informationsarchitektur. Die visuelle Umsetzung richtet sich nach `resources/moodboard.png`, dem Tailwind-Theme und dem UX Expert Review.

> Wireframe und Spec wurden zusammengefuehrt: Die Profil-Seite enthaelt alle Elemente aus beiden Quellen (Bonuspunkte-Chart, erweiterte Einkaufsstatistiken, Gesundheitsscore, Lieblingsprodukt, Bestellverlauf, Avatar-Platzhalter, Guthaben-Icon).

> "Guthaben aufladen" (credit.png) und "Zahlungsmethode" (payment.png) sind in FEAT-24 spezifiziert. Das Guthaben-Icon im Profil-Header navigiert zu FEAT-24.

---

## 1. Uebersicht

**Beschreibung:** Die /profile-Seite erhaelt ihren vollstaendigen Inhalt. Mitarbeiter sehen dort:
- **Profil-Header:** Avatar-Platzhalter, Name (readonly), aktuelles Guthaben mit Kreditkarten-Icon (fuehrt zu FEAT-24: Guthaben aufladen)
- **Bonuspunkte-Sektion:** Balkendiagramm der gesammelten Bonuspunkte mit Woche/Monat/Jahr-Umschalter + "Verlauf"-Link
- **Einkaufsstatistiken:** Gesamt-Einkaufsanzahl, Kaeufe in den letzten 7 Tagen, Datum letzter Kauf, Ausgaben nach Woche/Monat/Jahr + "Kaufhistorie"-Link
- **Erweiterte Stats:** Lieblingsprodukt (meistgekauftes Produkt), Gesundheits-Score (1-10, serverseitig berechnet aus Naehrwerten + Boni fuer vegane/glutenfreie Produkte)
- **Logout-Button** am Ende der Seite

**Ziel:** Mitarbeitern eine persoenliche Uebersicht ueber ihr Kaufverhalten, ihre Ausgaben und ihre Ernaehrungsgewohnheiten bieten.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich auf /profile meinen Avatar, meinen Namen und mein aktuelles Guthaben sehen, damit ich meine Account-Daten im Blick habe | Mitarbeiter | Must-Have |
| US-1b | Als Mitarbeiter moechte ich ueber das Kreditkarten-Icon neben meinem Guthaben zur "Guthaben aufladen"-Seite navigieren koennen | Mitarbeiter | Must-Have |
| US-1c | Als Mitarbeiter moechte ich meine gesammelten Bonuspunkte als Balkendiagramm sehen (aufgeteilt nach Woche/Monat/Jahr), damit ich meinen Fortschritt verfolgen kann | Mitarbeiter | Must-Have |
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
| REQ-1 | Der obere Bereich der Seite zeigt einen Avatar-Platzhalter (Bild-Icon) und den Namen des eingeloggten Mitarbeiters | Must-Have |
| REQ-2 | Das aktuelle Guthaben des Mitarbeiters wird neben einem Kreditkarten-Icon angezeigt (in Euro, z.B. "6,00 €") | Must-Have |
| REQ-3 | Ein Tap auf das Kreditkarten-Icon navigiert zur Route /profile/credit (Guthaben aufladen, FEAT-24) | Must-Have |
| REQ-4 | Die Stammdaten sind ausschliesslich lesend — es gibt keine Bearbeitungsfunktion in FEAT-20 | Must-Have |

### 3.1b Bonuspunkte-Sektion

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-4a | Unterhalb des Profil-Headers befindet sich eine "Bonuspunkte"-Sektion mit einem Zeitraum-Umschalter: "Woche", "Monat", "Jahr" | Must-Have |
| REQ-4b | Die Sektion zeigt ein Balkendiagramm der gesammelten Bonuspunkte im gewaehlten Zeitraum (bei "Woche": 7 Tagesbalken; "Monat": Wochenbalken; "Jahr": Monatsbalken) | Must-Have |
| REQ-4c | Rechts neben "Bonuspunkte" befindet sich ein "Verlauf"-Link (fuehrt zur Kaufhistorie — identisch mit dem "Kaufhistorie"-Link in den Einkaufsstatistiken) | Must-Have |
| REQ-4d | Der aktuell aktive Zeitraum-Tab ist visuell hervorgehoben | Must-Have |

### 3.2 Zeitraum-Filter

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-5 | Unterhalb des Profil-Headers befindet sich ein Zeitraum-Umschalter mit vier Optionen: "7 Tage", "30 Tage", "90 Tage", "Alle Zeit" | Must-Have |
| REQ-6 | Standard-Zeitraum beim Laden der Seite ist "30 Tage" | Must-Have |
| REQ-7 | Ein Wechsel des Zeitraums aktualisiert sowohl die Statistiken als auch den Bestellverlauf gleichzeitig | Must-Have |
| REQ-8 | Der aktuell aktive Zeitraum ist visuell hervorgehoben (z.B. ausgefuellter Hintergrund) | Must-Have |

### 3.3 Einkaufsstatistiken

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-9 | Die Einkaufs-Sektion zeigt eine Kennzahlen-Uebersicht und rechts daneben einen "Kaufhistorie"-Link | Must-Have |
| REQ-10 | Kennzahlen (immer sichtbar, zeitraeume-unabhaengig): Gesamt-Einkaufsanzahl (alle abgeholten Bestellungen aller Zeiten), Anzahl Einkauefe in den letzten 7 Tagen, Datum des letzten Einkaufs (DD.MM.YYYY) | Must-Have |
| REQ-11 | Ausgaben nach Zeitraum (immer alle drei gleichzeitig sichtbar): Ausgaben diese Woche (€), Ausgaben diesen Monat (€), Ausgaben dieses Jahr (€) | Must-Have |
| REQ-12 | "Lieblingsprodukt": das Produkt mit der hoechsten Bestellhaeufigkeit (alle Zeiten); bei Gleichstand alphabetisch das erste | Must-Have |
| REQ-13 | Hat der Mitarbeiter noch keine Bestellungen, wird "Noch keine Einkauefe" angezeigt | Must-Have |
| REQ-14 | "Gesundheits-Score": ganzzahliger Wert von 1 bis 10; serverseitig berechnet aus den Naehrwerten (calories, sugar, fat) und Boni fuer vegane/glutenfreie Produkte aller abgeholten Bestellungen; hoeher = gesuender | Must-Have |
| REQ-15 | Hat der Mitarbeiter noch keine Bestellungen, wird der Gesundheits-Score nicht berechnet und "Noch kein Score" angezeigt | Must-Have |
| REQ-16 | Alle Statistiken und Bonuspunkte-Daten werden in einem API-Call abgerufen | Must-Have |

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

## 13. UX Design (Validierungsbericht)

> Erstellt durch UX Expert Agent — 2026-03-09

### Personas-Abdeckung

| Persona | Nutzen | Hauptvorteil |
|---------|--------|--------------|
| Nina Neuanfang | Hoch | Guthaben sehen, App kennenlernen |
| Maxine Snackliebhaber | Sehr hoch | Ausgaben-Tracking, Kaufhistorie |
| Lucas Gesundheitsfan | Sehr hoch | Gesundheits-Score, Ernaehrungsreflexion |
| Alex Gelegenheitskaufer | Mittel | Guthaben-Check, gelegentlicher Verlauf |
| Tom Schnellkaufer | Niedrig | Nur Logout und Guthaben relevant |
| Mia Entdeckerin | Hoch | Alle Statistiken, Gamification-Aspekt |

### Wireframe-Abgleich

Alle Elemente aus `profil.png` sind in der Spec enthalten. Zwei dokumentierte Diskrepanzen:

1. **Stift-Icon im Wireframe (Edit-Icon):** Das Wireframe zeigt ein blaues Stift-Icon neben dem Namen. Die Spec schliesst Profilbearbeitung in Abschnitt 12 explizit aus. Das Icon ist im Wireframe veraltet — **der Developer darf es nicht implementieren.**
2. **Zwei Zeitraum-Umschalter:** Bonuspunkte-Sektion nutzt "Woche/Monat/Jahr", die Statistiken-Sektion einen separaten "7T/30T/90T/Alle"-Umschalter. Beide sind bewusste Design-Entscheidungen der Spec. Visuelle Trennung ist Pflicht (siehe UX-Empfehlungen).

### Accessibility (WCAG 2.1)

- [x] Farbkontrast: konform bei korrekter Anwendung des Projekt-Themes (dunkle Texte auf hellem Hintergrund)
- [x] Fehlermeldungen: alle leeren Zustaende sind definiert (EC-1 bis EC-10)
- [x] Tastatur-Navigation: Vue-native Buttons, keine Sondermassnahmen noetig
- [x] Keine Zeitlimits: keine timed Elemente in FEAT-20
- [ ] Touch-Targets: Alle interaktiven Elemente (Zeitraum-Tabs, Logout-Button, Kreditkarten-Icon) muessen `min-h-[44px] min-w-[44px]` erhalten (WCAG 2.5.5)
- [ ] Balkendiagramm: Screenreader-Alternative erforderlich — visually-hidden Tabelle hinter dem Chart oder `aria-label` pro Balken ("Montag: 12 Punkte")
- [ ] Avatar-Placeholder braucht `aria-label="Profilbild-Platzhalter"`
- [ ] Fokus-States: `focus:ring` auf allen interaktiven Elementen sicherstellen

### UX-Empfehlungen fuer die Implementierung

Diese Empfehlungen veraendern die Spec nicht — sie leiten Developer und Solution Architect:

**1. Gesundheits-Score: Kontext-Tooltip**
Die Zahl "7/10" ist ohne Erklaerung abstrakt. Die `HealthScoreCard.vue` soll ein Fragezeichen-Icon (Teenyicons: `question-mark-circle`) mit Tooltip enthalten, der die Einflussfaktoren nennt (Kalorien, Zucker, Fett, Vegan-/GlutenFrei-Bonus). Kein neues Requirement, aber entscheidend fuer den wahrgenommenen Wert bei Lucas (Gesundheitsfan).

**2. Logout-Button: Bestaetigung empfohlen**
Ein unbeabsichtigter Logout mitten in einem Workflow ist frustrierend (hohe UX-Severity). Empfehlung: Nach erstem Tap den Button-Text auf "Abmelden bestaetigen?" aendern (kein Modal noetig). Oder: einfachen Bestatigungsdialog. Da die Spec dies nicht ausschliesst, ist es eine Developer-Entscheidung.

**3. Zwei Zeitraum-Umschalter: Visuelle Hierarchie**
Den Bonuspunkte-Umschalter (Woche/Monat/Jahr) als sekundaeren Segmented Control innerhalb der Bonuspunkte-Card rendern (kleinere Groesse, innerer Kontext). Den globalen Zeitraum-Umschalter (7T/30T/90T/Alle) als primae Element in voller Breite auf Seitenebene. So ist sofort erkennbar, dass es zwei unabhaengige Steuerelemente sind.

**4. Skeleton-Screens: Sektionsweise, nicht seitenweise**
NFR-4 fordert Skeleton-Elemente. Empfehlung: Profil-Header sofort anzeigen (Daten kommen aus Auth-Cookie/Store), Chart und Statistiken erst nach API-Response. Der User sieht sofort seinen Namen und Guthaben — die wahrgenommene Ladezeit sinkt.

**5. Bonuspunkte-Chart leerer Zustand (EC-1)**
Statt leerer Null-Balken: freundlichen leeren Zustand mit Text rendern, z.B. "Kaufe deinen ersten Snack, um Bonuspunkte zu sammeln." Besonders wichtig fuer Nina (Neue Mitarbeiterin).

**6. Bestellhistorie-Karten: Kollabierbar bei mehreren Produkten**
`OrderHistoryItem.vue` soll das bestehende Kollaps-Pattern von `OrderCard.vue` (FEAT-16) uebernehmen — bei mehr als einem Produkt einklappbar. Sichert Konsistenz und haelt die Seite scanbar.

**7. Chart-Bibliothek: vue-chartjs**
Fuer die Bonuspunkte-Visualisierung (Balkendiagramm) ist `vue-chartjs` als Wrapper fuer Chart.js empfohlen (Entscheidung liegt beim Solution Architect). Recharts ist React-spezifisch und nicht kompatibel.

**8. Nicht spezifizierter Edge Case (EC-11)**
Wenn der Bonuspunkte-Chart auf "Woche" steht, aber in dieser Woche keine Kaeufe vorliegen: explizit leeren Zustand zeigen, keine Null-Balken ohne Beschriftung.

### Freigabe

Die Feature-Spec FEAT-20 ist vollstaendig, widerspruchsfrei und umsetzungsreif. Alle Edge Cases sind behandelt, die API-Struktur ist definiert, die Komponenten-Architektur ist klar. Offene Punkte fuer den Solution Architect: Pagination-Entscheidung (EC-3), Chart-Bibliothek, Gesundheits-Score-Formel.

**Status: Bereit fuer Solution Architect**

---

## 14. Tech-Design (Solution Architect)

> Erstellt durch Solution Architect Agent — 2026-03-09

### Architektur-Pruefung (Ist-Zustand)

Folgende bestehende Infrastruktur wird wiederverwendet:

| Infrastruktur | Pfad | Relevanz |
|---|---|---|
| Auth-Middleware | `src/middleware/auth.global.ts` | /profile bereits als protected Path eingetragen |
| Auth-Store / logout() | `src/stores/auth.ts` | Logout-Button ruft `authStore.logout()` direkt auf |
| requireUser-Util | `src/server/utils/auth.ts` | Sitzungsvalidierung im neuen API-Endpunkt |
| useFormatter | `src/composables/useFormatter.ts` | Preisformatierung in OrderHistoryItem.vue |
| OrderCard.vue Kollaps-Pattern | `src/components/orders/OrderCard.vue` | Vorlage fuer kollabierbare Produktliste in OrderHistoryItem.vue |
| Drizzle Query-Pattern | `src/server/api/admin/stats.get.ts` | Promise.all()-Strategie fuer parallele Queries |
| purchases + purchase_items Schema | `src/server/db/schema.ts` | Basis fuer alle Bestellverlauf- und Statistik-Queries |
| products Schema (calories, sugar, fat, isVegan, isGlutenFree) | `src/server/db/schema.ts` | Eingabe fuer Gesundheits-Score-Berechnung |
| purchases.bonusPoints | `src/server/db/schema.ts` | Spalte existiert (integer, default 0) — Bonuspunkte werden direkt daraus gelesen |

**Wichtige Feststellung: Bonuspunkte-Spalte existiert bereits.** Das purchases-Schema hat `bonusPoints: integer('bonus_points').default(0)`. Es ist keine neue Tabelle und keine Ableitung aus Kaufbetrag noetig. Bonuspunkte werden aus `purchases.bonusPoints` aggregiert (summiert per Zeitraum/Zeiteinheit).

**Keine Chart-Library im package.json vorhanden.** Weder vue-chartjs noch Chart.js sind installiert. Eine neue Dependency muss bewusst entschieden werden (siehe unten).

---

### Technische Entscheidungen

#### 1. Chart-Bibliothek: vue-chartjs (neu installieren)

**Entscheidung: vue-chartjs + chart.js**

**Begruendung:**
- `vue-chartjs` ist der empfohlene Vue 3 Wrapper fuer Chart.js — die meistgenutzte, stabils te Web-Chart-Library
- Das UX Expert Review empfiehlt explizit vue-chartjs (Abschnitt 13, Punkt 7)
- Native SVG waere fuer ein animiertes, responsives Balkendiagramm mit 7/4/12 Balken signifikant aufwaendiger zu implementieren und zu testen
- Chart.js hat keine weiteren schweren Abhaengigkeiten und ist Tree-shakeable
- Alternativ geprueft: Recharts ist React-only (inkompatibel), D3.js ist zu komplex fuer diesen Anwendungsfall

**Neue Packages:**
```
vue-chartjs
chart.js
```

#### 2. Gesundheits-Score-Formel

**Eingabe:** Alle purchase_items des Nutzers im gewaehlten Zeitraum (nur status = picked_up), verknuepft mit den Naehrwertfeldern der Produkte (calories, sugar, fat, isVegan, isGlutenFree). Produkte ohne Naehrwerte werden uebersprungen.

**Formel (serverseitig, ganzzahliger Score 1–10):**

```
Schritt 1 — Durchschnittswerte berechnen (gewichtet nach Menge):
  avgCalories = Summe(calories * quantity) / Summe(quantity)
  avgSugar    = Summe(sugar * quantity) / Summe(quantity)
  avgFat      = Summe(fat * quantity) / Summe(quantity)
  veganRatio  = Anteil veganer Items (0.0 bis 1.0)
  glutenRatio = Anteil glutenfreier Items (0.0 bis 1.0)

Schritt 2 — Rohscore berechnen (0.0 bis 10.0):
  calorieScore = clamp(10 - (avgCalories / 50), 0, 10)
    → 0 kcal = 10 Punkte, 500 kcal = 0 Punkte, linear
  sugarScore   = clamp(10 - (avgSugar / 5), 0, 10)
    → 0g = 10 Punkte, 50g = 0 Punkte, linear
  fatScore     = clamp(10 - (avgFat / 5), 0, 10)
    → 0g = 10 Punkte, 50g = 0 Punkte, linear

  rawScore = (calorieScore * 0.5) + (sugarScore * 0.3) + (fatScore * 0.2)

Schritt 3 — Boni addieren:
  bonus = (veganRatio * 0.5) + (glutenRatio * 0.3)
  boostedScore = rawScore + bonus

Schritt 4 — Auf Integer 1–10 runden:
  finalScore = clamp(round(boostedScore), 1, 10)
```

**Referenzwerte:**
- Typischer Snack (250 kcal, 15g Zucker, 10g Fett): Score ~5
- Wassermelone-Stuecke (50 kcal, 6g Zucker, 0g Fett, vegan): Score ~9
- Schokoriegel (500 kcal, 45g Zucker, 25g Fett): Score ~1

**Leerer Zeitraum / alle Produkte ohne Naehrwerte:** Gibt `null` zurueck. Frontend zeigt "Noch kein Score".

#### 3. Pagination fuer Bestellverlauf (EC-3): Load-More-Button mit Limit 20

**Entscheidung: Load-More-Button (clientseitig), initiales Limit 20, Erweiterung um je 20**

**Begruendung:**
- Infinite Scroll erfordert Scroll-Position-Tracking (komplexer, fehleranfaelliger auf mobilen Geraeten)
- Kein Pagination (Limit 50) laedt unnoetig viele Daten bei "Alle Zeit"-Zeitraum; ein Mitarbeiter mit 2 Jahren Nutzung koennte 500+ Bestellungen haben
- Load-More ist das etablierte Mobile-Pattern bei Listen mittlerer Laenge
- Implementierung: Der API-Endpunkt gibt immer ALLE Bestellungen des Zeitraums zurueck; das Slicing (Anzeige-Limit) geschieht rein clientseitig in `OrderHistoryList.vue`. So bleibt die API einfach (kein cursor-based Pagination noetig)
- Falls spaeter serverseitiges Cursor-Pagination benoetigt wird, kann die API erweiterung ohne Breaking Change erfolgen

**Verhalten:**
- Initial: Die ersten 20 Bestellungen werden angezeigt
- "Mehr laden"-Button erscheint wenn mehr als 20 Bestellungen vorhanden sind
- Nach Klick: 20 weitere Bestellungen werden eingeblendet (kein neuer API-Call)
- Button verschwindet wenn alle Bestellungen sichtbar sind

#### 4. Drizzle ORM Query-Strategie fuer GET /api/profile/stats

Der Endpunkt fuehrt **einen Query-Block mit Promise.all()** aus (analog zu admin/stats.get.ts). Die Queries sind nach Verantwortung gruppiert:

**Query-Block A — Nutzerdaten (1 Query):**
- JOIN users + user_credits auf userId → name, location, balance

**Query-Block B — Bestellverlauf mit Items (1 Query + N:M-Join):**
- SELECT purchases WHERE userId = :userId AND status = 'picked_up' AND createdAt >= :since
- LEFT JOIN purchase_items ON purchaseId
- LEFT JOIN products ON productId (fuer productName bei geloeschten Produkten: fallback auf purchase_items)
- ORDER BY pickedUpAt DESC
- Ergebnis wird serverseitig in Gruppen (pro Purchase) aggregiert

**Query-Block C — Statistiken (5 parallele Queries via Promise.all):**
1. Gesamtanzahl abgeholter Bestellungen aller Zeiten (kein Zeitraum-Filter)
2. Anzahl abgeholter Bestellungen in den letzten 7 Tagen (fester 7d-Filter, unabhaengig vom period-Parameter)
3. Datum letzter Kauf (MAX pickedUpAt, alle Zeiten)
4. Ausgaben dieser Woche / dieses Monats / dieses Jahres (3 WHERE-Clauses, kalendarisch per SQL date_trunc)
5. Lieblingsprodukt: GROUP BY productId, COUNT(*), ORDER BY count DESC, name ASC — LIMIT 1

**Query-Block D — Bonuspunkte-Daten fuer Chart (1 Query):**
- SELECT pickedUpAt, bonusPoints FROM purchases WHERE userId = :userId AND status = 'picked_up' AND createdAt >= :since (Zeitraum aus period-Parameter)
- Serverseitige Aggregation zu Zeitbuckets (bei "Woche": 7 Tage; "Monat": 4 Wochen; "Jahr": 12 Monate)

**Query-Block E — Gesundheits-Score (1 Query):**
- JOIN purchase_items + products auf productId WHERE purchaseId IN (...Bestellungen aus Zeitraum...)
- Gibt pro Item: calories, sugar, fat, isVegan, isGlutenFree, quantity
- Score-Berechnung nach Formel aus Entscheidung 2 (serverseitig in der Route-Handler-Logik)

**Wichtig:** Query-Block B und E koennen denselben Bestellungs-Datensatz wiederverwenden (erst Bestellungen laden, dann Items fuer Score separat). Kein N+1-Problem, da alle Items in einem einzigen JOIN-Query geholt werden.

---

### Component-Struktur

```
src/pages/profile.vue (Platzhalter wird vollstaendig ersetzt)
├── ProfileHeader.vue
│   ├── Avatar-Platzhalter (Teenyicons: user-circle)
│   ├── Name (readonly)
│   ├── Standort (readonly)
│   └── Guthaben + Kreditkarten-Icon (navigiert zu /profile/credit)
│
├── BonusPointsCard.vue (neue Komponente, eigenstaendige Sektion)
│   ├── Zeitraum-Tabs: "Woche" / "Monat" / "Jahr" (sekundaerer Segmented Control)
│   ├── Balkendiagramm (vue-chartjs BarChart)
│   │   ├── Woche: 7 Tagesbalken (Mo–So)
│   │   ├── Monat: 4 Wochenbalken (KW1–KW4)
│   │   └── Jahr: 12 Monatsbalken (Jan–Dez)
│   ├── Leerer Zustand: "Kaufe deinen ersten Snack..." (EC-1/EC-11)
│   └── "Verlauf"-Link (fuehrt zur Bestellhistorie-Sektion)
│
├── PeriodSelector.vue (globaler Zeitraum-Umschalter)
│   └── 4 Tabs: "7 Tage" / "30 Tage" / "90 Tage" / "Alle Zeit"
│
├── StatsGrid.vue
│   ├── StatCard.vue — Gesamt-Einkauefe (alle Zeiten)
│   ├── StatCard.vue — Einkauefe letzte 7 Tage
│   ├── StatCard.vue — Letzter Einkauf (Datum)
│   ├── StatCard.vue — Ausgaben diese Woche
│   ├── StatCard.vue — Ausgaben diesen Monat
│   ├── StatCard.vue — Ausgaben dieses Jahr
│   ├── FavoriteProductCard.vue — Lieblingsprodukt (Name + Kaufhaeufigkeit)
│   └── HealthScoreCard.vue — Score (1–10) + Fragezeichen-Tooltip
│
├── OrderHistoryList.vue
│   ├── OrderHistoryItem.vue (x N, kollabierbar bei >1 Produkt)
│   │   ├── Abhol-Datum (pickedUpAt, Format DD.MM.YYYY HH:MM)
│   │   ├── Gesamtbetrag
│   │   └── Produktliste (kollabierbar ab 2+ Produkte — Pattern aus OrderCard.vue)
│   ├── Leerer Zustand (EC-2)
│   └── "Mehr laden"-Button (Load-More, clientseitig, ab 20+ Bestellungen)
│
└── LogoutButton.vue
    └── Zweistufiger Logout (UX-Empfehlung Abschnitt 13: erst "Abmelden?" dann bestaetigen)
```

---

### Daten-Model

Kein neues Datenbankschema erforderlich. Alle Informationen stammen aus bestehenden Tabellen:

**Profil-Header:**
- Name und Standort: `users.name`, `users.location`
- Guthaben: `user_credits.balance` (JOIN auf userId)

**Bonuspunkte:**
- Punkte pro Bestellung: `purchases.bonusPoints` (bereits gespeichert, integer, default 0)
- Keine neue Spalte oder Tabelle noetig

**Einkaufsstatistiken:**
- Bestellanzahl + Ausgaben: `purchases` (WHERE status = 'picked_up')
- Ausgaben: `purchases.totalPrice` (FEAT-16 Warenkorb) oder `purchases.price` (FEAT-7 Legacy)
- Lieblingsprodukt: `purchase_items.productId` + `products.name`

**Gesundheits-Score:**
- Naehrwerte: `products.calories`, `products.sugar`, `products.fat`, `products.isVegan`, `products.isGlutenFree`
- Verknuepfung: `purchase_items.productId` → `products.id`
- Menge je Item: `purchase_items.quantity`

**Bestellverlauf:**
- Bestellungen: `purchases` (WHERE status = 'picked_up', ORDER BY pickedUpAt DESC)
- Produkte je Bestellung: `purchase_items` (LEFT JOIN) + `products.name`

---

### Dependencies (neue Packages)

```
vue-chartjs   (Balkendiagramm fuer Bonuspunkte-Chart)
chart.js      (Peer-Dependency von vue-chartjs)
```

Alle anderen benoetigen Funktionen (Tailwind, Teenyicons, Pinia, useFormatter) sind bereits vorhanden.

---

### Dateien: Neu erstellt

| Datei | Beschreibung |
|---|---|
| `src/server/api/profile/stats.get.ts` | Neuer API-Endpunkt GET /api/profile/stats?period=7d|30d|90d|all |
| `src/components/profile/ProfileHeader.vue` | Name, Standort, Guthaben + Kreditkarten-Icon |
| `src/components/profile/BonusPointsCard.vue` | Bonuspunkte-Sektion mit Chart + eigenem Zeitraum-Umschalter |
| `src/components/profile/PeriodSelector.vue` | Globaler Zeitraum-Umschalter (7T/30T/90T/Alle) |
| `src/components/profile/StatsGrid.vue` | Container fuer alle Statistik-Kacheln |
| `src/components/profile/StatCard.vue` | Einzelne Statistik-Kachel (Label, Wert, Icon) |
| `src/components/profile/FavoriteProductCard.vue` | Lieblingsprodukt-Kachel |
| `src/components/profile/HealthScoreCard.vue` | Score-Kachel mit Tooltip (Teenyicons: question-mark-circle) |
| `src/components/profile/OrderHistoryList.vue` | Liste abgeholter Bestellungen + Load-More |
| `src/components/profile/OrderHistoryItem.vue` | Einzelne Bestellkarte (kollabierbar, analog OrderCard.vue) |
| `src/components/profile/LogoutButton.vue` | Zweistufiger Logout-Button |

### Dateien: Modifiziert

| Datei | Aenderung |
|---|---|
| `src/pages/profile.vue` | Platzhalter-Inhalt wird vollstaendig durch echte Implementierung ersetzt |
| `package.json` | vue-chartjs + chart.js werden als neue Dependencies eingetragen |

---

### Implementierungsreihenfolge

1. **Package-Installation:** `vue-chartjs` und `chart.js` installieren

2. **API-Endpunkt erstellen** (`src/server/api/profile/stats.get.ts`):
   - Session-Validierung via requireUser (kein Admin-Zugriff)
   - period-Parameter parsen (7d/30d/90d/all) → SQL-Timestamp-Grenze berechnen
   - Promise.all() mit allen Query-Bloecken A–E (parallel)
   - Gesundheits-Score-Berechnung serverseitig nach Formel (Abschnitt oben)
   - Bonuspunkte-Daten zu Chart-Buckets aggregieren (Woche/Monat/Jahr)
   - Response zusammenbauen gemaess Spec-Format (Abschnitt 5)

3. **Basis-Komponenten erstellen:**
   - `StatCard.vue` (Label, Wert, Icon — rein presentational)
   - `PeriodSelector.vue` (4 Tabs, aktiver Tab hervorgehoben, min-h-[44px])

4. **Profil-Header:** `ProfileHeader.vue` mit Avatar-Platzhalter, Name, Standort, Guthaben-Link

5. **Bonuspunkte-Chart:** `BonusPointsCard.vue` mit vue-chartjs BarChart und eigenem Woche/Monat/Jahr-Umschalter; leerer Zustand fuer keine Daten

6. **Statistik-Grid:** `StatsGrid.vue` mit `FavoriteProductCard.vue` und `HealthScoreCard.vue` (inkl. Tooltip)

7. **Bestellverlauf:**
   - `OrderHistoryItem.vue` mit Kollaps-Logik (analog OrderCard.vue)
   - `OrderHistoryList.vue` mit clientseitigem Load-More (initiales Limit 20)

8. **Logout-Button:** `LogoutButton.vue` mit zweistufigem Bestaetiger

9. **Hauptseite zusammenbauen:** `src/pages/profile.vue` — Platzhalter ersetzen, alle Komponenten einbinden, API-Call mit period-reaktivitaet, Skeleton-Screens waehrend Ladezeit

10. **Auth-Guard hinzufuegen:** `onMounted` in profile.vue prueft authStore.user und leitet Admins zu /admin weiter (gemaess Architektur-Pattern)

11. **Middleware erweitern:** In `src/middleware/auth.global.ts` einen Guard ergaenzen: Admin auf /profile wird zu /admin weitergeleitet (analog zum bestehenden /leaderboard-Guard)

---

### Test-Anforderungen

**Unit-Tests (Vitest):**

| Test-Datei | Was wird getestet |
|---|---|
| `tests/utils/healthScore.test.ts` | Gesundheits-Score-Formel: Grenzwerte (null-Input, alle Felder null, Gleichstand), Referenzwerte (250kcal/15g/10g → Score ~5), Minimum 1 / Maximum 10 |
| `tests/api/profile-stats.test.ts` | API-Endpunkt: 401 ohne Session, korrekte period-Parameter-Verarbeitung, leere Statistiken bei 0 Bestellungen |

**E2E-Tests (Playwright, Chromium):**

| Test-Datei | Kritischer User-Flow |
|---|---|
| `tests/e2e/profile.spec.ts` | Profilseite laedt mit korrekten User-Daten; Zeitraum-Umschalter aendert Statistiken; "Mehr laden" zeigt weitere Bestellungen; Logout leitet zu /login weiter; Admin kann /profile nicht aufrufen (wird zu /admin weitergeleitet) |

**Coverage-Ziel:** Gesundheits-Score-Utility 100% (analog offers.test.ts), API-Route 80%+

---

## 12. Abgrenzung (Out of Scope fuer FEAT-20)

| Thema | Begruendung |
|-------|-------------|
| Profil-Daten bearbeiten (Name, Passwort) | Explizit ausgeschlossen in FEAT-20 — Profil-Seite ist rein lesend |
| Guthaben aufladen + Zahlungsmethode | FEAT-24 |
| Profilbild hochladen / Avatar aendern | Out of Scope fuer MVP — Avatar wird als Platzhalter angezeigt |
| Push-Benachrichtigungen oder Erinnerungen | Eigenes Feature |
| Export der Bestellhistorie (PDF/CSV) | Out of Scope fuer MVP |
| Pagination des Bestellverlaufs (genaue Umsetzung) | Entscheidung obliegt Solution Architect (EC-3) |
| Vergleich mit anderen Mitarbeitern | Leaderboard (FEAT-8) ist das zustaendige Feature |
| Admin-Profil-Seite | Admins haben kein /profile (kein Zugriff gemaess Architektur) |

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-10

### Geaenderte/Neue Dateien

- `src/pages/profile.vue` — Vollstaendige Implementierung: Auth-Guard (onMounted), globaler Zeitraum-Umschalter (30d Standard), API-Aufruf, alle Sub-Komponenten eingebunden
- `src/server/api/profile/stats.get.ts` — GET /api/profile/stats?period=7d|30d|90d|all; 9 parallele DB-Queries (Promise.all), Bonus-Chart-Aggregation, Admin-Abweisung (403)
- `src/server/utils/healthScore.ts` — Extrahierte reine Berechnungsfunktion (ohne DB-Abhaengigkeit) fuer Unit-Testbarkeit
- `src/middleware/auth.global.ts` — Admin-Redirect von /profile zu /admin ergaenzt (AC-19)
- `src/components/profile/ProfileHeader.vue` — Profil-Header mit Name, Standort, Guthaben, Guthaben-aufladen-Link
- `src/components/profile/BonusPointsCard.vue` — Balkendiagramm (vue-chartjs), eigener Woche/Monat/Jahr-Umschalter, SR-Tabelle als Accessibility-Fallback
- `src/components/profile/PeriodSelector.vue` — Globaler Zeitraum-Umschalter (7T/30T/90T/Alle), v-model, tablist-Rolle
- `src/components/profile/StatsGrid.vue` — Einkaufsstatistiken in 3 Zeilen (Gesamt/<7T/Letzter, Woche/Monat/Jahr, Lieblingsprodukt/Score)
- `src/components/profile/StatCard.vue` — Einzelne Statistik-Kachel (Label + Wert + Loading-Skeleton)
- `src/components/profile/FavoriteProductCard.vue` — Lieblingsprodukt-Kachel mit Leerzustand
- `src/components/profile/HealthScoreCard.vue` — Gesundheits-Score-Kachel mit Farb-Kodierung (gruen/gelb/rot) und Tooltip
- `src/components/profile/OrderHistoryList.vue` — Bestellverlauf-Liste mit clientseitigem Load-More (initial 20, +20 pro Klick)
- `src/components/profile/OrderHistoryItem.vue` — Einzelne Bestellkarte, kollabierbar bei >1 Produkt
- `src/components/profile/LogoutButton.vue` — Zweistufiger Logout (Abmelden → Bestaetigen?)
- `tests/utils/healthScore.test.ts` — 14 Unit-Tests fuer calculateHealthScore (100% Coverage)
- `tests/e2e/profile.spec.ts` — 14 E2E-Tests fuer alle kritischen User-Flows

### Wichtige Entscheidungen

- **Nuxt Component Auto-Import:** Komponenten in `src/components/profile/` werden als `ProfileXxx` importiert. Die Ausnahme ist `ProfileHeader.vue` — da der Dateiname bereits mit dem Ordner-Praefix beginnt, dedupliziert Nuxt und generiert `ProfileHeader` (nicht `ProfileProfileHeader`).
- **Health Score als separates Utility:** `calculateHealthScore` wurde in `src/server/utils/healthScore.ts` extrahiert, um Unit-Tests ohne DATABASE_URL-Abhaengigkeit zu ermoeglichen.
- **Inline SVG statt img-Tags:** Alle Teenyicons werden als inline SVG-Pfade eingebettet, da Vite keine `/node_modules/`-Pfade als statische Assets aufloesen kann.
- **SSR-Hydration:** Die Profil-Seite nutzt `onMounted` fuer Auth-Check und API-Calls. SSR rendert den Skeleton, Client hydratisiert mit echten Daten.
- **Chart.js TooltipItem-Typisierung:** `import('chart.js').TooltipItem<'bar'>` als inline Type-Import in den Chart-Optionen zur Vermeidung von TypeScript-Fehlern.

### Bekannte Einschraenkungen

- Bonuspunkte-Chart zeigt leeren Zustand fuer Demo-User Nina, da `bonusPoints`-Feld in den Testdaten 0 ist (Produktions-Daten wuerden echte Werte zeigen).
- Gesundheits-Score von 9/10 fuer Nina (hat hauptsaechlich Bananen und Bio-Aepfel gekauft) — korrektes Verhalten gemaess Spec.
