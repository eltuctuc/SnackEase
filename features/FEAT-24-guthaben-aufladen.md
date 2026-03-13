# FEAT-24: Guthaben aufladen & Zahlungsmethode

## Status: Implemented

## Abhaengigkeiten
- Benoetigt: FEAT-15 (App-Navigationstruktur) - /profile-Route muss existieren
- Benoetigt: FEAT-20 (Profil-Seite) - Einstiegspunkt ueber Kreditkarten-Icon im Profil-Header
- Benoetigt: FEAT-2 (Demo User Authentication) - fuer Nutzer-Identifikation und Guthaben-Aktualisierung

---

## Wireframes

| Screen | Datei |
|--------|-------|
| Guthaben aufladen (/profile/credit) | `resources/high-fidelity/credit.png` |
| Zahlungsmethode waehlen (/profile/payment) | `resources/high-fidelity/payment.png` |

> Wireframes zeigen Struktur und Informationsarchitektur. Die visuelle Umsetzung richtet sich nach `resources/moodboard.png`, dem Tailwind-Theme und dem UX Expert Review.

---

## 1. Uebersicht

**Beschreibung:** Mitarbeiter koennen ihr Guthaben ueber die Profil-Seite aufstocken. Der Einstieg erfolgt ueber das Kreditkarten-Icon neben dem Guthaben-Betrag im Profil-Header (FEAT-20). Die Seite /profile/credit zeigt den aktuellen Betrag und ein numerisches Eingabefeld (Numpad) zur Eingabe des Auflade-Betrags. Die gewaehlte Zahlungsmethode wird angezeigt. Ueber /profile/payment kann der Nutzer zwischen drei Zahlungsmethoden waehlen: VISA/Maestro, PayPal, Nettogehalt (Abzug vom Gehalt).

**Ziel:** Mitarbeitern ermoeglichen, ihr Snack-Guthaben bequem und selbststaendig aufzustocken, ohne den Admin einschalten zu muessen.

**Hinweis MVP:** Die Zahlungsintegration (PayPal API, Kreditkarte) ist fuer die Demo-Version nicht real implementiert. Der Aufladevorgang simuliert eine erfolgreiche Zahlung und erhoehe das Guthaben direkt in der Datenbank. "Nettogehalt" ist ebenfalls simuliert.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich vom Profil aus mein Guthaben aufstocken koennen, damit ich weiter Snacks bestellen kann | Mitarbeiter | Must-Have |
| US-2 | Als Mitarbeiter moechte ich einen Betrag per Numpad eingeben und dann per Knopfdruck aufladen, damit der Vorgang schnell geht | Mitarbeiter | Must-Have |
| US-3 | Als Mitarbeiter moechte ich meine bevorzugte Zahlungsmethode (VISA/Maestro, PayPal oder Nettogehalt) auswaehlen und speichern koennen | Mitarbeiter | Must-Have |
| US-4 | Als Mitarbeiter moechte ich nach dem Aufladen sofort das neue Guthaben im Profil sehen | Mitarbeiter | Must-Have |
| US-5 | Als Mitarbeiter moechte ich bei falscher Zahlungsmethode schnell zur Auswahl-Seite navigieren koennen | Mitarbeiter | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Guthaben-Aufladen-Seite (/profile/credit)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Die Seite zeigt oben links einen Zurueck-Pfeil (← navigiert zurueck zu /profile) und den Titel "Guthaben aufladen" | Must-Have |
| REQ-2 | Das aktuelle Guthaben des Nutzers wird angezeigt (z.B. "Guthaben 6,00 €") | Must-Have |
| REQ-3 | Oben rechts wird die aktuell gewahlte Zahlungsmethode als Icon/Label angezeigt (z.B. PayPal-Logo + "Paypal") | Must-Have |
| REQ-4 | In der Mitte der Seite steht der einzugebende Betrag gross und zentriert (initial "0,00 €", grau wenn leer) | Must-Have |
| REQ-5 | Ein Button "GUTHABEN AUFLADEN" (primaere Aktion, grossflaechig) loest den Aufladevorgang aus | Must-Have |
| REQ-6 | Unterhalb des Buttons befindet sich ein Link "Falsche Zahlungsmethode? Aendern" — navigiert zu /profile/payment | Must-Have |
| REQ-7 | Ein numerisches Numpad (0-9 + Loeschen-Taste) ermoeglicht die Betragseingabe; die Eingabe erfolgt in Cent (z.B. 1 → 0,01; 100 → 1,00; 1000 → 10,00) | Must-Have |
| REQ-8 | Nach erfolgreichem Aufladen: Guthaben wird in der DB erhoehe (Demo: direkt ohne echte Zahlung), Toast "Guthaben erfolgreich aufgeladen" erscheint, Navigation zurueck zu /profile | Must-Have |
| REQ-9 | Bei Betrag = 0,00 € ist der "GUTHABEN AUFLADEN"-Button deaktiviert | Must-Have |

