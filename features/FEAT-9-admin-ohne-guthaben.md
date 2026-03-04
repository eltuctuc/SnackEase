# FEAT-9: Admin ohne Guthaben

## Status: ❌ Nicht implementiert

## Abhängigkeiten
- Benötigt: FEAT-4 (Demo-Guthaben) - für Guthaben-Funktionalität

---

## 1. Overview

**Beschreibung:** Der Admin (admin@demo.de) hat KEIN Guthaben in der Datenbank. Admin kann nichts kaufen und bekommt keine monatliche Pauschale. Das Guthaben-System gilt nur für Mitarbeiter (role: mitarbeiter).

**Ziel:** Vollständige Trennung - Admin hat kein Guthaben, weder in der UI noch in der Datenbank.

---

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin habe ich KEIN Guthaben in der Datenbank | Must-Have |
| US-2 | Als Admin kann ich KEINE Produkte kaufen | Must-Have |
| US-3 | Als Admin erhalte ich KEINE monatliche Pauschale | Must-Have |
| US-4 | Als Admin sehe ich KEINE Guthaben-UI | Must-Have |
| US-5 | Als Mitarbeiter habe ich weiterhin Guthaben | Must-Have |

---

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Admin (role=admin): KEIN Eintrag in user_credits | Must-Have |
| REQ-2 | Admin kann KEINE Guthaben-API aufrufen | Must-Have |
| REQ-3 | Admin kann KEINE Monatspauschale erhalten | Must-Have |
| REQ-4 | Admin sieht KEINE Guthaben-Karte im Dashboard | Must-Have |
| REQ-5 | Wenn Admin Guthaben-API aufruft: Error 403 | Must-Have |
| REQ-6 | Mitarbeiter (role=mitarbeiter): Guthaben wie bisher | Must-Have |

---

## 4. Datenbank-Logik

```
BEI NEUEM USER:
  IF role === 'admin':
    → KEIN user_credits Eintrag erstellen
  ELSE:
    → user_credits mit Startguthaben erstellen

BEI API AUFRUFEN:
  IF user.role === 'admin':
    → Error 403: "Admin hat kein Guthaben"
  ELSE:
    → Normale Guthaben-Logik
```

---

## 5. Acceptance Criteria

- [ ] Admin (admin@demo.de) hat KEINEN Eintrag in user_credits
- [ ] API /api/credits/balance gibt 403 für Admin zurück
- [ ] API /api/credits/recharge gibt 403 für Admin zurück
- [ ] API /api/credits/monthly gibt 403 für Admin zurück
- [ ] Admin-Dashboard zeigt KEINE Guthaben-Karte
- [ ] Mitarbeiter haben weiterhin Guthaben wie bisher

---

## 6. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Admin versucht Guthaben abzurufen | 403 Error |
| EC-2 | Admin versucht aufzuladen | 403 Error |
| EC-3 | Neuer Admin wird erstellt | Kein Guthaben-Eintrag |
| EC-4 | Admin versucht Monatspauschale | 403 Error |

---

---

## UX Design

### Personas-Analyse

#### Betroffene Personas

FEAT-9 betrifft primär die **Admin-Rolle**, die in den vorhandenen Personas nicht explizit abgebildet ist. Die bestehenden Personas 1-10 beschreiben ausschliesslich Mitarbeiter-Rollen (Endnutzer). Daraus ergibt sich ein relevanter Design-Hinweis:

**Gap im Persona-Set:** Keine Admin-Persona vorhanden. Auf Basis der Systemdefinition (FEAT-5) lässt sich jedoch ein implizites Admin-Profil ableiten:

**Implizite Admin-Persona: "Admin Alex"**
- Rolle: Systemverwalter (Demo-Modus)
- Ziel: Systemzustand verwalten, Nutzer betreuen, Resets durchführen
- Aufgabe: Kein Snack-Kauf, keine persönliche Guthaben-Verwaltung
- Mental Model: Admin denkt in Systemoperationen, nicht in Guthaben

#### Auswirkung auf Mitarbeiter-Personas

