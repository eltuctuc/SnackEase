<script setup lang="ts">
/**
 * PointsTransactionItem — Einzelne Punkte-Transaktion mit Bonus-Aufschluesselung (FEAT-23)
 */

export interface PointsTransaction {
  id: number
  type: string
  totalPoints: number
  basePoints: number
  veganBonus: number
  proteinBonus: number
  offerBonus: number
  speedBonus: number
  streakBonus: number
  createdAt: string
  purchaseId: number | null
  products: string[]
}

const props = defineProps<{
  transaction: PointsTransaction
}>()

/** Datum formatiert als "13.03.2026" */
const formattedDate = computed(() => {
  return new Date(props.transaction.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})

/** Transaktions-Typ als lesbarer Text */
const typeLabel = computed(() => {
  return props.transaction.type === 'recommendation' ? 'Empfehlung' : 'Bestellung'
})

/** Ob Bonus-Aufschluesselung angezeigt werden soll (wenn mindestens ein Bonus > 0) */
const hasBonuses = computed(() => {
  const t = props.transaction
  return t.veganBonus > 0 || t.proteinBonus > 0 || t.offerBonus > 0 || t.speedBonus > 0 || t.streakBonus > 0
})

/** Alle Bonus-Eintraege mit Label und Wert */
const bonusItems = computed(() => {
  const t = props.transaction
  const items: { label: string; value: number }[] = []
  if (t.basePoints > 0) items.push({ label: 'Basis', value: t.basePoints })
  if (t.veganBonus > 0) items.push({ label: 'Vegan', value: t.veganBonus })
  if (t.proteinBonus > 0) items.push({ label: 'Protein', value: t.proteinBonus })
  if (t.offerBonus > 0) items.push({ label: 'Angebot', value: t.offerBonus })
  if (t.speedBonus > 0) items.push({ label: 'Schnell', value: t.speedBonus })
  if (t.streakBonus > 0) items.push({ label: 'Streak', value: t.streakBonus })
  return items
})

/** Produktnamen als kommaseparierter String (max. 3 anzeigen, Rest "...") */
const productNames = computed(() => {
  const names = props.transaction.products
  if (names.length === 0) return null
  if (names.length <= 3) return names.join(', ')
  return `${names.slice(0, 3).join(', ')} +${names.length - 3} weitere`
})

const isExpanded = ref(false)
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-100 px-4 py-3 space-y-2">
    <!-- Kopfzeile: Datum + Typ + Gesamtpunkte -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <!-- Typ-Badge -->
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
            :class="transaction.type === 'recommendation'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'"
          >
            {{ typeLabel }}
          </span>
          <span class="text-xs text-gray-400">{{ formattedDate }}</span>
        </div>
        <!-- Produkt-Namen -->
        <p v-if="productNames" class="text-xs text-gray-500 mt-1 truncate">
          {{ productNames }}
        </p>
      </div>
      <!-- Gesamtpunkte -->
      <div class="flex-shrink-0 text-right">
        <span class="text-base font-bold text-primary">+{{ transaction.totalPoints }}</span>
        <span class="text-xs text-gray-400 ml-1">Pkt.</span>
      </div>
    </div>

    <!-- Bonus-Aufschluesselung (aufklappbar) -->
    <template v-if="hasBonuses">
      <button
        class="text-xs text-gray-400 hover:text-primary flex items-center gap-1 transition-colors motion-safe:transition-colors"
        @click="isExpanded = !isExpanded"
      >
        <svg
          aria-hidden="true"
          class="w-3 h-3 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        Aufschluesselung
      </button>

      <div v-if="isExpanded" class="flex flex-wrap gap-x-3 gap-y-1">
        <span
          v-for="item in bonusItems"
          :key="item.label"
          class="text-xs text-gray-500"
        >
          {{ item.label }}: <span class="font-medium text-gray-700">+{{ item.value }}</span>
        </span>
      </div>
    </template>
  </div>
</template>
