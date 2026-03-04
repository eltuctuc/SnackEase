# Test-Analyse: Fehlende Tests für SnackEase

**Stand:** 2026-03-04  
**Analysiert durch:** QA Engineer Agent

---

## Zusammenfassung

**Aktueller Stand:**
- ✅ 6 Test-Dateien vorhanden
- ✅ 55 Tests passing (61 gesamt, 6 skipped)
- ❌ 3 Store-Tests fehlschlagend (defineStore-Mock fehlt)
- ✅ Coverage-Tool installiert (@vitest/coverage-v8)
- ✅ Playwright installiert (v1.58.2)
- ❌ Keine Component-Tests
- ❌ Keine API-Route-Tests
- ✅ E2E-Test-Setup vorhanden (Playwright)

**Kritische Probleme:**
1. Store-Tests schlagen fehl → defineStore muss gemockt werden
2. Keine Component-Tests für 4 Dashboard-Komponenten
3. Keine Server-API-Tests für 14 API-Routen
4. Composable `useLocalStorage` hat keine Tests

---

## 1. KRITISCH: Store-Tests reparieren

### Problem
Alle Store-Tests schlagen fehl mit:
```
ReferenceError: defineStore is not defined
```

### Ursache
`defineStore` von Pinia wird nicht korrekt gemockt in der Vitest-Konfiguration.

### Lösung
**Datei:** `vitest.config.ts` oder Test-Setup-File erstellen

```typescript
// tests/setup.ts
import { vi } from 'vitest'
import { defineStore } from 'pinia'

// Mock Pinia's defineStore
global.defineStore = defineStore
```

**Oder in vitest.config.ts:**
```typescript
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'], // <-- Hinzufügen
    // ...
  }
})
```

### Priorität
**CRITICAL** - Muss sofort gefixt werden, sonst sind 3 Test-Suites defekt!

### Betroffene Dateien
- `tests/stores/auth.test.ts` (250 Zeilen, 9 Test-Suites)
- `tests/stores/credits.test.ts` (259 Zeilen, 9 Test-Suites)
- `tests/stores/products.test.ts` (220 Zeilen, 8 Test-Suites)

---

## 2. Fehlende Tests für Composables

### ✅ Bereits getestet
- `useFormatter.test.ts` - ✅ 19 Tests (Währung, Datum, Status)
- `useModal.test.ts` - ✅ 20 Tests (Modal-Verwaltung)
- `useSearch.test.ts` - ✅ 22 Tests (6 skipped)

### ❌ Fehlende Tests

#### `useLocalStorage.test.ts`
**Priorität:** HIGH  
**Grund:** Kritisches Composable für Daten-Persistierung

**Zu testen:**
- `lastSearchQuery` - Persistiert Suchbegriff
- `lastSelectedCategory` - Persistiert Kategorie-Auswahl
- `recentProducts` - Array von letzten Produkt-IDs
- `addRecentProduct(id)` - Fügt Produkt hinzu (max 10, keine Duplikate)
- `clearAll()` - Löscht alle Storage-Daten
- VueUse Integration - SSR-Safe, reaktive Updates

**Geschätzter Aufwand:** 2-3 Stunden  
**Test-Cases:** ~15-20 Tests

**Test-Struktur:**
```typescript
describe('useLocalStorage', () => {
  describe('Initial State', () => {
    it('startet mit Default-Werten')
  })
  
  describe('lastSearchQuery', () => {
    it('speichert Suchbegriff')
    it('lädt gespeicherten Suchbegriff')
  })
  
  describe('lastSelectedCategory', () => {
    it('speichert Kategorie')
    it('default ist "alle"')
  })
  
  describe('recentProducts', () => {
    it('fügt Produkt hinzu')
    it('entfernt Duplikate')
    it('limitiert auf max 10')
    it('neueste zuerst')
  })
  
  describe('clearAll', () => {
    it('setzt alle Werte zurück')
  })
  
  describe('VueUse Integration', () => {
    it('ist SSR-safe')
    it('synchronisiert zwischen Tabs')
  })
})
```

---

## 3. Fehlende Tests für Vue-Komponenten

### Dashboard-Komponenten (4 Komponenten - KEINE Tests!)

