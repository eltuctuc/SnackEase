# Admin Einstellungsseite

**Feature-ID:** FEAT-21
**Status:** Abgeschlossen (mit offenem Medium-Bug BUG-FEAT21-001)
**Getestet am:** 2026-03-09

---

## Zusammenfassung

Die Admin-Einstellungsseite unter `/admin/settings` buendelt alle administrativen Verwaltungsaktionen an einem zentralen Ort: Abmelden, System-Reset und Guthaben-Reset. Die Seite ersetzt den bisherigen Platzhalter aus FEAT-15 und entlastet gleichzeitig das Admin-Dashboard (zuvor waren die Reset-Funktionen dort untergebracht).

---

## Was wurde gemacht

### Hauptfunktionen

- **Logout:** Admin kann sich ueber die Einstellungsseite abmelden — Weiterleitung zu `/login`
- **System-Reset:** Loescht alle Bestellungen und Transaktionen, setzt Guthaben und Bestand zurueck — erfordert Bestaetigunings-Eingabe "RESET"
- **Guthaben-Reset:** Setzt nur die Guthaben aller Nutzer auf 25 EUR zurueck, ohne Bestellhistorie zu beruehren
- **Platzhalter-Bereich:** Abschnitt "Weitere Einstellungen" fuer kuenftige Erweiterungen
- **Migration:** Reset-Funktionen vollstaendig aus `admin/index.vue` entfernt

### Benutzer-Flow: System-Reset

1. Admin navigiert zu "Einstellungen" ueber den Footer
2. Admin klickt auf "System-Reset durchfuehren" (roter Button)
3. Bestaetigungs-Dialog oeffnet sich mit Erklaerung, was zurueckgesetzt wird
4. Admin tippt "RESET" in das Eingabefeld — erst dann wird der Bestaetigen-Button aktiv
5. Admin bestaetigt — API-Call laeuft, Button zeigt Loading-State
6. Erfolgs-Banner erscheint auf der Seite, Dialog schliesst sich automatisch

### Benutzer-Flow: Guthaben-Reset

1. Admin klickt auf "Guthaben-Reset durchfuehren" (gelber Button)
2. Dialog oeffnet sich mit Erklaerung (kein Pflicht-Text zum Eintippen)
3. Admin klickt "Reset durchfuehren"
4. Erfolgs-Banner erscheint auf der Seite

### Benutzer-Flow: Logout

1. Admin klickt "Abmelden" im Abschnitt "Konto"
2. Session wird sofort beendet, Weiterleitung zu `/login`

---

## Wie es funktioniert

### Fuer Benutzer

Die Einstellungsseite ist als klare Liste von Aktionen aufgebaut:
- Oben: "Konto" mit Abmelden-Button (weiss, keine Gefahr)
- Mitte: "System-Aktionen" mit zwei Karten — rot fuer System-Reset, gelb fuer Guthaben-Reset (visuell als gefaehrlich markiert)
- Unten: Platzhalter fuer zukuenftige Einstellungen

Destruktive Aktionen (System-Reset, Guthaben-Reset) haben immer einen Bestaetigungs-Dialog, der verhindert, dass versehentlich Daten geloescht werden.

### Technische Umsetzung

Die Seite ist eine reine Frontend-Komponente, die bestehende Server-API-Endpunkte aufruft:

- `POST /api/admin/reset` — System-Reset (aus FEAT-10, unveraendert)
- `POST /api/admin/credits/reset` — Guthaben-Reset (aus FEAT-10, unveraendert)
- `authStore.logout()` — Logout (aus FEAT-1, unveraendert)

**Wichtige Implementierungsdetails:**
- Modals werden via `<Teleport to="body">` gerendert — verhindert z-Index-Probleme
- `useModal`-Composable mit `onClose`-Callback stellt sicher, dass Eingabefelder und Fehlermeldungen beim Schliessen zurueckgesetzt werden (auch bei ESC)
- Auth-Guard via `onMounted` (konsistentes Pattern im gesamten Projekt)
- Erfolgs-Feedback als Banner auf der Seite (nicht im Modal) — bleibt sichtbar bis zur naechsten Navigation