| Persona | Betroffenheit durch FEAT-9 | Begründung |
|---------|---------------------------|------------|
| Nina Neuanfang (P1) | Nicht direkt betroffen | Ist Mitarbeiterin, behält Guthaben-UI |
| Maxine Snackliebhaber (P2) | Nicht direkt betroffen | Ist Mitarbeiterin, behält Guthaben-UI |
| Lucas Gesundheitsfan (P3) | Nicht direkt betroffen | Ist Mitarbeiter, behält Guthaben-UI |
| Alex Gelegenheitskäufer (P4) | Nicht direkt betroffen | Ist Mitarbeiter |
| Sarah Teamkapitän (P5) | Nicht direkt betroffen | Ist Mitarbeiterin |
| David Helferlein (P6) | Indirekt betroffen | Könnte als App-Helfer erklären müssen, warum Admin keine BalanceCard sieht |
| Emily Technikliebhaberin (P9) | Indirekt betroffen | Könnte technische Erwartung haben, Admin-UI vollständig zu sehen |
| Admin (implizit) | Direkt und zentral betroffen | Dashboard muss ohne Guthaben-UI klar und vollständig sein |

**Kernbefund:** FEAT-9 schützt vor allem die Mitarbeiter-Personas vor Verwirrung: Ein Admin, der eine Guthaben-Karte sieht, könnte Nutzer falsch beraten oder selbst Kauf-Flows initiieren, die technisch 403 liefern. Das wäre ein schwerer UX-Fehler.

---

### User Flows

#### Flow 1: Admin - Dashboard-Besuch (Hauptfall)

```
Akteur:   Admin (admin@demo.de)
Ziel:     Systemüberblick erhalten und Aktionen ausführen

1. Admin ruft /dashboard auf
2. Middleware prüft Authentifizierung (Cookie vorhanden)
3. Dashboard lädt - initFromCookie() ermittelt role = 'admin'
4. creditsStore.fetchBalance() wird NICHT aufgerufen (role-check)
   → Alternative: Kein API-Call an /api/credits/balance
5. productsStore.fetchProducts() lädt Produktkatalog
   (Admin sieht Produkte nur zur Information, kein Kauf möglich)
6. pageReady = true
7. Dashboard rendert OHNE BalanceCard
8. Stattdessen: AdminInfoBanner wird gezeigt
   → "Admin-Modus: Kein Guthaben-System aktiv"
   → Link zu Admin-Bereich prominent platziert
9. ProductGrid ist sichtbar (nur zur Übersicht)
10. Admin navigiert bei Bedarf zu /admin für Verwaltungsaufgaben
```

**Alternative Flows:**
- Admin klickt auf "Admin-Bereich"-Link im Header → /admin
- Admin klickt "Abmelden" → /login
- Admin versucht manuell /api/credits/balance → 403-Response

---

#### Flow 2: Admin - Transition zum Admin-Bereich

```
Akteur:   Admin
Ziel:     Von Dashboard zu Admin-Bereich wechseln

1. Admin sieht Dashboard ohne BalanceCard
2. AdminInfoBanner oder Header-Link "Admin-Bereich" ist prominent sichtbar
3. Admin klickt Link
4. Navigation zu /admin
5. Admin-Dashboard mit Statistiken und System-Aktionen
6. Kein Rückweg über BalanceCard nötig
```

---

#### Flow 3: Mitarbeiter-Dashboard (unveränderter Vergleichsfall)

```
Akteur:   Mitarbeiterin (z.B. Nina, Maxine)
Ziel:     Guthaben sehen und Snacks kaufen

1. Mitarbeiterin ruft /dashboard auf
2. Middleware: role = 'mitarbeiter'
3. creditsStore.fetchBalance() wird aufgerufen → Guthaben geladen
4. Dashboard rendert MIT BalanceCard (grün/gelb/rot je nach Stand)
5. Mitarbeiterin sieht Guthaben, Auflade-Buttons, Monatspauschale-Button
6. Normaler Kauf-Flow weiterhin verfügbar
```

---

### Wireframes (Text-basiert)

