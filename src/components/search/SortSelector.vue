<!--
  SortSelector - Segmented Control für Sortierungsauswahl (FEAT-19)

  Drei Optionen: Relevanz / Preis aufsteigend / Preis absteigend
  Aktives Segment: bg-primary text-white
  Inaktives Segment: transparent, muted-foreground

  v-model über modelValue / update:modelValue

  @component
-->

<script setup lang="ts">
// ========================================
// TYPEN
// ========================================

type SortByValue = 'relevance' | 'price_asc' | 'price_desc'

// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  modelValue: SortByValue
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SortByValue]
}>()

// ========================================
// KONSTANTEN
// ========================================

interface SortOption {
  value: SortByValue
  label: string
  arrowDirection?: 'up' | 'down'
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'relevance', label: 'Relevanz' },
  { value: 'price_asc', label: 'Preis', arrowDirection: 'up' },
  { value: 'price_desc', label: 'Preis', arrowDirection: 'down' },
]

// ========================================
// SVG-PFADE (Teenyicons v0.4.1)
// ========================================

/** outline/arrow-up.svg */
const arrowUpPath = 'M7.5 1.5v12M3 5l4.5-4.5L12 5'

/** outline/arrow-down.svg */
const arrowDownPath = 'M7.5 13.5v-12M12 10L7.5 14.5 3 10'
</script>

<template>
  <div
    class="inline-flex rounded-lg border border-border bg-background p-0.5 gap-0.5 w-full"
    role="group"
    aria-label="Suchergebnisse sortieren"
  >
    <button
      v-for="option in SORT_OPTIONS"
      :key="option.value"
      type="button"
      :aria-pressed="modelValue === option.value"
      :class="[
        'flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors',
        modelValue === option.value
          ? 'bg-primary text-primary-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted',
      ]"
      @click="emit('update:modelValue', option.value)"
    >
      <!-- Pfeil-Icon bei Preis-Optionen -->
      <svg
        v-if="option.arrowDirection"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5 flex-shrink-0"
        aria-hidden="true"
      >
        <path
          :d="option.arrowDirection === 'up' ? arrowUpPath : arrowDownPath"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ option.label }}
    </button>
  </div>
</template>
