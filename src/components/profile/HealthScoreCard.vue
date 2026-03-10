<!--
  HealthScoreCard — Gesundheits-Score-Kachel

  Zeigt den berechneten Gesundheits-Score (1-10) des Mitarbeiters.
  Fragezeichen-Icon mit Tooltip erklaert die Einflussfaktoren.
  Leerer Zustand wenn kein Score vorhanden.

  Gemaess UX-Empfehlung Abschnitt 13, Punkt 1:
  Tooltip nennt: Kalorien, Zucker, Fett, Vegan-/Glutenfrei-Bonus.
-->
<script setup lang="ts">
interface Props {
  score: number | null
  loading?: boolean
}

defineProps<Props>()

const tooltipVisible = ref(false)

/** Score-Farbe basierend auf Wert */
function scoreColor(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 5) return 'text-yellow-600'
  return 'text-red-500'
}
</script>

<template>
  <div class="bg-muted/50 rounded-xl p-4 flex flex-col gap-2">
    <!-- Header mit Tooltip-Icon (Teenyicons: apple als Gesundheits-Icon, inline SVG) -->
    <div class="flex items-center gap-2">
      <svg
        class="w-4 h-4 opacity-50 flex-shrink-0"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        aria-hidden="true"
      >
        <!-- Teenyicons: apple -->
        <path d="M7.825 3.241a.343.343 0 01-.343-.342A2.399 2.399 0 019.881.5c.19 0 .342.154.342.343A2.399 2.399 0 017.825 3.24zm5.003 7.216c.132.099.175.28.1.427-1.205 2.414-2.168 3.616-3.047 3.616-.409 0-.811-.132-1.203-.39a1.782 1.782 0 00-1.895-.041c-.474.284-.927.431-1.356.431C4.133 14.5 2 10.518 2 8.332 2 6 3.223 4.22 5.084 4.22c.875 0 1.631.13 2.266.39.269.112.573.104.836-.022.515-.248 1.194-.368 2.038-.368 1.03 0 1.926.513 2.672 1.508a.343.343 0 01-.068.48c-.833.624-1.234 1.326-1.234 2.124 0 .799.401 1.5 1.234 2.125z" />
      </svg>
      <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Gesundheits-Score
      </span>

      <!-- Fragezeichen-Icon mit Tooltip (Teenyicons: question-circle, inline SVG) -->
      <div class="relative ml-auto">
        <button
          class="p-1 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[32px] min-w-[32px] flex items-center justify-center"
          :aria-expanded="tooltipVisible"
          aria-haspopup="true"
          aria-label="Wie wird der Gesundheits-Score berechnet?"
          @click="tooltipVisible = !tooltipVisible"
          @blur="tooltipVisible = false"
        >
          <svg
            class="w-4 h-4 opacity-50"
            viewBox="0 0 15 15"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            aria-hidden="true"
          >
            <path d="M7.5 9V7.5H8A1.5 1.5 0 009.5 6v-.1a1.4 1.4 0 00-1.4-1.4h-.6A1.5 1.5 0 006 6m1 4.5h1m-.5 4a7 7 0 110-14 7 7 0 010 14z" />
          </svg>
        </button>

        <!-- Tooltip-Popup -->
        <div
          v-if="tooltipVisible"
          role="tooltip"
          class="absolute right-0 top-8 z-10 w-56 bg-popover border rounded-lg shadow-lg p-3 text-xs text-muted-foreground"
        >
          <p class="font-semibold text-foreground mb-1">Score-Berechnung</p>
          <ul class="space-y-1">
            <li>50% Kalorien (weniger = besser)</li>
            <li>30% Zucker (weniger = besser)</li>
            <li>20% Fett (weniger = besser)</li>
            <li>+Bonus fuer vegane Produkte</li>
            <li>+Bonus fuer glutenfreie Produkte</li>
          </ul>
          <p class="mt-2 font-medium text-foreground">1 = ungesund, 10 = sehr gesund</p>
        </div>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="h-8 w-16 bg-muted rounded animate-pulse" />

    <!-- Leerer Zustand (EC-1, EC-6) -->
    <div v-else-if="score === null" class="text-sm text-muted-foreground">
      Noch kein Score
    </div>

    <!-- Score-Anzeige -->
    <div v-else class="flex items-baseline gap-1">
      <span :class="['text-3xl font-bold', scoreColor(score)]">{{ score }}</span>
      <span class="text-base text-muted-foreground font-medium">/10</span>
    </div>
  </div>
</template>