#### Wireframe A: Admin-Dashboard (FEAT-9 Zielzustand)

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ ┌─────────────────────────┐  ┌─────────────────────┐   │
│ │ Dashboard               │  │    [Abmelden]        │   │
│ │ Angemeldet als Admin    │  └─────────────────────┘   │
│ │ [admin] Badge           │                            │
│ └─────────────────────────┘                            │
├─────────────────────────────────────────────────────────┤
│ ADMIN-LINK (prominent, nicht nur Pfeil-Link)            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  [Zahnrad-Icon]  Zum Admin-Bereich                  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ ADMIN INFO BANNER (statt BalanceCard)                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  [Info-Icon]  Admin-Modus                           │ │
│ │  Admins haben kein persönliches Guthaben.           │ │
│ │  Das Guthaben-System gilt nur für Mitarbeiter.      │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ PRODUKT-KATALOG (zur Information, kein Kauf möglich)    │
│                                                         │
│ [Suchfeld]  [Filter: Alle | Obst | Protein | ...]      │
│                                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│ │ Produkt  │ │ Produkt  │ │ Produkt  │                 │
│ │  Karte   │ │  Karte   │ │  Karte   │                 │
│ │ (kein    │ │ (kein    │ │ (kein    │                 │
│ │  Kauf-   │ │  Kauf-   │ │  Kauf-   │                 │
│ │  Button) │ │  Button) │ │  Button) │                 │
│ └──────────┘ └──────────┘ └──────────┘                 │
│                                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│ │ Produkt  │ │ Produkt  │ │ Produkt  │                 │
│ │  Karte   │ │  Karte   │ │  Karte   │                 │
│ └──────────┘ └──────────┘ └──────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Entscheidung: AdminInfoBanner statt leerer Stelle**

Die Stelle, an der die BalanceCard war, wird nicht leer gelassen. Leere Flächen (Whitespace) ohne Inhalt verwirren Nutzer und signalisieren einen Fehler. Stattdessen erscheint ein AdminInfoBanner, der:
1. Kontext erklärt (Admin hat kein Guthaben - ist gewollt, kein Fehler)
2. Den Admin zur richtigen Seite leitet (/admin)

---

#### Wireframe B: AdminInfoBanner Detailansicht

```
┌─────────────────────────────────────────────────────────────────┐
│  [i]  Admin-Modus aktiv                                         │
│                                                                 │
│  Als Admin verfügst du über kein persönliches Guthaben-Konto.  │
│  Das Snack-Guthaben-System gilt ausschliesslich für             │
│  Mitarbeiter.                                                   │
│                                                                 │
│  [Zum Admin-Bereich →]                                          │
└─────────────────────────────────────────────────────────────────┘

Farbe:      Neutrales Blau (bg-blue-50, border-blue-200, text-blue-800)
            Kein Rot (kein Fehler-Signal)
            Kein Grau (kein Deaktiviert-Signal)
Icon:       SVG Info-Icon (kein Emoji)
CTA:        Sekundärer Button-Link zu /admin
Rand:       border-2, rounded-lg (konsistent mit BalanceCard)
```

---

