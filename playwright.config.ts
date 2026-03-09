import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright-Konfiguration für SnackEase E2E-Tests
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test-Verzeichnis
  testDir: './tests/e2e',
  
  // Maximale Test-Zeit pro Test
  timeout: 30 * 1000,
  
  // Parallele Tests aktivieren
  fullyParallel: true,
  
  // Tests bei CI-Fehler nicht wiederholen
  forbidOnly: !!process.env.CI,
  
  // Retry-Strategie
  retries: process.env.CI ? 2 : 0,
  
  // Anzahl paralleler Worker
  // Sequenziell (1 Worker) auch lokal, da mehrere Test-Suites dieselbe
  // Datenbank (Angebote) manipulieren und sonst Race-Conditions entstehen
  // (z.B. offers-slider.spec.ts und offers.spec.ts gleichzeitig)
  workers: 1,
  
  // Reporter
  reporter: 'html',
  
  // Shared Settings für alle Projekte
  use: {
    // Base URL für Tests
    baseURL: 'http://localhost:3000',

    // Mobile Viewport (App zeigt Header/TabBar bei < 768px)
    viewport: { width: 375, height: 667 },

    // Screenshots bei Fehlern
    screenshot: 'only-on-failure',

    // Traces bei Fehlern
    trace: 'on-first-retry',

    // Video nur bei Fehlern
    video: 'retain-on-failure',
  },

  // Test-Projekte (Browser)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Pixel 5'] },
    },

    // Optional: Weitere Browser
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile-Tests
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],

  // Webserver starten für Tests
  webServer: {
    command: process.env.CI ? 'node .output/server/index.mjs' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
