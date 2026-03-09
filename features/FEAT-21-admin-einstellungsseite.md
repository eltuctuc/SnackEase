# FEAT-21: Admin Einstellungsseite

## Status: 🟢 Implemented

## Abhaengigkeiten
- Benoetigt: FEAT-1 (Admin Authentication) - fuer Auth-Guard und logout()-Funktion
- Benoetigt: FEAT-15 (App-Navigationstruktur) - stellt /admin/settings-Route und Admin-Tab-Bar bereit (Platzhalter-Seite bereits in FEAT-15 angelegt)
- Wiederverwendet: POST /api/admin/reset (aus FEAT-10)
- Wiederverwendet: POST /api/admin/credits/reset (aus FEAT-10)

---

## 1. Uebersicht

**Beschreibung:** Die Seite /admin/settings ersetzt den bisherigen Platzhalter (aus FEAT-15) durch den vollstaendigen Inhalt. Sie buendelt alle Admin-Aktionen und Verwaltungsoptionen an einem zentralen Ort: System-Reset, Guthaben-Reset und Logout. Darueber hinaus enthaelt sie einen Platzhalter-Bereich fuer kuenftige Einstellungen. Die beiden Reset-Funktionen werden von src/pages/admin/index.vue hierher verschoben.

**Ziel:** Einen klar strukturierten, zentralen Ort fuer alle Admin-Verwaltungsaktionen schaffen und das Admin-Dashboard (index.vue) von Reset-Funktionalitaet befreien.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Admin moechte ich mich ueber die Einstellungsseite ausloggen koennen, ohne durch das gesamte Dashboard navigieren zu muessen | Admin | Must-Have |
| US-2 | Als Admin moechte ich einen System-Reset durchfuehren koennen, um alle Kaeufe, Transaktionen und Guthaben auf den Ausgangszustand zurueckzusetzen | Admin | Must-Have |
| US-3 | Als Admin moechte ich ausschliesslich die Guthaben aller Nutzer zuruecksetzen koennen, ohne andere Daten zu beruehren | Admin | Must-Have |
| US-4 | Als Admin moechte ich vor einem destruktiven Reset zur Bestaetigung aufgefordert werden, damit ich versehentliche Datenverluste vermeide | Admin | Must-Have |
| US-5 | Als Admin moechte ich nach einem erfolgreichen Reset eine klare Erfolgsmeldung sehen | Admin | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Logout

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Die Seite enthaelt einen Logout-Button | Must-Have |
| REQ-2 | Ein Klick auf Logout ruft die logout()-Funktion des auth-Stores auf und leitet den Admin zur Login-Seite weiter | Must-Have |

### 3.2 System-Reset

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-3 | Die Seite enthaelt eine Aktion "System-Reset" | Must-Have |
| REQ-4 | Ein Klick auf "System-Reset" oeffnet einen Bestaetigunssdialog | Must-Have |
| REQ-5 | Der Dialog erklaert kurz, was der Reset bewirkt (Kaeufe und Transaktionen loeschen, Guthaben und Bestand zuruecksetzen) | Must-Have |
| REQ-6 | Der Admin muss im Dialog das Wort "RESET" eintippen, bevor der Bestaetigen-Button aktiv wird | Must-Have |
| REQ-7 | Nach Bestaetigung wird POST /api/admin/reset aufgerufen | Must-Have |
| REQ-8 | Waehrend des API-Calls ist der Bestaetigen-Button deaktiviert (Loading-State) | Must-Have |
| REQ-9 | Bei Erfolg wird eine Erfolgsmeldung angezeigt und der Dialog geschlossen | Must-Have |
| REQ-10 | Bei Fehler wird eine Fehlermeldung im Dialog angezeigt | Must-Have |

