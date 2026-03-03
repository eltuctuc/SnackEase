<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

interface User {
  id: number
  email: string
  name: string | null
  role: string
  location: string | null
  isActive: boolean
  createdAt: Date
}

const users = ref<User[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const showCreateModal = ref(false)
const newUser = ref({
  name: '',
  location: 'Nürnberg',
  startCredits: 25
})
const isCreating = ref(false)
const createError = ref<string | null>(null)

const isAdmin = computed(() => authStore.user?.role === 'admin')

const fetchUsers = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await $fetch('/api/admin/users')
    users.value = (data as any).users || []
  } catch (e: any) {
    error.value = e.message || 'Fehler beim Laden der Nutzer'
  } finally {
    isLoading.value = false
  }
}

const handleCreateUser = async () => {
  if (!newUser.value.name || isCreating.value) return
  
  isCreating.value = true
  createError.value = null
  
  try {
    await $fetch('/api/admin/users', { 
      method: 'POST',
      body: newUser.value
    })
    showCreateModal.value = false
    newUser.value = { name: '', location: 'Nürnberg', startCredits: 25 }
    await fetchUsers()
  } catch (e: any) {
    createError.value = e.message || 'Fehler beim Erstellen des Nutzers'
  } finally {
    isCreating.value = false
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newUser.value = { name: '', location: 'Nürnberg', startCredits: 25 }
  createError.value = null
}

const toggleUser = async (userId: number) => {
  try {
    await $fetch(`/api/admin/users/${userId}/toggle`, { method: 'POST' })
    await fetchUsers()
  } catch (e: any) {
    error.value = e.message || 'Fehler beim Ändern des Nutzer-Status'
  }
}

onMounted(async () => {
  await authStore.initFromCookie()
  
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  if (authStore.user.role !== 'admin') {
    router.push('/dashboard')
    return
  }
  
  await fetchUsers()
})
</script>

<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-primary">Nutzer-Verwaltung</h1>
          <p v-if="authStore.user" class="text-sm text-muted-foreground mt-1">
            Angemeldet als {{ authStore.user.name }}
            <span class="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
              Admin
            </span>
          </p>
        </div>
        
        <div class="flex gap-3">
          <NuxtLink 
            to="/admin"
            class="py-2 px-4 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
          >
            Zurück zum Admin
          </NuxtLink>
        </div>
      </div>

      <div class="flex justify-end mb-6">
        <button 
          @click="showCreateModal = true"
          class="py-2 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          + Neuen Nutzer anlegen
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Laden...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <div v-else class="bg-card rounded-lg border overflow-hidden">
        <table class="w-full">
          <thead class="bg-muted">
            <tr>
              <th class="text-left p-4 font-medium text-muted-foreground">Name</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Email</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Standort</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Erstellt</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-t">
              <td class="p-4 font-medium">{{ user.name || '-' }}</td>
              <td class="p-4 text-muted-foreground">{{ user.email }}</td>
              <td class="p-4">{{ user.location || '-' }}</td>
              <td class="p-4">
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded',
                    user.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  ]"
                >
                  {{ user.isActive === false ? 'Inaktiv' : 'Aktiv' }}
                </span>
              </td>
              <td class="p-4 text-muted-foreground">
                {{ new Date(user.createdAt).toLocaleDateString('de-DE') }}
              </td>
              <td class="p-4">
                <button
                  v-if="user.role !== 'admin'"
                  @click="toggleUser(user.id)"
                  :class="[
                    'px-3 py-1 text-xs rounded transition-colors',
                    user.isActive === false 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  ]"
                >
                  {{ user.isActive === false ? 'Aktivieren' : 'Deaktivieren' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="users.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Keine Nutzer gefunden</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div 
        v-if="showCreateModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeCreateModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 id="create-modal-title" class="text-xl font-bold">Neuen Nutzer anlegen</h2>
            <button 
              @click="closeCreateModal"
              class="text-muted-foreground hover:text-foreground p-1"
              aria-label="Modal schließen"
            >
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label for="user-name" class="block text-sm font-medium mb-2">Name *</label>
              <input
                id="user-name"
                v-model="newUser.name"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Max Mustermann"
              />
            </div>
            
            <div>
              <label for="user-location" class="block text-sm font-medium mb-2">Standort *</label>
              <select
                id="user-location"
                v-model="newUser.location"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Nürnberg">Nürnberg</option>
                <option value="Berlin">Berlin</option>
              </select>
            </div>
            
            <div>
              <label for="user-credits" class="block text-sm font-medium mb-2">Startguthaben</label>
              <input
                id="user-credits"
                v-model.number="newUser.startCredits"
                type="number"
                min="0"
                step="1"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div v-if="createError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ createError }}
          </div>

          <div class="flex gap-3 mt-6">
            <button 
              @click="closeCreateModal"
              class="flex-1 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button 
              @click="handleCreateUser"
              :disabled="!newUser.name || isCreating"
              class="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? 'Wird erstellt...' : 'Nutzer anlegen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
