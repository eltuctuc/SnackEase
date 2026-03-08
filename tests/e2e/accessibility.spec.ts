import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('Homepage hat korrekte Struktur', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('h1')).toHaveText('SnackEase')
    await expect(page.locator('[role="main"]')).toBeVisible()
  })

  test('Login-Formular hat ARIA-Attribute', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('input[type="email"]')).toHaveAttribute('aria-label')
    await expect(page.locator('input[type="password"]')).toHaveAttribute('aria-label')
  })

  test('Fehlermeldungen sind ARIA-alerts', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'test@test.de')
    await page.fill('input[type="password"]', 'falsch')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test('Progress-Bar hat ARIA-Attribute', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow')
    await expect(page.locator('[aria-live="polite"]')).toBeVisible()
  })

  test.skip('Dashboard hat Status-Element für Guthaben', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('text=Nina Neuanfang')
    await page.fill('input[type="email"]', 'nina@demo.de')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    await expect(page.locator('[role="status"]')).toBeVisible()
  })

  test('Tastaturnavigation funktioniert', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })

    // Warte bis Seite geladen ist
    await page.waitForSelector('button')

    const firstButton = page.locator('button').first()
    await firstButton.focus()

    // Warte kurz, damit der Fokus gesetzt werden kann
    await page.waitForTimeout(100)

    const isFocused = await firstButton.evaluate(el => document.activeElement === el)
    expect(isFocused).toBe(true)
  })

  test('alle Bilder haben Alt-Texte', async ({ page }) => {
    await page.goto('/login')
    
    const images = page.locator('img')
    const count = await images.count()
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })
})
