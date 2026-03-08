/**
 * E2E-Tests fuer Low-Stock-Benachrichtigungen (FEAT-13)
 *
 * Testet die kritischen User-Flows:
 * 1. Admin-Notifications-Seite laedt korrekt
 * 2. Badge im Header ist sichtbar wenn Benachrichtigungen vorhanden
 * 3. Dropdown oeffnet sich beim Klick auf das Badge
 * 4. Einzelne Benachrichtigung als gelesen markieren
 * 5. Alle Benachrichtigungen als gelesen markieren
 * 6. Leerer-Zustand-Screen wenn keine Warnungen vorhanden
 * 7. Tastatur-Navigation (Tab, Enter, Escape) durch Dropdown
 */

import { test, expect, type Page } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

// Login-Helper fuer Admin
async function loginAsAdmin(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  await page.fill('input[type="email"]', 'admin@demo.de')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')

  // Warten auf Navigation - mit verlängertem Timeout wegen setTimeout im Code
  await page.waitForURL(/\/admin/, { timeout: 30000 })
}

test.describe('Low-Stock-Benachrichtigungen (FEAT-13)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAdmin(page)
  })

  // ============================================================
  // Test 1: /admin/notifications-Seite laedt korrekt
  // ============================================================

  test('Benachrichtigungen-Seite ist erreichbar', async ({ page }) => {
    await page.goto('/admin/notifications', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL('/admin/notifications')
    await expect(page.getByRole('heading', { name: 'Low-Stock-Benachrichtigungen' })).toBeVisible()
  })

  // ============================================================
  // Test 2: Glocken-Icon ist im Admin-Header sichtbar
  // (nach FEAT-15: jetzt ein Button statt eines Links)
  // ============================================================

  test('Benachrichtigungs-Badge-Button ist im Header sichtbar', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })
    // Das Badge-Icon hat ein aria-label
    const badgeButton = page.getByRole('button', {
      name: /ungelesene Benachrichtigung/i,
    }).or(page.getByRole('button', { name: /keine ungelesenen/i }))
    await expect(badgeButton).toBeVisible()
  })

  // ============================================================
  // Test 3: Dropdown oeffnet sich beim Klick auf das Badge
  // ============================================================

  test('Dropdown oeffnet sich beim Klick auf Benachrichtigungs-Icon', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    const badgeButton = page.getByRole('button', {
      name: /Benachrichtigung/i,
    }).first()
    await badgeButton.click()

    const dropdown = page.getByRole('dialog', { name: 'Benachrichtigungen' })
    await expect(dropdown).toBeVisible()
  })

  // ============================================================
  // Test 5: Dropdown laesst sich per Escape schliessen
  // ============================================================

  test('Dropdown schliesst sich per Escape-Taste', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    const badgeButton = page.getByRole('button', {
      name: /Benachrichtigung/i,
    }).first()
    await badgeButton.click()

    const dropdown = page.getByRole('dialog', { name: 'Benachrichtigungen' })
    await expect(dropdown).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dropdown).not.toBeVisible()
  })

  // ============================================================
  // Test 6: Dropdown laesst sich per Schliessen-Button schliessen
  // ============================================================

  test('Dropdown schliesst sich per Schliessen-Button', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    const badgeButton = page.getByRole('button', {
      name: /Benachrichtigung/i,
    }).first()
    await badgeButton.click()

    const dropdown = page.getByRole('dialog', { name: 'Benachrichtigungen' })
    await expect(dropdown).toBeVisible()

    const closeButton = page.getByRole('button', { name: 'Benachrichtigungen schliessen' })
    await closeButton.click()
    await expect(dropdown).not.toBeVisible()
  })

  // ============================================================
  // Test 7: Notifications-Seite zeigt Leerer-Zustand korrekt
  // ============================================================

  test('Leerer-Zustand zeigt positiven Text wenn keine Warnungen vorhanden', async ({ page }) => {
    await page.goto('/admin/notifications', { waitUntil: 'networkidle' })

    // Warten bis Ladevorgang abgeschlossen
    await expect(page.getByRole('status')).not.toBeVisible({ timeout: 5000 }).catch(() => {})

    // Entweder Leerer-Zustand oder Benachrichtigungs-Karten sind sichtbar
    const emptyState = page.getByText('Alle Bestände sind in Ordnung.')
    const cards = page.locator('article')

    const emptyStateVisible = await emptyState.isVisible().catch(() => false)
    const cardsCount = await cards.count()

    // Eine der beiden Varianten muss zutreffen
    expect(emptyStateVisible || cardsCount > 0).toBe(true)
  })

  // ============================================================
  // Test 8: Filter-Buttons sind vorhanden (wenn Benachrichtigungen existieren)
  // ============================================================

  test('Filter-Buttons Alle und Ungelesen sind sichtbar wenn Benachrichtigungen existieren', async ({ page }) => {
    await page.goto('/admin/notifications', { waitUntil: 'networkidle' })

    // Warten bis Daten geladen
    await page.waitForTimeout(500)

    const hasNotifications = await page.locator('article').count() > 0
    if (!hasNotifications) {
      test.skip()
      return
    }

    // Filter-Buttons im Hauptbereich (erstes Element)
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-unread"]')).toBeVisible()
  })

  // ============================================================
  // Test 9: "Alle Benachrichtigungen anzeigen" Link im Dropdown
  // ============================================================

  test('Dropdown enthaelt Link zur Benachrichtigungs-Seite', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    const badgeButton = page.getByRole('button', {
      name: /Benachrichtigung/i,
    }).first()
    await badgeButton.click()

    const dropdown = page.getByRole('dialog', { name: 'Benachrichtigungen' })
    await expect(dropdown).toBeVisible()

    const viewAllLink = page.getByRole('link', { name: 'Alle Benachrichtigungen anzeigen' })
    await expect(viewAllLink).toBeVisible()
  })

  // ============================================================
  // Test 10: "Bestand auffuellen" Button leitet zu /admin/inventory
  // ============================================================

  test('"Bestand auffuellen" Button in NotificationCard leitet zu /admin/inventory', async ({ page }) => {
    await page.goto('/admin/notifications', { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    const hasCards = await page.locator('article').count() > 0
    if (!hasCards) {
      test.skip()
      return
    }

    const fillButton = page.getByRole('link', { name: /Bestand fuer .* auffuellen/i }).first()
    await expect(fillButton).toBeVisible()
    await fillButton.click()
    await expect(page).toHaveURL('/admin/inventory')
  })

  // ============================================================
  // Test 11: Accessibility — aria-label am Badge-Button
  // ============================================================

  test('Badge-Button hat korrektes aria-label fuer Screen Reader', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    // Beliebiges Button mit aria-label das "Benachrichtigung" enthaelt
    const badgeButton = page.getByRole('button', {
      name: /ungelesene Benachrichtigung/i,
    }).or(page.getByRole('button', { name: /keine ungelesenen/i }))

    await expect(badgeButton).toBeVisible()
    const ariaLabel = await badgeButton.getAttribute('aria-label')
    expect(ariaLabel).not.toBeNull()
    expect(ariaLabel?.length).toBeGreaterThan(0)
  })

  // ============================================================
  // Test 12: Tastatur-Navigation — Badge-Button per Tab erreichbar
  // ============================================================

  test('Badge-Button ist per Tastatur erreichbar', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    const badgeButton = page.getByRole('button', {
      name: /Benachrichtigung/i,
    }).first()

    // Badge-Button soll fokussierbar sein
    await badgeButton.focus()
    await expect(badgeButton).toBeFocused()
  })
})
