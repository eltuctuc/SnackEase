/**
 * E2E-Tests fuer FEAT-24: Guthaben aufladen & Zahlungsmethode
 *
 * Testet folgende Flows:
 * 1. Navigation von /profile via Kreditkarten-Icon zu /profile/credit
 * 2. Betrag-Eingabe per Numpad (mehrere Ziffern + Loeschen)
 * 3. Button bei 0,00 € deaktiviert, aktiviert nach Eingabe
 * 4. Aufladen erhoeht Guthaben; Toast erscheint; Weiterleitung zu /profile
 * 5. Zahlungsmethode wechseln; nach Speichern beim naechsten Oeffnen vorausgewaehlt
 * 6. Nicht eingeloggt: /profile/credit → /login (EC-3)
 * 7. Admin: /profile/credit → /admin (EC-4)
 *
 * Browser: Chromium (Default in Playwright-Config)
 */

import { test, expect, type Page } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

// ============================================================
// Login-Helper
// ============================================================

async function loginAsUser(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  await page.fill('input[type="email"]', 'nina@demo.de')
  await page.fill('input[type="password"]', 'demo123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 30000 })
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  await page.fill('input[type="email"]', 'admin@demo.de')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin/, { timeout: 30000 })
}

// ============================================================
// Test-Suite: Mitarbeiter-Flows (Happy Path)
// ============================================================