### 3.2 Zahlungsmethode-Seite (/profile/payment)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-10 | Die Seite zeigt oben links einen Zurueck-Pfeil (← navigiert zurueck zu /profile/credit) und den Titel "Zahlungsmethode" | Must-Have |
| REQ-11 | Es werden drei Zahlungsmethoden als Radio-Buttons angezeigt: "VISA / MAESTRO", "Paypal", "Nettogehalt" | Must-Have |
| REQ-12 | Jede Zahlungsmethode hat einen Label und einen kurzen Beschreibungstext | Must-Have |
| REQ-13 | Die aktuell gespeicherte Zahlungsmethode ist vorausgewaehlt | Must-Have |
| REQ-14 | Ein Button "AUSWAHL SPEICHERN" speichert die Auswahl und navigiert zurueck zu /profile/credit | Must-Have |
| REQ-15 | Die gewaelte Zahlungsmethode wird im Nutzer-Profil gespeichert (localStorage oder DB — Entscheidung Solution Architect) | Must-Have |

---

## 4. Routen

| Route | Beschreibung | Auth |
|-------|-------------|------|
| /profile/credit | Guthaben aufladen (Betrag + Aufladen) | Nur eingeloggte Mitarbeiter |
| /profile/payment | Zahlungsmethode waehlen | Nur eingeloggte Mitarbeiter |

---

## 5. Acceptance Criteria

- [ ] AC-1: /profile/credit ist erreichbar ueber das Kreditkarten-Icon im Profil-Header
- [ ] AC-2: Betragseingabe per Numpad funktioniert korrekt (Cent-basiert)
- [ ] AC-3: "GUTHABEN AUFLADEN" ist bei Betrag = 0 deaktiviert
- [ ] AC-4: Nach Aufladen ist das neue Guthaben im Profil sofort sichtbar (reaktiv)
- [ ] AC-5: "Falsche Zahlungsmethode? Aendern" navigiert zu /profile/payment
- [ ] AC-6: Alle drei Zahlungsmethoden sind auf /profile/payment wahlbar
- [ ] AC-7: "AUSWAHL SPEICHERN" speichert die Auswahl und kehrt zu /profile/credit zurueck
- [ ] AC-8: Die gespeicherte Zahlungsmethode wird beim naechsten Oeffnen von /profile/credit angezeigt
- [ ] AC-9: /profile/credit und /profile/payment sind durch Auth-Guard geschuetzt
- [ ] AC-10: Die Tab-Bar ist auf beiden Sub-Pages sichtbar (Tab "Profil" bleibt aktiv)

---

## 6. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Nutzer gibt einen sehr hohen Betrag ein (z.B. 9999,99 €) | Betrag wird akzeptiert (kein Limit in Demo-Version) |
| EC-2 | Nutzer tippt Loeschen-Taste bei leerem Betrag | Kein Fehler, Betrag bleibt "0,00 €" |
| EC-3 | Nutzer navigiert per URL direkt zu /profile/credit ohne eingeloggt zu sein | Weiterleitung zu /login |
| EC-4 | Nutzer ist Admin und navigiert zu /profile/credit | Weiterleitung (Admins haben kein /profile) |

---

## 7. Betroffene Dateien

### Neue Seiten
| Datei | Inhalt |
|-------|--------|
| src/pages/profile/credit.vue | Guthaben aufladen (Numpad + Aufladen-Button) |
| src/pages/profile/payment.vue | Zahlungsmethode waehlen (Radio + Speichern) |

### Neue/geaenderte Komponenten
| Datei | Beschreibung |
|-------|-------------|
| src/components/profile/CreditNumpad.vue | Numerisches Numpad fuer Betragseingabe |
| src/components/profile/PaymentMethodSelector.vue | Radio-Button-Liste fuer Zahlungsmethoden |

### API
| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| /api/profile/credit | POST | Guthaben aufstocken (Demo: direkt +X auf users.balance) |

### Auth-Middleware
- /profile/credit und /profile/payment als Protected Paths in auth.global.ts eintragen

---

## 8. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| NFR-1 | Numpad-Eingabe ist fluessig ohne Verzoeegerung |
| NFR-2 | Guthaben-Aktualisierung nach Aufladen < 500ms |
| NFR-3 | Keine echte Zahlungsintegration in Demo-Version — Simulation ausreichend |
| NFR-4 | Icons ausschliesslich Teenyicons 1.0 |

