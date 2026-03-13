<script setup lang="ts">
import OfferModal from '~/components/offers/OfferModal.vue'
import OfferBadge from '~/components/offers/OfferBadge.vue'

const authStore = useAuthStore()
const router = useRouter()

interface CategoryRef {
  id: number
  name: string
}

interface AdminProduct {
  id: number
  name: string
  description: string | null
  category: string
  price: string
  imageUrl: string | null
  calories: number | null
  protein: number | null
  sugar: number | null
  fat: number | null
  allergens: string[] | null
  isVegan: boolean | null
  isGlutenFree: boolean | null
  isActive: boolean | null
  stock: number | null
  // FEAT-22: Nachbestellschwellwert
  stockThreshold: number | null
  categories: CategoryRef[]
  createdAt: string
  activeOffer?: {
    id: number
    discountType: 'percent' | 'absolute'
    discountValue: string
    discountedPrice: string
    startsAt: string
    expiresAt: string
  } | null
}

interface CategoryOption {
  id: number
  name: string
  isActive: boolean
}

const products = ref<AdminProduct[]>([])
const categoryOptions = ref<CategoryOption[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const filterCategory = ref<number | 'all'>('all')

// Create/Edit Modal
const showFormModal = ref(false)
const isEditMode = ref(false)
const editingProductId = ref<number | null>(null)
const isSaving = ref(false)
const formError = ref<string | null>(null)

const productForm = ref({
  name: '',
  description: '',
  price: '',
  categoryIds: [] as number[],
  isVegan: false,
  isGlutenFree: false,
  stock: 10,
  // FEAT-22: Nachbestellschwellwert (default 3)
  stockThreshold: 3,
  calories: null as number | null,
  protein: null as number | null,
  sugar: null as number | null,
  fat: null as number | null,
  allergens: '',
})

// Bild-Upload
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const isUploadingImage = ref(false)
const imageError = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Delete Confirmation
const showDeleteModal = ref(false)
const deletingProduct = ref<AdminProduct | null>(null)
const isDeleting = ref(false)

// Offer Modal (FEAT-14)
const showOfferModal = ref(false)
const selectedProductForOffer = ref<AdminProduct | null>(null)

const openOfferModal = (product: AdminProduct) => {
  selectedProductForOffer.value = product
  showOfferModal.value = true
}

const closeOfferModal = () => {
  showOfferModal.value = false
  selectedProductForOffer.value = null
}

const handleOfferSaved = async () => {
  await fetchProducts()
}

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesSearch = !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      filterStatus.value === 'all' ||
      (filterStatus.value === 'active' && p.isActive !== false) ||
      (filterStatus.value === 'inactive' && p.isActive === false)

    const matchesCategory =
      filterCategory.value === 'all' ||
      p.categories.some(c => c.id === filterCategory.value)

    return matchesSearch && matchesStatus && matchesCategory
  })
})

const fetchProducts = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await $fetch('/api/admin/products')
    products.value = data as AdminProduct[]
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Laden der Produkte'
  } finally {
    isLoading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await $fetch('/api/admin/categories')
    categoryOptions.value = data as CategoryOption[]
  } catch {
    // Fehler beim Laden der Kategorien ignorieren
  }
}

const resetForm = () => {
  productForm.value = {
    name: '',
    description: '',
    price: '',
    categoryIds: [],
    isVegan: false,
    isGlutenFree: false,
    stock: 10,
    stockThreshold: 3,
    calories: null,
    protein: null,
    sugar: null,
    fat: null,
    allergens: '',
  }
  imageFile.value = null
  imagePreview.value = null
  imageError.value = null
  formError.value = null
}

const openCreateModal = () => {
  isEditMode.value = false
  editingProductId.value = null
  resetForm()
  showFormModal.value = true
}

const openEditModal = (product: AdminProduct) => {
  isEditMode.value = true
  editingProductId.value = product.id
  productForm.value = {
    name: product.name,
    description: product.description || '',
    price: product.price,
    categoryIds: product.categories.map(c => c.id),
    isVegan: product.isVegan ?? false,
    isGlutenFree: product.isGlutenFree ?? false,
    stock: product.stock ?? 10,
    // FEAT-22: gespeicherten Schwellwert laden
    stockThreshold: product.stockThreshold ?? 3,
    calories: product.calories,
    protein: product.protein,
    sugar: product.sugar,
    fat: product.fat,
    allergens: product.allergens?.join(', ') || '',
  }
  imagePreview.value = product.imageUrl
  imageFile.value = null
  imageError.value = null
  formError.value = null
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  resetForm()
}

const processImageFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    imageError.value = 'Nur JPG, PNG und WebP erlaubt'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    imageError.value = 'Bild zu groß (max. 5MB)'
    return
  }

  imageError.value = null
  imageFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  processImageFile(file)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  processImageFile(file)
}

