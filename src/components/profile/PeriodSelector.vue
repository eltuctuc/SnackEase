<!--
  PeriodSelector — Globaler Zeitraum-Umschalter

  Zeigt vier Zeitraum-Optionen: "7 Tage", "30 Tage", "90 Tage", "Alle Zeit".
  Standard: 30 Tage (wird von profile.vue gesetzt).
  Aktiver Tab ist visuell hervorgehoben.

  Wird als primaeres Steuerelement auf Seitenebene in voller Breite dargestellt
  (gemaess UX-Empfehlung Abschnitt 13, Punkt 3).
-->
<script setup lang="ts">
type Period = '7d' | '30d' | '90d' | 'all'

interface Props {
  modelValue: Period
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Period]
}>()

const tabs: { value: Period; label: string }[] = [
  { value: '7d', label: '7 Tage' },
  { value: '30d', label: '30 Tage' },
  { value: '90d', label: '90 Tage' },
  { value: 'all', label: 'Alle Zeit' },
]

function select(period: Period) {
  emit('update:modelValue', period)
}
</script>

<template>
  <div class="px-4 py-3">
    <div
      class="flex rounded-xl bg-muted p-1 gap-1"
      role="tablist"
      aria-label="Zeitraum waehlen"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        role="tab"
        :aria-selected="props.modelValue === tab.value"
        :class="[
          'flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]',
          props.modelValue === tab.value
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        ]"
        @click="select(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
