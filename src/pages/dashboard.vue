<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-primary">Dashboard</h1>
        
        <button 
          @click="logout"
          class="py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
        >
          Abmelden
        </button>
      </div>
      
      <div class="bg-card rounded-lg p-6 border">
        <p class="text-foreground">Willkommen im Dashboard!</p>
        <p class="text-muted-foreground mt-2">Hier werden später die User-Daten angezeigt.</p>
      </div>
    </div>
  </div>
</template>
