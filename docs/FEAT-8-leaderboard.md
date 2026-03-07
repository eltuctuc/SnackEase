# Leaderboard

**Feature-ID:** FEAT-8
**Status:** Accessibility-Bugs offen (NOT Production Ready)
**Implementiert am:** 2026-03-05
**Erster QA-Re-Test:** 2026-03-05
**Zweiter QA-Durchgang:** 2026-03-05

---

## Zusammenfassung

Das Leaderboard zeigt eine Rangliste aller Mitarbeiter nach Snack-Kaeufen und Bonuspunkten. Es motiviert durch freundschaftlichen Wettbewerb und gibt Anreize fuer gesunde Ernaehrung. Erreichbar ueber den Leaderboard-Link im Dashboard unter der Route `/leaderboard`.

---

## Was wurde gemacht

### Hauptfunktionen

- Rangliste "Meistgekauft" — wer hat im gewaehlten Zeitraum am meisten Snacks gekauft?
- Rangliste "Gesundeste" — wer hat die meisten Bonuspunkte gesammelt (Obst +3, Nuesse/Protein +2, Snacks/Getraenke +1)?
- Zeitraum-Filter: Aktuelle Woche / Aktueller Monat / Allzeit
- Eigener Rang immer sichtbar (Banner unter den Filtern + farbliche Hervorhebung in der Liste)
- Top 3 mit Gold/Silber/Bronze-SVG-Icons hervorgehoben
- Inaktive Nutzer mit "inaktiv"-Badge in der Liste sichtbar
- Skeleton-Loading, Leer-Zustand und Fehler-Zustand mit Retry
- Tastatur-Navigation (Pfeiltasten) im Tab-Bereich gemaess ARIA-Spezifikation

### Benutzer-Flow

1. Mitarbeiter ist im Dashboard eingeloggt
2. Klickt auf den Leaderboard-Link (Pokal-Icon + "Leaderboard"-Text)
3. Die Seite `/leaderboard` oeffnet sich
4. Skeleton-Loading erscheint kurz waehrend die Daten geladen werden
5. Rangliste "Meistgekauft" fuer die aktuelle Woche wird angezeigt
6. Der eigene Eintrag ist blau hervorgehoben, ein Banner zeigt "Dein Rang: Platz X"
7. Mitarbeiter kann Tab wechseln ("Gesundeste") — kein erneutes Laden noetig
8. Mitarbeiter kann Zeitraum wechseln ("Monat" oder "Allzeit") — neue Daten werden geladen
9. Zurueck zum Dashboard ueber den "Dashboard"-Link oben links

---

## Wie es funktioniert

### Fuer Benutzer

- Navigation: Link "Leaderboard" im Dashboard (nur fuer Mitarbeiter sichtbar, nicht fuer Admins)
- Zwei Tabs: "Meistgekauft" zaehlt die Anzahl der Kaeufe, "Gesundeste" zaehlt Bonuspunkte nach Produktkategorie
- Zeitraum waehlen: Drei Buttons — "Woche" (Standard), "Monat", "Allzeit" — oben ueber der Liste
- Eigener Rang: Ein Banner zeigt direkt den eigenen Rang, Standort und Kaufanzahl/Punkte — ohne Scrollen
- Hervorhebung: Der eigene Eintrag hat einen blauen Hintergrund und einen gruenen linken Balken
- Aktualisieren: Der "Aktualisieren"-Button am unteren Rand laedt die Daten manuell neu
- Punktesystem-Erklaerung: Beim Tab "Gesundeste" erscheint ein Hinweis zu den Punkteregeln

### Technische Umsetzung

Die Rangliste wird aus den bestehenden Datenbanktabellen `users` und `purchases` berechnet — keine eigene Tabellen-Struktur noetig. Beim Oeffnen der Seite wird ein einziger API-Call gemacht, der beide Ranglisten ("Meistgekauft" und "Gesundeste") in einer Antwort zurueckgibt. Tab-Wechsel zwischen den beiden Listen loest keinen erneuten API-Call aus — die Daten sind bereits vorhanden.

Die User-ID des eingeloggten Nutzers wird als reaktives `Ref<number | undefined>` an das Composable uebergeben, damit die Hervorhebung des eigenen Eintrags auch nach der asynchronen Auth-Initialisierung korrekt funktioniert. API-Fehler geben nur eine generische Fehlermeldung zurueck — keine internen Datenbankdetails werden an den Client weitergegeben.

**Verwendete Technologien:**

- Nuxt 3 / Vue 3 (Composition API, `<script setup>`)
- Pinia (`useAuthStore` fuer User-ID und Rolle)
- Drizzle ORM (LEFT JOIN auf `purchases` und `users` Tabellen, bedingte Zeitraum-Filter)
- Tailwind CSS (Styling, Accessibility-Klassen, `motion-safe`)
- Vitest (21 Unit-Tests fuer das `useLeaderboard` Composable)

---

## Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/pages/leaderboard.vue` | Seite mit Header, Tabs, Zeitraum-Filter, Eigener-Rang-Banner, Refresh-Button |
| `src/components/leaderboard/LeaderboardList.vue` | Container mit Loading/Error/Empty/Liste-States |
| `src/components/leaderboard/LeaderboardEntry.vue` | Einzelner Listeneintrag mit Trophy-SVG, Avatar, Name, Badge, Wert |
| `src/components/leaderboard/LeaderboardSkeleton.vue` | Strukturierter Lade-Skeleton (6 Zeilen, imitiert Listenstruktur) |
| `src/composables/useLeaderboard.ts` | State-Management: Tabs, Zeitraum, Loading/Error/Empty, API-Call |
| `src/server/api/leaderboard.get.ts` | GET-Endpoint: beide Ranglisten, Zeitraum-Filter, Auth-Check |
| `tests/composables/useLeaderboard.test.ts` | 21 Unit-Tests, alle bestanden |

**Geaenderte Dateien:**

| Datei | Aenderung |
|-------|---------|
| `src/middleware/auth.global.ts` | `/leaderboard` zu `protectedPaths` hinzugefuegt; Admin-Redirect zu `/admin` |
| `src/pages/dashboard.vue` | Leaderboard-Link fuer Mitarbeiter hinzugefuegt (SVG-Icon statt Emoji) |

---

## Behobene Bugs (vor Abnahme)

Alle 5 Bugs wurden vor der finalen QA-Abnahme behoben:

| Bug-ID | Severity | Beschreibung |
|--------|----------|-------------|
| BUG-FEAT8-001 | High | Race Condition — eigener Rang nicht hervorgehoben beim Direktaufruf |
| BUG-FEAT8-002 | Medium | Dashboard-Link verwendete Emoji statt SVG-Icon |
| BUG-FEAT8-003 | Medium | Tab-Buttons ohne Pfeiltasten-Navigation (ARIA-Spezifikation) |
| BUG-FEAT8-004 | Medium | API gab interne Fehlermeldungen an Client weiter |
| BUG-FEAT8-005 | Low | Leer-Zustand-Text nicht tab-kontextsensitiv |

---

## Getestet

- Acceptance Criteria: Alle 20 bestanden
- Edge Cases: Alle 8 bestanden
- Security: Keine Info-Disclosure, Auth-Checks auf Middleware- und API-Ebene
- Regression: Alle 143 bestehenden Unit-Tests bestanden
- Unit-Tests: 21/21 Tests bestanden, 96.55% Statement-Coverage

### Offene Accessibility-Bugs (zweiter QA-Durchgang, 2026-03-05)

Im zweiten unabhängigen QA-Durchgang wurden 4 neue Accessibility-Probleme gefunden:

| Bug-ID | Problem | Severity | Priority |
|--------|---------|----------|----------|
| BUG-FEAT8-006 | Wert-Suffix "Pkt."/"Käufe" — gray-400 Kontrast 2.54:1 (< 4.5:1 WCAG AA) | High | Must Fix |
| BUG-FEAT8-007 | Rang-Banner Sekundärtext — blue-500 Kontrast 3.38:1 (< 4.5:1 WCAG AA) | High | Must Fix |
| BUG-FEAT8-008 | Dashboard-Zurück-Link — muted-foreground Kontrast 3.88:1 (< 4.5:1 WCAG AA) | Medium | Should Fix |
| BUG-FEAT8-009 | Fehlende aria-live-Region — Screen Reader wird bei Tab-/Zeitraum-Wechsel nicht benachrichtigt | Medium | Should Fix |

**Production-Ready-Status: NOT Ready** — BUG-FEAT8-006 und BUG-FEAT8-007 (High/Must Fix) müssen vor dem Go-Live behoben werden.

---

## Abhaengigkeiten

- FEAT-7 (One-Touch Kauf) — Bonuspunkte-Daten in der `purchases`-Tabelle
- FEAT-2 (Demo User Authentication) — `authStore.initFromCookie()` fuer User-ID und Rolle
- FEAT-9 (Admin ohne Guthaben) — Admin hat keinen Zugriff auf das Leaderboard

---

## Naechste Schritte

- BUG-FEAT8-006: `text-gray-400` → `text-gray-500` in `LeaderboardEntry.vue` (Zeile 96)
- BUG-FEAT8-007: `text-blue-500` → `text-blue-700` in `leaderboard.vue` (Zeile 199)
- BUG-FEAT8-008: `text-muted-foreground` → `text-foreground` oder `text-gray-600` in `leaderboard.vue` (Zeile 108)
- BUG-FEAT8-009: `aria-live="polite"` Wrapper in `LeaderboardList.vue` um alle Zustands-Blöcke
- E2E-Tests koennen ergaenzt werden (`tests/e2e/leaderboard.spec.ts` — laut Spec vorgesehen)
- Bei wachsendem Team (100+ Mitarbeiter): serverseitiges Paging koennte sinnvoll werden

---

## Kontakt

Bei Fragen zu diesem Feature: Developer Agent / QA Engineer Agent (SnackEase Team)
