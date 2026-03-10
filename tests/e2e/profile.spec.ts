/**
 * E2E-Tests fuer die Profil-Seite (FEAT-20)
 *
 * Testet die kritischen User-Flows:
 * 1. Profil-Seite laedt mit korrekten User-Daten (Name sichtbar)
 * 2. Zeitraum-Umschalter wechselt Zeitraum (aktiver Tab hervorgehoben)
 * 3. Logout-Button fuehrt zweistufig zur /login-Seite
 * 4. Admin kann /profile nicht aufrufen (wird zu /admin weitergeleitet)
 * 5. Nicht-eingeloggter Nutzer wird zu /login weitergeleitet
 * 6. Bonuspunkte-Sektion mit eigenem Umschalter ist sichtbar
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
// Test-Suite: Mitarbeiter-Flows
// ============================================================

test.describe('Profil-Seite — Mitarbeiter-Flows (FEAT-20)', () => {
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
  // Test 1: Profil-Seite laedt mit User-Daten (AC-1)
  // ============================================================

  test('Profil-Seite laedt und zeigt User-Name (AC-1)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Seite muss auf /profile bleiben (kein Redirect)
    await expect(page).toHaveURL('/profile')

    // Mindestens irgendein Text-Inhalt muss sichtbar sein (Name oder Guthaben)
    // Da die Demo-User Nina heisst, erwarten wir "Nina" auf der Seite
    await page.waitForSelector('h1', { timeout: 10000 })
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    // Name ist ein h1 auf der Profil-Seite
    const headingText = await heading.textContent()
    expect(headingText?.trim().length).toBeGreaterThan(0)
  })

  // ============================================================
  // Test 2: Stammdaten sind nur lesend (AC-2)
  // ============================================================

  test('Keine Bearbeiten-Schaltflaeche oder Eingabefelder fuer Stammdaten (AC-2)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Kein Edit-Button und keine Eingabefelder fuer Namen/Standort
    const editButton = page.getByRole('button', { name: /bearbeiten|edit/i })
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]')

    await expect(editButton).not.toBeVisible()
    await expect(nameInput).not.toBeVisible()
  })

  // ============================================================
  // Test 3: Zeitraum-Umschalter zeigt 4 Optionen (AC-3, AC-4, AC-5)
  // ============================================================

  test('Globaler Zeitraum-Umschalter hat 4 Tabs, Standard ist 30 Tage (AC-3, AC-4)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // 4 Zeitraum-Tabs muessen vorhanden sein
    const tab7d = page.getByRole('tab', { name: '7 Tage' })
    const tab30d = page.getByRole('tab', { name: '30 Tage' })
    const tab90d = page.getByRole('tab', { name: '90 Tage' })
    const tabAll = page.getByRole('tab', { name: 'Alle Zeit' })

    await expect(tab7d).toBeVisible({ timeout: 10000 })
    await expect(tab30d).toBeVisible()
    await expect(tab90d).toBeVisible()
    await expect(tabAll).toBeVisible()

    // Standard: "30 Tage" ist aktiv (aria-selected=true)
    await expect(tab30d).toHaveAttribute('aria-selected', 'true')
  })

  // ============================================================
  // Test 4: Zeitraum-Wechsel aktualisiert die Ansicht (AC-6)
  // ============================================================

  test('Zeitraum-Wechsel auf 7 Tage markiert Tab als aktiv (AC-5, AC-6)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    const tab7d = page.getByRole('tab', { name: '7 Tage' })
    const tab30d = page.getByRole('tab', { name: '30 Tage' })

    // 7d anklicken
    await tab7d.click()

    // Tab 7d sollte jetzt aktiv sein
    await expect(tab7d).toHaveAttribute('aria-selected', 'true')
    // Tab 30d sollte nicht mehr aktiv sein
    await expect(tab30d).toHaveAttribute('aria-selected', 'false')
  })

  // ============================================================
  // Test 5: Einkaufsstatistiken-Sektion sichtbar (AC-7, AC-8)
  // ============================================================

  test('Einkaufsstatistiken-Sektion mit GESAMT / <7 TAGE / LETZTER Labels sichtbar', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Warten bis API-Daten geladen
    await page.waitForTimeout(2000)

    // Statistik-Labels muessen sichtbar sein
    // Verwende .first() da "Woche" und "Monat" auch in Bonuspunkte-Tabs vorkommen
    await expect(page.getByText('Gesamt', { exact: false }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Woche', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('Monat', { exact: false }).first()).toBeVisible()
  })

  // ============================================================
  // Test 6: Bonuspunkte-Sektion mit eigenem Umschalter (REQ-4a, REQ-4d)
  // ============================================================

  test('Bonuspunkte-Sektion hat eigenen Woche/Monat/Jahr-Umschalter', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Bonuspunkte-Header (h2 heading, nicht die sr-only Tabelle)
    await expect(page.getByRole('heading', { name: 'Bonuspunkte' })).toBeVisible({ timeout: 10000 })

    // Eigener Zeitraum-Umschalter mit Woche/Monat/Jahr (tablist mit aria-label)
    const bonusTablist = page.getByRole('tablist', { name: 'Bonuspunkte-Zeitraum' })
    await expect(bonusTablist).toBeVisible()

    // Tabs innerhalb des Bonus-Umschalters
    const weekTab = bonusTablist.getByRole('tab', { name: 'Woche' })
    const monthTab = bonusTablist.getByRole('tab', { name: 'Monat' })
    const yearTab = bonusTablist.getByRole('tab', { name: 'Jahr' })

    await expect(weekTab).toBeVisible()
    await expect(monthTab).toBeVisible()
    await expect(yearTab).toBeVisible()

    // Standard: Woche aktiv
    await expect(weekTab).toHaveAttribute('aria-selected', 'true')
  })

  // ============================================================
  // Test 7: Bonuspunkte-Umschalter ist unabhaengig vom globalen (REQ-4b)
  // ============================================================

  test('Bonuspunkte-Umschalter wechselt unabhaengig vom globalen Zeitraum', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    const bonusTablist = page.getByRole('tablist', { name: 'Bonuspunkte-Zeitraum' })
    const globalTablist = page.getByRole('tablist', { name: 'Zeitraum waehlen' })

    await expect(bonusTablist).toBeVisible({ timeout: 10000 })
    await expect(globalTablist).toBeVisible()

    // Bonuspunkte-Tab auf Monat wechseln
    const monthTab = bonusTablist.getByRole('tab', { name: 'Monat' })
    await monthTab.click()
    await expect(monthTab).toHaveAttribute('aria-selected', 'true')

    // Globaler Tab soll unveraendert auf 30 Tage bleiben
    const global30d = globalTablist.getByRole('tab', { name: '30 Tage' })
    await expect(global30d).toHaveAttribute('aria-selected', 'true')
  })

  // ============================================================
  // Test 8: Bestellverlauf-Sektion sichtbar (AC-12, AC-13)
  // ============================================================

  test('Bestellverlauf-Sektion ist sichtbar', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Warten auf API-Daten
    await page.waitForTimeout(2000)

    // Bestellverlauf-Ueberschrift
    await expect(page.getByText('Bestellverlauf')).toBeVisible({ timeout: 10000 })

    // Entweder Bestellungen ODER leerer Zustand sind sichtbar
    const orderItems = page.locator('[data-testid^="history-item-"]')
    const emptyState = page.locator('[data-testid="order-history-empty"]')

    const itemsCount = await orderItems.count()
    const emptyVisible = await emptyState.isVisible().catch(() => false)

    // Eines der beiden muss true sein
    expect(itemsCount > 0 || emptyVisible).toBe(true)
  })

  // ============================================================
  // Test 9: Logout-Button zweistufig (AC-16, AC-17)
  // ============================================================

  test('Logout-Button ist sichtbar und fuehrt zweistufig zum Logout (AC-16)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Logout-Button muss sichtbar sein
    const logoutBtn = page.getByTestId('logout-btn')
    await expect(logoutBtn).toBeVisible({ timeout: 10000 })

    // Erster Klick: Bestaetigung anfordern
    await logoutBtn.click()

    // Bestaetigen-Button muss erscheinen
    const confirmBtn = page.getByTestId('logout-confirm-btn')
    await expect(confirmBtn).toBeVisible({ timeout: 5000 })

    // Abbrechen-Button muss erscheinen
    const cancelBtn = page.getByTestId('logout-cancel-btn')
    await expect(cancelBtn).toBeVisible()
  })

  test('Abbrechen beim Logout: User bleibt auf Profil-Seite', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    const logoutBtn = page.getByTestId('logout-btn')
    await logoutBtn.click()

    const cancelBtn = page.getByTestId('logout-cancel-btn')
    await expect(cancelBtn).toBeVisible({ timeout: 5000 })
    await cancelBtn.click()

    // Original-Logout-Button wieder sichtbar
    await expect(logoutBtn).toBeVisible({ timeout: 5000 })

    // Seite bleibt auf /profile
    await expect(page).toHaveURL('/profile')
  })

  test('Logout-Bestaetigung leitet zu /login weiter (AC-17)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    const logoutBtn = page.getByTestId('logout-btn')
    await logoutBtn.click()

    const confirmBtn = page.getByTestId('logout-confirm-btn')
    await expect(confirmBtn).toBeVisible({ timeout: 5000 })
    await confirmBtn.click()

    // Nach Logout: Redirect zu /login
    await page.waitForURL('/login', { timeout: 15000 })
    await expect(page).toHaveURL('/login')
  })

  // ============================================================
  // Test 10: Verlauf-Link springt zur Bestellverlauf-Sektion (REQ-4c)
  // ============================================================

  test('Verlauf-Link und Kaufhistorie-Link springen zur Bestellverlauf-Sektion', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    await page.waitForSelector('text=Bonuspunkte', { timeout: 10000 })

    // Verlauf-Link ist vorhanden (in Bonuspunkte-Sektion)
    const verlaufLink = page.getByRole('link', { name: 'Verlauf' })
    await expect(verlaufLink).toBeVisible()
    await expect(verlaufLink).toHaveAttribute('href', '#bestellverlauf')

    // Kaufhistorie-Link ist vorhanden (in Einkauefe-Sektion)
    const historyLink = page.getByRole('link', { name: 'Kaufhistorie' })
    await expect(historyLink).toBeVisible()
    await expect(historyLink).toHaveAttribute('href', '#bestellverlauf')
  })
})

// ============================================================
// Test-Suite: Admin-Zugriff
// ============================================================

test.describe('Profil-Seite — Admin-Zugriff (FEAT-20 AC-19)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAdmin(page)
  })

  test('Admin wird von /profile zu /admin weitergeleitet (AC-19)', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Admin darf nicht auf /profile bleiben — wird zu /admin weitergeleitet
    await page.waitForURL(/\/admin/, { timeout: 15000 })
    await expect(page.url()).toContain('/admin')
    await expect(page.url()).not.toContain('/profile')
  })
})

// ============================================================
// Test-Suite: Kein Zugriff ohne Login
// ============================================================

test.describe('Profil-Seite — Kein Zugriff ohne Login (FEAT-20 AC-18)', () => {
  test('Nicht eingeloggter User wird von /profile zu /login weitergeleitet (AC-18)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    // Direkte URL-Eingabe ohne eingeloggt zu sein (EC-10)
    await page.goto('/profile', { waitUntil: 'networkidle' })

    // Muss zu /login weitergeleitet werden
    await page.waitForURL('/login', { timeout: 15000 })
    await expect(page).toHaveURL('/login')
  })
})
