<script setup lang="ts">
import UserTabBar from '~/components/navigation/UserTabBar.vue'
import UserSidebar from '~/components/navigation/UserSidebar.vue'
import UserHeader from '~/components/navigation/UserHeader.vue'
import AdminTabBar from '~/components/navigation/AdminTabBar.vue'
import AdminSidebar from '~/components/navigation/AdminSidebar.vue'
import AdminHeader from '~/components/navigation/AdminHeader.vue'

const route = useRoute()

// Bestimmen, ob wir im Admin-Bereich sind
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// Bestimmen ob Mobile (TabBar) oder Desktop (Sidebar)
const isMobile = ref(true)

onMounted(() => {
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768
  }
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

// Bestimmen ob wir auf einer geschützten Seite sind
const isProtected = computed(() => {
  const path = route.path
  return path !== '/login' && path !== '/' && path !== '/api'
})
</script>

<template>
  <div>
    <!-- Desktop: Sidebar -->
    <template v-if="isProtected && !isMobile">
      <UserSidebar v-if="!isAdminRoute" />
      <AdminSidebar v-else-if="isAdminRoute" />
    </template>

    <!-- Mobile: Header + TabBar -->
    <template v-if="isProtected && isMobile">
      <UserHeader v-if="!isAdminRoute" />
      <AdminHeader v-else-if="isAdminRoute" />
      <UserTabBar v-if="!isAdminRoute" />
      <AdminTabBar v-else-if="isAdminRoute" />
    </template>

    <!-- Page Content with proper padding -->
    <div
      :class="[
        'min-h-screen bg-background',
        isProtected ? (isMobile ? 'pt-14 pb-20' : 'pl-56') : ''
      ]"
    >
      <slot />
    </div>
  </div>
</template>
