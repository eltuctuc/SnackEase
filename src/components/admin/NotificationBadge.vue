<script setup lang="ts">
const props = defineProps<{
  unreadCount: number
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const ariaLabel = computed(() =>
  props.unreadCount === 0
    ? 'Keine ungelesenen Benachrichtigungen'
    : props.unreadCount === 1
      ? '1 ungelesene Benachrichtigung'
      : `${props.unreadCount} ungelesene Benachrichtigungen`
)
</script>

<template>
  <button
    type="button"
    class="relative flex items-center justify-center min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
    :aria-label="ariaLabel"
    @click="emit('click')"
  >
    <!-- Glocken-Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>

    <!-- Badge (nur wenn ungelesene Benachrichtigungen vorhanden) -->
    <span
      v-if="unreadCount > 0"
      class="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
      aria-hidden="true"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>

    <!-- aria-live Region für Screen-Reader-Ankündigungen -->
    <span
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ ariaLabel }}
    </span>
  </button>
</template>
