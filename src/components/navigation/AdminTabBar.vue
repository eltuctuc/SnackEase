<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'

// notificationsStore wird für zukünftige Features benötigt (FEAT-13)
void useNotificationsStore()
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

// Aktuellen Seitentitel ermitteln (für zukünftige Breadcrumbs)
void computed(() => {
  const activeTab = tabs.find(tab => isActive(tab.path))
  return activeTab?.label ?? 'Dashboard'
})

// Icon-Komponente fuer Teenyicons
const getIconPath = (iconName: string, solid: boolean) => {
  // Diese Funktion gibt den passenden SVG-Pfad zurueck
  // Hier sind die wichtigsten Icons vordefiniert
  const icons: Record<string, { outline: string; solid: string }> = {
    'bar-chart': {
      outline: 'M3 3v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6h2v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3H3z',
      solid: 'M3 3v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6h2v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3H3z'
    },
    'users': {
      outline: 'M4.5 6.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm11 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-1 4a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      solid: 'M4.5 6.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm11 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
    },
    'box': {
      outline: 'M7.5 1.5a.5.5 0 0 0-.5.5V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3V2a.5.5 0 0 0-.5-.5h-3zM6 4v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4H6z',
      solid: 'M7.5 1.5a.5.5 0 0 0-.5.5V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3V2a.5.5 0 0 0-.5-.5h-3z'
    },
    'tag': {
      outline: 'M11.5 1.5L3.5 9.5a.5.5 0 0 0 .146.329l6 6a.5.5 0 0 0 .708-.708L12 2.707l1.146-1.147a.5.5 0 0 0-.354-.854zM2 13h10v1H2v-1z',
      solid: 'M11.5 1.5L3.5 9.5a.5.5 0 0 0 .146.329l6 6a.5.5 0 0 0 .708-.708L12 2.707l1.146-1.147a.5.5 0 0 0-.354-.854z'
    },
    'cog': {
      outline: 'M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
      solid: 'M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34z'
    },
    // FEAT-22: Bestand-Icon (Archiv-Box)
    'archive': {
      outline: 'M1.5 2h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5zM2 6v6.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V6H2zm3.5 2h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1z',
      solid: 'M1.5 2h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5zM2 6v6.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V6H2zm3.5 2h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1z'
    }
  }
  return icons[iconName]?.[solid ? 'solid' : 'outline'] ?? ''
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
    aria-label="Admin-Navigation"
  >
    <div class="flex items-center justify-around h-16 max-w-md mx-auto">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        :class="[
          'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-md transition-all duration-200',
          isActive(tab.path)
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        ]"
        :aria-current="isActive(tab.path) ? 'page' : undefined"
      >
        <!-- Icon -->
        <svg
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 15 15"
        >
          <path :d="getIconPath(isActive(tab.path) ? tab.iconSolid : tab.iconOutlined, isActive(tab.path))" />
        </svg>

        <!-- Label -->
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
