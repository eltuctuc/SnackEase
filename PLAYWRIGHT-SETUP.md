# Playwright E2E-Tests - Setup-Dokumentation

**Status:** ✅ Erfolgreich installiert  
**Version:** Playwright v1.58.2  
**Datum:** 2026-03-04

---

## Was wurde installiert?

### 1. NPM-Pakete
```bash
npm install -D @playwright/test @playwright/experimental-ct-vue
```

**Installierte Pakete:**
- `@playwright/test` - Playwright Test Framework
- `@playwright/experimental-ct-vue` - Vue Component Testing

### 2. Browser
```bash
npx playwright install chromium
```

**Installierte Browser:**
- Chromium (Chrome for Testing 145.0.7632.6)
- FFmpeg (für Video-Aufnahmen)
- Chrome Headless Shell (für CI/CD)

---

## Dateien erstellt

### 1. Playwright-Konfiguration
**Datei:** `playwright.config.ts`

**Features:**
- Test-Verzeichnis: `tests/e2e/`
- Timeout: 30 Sekunden pro Test
- Parallele Tests aktiviert
- Webserver startet automatisch (`npm run dev`)
- Base URL: `http://localhost:3000`
- Screenshots bei Fehlern
- Traces bei Fehlern
- Browser: Chromium (Desktop Chrome)

### 2. Beispiel-Test
**Datei:** `tests/e2e/example.spec.ts`

**Enthält:**
- Homepage-Test
- Login-Flow-Test (als Template)

### 3. Dokumentation
**Datei:** `tests/e2e/README.md`

**Themen:**
- Installation
- Test-Ausführung
- Test-Struktur
- Best Practices
- Troubleshooting

### 4. NPM Scripts
**Aktualisierte Datei:** `package.json`

**Neue Scripts:**
```json
"test:e2e": "playwright test"           // Tests ausführen
"test:e2e:ui": "playwright test --ui"   // UI-Modus (interaktiv)
"test:e2e:report": "playwright show-report" // Report anzeigen
```

### 5. .gitignore
**Aktualisiert:** `.gitignore`

**Neue Einträge:**
```
# Test Coverage
coverage/

# Playwright
test-results/
playwright-report/
playwright/.cache/
```

---

## Tests ausführen

### Basis-Befehle
```bash
# Alle E2E-Tests
npm run test:e2e

# Im UI-Modus (empfohlen für Entwicklung)
npm run test:e2e:ui

# Mit Report anzeigen
npm run test:e2e:report

# Nur bestimmte Tests
npx playwright test example.spec.ts

# Im Debug-Modus
npx playwright test --debug
```

### Erweiterte Befehle
```bash
# Nur Chromium
npx playwright test --project=chromium

# Mit spezifischer URL
npx playwright test --base-url=http://localhost:4000

# Headed (mit Browser-Fenster)
npx playwright test --headed

# Nur fehlgeschlagene Tests
npx playwright test --last-failed
```

---

## Nächste Schritte

### 1. Erste Tests schreiben (JETZT)

Erstelle Tests für die wichtigsten User-Flows:

#### **User-Flow: Login → Produktkatalog → Kauf**
**Datei:** `tests/e2e/user-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('User-Flow: Mitarbeiter kauft Produkt', () => {
  test('Kompletter Kauf-Workflow', async ({ page }) => {
    // 1. Login
    await page.goto('/login')
    await page.click('[data-testid="persona-mitarbeiter"]')
    
    // 2. Dashboard prüfen
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // 3. Produkt suchen
    await page.fill('[data-testid="search-input"]', 'Apfel')
    await page.waitForResponse('/api/products*')
    
    // 4. Produkt öffnen
    await page.click('[data-testid="product-card"]:first-child')
    await expect(page.locator('[data-testid="product-modal"]')).toBeVisible()
    
    // 5. Produkt kaufen
    const balanceBefore = await page.locator('[data-testid="balance"]').textContent()
    await page.click('[data-testid="buy-button"]')
    await page.waitForResponse('/api/purchase')
    
    // 6. Guthaben prüfen
    const balanceAfter = await page.locator('[data-testid="balance"]').textContent()
    expect(balanceAfter).not.toBe(balanceBefore)
  })
})
```

#### **Admin-Flow: System-Reset → Nutzer-Verwaltung**
**Datei:** `tests/e2e/admin-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Admin-Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Admin-Login
    await page.goto('/login')
    await page.fill('[data-testid="admin-email"]', 'admin@snackease.de')
    await page.fill('[data-testid="admin-password"]', 'password')
    await page.click('[data-testid="login-button"]')
    
    await expect(page).toHaveURL('/admin')
  })
  
  test('System-Reset funktioniert', async ({ page }) => {
    // System-Reset-Button klicken
    await page.click('[data-testid="system-reset-button"]')
    
    // Bestätigung
    await page.click('[data-testid="confirm-reset"]')
    await page.waitForResponse('/api/admin/reset')
    
    // Erfolg-Meldung prüfen
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })
  
  test('Neuen Nutzer erstellen', async ({ page }) => {
    // Zu Nutzer-Verwaltung
    await page.click('[data-testid="users-link"]')
    await expect(page).toHaveURL('/admin/users')
    
    // Formular ausfüllen
    await page.click('[data-testid="add-user-button"]')
    await page.fill('[data-testid="user-email"]', 'neu@snackease.de')
    await page.fill('[data-testid="user-name"]', 'Neuer Nutzer')
    await page.selectOption('[data-testid="user-location"]', 'Berlin')
    
    // Absenden
    await page.click('[data-testid="submit-user"]')
    await page.waitForResponse('/api/admin/users')
    
    // Nutzer in Liste prüfen
    await expect(page.locator('text=neu@snackease.de')).toBeVisible()
  })
})
```

