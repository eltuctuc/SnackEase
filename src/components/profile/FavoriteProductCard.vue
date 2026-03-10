<!--
  FavoriteProductCard — Lieblingsprodukt-Kachel

  Zeigt das meistgekaufte Produkt mit Name und Kaufhaeufigkeit.
  Leerer Zustand wenn kein Produkt vorhanden.
-->
<script setup lang="ts">
interface Props {
  productName: string | null
  count: number | null
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="bg-muted/50 rounded-xl p-4 flex flex-col gap-2">
    <!-- Header (Teenyicons: heart, inline SVG) -->
    <div class="flex items-center gap-2">
      <svg
        class="w-4 h-4 opacity-50 flex-shrink-0"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        aria-hidden="true"
      >
        <path d="M7.5 13.5l-.354.354a.5.5 0 00.708 0L7.5 13.5zM1.536 7.536l-.354.353.354-.353zm5-5l-.354.353.354-.353zM7.5 3.5l-.354.354a.5.5 0 00.708 0L7.5 3.5zm.964-.964l-.353-.354.353.354zm-.61 10.61L1.889 7.182l-.707.707 5.964 5.965.708-.708zm5.257-5.964l-5.965 5.964.708.708 5.964-5.965-.707-.707zM6.182 2.889l.964.965.708-.708-.965-.964-.707.707zm1.672.965l.964-.965-.707-.707-.965.964.708.708zM10.964 1c-1.07 0-2.096.425-2.853 1.182l.707.707A3.037 3.037 0 0110.964 2V1zM14 5.036c0 .805-.32 1.577-.89 2.146l.708.707A4.036 4.036 0 0015 5.036h-1zm1 0A4.036 4.036 0 0010.964 1v1A3.036 3.036 0 0114 5.036h1zM4.036 2c.805 0 1.577.32 2.146.89l.707-.708A4.036 4.036 0 004.036 1v1zM1 5.036A3.036 3.036 0 014.036 2V1A4.036 4.036 0 000 5.036h1zm.89 2.146A3.035 3.035 0 011 5.036H0c0 1.07.425 2.096 1.182 2.853l.707-.707z" />
      </svg>
      <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Lieblingsprodukt
      </span>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-1">
      <div class="h-5 w-32 bg-muted rounded animate-pulse" />
      <div class="h-4 w-20 bg-muted rounded animate-pulse" />
    </div>

    <!-- Leerer Zustand (EC-1) -->
    <div v-else-if="!productName" class="text-sm text-muted-foreground">
      Noch keine Bestellungen
    </div>

    <!-- Produktname + Haeufigkeit -->
    <div v-else>
      <p class="text-base font-semibold text-foreground">{{ productName }}</p>
      <p class="text-sm text-muted-foreground">{{ count }}x gekauft</p>
    </div>
  </div>
</template>
