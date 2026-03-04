import { vi } from 'vitest'

type MockFetchResponse = unknown
type MockFetch = ReturnType<typeof vi.fn>

let mockFetch: MockFetch

export function setupMockFetch() {
  mockFetch = vi.fn()
  return mockFetch
}

export function createMockFetch() {
  return vi.fn()
}

export function clearMockFetch() {
  if (mockFetch) {
    mockFetch.mockClear()
  }
}

export function mockFetchResponse(response: MockFetchResponse) {
  if (mockFetch) {
    mockFetch.mockResolvedValue(response)
  }
}

export function mockFetchError(error: Error) {
  if (mockFetch) {
    mockFetch.mockRejectedValue(error)
  }
}

export { mockFetch }
