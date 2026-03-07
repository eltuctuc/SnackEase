# Low-Stock-Benachrichtigungen

**Feature-ID:** FEAT-13
**Status:** Getestet (Bugs offen — siehe unten)
**Getestet am:** 2026-03-07

---

## Zusammenfassung

FEAT-13 gibt dem Admin automatische Warnungen, wenn ein Produkt im Snack-Automaten auf 3 oder weniger Stück gefallen ist. So kann der Admin proaktiv nachbestellen, bevor Produkte ausverkauft sind — bevor Nutzer leer ausgehen.

---

## Was wurde gemacht

### Hauptfunktionen

- Rote Benachrichtigungs-Glocke im Admin-Header mit Badge-Zaehler (zeigt Anzahl ungelesener Warnungen)
- Klick auf die Glocke öffnet ein Dropdown mit der Übersicht aller Low-Stock-Produkte
- Vollständige Benachrichtigungs-Seite unter `/admin/notifications` mit Filter und Detailansicht
- Automatische Erstellung einer Warnung nach jedem Kauf, der den Bestand auf <= 3 drückt
- Automatisches Entfernen der Warnung, wenn der Admin den Bestand über 3 auffüllt
- "Gelesen" markieren (einzeln oder alle auf einmal), Badge-Zaehler reduziert sich entsprechend
- Benachrichtigungs-Link "Benachr." in der Admin-Navigation mit eingebettetem Zaehler
- 30-Sekunden-Polling im Hintergrund hält den Badge aktuell

### Benutzer-Flow

1. Nutzer kauft ein Produkt — Bestand fällt z.B. von 4 auf 3 Stück
2. Das System erstellt eine Low-Stock-Warnung (serverseitig, nach dem Kauf)
3. Admin sieht im Header-Badge die Zahl "1" (neue Warnung)
4. Admin klickt auf die Glocke: Dropdown zeigt Produktname, Bestandsmenge, Zeitstempel
5. Admin klickt "Bestand auffüllen": Weiterleitung zu `/admin/inventory`
6. Admin füllt Bestand auf über 3 Stück auf
7. Warnung wird automatisch entfernt, Badge-Zaehler sinkt auf 0

---

## Wie es funktioniert

### Für den Admin

Der Admin sieht auf jeder Admin-Seite eine Glocke rechts im Header. Wenn es Low-Stock-Warnungen gibt, zeigt ein rotes Badge die Anzahl ungelesener Warnungen an. Ein Klick auf die Glocke öffnet ein Dropdown mit einer kompakten Übersicht. Jeder Eintrag zeigt:

- Schweregrad (Kritisch = 0 Stück, Niedrig = 1-3 Stück)
- Produktname und Stückzahl
- Zeitstempel, seit wann die Warnung gilt
- Button "Bestand auffüllen" → Weiterleitung zur Bestandsverwaltung
- Button "Gelesen" → kennzeichnet die Warnung als gesehen

Für eine vollständige Übersicht mit Filteroptionen gibt es die Seite `/admin/notifications`. Dort können Warnungen nach "Alle" oder "Ungelesen" gefiltert werden.

### Technische Umsetzung

Nach jeder erfolgreichen Kauftransaktion in `purchases.post.ts` läuft ein Low-Stock-Check. Dieser prüft den aktuellen Bestand des gekauften Produkts. Wenn er <= 3 beträgt und noch keine Warnung für dieses Produkt existiert, wird ein neuer Eintrag in der Datenbanktabelle `low_stock_notifications` angelegt.

Der Check läuft bewusst **nach** der Kauftransaktion — ein Fehler beim Anlegen der Warnung macht den Kauf nicht rückgängig.

Beim Auffüllen von Bestand via `PATCH /api/admin/inventory` werden Warnungen für Produkte mit neuem Bestand > 3 automatisch gelöscht.

**Verwendete Technologien:**
- Nuxt 3 / Vue 3 Composition API + `<script setup>`
- Pinia Store (`useNotificationsStore`) mit 30-Sekunden-Polling
- Neon PostgreSQL + Drizzle ORM (neue Tabelle `low_stock_notifications`)
- Tailwind CSS
- ARIA-Rollen und Labels für WCAG 2.1 AA

---

## Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/server/db/schema.ts` | Neue Tabelle `low_stock_notifications` |
| `src/server/api/admin/notifications/index.get.ts` | GET alle Benachrichtigungen |
| `src/server/api/admin/notifications/[id]/read.post.ts` | Einzeln als gelesen markieren |
| `src/server/api/admin/notifications/read-all.post.ts` | Alle als gelesen markieren |
| `src/stores/notifications.ts` | Pinia Store mit Polling |
| `src/components/admin/NotificationBadge.vue` | Glocken-Icon mit Badge |
| `src/components/admin/NotificationDropdown.vue` | Dropdown mit Übersicht |
| `src/components/admin/NotificationDropdownItem.vue` | Eintrag im Dropdown |
| `src/components/admin/NotificationCard.vue` | Karte auf der Vollseite |
| `src/pages/admin/notifications.vue` | Vollständige Seite /admin/notifications |
| `tests/stores/notifications.test.ts` | 28 Unit-Tests |
| `tests/e2e/feat-13-notifications.spec.ts` | 12 E2E-Tests |

**Geänderte Dateien:**
- `src/server/api/purchases.post.ts` — Low-Stock-Check nach Kauftransaktion
- `src/server/api/admin/inventory/index.patch.ts` — Auto-Löschung bei Auffüllen
- `src/components/admin/AdminNav.vue` — Glocken-Badge + Dropdown + Nav-Link

---

## Offene Bugs

| Bug-ID | Titel | Severity | Priority |
|--------|-------|----------|----------|
| BUG-FEAT13-001 | Fehlender UNIQUE-Constraint auf productId | High | Should Fix |
| BUG-FEAT13-002 | Touch-Targets in Dropdown 36px statt 44px | Medium | Should Fix |
| BUG-FEAT13-003 | Direkter document.querySelector-Zugriff | Low | Nice to Fix |
| BUG-FEAT13-004 | Doppelter API-Call bei /admin/notifications | Low | Nice to Fix |

---

## Screenshots

[Können nach visueller Inspektion im Browser ergänzt werden]

---

## Abhängigkeiten

- FEAT-5 (Admin-Basis) — Admin-Zugriff und AdminNav-Komponente
- FEAT-7 (One-Touch-Kauf) — Trigger für Low-Stock-Check nach Kauf
- FEAT-12 (Bestandsverwaltung) — Bestandsdaten und Auto-Bereinigung bei Auffüllen

---

## Getestet

- Acceptance Criteria: 6/7 bestanden (E-Mail-Benachrichtigung ist Nice-to-Have, bewusst nicht implementiert)
- Unit-Tests: 190 passing, 19 skipped — alle grün
- Accessibility: 3/4 Punkte ok (Touch-Targets Dropdown 36px statt 44px — BUG-FEAT13-002)
- Security: Alle Admin-Routes mit requireAdmin gesichert
- Regression: FEAT-7 und FEAT-12 Kernfunktionen unverändert

---

## Nächste Schritte

- BUG-FEAT13-001 fixen: UNIQUE-Constraint auf `product_id` in der DB-Tabelle
- BUG-FEAT13-002 fixen: min-h-[44px] in NotificationDropdownItem.vue
- FEAT-14: Weitere Features (Low-Stock-E-Mail-Benachrichtigung als optionale Erweiterung)

---

## Kontakt

Bei Fragen: Developer-Team / QA (QA Engineer Agent, 2026-03-07)
