<script setup lang="ts">
definePageMeta({
  ssr: false,
})

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  const authCookie = useCookie('auth_token')
  if (authCookie.value) {
    router.push('/dashboard')
  }
})

const email = ref('')
const password = ref('demo123')
const error = ref('')
const isLoading = ref(false)
const selectedPersona = ref<string | null>(null)
const showAdminLogin = ref(false)

const personas = [
  { email: 'nina@demo.de', name: 'Nina Neuanfang', location: 'Nürnberg', initial: 'N' },
  { email: 'maxine@demo.de', name: 'Maxine Snackliebhaber', location: 'Berlin', initial: 'M' },
  { email: 'lucas@demo.de', name: 'Lucas Gesundheitsfan', location: 'Nürnberg', initial: 'L' },
  { email: 'alex@demo.de', name: 'Alex Gelegenheitskäufer', location: 'Berlin', initial: 'A' },
  { email: 'tom@demo.de', name: 'Tom Schnellkäufer', location: 'Nürnberg', initial: 'T' },
]

const selectPersona = (personaEmail: string) => {
  selectedPersona.value = personaEmail
  email.value = personaEmail
  showAdminLogin.value = false
  password.value = 'demo123'
}

const showAdmin = () => {
  showAdminLogin.value = true
  selectedPersona.value = null
  email.value = 'admin@demo.de'
  password.value = 'admin123'
}

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value,
    })
    
    isLoading.value = false
    
    if (result.success) {
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } else {
      error.value = result.error || 'Anmeldung fehlgeschlagen'
    }
  } catch (e) {
    isLoading.value = false
    error.value = 'Ein Fehler ist aufgetreten'
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <div class="text-center max-w-md w-full">
      <h1 class="text-4xl font-bold text-primary mb-2">SnackEase</h1>
      <p class="text-muted-foreground mb-8">Willkommen zurück!</p>
      
      <div v-if="!showAdminLogin" class="mb-6">
        <p class="text-sm font-medium mb-3">Wähle dein Profil:</p>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="persona in personas"
            :key="persona.email"
            @click="selectPersona(persona.email)"
            :aria-pressed="selectedPersona === persona.email"
            :class="[
              'p-3 rounded-lg border transition-all text-left',
              selectedPersona === persona.email
                ? 'border-primary bg-primary/10 ring-2 ring-primary'
                : 'border-input hover:border-primary/50 bg-card'
            ]"
          >
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                {{ persona.initial }}
              </div>
              <div>
                <div class="font-medium text-sm">{{ persona.name }}</div>
                <div class="text-xs text-muted-foreground">{{ persona.location }}</div>
              </div>
            </div>
          </button>
        </div>
        
        <button
          @click="showAdmin"
          class="w-full mt-4 py-3 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Als Admin anmelden"
        >
          Oder als Admin anmelden
        </button>
      </div>
      
      <div v-else class="mb-6">
        <button
          @click="showAdminLogin = false; selectedPersona = null; email = ''"
          class="mb-4 py-3 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Zurück zur Persona-Auswahl"
        >
          ← Zurück zur Persona-Auswahl
        </button>
        <div class="p-4 bg-card rounded-lg border">
          <p class="font-medium">Admin-Anmeldung</p>
          <p class="text-sm text-muted-foreground">admin@demo.de</p>
        </div>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            aria-label="E-Mail-Adresse"
            :readonly="!!selectedPersona || showAdminLogin"
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            :class="{ 'bg-muted': !!selectedPersona || showAdminLogin }"
          />
        </div>
        
        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Passwort"
            required
            aria-label="Passwort"
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <p v-if="error" role="alert" class="text-red-500 text-sm">{{ error }}</p>
        
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {{ isLoading ? 'Anmeldung...' : 'Anmelden' }}
        </button>
      </form>
      
      <p class="text-sm text-muted-foreground mt-4">
        <span v-if="showAdminLogin">Admin: admin@demo.de / admin123</span>
        <span v-else>Demo-Passwort: demo123</span>
      </p>
    </div>
  </div>
</template>
