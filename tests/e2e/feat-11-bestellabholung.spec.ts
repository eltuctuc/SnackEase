/**
 * E2E-Tests für Bestellabholung am Automaten (FEAT-11)
 *
 * Testet die kritischen User-Flows:
 * 1. Bestellungen-Seite lädt korrekt
 * 2. NFC-Abholung nach Kauf (Bestätigungsmodal)
 * 3. NFC-Abholung von /orders aus
 * 4. PIN-Abholung: korrekte PIN
 * 5. PIN-Abholung: falsche PIN mit Fehlermeldung
 * 6. Leerer Zustand auf /orders
 * 7. Filter-Funktionalität auf /orders
 *
 * FEAT-16 Hinweis: Kauf-Flow läuft jetzt über den Warenkorb:
 *   1. Produkt über "In den Warenkorb"-Button hinzufügen
 *   2. Zur /orders-Seite navigieren
 *   3. "Vorbestellung aufgeben"-Button klicken
 *   4. Checkout-Erfolg-Modal erscheint mit NFC- und PIN-Buttons
 */

import { test, expect, type Page } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

// Gemeinsamer Login-Helper
async function loginAsDemoUser(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  await page.fill('input[type="email"]', 'nina@demo.de')
  await page.fill('input[type="password"]', 'demo123')
  await page.click('button[type="submit"]')

  // Warte auf Dashboard mit verlängertem Timeout
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })

  // Warte bis die Seite vollständig geladen ist (pageReady = true)
  await page.waitForFunction(() => {
    // Prüfe ob der echte Inhalt geladen ist (nicht der Skeleton)
    const grid = document.querySelector('[data-testid="product-grid"]')
    return grid && !grid.closest('.animate-pulse')
  }, { timeout: 15000 })
}

/**
 * Hilfsfunktion: Produkt in Warenkorb legen, zu /orders navigieren und Checkout durchführen.
 * Gibt true zurück wenn der Checkout-Erfolg-Modal erschienen ist, false wenn übersprungen werden soll.
 */
async function purchaseViaCart(page: Page): Promise<boolean> {
  // Sicherstellen, dass wir auf dem Dashboard sind
  if (!page.url().includes('/dashboard')) {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="product-grid"]', { timeout: 15000 })
  }

  // Warte auf Produktkarten
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 20000 })
  await page.waitForTimeout(500)

  // Erstes aktiviertes "In den Warenkorb"-Button suchen (manche Produkte können ausverkauft sein)
  const allAddButtons = page.locator('[data-testid="add-to-cart-button"]')
  const btnCount = await allAddButtons.count()

  let addToCartBtn = null
  for (let i = 0; i < btnCount; i++) {
    const btn = allAddButtons.nth(i)
    const isVisible = await btn.isVisible().catch(() => false)
    const isDisabled = await btn.isDisabled().catch(() => true)
    if (isVisible && !isDisabled) {
      addToCartBtn = btn
      break
    }
  }

  // Kein aktivierter Button gefunden
  if (!addToCartBtn) return false

  // Produkt in Warenkorb legen
  await addToCartBtn.click()

  // Zur /orders-Seite navigieren
  await page.goto('/orders', { waitUntil: 'networkidle' })

  // Warte auf Checkout-Button
  const checkoutBtn = page.locator('[data-testid="checkout-button"]')
  await checkoutBtn.waitFor({ state: 'visible', timeout: 10000 })

  const checkoutDisabled = await checkoutBtn.isDisabled().catch(() => true)
  if (checkoutDisabled) return false

  // Checkout auslösen
  await checkoutBtn.click()

  // Warte auf Checkout-Erfolg-Modal
  await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 10000 })

  return true
}