**Priorität:** HIGH  
**Grund:** Kritische User-Facing-Komponenten ohne Tests

#### 3.1 `BalanceCard.vue` Test
**Datei:** `tests/components/BalanceCard.test.ts`

**Zu testen:**
- Guthaben-Anzeige (formatiert als Währung)
- Status-Badge (good/warning/critical)
- "Aufladen"-Button (nur für Mitarbeiter sichtbar)
- "Monatspauschale"-Button (nur für Mitarbeiter)
- Integration mit Credits-Store
- Loading-State
- Error-Handling

**Geschätzter Aufwand:** 3-4 Stunden  
**Test-Cases:** ~12-15 Tests

---

#### 3.2 `ProductGrid.vue` Test
**Datei:** `tests/components/ProductGrid.test.ts`

**Zu testen:**
- Produktliste (Grid-Layout)
- Kategorie-Filter
- Suchfeld Integration
- Produkt-Karte Click → Modal öffnen
- Empty-State (keine Produkte gefunden)
- Loading-State
- Responsive-Layout (Grid-Columns)
- Integration mit Products-Store

**Geschätzter Aufwand:** 4-5 Stunden  
**Test-Cases:** ~15-18 Tests

---

#### 3.3 `ProductDetailModal.vue` Test
**Datei:** `tests/components/ProductDetailModal.test.ts`

**Zu testen:**
- Modal-Anzeige (öffnen/schließen)
- Produkt-Details (Name, Preis, Beschreibung)
- Bild-Anzeige
- "Kaufen"-Button (nur wenn verfügbar)
- Verfügbarkeits-Status
- Schließen via X-Button
- Schließen via Backdrop-Click
- Integration mit Modal-Store

**Geschätzter Aufwand:** 3-4 Stunden  
**Test-Cases:** ~12-14 Tests

---

#### 3.4 `RechargeModal.vue` Test
**Datei:** `tests/components/RechargeModal.test.ts`

**Zu testen:**
- Modal-Anzeige
- Betrags-Eingabe (Validierung)
- "Aufladen"-Button (enabled/disabled)
- Erfolgs-Meldung
- Fehler-Meldung
- Integration mit Credits-Store
- Loading-State während API-Call
- Schließen nach erfolgreicher Aufladung

**Geschätzter Aufwand:** 3-4 Stunden  
**Test-Cases:** ~12-15 Tests

**Gesamt Komponenten-Tests:**
- 4 Komponenten
- ~50-60 Test-Cases
- ~13-17 Stunden Aufwand

---

## 4. Fehlende Tests für Server-API-Routen

**Priorität:** MEDIUM-HIGH  
**Grund:** Backend-Logik sollte getestet sein

### API-Routen (14 Routen - KEINE Tests!)

#### 4.1 Auth-Routen
**Dateien:**
- `src/server/api/auth/login.post.ts`
- `src/server/api/auth/logout.post.ts`
- `src/server/api/auth/me.get.ts`

**Test-Datei:** `tests/server/api/auth.test.ts`

**Zu testen:**
- Login mit validen Credentials → 200, Cookie gesetzt
- Login mit invaliden Credentials → 401
- Logout → Cookie gelöscht
- `me` ohne Session → 401
- `me` mit Session → 200, User-Daten

**Geschätzter Aufwand:** 3-4 Stunden  
**Test-Cases:** ~10-12 Tests

---

#### 4.2 Credits-Routen
**Dateien:**
- `src/server/api/credits/balance.get.ts`
- `src/server/api/credits/recharge.post.ts`
- `src/server/api/credits/monthly.post.ts`

**Test-Datei:** `tests/server/api/credits.test.ts`

**Zu testen:**
- Balance abrufen (mit/ohne Session)
- Recharge mit gültigem Betrag
- Recharge mit ungültigem Betrag (Validierung)
- Monatspauschale buchen
- Monatspauschale bereits gebucht → Fehler

**Geschätzter Aufwand:** 3-4 Stunden  
**Test-Cases:** ~10-12 Tests

---

#### 4.3 Products-Routen
**Dateien:**
- `src/server/api/products/index.get.ts`
- `src/server/api/products/[id]/index.get.ts`

**Test-Datei:** `tests/server/api/products.test.ts`

