# E2E-Tests mit Playwright

Diese Verzeichnis enthält End-to-End-Tests für SnackEase.

## Installation

Playwright wurde bereits installiert. Falls du weitere Browser benötigst:

```bash
# Alle Browser installieren
npx playwright install

# Nur spezifische Browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## Tests ausführen

```bash
# Alle E2E-Tests ausführen
npm run test:e2e

# Tests im UI-Modus (interaktiv)
npm run test:e2e:ui

# Test-Report anzeigen
npm run test:e2e:report

# Nur bestimmte Tests
npx playwright test example.spec.ts

# Im Debug-Modus
npx playwright test --debug

# Mit spezifischem Browser
npx playwright test --project=chromium
npx playwright test --project=firefox
```

## Test-Struktur

```
tests/e2e/
├── example.spec.ts         # Beispiel-Tests (löschen wenn nicht benötigt)
├── user-flow.spec.ts       # TODO: User-Flow (Login → Kauf)
└── admin-flow.spec.ts      # TODO: Admin-Flow (System-Reset, etc.)
```

## Test schreiben

### Beispiel: Login-Test

```typescript
import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('User kann sich als Mitarbeiter einloggen', async ({ page }) => {
    // Navigiere zur Login-Seite
    await page.goto('/login')
    
    // Wähle Persona
    await page.click('[data-testid="persona-card-mitarbeiter"]')
    
    // Prüfe Redirect zu Dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Prüfe ob Dashboard geladen wurde
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})
```

## Best Practices

1. **data-testid verwenden** - Füge `data-testid` zu wichtigen Elementen hinzu:
   ```vue
   <button data-testid="buy-button">Kaufen</button>
   ```

2. **Wait for Netzwerk** - Warte auf API-Calls:
   ```typescript
   await page.waitForResponse('/api/products')
   ```

3. **Screenshots bei Fehlern** - Werden automatisch erstellt

4. **Traces bei Fehlern** - Werden automatisch erstellt (siehe `playwright-report/`)

## Konfiguration

Die Konfiguration befindet sich in `playwright.config.ts`:
- **Timeout:** 30 Sekunden pro Test
- **Retries:** 2x bei CI, 0x lokal
- **Browser:** Chromium (kann erweitert werden)
- **Webserver:** Startet automatisch `npm run dev`

## CI/CD Integration

Playwright läuft automatisch in CI:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: npm run test:e2e
```

## Troubleshooting

### Tests schlagen fehl

1. **Dev-Server läuft nicht:**
   ```bash
   npm run dev
   ```

2. **Browser nicht installiert:**
   ```bash
   npx playwright install chromium
   ```

3. **Port 3000 belegt:**
   - Ändere Port in `playwright.config.ts`

### Debug-Modus

```bash
# Mit Inspector
npx playwright test --debug

# Mit UI-Modus
npm run test:e2e:ui

# Trace anzeigen
npx playwright show-trace trace.zip
```

## Weitere Ressourcen

- [Playwright Dokumentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
