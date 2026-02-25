<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { computed } from 'vue'

const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)
const users = computed(() => userStore.users)

function handleSwitch(event: Event) {
  const target = event.target as HTMLSelectElement
  userStore.switchUser(target.value)
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="bg-primary text-primary-foreground shadow-md">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-xl font-bold">SnackEase</h1>
        
        <div class="flex items-center gap-4">
          <!-- User Switcher -->
          <select 
            v-if="currentUser && !userStore.isAdmin"
            :value="currentUser.id"
            @change="handleSwitch"
            class="bg-primary-foreground/10 text-primary-foreground px-3 py-1 rounded-lg text-sm border-none focus:ring-2 focus:ring-accent"
          >
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
          
          <!-- Credit Display -->
          <div v-if="currentUser" class="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1 rounded-lg">
            <span class="text-sm">Guthaben:</span>
            <span class="font-bold">{{ currentUser.credit }}€</span>
          </div>
          
          <!-- Admin Link -->
          <router-link 
            v-if="userStore.isAdmin" 
            to="/admin"
            class="text-sm bg-destructive/20 px-3 py-1 rounded-lg hover:bg-destructive/30"
          >
            Admin
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>
  </div>
</template>
