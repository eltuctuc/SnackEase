/**
 * E2E-Tests fuer FEAT-21: Admin Einstellungsseite
 *
 * Testet die kritischen User-Flows:
 * 1. /admin/settings erreichbar und zeigt vollstaendigen Inhalt (kein Platzhalter)
 * 2. Logout-Button beendet Session und leitet zu /login weiter
 * 3. System-Reset-Dialog: oeffnet sich, Button deaktiviert ohne "RESET"-Eingabe,
 *    aktiviert sich nach korrekter Eingabe
 * 4. Guthaben-Reset-Dialog: oeffnet sich, Abbrechen schliesst ohne API-Call
 * 5. /admin (index.vue) zeigt keine "System-Aktionen"-Karten mehr
 * 6. Nicht eingeloggter Zugriff auf /admin/settings leitet zu /login weiter
 *
 * Voraussetzung: Applikation laeuft auf http://localhost:3000
 * Demo-Credentials:
 * - Admin: admin@demo.de / admin123
 */

import { test, expect } from '@playwright/test'

/**
 * Hilfsfunktion: Login als Admin und Weiterleitung zu /admin abwarten
 */
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[type="email"]', { timeout: 15000 })
  await page.fill('input[type="email"]', 'admin@demo.de')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL('/admin', { timeout: 15000 })
}

