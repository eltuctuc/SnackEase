<!--
  FilterChip - Einzelner Toggle-Chip für Filter-Leiste (FEAT-19)

  Visuell aktiv (bg-primary) oder inaktiv (bg-secondary).
  Aktive Chips zeigen zusätzlich ein x-Icon zum Entfernen.

  Accessibility:
  - aria-pressed für Screen-Reader-Toggle-Zustand
  - Touch-Target mind. 44px Höhe durch py-2.5

  @component
-->

<script setup lang="ts">
// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  /** Anzeigetext des Chips */
  label: string
  /** Ob der Chip aktiv (ausgewählt) ist */
  active: boolean
  /** Optional: deaktivierter Zustand */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  /** Chip wurde geklickt (Toggle) */
  toggle: []
  /** x-Icon wurde geklickt (nur bei aktivem Chip) */
  remove: []
}>()

// ========================================
// SVG-PFADE (Teenyicons v0.4.1)
// ========================================

/** outline/x-small.svg — für "Chip entfernen" */
const xSmallPath = 'M3.5 3.5l8 8m-8 0l8-8'
</script>

<template>
  <button
    type="button"
    :aria-pressed="active"
    :disabled="disabled"
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      active
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    @click="emit('toggle')"
  >
    {{ label }}

    <!-- x-Icon bei aktivem Chip (Wireframe-Anforderung) -->
    <span
      v-if="active"
      class="inline-flex items-center justify-center w-4 h-4 -mr-0.5"
      aria-hidden="true"
      @click.stop="emit('remove')"
    >
      <svg
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-3 h-3"
      >
        <path :d="xSmallPath" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </span>
  </button>
</template>
