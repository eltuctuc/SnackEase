# Store Tests

Dieses Verzeichnis enthält Unit-Tests für die Pinia Stores.

## Aktueller Status

**HINWEIS:** Die Store-Tests sind derzeit übersprungen (skipped), da sie ein vollständiges Nuxt/Pinia-Test-Setup erfordern.

### Problem

Die Stores verwenden `defineStore` ohne direkten Import:
```typescript
export const useAuthStore = defineStore('auth', () => {
  // ...
})
```

Dies funktioniert in der Nuxt-Applikation durch das `@pinia/nuxt` Modul, das `defineStore` automatisch global verfügbar macht. Im Test-Kontext ist diese automatische Konfiguration nicht verfügbar.

### Lösung

Um die Store-Tests zu aktivieren, gibt es zwei Optionen:

1. **@nuxt/test-utils verwenden:**
   ```bash
   npm install -D @nuxt/test-utils
   ```
   
   Dann können die Tests mit `createTestingPinia()` oder `setupNuxt()` ausgeführt werden.

2. **defineStore explizit importieren:**
   
   Die Stores könnten angepasst werden, um `defineStore` explizit zu importieren:
   ```typescript
   import { defineStore } from 'pinia'
   
   export const useAuthStore = defineStore('auth', () => {
     // ...
   })
   ```

## Vorhandene Tests

- `auth.test.ts` - Auth Store Tests (19 Tests)
- `credits.test.ts` - Credits Store Tests (8 Tests)

## Ausführung

```bash
# Alle Tests ausführen
npm test

# Nur Composables (funktioniert)
npm run test -- tests/composables/

# Store-Tests übersprungen
npm run test -- tests/stores/
```
