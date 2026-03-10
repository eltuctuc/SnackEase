<!--
  BonusPointsCard — Bonuspunkte-Sektion mit Balkendiagramm

  Eigener sekundaerer Zeitraum-Umschalter: Woche / Monat / Jahr
  (unabhaengig vom globalen Zeitraum-Filter der Seite).

  Balkendiagramm via vue-chartjs + chart.js.
  Leerer Zustand wenn keine Bonuspunkte vorhanden.

  Gemaess UX-Empfehlung Abschnitt 13, Punkt 3:
  Als sekundaerer Segmented Control innerhalb der Karte dargestellt.
-->
<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

type ChartPeriod = 'week' | 'month' | 'year'

interface BonusBucket {
  label: string
  points: number
}

interface Props {
  week: BonusBucket[]
  month: BonusBucket[]
  year: BonusBucket[]
  loading?: boolean
}

const props = defineProps<Props>()

// Eigener Zeitraum-Umschalter (unabhaengig vom globalen)
const chartPeriod = ref<ChartPeriod>('week')

const chartTabs: { value: ChartPeriod; label: string }[] = [
  { value: 'week', label: 'Woche' },
  { value: 'month', label: 'Monat' },
  { value: 'year', label: 'Jahr' },
]

/** Aktuelle Chart-Daten basierend auf gewaehltem Zeitraum */
const currentBuckets = computed(() => {
  switch (chartPeriod.value) {
    case 'week':
      return props.week
    case 'month':
      return props.month
    case 'year':
    default:
      return props.year
  }
})

/** Pruefen ob alle Buckets 0 Punkte haben (leerer Zustand) */
const hasData = computed(() => currentBuckets.value.some((b) => b.points > 0))

/** Chart.js Daten-Objekt */
const chartData = computed(() => ({
  labels: currentBuckets.value.map((b) => b.label),
  datasets: [
    {
      label: 'Bonuspunkte',
      data: currentBuckets.value.map((b) => b.points),
      backgroundColor: 'hsl(220, 90%, 56%)',
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
}))

/** Chart.js Optionen */
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: import('chart.js').TooltipItem<'bar'>) =>
          `${context.parsed.y ?? 0} Punkte`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: 'hsl(220, 10%, 55%)' },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'hsl(220, 10%, 92%)' },
      ticks: {
        color: 'hsl(220, 10%, 55%)',
        precision: 0,
      },
    },
  },
} as const

// Screenreader-Tabelle: Beschreibung der Chart-Daten
const srTableId = 'bonus-chart-sr-table'
</script>

<template>
  <div class="bg-card border-b px-4 py-4">
    <!-- Header mit Titel und Verlauf-Link -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-bold text-foreground">Bonuspunkte</h2>
      <!-- Verlauf-Link: scrollt zur Bestellhistorie -->
      <a
        href="#bestellverlauf"
        class="text-sm font-medium text-primary hover:text-primary/80 transition-colors min-h-[44px] flex items-center"
      >
        Verlauf
      </a>
    </div>

    <!-- Sekundaerer Zeitraum-Umschalter (kleiner, innerhalb der Card) -->
    <div
      class="flex rounded-lg bg-muted p-0.5 mb-4 gap-0.5"
      role="tablist"
      aria-label="Bonuspunkte-Zeitraum"
    >
      <button
        v-for="tab in chartTabs"
        :key="tab.value"
        role="tab"
        :aria-selected="chartPeriod === tab.value"
        :class="[
          'flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary min-h-[36px]',
          chartPeriod === tab.value
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        ]"
        @click="chartPeriod = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Skeleton waehrend Laden -->
    <div v-if="loading" class="h-48 bg-muted rounded-lg animate-pulse" />

    <!-- Leerer Zustand (EC-1, EC-11) -->
    <div
      v-else-if="!hasData"
      class="h-48 flex flex-col items-center justify-center text-center text-muted-foreground gap-2"
    >
      <!-- Teenyicons: star (inline SVG) -->
      <svg
        class="w-8 h-8 opacity-30"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        aria-hidden="true"
      >
        <path d="M7.5 12.04l-4.326 2.275L4 9.497.5 6.086l4.837-.703L7.5 1l2.163 4.383 4.837.703L11 9.497l.826 4.818L7.5 12.041z" />
      </svg>
      <p class="text-sm">
        Kaufe deinen ersten Snack, um Bonuspunkte zu sammeln.
      </p>
    </div>

    <!-- Balkendiagramm -->
    <div v-else class="h-48" :aria-describedby="srTableId">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <!-- Screenreader-Alternative (visuell versteckt) -->
    <table :id="srTableId" class="sr-only" aria-label="Bonuspunkte-Daten">
      <caption>Bonuspunkte {{ chartPeriod === 'week' ? 'dieser Woche' : chartPeriod === 'month' ? 'dieses Monats' : 'dieses Jahres' }}</caption>
      <thead>
        <tr>
          <th scope="col">Zeitraum</th>
          <th scope="col">Punkte</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bucket in currentBuckets" :key="bucket.label">
          <td>{{ bucket.label }}</td>
          <td>{{ bucket.points }} Punkte</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
