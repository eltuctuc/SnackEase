/**
 * useCountdown — Composable für Ablauf-Countdown
 *
 * FEAT-11: Bestellabholung am Automaten
 *
 * @description
 * Berechnet die verbleibende Zeit bis zu einem Ablaufzeitpunkt und
 * aktualisiert sich automatisch jede Sekunde.
 *
 * Gibt zusätzlich ein Urgency-Level zurück:
 * - 'normal': mehr als 30 Minuten verbleibend
 * - 'warning': unter 30 Minuten verbleibend (orange)
 * - 'danger': unter 10 Minuten verbleibend (rot)
 *
 * Cleanup: Der Interval wird bei Component-Unmount automatisch gestoppt.
 *
 * @param expiresAt - Ablaufzeitpunkt als Date-Objekt
 * @returns Computed Countdown-Ref (reaktiv, auto-updated)
 *
 * @example
 * ```vue
 * <script setup>
 * const countdown = useCountdown(new Date(order.expiresAt))
 * </script>
 *
 * <template>
 *   <span :class="{ 'text-red-500': countdown.urgency === 'danger' }">
 *     {{ countdown.label }}
 *   </span>
 * </template>
 * ```
 */

import { ref, computed, onUnmounted } from 'vue'
import type { ComputedRef } from 'vue'

export type CountdownUrgency = 'normal' | 'warning' | 'danger'

export interface CountdownState {
  /** Verbleibende Stunden (0 wenn abgelaufen) */
  hours: number
  /** Verbleibende Minuten (0 wenn abgelaufen) */
  minutes: number
  /** Verbleibende Sekunden (0 wenn abgelaufen) */
  seconds: number
  /** Ob der Countdown abgelaufen ist */
  expired: boolean
  /** Dringlichkeits-Level für farbliche Hervorhebung */
  urgency: CountdownUrgency
  /** Formatierter Label-String (z.B. "1h 45min" oder "23min") */
  label: string
}

export function useCountdown(expiresAt: Date): ComputedRef<CountdownState> {
  // Reactive "now" — wird jede Sekunde aktualisiert
  const now = ref(new Date())

  // Computed: Countdown-Werte neu berechnen wenn now sich ändert
  const countdown = computed((): CountdownState => {
    const diffMs = expiresAt.getTime() - now.value.getTime()

    if (diffMs <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
        urgency: 'danger',
        label: 'Abgelaufen',
      }
    }

    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    // Urgency-Level bestimmen (auf Basis Gesamtminuten)
    const totalMinutes = Math.floor(diffMs / 1000 / 60)
    let urgency: CountdownUrgency = 'normal'
    if (totalMinutes < 10) {
      urgency = 'danger'
    } else if (totalMinutes < 30) {
      urgency = 'warning'
    }

    // Label formatieren
    let label: string
    if (hours > 0) {
      label = `${hours}h ${minutes}min`
    } else if (minutes > 0) {
      label = `${minutes}min`
    } else {
      label = `${seconds}s`
    }

    return { hours, minutes, seconds, expired: false, urgency, label }
  })

  // Interval: jede Sekunde "now" aktualisieren → löst countdown-Neuberechnung aus
  const interval = setInterval(() => {
    now.value = new Date()
  }, 1000)

  // Cleanup bei Component-Unmount (kein Memory-Leak)
  onUnmounted(() => {
    clearInterval(interval)
  })

  return countdown
}
