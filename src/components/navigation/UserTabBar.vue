<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

// Warenkorb-Store fuer Badge (wird in FEAT-16 vollstaendig implementiert)
// fuer FEAT-15 nutzen wir einen temporaeren Mock-Store
const cartStore = useCartStore()
const cartCount = computed(() => cartStore?.itemCount ?? 0)

const route = useRoute()

// Tab-Definitionen fuer Mitarbeiter
const tabs = [
  { label: 'Snacks', path: '/dashboard', iconOutlined: 'home', iconSolid: 'home' },
  { label: 'Suche', path: '/search', iconOutlined: 'search', iconSolid: 'search' },
  { label: 'Vorbestellung', path: '/orders', iconOutlined: 'bag', iconSolid: 'bag' },
  { label: 'Bestenliste', path: '/leaderboard', iconOutlined: 'trophy', iconSolid: 'trophy' },
  { label: 'Profil', path: '/profile', iconOutlined: 'user', iconSolid: 'user' },
]

// Prüfen ob aktueller Pfad aktiv ist
const isActive = (path: string) => {
  // Root-Pfad oder exakte Uebereinstimmung
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
    aria-label="Navigation"
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
        <!-- Icon (Solid wenn aktiv, Outlined wenn inaktiv) -->
        <svg
          v-if="isActive(tab.path)"
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 15 15"
        >
          <path
            v-if="tab.iconSolid === 'home'"
            d="M7.5 1.049a.5.5 0 0 1 .448.277l.447 1.789 1.789.447a.5.5 0 0 1 .277.448v1.789a.5.5 0 0 1-.277.448l-1.635.817a.5.5 0 0 0-.277.448v.817a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-.817a.5.5 0 0 0-.277-.448l-1.635-.817a.5.5 0 0 1-.277-.448V4.01a.5.5 0 0 1 .277-.448l1.789-.447.447-1.789a.5.5 0 0 1 .448-.277z"
          />
          <path
            v-else-if="tab.iconSolid === 'search'"
            d="M10.71 10.5a3.5 3.5 0 1 0-4.133 2.513l2.547 2.547a.5.5 0 0 0 .707-.708l-2.547-2.547a.5.5 0 0 0 .658-.083zM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7z"
          />
          <path
            v-else-if="tab.iconSolid === 'bag'"
            d="M7.5 1.5a.5.5 0 0 0-1 0V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2.5V1.5zM6 4v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4H6z"
          />
          <path
            v-else-if="tab.iconSolid === 'trophy'"
            d="M2.5 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM4 7h6v3H4V7zm7-2H4V3h7v2zm-1 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-5 2h8a2 2 0 0 0 2-2v-.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v.5a2 2 0 0 0 2 2z"
          />
          <path
            v-else-if="tab.iconSolid === 'user'"
            d="M7.5 1.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h3zm-3 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 15 15"
        >
          <path
            v-if="tab.iconOutlined === 'home'"
            d="M7.5 1.049a.5.5 0 0 1 .448.277l.447 1.789 1.789.447a.5.5 0 0 1 .277.448v1.789a.5.5 0 0 1-.277.448l-1.635.817a.5.5 0 0 0-.277.448v.817a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-.817a.5.5 0 0 0-.277-.448l-1.635-.817a.5.5 0 0 1-.277-.448V4.01a.5.5 0 0 1 .277-.448l1.789-.447.447-1.789a.5.5 0 0 1 .448-.277z"
          />
          <path
            v-else-if="tab.iconOutlined === 'search'"
            d="M10.71 10.5a3.5 3.5 0 1 0-4.133 2.513l2.547 2.547a.5.5 0 0 0 .707-.708l-2.547-2.547a.5.5 0 0 0 .658-.083zM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7z"
          />
          <path
            v-else-if="tab.iconOutlined === 'bag'"
            d="M7.5 1.5a.5.5 0 0 0-1 0V3H4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-2.5V1.5zM6 4v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V4H6z"
          />
          <path
            v-else-if="tab.iconOutlined === 'trophy'"
            d="M2.5 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM4 7h6v3H4V7zm7-2H4V3h7v2zm-1 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-5 2h8a2 2 0 0 0 2-2v-.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v.5a2 2 0 0 0 2 2z"
          />
          <path
            v-else-if="tab.iconOutlined === 'user'"
            d="M7.5 1.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h3zm-3 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
          />
        </svg>

        <!-- Label -->
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