### 2. data-testid zu Komponenten hinzufügen

Füge `data-testid`-Attribute zu wichtigen Elementen hinzu:

**Beispiele:**
```vue
<!-- Login-Seite -->
<button data-testid="persona-mitarbeiter">Mitarbeiter</button>
<input data-testid="admin-email" />
<input data-testid="admin-password" />
<button data-testid="login-button">Anmelden</button>

<!-- Dashboard -->
<input data-testid="search-input" />
<div data-testid="product-card">...</div>
<div data-testid="balance">25,00 €</div>

<!-- Modals -->
<div data-testid="product-modal">...</div>
<button data-testid="buy-button">Kaufen</button>

<!-- Admin -->
<button data-testid="system-reset-button">Reset</button>
<button data-testid="add-user-button">Neuer Nutzer</button>
```

### 3. CI/CD Integration (später)

Wenn bereit für CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Vorteile von Playwright

### 1. **Auto-Wait**
Playwright wartet automatisch auf Elemente:
```typescript
// Kein manuelles waitFor nötig!
await page.click('button') // Wartet bis Button klickbar ist
```

### 2. **Cross-Browser**
Teste in Chrome, Firefox, Safari (Webkit):
```typescript
npx playwright test --project=firefox
```

### 3. **Trace Viewer**
Detaillierte Traces bei Fehlern:
```typescript
npx playwright show-trace trace.zip
```

### 4. **Codegen**
Generiere Tests automatisch:
```bash
npx playwright codegen http://localhost:3000
```

### 5. **UI-Modus**
Interaktiver Test-Runner:
```bash
npm run test:e2e:ui
```

---

## Best Practices

### 1. **Selektoren**
```typescript
// ✅ GUT - data-testid
await page.click('[data-testid="buy-button"]')

// ⚠️ OK - Text-Selektor
await page.click('text=Kaufen')

// ❌ SCHLECHT - CSS-Klassen (ändern sich oft)
await page.click('.btn-primary')
```

### 2. **API-Calls abwarten**
```typescript
// Warte auf API-Response
await page.waitForResponse('/api/products')

// Oder mehrere
await Promise.all([
  page.waitForResponse('/api/products'),
  page.waitForResponse('/api/credits/balance')
])
```

### 3. **Test-Isolation**
```typescript
// Jeder Test sollte unabhängig sein
test.beforeEach(async ({ page }) => {
  // Login für jeden Test
  await page.goto('/login')
  await page.click('[data-testid="persona-mitarbeiter"]')
})
```

### 4. **Page Objects** (für komplexe Tests)
```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.fill('[data-testid="admin-email"]', email)
    await this.page.fill('[data-testid="admin-password"]', password)
    await this.page.click('[data-testid="login-button"]')
  }
}

// Im Test verwenden
const loginPage = new LoginPage(page)
await loginPage.login('admin@snackease.de', 'password')
```

---

## Troubleshooting

### Problem: Tests schlagen fehl wegen Timeout

**Lösung:**
```typescript
// Timeout erhöhen
test('langsamer Test', async ({ page }) => {
  test.setTimeout(60000) // 60 Sekunden
  // ...
})
```

### Problem: Dev-Server läuft nicht

**Lösung:**
```bash
# Manuell starten
npm run dev

# Oder in playwright.config.ts anpassen
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: true, // <-- Verwende bestehenden Server
}
```

### Problem: Browser nicht gefunden

**Lösung:**
```bash
npx playwright install chromium
```

---

## Weitere Ressourcen

- [Playwright Dokumentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Codegen Tool](https://playwright.dev/docs/codegen)

---

## Zusammenfassung

✅ **Was funktioniert:**
- Playwright v1.58.2 installiert
- Chromium-Browser installiert
- Konfiguration erstellt
- Beispiel-Test vorhanden
- NPM-Scripts hinzugefügt
- Dokumentation erstellt

🎯 **Nächste Schritte:**
1. `data-testid` zu Vue-Komponenten hinzufügen
2. User-Flow-Tests schreiben (`tests/e2e/user-flow.spec.ts`)
3. Admin-Flow-Tests schreiben (`tests/e2e/admin-flow.spec.ts`)
4. Tests lokal ausführen: `npm run test:e2e:ui`

📖 **Siehe auch:**
- `tests/e2e/README.md` - Detaillierte Test-Anleitung
- `tests/TEST-ANALYSIS.md` - Gesamt-Test-Übersicht
- `playwright.config.ts` - Konfiguration

---

**Viel Erfolg beim Testen! 🚀**
