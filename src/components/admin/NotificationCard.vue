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

const severityLabel = computed(() =>
  severity.value === 'kritisch'
    ? `Kritisch: ${props.notification.stockQuantity} Stück`
    : `Niedrig: ${props.notification.stockQuantity} Stück`
)

const severityBadgeClass = computed(() =>
  severity.value === 'kritisch'
    ? 'bg-red-100 text-red-700 border border-red-200'
    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
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
      'bg-card border border-border rounded-lg p-5 transition-colors',
      notification.isRead ? 'opacity-60' : '',
    ]"
  >
    <!-- Schweregrad-Badge -->
    <div class="flex items-center gap-2 mb-3">
      <span
        :class="['inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide', severityBadgeClass]"
      >
        {{ severityLabel }}
      </span>
      <span v-if="notification.isRead" class="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Gelesen
      </span>
    </div>

    <!-- Produktname -->
    <h3 class="text-base font-semibold text-foreground mb-1">
      {{ notification.productName }}
    </h3>

    <!-- Kategorie -->
    <p class="text-sm text-muted-foreground mb-1 capitalize">
      Kategorie: {{ notification.productCategory }}
    </p>

    <!-- Zeitstempel -->
    <p class="text-sm text-muted-foreground mb-4">
      Warnung seit:
      <time :datetime="isoDate">{{ formattedDate }} Uhr</time>
    </p>

    <!-- Aktions-Buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <NuxtLink
        to="/admin/inventory"
        class="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]"
        :aria-label="`Bestand für ${notification.productName} auffüllen`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Bestand auffüllen
      </NuxtLink>
      <button
        v-if="!notification.isRead"
        type="button"
        :disabled="isMarkingRead"
        class="inline-flex items-center px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        :aria-label="`${notification.productName} als gelesen markieren`"
        @click="emit('markRead', notification.id)"
      >
        <span v-if="isMarkingRead" class="inline-flex items-center gap-1.5">
          <svg class="animate-spin w-3.5 h-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Wird markiert...
        </span>
        <span v-else>Als gelesen markieren</span>
      </button>
    </div>
  </article>
</template>
