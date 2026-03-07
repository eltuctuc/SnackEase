<script setup lang="ts">
import AdminNav from '~/components/admin/AdminNav.vue'

const authStore = useAuthStore()
const router = useRouter()

interface InventoryItem {
  productId: number
  productName: string
  category: string
  imageUrl: string | null
  stockQuantity: number
  lowStockThreshold: number
  status: 'ok' | 'low' | 'empty'
  isActive: boolean | null
}

// ========================================
// STATE
// ========================================

const inventory = ref<InventoryItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// Filter
const filterStatus = ref<'all' | 'ok' | 'low' | 'empty'>('all')
const filterCategory = ref<string>('all')

// Auswahl für Bulk-Update
const selectedIds = ref<Set<number>>(new Set())

// Bulk-Update Modal
const showBulkModal = ref(false)
const isSaving = ref(false)
const bulkValues = ref<Record<number, number>>({})

// ========================================
// AUTH GUARD
// ========================================

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    await router.push('/login')
    return
  }
  await fetchInventory()
})

// ========================================
// DATA FETCHING
// ========================================

async function fetchInventory() {
  try {
    isLoading.value = true
    error.value = null
    const data = await $fetch<{ inventory: InventoryItem[] }>('/api/admin/inventory')
    inventory.value = data.inventory
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Laden'
  } finally {
    isLoading.value = false
  }
}

// ========================================
// COMPUTED
// ========================================

const allCategories = computed(() => {
  const cats = [...new Set(inventory.value.map(i => i.category))]
  return cats.sort()
})

const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchesStatus = filterStatus.value === 'all' || item.status === filterStatus.value
    const matchesCategory = filterCategory.value === 'all' || item.category === filterCategory.value
    return matchesStatus && matchesCategory
  })
})

const selectedItems = computed(() =>
  inventory.value.filter(i => selectedIds.value.has(i.productId))
)

const allFilteredSelected = computed(() => {
  if (filteredInventory.value.length === 0) return false
  return filteredInventory.value.every(i => selectedIds.value.has(i.productId))
})

// ========================================
// SELECTION
// ========================================

function toggleSelect(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

function toggleSelectAll() {
  if (allFilteredSelected.value) {
    filteredInventory.value.forEach(i => selectedIds.value.delete(i.productId))
  } else {
    filteredInventory.value.forEach(i => selectedIds.value.add(i.productId))
  }
}

// ========================================
// BULK UPDATE MODAL
// ========================================

function openBulkModal() {
  if (selectedIds.value.size === 0) return
  bulkValues.value = {}
  selectedItems.value.forEach(item => {
    bulkValues.value[item.productId] = item.stockQuantity
  })
  showBulkModal.value = true
}

function closeBulkModal() {
  showBulkModal.value = false
}

function addStock(productId: number, amount: number) {
  const current = bulkValues.value[productId] ?? 0
  bulkValues.value[productId] = Math.min(999, current + amount)
}

async function saveBulkUpdate() {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const updates = Object.entries(bulkValues.value).map(([id, qty]) => ({
      productId: Number(id),
      stockQuantity: qty,
    }))

    await $fetch('/api/admin/inventory', {
      method: 'PATCH',
      body: { updates },
    })

    successMsg.value = `Bestand aktualisiert für ${updates.length} Produkt${updates.length !== 1 ? 'e' : ''}`
    selectedIds.value.clear()
    showBulkModal.value = false
    await fetchInventory()

    setTimeout(() => {
      successMsg.value = null
    }, 3000)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Speichern'
  } finally {
    isSaving.value = false
  }
}

// ========================================
// HELPERS
// ========================================

function statusLabel(status: InventoryItem['status']) {
  if (status === 'ok') return 'OK'
  if (status === 'low') return 'Niedrig'
  return 'Leer'
}

function statusClass(status: InventoryItem['status']) {
  if (status === 'ok') return 'text-green-700 bg-green-100'
  if (status === 'low') return 'text-yellow-700 bg-yellow-100'
  return 'text-red-700 bg-red-100'
}

