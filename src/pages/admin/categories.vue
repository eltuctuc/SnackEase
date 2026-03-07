<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

interface AdminCategory {
  id: number
  name: string
  description: string | null
  isActive: boolean
  productCount: number
  createdAt: string
}

interface ProductForReassign {
  id: number
  name: string
  newCategoryId: number | null
}

const categories = ref<AdminCategory[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// Create/Edit Modal
const showFormModal = ref(false)
const isEditMode = ref(false)
const editingCategory = ref<AdminCategory | null>(null)
const categoryForm = ref({ name: '', description: '' })
const isSaving = ref(false)
const formError = ref<string | null>(null)

// Delete Modal
const showDeleteModal = ref(false)
const deletingCategory = ref<AdminCategory | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

// Produkte die neu zugeordnet werden müssen beim Löschen
const productsNeedingReassign = ref<ProductForReassign[]>([])
const reassignCategoryOptions = ref<AdminCategory[]>([])
const isLoadingDeleteInfo = ref(false)

const fetchCategories = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await $fetch('/api/admin/categories')
    categories.value = data as AdminCategory[]
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Laden der Kategorien'
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  editingCategory.value = null
  categoryForm.value = { name: '', description: '' }
  formError.value = null
  showFormModal.value = true
}

const openEditModal = (category: AdminCategory) => {
  isEditMode.value = true
  editingCategory.value = category
  categoryForm.value = { name: category.name, description: category.description || '' }
  formError.value = null
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingCategory.value = null
  formError.value = null
}

const handleSaveCategory = async () => {
  if (isSaving.value) return

  if (!categoryForm.value.name.trim()) {
    formError.value = 'Kategoriename ist erforderlich'
    return
  }

  isSaving.value = true
  formError.value = null

  try {
    if (isEditMode.value && editingCategory.value) {
      await $fetch(`/api/admin/categories/${editingCategory.value.id}` as string, {
        method: 'PATCH',
        body: {
          name: categoryForm.value.name.trim(),
          description: categoryForm.value.description || null,
        },
      })
      successMsg.value = 'Kategorie aktualisiert'
    } else {
      await $fetch('/api/admin/categories', {
        method: 'POST',
        body: {
          name: categoryForm.value.name.trim(),
          description: categoryForm.value.description || null,
        },
      })
      successMsg.value = 'Kategorie angelegt'
    }

    showFormModal.value = false
    await fetchCategories()
  } catch (e: unknown) {
    formError.value = (e as { message?: string }).message || 'Fehler beim Speichern'
  } finally {
    isSaving.value = false
  }
}

const toggleCategory = async (category: AdminCategory) => {
  try {
    await $fetch(`/api/admin/categories/${category.id}/toggle` as string, { method: 'POST' })
    successMsg.value = category.isActive ? 'Kategorie deaktiviert' : 'Kategorie aktiviert'
    await fetchCategories()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Ändern des Status'
  }
}

const openDeleteModal = async (category: AdminCategory) => {
  deletingCategory.value = category
  deleteError.value = null
  productsNeedingReassign.value = []
  showDeleteModal.value = true

  // Prüfen welche Produkte neu zugeordnet werden müssen (ohne zu löschen)
  if (category.productCount > 0) {
    isLoadingDeleteInfo.value = true
    try {
      const data = await $fetch<{
        productsNeedingReassignment: Array<{ id: number; name: string }>
      }>(`/api/admin/categories/${category.id}/deletion-check` as string)
      productsNeedingReassign.value = data.productsNeedingReassignment.map(p => ({
        id: p.id,
        name: p.name,
        newCategoryId: null,
      }))
      reassignCategoryOptions.value = categories.value.filter(c => c.id !== category.id)
    } catch (e: unknown) {
      deleteError.value = (e as { message?: string }).message || 'Fehler beim Vorbereiten der Löschung'
    } finally {
      isLoadingDeleteInfo.value = false
    }
  }
}

const canDelete = computed(() => {
  // Alle Produkte müssen eine neue Kategorie haben
  return productsNeedingReassign.value.every(p => p.newCategoryId !== null)
})

