# FEAT-21: Admin Einstellungsseite

## Status: Planned

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