**Verwendete Technologien:**
- Vue 3 Composition API mit `<script setup>`
- Pinia (`useAuthStore`) fuer Logout
- `useModal`-Composable (internes Projekt-Composable)
- Teenyicons (logout, x-small) als inline SVG
- Tailwind CSS fuer Styling

---

## Seitenstruktur

```
/admin/settings
├── Abschnitt: Konto
│   └── Abmelden-Button
├── Abschnitt: System-Aktionen
│   ├── Karte: System-Reset (rot)
│   └── Karte: Guthaben-Reset (gelb)
├── Abschnitt: Weitere Einstellungen (Platzhalter)
├── Modal: System-Reset-Bestaetigung (Teleport)
│   ├── Erklaerungstext
│   ├── Pflicht-Eingabe "RESET"
│   └── Bestaetigen-Button
└── Modal: Guthaben-Reset-Bestaetigung (Teleport)
    ├── Erklaerungstext
    ├── Abbrechen-Button
    └── Bestaetigen-Button
```

---

## Migration: Admin-Dashboard bereinigt

Im Zuge von FEAT-21 wurden aus `src/pages/admin/index.vue` entfernt:
- Alle Reset-Variablen (`showResetModal`, `resetConfirmation`, `isResetting`, etc.)
- Alle Reset-Handler-Funktionen (`handleReset`, `handleCreditsReset`, etc.)
- Das System-Aktionen-Template-Segment (Karten + Teleport-Modals)
- Der Dashboard-Subtitle wurde von "Systemuebersicht und Reset-Funktionen" auf "Systemuebersicht" korrigiert

---

## Abhängigkeiten

- FEAT-1 (Admin Authentication) — stellt `authStore.logout()` und `initFromCookie()` bereit
- FEAT-10 (Erweitertes Admin-Dashboard) — stellt `POST /api/admin/reset` und `POST /api/admin/credits/reset` bereit
- FEAT-15 (App-Navigationstruktur) — stellt `/admin/settings`-Route und Tab-Bar-Eintrag bereit

---

## Bekannte Einschraenkungen

- **BUG-FEAT21-001:** Doppelter `<h1>` im DOM (AdminHeader + Seiten-Content) — Accessibility-Verletzung und E2E-Test-Problem (Medium, Should Fix)
- **Erfolgs-Banner:** Bleibt bis zur naechsten Navigation sichtbar (kein Auto-Close) — entspricht der Spec-Anforderung

---

## Getestet

- Acceptance Criteria: 12/12 bestanden
- Edge Cases: 6/6 bestanden
- Unit-Tests: Keine neuen Tests notwendig (kein neuer Store/Composable)
- E2E-Tests: 15/16 bestanden (1 schlaegt fehl wegen BUG-FEAT21-001)
- Cross-Browser: Chromium (Playwright)
- Responsive: Klassen fuer Mobile + Desktop vorhanden (max-w-2xl, md:grid-cols-2)
- Accessibility: Teilweise (ARIA-Attribute korrekt; h1-Duplikat ist offen)
- Security: Auth-Guard vorhanden, destruktive Aktionen erfordern Bestaetigung
- Regression: Admin-Dashboard und alle anderen Admin-Seiten unbeeintraechtigt

---

## Nächste Schritte

- BUG-FEAT21-001 fixen: AdminHeader.vue `<h1>` zu `<p>` oder `<span>` wechseln (loest Problem projektübergreifend)
- Zukuenftige Features koennen die "Weitere Einstellungen"-Sektion bevoelkern (z.B. FEAT-22 Konfigurierbarer Schwellwert)

---

## Kontakt

Bei Fragen: Developer Agent / QA Engineer Agent (SnackEase-Projekt)
