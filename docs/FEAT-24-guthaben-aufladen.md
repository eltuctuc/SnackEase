# Guthaben aufladen & Zahlungsmethode

**Feature-ID:** FEAT-24
**Status:** Implementiert (1 offener Bug: BUG-FEAT24-001)
**Getestet am:** 2026-03-13

---

## Zusammenfassung

Mitarbeiter können ihr Snack-Guthaben eigenständig über die Profil-Seite aufstocken. Sie wählen einen Betrag über ein numerisches Tastenfeld ein und können zwischen drei Zahlungsmethoden wählen, die dauerhaft gespeichert werden.

---

## Was wurde gemacht

### Hauptfunktionen

- **Guthaben aufladen (/profile/credit):** Cent-basierte Betragseingabe per Numpad, Aufladen per Knopfdruck
- **Zahlungsmethode wählen (/profile/payment):** Drei Optionen (VISA/Maestro, PayPal, Nettogehalt) als Radio-Buttons, gespeichert in localStorage
- **API:** `POST /api/profile/credit` — nimmt beliebigen Centbetrag entgegen, schreibt direkt in `user_credits.balance`
- **Kreditkarten-Icon im Profil-Header:** Direkter Einstieg von `/profile` in den Auflade-Flow

### Benutzer-Flow

1. Profil-Tab in der Tab-Bar antippen (`/profile`)
2. Kreditkarten-Icon neben dem Guthaben-Betrag antippen
3. `/profile/credit` öffnet sich — aktuelles Guthaben und gespeicherte Zahlungsmethode sind sofort sichtbar
4. Betrag per Numpad eingeben (Cent-basiert: 1-0-0-0 ergibt 10,00 €)
5. "GUTHABEN AUFLADEN" antippen — Betrag wird direkt dem Guthaben gutgeschrieben
6. Toast-Meldung "Guthaben erfolgreich aufgeladen" erscheint
7. Automatische Weiterleitung zurück zu `/profile` — neues Guthaben sofort sichtbar

**Zahlungsmethode ändern:**

1. Auf `/profile/credit` den Link "Falsche Zahlungsmethode? Ändern" antippen
2. Gewünschte Methode auf `/profile/payment` auswählen
3. "AUSWAHL SPEICHERN" antippen — Rückkehr zu `/profile/credit`

---

## Wie es funktioniert

### Für Benutzer

Die Seite `/profile/credit` zeigt das aktuelle Guthaben und eine nummerische Tastatur (ähnlich einer iOS-Systemtastatur). Ziffern werden von rechts angehängt und sofort als Euro-Betrag angezeigt. Mit der Rücktaste lässt sich die letzte Ziffer korrigieren. Der Aufladen-Button ist solange gesperrt, bis mindestens 0,01 € eingegeben wurde.

Die Zahlungsmethode ist rein kosmetisch — in der Demo-Version findet keine echte Zahlungsabwicklung statt. Das Guthaben wird direkt in der Datenbank erhöht.

### Technische Umsetzung

- **Composable `useCreditNumpad.ts`:** Kapselt die gesamte Betrag-Logik (Cent-Integer + Formatierung) und die localStorage-Persistenz der Zahlungsmethode. Vollständig mit 42 Unit-Tests abgedeckt.
- **API `POST /api/profile/credit`:** Authentifiziert den User via HttpOnly-Cookie, validiert den Centbetrag, schreibt `user_credits.balance` und legt einen `credit_transactions`-Eintrag an.
- **Routing:** Sub-Pages `profile/credit.vue` und `profile/payment.vue` unter Nuxt 3 Nested-Routing-Konvention (neben `profile/index.vue`).
- **Auth-Schutz:** Die Routen sind in `auth.global.ts` als Protected Paths eingetragen. Admins werden zu `/admin` weitergeleitet.

**Verwendete Technologien:**
- Vue 3 Composition API (`<script setup>`)
- Nuxt 3 Nested Routing
- Drizzle ORM (Neon PostgreSQL)
- Tailwind CSS
- localStorage (Zahlungsmethode)
- Teenyicons (SVG-Icons)

---

## Screenshots

Wireframes: `resources/high-fidelity/credit.png` und `resources/high-fidelity/payment.png`

---

## Abhängigkeiten

- FEAT-15 — App-Navigationstruktur (UserTabBar, Default-Layout)
- FEAT-20 — Profil-Seite (Einstiegspunkt über Kreditkarten-Icon im ProfileHeader)
- FEAT-2 — Demo User Authentication (Nutzer-Identifikation via Cookie)

---

## Getestet

- ✅ Acceptance Criteria: AC-1 bis AC-10 alle bestanden
- ✅ Edge Cases: EC-1 bis EC-4 alle bestanden
- ✅ Unit-Tests: 42/42 bestanden, 94% Coverage
- ✅ E2E-Tests: 16/16 bestanden (Chromium)
- ✅ Responsive: Mobile getestet (375px via Playwright)
- ✅ Accessibility: WCAG 2.1 AA weitgehend erfüllt
- ⚠️ 1 offener Bug: BUG-FEAT24-001 (doppeltes Nav-Landmark auf /profile/payment)
- ✅ Security: Auth-Guard, Admin-Schutz, Input-Validierung bestanden
- ✅ Regression: Alle bestehenden Features unberührt

---

## Offene Punkte

- **BUG-FEAT24-001:** `payment.vue` enthält einen manuellen `<UserTabBar />`-Aufruf, der zu einem doppelten Nav-Landmark im DOM führt. Muss vor Deployment behoben werden.

---

## Nächste Schritte

- Fix von BUG-FEAT24-001 (Zeile 116 aus payment.vue entfernen)
- FEAT-25 (nächstes geplantes Feature)

---

## Kontakt

Bei Fragen zu diesem Feature: Developer Agent / QA Engineer Agent