test.describe('FEAT-24 — Guthaben aufladen (Mitarbeiter-Flows)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsUser(page)
  })

  // ============================================================
  // Test 1: Navigation von /profile via Kreditkarten-Icon (AC-1)
  // ============================================================

  test('Navigation von /profile via Kreditkarten-Icon zu /profile/credit (AC-1)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Kreditkarten-Icon-Link finden (aria-label="Guthaben aufladen")
    const creditLink = page.getByRole('link', { name: 'Guthaben aufladen' })
    await expect(creditLink).toBeVisible({ timeout: 10000 })

    await creditLink.click()
    await page.waitForURL('/profile/credit', { timeout: 15000 })
    await expect(page).toHaveURL('/profile/credit')
  })

  // ============================================================
  // Test 2: /profile/credit laedt korrekt
  // ============================================================

  test('/profile/credit zeigt Titel, Guthaben, Numpad und Aufladen-Button', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Seitentitel
    await expect(page.getByRole('heading', { name: 'Guthaben aufladen' })).toBeVisible({ timeout: 10000 })

    // Guthaben-Label (erstes Vorkommen)
    await expect(page.getByText('Guthaben').first()).toBeVisible()

    // Betrag-Anzeige (initial "0,00 €")
    await expect(page.getByText('0,00 €')).toBeVisible()

    // Aufladen-Button
    await expect(page.getByRole('button', { name: /GUTHABEN AUFLADEN/i })).toBeVisible()

    // Zahlungsmethode-Hinweis-Link (exakter Text-Link "Ändern" im Hinweis-Satz)
    await expect(page.getByRole('link', { name: 'Ändern', exact: true })).toBeVisible()
  })

  // ============================================================
  // Test 3: Button bei 0,00 € deaktiviert (AC-3)
  // ============================================================

  test('Aufladen-Button ist bei 0,00 € deaktiviert (AC-3)', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const button = page.getByRole('button', { name: /GUTHABEN AUFLADEN/i })
    await expect(button).toBeVisible({ timeout: 10000 })
    await expect(button).toBeDisabled()
  })

  // ============================================================
  // Test 4: Betrag-Eingabe per Numpad (AC-2)
  // ============================================================

  test('Betrag-Eingabe per Numpad: 1-0-0-0 ergibt 10,00 € (AC-2)', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Ziffern 1, 0, 0, 0 antippen
    await page.getByRole('button', { name: 'Ziffer 1' }).click()
    await page.getByRole('button', { name: 'Ziffer 0' }).click()
    await page.getByRole('button', { name: 'Ziffer 0' }).click()
    await page.getByRole('button', { name: 'Ziffer 0' }).click()

    // Betragsanzeige soll "10,00 €" zeigen
    await expect(page.getByText('10,00 €')).toBeVisible({ timeout: 5000 })
  })

  // ============================================================
  // Test 5: Button aktiv nach Betrag-Eingabe (AC-3)
  // ============================================================

  test('Aufladen-Button wird nach Betrag-Eingabe aktiv (AC-3)', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const button = page.getByRole('button', { name: /GUTHABEN AUFLADEN/i })
    await expect(button).toBeDisabled({ timeout: 10000 })

    // Ziffer eingeben
    await page.getByRole('button', { name: 'Ziffer 5' }).click()

    // Button soll jetzt aktiv sein
    await expect(button).toBeEnabled({ timeout: 5000 })
  })

  // ============================================================
  // Test 6: Backspace-Taste korrigiert Eingabe
  // ============================================================

  test('Backspace-Taste entfernt letzte Ziffer', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // 1, 2 eingeben → 0,12 €
    await page.getByRole('button', { name: 'Ziffer 1' }).click()
    await page.getByRole('button', { name: 'Ziffer 2' }).click()
    await expect(page.getByText('0,12 €')).toBeVisible({ timeout: 5000 })

    // Backspace → 0,01 €
    await page.getByRole('button', { name: 'Letzte Ziffer löschen' }).click()
    await expect(page.getByText('0,01 €')).toBeVisible({ timeout: 5000 })

    // Backspace bei leerem State → 0,00 € (EC-2)
    await page.getByRole('button', { name: 'Letzte Ziffer löschen' }).click()
    await expect(page.getByText('0,00 €')).toBeVisible({ timeout: 5000 })
  })

  // ============================================================
  // Test 7: Aufladen-Flow (AC-4, AC-8, REQ-8)
  // ============================================================

  test('Aufladen: POST wird ausgefuehrt, Toast erscheint, Weiterleitung zu /profile (AC-4)', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    // 5,00 € eingeben: 5-0-0
    await page.getByRole('button', { name: 'Ziffer 5' }).click()
    await page.getByRole('button', { name: 'Ziffer 0' }).click()
    await page.getByRole('button', { name: 'Ziffer 0' }).click()

    await expect(page.getByText('5,00 €')).toBeVisible({ timeout: 5000 })

    // Aufladen-Button anklicken
    const button = page.getByRole('button', { name: /GUTHABEN AUFLADEN/i })
    await expect(button).toBeEnabled({ timeout: 5000 })
    await button.click()

    // Toast "Guthaben erfolgreich aufgeladen" erscheint
    await expect(page.getByText('Guthaben erfolgreich aufgeladen')).toBeVisible({ timeout: 10000 })

    // Weiterleitung zu /profile
    await page.waitForURL('/profile', { timeout: 10000 })
    await expect(page).toHaveURL('/profile')
  })

  // ============================================================
  // Test 8: Tab-Bar auf /profile/credit sichtbar, Profil-Tab aktiv (AC-10)
  // ============================================================

  test('Tab-Bar ist auf /profile/credit sichtbar mit aktivem Profil-Tab (AC-10)', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Tab-Bar Navigation muss sichtbar sein
    const nav = page.getByRole('navigation', { name: 'Navigation' })
    await expect(nav).toBeVisible({ timeout: 10000 })

    // Profil-Tab mit aria-current="page" — Locator auf Nav eingegrenzt um Back-Button zu vermeiden
    const profileTab = nav.getByRole('link', { name: 'Profil' })
    await expect(profileTab).toBeVisible()
    await expect(profileTab).toHaveAttribute('aria-current', 'page')
  })
})

// ============================================================
// Test-Suite: Zahlungsmethode (AC-5, AC-6, AC-7, AC-8)
// ============================================================