const uploadImage = async (productId: number): Promise<string | null> => {
  if (!imageFile.value) return null

  isUploadingImage.value = true
  imageError.value = null

  try {
    const formData = new FormData()
    formData.append('image', imageFile.value)

    const result = await $fetch<{ imageUrl: string }>(
      `/api/admin/products/${productId}/image` as string,
      { method: 'POST', body: formData }
    )

    return result.imageUrl
  } catch (e: unknown) {
    imageError.value = (e as { message?: string }).message || 'Fehler beim Hochladen des Bildes'
    return null
  } finally {
    isUploadingImage.value = false
  }
}

const handleSaveProduct = async () => {
  if (isSaving.value) return

  if (!productForm.value.name.trim()) {
    formError.value = 'Name ist erforderlich'
    return
  }
  if (!productForm.value.price || parseFloat(productForm.value.price) <= 0) {
    formError.value = 'Gültiger Preis ist erforderlich'
    return
  }
  if (productForm.value.categoryIds.length === 0) {
    formError.value = 'Mindestens eine Kategorie ist erforderlich'
    return
  }

  isSaving.value = true
  formError.value = null

  try {
    // FEAT-22: Schwellwert-Validierung im Frontend
    const thresholdVal = Math.floor(productForm.value.stockThreshold)
    if (isNaN(thresholdVal) || thresholdVal < 1) {
      formError.value = 'Schwellwert muss mindestens 1 sein'
      isSaving.value = false
      return
    }

    const payload = {
      name: productForm.value.name.trim(),
      description: productForm.value.description || null,
      price: productForm.value.price,
      categoryIds: productForm.value.categoryIds,
      isVegan: productForm.value.isVegan,
      isGlutenFree: productForm.value.isGlutenFree,
      stock: productForm.value.stock,
      // FEAT-22: Nachbestellschwellwert mitsenden
      stockThreshold: thresholdVal,
      calories: productForm.value.calories,
      protein: productForm.value.protein,
      sugar: productForm.value.sugar,
      fat: productForm.value.fat,
      allergens: productForm.value.allergens
        ? productForm.value.allergens.split(',').map(a => a.trim()).filter(Boolean)
        : null,
    }

    let savedProductId: number

    if (isEditMode.value && editingProductId.value) {
      await $fetch(`/api/admin/products/${editingProductId.value}` as string, {
        method: 'PATCH',
        body: payload,
      })
      savedProductId = editingProductId.value
    } else {
      const result = await $fetch<{ product: AdminProduct }>('/api/admin/products', {
        method: 'POST',
        body: payload,
      })
      savedProductId = result.product.id
    }

    // Bild hochladen falls ausgewählt
    if (imageFile.value) {
      const imageUrl = await uploadImage(savedProductId)
      if (!imageUrl && imageFile.value) {
        // Bild-Upload fehlgeschlagen: Bei neuen Produkten Erstellung rückgängig machen (EC-3)
        // BUG-FEAT10-008: Hard-Delete via ?rollback=true, damit inaktives Produkt wirklich entfernt wird
        if (!isEditMode.value) {
          try {
            await $fetch(`/api/admin/products/${savedProductId}?rollback=true` as string, { method: 'DELETE' })
          } catch {
            // Rollback-Fehler ignorieren, Hauptfehlermeldung zeigen
          }
        }
        formError.value = imageError.value || 'Fehler beim Hochladen des Bildes. Das Produkt wurde nicht gespeichert.'
        isSaving.value = false
        return
      }
    }

    successMsg.value = isEditMode.value ? 'Produkt aktualisiert' : 'Produkt angelegt'
    showFormModal.value = false
    resetForm()
    await fetchProducts()
  } catch (e: unknown) {
    formError.value = (e as { message?: string }).message || 'Fehler beim Speichern des Produkts'
  } finally {
    isSaving.value = false
  }
}

const toggleProductStatus = async (product: AdminProduct) => {
  try {
    await $fetch(`/api/admin/products/${product.id}` as string, {
      method: 'PATCH',
      body: { isActive: !product.isActive },
    })
    await fetchProducts()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Ändern des Status'
  }
}

const openDeleteModal = (product: AdminProduct) => {
  deletingProduct.value = product
  showDeleteModal.value = true
}

const handleDeleteProduct = async () => {
  if (!deletingProduct.value || isDeleting.value) return

  isDeleting.value = true

  try {
    await $fetch(`/api/admin/products/${deletingProduct.value.id}` as string, { method: 'DELETE' })
    successMsg.value = `Produkt "${deletingProduct.value.name}" wurde deaktiviert`
    showDeleteModal.value = false
    deletingProduct.value = null
    await fetchProducts()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Löschen'
  } finally {
    isDeleting.value = false
  }
}

const isCategorySelected = (categoryId: number) =>
  productForm.value.categoryIds.includes(categoryId)

