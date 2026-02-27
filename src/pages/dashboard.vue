<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
}

onMounted(async () => {
  await authStore.initFromCookie()
  
  if (!authStore.user) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
          <p v-if="authStore.user" class="text-sm text-muted-foreground mt-1">
            Angemeldet als {{ authStore.user.name }} 
            <span v-if="authStore.user.location">({{ authStore.user.location }})</span>
            <span class="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
              {{ authStore.user.role }}
            </span>
          </p>
        </div>
        
        <button 
          @click="logout"
          class="py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
        >
          Abmelden
        </button>
      </div>
      
      <div class="bg-card rounded-lg p-6 border">
        <p class="text-foreground">Willkommen im Admin-Dashboard!</p>
        <p class="text-muted-foreground mt-2">Hier werden später die Admin-Funktionen angezeigt.</p>
      </div>
    </div>
  </div>
</template>