const handleDeleteCategory = async () => {
  if (!deletingCategory.value || isDeleting.value) return
  if (!canDelete.value) return

  isDeleting.value = true
  deleteError.value = null

  try {
    const productReassignments = productsNeedingReassign.value.map(p => ({
      productId: p.id,
      newCategoryId: p.newCategoryId!,
    }))

    await $fetch(`/api/admin/categories/${deletingCategory.value.id}` as string, {
      method: 'DELETE',
      body: { productReassignments },
    })

    successMsg.value = `Kategorie "${deletingCategory.value.name}" gelöscht`
    showDeleteModal.value = false
    deletingCategory.value = null
    productsNeedingReassign.value = []
    await fetchCategories()
  } catch (e: unknown) {
    deleteError.value = (e as { message?: string }).message || 'Fehler beim Löschen'
  } finally {
    isDeleting.value = false
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingCategory.value = null
  productsNeedingReassign.value = []
  deleteError.value = null
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

  await fetchCategories()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <AdminNav />

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Kategorie-Verwaltung</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ categories.length }} Kategorien</p>
        </div>
        <button
          @click="openCreateModal"
          class="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          + Neue Kategorie
        </button>
      </div>

      <!-- Meldungen -->
      <div v-if="successMsg" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between">
        <span>{{ successMsg }}</span>
        <button @click="successMsg = null" class="text-green-600 hover:text-green-800">✕</button>
      </div>
      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between">
        <span>{{ error }}</span>
        <button @click="error = null" class="text-red-600 hover:text-red-800">✕</button>
      </div>

      <!-- Ladestand -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Wird geladen...</p>
      </div>

      <!-- Kategorientabelle -->
      <div v-else class="bg-card rounded-lg border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted">
            <tr>
              <th class="text-left p-4 font-medium text-muted-foreground">Name</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Beschreibung</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Produkte</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in categories"
              :key="category.id"
              class="border-t hover:bg-muted/30 transition-colors"
            >
              <td class="p-4 font-medium">{{ category.name }}</td>
              <td class="p-4 text-muted-foreground">{{ category.description || '-' }}</td>
              <td class="p-4 text-muted-foreground">{{ category.productCount }}</td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded font-medium',
                    category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ category.isActive ? 'Aktiv' : 'Inaktiv' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(category)"
                    class="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    Bearbeiten
                  </button>
                  <button
                    @click="toggleCategory(category)"
                    :class="[
                      'px-3 py-1 text-xs rounded transition-colors',
                      category.isActive
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    ]"
                  >
                    {{ category.isActive ? 'Deaktivieren' : 'Aktivieren' }}
                  </button>
                  <button
                    @click="openDeleteModal(category)"
                    class="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="categories.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Keine Kategorien vorhanden</p>
          <p class="text-xs text-muted-foreground mt-1">Legen Sie die erste Kategorie an</p>
        </div>
      </div>

      <!-- Hinweis: Kategorie deaktivieren blendet Produkte aus -->
      <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-xs text-blue-700">
          <strong>Hinweis:</strong> Wenn eine Kategorie deaktiviert wird, werden die zugehörigen Produkte im Frontend ausgeblendet – aber NICHT deaktiviert. Bei Reaktivierung werden alle Produkte automatisch wieder sichtbar.
        </p>
      </div>
    </div>

    <!-- Modal: Kategorie anlegen/bearbeiten -->
    <Teleport to="body">
      <div
        v-if="showFormModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeFormModal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="isEditMode ? 'edit-cat-title' : 'create-cat-title'"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">
          <div class="flex justify-between items-center mb-6">
            <h2 :id="isEditMode ? 'edit-cat-title' : 'create-cat-title'" class="text-xl font-bold">
              {{ isEditMode ? 'Kategorie bearbeiten' : 'Neue Kategorie' }}
            </h2>
            <button @click="closeFormModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">✕</button>
          </div>

          <div class="space-y-4">
            <div>
              <label for="cat-name" class="block text-sm font-medium mb-2">Name *</label>
              <input
                id="cat-name"
                v-model="categoryForm.name"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="z.B. Obst"
              />
            </div>
            <div>
              <label for="cat-description" class="block text-sm font-medium mb-2">Beschreibung</label>
              <input
                id="cat-description"
                v-model="categoryForm.description"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="Kurze Beschreibung (optional)"
              />
            </div>
          </div>

          <div v-if="formError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ formError }}
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="closeFormModal" class="flex-1 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors text-sm">
              Abbrechen
            </button>
            <button
              @click="handleSaveCategory"
              :disabled="!categoryForm.name || isSaving"
              class="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isSaving ? 'Wird gespeichert...' : isEditMode ? 'Speichern' : 'Anlegen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Kategorie löschen -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        @click.self="closeDeleteModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-cat-title"
      >
        <div class="bg-background rounded-lg max-w-lg w-full p-6 border shadow-xl my-8">
          <div class="flex justify-between items-center mb-4">
            <h2 id="delete-cat-title" class="text-xl font-bold">Kategorie löschen</h2>
            <button @click="closeDeleteModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">✕</button>
          </div>

          <p class="text-sm text-muted-foreground mb-4">
            Kategorie: <strong>{{ deletingCategory?.name }}</strong> ({{ deletingCategory?.productCount }} Produkte)
          </p>

          <div v-if="isLoadingDeleteInfo" class="py-4 text-center">
            <p class="text-muted-foreground text-sm">Prüfe betroffene Produkte...</p>
          </div>

          <div v-else>
            <!-- Produkte die neu zugeordnet werden müssen -->
            <div v-if="productsNeedingReassign.length > 0">
              <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-yellow-800 text-sm font-medium">
                  {{ productsNeedingReassign.length }} Produkt(e) haben nur diese Kategorie und müssen neu zugeordnet werden:
                </p>
              </div>

              <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                <div
                  v-for="product in productsNeedingReassign"
                  :key="product.id"
                  class="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <span class="text-red-500 font-bold text-lg flex-shrink-0">!</span>
                  <span class="text-sm font-medium flex-1">{{ product.name }}</span>
                  <select
                    v-model="product.newCategoryId"
                    class="px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option :value="null" disabled>Neue Kategorie...</option>
                    <option
                      v-for="cat in reassignCategoryOptions"
                      :key="cat.id"
                      :value="cat.id"
                    >
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
              </div>

              <p class="text-xs text-muted-foreground mb-4">
                Bitte weisen Sie allen markierten Produkten eine neue Kategorie zu, bevor Sie löschen.
              </p>
            </div>

            <!-- Bestätigung wenn keine Neuzuordnung nötig -->
            <div v-else class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800 text-sm">
                Kategorie <strong>{{ deletingCategory?.name }}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
          </div>

          <div v-if="deleteError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ deleteError }}
          </div>

          <div class="flex gap-3">
            <button @click="closeDeleteModal" class="flex-1 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors text-sm">
              Abbrechen
            </button>
            <!-- Confirm-Button immer sichtbar (außer während Ladevorgang) -->
            <button
              v-if="!isLoadingDeleteInfo"
              @click="handleDeleteCategory"
              :disabled="(productsNeedingReassign.length > 0 && !canDelete) || isDeleting"
              class="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isDeleting ? 'Wird gelöscht...' : productsNeedingReassign.length > 0 ? 'Löschen und neu zuordnen' : 'Löschen bestätigen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