### 3.3 Guthaben-Reset

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-11 | Die Seite enthaelt eine Aktion "Guthaben-Reset" | Must-Have |
| REQ-12 | Ein Klick auf "Guthaben-Reset" oeffnet einen Bestaetigunssdialog | Must-Have |
| REQ-13 | Der Dialog erklaert kurz, was der Reset bewirkt (alle Nutzer-Guthaben auf 0 zuruecksetzen) | Must-Have |
| REQ-14 | Nach Bestaetigung wird POST /api/admin/credits/reset aufgerufen | Must-Have |
| REQ-15 | Waehrend des API-Calls ist der Bestaetigen-Button deaktiviert (Loading-State) | Must-Have |
| REQ-16 | Bei Erfolg wird eine Erfolgsmeldung angezeigt und der Dialog geschlossen | Must-Have |
| REQ-17 | Bei Fehler wird eine Fehlermeldung im Dialog angezeigt | Must-Have |

### 3.4 Migration: Reset-Funktionen aus admin/index.vue entfernen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-18 | Der System-Reset-Block und der Guthaben-Reset-Block werden aus src/pages/admin/index.vue entfernt | Must-Have |
| REQ-19 | Die zugehoerigen Reaktiv-Variablen (showResetModal, resetConfirmation, isResetting, resetSuccess, resetError, showCreditsResetModal) werden aus admin/index.vue entfernt | Must-Have |
| REQ-20 | Die zugehoerigen Handler-Funktionen (handleReset, handleCreditsReset, closeResetModal, closeCreditsResetModal) werden aus admin/index.vue entfernt | Must-Have |

### 3.5 Platzhalter-Bereich fuer kuenftige Einstellungen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-21 | Die Seite enthaelt einen klar abgegrenzten Platzhalter-Bereich mit dem Hinweis, dass hier kuenftige Einstellungen erscheinen werden | Should-Have |

---

## 4. Acceptance Criteria

- [ ] AC-1: Die Route /admin/settings ist erreichbar und zeigt die vollstaendige Einstellungsseite (kein Platzhalter-Text mehr)
- [ ] AC-2: Die Seite enthaelt einen Logout-Button
- [ ] AC-3: Ein Klick auf Logout beendet die Session und leitet zu /login weiter
- [ ] AC-4: Die Seite enthaelt einen "System-Reset"-Button
- [ ] AC-5: Der System-Reset-Dialog oeffnet sich und erfordert die Eingabe "RESET" vor dem Bestaetigen
- [ ] AC-6: Nach erfolgreichem System-Reset wird eine Erfolgsmeldung angezeigt
- [ ] AC-7: Die Seite enthaelt einen "Guthaben-Reset"-Button
- [ ] AC-8: Der Guthaben-Reset-Dialog oeffnet sich mit einer kurzen Erklaerung
- [ ] AC-9: Nach erfolgreichem Guthaben-Reset wird eine Erfolgsmeldung angezeigt
- [ ] AC-10: Auf src/pages/admin/index.vue sind beide Reset-Bloecke vollstaendig entfernt
- [ ] AC-11: Die Seite ist nur fuer eingeloggte Admins erreichbar (Auth-Guard)
- [ ] AC-12: Icons verwenden ausschliesslich Teenyicons 1.0 (teenyicons npm)

---

## 5. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Admin klickt "System-Reset", tippt "RESET" falsch oder unvollstaendig ein | Bestaetigen-Button bleibt deaktiviert — kein API-Call moeglich |
| EC-2 | Admin schliesst den Bestaetigungs-Dialog ohne zu bestaetigen | Kein API-Call, keine Zustandsaenderung, Eingabefeld wird zurueckgesetzt |
| EC-3 | API-Aufruf POST /api/admin/reset schlaegt fehl (Netzwerkfehler, 500) | Fehlermeldung wird im Dialog angezeigt, Dialog bleibt offen, Admin kann es erneut versuchen |
| EC-4 | Admin klickt Logout waehrend ein Reset-Dialog offen ist | Logout wird ausgefuehrt, Weiterleitung zu /login (Dialog wird durch Navigation ohnehin geschlossen) |
| EC-5 | Admin navigiert waehrend eines laufenden API-Calls (Loading-State) weg | API-Call laeuft im Hintergrund ab — keine Fehler im UI, da Seite verlassen wurde |
| EC-6 | Nicht-eingeloggter Nutzer ruft /admin/settings direkt auf | Bestehender Auth-Guard leitet zu /login weiter |

