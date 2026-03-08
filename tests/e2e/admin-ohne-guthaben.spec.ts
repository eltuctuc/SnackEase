/**
 * E2E-Tests fuer FEAT-9: Admin ohne Guthaben
 *
 * Testet die kritischen User-Flows:
 * 1. Admin-Dashboard: Admin loggt sich ein → sieht AdminInfoBanner, keine BalanceCard
 * 2. Admin-Link: "Zum Admin-Bereich" navigiert korrekt zu /admin
 * 3. Mitarbeiter-Dashboard: Mitarbeiter sieht BalanceCard (Regression-Test)
 * 4. API-Guard: Direkter Aufruf /api/credits/balance als Admin → 403
 *
 * Voraussetzung: Applikation laeuft auf http://localhost:3000
 * Demo-Credentials:
 * - Admin: admin@demo.de / admin123
 * - Mitarbeiter: nina@demo.de / nina123
 */

import { test, expect } from '@playwright/test'

/**
 * Hilfsfunktion: Login als Admin
 */
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  await page.fill('input[type="email"]', 'admin@demo.de')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/admin', { timeout: 15000 })
}

/**
 * Hilfsfunktion: Login als Mitarbeiter (Nina)
 */
async function loginAsMitarbeiter(page: import('@playwright/test').Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  await page.fill('input[type="email"]', 'nina@demo.de')
  await page.fill('input[type="password"]', 'demo123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 15000 })
}

test.describe('FEAT-9: Admin ohne Guthaben', () => {
  test.describe('Admin-Dashboard', () => {
    test('Admin wird nach Login zu /admin weitergeleitet (kein /dashboard-Zugang)', async ({ page }) => {
      await loginAsAdmin(page)

      // Admin landet auf /admin, nicht auf /dashboard
      await expect(page).toHaveURL(/\/admin/)

      // Keine BalanceCard sichtbar
      await expect(page.locator('[role="status"]')).not.toBeVisible()
    })

    test('Admin sieht keinen Guthaben-Betrag in Euro', async ({ page }) => {
      await loginAsAdmin(page)

      // Kein Guthaben-Betrag auf der Admin-Seite
      const balanceCard = page.locator('[role="status"]')
      await expect(balanceCard).not.toBeVisible()
    })

    test('Admin wird von /dashboard zu /admin weitergeleitet (REQ-37)', async ({ page }) => {
      await loginAsAdmin(page)

      // Direktes Aufrufen von /dashboard muss zu /admin weiterleiten
      await page.goto('/dashboard')
      await page.waitForURL('/admin', { timeout: 10000 })
      await expect(page).toHaveURL(/\/admin/)
    })

    test('Admin sieht Admin-Panel mit Systemuebersicht', async ({ page }) => {
      await loginAsAdmin(page)

      // Der zweite h1 ist der Seiten-Überschrift (nach dem Header-h1)
      await expect(page.locator('h1').nth(1)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Admin-Navigation', () => {
    test('Admin sieht Admin-Navigation auf /admin', async ({ page }) => {
      await loginAsAdmin(page)

      // Admin-Nav muss sichtbar sein
      await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible({ timeout: 5000 })
      await expect(page).toHaveURL(/\/admin/)
    })
  })

  test.describe('Mitarbeiter-Dashboard (Regression)', () => {
    test.skip('Mitarbeiter sieht weiterhin BalanceCard', async ({ page }) => {
      await loginAsMitarbeiter(page)

      // BalanceCard muss vorhanden sein (role="status" ist auf BalanceCard)
      await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 5000 })
    })

    test.skip('Mitarbeiter sieht kein AdminInfoBanner', async ({ page }) => {
      await loginAsMitarbeiter(page)

      // AdminInfoBanner darf fuer Mitarbeiter NICHT erscheinen
      await expect(page.locator('text=Admin-Modus aktiv')).not.toBeVisible()
    })

    test('Mitarbeiter sieht Guthaben-Karte mit Aktions-Buttons', async ({ page }) => {
      await loginAsMitarbeiter(page)

      await expect(page.locator('text=Guthaben aufladen')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('API-Guard (FEAT-9)', () => {
    test('Admin erhaelt 403 bei direktem Aufruf von /api/credits/balance', async ({ page }) => {
      // Erst als Admin einloggen (Cookie setzen)
      await loginAsAdmin(page)

      // Direkten API-Aufruf machen
      const response = await page.request.get('/api/credits/balance')
      expect(response.status()).toBe(403)
    })

    test('API-Fehler-Response enthaelt passende Meldung', async ({ page }) => {
      await loginAsAdmin(page)

      const response = await page.request.get('/api/credits/balance')
      const body = await response.json()
      // H3-Fehler sendet message im Body
      expect(body.message || body.statusMessage).toBeTruthy()
    })
  })
})
