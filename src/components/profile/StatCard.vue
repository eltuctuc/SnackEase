<!--
  StatCard — Einzelne Statistik-Kachel

  Zeigt Label, Wert und optional ein Icon.
  Rein presentational (keine Logik).
-->
<script setup lang="ts">
interface Props {
  label: string
  value: string
  /** Teenyicons-Icon-Dateiname ohne Pfad und Erweiterung */
  icon?: string
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Label -->
    <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {{ label }}
    </span>

    <!-- Skeleton -->
    <div v-if="loading" class="h-7 w-20 bg-muted rounded animate-pulse" />

    <!-- Wert -->
    <span v-else class="text-xl font-bold text-foreground">
      {{ value }}
    </span>
  </div>
</template>
