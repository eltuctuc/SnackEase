<!--
  FavoriteIcon - Herz-Icon Toggle-Button fuer Produktkarte (FEAT-18)

  Accessibility:
  - aria-pressed fuer Screen-Reader-Toggle-Zustand
  - Dynamisches aria-label
  - Touch-Target 44x44px (Tailwind w-11 h-11)
  - @click.stop verhindert Event-Bubbling zur Produkt-Karte

  @component
-->

<script setup lang="ts">
// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  productId: number
  isFavorite: boolean
  /** true waehrend API-Call (verhindert Doppelklick) */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  toggle: [productId: number]
}>()

// ========================================
// METHODS
// ========================================

const handleToggle = (event: MouseEvent) => {
  event.stopPropagation()
  if (!props.disabled) {
    emit('toggle', props.productId)
  }
}

// ========================================
// SVG-PFADE (Teenyicons v0.4.1)
// ========================================

/** outline/heart.svg */
const heartOutlinePath = 'M7.5 13.5l-.354.354a.5.5 0 00.708 0L7.5 13.5zM1.536 7.536l-.354.353.354-.353zm5-5l-.354.353.354-.353zM7.5 3.5l-.354.354a.5.5 0 00.708 0L7.5 3.5zm.964-.964l-.353-.354.353.354zm-.61 10.61L1.889 7.182l-.707.707 5.964 5.965.708-.708zm5.257-5.964l-5.965 5.964.708.708 5.964-5.965-.707-.707zM6.182 2.889l.964.965.708-.708-.965-.964-.707.707zm1.672.965l.964-.965-.707-.707-.965.964.708.708zM10.964 1c-1.07 0-2.096.425-2.853 1.182l.707.707A3.037 3.037 0 0110.964 2V1zM14 5.036c0 .805-.32 1.577-.89 2.146l.708.707A4.036 4.036 0 0015 5.036h-1zm1 0A4.036 4.036 0 0010.964 1v1A3.036 3.036 0 0114 5.036h1zM4.036 2c.805 0 1.577.32 2.146.89l.707-.708A4.036 4.036 0 004.036 1v1zM1 5.036A3.036 3.036 0 014.036 2V1A4.036 4.036 0 000 5.036h1zm.89 2.146A3.035 3.035 0 011 5.036H0c0 1.07.425 2.096 1.182 2.853l.707-.707z'

/** solid/heart.svg */
const heartSolidPath = 'M4.036 1a4.036 4.036 0 00-2.854 6.89l5.964 5.964a.5.5 0 00.708 0l5.964-5.965a4.036 4.036 0 00-5.707-5.707l-.611.61-.61-.61A4.036 4.036 0 004.035 1z'
</script>

<template>
  <button
    class="w-11 h-11 flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    :class="[
      isFavorite
        ? 'text-red-500 hover:text-red-600'
        : 'text-muted-foreground hover:text-red-400',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    :aria-pressed="isFavorite"
    :aria-label="isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufuegen'"
    :disabled="disabled"
    type="button"
    @click="handleToggle"
  >
    <svg
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      aria-hidden="true"
    >
      <path
        v-if="isFavorite"
        :d="heartSolidPath"
        fill="currentColor"
      />
      <path
        v-else
        :d="heartOutlinePath"
        fill="currentColor"
      />
    </svg>
  </button>
</template>
