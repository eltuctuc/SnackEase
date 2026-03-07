<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

interface AdminUser {
  id: number
  email: string
  name: string | null
  role: string
  location: string | null
  isActive: boolean
  createdAt: string
}

const users = ref<AdminUser[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

// Neuen Nutzer anlegen
const showCreateModal = ref(false)
const newUser = ref({ name: '', location: 'Nürnberg', startCredits: 25 })
const isCreating = ref(false)
const createError = ref<string | null>(null)
const createSuccessMsg = ref<string | null>(null)

// Nutzer bearbeiten
const showEditModal = ref(false)
const editingUser = ref<AdminUser | null>(null)
const editForm = ref({ name: '', location: '' })
const isEditing = ref(false)
const editError = ref<string | null>(null)

// Guthaben zuweisen
const showCreditModal = ref(false)
const creditUserId = ref<number | null>(null)
const creditUserName = ref('')
const creditAmount = ref<number>(10)
const creditNote = ref('')
const isAssigningCredit = ref(false)
const creditError = ref<string | null>(null)
const creditSuccessMsg = ref<string | null>(null)

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = !searchQuery.value ||
      u.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      filterStatus.value === 'all' ||
      (filterStatus.value === 'active' && u.isActive !== false) ||
      (filterStatus.value === 'inactive' && u.isActive === false)

    return matchesSearch && matchesStatus
  })
})

const fetchUsers = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await $fetch('/api/admin/users')
    users.value = ((data as { users: AdminUser[] }).users || []) as AdminUser[]
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Laden der Nutzer'
  } finally {
    isLoading.value = false
  }
}

