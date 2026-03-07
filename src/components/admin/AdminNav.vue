<script setup lang="ts">
import NotificationBadge from '~/components/admin/NotificationBadge.vue'
import NotificationDropdown from '~/components/admin/NotificationDropdown.vue'
import { useNotificationsStore } from '~/stores/notifications'

const authStore = useAuthStore()
const route = useRoute()
const notificationsStore = useNotificationsStore()

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Nutzer', path: '/admin/users' },
  { label: 'Produkte', path: '/admin/products' },
  { label: 'Kategorien', path: '/admin/categories' },
  { label: 'Bestand', path: '/admin/inventory' },
  { label: 'Benachr.', path: '/admin/notifications' },
]

const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  notificationsStore.stopPolling()
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  authStore.logout()
  navigateTo('/login')
}

// Dropdown-Zustand
const dropdownOpen = ref(false)
const badgeButtonRef = ref<HTMLElement | null>(null)

function openDropdown() {
  dropdownOpen.value = true
}

function closeDropdown() {
  dropdownOpen.value = false
  // Fokus zurück auf Badge-Button nach Schliessen (WCAG)
  nextTick(() => {
    badgeButtonRef.value?.focus()
  })
}

// Dropdown schliessen bei Klick außerhalb
function handleOutsideClick(event: MouseEvent) {
  const target = event.target as Node
  const dropdown = document.querySelector('[role="dialog"][aria-label="Benachrichtigungen"]')
  if (dropdown && !dropdown.contains(target) && !badgeButtonRef.value?.contains(target)) {
    dropdownOpen.value = false
  }
}

onMounted(async () => {
  // Benachrichtigungen initial laden und Polling starten
  if (authStore.user?.role === 'admin') {
    await notificationsStore.fetchNotifications()
    notificationsStore.startPolling()
  }
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  notificationsStore.stopPolling()
})
</script>

<template>
  <header class="bg-card border-b border-border sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center justify-between h-14">
        <!-- Logo + Titel -->
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold text-primary">SnackEase</span>
          <span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">Admin</span>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center gap-1" aria-label="Admin-Navigation">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            ]"
          >
            <span class="flex items-center gap-1.5">
              {{ item.label }}
              <!-- Ungelesen-Zaehler im Nav-Item Benachr. -->
              <span
                v-if="item.path === '/admin/notifications' && notificationsStore.unreadCount > 0"
                class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full leading-none"
                aria-hidden="true"
              >
                {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
              </span>
            </span>
          </NuxtLink>
        </nav>

        <!-- Rechte Seite: Benachrichtigungs-Badge + User Info + Logout -->
        <div class="flex items-center gap-3">
          <!-- Notification Badge + Dropdown -->
          <div class="relative">
            <div ref="badgeButtonRef">
              <NotificationBadge
                :unread-count="notificationsStore.unreadCount"
                @click="openDropdown"
              />
            </div>
            <NotificationDropdown
              v-if="dropdownOpen"
              @close="closeDropdown"
            />
          </div>

          <span v-if="authStore.user" class="text-sm text-muted-foreground">
            {{ authStore.user.name }}
          </span>
          <button
            @click="handleLogout"
            class="py-1.5 px-3 text-sm border border-border text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            aria-label="Als Admin abmelden"
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
