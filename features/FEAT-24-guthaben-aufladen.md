# FEAT-24: Guthaben aufladen & Zahlungsmethode

## Status: Planned

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
