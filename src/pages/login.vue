<script setup lang="ts">
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  const result = await authStore.login({
    email: email.value,
    password: password.value,
  })
  
  isLoading.value = false
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error || 'Anmeldung fehlgeschlagen'
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <div class="text-center max-w-md w-full">
      <h1 class="text-4xl font-bold text-primary mb-2">SnackEase</h1>
      <p class="text-muted-foreground mb-8">Admin-Anmeldung</p>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Passwort"
            required
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {{ isLoading ? 'Anmeldung...' : 'Anmelden' }}
        </button>
      </form>
      
      <p class="text-sm text-muted-foreground mt-4">
        Admin: admin@demo.de / admin123
      </p>
    </div>
  </div>
</template>