---

## 6. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| NFR-1 | Destruktive Aktionen (System-Reset, Guthaben-Reset) sind visuell klar als gefaehrlich gekennzeichnet (z.B. rote Farbe) |
| NFR-2 | Die Seite ist responsiv (Mobile + Desktop) |
| NFR-3 | Icons: ausschliesslich Teenyicons 1.0 (teenyicons npm) |

---

## 7. Abgrenzung (Out of Scope fuer FEAT-21)

| Thema | Begruendung |
|-------|-------------|
| Neue Admin-Einstellungen (z.B. Standort-Konfiguration, Guthaben-Betrag) | Future Scope, noch nicht spezifiziert |
| Passwort-Aenderung fuer Admin | Separates Feature |
| Audit-Log der Reset-Aktionen | Future Scope |

---

## 8. Tech-Design (Solution Architect)

### 8.1 Bestehende Architektur (relevant fuer diese Aenderung)

Folgende Teile der bestehenden Codebasis werden wiederverwendet oder direkt veraendert:

- `src/pages/admin/index.vue` — enthaelt derzeit den Reset-Code (Zeilen 34-102 Script, Zeilen 192-317 Template); wird bereinigt
- `src/pages/admin/settings.vue` — aktuell 13-zeiliger Platzhalter; wird vollstaendig ersetzt
- `src/stores/auth.ts` — stellt `logout()` und `initFromCookie()` bereit; keine Aenderung
- `src/composables/useModal.ts` — bestehender Composable (ESC-Handling, open/close/toggle); wird in settings.vue genutzt
- `POST /api/admin/reset` und `POST /api/admin/credits/reset` — bestehende Server-Routen (aus FEAT-10); werden unveraendert weiterverwendet
- Kein neues Backend-Modul noetig

### 8.2 Dateiliste

**Geaenderte Dateien (2 Stueck):**

| Datei | Art der Aenderung |
|-------|-------------------|
| `src/pages/admin/settings.vue` | Platzhalter komplett ersetzen durch vollstaendige Implementierung |
| `src/pages/admin/index.vue` | Reset-Code entfernen, Subtitle korrigieren |

**Neue Dateien: keine.**

Kein neues Composable noetig — `useModal` deckt das Modal-Handling bereits ab.

### 8.3 Component-Struktur (settings.vue)

```
/admin/settings
├── Seiten-Header
│   └── Titel "Einstellungen"
│
├── Abschnitt: Konto
│   └── Logout-Button (sekundaer, mit Abmelde-Icon)
│
├── Abschnitt: System-Aktionen
│   ├── Aktionskarte: System-Reset
│   │   ├── Beschreibungstext
│   │   └── Button "System-Reset durchfuehren" (rot)
│   └── Aktionskarte: Guthaben-Reset
│       ├── Beschreibungstext
│       └── Button "Guthaben-Reset durchfuehren" (gelb-700)
│
├── Abschnitt: Weitere Einstellungen (Platzhalter)
│   └── Hinweistext "Weitere Einstellungen folgen"
│
├── Modal: System-Reset-Bestaetigung (via Teleport to="body")
│   ├── Titel + Schliessen-Button (Fokus auf Oeffnen gesetzt)
│   ├── Erklaerungstext
│   ├── Eingabefeld "RESET" (autofocus)
│   ├── Fehlermeldungs-Div (role="alert", bedingt)
│   └── Bestaetigen-Button (deaktiviert solange kein "RESET")
│
└── Modal: Guthaben-Reset-Bestaetigung (via Teleport to="body")
    ├── Titel + Schliessen-Button (Fokus auf Oeffnen gesetzt)
    ├── Erklaerungstext + Rueckfrage
    ├── Fehlermeldungs-Div (role="alert", bedingt)
    └── Abbrechen- und Bestaetigen-Button
```

