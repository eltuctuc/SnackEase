# Profil-Seite

**Feature-ID:** FEAT-20
**Status:** Abgeschlossen
**Implementiert am:** 2026-03-10
**Getestet am:** 2026-03-10

---

## Zusammenfassung

Die Profil-Seite gibt Mitarbeitern eine persönliche Übersicht über ihr Kaufverhalten, ihre Ausgaben und ihre Ernährungsgewohnheiten. Sie ist unter `/profile` erreichbar und enthält Einkaufsstatistiken, einen Gesundheits-Score, einen Bestellverlauf und einen sicheren Logout.

---

## Was wurde gemacht

### Hauptfunktionen

- **Profil-Header:** Avatar-Platzhalter, Name und Standort des Mitarbeiters (nur lesend — keine Bearbeitungsoption), aktuelles Guthaben mit Link zur Guthaben-aufladen-Seite (FEAT-24)
- **Bonuspunkte-Balkendiagramm:** Interaktiver Chart (vue-chartjs) mit eigenem Woche/Monat/Jahr-Umschalter. Leerer Zustand mit erklärendem Hinweistext statt Null-Balken
- **Globaler Zeitraum-Filter:** Vier Optionen (7 Tage / 30 Tage / 90 Tage / Alle Zeit), Standard: 30 Tage
- **Einkaufsstatistiken:** Gesamt-Einkäufe, Einkäufe letzte 7 Tage, Datum letzter Kauf, Ausgaben nach Woche/Monat/Jahr — alle zeitraum-unabhängig fixiert
- **Lieblingsprodukt:** Das meistgekaufte Produkt aller Zeiten mit Kaufhäufigkeit
- **Gesundheits-Score:** Ganzzahliger Wert 1–10, berechnet aus Kalorien (50%), Zucker (30%), Fett (20%) plus Bonus für vegane und glutenfreie Produkte. Mit Fragezeichen-Tooltip zur Erklärung
- **Bestellverlauf:** Alle abgeholten Bestellungen (`status=picked_up`) im gewählten Zeitraum, chronologisch absteigend. Bestellkarten kollabierbar bei mehreren Produkten, Load-More-Button ab 20 Einträgen
- **Logout:** Zweistufige Abmeldung (erst "Abmelden" → dann "Abmelden bestätigen?" oder "Abbrechen")

### Benutzer-Flow

1. Mitarbeiter öffnet `/profile` über das Profil-Icon in der Tab-Bar
2. Name, Standort und Guthaben erscheinen sofort aus dem Auth-Store (kein Skeleton-Delay)
3. Bonuspunkte-Chart und Statistiken laden parallel in einem API-Call
4. Mitarbeiter wählt einen Zeitraum (z.B. "7 Tage") — Statistiken und Bestellverlauf aktualisieren sich sofort
5. Bestellkarten können bei Mehrprodukt-Bestellungen aufgeklappt werden
6. Zum Abmelden: Logout-Button antippen → Bestätigen antippen

---

## Wie es funktioniert

### Für Benutzer

Der Mitarbeiter sieht auf einen Blick:
- Sein aktuelles Guthaben und einen direkten Link zum Aufladen
- Wie viele Bonuspunkte er gesammelt hat (visuell als Balkendiagramm)
- Wie viel er im gewählten Zeitraum ausgegeben hat
- Sein meistgekauftes Produkt
- Einen Score (1–10), wie gesund seine Snack-Auswahl war — mit Tooltip zur Erklärung der Berechnung
- Eine vollständige Kaufhistorie seiner abgeholten Bestellungen

### Technische Umsetzung

Alle Profil-Daten werden in einem einzigen API-Call (`GET /api/profile/stats?period=30d`) geladen. Der Server führt 9 parallele Datenbankabfragen per `Promise.all()` aus. Der Gesundheits-Score wird ausschließlich serverseitig berechnet (keine Naehrwert-Daten im Browser).

**Sicherheit:** Der API-Endpunkt verweigert Admins den Zugriff (HTTP 403). Die Middleware `auth.global.ts` leitet nicht eingeloggte Nutzer zu `/login` und Admins zu `/admin` weiter.

