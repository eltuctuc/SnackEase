<script setup lang="ts">
import NotificationDropdownItem from '~/components/admin/NotificationDropdownItem.vue'
import { useNotificationsStore } from '~/stores/notifications'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const notificationsStore = useNotificationsStore()

const isMarkingAll = ref(false)
const markReadIds = ref<Set<number>>(new Set())
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)

// Keyboard: Escape schließt das Dropdown
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

async function handleMarkRead(id: number) {
  markReadIds.value.add(id)
  actionError.value = null
  try {
    await notificationsStore.markAsRead(id)
  } catch {
    actionError.value = 'Aktion fehlgeschlagen. Bitte erneut versuchen.'
  } finally {
    markReadIds.value.delete(id)
  }
}

async function handleMarkAllAsRead() {
  if (isMarkingAll.value) return
  isMarkingAll.value = true
  actionError.value = null
  try {
    await notificationsStore.markAllAsRead()
    actionSuccess.value = 'Alle Benachrichtigungen als gelesen markiert'
    setTimeout(() => {
      actionSuccess.value = null
    }, 4000)
  } catch {
    actionError.value = 'Aktion fehlgeschlagen. Bitte erneut versuchen.'
  } finally {
    isMarkingAll.value = false
  }
}

const hasUnread = computed(() => notificationsStore.unreadCount > 0)
</script>

<template>
  <div
    role="dialog"
    aria-label="Benachrichtigungen"
    aria-modal="true"
    class="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
  >
    <!-- Kopfzeile -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h2 class="text-sm font-semibold text-foreground">Benachrichtigungen</h2>
      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
        aria-label="Benachrichtigungen schliessen"
        @click="emit('close')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Fehlermeldung -->
    <div
      v-if="actionError"
      role="alert"
      aria-live="assertive"
      class="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs"
    >
      {{ actionError }}
    </div>

    <!-- Erfolgsmeldung -->
    <div
      v-if="actionSuccess"
      role="status"
      aria-live="polite"
      class="mx-4 mt-3 px-3 py-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs"
    >
      {{ actionSuccess }}
    </div>

    <!-- Loading -->
    <div
      v-if="notificationsStore.isLoading"
      class="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm"
      role="status"
      aria-live="polite"
      aria-label="Benachrichtigungen werden geladen"
    >
      <svg class="animate-spin w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>Wird geladen...</span>
    </div>

    <!-- Leerer Zustand -->
    <div
      v-else-if="notificationsStore.notifications.length === 0"
      class="px-4 py-8 text-center text-sm text-muted-foreground"
    >
      Alle Bestände sind in Ordnung.
    </div>

    <!-- Benachrichtigungs-Liste -->
    <div v-else class="max-h-72 overflow-y-auto">
      <NotificationDropdownItem
        v-for="notification in notificationsStore.notifications"
        :key="notification.id"
        :notification="notification"
        :is-marking-read="markReadIds.has(notification.id)"
        @mark-read="handleMarkRead"
      />
    </div>

    <!-- Fusszeile -->
    <div class="px-4 py-3 border-t border-border flex flex-col gap-2">
      <NuxtLink
        to="/admin/notifications"
        class="block w-full text-center text-xs text-primary hover:underline py-1"
        @click="emit('close')"
      >
        Alle Benachrichtigungen anzeigen
      </NuxtLink>
      <button
        v-if="hasUnread"
        type="button"
        :disabled="isMarkingAll"
        class="w-full px-3 py-2 text-xs border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        @click="handleMarkAllAsRead"
      >
        <span v-if="isMarkingAll" class="inline-flex items-center gap-1.5 justify-center">
          <svg class="animate-spin w-3 h-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Wird verarbeitet...
        </span>
        <span v-else>Alle als gelesen markieren</span>
      </button>
    </div>
  </div>
</template>