const handleCreateUser = async () => {
  if (!newUser.value.name || isCreating.value) return

  isCreating.value = true
  createError.value = null
  createSuccessMsg.value = null

  try {
    const result = await $fetch<{ user: { email: string } }>('/api/admin/users', {
      method: 'POST',
      body: newUser.value,
    })

    const generatedEmail = result.user.email
    createSuccessMsg.value = `Nutzer angelegt - Login: ${generatedEmail} / demo123`
    showCreateModal.value = false
    newUser.value = { name: '', location: 'Nürnberg', startCredits: 25 }
    await fetchUsers()
  } catch (e: unknown) {
    createError.value = (e as { message?: string }).message || 'Fehler beim Erstellen des Nutzers'
  } finally {
    isCreating.value = false
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newUser.value = { name: '', location: 'Nürnberg', startCredits: 25 }
  createError.value = null
}

const openEditModal = (user: AdminUser) => {
  editingUser.value = user
  editForm.value = { name: user.name || '', location: user.location || 'Nürnberg' }
  editError.value = null
  showEditModal.value = true
}

const handleEditUser = async () => {
  if (!editingUser.value || isEditing.value) return

  isEditing.value = true
  editError.value = null

  try {
    await $fetch(`/api/admin/users/${editingUser.value.id}` as string, {
      method: 'PATCH',
      body: editForm.value,
    })
    showEditModal.value = false
    await fetchUsers()
  } catch (e: unknown) {
    editError.value = (e as { message?: string }).message || 'Fehler beim Bearbeiten des Nutzers'
  } finally {
    isEditing.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
  editError.value = null
}

const toggleUser = async (userId: number) => {
  try {
    await $fetch(`/api/admin/users/${userId}/toggle` as string, { method: 'POST' })
    await fetchUsers()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Ändern des Nutzer-Status'
  }
}

const openCreditModal = (user: AdminUser) => {
  creditUserId.value = user.id
  creditUserName.value = user.name || user.email
  creditAmount.value = 10
  creditNote.value = ''
  creditError.value = null
  showCreditModal.value = true
}

const handleAssignCredit = async () => {
  if (!creditUserId.value || isAssigningCredit.value) return
  if (!creditAmount.value || creditAmount.value <= 0) {
    creditError.value = 'Betrag muss positiv sein'
    return
  }

  isAssigningCredit.value = true
  creditError.value = null
  creditSuccessMsg.value = null

  try {
    await $fetch(`/api/admin/users/${creditUserId.value}/credit` as string, {
      method: 'POST',
      body: { amount: creditAmount.value, note: creditNote.value || undefined },
    })
    creditSuccessMsg.value = `${creditAmount.value} EUR wurden zugewiesen`
    showCreditModal.value = false
  } catch (e: unknown) {
    creditError.value = (e as { message?: string }).message || 'Fehler beim Zuweisen des Guthabens'
  } finally {
    isAssigningCredit.value = false
  }
}

const closeCreditModal = () => {
  showCreditModal.value = false
  creditUserId.value = null
  creditError.value = null
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
  <div class="min-h-screen bg-background">
    <AdminNav />

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Nutzer-Verwaltung</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ filteredUsers.length }} Nutzer angezeigt</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          + Neuer Nutzer
        </button>
      </div>

      <!-- Erfolgsmeldungen -->
      <div v-if="createSuccessMsg" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between">
        <span>{{ createSuccessMsg }}</span>
        <button @click="createSuccessMsg = null" class="text-green-600 hover:text-green-800">✕</button>
      </div>
      <div v-if="creditSuccessMsg" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between">
        <span>{{ creditSuccessMsg }}</span>
        <button @click="creditSuccessMsg = null" class="text-green-600 hover:text-green-800">✕</button>
      </div>

      <!-- Filter & Suche -->
      <div class="flex gap-3 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Name oder Email suchen..."
          class="flex-1 px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        />
        <select
          v-model="filterStatus"
          class="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        >
          <option value="all">Alle</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Inaktiv</option>
        </select>
      </div>

      <!-- Lade-Zustand -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Wird geladen...</p>
      </div>

      <!-- Fehler -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Tabelle -->
      <div v-else class="bg-card rounded-lg border overflow-hidden">
        <table class="w-full text-sm">
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
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="border-t hover:bg-muted/30 transition-colors"
            >
              <td class="p-4 font-medium">{{ user.name || '-' }}</td>
              <td class="p-4 text-muted-foreground">{{ user.email }}</td>
              <td class="p-4">{{ user.location || '-' }}</td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded font-medium',
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
                <div v-if="user.role !== 'admin'" class="flex gap-2 flex-wrap">
                  <button
                    @click="openEditModal(user)"
                    class="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    Bearbeiten
                  </button>
                  <button
                    @click="openCreditModal(user)"
                    class="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                  >
                    Guthaben
                  </button>
                  <button
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
                </div>
                <span v-else class="text-xs text-muted-foreground">Admin</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredUsers.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Keine Nutzer gefunden</p>
        </div>
      </div>
    </div>

    <!-- Modal: Neuer Nutzer -->
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
            <button @click="closeCreateModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <label for="user-name" class="block text-sm font-medium mb-2">Name *</label>
              <input
                id="user-name"
                v-model="newUser.name"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="Max Mustermann"
              />
              <p class="text-xs text-muted-foreground mt-1">
                Email wird automatisch generiert: {{ newUser.name ? newUser.name.toLowerCase().replace(/\s+/g, '.') + '@demo.de' : 'vorname.nachname@demo.de' }}
              </p>
            </div>

            <div>
              <label for="user-location" class="block text-sm font-medium mb-2">Standort *</label>
              <select
                id="user-location"
                v-model="newUser.location"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              >
                <option value="Nürnberg">Nürnberg</option>
                <option value="Berlin">Berlin</option>
              </select>
            </div>

            <div>
              <label for="user-credits" class="block text-sm font-medium mb-2">Startguthaben (EUR)</label>
              <input
                id="user-credits"
                v-model.number="newUser.startCredits"
                type="number"
                min="0"
                step="1"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>

          <div v-if="createError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ createError }}
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="closeCreateModal" class="flex-1 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors text-sm">
              Abbrechen
            </button>
            <button
              @click="handleCreateUser"
              :disabled="!newUser.name || isCreating"
              class="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isCreating ? 'Wird angelegt...' : 'Nutzer anlegen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Nutzer bearbeiten -->
    <Teleport to="body">
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeEditModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 id="edit-modal-title" class="text-xl font-bold">Nutzer bearbeiten</h2>
            <button @click="closeEditModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <label for="edit-name" class="block text-sm font-medium mb-2">Name</label>
              <input
                id="edit-name"
                v-model="editForm.name"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            <div>
              <label for="edit-location" class="block text-sm font-medium mb-2">Standort</label>
              <select
                id="edit-location"
                v-model="editForm.location"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              >
                <option value="Nürnberg">Nürnberg</option>
                <option value="Berlin">Berlin</option>
              </select>
            </div>
          </div>

          <div v-if="editError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ editError }}
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="closeEditModal" class="flex-1 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors text-sm">
              Abbrechen
            </button>
            <button
              @click="handleEditUser"
              :disabled="isEditing"
              class="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isEditing ? 'Wird gespeichert...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Guthaben zuweisen -->
    <Teleport to="body">
      <div
        v-if="showCreditModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeCreditModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 id="credit-modal-title" class="text-xl font-bold">Guthaben zuweisen</h2>
            <button @click="closeCreditModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">✕</button>
          </div>

          <p class="text-sm text-muted-foreground mb-4">
            Guthaben fuer: <strong>{{ creditUserName }}</strong>
          </p>

          <div class="space-y-4">
            <div>
              <label for="credit-amount" class="block text-sm font-medium mb-2">Betrag (EUR) *</label>
              <input
                id="credit-amount"
                v-model.number="creditAmount"
                type="number"
                min="0.01"
                step="0.01"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="10.00"
              />
            </div>
            <div>
              <label for="credit-note" class="block text-sm font-medium mb-2">Notiz (optional)</label>
              <input
                id="credit-note"
                v-model="creditNote"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="z.B. Bonus fuer Event"
              />
            </div>
          </div>

          <div v-if="creditError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ creditError }}
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="closeCreditModal" class="flex-1 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors text-sm">
              Abbrechen
            </button>
            <button
              @click="handleAssignCredit"
              :disabled="!creditAmount || creditAmount <= 0 || isAssigningCredit"
              class="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isAssigningCredit ? 'Wird zugewiesen...' : 'Zuweisen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
