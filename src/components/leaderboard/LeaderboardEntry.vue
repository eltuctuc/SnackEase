<script setup lang="ts">
import type { LeaderboardEntry } from '~/composables/useLeaderboard'

defineProps<{
  entry: LeaderboardEntry
  /** Ist das der eigene Eintrag des eingeloggten Users? */
  isOwn: boolean
  /** Welcher Wert wird angezeigt? */
  valueType: 'mostPurchased' | 'healthiest'
}>()

const router = useRouter()

function handleClick() {
  router.push(`/leaderboard/${entry.id}`)
}
</script>

<template>
  <li
    :aria-label="`Rang ${entry.rank}: ${entry.name}, ${entry.location}, ${valueType === 'mostPurchased' ? entry.totalPurchases + ' Käufe' : entry.healthPoints + ' Punkte'}`"
    :aria-current="isOwn ? 'true' : undefined"
    class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors motion-safe:transition-colors cursor-pointer hover:bg-accent"
    :class="[
      isOwn
        ? 'bg-blue-50 border-l-4 border-green-500'
        : 'bg-white border border-gray-100'
    ]"
    @click="handleClick"
  >
    <!-- Rang / Trophy-Icon -->
    <div class="flex-shrink-0 w-8 text-center">
      <!-- Platz 1: Gold -->
      <svg
        v-if="entry.rank === 1"
        aria-label="Platz 1 — Gold"
        role="img"
        class="w-6 h-6 mx-auto text-yellow-500"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <!-- Platz 2: Silber -->
      <svg
        v-else-if="entry.rank === 2"
        aria-label="Platz 2 — Silber"
        role="img"
        class="w-6 h-6 mx-auto text-gray-500"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <!-- Platz 3: Bronze -->
      <svg
        v-else-if="entry.rank === 3"
        aria-label="Platz 3 — Bronze"
        role="img"
        class="w-6 h-6 mx-auto text-amber-700"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <!-- Alle anderen -->
      <span v-else class="text-sm font-medium text-gray-500">{{ entry.rank }}.</span>
    </div>

    <!-- Avatar Initialen -->
    <div class="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
      <span class="text-xs font-bold text-primary uppercase">
        {{ entry.name.split(' ').map(n => n[0]).join('').slice(0, 2) }}
      </span>
    </div>

    <!-- Name + Standort -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-semibold text-gray-800 truncate">
          {{ entry.name }}
          <span v-if="isOwn" class="text-xs font-normal text-primary ml-1">(du)</span>
        </span>
        <!-- inaktiv-Badge (Should-Have: REQ-9) -->
        <span
          v-if="!entry.isActive"
          aria-label="Nutzer inaktiv"
          title="Dieser Nutzer hat keinen aktiven App-Zugang"
          class="inline-block text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium"
        >
          inaktiv
        </span>
      </div>
      <span class="text-xs text-gray-500">{{ entry.location }}</span>
    </div>

    <!-- Wert -->
    <div class="flex-shrink-0 text-right">
      <span class="text-sm font-bold text-gray-700">
        {{ valueType === 'mostPurchased' ? entry.totalPurchases : entry.healthPoints }}
      </span>
      <span class="text-xs text-muted-foreground ml-1">
        {{ valueType === 'mostPurchased' ? 'Käufe' : 'Pkt.' }}
      </span>
    </div>
  </li>
</template>
