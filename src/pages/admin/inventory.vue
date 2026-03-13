<script setup lang="ts">
/**
 * /admin/inventory
 *
 * FEAT-22: Bestandsverwaltung mit konfigurierbarem Nachbestellschwellwert
 *
 * Tabelle mit inline-editierbarem Bestand und Schwellwert pro Produkt.
 * Status-Badge basiert auf products.stockThreshold (nicht hartkodierter 3).
 */

const authStore = useAuthStore()
const router = useRouter()

interface InventoryItem {
  productId: number
  productName: string
  category: string
  imageUrl: string | null
  stockQuantity: number
  stockThreshold: number
  status: 'ok' | 'low' | 'empty'
  isActive: boolean | null
}

// Editier-State pro Zeile: { stock: number, threshold: number }
interface EditRow {
  stock: number
  threshold: number
  saving: boolean
  error: string | null
}

const inventory = ref<InventoryItem[]>([])
const editRows = ref<Map<number, EditRow>>(new Map())
const isLoading = ref(true)
const pageError = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'ok' | 'low' | 'empty'>('all')

// Auth-Guard (identisches Pattern wie andere Admin-Pages)
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

  await fetchInventory()
})

const fetchInventory = async () => {
  try {
    isLoading.value = true
    pageError.value = null
    const data = await $fetch<{ inventory: InventoryItem[] }>('/api/admin/inventory')
    inventory.value = data.inventory

    // Edit-Rows initialisieren
    const newMap = new Map<number, EditRow>()
    for (const item of data.inventory) {
      newMap.set(item.productId, {
        stock: item.stockQuantity,
        threshold: item.stockThreshold,
        saving: false,
        error: null,
      })
    }
    editRows.value = newMap
  } catch (e: unknown) {
    pageError.value = (e as { message?: string }).message || 'Fehler beim Laden des Bestands'
  } finally {
    isLoading.value = false
  }
}

const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchesSearch = !searchQuery.value ||
      item.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = filterStatus.value === 'all' || item.status === filterStatus.value

    return matchesSearch && matchesStatus
  })
})

const getEditRow = (productId: number): EditRow => {
  return editRows.value.get(productId) ?? { stock: 0, threshold: 3, saving: false, error: null }
}

const setEditRow = (productId: number, partial: Partial<EditRow>) => {
  const current = getEditRow(productId)
  editRows.value.set(productId, { ...current, ...partial })
  // Vue Reaktivität: Map-Mutation erfordert Reassignment
  editRows.value = new Map(editRows.value)
}

const handleSave = async (item: InventoryItem) => {
  const row = getEditRow(item.productId)
  if (row.saving) return

  // Validierung
  const stockVal = Math.floor(row.stock)
  const thresholdVal = Math.floor(row.threshold)

  if (isNaN(stockVal) || stockVal < 0 || stockVal > 999) {
    setEditRow(item.productId, { error: 'Bestandswert muss zwischen 0 und 999 liegen' })
    return
  }

  if (isNaN(thresholdVal) || thresholdVal < 1) {
    setEditRow(item.productId, { error: 'Schwellwert muss mindestens 1 sein' })
    return
  }

  setEditRow(item.productId, { saving: true, error: null })

  try {
    await $fetch('/api/admin/inventory', {
      method: 'PATCH',
      body: {
        updates: [{
          productId: item.productId,
          stockQuantity: stockVal,
          stockThreshold: thresholdVal,
        }]
      }
    })

    successMsg.value = `"${item.productName}" gespeichert`
    setTimeout(() => { successMsg.value = null }, 3000)

    // Inventory neu laden um Status-Badge zu aktualisieren
    await fetchInventory()
  } catch (e: unknown) {
    setEditRow(item.productId, {
      saving: false,
      error: (e as { message?: string }).message || 'Fehler beim Speichern'
    })
  }
}

// Statistik-Übersicht
const stats = computed(() => ({
  total: inventory.value.length,
  ok: inventory.value.filter(i => i.status === 'ok').length,
  low: inventory.value.filter(i => i.status === 'low').length,
  empty: inventory.value.filter(i => i.status === 'empty').length,
}))

const statusLabel = (status: string) => {
  if (status === 'ok') return 'OK'
  if (status === 'low') return 'Niedrig'
  if (status === 'empty') return 'Leer'
  return status
}

const statusClass = (status: string) => {
  if (status === 'ok') return 'bg-green-100 text-green-700'
  if (status === 'low') return 'bg-yellow-100 text-yellow-800'
  if (status === 'empty') return 'bg-red-100 text-red-700'
  return 'bg-muted text-muted-foreground'
}
</script>