**Erfolgs-Feedback:** Kein Modal — stattdessen ein gruenes Banner direkt auf der Settings-Seite (unterhalb des Seiten-Headers), das nach einem erfolgreichen Reset eingeblendet wird. Separates Banner fuer System-Reset und Guthaben-Reset (oder ein gemeinsames mit dynamischem Text).

### 8.4 Code-Migration aus admin/index.vue

Der folgende Code wird aus `src/pages/admin/index.vue` **entfernt** und in `src/pages/admin/settings.vue` **neu aufgebaut**:

**Script-Block (index.vue) — zu entfernende Zeilen:**

| Zeilen | Inhalt |
|--------|--------|
| 34–40 | Reaktive Variablen: `showResetModal`, `showCreditsResetModal`, `resetConfirmation`, `isResetting`, `resetSuccess`, `resetError` |
| 41 | Computed: `canReset` |
| 56–73 | Funktion `handleReset()` |
| 75–91 | Funktion `handleCreditsReset()` |
| 93–97 | Funktion `closeResetModal()` |
| 99–102 | Funktion `closeCreditsResetModal()` |

**Template-Block (index.vue) — zu entfernende Zeilen:**

| Zeilen | Inhalt |
|--------|--------|
| 146–149 | Erfolgs-Banner `resetSuccess` (gruen) |
| 192–221 | Abschnitt "System-Aktionen" (beide Aktionskarten inkl. Buttons) |
| 226–271 | `<Teleport>` System-Reset-Modal |
| 274–317 | `<Teleport>` Guthaben-Reset-Modal |

**Zeile 127 (index.vue) — Subtitle anpassen:**

```
Vorher: "Systemübersicht und Reset-Funktionen"
Nachher: "Systemübersicht"
```

Die `fetchStats()`-Funktion und alle Stats-bezogenen Variablen (Zeilen 18–54) bleiben unveraendert in index.vue.

### 8.5 Focus Trap Strategie

Das Projekt verfuegt ueber keinen bestehenden Focus-Trap-Composable. Die UX-Empfehlung fordert: nach Modal-Oeffnen Fokus ins Modal setzen, beim Schliessen Fokus zurueck zum ausloesenden Button.

**Gewaehlt: Nativer Vue-Ansatz (kein neues Package, kein neues Composable)**

Begruendung: Die Modals sind einfach (1 Eingabefeld bzw. 2 Buttons). Ein vollstaendiger Focus-Trap mit Tab-Zyklus ist hier Overengineering.

Konkrete Umsetzung:
- `autofocus`-Attribut auf das Eingabefeld im System-Reset-Modal (Browser-nativ)
- `templateRef` auf den ersten fokussierbaren Element im Guthaben-Reset-Modal, `nextTick` + `.focus()` nach Modal-Oeffnen
- Beim Schliessen eines Modals: `templateRef` auf den ausloesenden Button, `.focus()` nach `close()`

Diese Loesung benoetigt kein neues Package und kein neues Composable.

### 8.6 Logout-Button

**Position:** Eigener Abschnitt "Konto" ganz oben auf der Settings-Seite (vor den destruktiven Aktionen).

**Stil:** Volle Breite, sekundaer (weisser Hintergrund mit Border), um ihn visuell klar von den destruktiven Rot/Gelb-Buttons zu trennen. Teenyicons-Icon `logout` links neben dem Label.

**Verhalten:** Ruft direkt `authStore.logout()` auf. Kein Bestaetigungs-Dialog (entspricht dem Muster anderer Logout-Implementierungen im Projekt; EC-4 zeigt, dass Logout auch ueber offene Dialoge hinweg funktioniert).

### 8.7 UX-Korrekturen (aus UX Expert Review)

Alle UX-Empfehlungen werden direkt in settings.vue eingebaut:

| Empfehlung | Umsetzung |
|------------|-----------|
| `yellow-600` → `yellow-700` | Guthaben-Reset-Button und Modal-Titel verwenden `yellow-700` statt `yellow-600` |
| `role="alert"` fuer Fehlermeldungen | Beide `v-if="resetError"`-Divs erhalten `role="alert"` |
| Focus Trap in Modals | Autofocus + `nextTick`-Focus-Strategie (siehe 8.5) |
| Erfolgs-Feedback als Banner (nicht im Dialog) | `resetSuccess`-Banner auf der Settings-Seite, nicht im Modal |
| Dashboard-Subtitle korrigieren | Zeile 127 in index.vue: "Systemübersicht und Reset-Funktionen" → "Systemübersicht" |
| Kein `<KeepAlive>` fuer settings.vue | settings.vue erhaelt kein `<KeepAlive>` (Modals werden bei Navigation zurueckgesetzt) |

### 8.8 Daten-Model

Kein neues Daten-Model noetig. Alle API-Endpunkte existieren bereits:

| Endpunkt | Beschreibung | Status |
|----------|--------------|--------|
| `POST /api/admin/reset` | Alle Bestellungen und Transaktionen loeschen, Guthaben auf 25 EUR zuruecksetzen | Vorhanden (FEAT-10) |
| `POST /api/admin/credits/reset` | Nur Guthaben aller Nutzer auf 25 EUR zuruecksetzen | Vorhanden (FEAT-10) |
| `POST /api/auth/logout` | Session-Cookie loeschen | Vorhanden (FEAT-1) |

### 8.9 Dependencies

Keine neuen Packages erforderlich. Alle benoetigen Libraries sind bereits installiert:

- `@vueuse/core` — fuer `useEventListener` in `useModal.ts` (bereits vorhanden)
- `teenyicons` — fuer Icons (bereits vorhanden)

### 8.10 Auth-Guard in settings.vue

Das Projekt verwendet `onMounted` als Auth-Guard (konsistentes Pattern, kein Middleware). settings.vue uebernimmt denselben Auth-Guard wie alle anderen Admin-Seiten:

```
onMounted:
  1. authStore.initFromCookie()
  2. Wenn kein User → /login
  3. Wenn User.role !== 'admin' → /dashboard
  4. pageReady = true
```

### 8.11 Implementierungsreihenfolge (fuer Developer)

**Schritt 1 — index.vue bereinigen:**
- Zeile 127: Subtitle von "Systemübersicht und Reset-Funktionen" auf "Systemübersicht" aendern
- Script-Zeilen 34–102 entfernen (alle Reset-Variablen, Computed, Handler-Funktionen)
- Template-Zeilen 146–149 entfernen (resetSuccess-Banner)
- Template-Zeilen 192–221 entfernen (System-Aktionen-Abschnitt)
- Template-Zeilen 226–317 entfernen (beide Teleport-Modals)
- Sicherstellen: keine toten Variablen-Referenzen verbleiben

