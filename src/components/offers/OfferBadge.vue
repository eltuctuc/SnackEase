<script setup lang="ts">
defineProps<{
  hasActiveOffer: boolean
}>()
</script>

<template>
  <span
    v-if="hasActiveOffer"
    class="px-2 py-1 text-xs rounded font-medium bg-green-100 text-green-700"
  >
    Angebot aktiv
  </span>
</template>
