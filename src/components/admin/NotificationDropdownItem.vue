<script setup lang="ts">
import type { Notification } from '~/stores/notifications'

const props = defineProps<{
  notification: Notification
  isMarkingRead?: boolean
}>()

const emit = defineEmits<{
  (e: 'markRead', id: number): void
}>()

const severity = computed(() => props.notification.stockQuantity === 0 ? 'kritisch' : 'niedrig')

const severityClass = computed(() =>
  severity.value === 'kritisch'
    ? 'bg-red-100 text-red-700'
    : 'bg-yellow-100 text-yellow-700'
)

const formattedDate = computed(() => {
  if (!props.notification.createdAt) return '–'
  const d = new Date(props.notification.createdAt)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const isoDate = computed(() => props.notification.createdAt ?? '')
</script>

<template>
  <article
    :class="[
      'px-4 py-3 border-b border-border last:border-0',
      notification.isRead ? 'opacity-60' : '',
    ]"
  >
    <!-- Schweregrad + Stueckzahl -->
    <div class="flex items-center justify-between mb-1">
      <span
        :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide', severityClass]"
        :aria-label="`Schweregrad: ${severity === 'kritisch' ? 'Kritisch' : 'Niedrig'}`"
      >
        {{ severity === 'kritisch' ? 'Kritisch' : 'Niedrig' }}
      </span>
      <span class="text-sm font-semibold text-foreground">
        {{ notification.stockQuantity }} Stück
      </span>
    </div>

    <!-- Produktname -->
    <h3 class="text-sm font-medium text-foreground mb-0.5">
      {{ notification.productName }}
    </h3>

    <!-- Zeitstempel -->
    <p class="text-xs text-muted-foreground mb-3">
      Warnung seit:
      <time :datetime="isoDate">{{ formattedDate }}</time>
    </p>

    <!-- Aktions-Buttons -->
    <div class="flex items-center gap-2">
      <NuxtLink
        to="/admin/inventory"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors min-h-[36px]"
        :aria-label="`Bestand für ${notification.productName} auffüllen`"
      >
        Bestand auffüllen
      </NuxtLink>
      <button
        v-if="!notification.isRead"
        type="button"
        :disabled="isMarkingRead"
        class="inline-flex items-center px-2.5 py-1.5 text-xs border border-border rounded-md hover:bg-accent transition-colors min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        :aria-label="`${notification.productName} als gelesen markieren`"
        @click="emit('markRead', notification.id)"
      >
        Gelesen
      </button>
    </div>
  </article>
</template>