**Schritt 2 — settings.vue implementieren:**
- Auth-Guard via `onMounted` (identisches Pattern wie index.vue Zeilen 104–119)
- Reaktive Variablen und Composable-Nutzung (`useModal`, `useAuthStore`)
- Logout-Handler (ruft `authStore.logout()` direkt auf)
- `handleReset()` und `handleCreditsReset()` als eigenstaendige Funktionen (kein `fetchStats()`-Aufruf danach, da Settings-Seite keine Stats anzeigt)
- Erfolgs-Banner als reaktiver State auf Seitenebene (getrennt fuer System-Reset und Guthaben-Reset oder gemeinsam mit Nachricht)
- Template: Seitenstruktur mit drei Abschnitten (Konto, System-Aktionen, Platzhalter)
- Beide Modals via `<Teleport to="body">` mit `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Fehlermeldungs-Divs mit `role="alert"`
- Gelb-Farbe durchgehend als `yellow-700`

**Schritt 3 — Manuelle Pruefung:**
- /admin/settings erreichbar und vollstaendig
- /admin (index.vue) zeigt keine Reset-Karten mehr
- Subtitle auf index.vue korrekt
- Logout funktioniert und leitet zu /login weiter
- System-Reset-Dialog erfordert "RESET"-Eingabe
- Guthaben-Reset-Dialog oeffnet sich ohne Pflicht-Eingabe
- Erfolgs-Banner erscheint nach Reset auf der Settings-Seite
- Fehlerfall: Fehlermeldung im Dialog sichtbar, Dialog bleibt offen

### 8.12 Test-Anforderungen

**Unit-Tests (Vitest):**
Kein neuer Store oder Composable — kein neuer Unit-Test erforderlich.
Bestehende Tests zu `useModal` und `auth`-Store bleiben unveraendert.

**E2E-Tests (Playwright):**

Neue Testdatei: `tests/e2e/admin-settings.spec.ts`

Kritische User-Flows:
1. `/admin/settings` ist erreichbar und zeigt keine Platzhalter-Text mehr
2. Logout-Button beendet Session und leitet zu `/login` weiter
3. System-Reset-Dialog: oeffnet sich, Button deaktiviert ohne "RESET"-Eingabe, aktiviert sich nach korrekter Eingabe
4. Guthaben-Reset-Dialog: oeffnet sich, Abbrechen schliesst ohne API-Call
5. `/admin` (index.vue) zeigt keine "System-Aktionen"-Karten mehr
6. Nicht eingeloggter Zugriff auf `/admin/settings` leitet zu `/login` weiter

Browser: Chromium (Projekt-Standard)

Ziel-Coverage: Alle 6 kritischen Flows muessen gruenlich durchlaufen.

---

## Implementation Notes

**Status:** 🟢 Implemented
**Developer:** Developer Agent
**Datum:** 2026-03-09

### Geaenderte/Neue Dateien
- `src/pages/admin/index.vue` — Reset-Variablen, Computed, Handler-Funktionen und Teleport-Modals vollstaendig entfernt; Subtitle von "Systemuebersicht und Reset-Funktionen" auf "Systemuebersicht" korrigiert
- `src/pages/admin/settings.vue` — Platzhalter vollstaendig ersetzt: Auth-Guard, Logout, System-Reset, Guthaben-Reset mit beiden Modals via Teleport
- `tests/e2e/admin-settings.spec.ts` — Neue E2E-Testdatei mit allen 6 kritischen User-Flows gemaess 8.12

### Wichtige Entscheidungen
- **Icons als inline SVG (kein ?raw-Import):** Das Projekt-Pattern (siehe AdminTabBar.vue, OfferSliderCard.vue) verwendet SVG-Pfade direkt im Template ohne Module-Imports. Die Teenyicons-SVG-Paths wurden direkt aus den npm-Package-Dateien entnommen (logout.svg, x-small.svg outline).
- **Getrennte Erfolgs-Banner:** System-Reset und Guthaben-Reset haben separate `resetSuccessMessage`/`creditsSuccessMessage` Refs mit eigenem Banner. Beide koennen gleichzeitig sichtbar sein (z.B. nach Reload nicht, da State nicht persistiert).
- **Separate isResetting-Variablen:** `isResetting` (System-Reset) und `isCreditsResetting` (Guthaben-Reset) sind getrennt, sodass beide Modals unabhaengig voneinander Loading-States zeigen koennen.
- **useModal mit onClose-Callback:** Reset des Eingabefelds und Error-State erfolgt im `onClose`-Callback des `useModal`-Composables, was sicherstellt, dass der State auch bei ESC-Schliessen zurueckgesetzt wird.
- **nextTick-Focus fuer Guthaben-Reset-Modal:** Da das Modal per `v-if` gerendert wird, muss `nextTick` abgewartet werden bevor `creditsConfirmButtonRef.focus()` aufgerufen werden kann.

### Bekannte Einschraenkungen
- Die Erfolgs-Banner bleiben bis zur naechsten Navigation sichtbar (kein Auto-Close). Das entspricht dem Spec-Design; ein Auto-Close wurde nicht gefordert.
- Der autofocus auf das RESET-Eingabefeld im System-Reset-Modal greift nur beim ersten Oeffnen zuverlaessig (Browser-natives Attribut). Bei erneutem Oeffnen desselben v-if-Elements ist autofocus browserabhaengig — Playwright-Tests validieren die Input-Interaktion dennoch korrekt.