---

## 9. Abgrenzung (Out of Scope fuer FEAT-24)

| Thema | Begruendung |
|-------|-------------|
| Echte PayPal / Kreditkarten-Integration | Demo-Version; Simulation genuegt |
| Transaktionshistorie der Aufladungen | Out of Scope fuer MVP |
| Limit fuer maximales Guthaben | Nicht notwendig fuer Demo |
| Admin-seitiges Guthaben-Management | FEAT-4 / bestehende Admin-Funktion |

---

## Tech-Design (Solution Architect)

### Wichtige Vorab-Erkenntnis: Bestehende Infrastruktur

- `src/server/api/credits/recharge.post.ts` existiert bereits, akzeptiert aber nur 10/25/50 Euro (feste Betraege). Fuer freie Numpad-Eingabe nicht wiederverwendbar — neue Route wird benoetigt.
- `user_credits`-Tabelle und `credit_transactions`-Tabelle existieren bereits — keine neue DB-Tabelle noetig.
- `ProfileHeader.vue` hat den Link zu `/profile/credit` bereits vorbereitet (FEAT-24-Kommentar vorhanden).
- Die Auth-Middleware schuetzt `/profile` bereits — Sub-Pfade `/profile/credit` und `/profile/payment` muessen noch eingetragen werden.

### Component-Struktur

```
/profile/credit — Guthaben aufladen
├── Header-Zeile
│   ├── Zurueck-Pfeil (navigiert zu /profile)
│   └── Seitentitel "Guthaben aufladen"
├── Guthaben-Zeile
│   ├── Label + aktueller Betrag (aus Auth-Store)
│   └── Zahlungsmethoden-Badge (Icon + Label, oben rechts)
│       └── Klick navigiert zu /profile/payment
├── Betrag-Anzeige (gross, zentriert)
│   └── Grau solange = 0,00 €, schwarz sobald > 0
├── "GUTHABEN AUFLADEN"-Button
│   └── Deaktiviert wenn Betrag = 0,00 €
├── "Falsche Zahlungsmethode? Aendern"-Link
│   └── Navigiert zu /profile/payment
└── CreditNumpad (neue Komponente)
    ├── Ziffern-Tasten 1–9
    ├── "0"-Taste Mitte unten
    └── Loeschen-Taste rechts unten (entfernt letzte Ziffer)

/profile/payment — Zahlungsmethode waehlen
├── Header-Zeile
│   ├── Zurueck-Pfeil (navigiert zurueck zu /profile/credit)
│   └── Seitentitel "Zahlungsmethode"
├── PaymentMethodSelector (neue Komponente)
│   ├── Option: VISA / MAESTRO (Radio + Beschreibungstext)
│   ├── Option: Paypal (Radio + Beschreibungstext)
│   └── Option: Nettogehalt (Radio + Beschreibungstext)
│       Vorausgewaehlt: zuletzt gespeicherte Methode
└── "AUSWAHL SPEICHERN"-Button
    └── Speichert Auswahl + navigiert zurueck zu /profile/credit
```

`UserTabBar.vue` bleibt auf beiden Sub-Pages sichtbar, "Profil"-Tab aktiv.

### Daten-Model

Keine neue DB-Tabelle noetig. Das Guthaben liegt bereits in `user_credits.balance`.

| Information | Wo gespeichert | Schreib-Zeitpunkt |
|-------------|---------------|-------------------|
| Aufgeladener Betrag | DB: `user_credits.balance` | Klick auf "GUTHABEN AUFLADEN" |
| Auflade-Protokoll | DB: `credit_transactions` | Klick auf "GUTHABEN AUFLADEN" |
| Bevorzugte Zahlungsmethode | Browser localStorage | Klick auf "AUSWAHL SPEICHERN" |

### Tech-Entscheidungen

**Warum localStorage fuer die Zahlungsmethode (REQ-15)?**
Geraete-Einstellung ohne sicherheitskritische Bedeutung. Da ohnehin keine echte Zahlung stattfindet, entstehen keine Nachteile. Das Projekt nutzt localStorage bereits fuer den Warenkorb (`snackease_cart_[userId]`). Key-Schema: `snackease_payment_method_[userId]`. Kein DB-Migration, kein neuer API-Endpunkt fuer Zahlungsmethode noetig.

**Warum neue API statt bestehender `credits/recharge.post.ts`?**
Bestehende Route akzeptiert nur feste Betraege (10, 25, 50 Euro). Das Wireframe zeigt Cent-basierte Eingabe. Neue Route `POST /api/profile/credit` akzeptiert beliebigen Centbetrag (integer).

