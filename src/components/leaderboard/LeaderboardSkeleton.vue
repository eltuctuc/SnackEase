<script setup lang="ts">
// Keine Props nötig — zeigt immer 6 Skeleton-Zeilen
</script>

<template>
  <ol aria-busy="true" aria-label="Rangliste lädt…" class="space-y-2">
    <li
      v-for="i in 6"
      :key="i"
      class="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 motion-safe:animate-pulse"
    >
      <!-- Rang-Platzhalter -->
      <div class="flex-shrink-0 w-8">
        <div class="w-6 h-6 bg-gray-200 rounded-full mx-auto" />
      </div>
      <!-- Avatar-Platzhalter -->
      <div class="flex-shrink-0 w-9 h-9 bg-gray-200 rounded-full" />
      <!-- Name + Standort -->
      <div class="flex-1 space-y-1.5">
        <div class="h-3.5 bg-gray-200 rounded w-2/3" />
        <div class="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <!-- Wert -->
      <div class="flex-shrink-0 w-12 h-4 bg-gray-200 rounded" />
    </li>
  </ol>
</template>
