# Bestellabholung am Automaten

**Feature-ID:** FEAT-11
**Status:** Implementiert (mit offenen Bugs)
**Getestet am:** 2026-03-07

---

## Zusammenfassung

Mitarbeiter koennen nach einem One-Touch-Kauf ihre Bestellung am physischen Snack-Automaten abholen — simuliert ueber NFC-Klick oder 4-stellige PIN-Eingabe. Das Feature ist eine realistische Demo-Simulation ohne echten Hardware-Anschluss.

---

## Was wurde gemacht

### Hauptfunktionen

- **Bestellstatus-Tracking:** Jede Bestellung hat einen Status (`pending_pickup`, `picked_up`, `cancelled`) und eine 2-Stunden-Abholfrist
- **NFC-Abholung:** Ein Klick auf "Mit NFC abholen" startet eine 2-Sekunden-Animation und markiert die Bestellung als abgeholt
- **PIN-Abholung:** Alternativ kann der Nutzer seine 4-stellige PIN (auf der Bestellkarte sichtbar) in einem Modal eingeben
- **Countdown-Timer:** Zeigt die verbleibende Abholzeit in Echtzeit (z.B. "1h 45min"), mit Farbwechsel bei unter 30 Minuten (orange) und unter 10 Minuten (rot)
- **Automatische Stornierung:** Ein Hintergrundprozess prueft jede Minute abgelaufene Bestellungen und erstattet das Guthaben automatisch zurueck
- **Bestelluebersicht:** Die neue Seite `/orders` zeigt alle Bestellungen mit Filter nach Status

### Benutzer-Flow

1. Nutzer kauft ein Produkt per One-Touch-Kauf
2. Bestaetigungsmodal erscheint: zeigt PIN, Standort, Countdown und Abholbuttons
3. Nutzer navigiert zu `/orders` (oder bleibt im Modal) und waehlt Abholmethode
4. **NFC:** Klick auf "Mit NFC abholen" — 2-Sekunden-Animation — Status wechselt auf "Abgeholt"
5. **PIN:** Klick auf "PIN eingeben" — Modal oeffnet sich — korrekte PIN eingeben — Status wechselt auf "Abgeholt"
6. Falls nicht abgeholt in 2 Stunden: Automatische Stornierung, Guthaben zurueck auf das Konto

---

## Wie es funktioniert

### Fuer Benutzer

Nach dem Kauf eines Produkts sieht der Nutzer sofort eine Bestaetigungs-Karte mit:
- Seinem bestellten Produkt und dem Preis
- Dem Standort des Automaten (z.B. "Nurnberg, Buro 1. OG")
- Einem Countdown-Timer (maximal 2 Stunden)
- Seiner persoenlichen 4-stelligen Abhol-PIN
- Zwei Buttons: "Mit NFC abholen" (primae) und "PIN eingeben" (sekundaer)

Auf der Seite "Meine Bestellungen" kann der Nutzer alle seine Bestellungen nach Status filtern:
- **Bereit zur Abholung:** gelbes Badge, Countdown sichtbar, Abholbuttons aktiv
- **Abgeholt:** gruenes Badge, Abholzeitpunkt angezeigt
- **Storniert:** rotes Badge, Info zur Guthaben-Rueckerstattung

### Technische Umsetzung

**Backend:**
- `GET /api/orders` — Liefert alle Bestellungen des eingeloggten Nutzers (Join mit Produkttabelle)
- `POST /api/orders/:id/pickup` — Verarbeitet Abholung per NFC oder PIN; mit Row-Level Lock (SELECT FOR UPDATE) gegen Race Conditions mit dem Cron-Job
- `src/server/plugins/cronJobs.ts` — Nitro-Plugin das jede Minute abgelaufene Bestellungen storniert und Guthaben zurueckerstattet; ebenfalls mit Row-Level Locks

**Frontend:**
- `useCountdown` Composable — Reaktiver Countdown mit Urgency-Level (normal/warning/danger), aktualisiert sich jede Sekunde, Cleanup bei Component-Unmount
- `OrderCard.vue` — Bestellkarte mit Status-Badge, Countdown (Urgency-Farben), PIN-Anzeige, NFC/PIN-Buttons
- `PinInputModal.vue` — 4-stellige PIN-Eingabe mit Auto-Advance zwischen Feldern, Backspace-Navigation, Paste-Support, Fehlermeldung mit Versuchszaehler (max. 3), ESC-Taste
- `NfcPickupAnimation.vue` — Fullscreen-Overlay mit CSS-Ladebalken und prefers-reduced-motion-Unterstuetzung

**Verwendete Technologien:**
- Nuxt 3 / Vue 3 Composition API
- Drizzle ORM (PostgreSQL Transaktionen mit Row-Level Locking)
- Nitro Server Plugin (Cron-Job ohne externen Service)
- VueUse (onUnmounted Cleanup)

---

## Screenshots

Kein Browser-Testing moeglich. Visuelles Design entspricht dem UX-Mockup aus der Feature-Spec (Abschnitt 6).

---

## Abhaengigkeiten

- FEAT-2 (Demo User Authentication) — User-Identifikation fuer Bestellzuordnung
- FEAT-7 (One-Touch-Kauf) — Kaufprozess erstellt Bestellungen mit Status pending_pickup
- FEAT-12 (Bestandsverwaltung) — Bestandspruefung beim Kauf

---

## Getestet

- Acceptance Criteria: Alle 8 bestanden
- Edge Cases: Alle 5 bestanden
- Unit-Tests: 19/19 useCountdown-Tests bestanden (177 Gesamt, alle passed)
- Cross-Browser: Code-Review (kein Browser-Testing moeglich)
- Responsive: Implementierung mobil-first (max-w-2xl, p-4)
- Accessibility: WCAG 2.1 weitgehend konform (1 Medium-Risiko: Touch-Targets ~40px statt 44px)
- Security: 2 High-Bugs gefunden (fehlender Route-Guard, fehlendes Rate Limiting)
- Regression: Keine bestehenden Features beeintraechtigt

---

## Offene Bugs (Stand 2026-03-07)

| Bug-ID | Severity | Beschreibung |
|--------|----------|-------------|
| BUG-FEAT11-001 | High | /orders fehlt in globalem Auth-Middleware |
| BUG-FEAT11-003 | High | Kein serverseitiges Rate Limiting fuer PIN-Versuche |
| BUG-FEAT11-002 | Medium | Backend akzeptiert nicht-numerische PINs |
| BUG-FEAT11-004 | Low | NfcPickupAnimation: setTimeout ohne Cleanup |
| BUG-FEAT11-005 | Low | PinInputModal: direkter DOM-Zugriff statt VueUse |

---

## Nächste Schritte

- FEAT-13: Low-Stock-Benachrichtigungen (haengt von FEAT-12 Bestandsverwaltung ab)
- Echte NFC-Integration (wenn Hardware vorhanden)
- Push-Benachrichtigungen bei Stornierung (REQ-9, Should-Have, noch nicht implementiert)

---

## Kontakt

Bei Fragen zu diesem Feature: Development Team SnackEase