**Warum kein eigener Pinia-Store?**
Der einzugebende Betrag lebt nur auf `/profile/credit`. Der Auth-Store liefert das aktuelle Guthaben bereits reaktiv — nach Aufladen via `authStore.fetchUser()` auffrischen genuegt fuer AC-4.

**Warum Sub-Pages statt Modals?**
Das Wireframe zeigt vollstaendige Seiten mit eigenem Header. Sub-Pages in Nuxt 3 unterstuetzen den Browser-Zurueck-Button korrekt.

### Dependencies

Keine neuen Packages erforderlich. Alle Bausteine vorhanden: Nuxt 3, Drizzle ORM, Tailwind CSS, Teenyicons.

### Betroffene Dateien

| Datei | Aktion |
|-------|--------|
| `src/pages/profile/credit.vue` | Neu erstellen |
| `src/pages/profile/payment.vue` | Neu erstellen |
| `src/components/profile/CreditNumpad.vue` | Neu erstellen |
| `src/components/profile/PaymentMethodSelector.vue` | Neu erstellen |
| `src/server/api/profile/credit.post.ts` | Neu erstellen |
| `src/middleware/auth.global.ts` | `/profile/credit` + `/profile/payment` als Protected Paths + Admin-Redirect ergaenzen |

Unveraendert: `schema.ts`, `recharge.post.ts`, `ProfileHeader.vue` (Link bereits vorbereitet).

### Test-Anforderungen

**Unit-Tests (Vitest) — Pfad: `tests/composables/useCreditNumpad.test.ts`**
- Cent-zu-Euro-Formatierung (0 → "0,00 €", 1 → "0,01 €", 1050 → "10,50 €")
- Loeschen-Logik: letzte Ziffer entfernen, bei leerem State bleibt "0,00 €"
- Button-Status: deaktiviert wenn 0, aktiv wenn > 0
- localStorage: Zahlungsmethode schreiben + lesen (Key-Schema korrekt)
- Ziel-Coverage: 80%+

**E2E-Tests (Playwright) — Pfad: `tests/e2e/feat24-guthaben-aufladen.spec.ts`**
- Navigation von /profile via Kreditkarten-Icon zu /profile/credit
- Betrag-Eingabe per Numpad (mehrere Ziffern + Loeschen)
- Button bei 0,00 € deaktiviert, aktiviert nach Eingabe
- Aufladen erhoeht Guthaben; Toast erscheint; Weiterleitung zu /profile
- Zahlungsmethode wechseln; nach Speichern beim naechsten Oeffnen vorausgewaehlt
- Nicht eingeloggt: /profile/credit → /login
- Admin: /profile/credit → /admin
- Browser: Chromium

---

## UX Design

### Wireframe-Abgleich

Beide Wireframes (`credit.png`, `payment.png`) sind vorhanden und wurden analysiert. Die Feature-Spec stimmt inhaltlich mit den Wireframes ueberein. Folgende Details wurden aus den Wireframes direkt uebernommen:

- **credit.png:** Betragsbereich gross und zentriert zwischen Header-Info-Bereich und CTA-Button. Numpad belegt die untere Haelfte des Screens in iOS-System-Numpad-Optik ("+*#" links unten und Backspace-Symbol rechts unten als dekorative Randzellen, nicht interaktiv). Tab-Bar sichtbar, "Profile"-Tab aktiv.
- **payment.png:** Drei Radio-Optionen vertikal gestapelt mit je eigenem Beschreibungstext. PayPal ist vorausgewaehlt (blauer Radiobutton). "AUSWAHL SPEICHERN"-Button direkt unterhalb der Optionen. Grosse Weissflaeche darunter intentional. Tab-Bar sichtbar, "Profile" aktiv.

### Personas-Abdeckung

