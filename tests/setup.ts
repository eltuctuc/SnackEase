/**
 * Test Setup für SnackEase
 * 
 * Initialisiert:
 * - Pinia Stores
 * - Nuxt useCookie Mock
 * - $fetch Mock für API-Tests
 * - Router Mock
 */

import { beforeAll, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const piniaInstance = createPinia()

beforeAll(() => {
  setActivePinia(piniaInstance)
})

vi.mock('nuxt/app', () => ({
  useCookie: vi.fn((_name: string) => {
    return {
      value: undefined,
    }
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
  navigateTo: vi.fn(),
  useRoute: () => ({
    query: {},
    params: {},
  }),
  useRuntimeConfig: () => ({
    public: {},
  }),
}))

const mockFetch = vi.fn()
vi.mock('ofetch', () => ({
  default: mockFetch,
  $fetch: mockFetch,
}))

export { piniaInstance as pinia, mockFetch }
export { createMockFetch, clearMockFetch } from './mocks/fetch'

export function createMockUser() {
  return {
    id: 1,
    email: 'test@demo.de',
    name: 'Test User',
    role: 'mitarbeiter' as const,
    location: 'Berlin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  }
}