#### Wireframe C: Mitarbeiter-Dashboard (Vergleich - unveraendert)

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ Dashboard | Mitarbeiterin Nina | [mitarbeiter] | Logout  │
├─────────────────────────────────────────────────────────┤
│ BALANCE CARD (grün: Guthaben gut)                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  Guthaben                           [Status-Dot]    │ │
│ │  25.50 €                                            │ │
│ │  [Guthaben aufladen]  [Monatspauschale +25€]       │ │
│ │  Zuletzt aufgeladen: 04.03.2026                     │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ PRODUKT-KATALOG (mit Kauf-Flow aktiv)                   │
│ [Filter] [Suche]                                        │
│ [Produkt] [Produkt] [Produkt]  ← klickbar, Kauf möglich │
└─────────────────────────────────────────────────────────┘
```

---

### Accessibility-Prüfung (WCAG 2.1 / ISO 9241 / EAA)

| Prüfpunkt | Status | Massnahme |
|-----------|--------|-----------|
| Farbkontrast AdminInfoBanner | Zu prüfen | bg-blue-50 + text-blue-800 = ca. 7.8:1 (Kontrast ausreichend, WCAG AA erfüllt) |
| Farbe nicht einziger Indikator | Anforderung | Info-Icon (SVG) zusätzlich zur Blaufärbung verwenden |
| Screen Reader - Rollen klar | Anforderung | role="status" oder role="region" + aria-label für AdminInfoBanner |
| Tastatur-Navigation | Anforderung | "Zum Admin-Bereich"-Button mit focus:ring-2 focus:ring-blue-500 |
| Keine Zeitlimits | Erfüllt | AdminInfoBanner ist statisch, kein Timeout |
| Fehlermeldungen verständlich | Erfüllt | Banner erklärt klar: kein Fehler, sondern Rollentrennung |
| Touch-Targets min. 44x44px | Anforderung | CTA-Button im Banner muss py-3 px-4 minimum haben |
| Tab-Reihenfolge logisch | Anforderung | Header → AdminLink → AdminInfoBanner-CTA → ProductGrid |
| Überschriften-Hierarchie | Anforderung | h1 "Dashboard" → keine weitere h2 im Banner nötig (Banner ist region) |
| Kein Leere-Fläche-Problem | Erfüllt | AdminInfoBanner verhindert layoutleere Stelle |
| Skip-Link zu Hauptinhalt | Empfehlung | Skip-Link zu ProductGrid für Tastaturnutzer |
| Bewegungsreduzierung | Anforderung | prefers-reduced-motion berücksichtigen, keine pulsierenden Animationen im Banner |

**Wichtige WCAG 2.1 Regel (aus UX-Skill):**
- Empty States: "Show helpful message and action" statt leerer Fläche (Severity: Medium)
- Color Only: Icon + Text im Banner, nicht nur Farbe (Severity: High)
- Focus States: `focus:ring-2 focus:ring-blue-500` auf CTA-Button

---

### Personas-Abdeckung

| Persona | Vorteil durch FEAT-9 | Nachteil ohne FEAT-9 |
|---------|---------------------|----------------------|
| Nina Neuanfang | Ihr Dashboard bleibt unveraendert (Guthaben sichtbar) | Verwirrung, wenn Admin ihr erklaert "ich sehe kein Guthaben" |
| Maxine Snackliebhaber | Kein Einfluss auf ihren Workflow | Kein Einfluss |
| Lucas Gesundheitsfan | Kein Einfluss auf seinen Workflow | Kein Einfluss |
| Admin (implizit) | Saubere, rollengerechte UI ohne BalanceCard | Sieht BalanceCard, versucht Funktionen, erhaelt 403-Fehler (schlechte UX) |
| David Helferlein | Kann Kollegen korrekt erklaeren: "Admin sieht das nicht, das ist gewollt" | Unklarheit bei der Unterstuetzung von Kollegen |

---

### UI-Empfehlungen

#### 1. AdminInfoBanner-Komponente (neu zu erstellen)

Die neue Komponente `AdminInfoBanner.vue` ersetzt die BalanceCard im Admin-Kontext.

**Eigenschaften:**
- Neutrale blaue Farbe (kein Fehler-Signal, kein Rot)
- SVG Info-Icon (kein Emoji)
- Erklaerungstext: Admin hat kein Guthaben, das ist gewollt
- CTA-Link zu /admin
- Identische Rahmen-Optik wie BalanceCard (rounded-lg, border-2, p-6)
- Konsistente Hoehenreservierung: verhindert Layout-Shift beim Laden

**Tailwind-Klassen (Referenz fuer Developer):**
```
bg-blue-50 border-2 border-blue-200 rounded-lg p-6
text-blue-800
focus:ring-2 focus:ring-blue-500 (fuer CTA-Button)
```

#### 2. Bedingte Render-Logik in dashboard.vue

Die BalanceCard soll nur fuer Mitarbeiter gerendert werden. Die Entscheidung erfolgt über `authStore.user?.role`:

```
IF role === 'admin':
  → AdminInfoBanner anzeigen
  → creditsStore.fetchBalance() NICHT aufrufen
ELSE:
  → BalanceCard anzeigen
  → creditsStore.fetchBalance() aufrufen