| Persona | Relevanz | Einschaetzung | Begruendung |
|---------|----------|---------------|-------------|
| Nina (Neuanfang, 24) | Hoch | Gut abgedeckt | Klare Zurueck-Navigation und einfache Schritt-fuer-Schritt-Interaktion ohne Onboarding-Overhead. Der Hinweis "Falsche Zahlungsmethode? Aendern" hilft beim Erstaufruf, wenn die falsche Methode vorausgewaehlt war. Aktuelles Guthaben direkt sichtbar (REQ-2) beantwortet ihre haeufige Frage nach dem Kontostand. |
| Maxine (Stammkundin, 32) | Hoch | Sehr gut abgedeckt | Gespeicherte Zahlungsmethode erscheint beim Oeffnen sofort — kein erneutes Auswaehlen. Schneller Aufladefluss ohne Umwege. Guthaben-Anzeige unterstuetzt ihre Strategie, das monatliche Budget optimal zu nutzen. |
| Lucas (Gesundheitsfan, 28) | Mittel | Ausreichend | Guthaben-Aufladen ist fuer Lucas nicht primaer, aber relevant wenn das Guthaben fuer gesunde Snacks zur Neige geht. Der Fluss ist schnell genug, um nicht vom Kernziel abzulenken. |
| Alex (Gelegenheitskaeufer, 40) | Hoch | Gut abgedeckt | Unkomplizierter Fluss mit minimalen Entscheidungen. Numpad-Eingabe ist universell verstaendlich ohne Lernaufwand. |
| Tom (Schnellkaeufer, 35) | Hoch | Sehr gut abgedeckt | Wenige Taps bis zum Ziel: Profil, Kreditkarten-Icon, Betrag, Aufladen. Gespeicherte Zahlungsmethode spart pro Nutzung Zeit. |
| Sarah (Teamkapitaenin, 45) | Niedrig | Nicht relevant | FEAT-24 deckt Einzel-Guthaben ab; Teambudget-Verwaltung ist Out of Scope. |

**Pain Points, die FEAT-24 loest:**
- Nina weiss beim ersten Aufladen nicht, wie viel Guthaben sie hat — der aktuelle Betrag ist auf /profile/credit sofort sichtbar (REQ-2)
- Maxine muss die Zahlungsmethode nicht bei jedem Aufladevorgang neu auswaehlen — persistente Speicherung (REQ-15) nimmt ihr diese Friktion
- Tom verliert keine Zeit — ein Screen, ein Numpad, ein Button

### User Flow

#### Flow 1: Guthaben aufladen (Happy Path)

**Akteur:** Maxine (Stammkundin), Tom (Schnellkaeufer)
**Ziel:** Guthaben schnell um einen gewuenschten Betrag erhoehen

```
1. Profil-Tab in der Tab-Bar antippen (/profile)
2. Kreditkarten-Icon neben dem Guthaben-Betrag im Profil-Header antippen
3. /profile/credit oeffnet sich
   — aktuelles Guthaben links oben sichtbar (REQ-2)
   — gespeicherte Zahlungsmethode rechts oben sichtbar (REQ-3)
4. Betrag per Numpad eingeben (Cent-basiert: 1-0-0-0 ergibt 10,00 EUR)
5. Betragsanzeige aktualisiert sich in Echtzeit ("10,00 EUR")
6. "GUTHABEN AUFLADEN"-Button wird aktiv (Betrag > 0,00 EUR)
7. Button antippen → Ladeindikator erscheint, Button deaktiviert (kein Doppel-Submit)
8. POST /api/profile/credit — Guthaben in DB erhoehen
9. Toast "Guthaben erfolgreich aufgeladen" erscheint (auto-dismiss nach 3-5s)
10. Navigation zurueck zu /profile — neues Guthaben sofort reaktiv sichtbar
```

**Alternative Flows:**

- **Falsche Zahlungsmethode erkannt:** Nach Schritt 3 den Link "Falsche Zahlungsmethode? Aendern" antippen, /profile/payment oeffnet sich, Methode waehlen, "AUSWAHL SPEICHERN" antippen, zurueck zu /profile/credit mit aktualisiertem Methodenicon
- **Betrag korrigieren:** Backspace-Taste (rechts unten im Numpad) einmal oder mehrfach antippen, Betrag wird Ziffer fuer Ziffer geloescht, bei leerem Betrag bleibt Anzeige "0,00 EUR" ohne Fehler (EC-2)
- **Abbrechen:** Zurueck-Pfeil oben links antippen, zurueck zu /profile ohne Aenderung
- **API-Fehler:** POST schlaegt fehl, Fehler-Toast erscheint ("Aufladen fehlgeschlagen. Bitte versuche es erneut."), Button wird wieder aktiv (Retry moeglich)

#### Flow 2: Zahlungsmethode aendern

**Akteur:** Nina (Neuanfang) beim Erstaufruf; alle Personas bei Methodenwechsel
**Ziel:** Bevorzugte Zahlungsmethode auswaehlen und dauerhaft speichern

```
1. Von /profile/credit den Link "Falsche Zahlungsmethode? Aendern" antippen
   ODER direkt via URL /profile/payment aufrufen
2. /profile/payment oeffnet sich — aktuell gespeicherte Methode ist vorausgewaehlt (REQ-13)
3. Gewuenschte Methode antippen (VISA/MAESTRO, PayPal oder Nettogehalt)
4. Radio-Button der neuen Methode wird aktiv (blau), andere werden inaktiv
5. "AUSWAHL SPEICHERN" antippen
6. Auswahl wird in localStorage gespeichert
7. Navigation zurueck zu /profile/credit — neues Methodenicon oben rechts aktualisiert
```

