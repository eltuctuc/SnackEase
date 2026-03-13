<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'

const notificationsStore = useNotificationsStore()
const route = useRoute()

// Tab-Definitionen fuer Admins (6 Tabs inkl. Bestand — FEAT-22)
const tabs = [
  { label: 'Dashboard', path: '/admin', iconOutlined: 'bar-chart', iconSolid: 'bar-chart' },
  { label: 'Benutzer', path: '/admin/users', iconOutlined: 'users', iconSolid: 'users' },
  { label: 'Produkte', path: '/admin/products', iconOutlined: 'box', iconSolid: 'box' },
  { label: 'Kategorien', path: '/admin/categories', iconOutlined: 'tag', iconSolid: 'tag' },
  { label: 'Bestand', path: '/admin/inventory', iconOutlined: 'archive', iconSolid: 'archive' },
  { label: 'Einstellungen', path: '/admin/settings', iconOutlined: 'cog', iconSolid: 'cog' },
]

// Pruefen ob aktueller Pfad aktiv ist
const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

// Icon-Pfade fuer Teenyicons
const getIconPath = (iconName: string) => {
  const icons: Record<string, string> = {
    'bar-chart': 'M3 3v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6h2v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3H3z',
    'users': 'M4.5 6.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm11 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'box': 'M7.5 1.5a.5.5 0 0 0-.5.5V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3V2a.5.5 0 0 0-.5-.5h-3zM6 4v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4H6z',
    'tag': 'M11.5 1.5L3.5 9.5a.5.5 0 0 0 .146.329l6 6a.5.5 0 0 0 .708-.708L12 2.707l1.146-1.147a.5.5 0 0 0-.354-.854z',
    'cog': 'M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34z',
    // FEAT-22: Bestand-Icon (Archiv-Box)
    'archive': 'M1.5 2h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5zM2 6v6.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V6H2zm3.5 2h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1z'
  }
  return icons[iconName] ?? ''
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 bottom-0 w-56 bg-card border-r border-border z-40 flex flex-col"
    aria-label="Admin-Navigation"
  >
    <!-- Header-Bereich -->
    <div class="h-16 flex items-center px-4 border-b border-border">
      <span class="text-xl font-bold text-primary">SnackEase</span>
      <span class="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">Admin</span>
    </div>

    <!-- Navigation Tabs -->
    <nav class="flex-1 py-4 px-3 space-y-1">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
          isActive(tab.path)
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        :aria-current="isActive(tab.path) ? 'page' : undefined"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 15 15">
          <path :d="getIconPath(isActive(tab.path) ? tab.iconSolid : tab.iconOutlined)" />
        </svg>
        <span class="font-medium">{{ tab.label }}</span>

        <!-- Badge fuer Benachrichtigungen an Dashboard -->
        <span
          v-if="tab.path === '/admin' && notificationsStore.unreadCount > 0"
          class="absolute right-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full"
        >
          {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Unterer Bereich -->
    <div class="p-4 border-t border-border">
      <div class="text-xs text-muted-foreground">
        Admin v1.0
      </div>
    </div>
  </aside>
</template>
