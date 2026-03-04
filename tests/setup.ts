/**
 * Test Setup für Pinia Stores
 * 
 * Initialisiert Pinia für alle Unit-Tests
 */

import { createPinia, setActivePinia } from 'pinia'

// Erstelle Pinia-Instanz einmal und aktiviere sie
const pinia = createPinia()

// Aktiviere Pinia für alle Tests
beforeAll(() => {
  setActivePinia(pinia)
})

// Exportiere für manuelle Nutzung falls nötig
export { pinia }
