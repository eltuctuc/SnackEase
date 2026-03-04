# FEAT-4: Demo-Guthaben-System

## Status: 🟢 Implemented

## Abhängigkeiten
- Benötigt: FEAT-1 (Admin Authentication)
- Benötigt: FEAT-2 (Demo User Authentication)
- Benötigt: FEAT-3 (User Switcher) - ✅ Implementiert

---

## 1. Overview

**Beschreibung:** Simuliertes Guthaben-System für die Demo. Guthaben wird nicht wirklich aufgeladen, nur die UI zeigt den Guthabenstand und Simulation des Aufladens.

**Ziel:** Realistische Demonstration des Guthaben-Systems ohne echte Payment-Integration.

---

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Demo-Nutzer möchte ich mein aktuelles Guthaben sehen | Must-Have |
| US-2 | Als Demo-Nutzer möchte ich mein Guthaben per Klick aufladen | Must-Have |
| US-3 | Als Demo-Nutzer möchte ich eine kurze Ladezeit beim Aufladen sehen | Should-Have |
| US-4 | Als Demo-Nutzer möchte ich sehen, wann mein Guthaben zuletzt aufgeladen wurde | Should-Have |

---

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Anzeige des aktuellen Guthabens auf der Startseite | Must-Have |
| REQ-2 | "Guthaben aufladen" Button mit Auswahlmöglichkeit (10€, 25€, 50€) | Must-Have |
| REQ-3 | Simulation der Aufladung mit 2-3 Sekunden Ladezeit | Must-Have |
| REQ-4 | Guthaben-Abzug bei Käufen | Must-Have |
| REQ-5 | Monatliche Gutschrift (simuliert) - 25€ pro Monat, manuell via Button | Must-Have |
| REQ-6 | Nicht verbrauchtes Guthaben wird übertragen | Must-Have |

---

## 4. Startguthaben pro Persona

| Persona | Startguthaben |
|---------|---------------|
| Nina Neuanfang | 25€ |
| Maxine Snackliebhaber | 15€ |
| Lucas Gesundheitsfan | 30€ |
| Alex Gelegenheitskäufer | 20€ |
| Tom Schnellkäufer | 10€ |

---

## 5. Auflade-Optionen

| Betrag | Beschreibung |
|--------|--------------|
| 10€ | Kleine Aufladung |
| 25€ | Standard (entspricht Monatspauschale) |
| 50€ | Große Aufladung |

---

## 6. Simulation Logik

1. **Startguthaben:** Jeder Demo-Nutzer erhält initial Guthaben lt. Tabelle oben
2. **Monatliche Gutschrift:** Button "Monatspauschale erhalten" (simuliert 1. des Monats, 25€)
3. **Aufladen:** Button zeigt Ladebalken, nach 2-3 Sekunden ist Guthaben verfügbar
4. **Übertrag:** Restguthaben bleibt erhalten (kein Verfall)

---

## 7. Acceptance Criteria

- [ ] Guthaben wird auf Startseite angezeigt
- [ ] Aufladen-Button öffnet Modal mit Betrag-Auswahl
- [ ] Nach Klick auf Aufladen: Ladeanimation 2-3 Sekunden
- [ ] Nach Ladezeit: Guthaben erhöht sich um gewählten Betrag
- [ ] Guthaben-Abzug bei Kauf wird korrekt berechnet
- [ ] Negatives Guthaben verhindert Kauf
- [ ] Button "Monatspauschale erhalten" funktioniert (25€)

---

## 8. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Nicht genug Guthaben | Kauf verweigern, Fehlermeldung |
| EC-2 | Guthaben = 0 | "Guthaben aufladen" Button prominent |
| EC-3 | Mehrfaches Klicken auf Aufladen | Debounce, nur ein Request |
| EC-4 | DB-Fehler beim Aufladen | Rollback, Fehlermeldung |

---

## 9. UI/UX Vorgaben

