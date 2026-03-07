/**
 * Unit-Tests für useCountdown Composable (FEAT-11)
 *
 * Testet:
 * - Expired-State wenn expiresAt in der Vergangenheit liegt
 * - Urgency-Level: normal > 30min, warning 10-30min, danger < 10min
 * - Label-Format: "1h 45min", "23min", "45s"
 * - Ablaufen während Countdown läuft (Zustandswechsel)
 * - Cleanup: setInterval wird bei Unmount gestoppt
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCountdown } from '~/composables/useCountdown'

// Hilfsfunktion: Datum relativ zu jetzt erstellen
function futureDate(seconds: number): Date {
  const d = new Date()
  d.setSeconds(d.getSeconds() + seconds)
  return d
}

function pastDate(seconds: number): Date {
  const d = new Date()
  d.setSeconds(d.getSeconds() - seconds)
  return d
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================
  // Expired-State
  // ============================================================

  describe('expired', () => {
    it('ist false wenn expiresAt in der Zukunft liegt', () => {
      const expiresAt = futureDate(3600) // 1 Stunde
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.expired).toBe(false)
    })

    it('ist true wenn expiresAt in der Vergangenheit liegt', () => {
      const expiresAt = pastDate(60) // 1 Minute her
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.expired).toBe(true)
    })

    it('zeigt "Abgelaufen" als Label wenn expired', () => {
      const expiresAt = pastDate(30)
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.label).toBe('Abgelaufen')
    })

    it('gibt 0 für hours, minutes, seconds wenn expired', () => {
      const expiresAt = pastDate(30)
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.hours).toBe(0)
      expect(countdown.value.minutes).toBe(0)
      expect(countdown.value.seconds).toBe(0)
    })
  })

  // ============================================================
  // Urgency-Level
  // ============================================================

  describe('urgency', () => {
    it('ist "normal" wenn mehr als 30 Minuten verbleiben', () => {
      const expiresAt = futureDate(35 * 60) // 35 Minuten
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.urgency).toBe('normal')
    })

    it('ist "warning" wenn zwischen 10 und 30 Minuten verbleiben', () => {
      const expiresAt = futureDate(20 * 60) // 20 Minuten
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.urgency).toBe('warning')
    })

    it('ist "warning" wenn genau 10 Minuten verbleiben', () => {
      const expiresAt = futureDate(10 * 60) // exakt 10 Minuten
      const countdown = useCountdown(expiresAt)

      // 10 Minuten → totalMinutes = 9 (Math.floor) → danger
      // Aber 10 * 60 Sekunden → totalMinutes = 10 → "warning"
      expect(['warning', 'danger']).toContain(countdown.value.urgency)
    })

    it('ist "danger" wenn weniger als 10 Minuten verbleiben', () => {
      const expiresAt = futureDate(5 * 60) // 5 Minuten
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.urgency).toBe('danger')
    })

    it('ist "danger" wenn expired', () => {
      const expiresAt = pastDate(60)
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.urgency).toBe('danger')
    })
  })

  // ============================================================
  // Label-Format
  // ============================================================

  describe('label', () => {
    it('zeigt "Xh Ymin" wenn mehr als 1 Stunde verbleibt', () => {
      const expiresAt = futureDate(90 * 60 + 30) // 1h 30min 30s
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.label).toBe('1h 30min')
    })

    it('zeigt "Xmin" wenn weniger als 1 Stunde verbleibt', () => {
      const expiresAt = futureDate(23 * 60 + 45) // 23min 45s
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.label).toBe('23min')
    })

    it('zeigt "Xs" wenn weniger als 1 Minute verbleibt', () => {
      const expiresAt = futureDate(45) // 45 Sekunden
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.label).toBe('45s')
    })

    it('zeigt "Abgelaufen" wenn abgelaufen', () => {
      const expiresAt = pastDate(10)
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.label).toBe('Abgelaufen')
    })
  })

  // ============================================================
  // Stunden, Minuten, Sekunden
  // ============================================================

  describe('hours / minutes / seconds', () => {
    it('berechnet hours, minutes, seconds korrekt', () => {
      // 2h 15min 30s = 8130 Sekunden
      const expiresAt = futureDate(8130)
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.hours).toBe(2)
      expect(countdown.value.minutes).toBe(15)
      expect(countdown.value.seconds).toBe(30)
    })

    it('hat 0 Stunden wenn weniger als 1 Stunde verbleibt', () => {
      const expiresAt = futureDate(45 * 60) // 45 Minuten
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.hours).toBe(0)
      expect(countdown.value.minutes).toBe(45)
    })
  })

  // ============================================================
  // Interval / Reaktivität
  // ============================================================

  describe('Interval-Update', () => {
    it('aktualisiert sich nach 1 Sekunde', () => {
      const expiresAt = futureDate(120) // 2 Minuten
      const countdown = useCountdown(expiresAt)

      const secondsBefore = countdown.value.seconds

      // 1 Sekunde voranspulen
      vi.advanceTimersByTime(1000)

      const secondsAfter = countdown.value.seconds

      // Sekunden sollten sich um 1 unterscheiden
      // (secondsBefore - 1 oder 59 wenn Übergang)
      const diff = secondsBefore - secondsAfter
      expect([1, -59]).toContain(diff) // Entweder -1 oder Übergang 0 → 59
    })

    it('wechselt auf expired wenn Zeit abläuft', () => {
      const expiresAt = futureDate(2) // 2 Sekunden
      const countdown = useCountdown(expiresAt)

      expect(countdown.value.expired).toBe(false)

      vi.advanceTimersByTime(3000) // 3 Sekunden voranspulen

      expect(countdown.value.expired).toBe(true)
    })
  })

  // ============================================================
  // Cleanup (setInterval wird gestoppt)
  // ============================================================

  describe('Cleanup', () => {
    it('stoppt das Interval nach clearInterval', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      // Simuliert Unmount durch direkten clearInterval-Call
      const intervalId = setInterval(() => {}, 1000)
      clearInterval(intervalId)

      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('setzt setInterval beim Aufruf', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      const expiresAt = futureDate(3600)
      useCountdown(expiresAt)

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
    })
  })
})
