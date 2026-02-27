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

const personas = [
  { email: 'nina@demo.de', name: 'Nina Neuanfang', location: 'Nürnberg', initial: 'N', guthaben: '25€' },
  { email: 'maxine@demo.de', name: 'Maxine Snackliebhaber', location: 'Berlin', initial: 'M', guthaben: '15€' },
  { email: 'lucas@demo.de', name: 'Lucas Gesundheitsfan', location: 'Nürnberg', initial: 'L', guthaben: '30€' },
  { email: 'alex@demo.de', name: 'Alex Gelegenheitskäufer', location: 'Berlin', initial: 'A', guthaben: '20€' },
  { email: 'tom@demo.de', name: 'Tom Schnellkäufer', location: 'Nürnberg', initial: 'T', guthaben: '10€' },
  { email: 'admin@demo.de', name: 'Admin', location: 'Nürnberg', initial: 'A', guthaben: '-', isAdmin: true },
]

const selectPersona = (personaEmail: string) => {
  selectedPersona.value = personaEmail
  email.value = personaEmail
  password.value = 'demo123'
  nextTick(() => {
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    passwordInput?.focus()
  })
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
      
      <div class="mb-6">
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
            <div v-if="persona.guthaben !== '-'" class="mt-2 text-xs font-medium text-primary">
              Guthaben: {{ persona.guthaben }}
            </div>
            <div v-else class="mt-2 text-xs text-muted-foreground">
              Administrator
            </div>
          </button>
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
            :readonly="!!selectedPersona"
            class="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            :class="{ 'bg-muted': !!selectedPersona }"
          />
        </div>
        
        <div>
          <input
            ref="passwordInput"
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
        Demo-Passwort: demo123
      </p>
    </div>
  </div>
</template>