- Guthaben prominent auf Startseite (Header oder oberer Bereich)
- Farbcodierung: Grün bei >20€, Gelb bei 10-20€, Rot bei <10€
- Aufladen-Button deutlich sichtbar
- Ladeanimation während Aufladung (Spinner oder Fortschrittsbalken)

---

## 10. Technische Anforderungen

- **Database:** Neon mit Drizzle ORM
- **Speicherung:** Separate Tabelle `user_credits` mit balance-Feld
- **Transaktionen:** Separate Tabelle `credit_transactions` für Historie
- **Kein echter Payment-Provider** - nur Simulation
- **Auth:** Bestehendes Cookie-System wiederverwenden

---

## 11. API Endpoints (required)

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/credits/balance` | GET | Aktuelles Guthaben holen |
| `/api/credits/recharge` | POST | Guthaben aufladen |
| `/api/credits/monthly` | POST | Monatspauschale (25€) |

---

## 12. Admin-Funktionen

**NICHT in diesem Feature enthalten** - wird später in FEAT-5 (Admin Basis) implementiert:
- Guthaben manuell setzen
- Guthaben zurücksetzen
- Transaktionshistorie einsehen

---

## 13. UX Design

### 13.1 Personas-Abdeckung

| Persona | Bedürfnis im Guthaben-System | Abgedeckt? |
|---------|------------------------------|------------|
| Nina Neuanfang | Klares Guthaben, einfache Aufladung | ✅ |
| Maxine Snackliebhaber | Guthaben-Übersicht, optimal nutzen | ✅ |
| Alex Gelegenheitskäufer | Schnelle, unkomplizierte Aufladung | ✅ |
| Tom Schnellkäufer | One-Touch Aufladung | ✅ |

### 13.2 User Flow: Guthaben aufladen

```
1. User öffnet App → Startseite
2. User sieht Guthaben (farbcodiert)
3. User klickt "Guthaben aufladen"
4. Modal öffnet sich mit 3 Optionen (10€/25€/50€)
5. User wählt Betrag
6. User klickt "Aufladen"
7. Ladeanimation (2-3 Sekunden)
8. Guthaben aktualisiert → Erfolgsmeldung
```

**Alternativer Flow (Monatspauschale):**
```
1. User klickt "Monatspauschale erhalten"
2. Ladeanimation (1-2 Sekunden)
3. +25€ gutgeschrieben → Erfolgsmeldung
```

### 13.3 Wireframe: Startseite mit Guthaben

```
┌─────────────────────────────────────┐
│ ← SnackEase              [Logout]  │  Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Guthaben: 25,00 €     │   │  BalanceCard
│  │      ●●●●●●●● (grün)       │   │
│  │  [Guthaben aufladen]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Monatspauschale erhalten   │   │  MonthlyButton
│  │         +25,00 €           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 🍎  │ │ 🍌  │ │ 🥜  │           │  Products
│  │ ... │ │ ... │ │ ... │           │
│  └─────┘ └─────┘ └─────┘           │
│                                     │
└─────────────────────────────────────┘
```

### 13.4 Wireframe: Auflade-Modal

```
┌─────────────────────────────────────┐
│                                     │
│   Guthaben aufladen              ✕  │
│                                     │
│   Wähle einen Betrag:              │
│                                     │
│  ┌───────────────┐ ┌───────────────┐│
│  │               │ │               ││
│  │     10 €      │ │     25 €      ││  OptionCards
│  │   Klein       │ │   Standard    ││
│  │               │ │               ││
│  └───────────────┘ └───────────────┘│
│                                     │
│  ┌───────────────┐                  │
│  │               │                  │
│  │     50 €      │                  │  LargeOption
│  │    Groß       │                  │
│  │               │                  │
│  └───────────────┘                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Jetzt aufladen        │   │  SubmitButton
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 13.5 Accessibility (WCAG 2.1 AA)

