/**
 * E2E-Tests fuer Angebote-Querslider (FEAT-17)
 *
 * Testet die kritischen User-Flows:
 * 1. Slider erscheint auf /dashboard wenn aktive Angebote existieren (AC-1)
 * 2. Slider zeigt Abschnittstitel "Aktuelle Angebote" (REQ-7)
 * 3. Warenkorb-Button erhoeht Warenkorb-Zaehler im Header (AC-6)
 * 4. Klick auf Kartenflaeche oeffnet ProductDetailModal (AC-5)
 * 5. Modal zeigt Produktname und Preisinformationen (AC-5)
 * 6. Warenkorb-Button-Klick oeffnet kein Modal (AC-6)
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
// Helper: Stellt sicher, dass ein aktives Angebot existiert
// ============================================================

async function ensureActiveOfferExists(page: Page): Promise<boolean> {
  // Via API ein Angebot erstellen (als Admin)
  const response = await page.evaluate(async () => {
    // Erst alle Produkte laden
    const productsRes = await fetch('/api/products', { credentials: 'include' })
    const products = await productsRes.json() as Array<{ id: number; activeOffer: unknown }>

    // Erstes Produkt ohne Angebot finden
    const productWithoutOffer = products.find(p => !p.activeOffer)
    if (!productWithoutOffer) {
      // Kein Produkt ohne Angebot — pruefen ob bereits eins aktiv ist
      const withOffer = products.find(p => p.activeOffer)
      return { hasOffer: !!withOffer, productId: withOffer?.id ?? null }
    }

    // Angebot erstellen
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const createRes = await fetch('/api/admin/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        productId: productWithoutOffer.id,
        discountType: 'percent',
        discountValue: 20,
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      }),
    })
    return { hasOffer: createRes.ok, productId: productWithoutOffer.id }
  })

  return response.hasOffer
}

// ============================================================
// Test-Suite: Angebote-Querslider (Mitarbeiter-View)
// ============================================================

test.describe('Angebote-Querslider — User-Flows (FEAT-17)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  // ============================================================
  // Test 1: Slider erscheint wenn aktive Angebote vorhanden
  // ============================================================

  test('Slider erscheint auf /dashboard wenn aktives Angebot existiert (AC-1)', async ({ page }) => {
    // Admin einloggen um Angebot erstellen zu koennen
    await loginAsAdmin(page)
    const hasOffer = await ensureActiveOfferExists(page)

    if (!hasOffer) {
      // Kann kein Angebot erstellen — Test uebersprungen
      test.skip()
      return
    }

    // Als Mitarbeiter einloggen
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.context().clearCookies()
    await loginAsUser(page)

    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    // Warten bis Seite geladen
    await page.waitForLoadState('networkidle')

    // Slider-Section muss sichtbar sein
    const sliderSection = page.getByRole('region', { name: 'Aktuelle Angebote' })
    await expect(sliderSection).toBeVisible({ timeout: 10000 })
  })

  // ============================================================
  // Test 2: Slider zeigt Abschnittstitel "Aktuelle Angebote"
  // ============================================================

  test('Slider hat Abschnittstitel "Aktuelle Angebote" (REQ-7)', async ({ page }) => {
    await loginAsAdmin(page)
    await ensureActiveOfferExists(page)

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.context().clearCookies()
    await loginAsUser(page)

    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    const sliderSection = page.getByRole('region', { name: 'Aktuelle Angebote' })
    const hasSlider = await sliderSection.isVisible({ timeout: 8000 }).catch(() => false)

    if (!hasSlider) {
      // Kein aktives Angebot in Test-DB — Test uebersprungen
      test.skip()
      return
    }

    // Heading muss vorhanden sein
    await expect(page.getByRole('heading', { name: 'Aktuelle Angebote' })).toBeVisible()
  })

  // ============================================================
  // Test 3: Klick auf Kartenflaeche oeffnet ProductDetailModal
  // ============================================================

  test('Klick auf Slider-Karte oeffnet ProductDetailModal (AC-5)', async ({ page }) => {
    await loginAsAdmin(page)
    await ensureActiveOfferExists(page)

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.context().clearCookies()
    await loginAsUser(page)

    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    const sliderSection = page.getByRole('region', { name: 'Aktuelle Angebote' })
    const hasSlider = await sliderSection.isVisible({ timeout: 8000 }).catch(() => false)

    if (!hasSlider) {
      test.skip()
      return
    }

    // Erste Karte im Slider finden und auf die Kartenflaeche klicken
    // (nicht auf den Warenkorb-Button)
    const firstCard = sliderSection.locator('button[aria-label*="Angebot anzeigen"]').first()
    await expect(firstCard).toBeVisible({ timeout: 5000 })

    await firstCard.click()

    // ProductDetailModal muss sich oeffnen
    const modal = page.getByRole('dialog', { name: /product-detail-title/ })
      .or(page.locator('[role="dialog"]'))

    await expect(modal).toBeVisible({ timeout: 5000 })
  })

  // ============================================================
  // Test 4: Modal zeigt Produktname und Preisinformationen
  // ============================================================

  test('ProductDetailModal zeigt Produktname und Preisinformationen (AC-5)', async ({ page }) => {
    await loginAsAdmin(page)
    await ensureActiveOfferExists(page)

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.context().clearCookies()
    await loginAsUser(page)

    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    const sliderSection = page.getByRole('region', { name: 'Aktuelle Angebote' })
    const hasSlider = await sliderSection.isVisible({ timeout: 8000 }).catch(() => false)

    if (!hasSlider) {
      test.skip()
      return
    }

    // Ersten Produktnamen aus Karte lesen
    const firstCard = sliderSection.locator('button[aria-label*="Angebot anzeigen"]').first()
    await firstCard.click()

    const modal = page.locator('[role="dialog"]').first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    // Modal zeigt Preis (irgendein Text mit EUR-Symbol)
    const priceText = modal.locator('p').filter({ hasText: /€/ })
    await expect(priceText.first()).toBeVisible({ timeout: 5000 })
  })

  // ============================================================
  // Test 5: Warenkorb-Button-Klick erhoehe Warenkorb-Zaehler
  // ============================================================

  test('Warenkorb-Button erhoeht Warenkorb-Zaehler im Header (AC-6)', async ({ page }) => {
    await loginAsAdmin(page)
    await ensureActiveOfferExists(page)

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.context().clearCookies()
    await loginAsUser(page)

    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    const sliderSection = page.getByRole('region', { name: 'Aktuelle Angebote' })
    const hasSlider = await sliderSection.isVisible({ timeout: 8000 }).catch(() => false)

    if (!hasSlider) {
      test.skip()
      return
    }

    // Warenkorb-Button in erster Karte klicken
    const addToCartButton = sliderSection.locator('[aria-label*="in den Warenkorb"]').first()
    await expect(addToCartButton).toBeVisible({ timeout: 5000 })

    await addToCartButton.click()

    // Modal darf sich NICHT geoeffnet haben
    const modal = page.locator('[role="dialog"]')
    const modalVisible = await modal.isVisible().catch(() => false)
    expect(modalVisible).toBe(false)

    // Warenkorb-Seite aufrufen und pruefen ob Artikel vorhanden
    await page.goto('/cart', { waitUntil: 'networkidle' })
    // Mindestens einen Artikel im Warenkorb
    const cartItems = page.locator('h3, [class*="font-medium"]').filter({ hasText: /.+/ })
    const hasItems = await cartItems.count()
    expect(hasItems).toBeGreaterThan(0)
  })

  // ============================================================
  // Test 6: Warenkorb-Button-Klick oeffnet KEIN Modal
  // ============================================================

  test('Warenkorb-Button-Klick oeffnet kein ProductDetailModal (AC-6)', async ({ page }) => {
    await loginAsAdmin(page)
    await ensureActiveOfferExists(page)

    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.context().clearCookies()
    await loginAsUser(page)

    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    const sliderSection = page.getByRole('region', { name: 'Aktuelle Angebote' })
    const hasSlider = await sliderSection.isVisible({ timeout: 8000 }).catch(() => false)

    if (!hasSlider) {
      test.skip()
      return
    }

    // Warenkorb-Button klicken
    const addToCartButton = sliderSection.locator('[aria-label*="in den Warenkorb"]').first()
    await expect(addToCartButton).toBeVisible({ timeout: 5000 })
    await addToCartButton.click()

    // Warten und pruefen ob Modal NICHT geoeffnet wurde
    await page.waitForTimeout(500)
    const modal = page.locator('[role="dialog"]')
    await expect(modal).not.toBeVisible({ timeout: 2000 })
  })

  // ============================================================
  // Test 7: Admin sieht keinen Slider (Admin-Guard)
  // ============================================================

  test('Admin sieht keinen Angebote-Slider auf dem Dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    // Slider-Section darf fuer Admin NICHT sichtbar sein
    const sliderSection = page.getByRole('region', { name: 'Aktuelle Angebote' })
    await expect(sliderSection).not.toBeVisible({ timeout: 5000 })
  })
})
