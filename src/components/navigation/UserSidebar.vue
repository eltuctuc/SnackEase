<script setup lang="ts">
// cartStore wird in FEAT-16 vollständig implementiert
void useCartStore()

const route = useRoute()

// Tab-Definitionen fuer Mitarbeiter
const tabs = [
  { label: 'Snacks', path: '/dashboard', iconOutlined: 'home', iconSolid: 'home' },
  { label: 'Suche', path: '/search', iconOutlined: 'search', iconSolid: 'search' },
  { label: 'Vorbestellung', path: '/orders', iconOutlined: 'bag', iconSolid: 'bag' },
  { label: 'Bestenliste', path: '/leaderboard', iconOutlined: 'trophy', iconSolid: 'trophy' },
  { label: 'Profil', path: '/profile', iconOutlined: 'user', iconSolid: 'user' },
]

// Pruefen ob aktueller Pfad aktiv ist
const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/'
  }
  return route.path.startsWith(path)
}

// Icon-Pfade fuer Teenyicons
const getIconPath = (iconName: string, solid: boolean) => {
  const icons: Record<string, { outline: string; solid: string }> = {
    'home': {
      outline: 'M7.5 1.049a.5.5 0 0 1 .448.277l.447 1.789 1.789.447a.5.5 0 0 1 .277.448v1.789a.5.5 0 0 1-.277.448l-1.635.817a.5.5 0 0 0-.277.448v.817a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-.817a.5.5 0 0 0-.277-.448l-1.635-.817a.5.5 0 0 1-.277-.448V4.01a.5.5 0 0 1 .277-.448l1.789-.447.447-1.789a.5.5 0 0 1 .448-.277z',
      solid: 'M7.5 1.049a.5.5 0 0 1 .448.277l.447 1.789 1.789.447a.5.5 0 0 1 .277.448v1.789a.5.5 0 0 1-.277.448l-1.635.817a.5.5 0 0 0-.277.448v.817a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-.817a.5.5 0 0 0-.277-.448l-1.635-.817a.5.5 0 0 1-.277-.448V4.01a.5.5 0 0 1 .277-.448l1.789-.447.447-1.789a.5.5 0 0 1 .448-.277z'
    },
    'search': {
      outline: 'M10.71 10.5a3.5 3.5 0 1 0-4.133 2.513l2.547 2.547a.5.5 0 0 0 .707-.708l-2.547-2.547a.5.5 0 0 0 .658-.083zM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7z',
      solid: 'M10.71 10.5a3.5 3.5 0 1 0-4.133 2.513l2.547 2.547a.5.5 0 0 0 .707-.708l-2.547-2.547a.5.5 0 0 0 .658-.083zM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7z'
    },
    'bag': {
      outline: 'M7.5 1.5a.5.5 0 0 0-1 0V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2.5V1.5zM6 4v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4H6z',
      solid: 'M7.5 1.5a.5.5 0 0 0-1 0V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2.5V1.5zM6 4v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4H6z'
    },
    'trophy': {
      outline: 'M2.5 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM4 7h6v3H4V7zm7-2H4V3h7v2zm-1 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-5 2h8a2 2 0 0 0 2-2v-.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v.5a2 2 0 0 0 2 2z',
      solid: 'M2.5 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM4 7h6v3H4V7zm7-2H4V3h7v2zm-1 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-5 2h8a2 2 0 0 0 2-2v-.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v.5a2 2 0 0 0 2 2z'
    },
    'user': {
      outline: 'M7.5 1.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h3zm-3 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
      solid: 'M7.5 1.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h3zm-3 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z'
    }
  }
  return icons[iconName]?.[solid ? 'solid' : 'outline'] ?? ''
}
</script>

<template>
  <aside
    class="fixed left-0 top-0 bottom-0 w-56 bg-card border-r border-border z-40 flex flex-col"
    aria-label="Navigation"
  >
    <!-- Logo-Bereich -->
    <div class="h-16 flex items-center px-4 border-b border-border">
      <span class="text-xl font-bold text-primary">SnackEase</span>
    </div>

    <!-- Navigation Tabs -->
    <nav class="flex-1 py-4 px-3 space-y-1">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          isActive(tab.path)
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        :aria-current="isActive(tab.path) ? 'page' : undefined"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 15 15">
          <path :d="getIconPath(isActive(tab.path) ? tab.iconSolid : tab.iconOutlined, isActive(tab.path))" />
        </svg>
        <span class="font-medium">{{ tab.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Unterer Bereich (optional fuer User-Info) -->
    <div class="p-4 border-t border-border">
      <div class="text-xs text-muted-foreground">
        SnackEase v1.0
      </div>
    </div>
  </aside>
</template>