- ✅ Farbkontrast > 4.5:1 (Balance: Text auf Hintergrund)
- ✅ Farbcodierung mit Text-Label ergänzt (nur Farbe nicht传达信息)
- ✅ Tastatur-Navigation: Tab-Reihenfolge logisch
- ✅ Screen Reader: aria-label für Buttons, role für Status
- ✅ Touch-Targets: Mindestens 44x44px
- ✅ Fokus-Indikator: Sichtbare Markierung bei Auswahl
- ✅ Fehlermeldungen: Klar und verständlich (z.B. "Nicht genug Guthaben")

### 13.6 UX-Empfehlungen

1. **Ladeanimation nicht blockierend** - User kann weiter navigieren
2. **Erfolgsmeldung mit Sound** (optional) - Für Tom "Schnellkäufer"
3. **Guthaben im Header persistent** - Immer sichtbar
4. **Letztes Aufladedatum anzeigen** - Vertrauen schaffen
5. **Farbcodierung + Text** - Barrierefreiheit für farbenblinde User

---

## 14. Tech-Design (Solution Architect)

### 14.1 Component-Struktur

```
Startseite (index.vue) [ERWEITERN]
├── BalanceCard Component
│   ├── Guthaben-Anzeige
│   ├── Farbstatus (grün/gelb/rot)
│   └── "Guthaben aufladen" Button
├── RechargeModal Component (neu)
│   ├── OptionSelector (10/25/50€)
│   ├── LoadingIndicator
│   └── SuccessMessage
├── MonthlyButton Component (neu)
│   └── "Monatspauschale erhalten"
```

### 14.2 Daten-Modell (beschrieben)

**Tabelle: user_credits**
- userId (Verknüpfung zu users)
- balance (aktueller Kontostand)
- lastRechargedAt (Zeitstempel)

**Tabelle: credit_transactions**
- userId (Verknüpfung zu users)
- amount (Betrag, + oder -)
- type ("recharge" | "purchase")
- createdAt (Zeitstempel)

### 14.3 Backend-Bedarf

| Komponente | Art | Beschreibung |
|------------|-----|--------------|
| Guthaben anzeigen | GET /api/credits/balance | Liest aktuellen Stand |
| Guthaben aufladen | POST /api/credits/recharge | Erhöht Guthaben |
| Monatspauschale | POST /api/credits/monthly | Fügt 25€ hinzu |

**Neue API Routes:**
- `src/server/api/credits/balance.get.ts`
- `src/server/api/credits/recharge.post.ts`
- `src/server/api/credits/monthly.post.ts`

### 14.4 Tech-Entscheidungen

**Warum separate Tabellen?**
→ Flexibilität: Guthaben unabhängig von User-Daten
→ Historie: Transaktionen nachvollziehbar
→ Skalierbarkeit: Funktioniert für echte Payment-Integration

**Warum 2-3 Sekunden Ladezeit?**
→ Realismus: Fühlt sich an wie echte Zahlung
→ UX: User sieht, dass etwas passiert

### 14.5 Wiederverwendung

- Auth-System: Cookie-Session aus FEAT-1/2/3
- User-Infos: Aus bestehender users-Tabelle
- Layout: index.vue wird erweitert

### 14.6 Änderungen an bestehenden Dateien

- `src/server/db/schema.ts`: 2 neue Tabellen
- `src/server/seed.ts`: Startguthaben für Personas
- `src/pages/index.vue`: BalanceCard + RechargeModal

---

## Implementation Notes

**Status:** 🟢 Implemented
**Developer:** Developer Agent
**Datum:** 2026-02-28

### Geänderte/Neue Dateien
- `src/server/db/schema.ts` – user_credits + credit_transactions Tabellen hinzugefügt
- `src/server/api/credits/balance.get.ts` – GET Guthaben abrufen
- `src/server/api/credits/recharge.post.ts` – POST Guthaben aufladen
- `src/server/api/credits/monthly.post.ts` – POST Monatspauschale
- `src/stores/credits.ts` – Pinia Store für Guthaben-Management
- `src/pages/dashboard.vue` – BalanceCard + RechargeModal integriert
- `src/server/seed.ts` – Startguthaben für 5 Demo-Personas
- `drizzle/0002_yellow_masked_marvel.sql` – Migration für neue Tabellen

