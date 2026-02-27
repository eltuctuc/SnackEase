<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()

const login = () => {
  authStore.login({
    id: 1,
    email: 'demo@snackease.de',
    name: 'Demo User',
  })
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <div class="text-center max-w-md w-full">
      <h1 class="text-4xl font-bold text-primary mb-4">SnackEase</h1>
      <p class="text-muted-foreground mb-8">Willkommen zurück!</p>
      
      <button 
        @click="login"
        class="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Anmelden (Demo)
      </button>
      
      <p class="text-sm text-muted-foreground mt-4">
        Klicke "Anmelden" für Demo-Login
      </p>
    </div>
  </div>
</template>