const toggleCategory = (categoryId: number) => {
  const idx = productForm.value.categoryIds.indexOf(categoryId)
  if (idx === -1) {
    productForm.value.categoryIds.push(categoryId)
  } else {
    productForm.value.categoryIds.splice(idx, 1)
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

  await Promise.all([fetchProducts(), fetchCategories()])
})
</script>

<template>
  <div>
    

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Produkt-Verwaltung</h1>
          <p class="text-sm text-muted-foreground mt-1">{{ filteredProducts.length }} Produkte angezeigt</p>
        </div>
        <button
          @click="openCreateModal"
          class="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          + Neues Produkt
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

      <!-- Filter -->
      <div class="flex gap-3 mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Produktname suchen..."
          class="flex-1 px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        />
        <select
          v-model="filterCategory"
          class="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        >
          <option value="all">Alle Kategorien</option>
          <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select
          v-model="filterStatus"
          class="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background"
        >
          <option value="all">Alle</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Inaktiv</option>
        </select>
      </div>

      <!-- Ladestand -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-muted-foreground">Wird geladen...</p>
      </div>

      <!-- Produkttabelle -->
      <div v-else class="bg-card rounded-lg border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted">
            <tr>
              <th class="text-left p-4 font-medium text-muted-foreground w-16">Bild</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Name</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Kategorien</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Preis</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Angebot</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Lager</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th class="text-left p-4 font-medium text-muted-foreground">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="border-t hover:bg-muted/30 transition-colors"
            >
              <td class="p-4">
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="product.name"
                  class="w-10 h-10 object-cover rounded"
                />
                <div v-else class="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                  ?
                </div>
              </td>
              <td class="p-4">
                <p class="font-medium">{{ product.name }}</p>
                <p v-if="product.description" class="text-xs text-muted-foreground truncate max-w-xs">{{ product.description }}</p>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="cat in product.categories"
                    :key="cat.id"
                    class="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                  >
                    {{ cat.name }}
                  </span>
                  <span v-if="product.categories.length === 0" class="text-muted-foreground text-xs">{{ product.category }}</span>
                </div>
              </td>
              <td class="p-4 font-medium">{{ parseFloat(product.price).toFixed(2) }} EUR</td>
              <td class="p-4">
                <OfferBadge :has-active-offer="!!product.activeOffer" />
              </td>
              <td class="p-4 text-muted-foreground">{{ product.stock ?? '-' }}</td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded font-medium',
                    product.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  ]"
                >
                  {{ product.isActive === false ? 'Inaktiv' : 'Aktiv' }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2 flex-wrap">
                  <button
                    @click="openEditModal(product)"
                    class="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    Bearbeiten
                  </button>
                  <button
                    @click="openOfferModal(product)"
                    class="px-3 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                  >
                    Angebot
                  </button>
                  <button
                    @click="toggleProductStatus(product)"
                    :class="[
                      'px-3 py-1 text-xs rounded transition-colors',
                      product.isActive === false
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    ]"
                  >
                    {{ product.isActive === false ? 'Aktivieren' : 'Deaktivieren' }}
                  </button>
                  <button
                    @click="openDeleteModal(product)"
                    class="px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredProducts.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">Keine Produkte gefunden</p>
        </div>
      </div>
    </div>

    <!-- Modal: Produkt anlegen/bearbeiten -->
    <Teleport to="body">
      <div
        v-if="showFormModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        @click.self="closeFormModal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="isEditMode ? 'edit-product-title' : 'create-product-title'"
      >
        <div class="bg-background rounded-lg max-w-2xl w-full p-6 border shadow-xl my-8">
          <div class="flex justify-between items-center mb-6">
            <h2 :id="isEditMode ? 'edit-product-title' : 'create-product-title'" class="text-xl font-bold">
              {{ isEditMode ? 'Produkt bearbeiten' : 'Neues Produkt' }}
            </h2>
            <button @click="closeFormModal" class="text-muted-foreground hover:text-foreground p-1" aria-label="Modal schliessen">✕</button>
          </div>

          <div class="space-y-5">
            <!-- Pflichtfelder -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="prod-name" class="block text-sm font-medium mb-2">Name *</label>
                <input
                  id="prod-name"
                  v-model="productForm.name"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Apfel"
                />
              </div>
              <div>
                <label for="prod-price" class="block text-sm font-medium mb-2">Preis (EUR) *</label>
                <input
                  id="prod-price"
                  v-model="productForm.price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  placeholder="2.50"
                />
              </div>
            </div>

            <div>
              <label for="prod-description" class="block text-sm font-medium mb-2">Beschreibung</label>
              <textarea
                id="prod-description"
                v-model="productForm.description"
                rows="2"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                placeholder="Kurze Produktbeschreibung..."
              ></textarea>
            </div>

            <!-- Kategorien -->
            <div>
              <p class="text-sm font-medium mb-2">Kategorien * (mind. 1)</p>
              <div v-if="categoryOptions.length === 0" class="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                Keine Kategorien vorhanden. Bitte zuerst Kategorien anlegen.
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-for="cat in categoryOptions"
                  :key="cat.id"
                  type="button"
                  @click="toggleCategory(cat.id)"
                  :class="[
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    isCategorySelected(cat.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-accent'
                  ]"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Bild-Upload -->
            <div>
              <p class="text-sm font-medium mb-2">Produktbild</p>
              <div
                class="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent transition-colors"
                @dragover.prevent
                @drop="handleDrop"
                @click="fileInputRef?.click()"
              >
                <div v-if="imagePreview">
                  <img :src="imagePreview" alt="Vorschau" class="max-h-32 mx-auto object-contain rounded" />
                  <p class="text-xs text-muted-foreground mt-2">Klicken oder Datei ziehen zum Ersetzen</p>
                </div>
                <div v-else>
                  <p class="text-sm text-muted-foreground">Datei hierher ziehen oder klicken</p>
                  <p class="text-xs text-muted-foreground mt-1">JPG, PNG, WebP – max. 5MB</p>
                </div>
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleImageSelect"
              />
              <p v-if="imageError" class="text-red-600 text-xs mt-1">{{ imageError }}</p>
            </div>

            <!-- Optionale Felder -->
            <div class="grid grid-cols-4 gap-3">
              <div>
                <label for="prod-calories" class="block text-xs font-medium mb-1">Kalorien</label>
                <input
                  id="prod-calories"
                  v-model.number="productForm.calories"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="52"
                />
              </div>
              <div>
                <label for="prod-protein" class="block text-xs font-medium mb-1">Protein (g)</label>
                <input
                  id="prod-protein"
                  v-model.number="productForm.protein"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label for="prod-sugar" class="block text-xs font-medium mb-1">Zucker (g)</label>
                <input
                  id="prod-sugar"
                  v-model.number="productForm.sugar"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="10"
                />
              </div>
              <div>
                <label for="prod-fat" class="block text-xs font-medium mb-1">Fett (g)</label>
                <input
                  id="prod-fat"
                  v-model.number="productForm.fat"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1.5 border rounded text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="0"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label for="prod-stock" class="block text-sm font-medium mb-2">Lagerbestand</label>
                <input
                  id="prod-stock"
                  v-model.number="productForm.stock"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <!-- FEAT-22: Nachbestellschwellwert -->
              <div>
                <label for="prod-stock-threshold" class="block text-sm font-medium mb-2">Nachbestellschwellwert</label>
                <input
                  id="prod-stock-threshold"
                  v-model.number="productForm.stockThreshold"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  placeholder="3"
                />
                <p class="text-xs text-muted-foreground mt-1">Warnung ab &lt;= diesem Wert</p>
              </div>
              <div>
                <label for="prod-allergens" class="block text-sm font-medium mb-2">Allergene (kommagetrennt)</label>
                <input
                  id="prod-allergens"
                  v-model="productForm.allergens"
                  type="text"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Nüsse, Gluten"
                />
              </div>
            </div>

            <div class="flex gap-6">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input v-model="productForm.isVegan" type="checkbox" class="rounded" />
                Vegan
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input v-model="productForm.isGlutenFree" type="checkbox" class="rounded" />
                Glutenfrei
              </label>
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
              @click="handleSaveProduct"
              :disabled="isSaving || isUploadingImage"
              class="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isSaving ? 'Wird gespeichert...' : isEditMode ? 'Speichern' : 'Anlegen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Angebot verwalten (FEAT-14) -->
    <OfferModal
      v-if="selectedProductForOffer"
      :show="showOfferModal"
      :product-id="selectedProductForOffer.id"
      :product-name="selectedProductForOffer.name"
      :product-price="selectedProductForOffer.price"
      @close="closeOfferModal"
      @saved="handleOfferSaved"
    />

    <!-- Modal: Löschen bestätigen -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showDeleteModal = false"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
      >
        <div class="bg-background rounded-lg max-w-sm w-full p-6 border shadow-xl">
          <h2 id="delete-product-title" class="text-lg font-bold mb-3">Produkt deaktivieren?</h2>
          <p class="text-sm text-muted-foreground mb-6">
            "<strong>{{ deletingProduct?.name }}</strong>" wird deaktiviert und ist nicht mehr im Katalog sichtbar.
            Bestehende Bestellungen bleiben erhalten.
          </p>

          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="flex-1 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors text-sm">
              Abbrechen
            </button>
            <button
              @click="handleDeleteProduct"
              :disabled="isDeleting"
              class="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isDeleting ? 'Wird deaktiviert...' : 'Deaktivieren' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