### Wichtige Entscheidungen
- Dashboard statt index.vue für Guthaben-Anzeige (Admin-Bereich bereits vorhanden)
- Modal für Auflade-Optionen (keine separate Seite)
- 2-3 Sekunden Ladezeit für Realismus
- Farbcodierung: Grün (>20€), Gelb (10-20€), Rot (<10€)

### Bekannte Einschränkungen
- Guthaben-Abzug bei Käufen noch nicht implementiert (kommt in FEAT-7)

---

## QA Test Results

**Tested:** 2026-02-28
**App URL:** http://localhost:3000

---

## Offene Bugs

| Bug-ID | Titel | Severity | Priority | Status |
|--------|-------|----------|----------|--------|
| BUG-FEAT4-001 | Admin kann Guthaben sehen | Critical | Must Fix | Offen |

---

### Acceptance Criteria Status

| AC | Status | Notes |
|----|--------|-------|
| AC-1: Guthaben wird auf Startseite angezeigt | ✅ | Funktioniert |
| AC-2: Aufladen-Button öffnet Modal | ✅ | Funktioniert |
| AC-3: Ladeanimation 2-3 Sekunden | ✅ | Funktioniert |
| AC-4: Guthaben erhöht sich | ✅ | Funktioniert |
| AC-5: Guthaben-Abzug bei Kauf | ⚠️ | Nicht implementiert (FEAT-7) |
| AC-6: Negatives Guthaben verhindert Kauf | ⚠️ | Nicht implementiert (FEAT-7) |
| AC-7: Monatspauschale funktioniert | ✅ | Funktioniert |

### Edge Cases Status

| EC | Status | Notes |
|----|--------|-------|
| EC-1: Nicht genug Guthaben | ⚠️ | Nicht implementiert (FEAT-7) |
| EC-2: Guthaben = 0 | ✅ | Button sichtbar |
| EC-3: Mehrfaches Klicken | ✅ | Debounce via disabled |
| EC-4: DB-Fehler | ✅ | Error-Message im UI |

### Accessibility (WCAG 2.1)

- ✅ Farbkontrast > 4.5:1
- ✅ Farbcodierung + Text-Label
- ✅ Tastatur-Navigation
- ✅ Screen Reader Support
- ✅ Touch-Targets > 44x44px
- ✅ Fokus-Indikator

### Security

- ✅ Input Validation (Betrag muss 10/25/50 sein)
- ✅ Auth-Checks vorhanden
- ❌ **KEINE Admin-Rollenprüfung** - wird in FEAT-9 behoben

### Tech Stack & Code Quality

- ✅ Composition API + `<script setup>` verwendet
- ✅ Kein `any` in TypeScript
- ✅ Kein direkter DB-Zugriff aus Stores/Components
- ✅ Drizzle ORM für alle Queries
- ✅ Server Routes haben Error Handling
- ✅ Error-States in UI implementiert

---

## ❌ NOT Production Ready

**BUG-FEAT4-001 (Critical) noch offen** - FEAT-9 (Admin ohne Guthaben) wurde noch nicht implementiert.

Alle FEAT-4-eigenen Funktionen sind korrekt. Blockiert durch FEAT-9-Implementierung.

---

## QA Re-Test 2026-03-04

**Re-Tested:** 2026-03-04
**Tester:** QA Engineer

### Neue Erkenntnisse

- BUG-FEAT4-001 bleibt offen: FEAT-9 ist noch nicht implementiert (Status "Ready for Solution Architect")
- BUG-FEAT9-001 erstellt: Dokumentiert die fehlende FEAT-9-Implementierung im Detail
- Credits-Store: 0% Test-Coverage (Store-Tests mit describe.skip deaktiviert)

### Empfehlung

FEAT-9 muss implementiert werden bevor FEAT-4 als "Production Ready" gilt.