```

#### 3. Produkt-Grid bleibt sichtbar (Anpassung erforderlich)

Der Produktkatalog bleibt fuer Admin sichtbar, da Admin den Katalog verwaltungstechnisch kennen sollte. Jedoch:
- Kein Kaufen-Button im ProductDetailModal fuer Admin
- ProductDetailModal zeigt nur Produkt-Info (Name, Preis, Beschreibung)
- Alternativer Hinweis: "Kaufe als Mitarbeiter"

Dies ist eine Empfehlung. Alternativ kann Admin das ProductGrid auch vollstaendig ausgeblendet werden - dann wird der Platz ausschliesslich vom AdminInfoBanner + Link zu /admin gefuellt.

#### 4. Skeleton-Loading-Anpassung

Der bestehende Lade-Skeleton in dashboard.vue zeigt immer eine BalanceCard-Skeleton-Form. Dieser muss fuer Admin ebenfalls angepasst werden:
- IF role bereits bekannt bei Skeleton-Render: AdminInfoBanner-Skeleton zeigen
- Falls role noch nicht bekannt (Race Condition beim initFromCookie): generischer neutraler Skeleton ohne BalanceCard-Form

#### 5. Admin-Link-Behandlung im Header

Der aktuelle Admin-Link `→ Admin-Bereich` ist als kleiner Pfeil-Link gestaltet. Fuer Admin, der das Dashboard ausschliesslich als Sprungbrett zu /admin nutzt, sollte dieser Link prominenter sein:
- Primärer Button-Link statt Pfeil-Link
- Platzierung oberhalb des AdminInfoBanners
- SVG-Icon (Zahnrad oder Schild) statt Pfeil-Text

#### 6. No-Emoji-Regel (aus UX-Skill)

Laut ui-ux-pro-max Skill: "Use SVG icons, not emojis". Das aktuelle Admin-Dashboard in /admin/index.vue verwendet Emojis (Warnung-Icon in Modals). Das AdminInfoBanner muss SVG-Icons verwenden.

---

### Zusammenfassung: Was der Admin STATT der BalanceCard sieht

**Entscheidung: AdminInfoBanner**

Begründung:
1. Leere Fläche verwirrt (WCAG/UX Empty States Guideline: "Show helpful message and action")
2. Der Admin braucht Kontext: "Warum sehe ich keine Guthaben-Karte?" muss beantwortet sein
3. Die leere Stelle soll den Admin direkt zum richtigen Ziel (/admin) leiten
4. Visuell konsistent: gleiche Rahmenhöhe wie BalanceCard verhindert Layout-Shift

**Nicht empfohlen:**
- Komplett leerer Bereich (verwirrt, sieht wie Bug aus)
- Guthaben-Karte mit "Nicht verfügbar" (falsches Framing - kein Fehler, sondern Rollendesign)
- Nur Admin-Link im Header (zu wenig Erklärung für neuen Admin)

---

## Tech-Design (Solution Architect)

### Architektur-Analyse: Was bereits existiert

Vor dem Design wurde die bestehende Codebasis geprüft:

**Bestehende Components (src/components/dashboard/):**
- BalanceCard.vue - Guthaben-Anzeige mit Statusfarben und Aktions-Buttons
- ProductGrid.vue - Produktkatalog mit Suche und Kategorie-Filter
- ProductDetailModal.vue - Produkt-Detail-Ansicht
- RechargeModal.vue - Auflade-Formular

**Bestehende Pages:**
- src/pages/dashboard.vue - Orchestriert alle Dashboard-Components, hat bereits `showAdminLink` Computed Property
- src/pages/admin/index.vue - Admin-Bereich mit Statistiken und Reset-Funktionen

**Bestehende Stores:**
- authStore: Hat bereits `isAdmin` und `isMitarbeiter` Computed Properties
- creditsStore: Hat `fetchBalance()`, `recharge()`, `receiveMonthly()` - kein Rollen-Check vorhanden

**Bestehende API Routes (src/server/api/credits/):**
- balance.get.ts - kein Admin-Guard vorhanden
- recharge.post.ts - kein Admin-Guard vorhanden
- monthly.post.ts - kein Admin-Guard vorhanden

**Schlussfolgerung:** Die Rollen-Infrastruktur ist bereits vollstaendig vorhanden (`isAdmin`, `isMitarbeiter` im authStore). Es fehlen nur der Guard in den API-Routes und die bedingte Render-Logik im Dashboard.

---

### Component-Struktur

**Neue Komponente (wird erstellt):**
```
src/components/dashboard/AdminInfoBanner.vue
```
Zeigt dem Admin an Stelle der BalanceCard eine Informations-Meldung mit Link zum Admin-Bereich.

**Geaenderte Komponenten:**

```
dashboard.vue (Seite)
├── Header (unveraendert)
├── Admin-Link (besteht bereits, wird prominenter gestaltet)
├── [NEU] Bedingte Render-Logik:
│   ├── WENN role = 'admin':
│   │   └── AdminInfoBanner (NEU) - ersetzt BalanceCard
│   └── WENN role = 'mitarbeiter':
│       └── BalanceCard (unveraendert)
├── ProductGrid (unveraendert)
├── RechargeModal (nur fuer Mitarbeiter aufgerufen)
└── ProductDetailModal (unveraendert)
```

**AdminInfoBanner.vue (neue Komponente):**
```
AdminInfoBanner
├── SVG Info-Icon (kein Emoji)
├── Ueberschrift: "Admin-Modus aktiv"
├── Erklaerungstext: "Als Admin hast du kein persoenliches Guthaben-Konto."
└── CTA-Button: "Zum Admin-Bereich" → Link zu /admin
```

Visuell: Blaue Einfaerbung (bg-blue-50, border-blue-200), identische Hoehe und Rahmen-Optik wie BalanceCard, damit kein Layout-Shift entsteht.

---

### Daten-Model

**Keine neuen Tabellen notwendig.**

Die bestehende `user_credits` Tabelle bleibt unveraendert. Die Logik ist:

```
Tabelle user_credits:
- Enthaelt NUR Eintraege fuer Mitarbeiter (role = 'mitarbeiter')
- Admin-User (role = 'admin') haben KEINEN Eintrag in dieser Tabelle
- Kein "leerer Eintrag" fuer Admin - gar kein Eintrag

