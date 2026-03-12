<!--
  EmptyState - Wiederverwendbare Leer-Zustand-Komponente

  Zeigt einen strukturierten Leer-Zustand mit Icon, Titel und Beschreibung.
  Wird verwendet von RecommendedList und FavoritesList (FEAT-18).

  @component
-->

<script setup lang="ts">
// ========================================
// PROPS
// ========================================

interface Props {
  /** Teenyicons Icon-Name (z.B. 'heart' oder 'thumb-up') — aus outline-Variante */
  icon: 'heart' | 'thumb-up' | 'star' | 'info' | 'x'
  /** Haupttitel */
  title: string
  /** Erklaerende Beschreibung (handlungsorientiert) */
  description: string
}

defineProps<Props>()

// ========================================
// ICON SVG MAP
// ========================================

/** Inline SVG-Pfade aus Teenyicons outline (passend zu viewBox 0 0 15 15) */
const iconPaths: Record<string, string> = {
  heart: 'M7.5 13.5l-.354.354a.5.5 0 00.708 0L7.5 13.5zM1.536 7.536l-.354.353.354-.353zm5-5l-.354.353.354-.353zM7.5 3.5l-.354.354a.5.5 0 00.708 0L7.5 3.5zm.964-.964l-.353-.354.353.354zm-.61 10.61L1.889 7.182l-.707.707 5.964 5.965.708-.708zm5.257-5.964l-5.965 5.964.708.708 5.964-5.965-.707-.707zM6.182 2.889l.964.965.708-.708-.965-.964-.707.707zm1.672.965l.964-.965-.707-.707-.965.964.708.708zM10.964 1c-1.07 0-2.096.425-2.853 1.182l.707.707A3.037 3.037 0 0110.964 2V1zM14 5.036c0 .805-.32 1.577-.89 2.146l.708.707A4.036 4.036 0 0015 5.036h-1zm1 0A4.036 4.036 0 0010.964 1v1A3.036 3.036 0 0114 5.036h1zM4.036 2c.805 0 1.577.32 2.146.89l.707-.708A4.036 4.036 0 004.036 1v1zM1 5.036A3.036 3.036 0 014.036 2V1A4.036 4.036 0 000 5.036h1zm.89 2.146A3.035 3.035 0 011 5.036H0c0 1.07.425 2.096 1.182 2.853l.707-.707z',
  'thumb-up': 'M3.5 5.5l-.422-.268L3 5.354V5.5h.5zm2.698-4.24l.421.27-.421-.27zm2.667 1.51l-.448-.223.448.224zM7.5 5.5l-.447-.224A.5.5 0 007.5 6v-.5zm7 5l.4.3.1-.133V10.5h-.5zm-2.4 3.2l.4.3-.4-.3zM8.282.769L8.539.34l-.257.43zM0 5v10h1V5H0zm3.922.768L6.619 1.53 5.776.992l-2.698 4.24.844.536zm4.495-3.22L7.053 5.275l.894.448 1.365-2.73-.895-.447zM7.5 6h5V5h-5v1zM14 7.5v3h1v-3h-1zm.1 2.7l-2.4 3.2.8.6 2.4-3.2-.8-.6zM10.5 14h-5v1h5v-1zM4 12.5v-7H3v7h1zM12.5 6A1.5 1.5 0 0114 7.5h1A2.5 2.5 0 0012.5 5v1zm-7 8A1.5 1.5 0 014 12.5H3A2.5 2.5 0 005.5 15v-1zM8.024 1.198c.464.278.635.866.393 1.35l.895.446A2.034 2.034 0 008.539.34l-.515.858zM11.7 13.4a1.5 1.5 0 01-1.2.6v1a2.5 2.5 0 002-1l-.8-.6zM6.62 1.53c.3-.474.924-.62 1.404-.332L8.54.34a2.034 2.034 0 00-2.763.652l.843.537z',
  star: 'M7.5 1l1.974 4.066L14 5.854l-3.25 3.132.768 4.427L7.5 11.25l-4.018 2.163.768-4.427L.5 5.854l4.526-.788L7.5 1z',
  info: 'M7.5 1a6.5 6.5 0 100 13A6.5 6.5 0 007.5 1zM7 5V4h1v1H7zm0 6V6h1v5H7z',
  x: 'M1.5 1.5l12 12m-12 0l12-12',
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <!-- Icon -->
    <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <svg
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-8 h-8 text-muted-foreground"
        aria-hidden="true"
      >
        <path :d="iconPaths[icon] ?? iconPaths['star']" fill="currentColor" />
      </svg>
    </div>

    <!-- Titel -->
    <h3 class="text-base font-semibold text-foreground mb-2">
      {{ title }}
    </h3>

    <!-- Beschreibung -->
    <p class="text-sm text-muted-foreground max-w-xs leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