test.describe('FEAT-24 — Zahlungsmethode (AC-5 bis AC-8)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsUser(page)
  })

  // ============================================================
  // Test 9: "Falsche Zahlungsmethode? Aendern" navigiert zu /profile/payment (AC-5)
  // ============================================================

  test('"Falsche Zahlungsmethode? Aendern" navigiert zu /profile/payment (AC-5)', async ({ page }) => {
    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const changeLink = page.getByRole('link', { name: 'Ändern', exact: true })
    await expect(changeLink).toBeVisible({ timeout: 10000 })
    await changeLink.click()

    await page.waitForURL('/profile/payment', { timeout: 15000 })
    await expect(page).toHaveURL('/profile/payment')
  })

  // ============================================================
  // Test 10: /profile/payment zeigt alle drei Zahlungsmethoden (AC-6)
  // ============================================================

  test('/profile/payment zeigt alle drei Zahlungsmethoden (AC-6)', async ({ page }) => {
    await page.goto('/profile/payment', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Seitentitel
    await expect(page.getByRole('heading', { name: 'Zahlungsmethode' })).toBeVisible({ timeout: 10000 })

    // Alle drei Optionen sichtbar
    await expect(page.getByText('VISA / MAESTRO', { exact: true })).toBeVisible()
    await expect(page.getByText('PayPal', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Nettogehalt', { exact: true })).toBeVisible()

    // Speichern-Button sichtbar
    await expect(page.getByRole('button', { name: /AUSWAHL SPEICHERN/i })).toBeVisible()
  })

  // ============================================================
  // Test 11: Zahlungsmethode wechseln + Speichern + Zuruecknavigation (AC-7)
  // ============================================================

  test('Zahlungsmethode waehlen und "AUSWAHL SPEICHERN" kehrt zu /profile/credit zurueck (AC-7)', async ({ page }) => {
    await page.goto('/profile/payment', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // VISA / MAESTRO auswaehlen
    const visaLabel = page.locator('label').filter({ hasText: 'VISA / MAESTRO' })
    await expect(visaLabel).toBeVisible({ timeout: 10000 })
    await visaLabel.click()

    // Speichern-Button
    const saveButton = page.getByRole('button', { name: /AUSWAHL SPEICHERN/i })
    await saveButton.click()

    // Zurueck zu /profile/credit
    await page.waitForURL('/profile/credit', { timeout: 15000 })
    await expect(page).toHaveURL('/profile/credit')
  })

  // ============================================================
  // Test 12: Gespeicherte Zahlungsmethode wird beim naechsten Oeffnen vorausgewaehlt (AC-8)
  // ============================================================

  test('Gespeicherte Zahlungsmethode beim naechsten Oeffnen vorausgewaehlt (AC-8)', async ({ page }) => {
    // Salary auswaehlen und speichern
    await page.goto('/profile/payment', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const salaryLabel = page.locator('label').filter({ hasText: 'Nettogehalt' })
    await expect(salaryLabel).toBeVisible({ timeout: 10000 })
    await salaryLabel.click()

    await page.getByRole('button', { name: /AUSWAHL SPEICHERN/i }).click()
    await page.waitForURL('/profile/credit', { timeout: 15000 })

    // Erneut /profile/payment aufrufen
    await page.goto('/profile/payment', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    // Radio-Input fuer Nettogehalt muss "checked" sein
    const salaryInput = page.locator('input[type="radio"][value="salary"]')
    await expect(salaryInput).toBeChecked({ timeout: 5000 })
  })

  // ============================================================
  // Test 13: Tab-Bar auf /profile/payment sichtbar (AC-10)
  // ============================================================

  test('Tab-Bar ist auf /profile/payment sichtbar mit aktivem Profil-Tab (AC-10)', async ({ page }) => {
    await page.goto('/profile/payment', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const nav = page.getByRole('navigation', { name: 'Navigation' })
    await expect(nav).toBeVisible({ timeout: 10000 })

    // Profil-Tab mit aria-current="page" — Locator auf Nav eingegrenzt um Back-Button zu vermeiden
    const profileTab = nav.getByRole('link', { name: 'Profil' })
    await expect(profileTab).toBeVisible()
    await expect(profileTab).toHaveAttribute('aria-current', 'page')
  })
})

// ============================================================
// Test-Suite: Auth-Schutz (AC-9, EC-3, EC-4)
// ============================================================

test.describe('FEAT-24 — Auth-Schutz (AC-9, EC-3, EC-4)', () => {
  // ============================================================
  // Test 14: Nicht eingeloggt → /login (EC-3, AC-9)
  // ============================================================

  test('Nicht eingeloggt: /profile/credit → /login (EC-3, AC-9)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForURL('/login', { timeout: 15000 })
    await expect(page).toHaveURL('/login')
  })

  test('Nicht eingeloggt: /profile/payment → /login (AC-9)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    await page.goto('/profile/payment', { waitUntil: 'networkidle' })
    await page.waitForURL('/login', { timeout: 15000 })
    await expect(page).toHaveURL('/login')
  })

  // ============================================================
  // Test 15: Admin → /admin (EC-4)
  // ============================================================

  test('Admin: /profile/credit → /admin (EC-4)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAdmin(page)

    await page.goto('/profile/credit', { waitUntil: 'networkidle' })
    await page.waitForURL(/\/admin/, { timeout: 15000 })
    await expect(page.url()).toContain('/admin')
    await expect(page.url()).not.toContain('/profile')
  })
})