Konsequenz:
- Admin ruft /api/credits/balance auf → 403 statt DB-Lookup
- Admin hat niemals balance = 0 in der DB, sondern gar keinen Eintrag
```

Der Unterschied zwischen "kein Guthaben (0€)" und "kein Eintrag in der DB" ist semantisch wichtig: Admin hat kein Guthaben-Konto, kein Guthaben-Konzept - nicht 0€.

---

### Tech-Entscheidungen

**Entscheidung 1: Doppelter Schutz - Frontend UND API**

Warum beide Ebenen?

- Frontend-Check (dashboard.vue): Verhindert, dass `fetchBalance()` ueberhaupt aufgerufen wird. Kein unnoetige API-Requests.
- API-Guard (alle 3 Credits-Routes): Sicherheits-Backstop. Selbst wenn jemand die API direkt aufruft (z.B. via Browser-Dev-Tools oder curl), erhaelt Admin 403.

Nur Frontend-Check waere unsicher (leicht zu umgehen). Nur API-Guard wuerde zu unnoetigem Error-Handling im Frontend fuehren.

**Entscheidung 2: Rollen-Check in dashboard.vue ueber authStore.isAdmin**

Der `authStore` hat bereits eine fertige `isAdmin` Computed Property. Diese wird direkt genutzt - kein neuer State, kein neues Composable noetig. Das ist die einfachste und konsistenteste Loesung.

**Entscheidung 3: Kein separates Admin-Layout**

Ein komplett separates Layout fuer Admin-Dashboard waere Overengineering. Stattdessen wird die bestehende `dashboard.vue` mit bedingter Render-Logik erweitert. Das spart eine neue Page und haelt die Codebasis schlanker.

**Entscheidung 4: AdminInfoBanner als neue Komponente, nicht als Inline-Template**

Der Banner ist eine eigenstaendige UI-Einheit mit eigenem Styling und Verhalten (SVG-Icon, CTA-Link, Accessibility-Attribute). Als separate Komponente ist er testbar, wiederverwendbar und haelt dashboard.vue uebersichtlich.

**Entscheidung 5: Skeleton-Loading ohne Admin-Unterscheidung**

Waehrend des Ladens ist die Rolle noch nicht bekannt (initFromCookie() laeuft noch). Der Skeleton zeigt einen neutralen Platzhalter - kein BalanceCard-Skeleton. Nach dem Laden (`pageReady = true`) entscheidet die Rolle, was gerendert wird.

---

### Dependencies

**Keine neuen Packages notwendig.**

Alle benoetigen Bausteine sind bereits vorhanden:
- Rollen-Pruefung: authStore.isAdmin (existiert)
- Styling: Tailwind CSS (existiert)
- Navigation: NuxtLink (existiert)
- SVG-Icons: Inline-SVG, wie in bestehenden Components verwendet

---

### Betroffene Dateien (Uebersicht fuer Developer)

**Neue Datei:**
- src/components/dashboard/AdminInfoBanner.vue

**Geaenderte Dateien:**
- src/pages/dashboard.vue (bedingte Render-Logik: AdminInfoBanner vs. BalanceCard)
- src/server/api/credits/balance.get.ts (403-Guard fuer Admin)
- src/server/api/credits/recharge.post.ts (403-Guard fuer Admin)
- src/server/api/credits/monthly.post.ts (403-Guard fuer Admin)

**Unveraenderte Dateien:**
- src/components/dashboard/BalanceCard.vue (keinerlei Aenderungen)
- src/stores/auth.ts (isAdmin existiert bereits)
- src/stores/credits.ts (fetchBalance wird nur aufgerufen wenn Mitarbeiter)
- src/pages/admin/index.vue (keinerlei Aenderungen)

---

### Test-Anforderungen

**Unit-Tests (Vitest):**

Zu testende Einheiten:
1. authStore - `isAdmin` Computed Property
   - Test: User mit role='admin' → isAdmin = true
   - Test: User mit role='mitarbeiter' → isAdmin = false
   - Test: kein User (null) → isAdmin = false
   - Pfad: tests/stores/auth.test.ts (bereits vorhanden, erweitern)

2. creditsStore - Verhalten bei 403-Response
   - Test: fetchBalance() bei 403-Response → error wird gesetzt, balance bleibt '0'
   - Pfad: tests/stores/credits.test.ts (bereits vorhanden, erweitern)

3. AdminInfoBanner - Komponenten-Test
   - Test: Komponente rendert korrekt (SVG-Icon sichtbar, Text vorhanden, Link zu /admin)
   - Test: aria-Attribute vorhanden (Accessibility)
   - Pfad: tests/components/dashboard/AdminInfoBanner.test.ts (neu)

**E2E-Tests (Playwright):**

Kritische User-Flows:
1. Admin-Dashboard: Admin loggt sich ein → Dashboard zeigt AdminInfoBanner, keine BalanceCard
2. Admin-Dashboard: Admin-Link "Zum Admin-Bereich" navigiert korrekt zu /admin
3. Mitarbeiter-Dashboard: Mitarbeiter loggt sich ein → Dashboard zeigt BalanceCard (Regression-Test)
4. API-Guard: Direkter Aufruf /api/credits/balance als Admin → 403-Response

Test-Pfad: tests/e2e/admin-ohne-guthaben.spec.ts (neu)

**Coverage-Ziel:** 80%+ fuer neue Logik (AdminInfoBanner, bedingte Render-Logik in dashboard.vue)

---

## QA Testergebnis

**Getestet:** 2026-03-04
**Tester:** QA Engineer

### Status: ❌ NICHT IMPLEMENTIERT

Dieses Feature wurde noch nicht implementiert. Der Status "Ready for Solution Architect" bedeutet, dass weder Solution Architect noch Developer dieses Feature bearbeitet haben.

### Offene Bugs

| Bug-ID | Titel | Severity | Priority | Status |
|--------|-------|----------|----------|--------|
| BUG-FEAT9-001 | FEAT-9 nicht implementiert - Admin sieht Guthaben-UI | Critical | Must Fix | Offen |

### Acceptance Criteria Status

| AC | Status | Notes |
|----|--------|-------|
| AC-1: Admin hat KEINEN Eintrag in user_credits | ❌ | Nicht gepruft / nicht implementiert |
| AC-2: API /api/credits/balance gibt 403 fur Admin | ❌ | Kein Admin-Check in balance.get.ts |
| AC-3: API /api/credits/recharge gibt 403 fur Admin | ❌ | Kein Admin-Check in recharge.post.ts |
| AC-4: API /api/credits/monthly gibt 403 fur Admin | ❌ | Kein Admin-Check in monthly.post.ts |
| AC-5: Admin-Dashboard zeigt KEINE Guthaben-Karte | ❌ | BalanceCard ohne v-if-Guard in dashboard.vue |
| AC-6: Mitarbeiter haben weiterhin Guthaben | ✅ | Mitarbeiter-Guthaben funktioniert |

### Production-Ready

**❌ NOT Ready - Critical Bug BUG-FEAT9-001 muss zuerst behoben werden**