**Verwendete Technologien:**
- Nuxt 3 / Vue 3 Composition API (`<script setup lang="ts">`)
- `vue-chartjs` + `chart.js` für das Bonuspunkte-Balkendiagramm (neue Dependencies)
- Drizzle ORM für alle Datenbankabfragen
- Teenyicons (inline SVG) für alle Icons
- Tailwind CSS für das Layout
- Pinia Auth-Store für Logout (`authStore.logout()`)

---

## Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/pages/profile.vue` | Hauptseite — ersetzt FEAT-15-Platzhalter |
| `src/server/api/profile/stats.get.ts` | GET /api/profile/stats — ein API-Call für alle Profil-Daten |
| `src/server/utils/healthScore.ts` | Gesundheits-Score-Berechnung (extrahiert für Unit-Testbarkeit) |
| `src/components/profile/ProfileHeader.vue` | Name, Standort, Guthaben-Header |
| `src/components/profile/BonusPointsCard.vue` | Bonuspunkte-Balkendiagramm mit eigenem Zeitraum-Umschalter |
| `src/components/profile/PeriodSelector.vue` | Globaler 7T/30T/90T/Alle-Umschalter |
| `src/components/profile/StatsGrid.vue` | Einkaufsstatistiken-Container |
| `src/components/profile/StatCard.vue` | Einzelne Statistik-Kachel |
| `src/components/profile/FavoriteProductCard.vue` | Lieblingsprodukt-Kachel |
| `src/components/profile/HealthScoreCard.vue` | Gesundheits-Score-Kachel mit Tooltip |
| `src/components/profile/OrderHistoryList.vue` | Bestellverlauf-Liste mit Load-More |
| `src/components/profile/OrderHistoryItem.vue` | Einzelne Bestellkarte (kollabierbar) |
| `src/components/profile/LogoutButton.vue` | Zweistufiger Logout-Button |
| `tests/utils/healthScore.test.ts` | 14 Unit-Tests für die Score-Berechnung |
| `tests/e2e/profile.spec.ts` | 14 E2E-Tests für alle kritischen User-Flows |

### Geänderte Dateien

| Datei | Änderung |
|-------|---------|
| `src/middleware/auth.global.ts` | Admin-Redirect von /profile zu /admin ergänzt (AC-19) |
| `package.json` | `vue-chartjs` und `chart.js` als neue Dependencies |

---

## Abhängigkeiten

- **FEAT-15** (App-Navigationstruktur) — `/profile`-Route und Tab-Bar-Navigation existieren dadurch
- **FEAT-16** (Warenkorb-System) — `purchase_items`-Tabelle für Mehrprodukt-Bestellungen im Verlauf
- **FEAT-24** (Guthaben aufladen) — Kreditkarten-Icon navigiert zu `/profile/credit` (noch nicht implementiert)

---

## Getestet

- Acceptance Criteria: Alle 19/19 bestanden
- Edge Cases: EC-1, EC-2, EC-3, EC-4, EC-5, EC-6, EC-9, EC-10 bestanden
- Cross-Browser: Chromium (Playwright)
- Responsive: Mobile-First Tailwind-Layout
- Accessibility: WCAG 2.1 konform (SR-Tabelle für Chart, aria-Attribute vollständig, Focus-States)
- Security: Auth-Guard doppelt (Middleware + API), Input-Validation, kein DB-Zugriff im Browser
- Regression: Keine bestehenden Features beeinträchtigt

---

## Nächste Schritte

- **FEAT-24** (Guthaben aufladen): Das Kreditkarten-Icon im Profil-Header navigiert bereits zu `/profile/credit` — die Seite muss noch implementiert werden
- **FEAT-18** (Empfehlungen & Favoriten): Personalisierte Produktempfehlungen könnten auf der Profil-Seite ergänzt werden
- Rate Limiting auf `/api/profile/stats` für Produktionsreife (Optimierungspotenzial O-4)

---

## Kontakt

Bei Fragen zu diesem Feature: Developer Agent / QA Agent