test.describe('FEAT-21: Admin Einstellungsseite', () => {

  // ========================================
  // Flow 1: Seite erreichbar + kein Platzhalter
  // ========================================
  test.describe('Seiteninhalt', () => {
    test('AC-1: /admin/settings ist erreichbar und zeigt vollstaendigen Inhalt', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })

      // Seitenheader mit Titel "Einstellungen" sichtbar
      await expect(page.getByRole('heading', { name: 'Einstellungen' })).toBeVisible({ timeout: 10000 })

      // Kein Platzhalter-Text mehr sichtbar
      await expect(page.locator('text=Einstellungsseiten-Inhalt')).not.toBeVisible()
      await expect(page.locator('text=zukuenftigen Feature')).not.toBeVisible()
    })

    test('AC-2: Seite enthaelt Logout-Button', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 10000 })

      await expect(page.locator('button:has-text("Abmelden")')).toBeVisible()
    })

    test('AC-4: Seite enthaelt System-Reset-Button', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 10000 })

      await expect(page.locator('button:has-text("System-Reset durchfuehren")')).toBeVisible()
    })

    test('AC-7: Seite enthaelt Guthaben-Reset-Button', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 10000 })

      await expect(page.locator('button:has-text("Guthaben-Reset durchfuehren")')).toBeVisible()
    })
  })

  // ========================================
  // Flow 2: Logout
  // ========================================
  test.describe('Logout', () => {
    test('AC-3: Logout beendet Session und leitet zu /login weiter', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("Abmelden")', { timeout: 10000 })

      await page.click('button:has-text("Abmelden")')
      await page.waitForURL('/login', { timeout: 15000 })

      await expect(page).toHaveURL(/\/login/)
    })
  })

  // ========================================
  // Flow 3: System-Reset-Dialog
  // ========================================
  test.describe('System-Reset-Dialog', () => {
    test('AC-5: System-Reset-Dialog oeffnet sich nach Klick auf Button', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("System-Reset durchfuehren")', { timeout: 10000 })

      await page.click('button:has-text("System-Reset durchfuehren")')

      // Dialog mit Titel sichtbar
      await expect(page.getByRole('dialog', { name: 'System-Reset' })).toBeVisible()
    })

    test('EC-1: Bestaetigen-Button deaktiviert ohne "RESET"-Eingabe', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("System-Reset durchfuehren")', { timeout: 10000 })

      await page.click('button:has-text("System-Reset durchfuehren")')
      await expect(page.getByRole('dialog', { name: 'System-Reset' })).toBeVisible()

      // Bestaetigen-Button ist deaktiviert solange kein "RESET" eingegeben
      const confirmButton = page.locator('[role="dialog"] button:has-text("Reset bestaetigen")')
      await expect(confirmButton).toBeDisabled()
    })

    test('EC-1: Bestaetigen-Button aktiviert sich nach korrekter "RESET"-Eingabe', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("System-Reset durchfuehren")', { timeout: 10000 })

      await page.click('button:has-text("System-Reset durchfuehren")')
      await expect(page.getByRole('dialog', { name: 'System-Reset' })).toBeVisible()

      // "RESET" im Eingabefeld eingeben
      await page.fill('#system-reset-confirm', 'RESET')

      // Bestaetigen-Button jetzt aktiv
      const confirmButton = page.locator('[role="dialog"] button:has-text("Reset bestaetigen")')
      await expect(confirmButton).toBeEnabled()
    })

    test('EC-2: Schliessen-Button schliesst Dialog ohne API-Call', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("System-Reset durchfuehren")', { timeout: 10000 })

      await page.click('button:has-text("System-Reset durchfuehren")')
      await expect(page.getByRole('dialog', { name: 'System-Reset' })).toBeVisible()

      // API-Aufruf ueberwachen
      let apiCalled = false
      page.on('request', (req) => {
        if (req.url().includes('/api/admin/reset') && req.method() === 'POST') {
          apiCalled = true
        }
      })

      // Dialog schliessen via X-Button
      await page.click('[aria-label="Modal schliessen"]')
      await expect(page.getByRole('dialog', { name: 'System-Reset' })).not.toBeVisible()

      expect(apiCalled).toBe(false)
    })

    test('EC-2: Eingabefeld wird nach Schliessen zurueckgesetzt', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("System-Reset durchfuehren")', { timeout: 10000 })

      // Modal oeffnen, Text eingeben, schliessen
      await page.click('button:has-text("System-Reset durchfuehren")')
      await page.fill('#system-reset-confirm', 'RESET')
      await page.click('[aria-label="Modal schliessen"]')

      // Modal erneut oeffnen: Eingabefeld ist leer
      await page.click('button:has-text("System-Reset durchfuehren")')
      await expect(page.locator('#system-reset-confirm')).toHaveValue('')
    })
  })

  // ========================================
  // Flow 4: Guthaben-Reset-Dialog
  // ========================================
  test.describe('Guthaben-Reset-Dialog', () => {
    test('AC-8: Guthaben-Reset-Dialog oeffnet sich nach Klick auf Button', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("Guthaben-Reset durchfuehren")', { timeout: 10000 })

      await page.click('button:has-text("Guthaben-Reset durchfuehren")')

      // Dialog mit Titel sichtbar
      await expect(page.getByRole('dialog', { name: 'Guthaben-Reset' })).toBeVisible()
    })

    test('Guthaben-Reset-Dialog enthaelt Erklaerungstext', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("Guthaben-Reset durchfuehren")', { timeout: 10000 })

      await page.click('button:has-text("Guthaben-Reset durchfuehren")')
      await expect(page.getByRole('dialog', { name: 'Guthaben-Reset' })).toBeVisible()

      // Erklaerungstext vorhanden
      await expect(page.locator('[role="dialog"]:has-text("25 EUR")')).toBeVisible()
    })

    test('Abbrechen schliesst Dialog ohne API-Call', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('button:has-text("Guthaben-Reset durchfuehren")', { timeout: 10000 })

      await page.click('button:has-text("Guthaben-Reset durchfuehren")')
      await expect(page.getByRole('dialog', { name: 'Guthaben-Reset' })).toBeVisible()

      // API-Aufruf ueberwachen
      let apiCalled = false
      page.on('request', (req) => {
        if (req.url().includes('/api/admin/credits/reset') && req.method() === 'POST') {
          apiCalled = true
        }
      })

      // Abbrechen klicken
      await page.locator('[role="dialog"] button:has-text("Abbrechen")').click()
      await expect(page.getByRole('dialog', { name: 'Guthaben-Reset' })).not.toBeVisible()

      expect(apiCalled).toBe(false)
    })
  })

  // ========================================
  // Flow 5: admin/index.vue ohne Reset-Karten
  // ========================================
  test.describe('admin/index.vue bereinigt (AC-10)', () => {
    test('AC-10: Admin-Dashboard zeigt keine System-Aktionen-Karten mehr', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin', { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 10000 })

      // Warten bis Seite geladen (Skeleton weg)
      await page.waitForTimeout(2000)

      // Keine Reset-Buttons auf der Dashboard-Seite
      await expect(page.locator('button:has-text("System-Reset durchfuehren")')).not.toBeVisible()
      await expect(page.locator('button:has-text("Guthaben-Reset durchfuehren")')).not.toBeVisible()

      // Kein Abschnitt "System-Aktionen" mehr
      await expect(page.locator('text=System-Aktionen')).not.toBeVisible()
    })

    test('Dashboard-Subtitle lautet "Systemuebersicht" (nicht "Reset-Funktionen")', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin', { waitUntil: 'networkidle' })
      await page.waitForSelector('h1', { timeout: 10000 })

      // Alter Text darf nicht mehr vorhanden sein
      await expect(page.locator('text=Reset-Funktionen')).not.toBeVisible()

      // Neuer Text ist vorhanden
      await expect(page.locator('text=Systemübersicht')).toBeVisible()
    })
  })

  // ========================================
  // Flow 6: Auth-Guard
  // ========================================
  test.describe('Auth-Guard (AC-11)', () => {
    test('Nicht eingeloggter Nutzer wird von /admin/settings zu /login weitergeleitet', async ({ page }) => {
      // Ohne Login direkt /admin/settings aufrufen
      await page.goto('/admin/settings', { waitUntil: 'networkidle' })
      await page.waitForURL('/login', { timeout: 10000 })

      await expect(page).toHaveURL(/\/login/)
    })
  })

})