**Alternative Flows:**

- **Keine Aenderung gewuenscht:** Methode unveraendert lassen, "AUSWAHL SPEICHERN" antippen, Ruecknavigation ohne unnoetige Aenderung
- **Abbrechen:** Zurueck-Pfeil oben links antippen, zurueck zu /profile/credit ohne Speichern

### Accessibility

Pruefung gegen WCAG 2.1 AA, ISO 9241 und EAA:

| Kriterium | Status | Detail |
|-----------|--------|--------|
| Farbkontrast CTA-Button | Zu verifizieren | Blauer Button-Hintergrund (~#2563EB) auf weissem Grund: ca. 5.9:1, besteht WCAG AA. Weisser Buttontext auf Blau: ca. 5.9:1, besteht. Graue Betragsanzeige "0,00 EUR" im Leer-Zustand muss >= 4.5:1 zum weissen Hintergrund erreichen — konkreten Grauton beim Implementieren pruefen. |
| Farbkontrast Radio-Buttons | Zu verifizieren | Inaktiver Radiobutton-Ring muss >= 3:1 zum Hintergrund haben (UI-Komponente). Aktiver blauer Punkt: OK. |
| Touch-Targets Numpad | Anforderung | Jede Numpad-Taste muss mindestens 44x44pt sein. Das Wireframe zeigt grossflaechige Tasten — diese Groesse in der Implementierung beibehalten, nicht verkleinern. |
| Touch-Targets Zahlungsmethoden | Anforderung | Jede Radio-Option auf /profile/payment muss als Ganzes antippbar sein (Label + Beschreibungstext + Radio-Kreis als einheitliche Touch-Flaeche, mindestens 44pt Hoehe). |
| Tastatur-Navigation | Anforderung | Tab-Reihenfolge auf /profile/credit: Zurueck-Pfeil, Zahlungsmethode-Icon/-Link, Betrag (readonly fokussierbar fuer Screen Reader), Numpad-Tasten 1-9, dekorative "+*#"-Zelle (aria-hidden), 0, Backspace, Aufladen-Button, Aendern-Link. Numpad-Tasten per Enter/Space ausloesbar. |
| Screen Reader Betragsanzeige | Anforderung | Betragsanzeige als `aria-live="polite"` Region implementieren, damit nach jeder Numpad-Eingabe der neue Betrag vorgelesen wird. Ohne dieses Attribut ist der Screen fuer blinde Nutzer nicht nutzbar. |
| Screen Reader Fehlermeldungen | Anforderung | Fehler-Toasts und Erfolgs-Toasts muessen per `aria-live="assertive"` oder `role="alert"` angekuendigt werden, nicht nur visuell sichtbar sein. |
| Deaktivierter Button | Anforderung | `disabled`-HTML-Attribut und `aria-disabled="true"` setzen (nicht nur CSS pointer-events:none). Opacity auf ca. 0.4 reduzieren (Material Design Standard). |
| Radio-Button Labels | Anforderung | Jedes `<input type="radio">` mit `<label for="...">` oder `aria-labelledby` verknuepfen. Beschreibungstext per `aria-describedby` referenzieren, damit Screen-Reader-Nutzer Methode und Erlaeuterung zusammen hoeren. |
| Dekorative Numpad-Zelle | Anforderung | Die "+*#"-Zelle links unten im Numpad (iOS-Numpad-Stil, nicht interaktiv) muss `aria-hidden="true"` erhalten und keinen Event-Handler haben. |
| Viewport-Skalierung | Anforderung | `user-scalable=no` darf nicht gesetzt sein. Dynamic Type und Android Text Size duerfen das Numpad-Layout nicht brechen — flexible Zellgroessen verwenden. |
| Reduced Motion | Anforderung | Toast-Einblendanimation muss `prefers-reduced-motion` respektieren (Fade oder kein Uebergang statt Slide-Animation). |
| Keine Zeitlimits | Bestanden | Kein Timeout im Aufladefluss. Demo-Simulation ist sofortig. WCAG 2.2.1 gilt als erfuellt. |

**WCAG 2.1 AA Gesamtbewertung:** Mit den genannten Implementierungsanforderungen vollstaendig erreichbar. Kein strukturelles Accessibility-Hemmnis in Spec oder Wireframe identifiziert.

### Empfehlungen

#### P1 — Muss umgesetzt werden (direkte UX- oder Accessibility-Auswirkung)

1. **Numpad-Tastengrösse sicherstellen**
   Jede Numpad-Taste muss mindestens 44x44pt gross sein. Das Wireframe zeigt grossflaechige Tasten — diese Proportion muss in `CreditNumpad.vue` erhalten bleiben. Besonders relevant fuer Tom (Schnellkaeufer) und Alex (Gelegenheitskaeufer), die unter Zeitdruck tippen.

2. **Betragsanzeige als aria-live Region**
   `aria-live="polite"` auf dem Betrag-Container setzen, damit Screen-Reader-Nutzer bei jeder Eingabe den aktuellen Zwischenbetrag hoeren. Ohne dieses Attribut ist der Screen fuer blinde Nutzer nicht zuverlaessig nutzbar.

3. **Disabled-State des Aufladen-Buttons semantisch korrekt**
   `disabled`-Attribut und `aria-disabled="true"` gemeinsam setzen. Opacity auf ca. 0.4 reduzieren (Material Design Standard). Optionaler Helper-Text "Bitte Betrag eingeben" unterhalb des Buttons wuerde Nina (Neuanfang) beim Erstaufruf zusaetzlich orientieren.

4. **Fehler-Toast bei API-Fehler implementieren**
   Die Spec beschreibt in REQ-8 nur den Erfolgsfall. Ein expliziter Fehlerzustand fehlt. Fehlertext: "Aufladen fehlgeschlagen. Bitte versuche es erneut." Der Button muss nach dem Fehler wieder aktiviert werden. Ohne diesen Zustand bleibt der Nutzer bei einem Netzwerkproblem ohne Feedback haengen.

5. **Ladeindikator und Doppel-Submit-Schutz**
   Waehrend des API-Calls den Button deaktivieren und einen Spinner anzeigen. Gemaess NFR-2 ist die Zeitspanne zwar kurz (< 500ms), aber ein doppeltes Antippen ohne Schutz wuerde das Guthaben zweifach erhoehen.

6. **Betrag nach erfolgreichem Aufladen zuruecksetzen**
   Nach Ruecknavigation zu /profile und erneutem Aufrufen von /profile/credit muss der Betrag auf "0,00 EUR" zurueckgesetzt sein. Ein persistierter "letzter Betrag" koennte zu versehentlichem Doppelaufladen fuehren, besonders fuer Tom der schnell tippt.

#### P2 — Sollte umgesetzt werden (Qualitaet und visuelle Konsistenz)

7. **Beschreibungstexte fuer Zahlungsmethoden ausformulieren**
   Das Wireframe zeigt "Lorem ipsum" als Platzhalter. Vor der Implementierung muessen reale Texte definiert werden. Vorschlaege:
   - VISA / MAESTRO: "Kartenzahlung ueber deine Kredit- oder Debitkarte"
   - PayPal: "Zahlung ueber dein PayPal-Konto"
   - Nettogehalt: "Betrag wird von deinem naechsten Netto-Gehalt abgezogen"

8. **Zahlungsmethoden-Icons konsistent gestalten**
   Das Wireframe zeigt das offizielle PayPal-Logo auf /profile/credit. Fuer VISA/MAESTRO und Nettogehalt fehlen entsprechende visuelle Darstellungen. Da Teenyicons kein PayPal-Icon enthaelt (NFR-4), muessen fuer alle drei Methoden konsistente Darstellungen gewaehlt werden — z.B. farbige Label-Karten oder einfache Text-Badges, die zur Moodboard-Palette (Weiss, Teal, Dunkelgruen) passen.

9. **Radio-Option als vollstaendige Touch-Flaeche**
   Auf /profile/payment muss die gesamte Zeile (Label, Beschreibungstext und Radio-Kreis) als eine zusammenhaengende Touch-Flaeche wirken. Nur auf den Radio-Kreis selbst antippen zu muessen wuerde die Trefferflaeche stark verkleinern und Fehltipps verursachen.

#### P3 — Hinweise fuer Solution Architect (bereits in Tech-Design beruecksichtigen)

10. **Back-Navigation und OS-Geste muessen uebereinstimmen**
    REQ-10 gibt an, dass der Zurueck-Pfeil auf /profile/payment zu /profile/credit navigiert. Die iOS-Swipe-from-left-Geste und Android-Predictive-Back muessen dasselbe Ziel haben — `router.push` statt `router.replace` beim Navigieren von /profile/credit nach /profile/payment verwenden, damit der Back-Stack korrekt aufgebaut wird.

11. **Zahlungsmethode DB-seitig persistieren (Alternativvorschlag zu localStorage)**
    Das Tech-Design entschied sich fuer localStorage (`snackease_payment_method_[userId]`). Falls geraeteuebergreifende Konsistenz gewuenscht wird (relevant fuer Maxine), koennte ein Feld `users.preferredPaymentMethod` in der DB erwaogen werden. Fuer die Demo-Version ist localStorage ausreichend.

### Wireframe vs. Feature-Spec Diskrepanzen

Keine funktionalen Diskrepanzen gefunden. Folgende redaktionelle Punkte wurden identifiziert:

| Punkt | In Wireframe | In Feature-Spec | Handling |
|-------|--------------|-----------------|----------|
| Numpad "+*#"-Zelle | Wird angezeigt (iOS-Numpad-Optik, nicht interaktiv) | Nicht erwaehnt (REQ-7 nennt nur "0-9 + Loeschen") | Zelle als nicht-interaktiv implementieren: kein Event-Handler, `aria-hidden="true"` |
| Tab-Bar dritter Eintrag | Zeigt "Kaufen" | App-Konvention: "Vorbestellung" (FEAT-16) | Nur Label-Unterschied, kein Handlungsbedarf |
| Beschreibungstexte Zahlungsmethoden | "Lorem ipsum dolor sit amet" | Keine konkreten Texte definiert | Vor Implementierung ausformulieren, siehe Empfehlung Nr. 7 |

---

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-13

### Geaenderte/Neue Dateien
- `src/composables/useCreditNumpad.ts` — Neues Composable: Cent-basierte Betragseingabe, Zahlungsmethode via localStorage
- `src/components/profile/CreditNumpad.vue` — Numpad-Komponente (4x3, iOS-Stil, Teenyicons-Backspace)
- `src/components/profile/PaymentMethodSelector.vue` — Radio-Selektor fuer drei Zahlungsmethoden
- `src/pages/profile/index.vue` — Moved von `src/pages/profile.vue` (Nuxt 3 Nested Routing)
- `src/pages/profile/credit.vue` — Neue Seite: Betrag eingeben + Aufladen
- `src/pages/profile/payment.vue` — Neue Seite: Zahlungsmethode waehlen
- `src/server/api/profile/credit.post.ts` — POST /api/profile/credit: Guthaben aufladen (beliebiger Centbetrag)
- `src/middleware/auth.global.ts` — `/profile/credit` + `/profile/payment` als Protected Paths ergaenzt
- `tests/composables/useCreditNumpad.test.ts` — 42 Unit-Tests (100% passing)
- `tests/e2e/feat24-guthaben-aufladen.spec.ts` — 16 E2E-Tests (100% passing)

### Wichtige Entscheidungen
- `profile.vue` → `profile/index.vue` verschoben: Nuxt 3 behandelt eine `.vue`-Datei neben einem gleichnamigen Verzeichnis als Parent-Layout und erwartet `<NuxtPage />`. Durch `profile/index.vue` ist `/profile` weiterhin eigenstaendige Seite.
- `<ProfileCreditNumpad>` statt `<CreditNumpad>`: Nuxt 3 Auto-Import-Konvention praefixt Component-Namen mit dem Ordnernamen (`components/profile/` → `Profile`-Praefix).
- Explizites `import { ref, computed } from 'vue'` im Composable: Vitest (happy-dom) importiert keine Nuxt-Auto-Imports; ohne expliziten Import wuerden `ref` und `computed` als `undefined` erscheinen.
- Neue `POST /api/profile/credit`-Route statt bestehender `recharge.post.ts`: Letztere akzeptiert nur Festbetraege (10/25/50 EUR); das Wireframe erfordert freie Cent-Eingabe.
- Layout-Hoehe via `style="height: calc(100vh - 56px - 80px)"`: `default.vue` stellt bereits `pt-14` (UserHeader 56px) und `pb-20` (UserTabBar 80px) bereit; die Seite berechnet den verbleibenden Raum explizit, damit das Numpad den Footer genau ausfuellt.
- Playwright-Strict-Mode-Fixes in E2E-Tests: `getByRole('link', { name: 'Profil' })` auf `nav.getByRole(...)` eingegrenzt; `/Aendern/i`-Regex auf `{ name: 'Aendern', exact: true }` geaendert; `getByText('PayPal')` auf `{ exact: true }.first()` eingegrenzt.

### Bekannte Einschraenkungen
- Zahlungsmethode ist rein kosmetisch (localStorage), keine echte Zahlungsabwicklung.
- Bei `/api/profile/credit` findet kein Guthaben-Limit-Check statt (Demo-Umgebung).
