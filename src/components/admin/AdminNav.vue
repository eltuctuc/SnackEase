<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Nutzer', path: '/admin/users' },
  { label: 'Produkte', path: '/admin/products' },
  { label: 'Kategorien', path: '/admin/categories' },
  { label: 'Bestand', path: '/admin/inventory' },
]

const isActive = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  authStore.logout()
  navigateTo('/login')
}
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
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- User Info + Logout -->
        <div class="flex items-center gap-3">
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