**Zu testen:**
- Alle Produkte laden
- Produkte nach Kategorie filtern
- Produkte nach Suchbegriff filtern
- Kombinierter Filter (Kategorie + Suche)
- Einzelnes Produkt nach ID
- Nicht-existierende ID → 404

**Geschätzter Aufwand:** 2-3 Stunden  
**Test-Cases:** ~8-10 Tests

---

#### 4.4 Admin-Routen
**Dateien:**
- `src/server/api/admin/stats.get.ts`
- `src/server/api/admin/reset.post.ts`
- `src/server/api/admin/users/index.get.ts`
- `src/server/api/admin/users/index.post.ts`
- `src/server/api/admin/users/[id]/toggle.post.ts`
- `src/server/api/admin/credits/reset.post.ts`

**Test-Datei:** `tests/server/api/admin.test.ts`

**Zu testen:**
- **Authorization:** Alle Routes nur für Admin
- Stats abrufen
- System-Reset
- Nutzer-Liste abrufen
- Neuen Nutzer erstellen (Validierung)
- Nutzer aktivieren/deaktivieren
- Credits zurücksetzen

**Geschätzter Aufwand:** 4-5 Stunden  
**Test-Cases:** ~15-18 Tests

**Gesamt API-Tests:**
- 14 API-Routen
- ~43-52 Test-Cases
- ~12-16 Stunden Aufwand

---

## 5. Fehlende Tests für Pages

**Priorität:** MEDIUM  
**Grund:** Pages sind Integration-Tests zwischen Komponenten

### Pages (5 Pages - KEINE Tests!)

#### 5.1 `pages/dashboard.vue` Test
**Datei:** `tests/pages/dashboard.test.ts`

**Zu testen:**
- Page rendert
- BalanceCard wird angezeigt
- ProductGrid wird angezeigt
- Integration: Produktkatalog lädt beim Mount
- Integration: Guthaben lädt beim Mount
- Auth-Check (nur für eingeloggte User)

**Geschätzter Aufwand:** 2-3 Stunden  
**Test-Cases:** ~8-10 Tests

---

#### 5.2 `pages/login.vue` Test
**Datei:** `tests/pages/login.test.ts`

**Zu testen:**
- Page rendert
- User-Switcher wird angezeigt
- Login-Formular (Admin)
- Persona-Auswahl (Mitarbeiter)
- Redirect nach Login → /dashboard

**Geschätzter Aufwand:** 2-3 Stunden  
**Test-Cases:** ~8-10 Tests

---

#### 5.3 Admin-Pages
**Dateien:**
- `pages/admin/index.vue`
- `pages/admin/users.vue`

**Test-Datei:** `tests/pages/admin.test.ts`

**Zu testen:**
- Admin-Dashboard rendert
- Stats werden angezeigt
- System-Reset-Button
- Nutzer-Verwaltung rendert
- Nutzer-Liste
- Neuen Nutzer erstellen

**Geschätzter Aufwand:** 3-4 Stunden  
**Test-Cases:** ~10-12 Tests

**Gesamt Page-Tests:**
- 5 Pages
- ~26-32 Test-Cases
- ~7-10 Stunden Aufwand

---

## 6. Fehlende E2E-Tests (Optional)

**Priorität:** LOW  
**Grund:** Unit- und Integration-Tests haben Vorrang

### E2E-Szenarien mit Playwright

#### 6.1 User-Flow: Login → Produktkatalog → Kauf
**Datei:** `tests/e2e/user-flow.spec.ts`

**Zu testen:**
- User wählt Persona
- Dashboard lädt
- Produktkatalog wird angezeigt
- User sucht Produkt
- User öffnet Produkt-Detail
- User kauft Produkt
- Guthaben wird abgezogen

**Geschätzter Aufwand:** 4-5 Stunden

---

#### 6.2 Admin-Flow: System-Reset → Nutzer-Verwaltung
**Datei:** `tests/e2e/admin-flow.spec.ts`

**Zu testen:**
- Admin-Login
- Admin-Dashboard
- System-Reset
- Nutzer-Verwaltung
- Neuen Nutzer erstellen

**Geschätzter Aufwand:** 3-4 Stunden

**Gesamt E2E-Tests:**
- 2 E2E-Flows
- ~7-9 Stunden Aufwand

