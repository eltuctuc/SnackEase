import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('lädt und zeigt Willkommensseite', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/SnackEase/)
    await expect(page.locator('h1')).toContainText('SnackEase')
  })

  test('zeigt Lade-Progress', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=Laden')).toBeVisible()
  })
})

test.describe('Login-Flow', () => {
  test('zeigt Login-Seite mit Persona-Auswahl', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('h1')).toContainText('SnackEase')
    await expect(page.locator('text=Willkommen zurück')).toBeVisible()
    await expect(page.locator('text=Wähle dein Profil')).toBeVisible()
  })

  test('zeigt alle Demo-Personas', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('text=Nina Neuanfang')).toBeVisible()
    await expect(page.locator('text=Maxine Snackliebhaber')).toBeVisible()
    await expect(page.locator('text=Lucas Gesundheitsfan')).toBeVisible()
  })

  test('wählt Persona aus und füllt Formular', async ({ page }) => {
    await page.goto('/login')
    
    await page.click('text=Nina Neuanfang')
    
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveValue('nina@demo.de')
  })

  test('zeigt Fehler bei falschen Credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'falsch@test.de')
    await page.fill('input[type="password"]', 'falsch')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('role=alert')).toBeVisible()
  })
})

test.describe('Authentifizierung', () => {
  test('Mitarbeiter-Login funktioniert', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.waitForSelector('input[type="email"]', { timeout: 15000 })

    await page.fill('input[type="email"]', 'nina@demo.de')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard', { timeout: 15000 })

    const cookies = await page.context().cookies()
    const authCookie = cookies.find(c => c.name === 'auth_token')
    expect(authCookie).toBeDefined()
  })

  test('redirect zu Login wenn nicht authentifiziert', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.waitForURL('/login', { timeout: 10000 })
  })
})

test.describe('Navigation', () => {
  test('alle Hauptseiten sind erreichbar', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    
    await page.goto('/')
    await expect(page).toHaveURL(/(\/login|\/dashboard)/)
  })
})
