<script setup lang="ts">
import type { LeaderboardEntry } from '~/composables/useLeaderboard'
import LeaderboardEntryComponent from './LeaderboardEntry.vue'
import LeaderboardSkeleton from './LeaderboardSkeleton.vue'

defineProps<{
  entries: LeaderboardEntry[]
  isLoading: boolean
  error: string | null
  isEmpty: boolean
  currentUserId: number | undefined
  valueType: 'mostPurchased' | 'healthiest'
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div aria-live="polite" aria-atomic="false">
  <!-- Loading -->
  <LeaderboardSkeleton v-if="isLoading" />

  <!-- Fehler-Zustand -->
  <div
    v-else-if="error"
    class="flex flex-col items-center gap-4 py-12 px-4 text-center"
    role="alert"
  >
    <!-- Warn-Icon -->
    <svg
      aria-hidden="true"
      class="w-12 h-12 text-gray-400"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
    <p class="text-gray-600 text-sm font-medium">{{ error }}</p>
    <button
      class="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary transition-colors motion-safe:transition-colors"
      @click="$emit('retry')"
    >
      <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
      Erneut versuchen
    </button>
  </div>

  <!-- Leerer Zustand (keine Käufe im Zeitraum) -->
  <div
    v-else-if="isEmpty"
    class="flex flex-col items-center gap-3 py-12 px-4 text-center"
  >
    <!-- Leere-Liste-Icon -->
    <svg
      aria-hidden="true"
      class="w-12 h-12 text-gray-300"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
    <p class="text-gray-500 text-sm font-medium">
      {{ valueType === 'healthiest' ? 'Noch keine Bonuspunkte in diesem Zeitraum.' : 'Noch keine Käufe in diesem Zeitraum.' }}
    </p>
    <p class="text-gray-500 text-xs">Kauf einen Snack und erscheine auf der Rangliste!</p>
  </div>

  <!-- Rangliste -->
  <ol v-else class="space-y-2" aria-label="Rangliste">
    <LeaderboardEntryComponent
      v-for="entry in entries"
      :key="entry.id"
      :entry="entry"
      :is-own="entry.id === currentUserId"
      :value-type="valueType"
    />
  </ol>
  </div>
</template>
