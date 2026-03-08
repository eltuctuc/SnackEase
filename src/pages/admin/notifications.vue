<script setup lang="ts">
import NotificationCard from '~/components/admin/NotificationCard.vue'
import { useNotificationsStore } from '~/stores/notifications'

const authStore = useAuthStore()
const router = useRouter()
const notificationsStore = useNotificationsStore()

// ========================================
// STATE
// ========================================

const filterMode = ref<'all' | 'unread'>('all')
const isMarkingAll = ref(false)
const markReadIds = ref<Set<number>>(new Set())
const actionSuccess = ref<string | null>(null)
const actionError = ref<string | null>(null)

// ========================================
// AUTH GUARD
// ========================================

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    await router.push('/login')
    return
  }
  // BUG-FEAT13-004: Kein doppelter API-Call — AdminNav hat bereits geladen und Polling gestartet.
  // Nur laden wenn der Store noch leer ist (z.B. Direktaufruf ohne AdminNav-Init).
  if (notificationsStore.notifications.length === 0) {
    await notificationsStore.fetchNotifications()
  }
})

// ========================================
// COMPUTED
// ========================================

const filteredNotifications = computed(() => {
  if (filterMode.value === 'unread') {
    return notificationsStore.notifications.filter((n) => !n.isRead)
  }
  return notificationsStore.notifications
})

const hasUnread = computed(() => notificationsStore.unreadCount > 0)

// ========================================
// AKTIONEN
// ========================================

async function handleMarkRead(id: number) {
  markReadIds.value.add(id)
  actionError.value = null
  try {
    await notificationsStore.markAsRead(id)
    actionSuccess.value = 'Benachrichtigung als gelesen markiert'
    setTimeout(() => { actionSuccess.value = null }, 4000)
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
    const count = notificationsStore.unreadCount
    await notificationsStore.markAllAsRead()
    actionSuccess.value = `${count} Benachrichtigung${count !== 1 ? 'en' : ''} als gelesen markiert`
    setTimeout(() => { actionSuccess.value = null }, 4000)
  } catch {
    actionError.value = 'Aktion fehlgeschlagen. Bitte erneut versuchen.'
  } finally {
    isMarkingAll.value = false
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-6 py-8">
    <!-- Seitenheader -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Low-Stock-Benachrichtigungen</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Produkte mit niedrigem Bestand im Automaten
        </p>
      </div>
    </div>

    <!-- Erfolgsmeldung -->
    <div
      v-if="actionSuccess"
      role="status"
      aria-live="polite"
      class="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center justify-between"
    >
      <span>{{ actionSuccess }}</span>
      <button
        @click="actionSuccess = null"
        class="text-green-600 hover:text-green-800 p-1 cursor-pointer"
        aria-label="Erfolgsmeldung schliessen"
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
      class="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center justify-between"
    >
      <span>{{ actionError }}</span>
      <button
        @click="actionError = null"
        class="text-red-600 hover:text-red-800 p-1 cursor-pointer"
        aria-label="Fehlermeldung schliessen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="notificationsStore.isLoading"
      class="flex items-center justify-center gap-2 py-16 text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-label="Benachrichtigungen werden geladen"
    >
      <svg class="animate-spin w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>Wird geladen...</span>
    </div>

    <template v-else>
      <!-- Leerer Zustand: Keine Benachrichtigungen insgesamt -->
      <div
        v-if="notificationsStore.notifications.length === 0"
        class="flex flex-col items-center justify-center py-24 text-center"
      >
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-foreground mb-2">Alle Bestände sind in Ordnung.</h2>
        <p class="text-sm text-muted-foreground mb-6">Aktuell gibt es keine Low-Stock-Warnungen.</p>
      </div>

      <template v-else>
        <!-- Filter-Leiste + Alle-als-gelesen-Button -->
        <div class="flex items-center justify-between gap-3 mb-5">
          <div class="flex items-center gap-2">
            <button
              type="button"
              :class="[
                'px-3 py-1.5 text-sm rounded-md font-medium transition-colors cursor-pointer',
                filterMode === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              ]"
              @click="filterMode = 'all'"
            >
              Alle ({{ notificationsStore.notifications.length }})
            </button>
            <button
              type="button"
              :class="[
                'px-3 py-1.5 text-sm rounded-md font-medium transition-colors cursor-pointer',
                filterMode === 'unread'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              ]"
              @click="filterMode = 'unread'"
            >
              Ungelesen ({{ notificationsStore.unreadCount }})
            </button>
          </div>
          <button
            v-if="hasUnread"
            type="button"
            :disabled="isMarkingAll"
            class="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            @click="handleMarkAllAsRead"
          >
            <span v-if="isMarkingAll" class="inline-flex items-center gap-1.5">
              <svg class="animate-spin w-3.5 h-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Wird markiert...
            </span>
            <span v-else>Alle als gelesen markieren</span>
          </button>
        </div>

        <!-- Benachrichtigungs-Liste -->
        <div v-if="filteredNotifications.length > 0" class="space-y-4">
          <NotificationCard
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :notification="notification"
            :is-marking-read="markReadIds.has(notification.id)"
            @mark-read="handleMarkRead"
          />
        </div>

        <!-- Filter ergibt keine Treffer -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
        >
          <p class="text-sm">Keine ungelesenen Benachrichtigungen vorhanden.</p>
        </div>
      </template>
    </template>
  </div>
</template>
