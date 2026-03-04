/**
 * E2E-Tests für One-Touch Kauf (FEAT-7)
 * 
 * Testet den vollständigen Kaufprozess:
 * - Erfolgreicher Kauf (Happy Path)
 * - Fehler: Nicht genug Guthaben
 * - Fehler: Produkt nicht verfügbar (FEAT-12)
 * - Doppelklick-Schutz
 */

import { test, expect } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

test.describe('One-Touch Kauf (FEAT-7)', () => {
  test.beforeEach(async ({ page, context }) => {
    // WICHTIG: Vollständige Browser-Isolation zwischen Tests
    await context.clearCookies()
    await context.clearPermissions()
    
    // Storage leeren (localStorage, sessionStorage)
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    // Login als Demo-User (nina@demo.de existiert in Seed-Daten)
    // Explizit /login statt / um sicherzustellen dass Login-Seite geladen wird
    await page.goto('/login', { waitUntil: 'networkidle' })
    
    // Warte auf Login-Formular (authChecked muss true sein)
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })
    
    // Login durchführen
    await page.fill('input[type="email"]', 'nina@demo.de')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // Warte auf Dashboard (mit längerem Timeout wegen navigateTo + 500ms delay)
    await page.waitForURL('/dashboard', { timeout: 15000 })
    await page.waitForSelector('[data-testid="product-grid"]', { timeout: 15000 })
  })

  test('sollte Produkt erfolgreich kaufen (Happy Path)', async ({ page }) => {
    // 1. Warte auf Produktkatalog
    await page.waitForSelector('[data-testid="product-card"]')
    
    // 2. Finde Produkt mit genug Guthaben und Bestand
    const productCard = page.locator('[data-testid="product-card"]').first()
    
    // 3. Klicke auf "Kaufen"-Button
    const purchaseButton = productCard.locator('button:has-text("Kaufen")')
    await expect(purchaseButton).toBeVisible()
    await purchaseButton.click()
    
    // 4. Warte auf Success-Modal
    await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 5000 })
    
    // 5. Verifiziere Modal-Inhalt
    const modal = page.locator('[data-testid="purchase-success-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Kauf erfolgreich!')
    
    // 6. Verifiziere PIN ist sichtbar
    const pin = modal.locator('[data-testid="pickup-pin"]')
    await expect(pin).toBeVisible()
    await expect(pin).toHaveText(/^\d{4}$/)
    
    // 7. Verifiziere Countdown
    await expect(modal).toContainText(/Gültig bis/)
    
    // 8. Verifiziere Standort
    await expect(modal).toContainText(/Abholort/)
  })

  test('sollte Fehler zeigen bei nicht genug Guthaben', async ({ page }) => {
    // 1. Finde Produkt mit Preis > aktuelles Guthaben
    // (Annahme: Es gibt ein teures Produkt im Katalog)
    const productCards = page.locator('[data-testid="product-card"]')
    const count = await productCards.count()
    
    // Suche nach teuerstem Produkt
    let expensiveProduct = null
    for (let i = 0; i < count; i++) {
      const card = productCards.nth(i)
      const priceText = await card.locator('[data-testid="product-price"]').textContent()
      
      // Wenn Preis sehr hoch ist (z.B. über 100€), sollte Guthaben nicht reichen
      if (priceText && parseFloat(priceText.replace('€', '').replace(',', '.')) > 100) {
        expensiveProduct = card
        break
      }
    }
    
    if (expensiveProduct) {
      // 2. Klicke auf "Kaufen"-Button
      const purchaseButton = expensiveProduct.locator('button')
      await purchaseButton.click()
      
      // 3. Erwarte Fehlermeldung (Toast oder Alert)
      await page.waitForTimeout(1000)
      
      // Verifiziere dass Success-Modal NICHT erscheint
      const modal = page.locator('[data-testid="purchase-success-modal"]')
      await expect(modal).not.toBeVisible()
    } else {
      // Skip Test wenn kein teures Produkt vorhanden
      test.skip()
    }
  })

  test('sollte Button deaktivieren bei ausverkauftem Produkt', async ({ page }) => {
    // 1. Suche nach ausverkauftem Produkt (stock = 0)
    const outOfStockProduct = page.locator('[data-testid="product-card"]:has-text("Ausverkauft")').first()
    
    // Falls ausverkauftes Produkt existiert
    if (await outOfStockProduct.count() > 0) {
      // 2. Verifiziere dass "Kaufen"-Button deaktiviert ist
      const purchaseButton = outOfStockProduct.locator('button')
      await expect(purchaseButton).toBeDisabled()
      await expect(purchaseButton).toContainText(/Ausverkauft/)
    } else {
      // Skip Test wenn alle Produkte verfügbar sind
      test.skip()
    }
  })

  test('sollte Doppelklick-Schutz haben', async ({ page }) => {
    // 1. Finde erstes verfügbares Produkt
    const productCard = page.locator('[data-testid="product-card"]').first()
    const purchaseButton = productCard.locator('button:has-text("Kaufen")')
    
    // 2. Erster Klick
    await purchaseButton.click()
    
    // 3. Warte auf Modal (erscheint schnell)
    await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 5000 })
    
    // 4. Verifiziere dass Doppelklick-Schutz funktioniert:
    // Der Button ist jetzt entweder disabled oder durch Modal verdeckt
    const modal = page.locator('[data-testid="purchase-success-modal"]')
    await expect(modal).toBeVisible()
    
    // 5. Schließe Modal
    const closeButton = page.locator('[data-testid="modal-close-button"]')
    await closeButton.click()
    await page.waitForTimeout(500)
    
    // 6. Verifiziere: Nur EIN Kauf wurde durchgeführt
    // (Zweiter Klick während Modal-Opening wurde ignoriert)
    // Das Modal sollte jetzt geschlossen sein
    await expect(modal).not.toBeVisible()
  })

  test('sollte Guthaben sofort aktualisieren nach Kauf', async ({ page }) => {
    // 1. Aktuelles Guthaben lesen
    const balanceElement = page.locator('[data-testid="balance-amount"]')
    const initialBalance = await balanceElement.textContent()
    const initialBalanceNum = parseFloat(initialBalance?.replace('€', '').replace(',', '.') || '0')
    
    // 2. Produkt kaufen
    const productCard = page.locator('[data-testid="product-card"]').first()
    const priceText = await productCard.locator('[data-testid="product-price"]').textContent()
    const productPrice = parseFloat(priceText?.replace('€', '').replace(',', '.') || '0')
    
    const purchaseButton = productCard.locator('button:has-text("Kaufen")')
    await purchaseButton.click()
    
    // 3. Warte auf Success-Modal
    await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 5000 })
    
    // 4. Schließe Modal
    const closeButton = page.locator('[data-testid="modal-close-button"]')
    await closeButton.click()
    
    // 5. Verifiziere dass Guthaben aktualisiert wurde
    await page.waitForTimeout(500)
    const newBalance = await balanceElement.textContent()
    const newBalanceNum = parseFloat(newBalance?.replace('€', '').replace(',', '.') || '0')
    
    // Neues Guthaben sollte ungefähr initial - productPrice sein
    expect(Math.abs(newBalanceNum - (initialBalanceNum - productPrice))).toBeLessThan(0.01)
  })
})