<template>
  <div>
    <div class="max-w-7xl mx-auto px-6 py-8 pb-24">

      <!-- Kopfzeile -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-foreground">Bestandsverwaltung</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Bestand und Nachbestellschwellwert pro Produkt verwalten
        </p>
      </div>

      <!-- Meldungen -->
      <div v-if="successMsg" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between items-center">
        <span>{{ successMsg }}</span>
        <button @click="successMsg = null" class="text-green-600 hover:text-green-800 ml-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 15 15">
            <path d="M11.854 3.146a.5.5 0 0 0-.708 0L7.5 6.793 3.854 3.146a.5.5 0 1 0-.708.708L6.793 7.5l-3.647 3.646a.5.5 0 0 0 .708.708L7.5 8.207l3.646 3.647a.5.5 0 0 0 .708-.708L8.207 7.5l3.647-3.646a.5.5 0 0 0 0-.708z" />
          </svg>
        </button>
      </div>
      <div v-if="pageError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between items-center">
        <span>{{ pageError }}</span>
        <button @click="pageError = null" class="text-red-600 hover:text-red-800 ml-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 15 15">
            <path d="M11.854 3.146a.5.5 0 0 0-.708 0L7.5 6.793 3.854 3.146a.5.5 0 1 0-.708.708L6.793 7.5l-3.647 3.646a.5.5 0 0 0 .708.708L7.5 8.207l3.646 3.647a.5.5 0 0 0 .708-.708L8.207 7.5l3.647-3.646a.5.5 0 0 0 0-.708z" />
          </svg>
        </button>
      </div>

      <!-- Statistik-Karten -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-card rounded-lg border p-4 text-center">
          <p class="text-2xl font-bold text-foreground">{{ stats.total }}</p>
          <p class="text-xs text-muted-foreground mt-1">Produkte gesamt</p>
        </div>
        <div class="bg-card rounded-lg border p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.ok }}</p>
          <p class="text-xs text-muted-foreground mt-1">Ausreichend</p>
        </div>
        <div class="bg-card rounded-lg border p-4 text-center">
          <p class="text-2xl font-bold text-yellow-600">{{ stats.low }}</p>
          <p class="text-xs text-muted-foreground mt-1">Niedrig</p>
        </div>
        <div class="bg-card rounded-lg border p-4 text-center">
          <p class="text-2xl font-bold text-red-600">{{ stats.empty }}</p>
          <p class="text-xs text-muted-foreground mt-1">Leer</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="flex gap-3 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Produkt oder Kategorie suchen..."
          class="flex-1 px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        />
        <select
          v-model="filterStatus"
          class="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        >
          <option value="all">Alle Status</option>
          <option value="ok">OK</option>
          <option value="low">Niedrig</option>
          <option value="empty">Leer</option>
        </select>
      </div>

      <!-- Ladestand -->
      <div v-if="isLoading" class="space-y-2">
        <div v-for="i in 5" :key="i" class="h-16 bg-muted animate-pulse rounded-lg" />
      </div>

      <!-- Tabelle -->
      <div v-else class="bg-card rounded-lg border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted">
            <tr>
              <th class="text-left p-4 font-medium text-muted-foreground w-14">Bild</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Produkt</th>
              <th class="text-left p-4 font-medium text-muted-foreground w-36">
                Bestand
              </th>
              <th class="text-left p-4 font-medium text-muted-foreground w-44">
                <span>Schwellwert</span>
                <span class="block text-xs font-normal text-muted-foreground/70">Warnung ab &lt;=</span>
              </th>
              <th class="text-left p-4 font-medium text-muted-foreground w-24">Status</th>
              <th class="text-left p-4 font-medium text-muted-foreground w-28">Aktion</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredInventory"
              :key="item.productId"
              :class="[
                'border-t transition-colors',
                item.status === 'empty' ? 'bg-red-50/30' :
                item.status === 'low' ? 'bg-yellow-50/30' : 'hover:bg-muted/20'
              ]"
            >
              <!-- Bild -->
              <td class="p-4">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.productName"
                  class="w-10 h-10 object-cover rounded"
                />
                <div v-else class="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  <svg class="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 15 15">
                    <path d="M1.5 2h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5zM2 6v6.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V6H2zm3.5 2h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1z" />
                  </svg>
                </div>
              </td>

              <!-- Produktname + Kategorie -->
              <td class="p-4">
                <p class="font-medium text-foreground">{{ item.productName }}</p>
                <p class="text-xs text-muted-foreground">{{ item.category }}</p>
                <span v-if="item.isActive === false" class="text-xs text-red-500 mt-0.5 block">Inaktiv</span>
              </td>

              <!-- Bestand (inline editierbar) -->
              <td class="p-4">
                <input
                  v-model.number="editRows.get(item.productId)!.stock"
                  type="number"
                  min="0"
                  max="999"
                  class="w-24 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  :aria-label="`Bestand für ${item.productName}`"
                />
              </td>

              <!-- Schwellwert (inline editierbar) -->
              <td class="p-4">
                <input
                  v-model.number="editRows.get(item.productId)!.threshold"
                  type="number"
                  min="1"
                  max="999"
                  class="w-24 px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                  :aria-label="`Schwellwert für ${item.productName}`"
                />
              </td>

              <!-- Status-Badge -->
              <td class="p-4">
                <span
                  :class="['px-2 py-1 text-xs rounded font-medium', statusClass(item.status)]"
                >
                  {{ statusLabel(item.status) }}
                </span>
              </td>

              <!-- Aktion: Speichern -->
              <td class="p-4">
                <div>
                  <button
                    @click="handleSave(item)"
                    :disabled="getEditRow(item.productId).saving"
                    class="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ getEditRow(item.productId).saving ? 'Wird gespeichert...' : 'Speichern' }}
                  </button>
                  <p v-if="getEditRow(item.productId).error" class="text-red-600 text-xs mt-1 max-w-[120px]">
                    {{ getEditRow(item.productId).error }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredInventory.length === 0" class="text-center py-12">
          <p class="text-muted-foreground text-sm">Keine Produkte gefunden</p>
        </div>
      </div>

    </div>
  </div>
</template>