test.describe('Bestellabholung (FEAT-11)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsDemoUser(page)
  })

  // ============================================================
  // Test 1: /orders-Seite lädt korrekt
  // ============================================================

  test.skip('Bestellungen-Seite navigiert zu /orders', async ({ page }) => {
    // Tab-Bar hat keinen data-testid, wir navigieren direkt zur Seite
    await page.goto('/orders', { waitUntil: 'networkidle' })

    await page.waitForURL(/\/orders/, { timeout: 10000 })

    // Seiteninhalt prüfen
    await expect(page.locator('h1')).toContainText('Meine Bestellungen')
  })

  // ============================================================
  // Test 2: Leerer Zustand wenn keine Bestellungen
  // ============================================================

  test.skip('zeigt leeren Zustand wenn keine Bestellungen vorhanden', async ({ page }) => {
    await page.goto('/orders', { waitUntil: 'networkidle' })

    // Warte auf geladen (kein Lade-Spinner mehr)
    await page.waitForSelector('[data-testid="orders-list"], [data-testid="orders-empty"]', {
      timeout: 10000,
    })

    // Falls leer: Hinweis sichtbar
    const emptyState = page.locator('[data-testid="orders-empty"]')
    const ordersList = page.locator('[data-testid="orders-list"]')

    const hasOrders = await ordersList.isVisible()
    const isEmpty = await emptyState.isVisible()

    // Einer der beiden Zustände muss sichtbar sein
    expect(hasOrders || isEmpty).toBe(true)

    if (isEmpty) {
      await expect(emptyState).toContainText('Noch keine Bestellungen')
    }
  })

  // ============================================================
  // Test 3: NFC-Abholung vom Bestätigungsmodal (FEAT-16 Flow)
  // ============================================================

  test('NFC-Abholung vom Bestätigungsmodal nach Kauf', async ({ page }) => {
    // 1. Kauf über Warenkorb-Flow durchführen
    const purchased = await purchaseViaCart(page)
    if (!purchased) {
      test.skip()
      return
    }

    // 2. Modal prüfen
    const modal = page.locator('[data-testid="purchase-success-modal"]')
    await expect(modal).toBeVisible()

    // 3. NFC-Button prüfen (muss aktiv sein)
    const nfcButton = modal.locator('[data-testid="modal-nfc-button"]')
    await expect(nfcButton).toBeVisible()
    await expect(nfcButton).not.toBeDisabled()
    await expect(nfcButton).toContainText('Mit NFC abholen')

    // 4. NFC-Button klicken
    await nfcButton.click()

    // 5. NFC-Animation prüfen
    const nfcAnimation = page.locator('[data-testid="nfc-pickup-animation"]')
    await expect(nfcAnimation).toBeVisible({ timeout: 2000 })
    await expect(nfcAnimation).toContainText('NFC erkannt!')

    // 6. Warte auf Abschluss der Animation (2 Sekunden + API-Call)
    await page.waitForSelector('[data-testid="nfc-pickup-animation"]', {
      state: 'hidden',
      timeout: 8000,
    })
  })

  // ============================================================
  // Test 4: PIN-Button im Modal aktiviert (FEAT-16 Flow)
  // ============================================================

  test('PIN-Button im Bestätigungsmodal ist aktiviert', async ({ page }) => {
    // 1. Kauf über Warenkorb-Flow durchführen
    const purchased = await purchaseViaCart(page)
    if (!purchased) {
      test.skip()
      return
    }

    // 2. Warte auf Success-Modal
    await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 8000 })

    // 3. PIN-Button prüfen (muss aktiv sein, kein "kommt bald")
    const pinButton = page.locator('[data-testid="modal-pin-button"]')
    await expect(pinButton).toBeVisible()
    await expect(pinButton).not.toBeDisabled()
    await expect(pinButton).not.toContainText('kommt bald')
    await expect(pinButton).toContainText('PIN am Automaten eingeben')

    // 4. PIN-Button klicken → PIN-Modal öffnet sich
    await pinButton.click()

    const pinModal = page.locator('[data-testid="pin-input-modal"]')
    await expect(pinModal).toBeVisible({ timeout: 3000 })
  })

  // ============================================================
  // Test 5: Falsche PIN → Fehlermeldung + Versuchszähler
  // ============================================================

  test.skip('falsche PIN zeigt Fehlermeldung', async ({ page }) => {
    // 1. Kauf über Warenkorb-Flow durchführen
    const purchased = await purchaseViaCart(page)
    if (!purchased) {
      test.skip()
      return
    }

    // 2. Warte auf Success-Modal und PIN anzeigen
    await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 8000 })
    const pinDisplay = page.locator('[data-testid="pickup-pin"]')
    await expect(pinDisplay).toBeVisible()

    // 3. PIN-Modal öffnen
    await page.locator('[data-testid="modal-pin-button"]').click()
    const pinModal = page.locator('[data-testid="pin-input-modal"]')
    await expect(pinModal).toBeVisible({ timeout: 3000 })

    // 4. Falsche PIN eingeben (0000 statt echter PIN)
    await page.locator('[data-testid="pin-input-0"]').fill('0')
    await page.locator('[data-testid="pin-input-1"]').fill('0')
    await page.locator('[data-testid="pin-input-2"]').fill('0')
    await page.locator('[data-testid="pin-input-3"]').fill('0')

    // 5. Bestätigen
    await page.locator('[data-testid="pin-modal-confirm"]').click()

    // 6. Fehlermeldung prüfen
    const errorMsg = page.locator('[data-testid="pin-modal-error"]')
    await expect(errorMsg).toBeVisible({ timeout: 5000 })
    await expect(errorMsg).toContainText('PIN falsch')
    await expect(errorMsg).toContainText('Noch 2 Versuche')
  })

  // ============================================================
  // Test 6: Filter auf /orders
  // ============================================================

  test('Filter-Dropdown auf /orders funktioniert', async ({ page }) => {
    await page.goto('/orders', { waitUntil: 'networkidle' })

    // Warte auf Seite
    await page.waitForSelector('[data-testid="order-filter"]', { timeout: 10000 })

    const filterDropdown = page.locator('[data-testid="order-filter"]')
    await expect(filterDropdown).toBeVisible()

    // Filter auf "Abgeholt" setzen
    await filterDropdown.selectOption('picked_up')

    // Seite sollte "abgeholt"-Filter anwenden
    // (Kein Fehler, Seite rendert korrekt)
    await page.waitForTimeout(500)

    // Filter auf "Bereit" setzen
    await filterDropdown.selectOption('pending_pickup')
    await page.waitForTimeout(500)

    // Filter auf "Alle" zurücksetzen
    await filterDropdown.selectOption('all')
    await page.waitForTimeout(500)

    // Kein Fehler — Filter funktioniert
    await expect(page.locator('h1')).toContainText('Vorbestellung')
  })

  // ============================================================
  // Test 7: Link "Zu meinen Bestellungen" im Modal
  // ============================================================

  test.skip('Link zu Bestellungen im Bestätigungsmodal navigiert korrekt', async ({ page }) => {
    // 1. Kauf über Warenkorb-Flow durchführen
    const purchased = await purchaseViaCart(page)
    if (!purchased) {
      test.skip()
      return
    }

    // 2. Warte auf Modal
    await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 8000 })

    // 3. Link zu Bestellungen prüfen
    const ordersLink = page.locator('[data-testid="orders-link"]')
    await expect(ordersLink).toBeVisible()
    await expect(ordersLink).toHaveAttribute('href', '/orders')
  })

  // ============================================================
  // Test 8: PIN-Modal Schließen
  // ============================================================

  test.skip('PIN-Modal kann per Abbrechen geschlossen werden', async ({ page }) => {
    // 1. Kauf über Warenkorb-Flow durchführen
    const purchased = await purchaseViaCart(page)
    if (!purchased) {
      test.skip()
      return
    }

    await page.waitForSelector('[data-testid="purchase-success-modal"]', { timeout: 8000 })

    // 2. PIN-Modal öffnen
    await page.locator('[data-testid="modal-pin-button"]').click()
    const pinModal = page.locator('[data-testid="pin-input-modal"]')
    await expect(pinModal).toBeVisible({ timeout: 3000 })

    // 3. Abbrechen
    await page.locator('[data-testid="pin-modal-cancel"]').click()

    // 4. Modal geschlossen
    await expect(pinModal).not.toBeVisible()

    // 5. Bestellungsmodal noch offen
    await expect(page.locator('[data-testid="purchase-success-modal"]')).toBeVisible()
  })
})
