<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import NotificationBadge from '~/components/admin/NotificationBadge.vue'
import NotificationDropdown from '~/components/admin/NotificationDropdown.vue'

const route = useRoute()
const notificationsStore = useNotificationsStore()

// Tab-Definitionen fuer Seitentitel
const tabs = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Benutzer', path: '/admin/users' },
  { label: 'Produkte', path: '/admin/products' },
  { label: 'Kategorien', path: '/admin/categories' },
  { label: 'Einstellungen', path: '/admin/settings' },
]

// Aktuellen Seitentitel ermitteln
const currentTitle = computed(() => {
  for (const tab of tabs) {
    if (tab.path === '/admin') {
      if (route.path === '/admin') return tab.label
    } else if (route.path.startsWith(tab.path)) {
      return tab.label
    }
  }
  // Fallback fuer andere Admin-Seiten (z.B. /admin/notifications)
  return 'Admin'
})

// Bestimmen ob ein Zurück-Button angezeigt werden soll
const showBackButton = computed(() => {
  return route.path !== '/admin' &&
         !tabs.some(tab => tab.path === route.path || (tab.path !== '/admin' && route.path.startsWith(tab.path)))
})

// Dropdown-Zustand
const dropdownOpen = ref(false)
const badgeButtonRef = ref<HTMLElement | null>(null)
const dropdownWrapperRef = ref<HTMLElement | null>(null)

function openDropdown() {
  dropdownOpen.value = true
}

function closeDropdown() {
  dropdownOpen.value = false
  nextTick(() => {
    badgeButtonRef.value?.focus()
  })
}

// Dropdown schliessen bei Klick ausserhalb
function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  if (
    dropdownWrapperRef.value &&
    !dropdownWrapperRef.value.contains(target) &&
    !badgeButtonRef.value?.contains(target)
  ) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50"
  >
    <div class="h-full flex items-center justify-between px-4 max-w-7xl mx-auto">
      <!-- Linke Seite: Zurück-Button oder Seitentitel -->
      <div class="flex items-center gap-2">
        <!-- Zurück-Button für Sub-Pages -->
        <NuxtLink
          v-if="showBackButton"
          to="/admin"
          class="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Zurück zum Dashboard"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>

        <!-- Seitentitel -->
        <h1 v-if="!showBackButton" class="text-lg font-semibold text-foreground">
          {{ currentTitle }}
        </h1>
        <h1 v-else class="text-lg font-semibold text-foreground">
          {{ currentTitle }}
        </h1>
      </div>

      <!-- Rechte Seite: Benachrichtigungs-Badge + Dropdown -->
      <div class="relative">
        <div ref="badgeButtonRef">
          <NotificationBadge
            :unread-count="notificationsStore.unreadCount"
            @click="openDropdown"
          />
        </div>
        <div ref="dropdownWrapperRef">
          <NotificationDropdown
            v-if="dropdownOpen"
            @close="closeDropdown"
          />
        </div>
      </div>
    </div>
  </header>
</template>