function statusDot(status: InventoryItem['status']) {
  if (status === 'ok') return 'bg-green-500'
  if (status === 'low') return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <AdminNav />

    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Bestandsverwaltung</h1>
          <p class="text-sm text-muted-foreground mt-1">
            Produktbestände im Automaten verwalten
          </p>
        </div>
        <button
          v-if="selectedIds.size > 0"
          @click="openBulkModal"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          :aria-label="`Bestand für ${selectedIds.size} ausgewählte Produkte aktualisieren`"
        >
          Bestand aktualisieren ({{ selectedIds.size }})
        </button>
      </div>

      <!-- Erfolgsmeldung -->
      <div
        v-if="successMsg"
        role="status"
        aria-live="polite"
        class="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center justify-between"
      >
        <span>{{ successMsg }}</span>
        <button @click="successMsg = null" class="text-green-600 hover:text-green-800 p-1 cursor-pointer" aria-label="Erfolgsmeldung schliessen">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Fehlermeldung -->
      <div
        v-if="error"
        role="alert"
        aria-live="assertive"
        class="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center justify-between"
      >
        <span>{{ error }}</span>
        <button @click="error = null" class="text-red-600 hover:text-red-800 p-1 cursor-pointer" aria-label="Fehlermeldung schliessen">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Filter -->
      <div class="flex items-center gap-3 mb-4">
        <label for="filter-category" class="sr-only">Kategorie filtern</label>
        <select
          id="filter-category"
          v-model="filterCategory"
          class="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground"
        >
          <option value="all">Alle Kategorien</option>
          <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <label for="filter-status" class="sr-only">Status filtern</label>
        <select
          id="filter-status"
          v-model="filterStatus"
          class="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground"
        >
          <option value="all">Alle Status</option>
          <option value="ok">OK (&gt;3 Stück)</option>
          <option value="low">Niedrig (&le;3 Stück)</option>
          <option value="empty">Leer (0 Stück)</option>
        </select>
      </div>

      <!-- Legende -->
      <div class="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span>&gt;3 Stück</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <span>&le;3 Stück</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
          <span>0 Stück</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center gap-2 py-16 text-muted-foreground" role="status" aria-live="polite" aria-label="Bestandsdaten werden geladen">
        <svg class="animate-spin w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Wird geladen...</span>
      </div>

      <!-- Tabelle -->
      <div v-else class="bg-card border border-border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted/40 border-b border-border">
            <tr>
              <th class="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  :checked="allFilteredSelected"
                  @change="toggleSelectAll"
                  class="rounded border-border cursor-pointer"
                  aria-label="Alle sichtbaren Produkte auswählen"
                />
              </th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Produkt</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Kategorie</th>
              <th class="px-4 py-3 text-right font-medium text-muted-foreground">Bestand</th>
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredInventory"
              :key="item.productId"
              class="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              :class="{ 'opacity-50': item.isActive === false }"
            >
              <!-- Checkbox -->
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(item.productId)"
                  @change="toggleSelect(item.productId)"
                  class="rounded border-border cursor-pointer"
                  :aria-label="`${item.productName} auswählen`"
                />
              </td>

              <!-- Produkt -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.productName"
                    class="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm flex-shrink-0"
                  >
                    🛒
                  </div>
                  <span class="font-medium text-foreground">{{ item.productName }}</span>
                </div>
              </td>

              <!-- Kategorie -->
              <td class="px-4 py-3 text-muted-foreground capitalize">{{ item.category }}</td>

              <!-- Bestand -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <div :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', statusDot(item.status)]"></div>
                  <span :class="{ 'font-semibold text-red-600': item.status === 'low' || item.status === 'empty' }">
                    {{ item.stockQuantity }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', statusClass(item.status)]">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
            </tr>

            <!-- Leer-State -->
            <tr v-if="filteredInventory.length === 0">
              <td colspan="5" class="px-4 py-12 text-center text-muted-foreground">
                Keine Produkte gefunden
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Bulk-Update Modal -->
    <Teleport to="body">
      <div
        v-if="showBulkModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeBulkModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-modal-title"
      >
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 id="bulk-modal-title" class="font-semibold text-foreground">Bestand aktualisieren</h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Ausgewählte Produkte: {{ selectedItems.length }}
              </p>
            </div>
            <button
              @click="closeBulkModal"
              class="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
              aria-label="Modal schliessen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="overflow-y-auto px-6 py-4 flex-1 space-y-4">
            <div
              v-for="item in selectedItems"
              :key="item.productId"
              class="border border-border rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="font-medium text-foreground">{{ item.productName }}</span>
                <span class="text-xs text-muted-foreground">
                  Aktuell: {{ item.stockQuantity }} Stück
                </span>
              </div>

              <div class="flex items-center gap-2">
                <input
                  v-model.number="bulkValues[item.productId]"
                  type="number"
                  min="0"
                  max="999"
                  class="w-24 px-3 py-1.5 border border-border rounded-md text-sm bg-background text-foreground text-center"
                />
                <button
                  @click="addStock(item.productId, 10)"
                  class="px-2.5 py-1.5 text-xs border border-border rounded-md hover:bg-accent transition-colors"
                >
                  +10
                </button>
                <button
                  @click="addStock(item.productId, 20)"
                  class="px-2.5 py-1.5 text-xs border border-border rounded-md hover:bg-accent transition-colors"
                >
                  +20
                </button>
                <button
                  @click="bulkValues[item.productId] = 50"
                  class="px-2.5 py-1.5 text-xs border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-border">
            <div
              v-if="error"
              role="alert"
              aria-live="assertive"
              class="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs"
            >
              {{ error }}
            </div>
            <div class="flex items-center justify-end gap-3">
              <button
                @click="closeBulkModal"
                class="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                @click="saveBulkUpdate"
                :disabled="isSaving"
                class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span v-if="isSaving" class="inline-flex items-center gap-2">
                  <svg class="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Wird gespeichert...
                </span>
                <span v-else>Speichern</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
