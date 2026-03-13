<script setup lang="ts">
/**
 * PointsTransactionList — Liste der letzten 10 Punkte-Transaktionen (FEAT-23)
 *
 * Zeigt Loading-Skeletons, Leer-Zustand und die eigentliche Liste.
 */

import PointsTransactionItem from './PointsTransactionItem.vue'
import type { PointsTransaction } from './PointsTransactionItem.vue'

defineProps<{
  transactions: PointsTransaction[]
  isLoading: boolean
}>()
</script>

<template>
  <div class="px-4 py-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Letzte Transaktionen</h3>

    <!-- Loading-Skeletons -->
    <div v-if="isLoading" class="space-y-2">
      <div
        v-for="i in 3"
        :key="i"
        class="h-16 bg-gray-100 rounded-lg animate-pulse"
      />
    </div>

    <!-- Leer-Zustand -->
    <div
      v-else-if="transactions.length === 0"
      class="text-center py-6 text-gray-400 text-sm"
    >
      Noch keine Punkte gesammelt. Hole eine Bestellung ab!
    </div>

    <!-- Liste -->
    <div v-else class="space-y-2">
      <PointsTransactionItem
        v-for="transaction in transactions"
        :key="transaction.id"
        :transaction="transaction"
      />
    </div>
  </div>
</template>
