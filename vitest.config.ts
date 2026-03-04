import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.vue',
    ],
    exclude: [
      '**/e2e/**',
      '**/tests/e2e/**',
      '**/node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.ts',
        'src/**/*.vue',
      ],
      exclude: [
        'node_modules/',
        '.nuxt/',
        '.output/',
        'dist/',
        '**/*.config.*',
        '**/types/**',
        '**/*.d.ts',
        '**/e2e/**',
        '**/tests/e2e/**',
      ],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
