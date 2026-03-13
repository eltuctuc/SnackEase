/**
 * Unit-Tests für useLeaderboard Composable
 *
 * Testet:
 * - Standard-Zeitraum beim Initialisieren ist "week"
 * - Zeitraum-Wechsel setzt korrekten Query-Parameter
 * - Tab-Wechsel löst keinen neuen API-Call aus
 * - Eigener Rang wird korrekt aus der Liste identifiziert (Vergleich User-ID)
 * - Leerer Zustand wird korrekt erkannt (leere Liste)
 * - Fehler-Zustand wird korrekt erkannt (API-Fehler)
 * - totalPoints-Tab gibt PointsLeaderboardEntry[] zurück (FEAT-23)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { useLeaderboard } from '~/composables/useLeaderboard'

// $fetch global mock
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

const mockEntries = [
  { rank: 1, id: 42, name: 'Nina Neuanfang', location: 'Nürnberg', isActive: true, totalPurchases: 12, healthPoints: 28 },
  { rank: 2, id: 7, name: 'Tom Schnellkäufer', location: 'Berlin', isActive: true, totalPurchases: 10, healthPoints: 20 },
  { rank: 3, id: 99, name: 'Max Muster', location: 'Berlin', isActive: false, totalPurchases: 8, healthPoints: 10 },
]

const mockPointsEntries = [
  { rank: 1, id: 7, name: 'Tom Schnellkäufer', location: 'Berlin', isActive: true, totalPoints: 150 },
  { rank: 2, id: 42, name: 'Nina Neuanfang', location: 'Nürnberg', isActive: true, totalPoints: 120 },
  { rank: 3, id: 99, name: 'Max Muster', location: 'Berlin', isActive: false, totalPoints: 85 },
]

const mockResponse = {
  period: 'week' as const,
  mostPurchased: mockEntries,
  healthiest: [...mockEntries].reverse().map((e, i) => ({ ...e, rank: i + 1 })),
  totalPoints: mockPointsEntries,
}

describe('useLeaderboard', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('Initial State', () => {
    it('startet mit Zeitraum "week"', () => {
      const { period } = useLeaderboard(ref(42))
      expect(period.value).toBe('week')
    })

    it('startet mit Tab "mostPurchased"', () => {
      const { activeTab } = useLeaderboard(ref(42))
      expect(activeTab.value).toBe('mostPurchased')
    })

    it('isLoading ist initial false', () => {
      const { isLoading } = useLeaderboard(ref(42))
      expect(isLoading.value).toBe(false)
    })

    it('error ist initial null', () => {
      const { error } = useLeaderboard(ref(42))
      expect(error.value).toBeNull()
    })
  })

  describe('fetchLeaderboard', () => {
    it('lädt Daten und setzt isLoading korrekt', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, isLoading, currentList } = useLeaderboard(ref(42))

      const promise = fetchLeaderboard()
      expect(isLoading.value).toBe(true)
      await promise
      expect(isLoading.value).toBe(false)
      expect(currentList.value).toHaveLength(3)
    })

    it('sendet korrekten period-Parameter für "week"', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, period } = useLeaderboard(ref(42))

      expect(period.value).toBe('week')
      await fetchLeaderboard()
      expect(mockFetch).toHaveBeenCalledWith('/api/leaderboard?period=week')
    })

    it('setzt Fehler-State bei API-Fehler', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      const { fetchLeaderboard, error, isLoading } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      expect(error.value).toBe('Rangliste konnte nicht geladen werden.')
      expect(isLoading.value).toBe(false)
    })

    it('setzt error auf null vor neuem Fetch', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'))
      const { fetchLeaderboard, error } = useLeaderboard(ref(42))
      await fetchLeaderboard()
      expect(error.value).not.toBeNull()

      mockFetch.mockResolvedValueOnce(mockResponse)
      await fetchLeaderboard()
      expect(error.value).toBeNull()
    })
  })

  describe('setPeriod', () => {
    it('wechselt Zeitraum und sendet neuen API-Call', async () => {
      mockFetch.mockResolvedValue(mockResponse)
      const { setPeriod, period } = useLeaderboard(ref(42))

      await setPeriod('month')
      expect(period.value).toBe('month')
      expect(mockFetch).toHaveBeenCalledWith('/api/leaderboard?period=month')
    })

    it('sendet keinen neuen API-Call wenn Zeitraum gleich bleibt', async () => {
      mockFetch.mockResolvedValue(mockResponse)
      const { setPeriod } = useLeaderboard(ref(42))

      await setPeriod('week') // bleibt bei 'week'
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('sendet korrekten Parameter für "all"', async () => {
      mockFetch.mockResolvedValue(mockResponse)
      const { setPeriod } = useLeaderboard(ref(42))

      await setPeriod('all')
      expect(mockFetch).toHaveBeenCalledWith('/api/leaderboard?period=all')
    })
  })

  describe('setTab', () => {
    it('wechselt Tab ohne neuen API-Call', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, setTab, activeTab } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      mockFetch.mockClear()

      setTab('healthiest')
      await nextTick()
      expect(activeTab.value).toBe('healthiest')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('zeigt korrekte Liste für "mostPurchased"-Tab', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, setTab, currentList } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      setTab('mostPurchased')
      await nextTick()
      expect(currentList.value[0].rank).toBe(1)
      expect(currentList.value[0].id).toBe(42)
    })

    it('zeigt korrekte Liste für "healthiest"-Tab', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, setTab, currentList } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      setTab('healthiest')
      await nextTick()
      // healthiest-Liste ist reversed: rank 1 = id 99
      expect(currentList.value[0].id).toBe(99)
    })

    it('wechselt Tab zu "totalPoints" ohne neuen API-Call', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, setTab, activeTab } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      mockFetch.mockClear()

      setTab('totalPoints')
      await nextTick()
      expect(activeTab.value).toBe('totalPoints')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('zeigt korrekte PointsLeaderboardEntry-Liste für "totalPoints"-Tab', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, setTab, currentList } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      setTab('totalPoints')
      await nextTick()
      expect(currentList.value).toHaveLength(3)
      // totalPoints-Liste: rank 1 = id 7
      expect(currentList.value[0].id).toBe(7)
      expect((currentList.value[0] as { totalPoints: number }).totalPoints).toBe(150)
    })

    it('gibt PointsLeaderboardEntry als ownEntry zurück wenn totalPoints-Tab aktiv', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      // User 42 ist in mockPointsEntries auf Rang 2
      const { fetchLeaderboard, setTab, ownEntry } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      setTab('totalPoints')
      await nextTick()
      expect(ownEntry.value?.id).toBe(42)
      expect((ownEntry.value as { totalPoints: number } | undefined)?.totalPoints).toBe(120)
    })

    it('gibt undefined als ownEntry zurück wenn User nicht in totalPoints-Liste', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, setTab, ownEntry } = useLeaderboard(ref(999))

      await fetchLeaderboard()
      setTab('totalPoints')
      await nextTick()
      expect(ownEntry.value).toBeUndefined()
    })
  })

  describe('ownEntry', () => {
    it('findet den eigenen Eintrag anhand der User-ID', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, ownEntry } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      expect(ownEntry.value?.id).toBe(42)
      expect(ownEntry.value?.name).toBe('Nina Neuanfang')
    })

    it('gibt undefined zurück wenn currentUserId nicht in Liste', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, ownEntry } = useLeaderboard(ref(999))

      await fetchLeaderboard()
      expect(ownEntry.value).toBeUndefined()
    })

    it('gibt undefined zurück wenn currentUserId undefined ist', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, ownEntry } = useLeaderboard(ref(undefined))

      await fetchLeaderboard()
      expect(ownEntry.value).toBeUndefined()
    })
  })

  describe('isEmpty', () => {
    it('ist true wenn Liste leer und kein Fehler', async () => {
      mockFetch.mockResolvedValueOnce({ period: 'week', mostPurchased: [], healthiest: [], totalPoints: [] })
      const { fetchLeaderboard, isEmpty } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      expect(isEmpty.value).toBe(true)
    })

    it('ist false wenn Einträge vorhanden', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse)
      const { fetchLeaderboard, isEmpty } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      expect(isEmpty.value).toBe(false)
    })

    it('ist false während isLoading true ist', async () => {
      mockFetch.mockResolvedValueOnce({ period: 'week', mostPurchased: [], healthiest: [], totalPoints: [] })
      const { fetchLeaderboard, isEmpty, isLoading } = useLeaderboard(ref(42))

      const promise = fetchLeaderboard()
      // Während Loading: isEmpty soll false sein
      expect(isLoading.value).toBe(true)
      expect(isEmpty.value).toBe(false)
      await promise
    })

    it('ist false wenn Fehler vorhanden (error != null)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'))
      const { fetchLeaderboard, isEmpty, error } = useLeaderboard(ref(42))

      await fetchLeaderboard()
      expect(error.value).not.toBeNull()
      expect(isEmpty.value).toBe(false)
    })
  })
})