---

## 7. Test-Infrastruktur-Verbesserungen

### 7.1 Coverage-Tool installieren
**Priorität:** HIGH

```bash
npm install -D @vitest/coverage-v8
```

**Ziel:** >80% Coverage

---

### 7.2 Test-Setup verbessern
**Priorität:** HIGH

**Datei:** `tests/setup.ts`

```typescript
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { defineStore } from 'pinia'

// Global Mocks
global.$fetch = vi.fn()
global.defineStore = defineStore

// Vue Test Utils Config
config.global.stubs = {
  NuxtLink: true,
  ClientOnly: true,
}
```

---

### 7.3 Test-Utilities erstellen
**Priorität:** MEDIUM

**Datei:** `tests/utils/test-utils.ts`

```typescript
// Mock-Factories für User, Product, etc.
export const createMockUser = (overrides = {}) => ({ ... })
export const createMockProduct = (overrides = {}) => ({ ... })
```

---

## Gesamt-Übersicht

| Kategorie | Dateien | Tests (geschätzt) | Aufwand (Std.) | Priorität |
|-----------|---------|-------------------|----------------|-----------|
| **KRITISCH: Store-Fix** | 1 Setup-File | - | 0.5 | CRITICAL |
| **Composables** | 1 | 15-20 | 2-3 | HIGH |
| **Components** | 4 | 50-60 | 13-17 | HIGH |
| **API-Routen** | 4 Test-Files | 43-52 | 12-16 | MEDIUM-HIGH |
| **Pages** | 3 Test-Files | 26-32 | 7-10 | MEDIUM |
| **E2E** | 2 | - | 7-9 | LOW |
| **Infrastruktur** | 2 | - | 1-2 | HIGH |
| **GESAMT** | **17 Dateien** | **134-164 Tests** | **43-58 Std.** | - |

---

## Empfohlene Reihenfolge

### Phase 1: KRITISCH (Woche 1)
1. ✅ **Store-Test-Fix** - defineStore mocken (0.5 Std.)
2. ✅ **Coverage-Tool** installieren (0.5 Std.)
3. ✅ **Test-Setup** verbessern (1 Std.)
4. ✅ **useLocalStorage Tests** (2-3 Std.)

**Gesamt Phase 1:** 4-5 Stunden

### Phase 2: HIGH (Woche 2-3)
5. ✅ **Component-Tests** - Alle 4 Dashboard-Komponenten (13-17 Std.)

**Gesamt Phase 2:** 13-17 Stunden

### Phase 3: MEDIUM (Woche 4-5)
6. ✅ **API-Route-Tests** - Auth, Credits, Products, Admin (12-16 Std.)
7. ✅ **Page-Tests** - Dashboard, Login, Admin (7-10 Std.)

**Gesamt Phase 3:** 19-26 Stunden

### Phase 4: OPTIONAL (Woche 6+)
8. ✅ **E2E-Tests** - User-Flow, Admin-Flow (7-9 Std.)

---

## Sofortige Maßnahmen

### 1. Store-Tests reparieren (JETZT!)
```bash
# Erstelle Setup-File
touch tests/setup.ts
```

### 2. Coverage-Tool installieren
```bash
npm install -D @vitest/coverage-v8
```

### 3. Test-Run prüfen
```bash
npm test -- --run
npm run test:coverage
```

---

## Fazit

**Aktueller Test-Status:** ⚠️ **UNGENÜGEND**

**Kritische Lücken:**
- ❌ Store-Tests schlagen fehl
- ❌ Keine Component-Tests
- ❌ Keine API-Tests
- ❌ Keine Page-Tests

**Ziel:**
- ✅ Alle Store-Tests grün
- ✅ >80% Code-Coverage
- ✅ Alle kritischen Komponenten getestet
- ✅ Alle API-Routen getestet

**Geschätzter Aufwand:** ~43-58 Stunden (1-2 Sprint-Wochen)

---

**Nächste Schritte:**
1. Store-Test-Fix implementieren
2. Coverage-Tool installieren
3. useLocalStorage Tests schreiben
4. Component-Tests priorisieren

**Verantwortlich:** Development Team  
**Review durch:** QA Engineer
