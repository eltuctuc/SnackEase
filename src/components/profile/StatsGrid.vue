<!--
  StatsGrid — Einkaufsstatistiken-Sektion

  Zeigt alle Statistik-Kacheln gemaess Wireframe-Layout:
  - Zeile 1: GESAMT / <7 TAGE / LETZTER
  - Zeile 2: WOCHE / MONAT / JAHR
  - Zeile 3: Lieblingsprodukt + Gesundheits-Score (nebeneinander)

  Mit "Kaufhistorie"-Link rechts vom Sektions-Header.
-->
<script setup lang="ts">
interface Props {
  totalOrderCount: number
  last7DaysCount: number
  lastOrderDate: string | null
  weekSpent: string
  monthSpent: string
  yearSpent: string
  favoriteProduct: { name: string; count: number } | null
  healthScore: number | null
  loading?: boolean
}

const props = defineProps<Props>()

const { formatPrice, formatDate } = useFormatter()

/** Formatiertes Datum des letzten Kaufs */
const lastOrderFormatted = computed(() => {
  if (!props.lastOrderDate) return '–'
  return (
    formatDate(props.lastOrderDate) ?? '–'
  )
})
</script>

<template>
  <div class="bg-card border-b px-4 py-4">
    <!-- Sektions-Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-foreground">Einkäufe</h2>
      <!-- Kaufhistorie-Link: springt zur Bestellverlauf-Sektion -->
      <a
        href="#bestellverlauf"
        class="text-sm font-medium text-primary hover:text-primary/80 transition-colors min-h-[44px] flex items-center"
      >
        Kaufhistorie
      </a>
    </div>

    <!-- Zeile 1: GESAMT / <7 TAGE / LETZTER -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <ProfileStatCard
        label="Gesamt"
        :value="loading ? '' : String(totalOrderCount)"
        :loading="loading"
      />
      <ProfileStatCard
        label="< 7 Tage"
        :value="loading ? '' : String(last7DaysCount)"
        :loading="loading"
      />
      <ProfileStatCard
        label="Letzter"
        :value="loading ? '' : lastOrderFormatted"
        :loading="loading"
      />
    </div>

    <!-- Zeile 2: WOCHE / MONAT / JAHR -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <ProfileStatCard
        label="Woche"
        :value="loading ? '' : formatPrice(weekSpent)"
        :loading="loading"
      />
      <ProfileStatCard
        label="Monat"
        :value="loading ? '' : formatPrice(monthSpent)"
        :loading="loading"
      />
      <ProfileStatCard
        label="Jahr"
        :value="loading ? '' : formatPrice(yearSpent)"
        :loading="loading"
      />
    </div>

    <!-- Zeile 3: Lieblingsprodukt + Gesundheits-Score -->
    <div class="grid grid-cols-2 gap-3">
      <ProfileFavoriteProductCard
        :product-name="favoriteProduct?.name ?? null"
        :count="favoriteProduct?.count ?? null"
        :loading="loading"
      />
      <ProfileHealthScoreCard
        :score="healthScore"
        :loading="loading"
      />
    </div>
  </div>
</template>
