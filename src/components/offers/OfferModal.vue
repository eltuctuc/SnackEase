<script setup lang="ts">
// ========================================
// TYPES
// ========================================

interface OfferData {
  id: number
  productId: number
  discountType: string
  discountValue: string
  discountedPrice: string
  startsAt: string
  expiresAt: string
  isActive: boolean
  isCurrentlyActive: boolean
}

// ========================================
// PROPS & EMITS
// ========================================

const props = defineProps<{
  show: boolean
  productId: number
  productName: string
  productPrice: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

// ========================================
// REACTIVE STATE
// ========================================

const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const error = ref<string | null>(null)
const existingOffer = ref<OfferData | null>(null)

// Formular-Felder
const discountType = ref<'percent' | 'absolute'>('percent')
const discountValue = ref<number | null>(null)
const startsAt = ref('')
const expiresAt = ref('')

// ========================================
// COMPUTED
// ========================================

/** Angebotsstatus für Anzeige */
const offerStatus = computed((): string => {
  if (!existingOffer.value) return 'Kein Angebot vorhanden'

  if (existingOffer.value.isCurrentlyActive) return 'Angebot aktiv'

  const now = new Date()
  const startsAtDate = new Date(existingOffer.value.startsAt)

  if (startsAtDate > now) return 'Angebot geplant'
  if (!existingOffer.value.isActive) return 'Angebot deaktiviert'

  return 'Angebot abgelaufen'
})

/** CSS-Klasse für Status-Badge */
const statusClass = computed((): string => {
  if (!existingOffer.value) return 'bg-gray-100 text-gray-600'

  if (existingOffer.value.isCurrentlyActive) return 'bg-green-100 text-green-700'

  const now = new Date()
  const startsAtDate = new Date(existingOffer.value.startsAt)

  if (startsAtDate > now) return 'bg-blue-100 text-blue-700'
  if (!existingOffer.value.isActive) return 'bg-yellow-100 text-yellow-700'

  return 'bg-red-100 text-red-700'
})

/** Clientseitige Vorschau des Angebotspreises */
const previewDiscountedPrice = computed((): string | null => {
  if (!discountValue.value) return null

  const original = parseFloat(props.productPrice)
  if (isNaN(original)) return null

  let result: number

  if (discountType.value === 'percent') {
    result = original * (1 - discountValue.value / 100)
  } else {
    result = original - discountValue.value
  }

  result = Math.round(Math.max(0, result) * 100) / 100
  return result.toFixed(2)
})

/** Zeigt ob "Aktivieren/Deaktivieren" Button sichtbar sein soll */
const canToggleActive = computed(() => existingOffer.value !== null)

/** Zeigt ob "Angebot löschen" Button sichtbar sein soll */
const canDelete = computed(() => existingOffer.value !== null)

// ========================================
// METHODS
// ========================================

/** Lädt bestehendes Angebot vom Server */
const loadExistingOffer = async () => {
  isLoading.value = true
  error.value = null
  existingOffer.value = null

  try {
    const offers = await $fetch<OfferData[]>(`/api/admin/offers?productId=${props.productId}`)

    if (offers.length > 0) {
      const offer = offers[0]
      existingOffer.value = offer

      // Formular mit bestehenden Daten befüllen
      discountType.value = offer.discountType as 'percent' | 'absolute'
      discountValue.value = parseFloat(offer.discountValue)

      // Datum-Strings für datetime-local Input formatieren
      startsAt.value = formatDateForInput(offer.startsAt)
      expiresAt.value = formatDateForInput(offer.expiresAt)
    } else {
      // Kein Angebot: Formular zurücksetzen
      resetForm()
    }
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Laden des Angebots'
  } finally {
    isLoading.value = false
  }
}

/** Konvertiert ISO-String in datetime-local Input Format */
const formatDateForInput = (isoString: string): string => {
  const date = new Date(isoString)
  // Format: YYYY-MM-DDTHH:mm (für datetime-local Input)
  return date.toISOString().slice(0, 16)
}

/** Setzt Formular auf Standardwerte zurück */
const resetForm = () => {
  discountType.value = 'percent'
  discountValue.value = null
  startsAt.value = ''
  expiresAt.value = ''
}

/** Speichert Angebot (POST bei neuem, PATCH bei bestehendem) */
const handleSave = async () => {
  if (isSaving.value) return

  error.value = null

  // Client-seitige Validierung
  if (!discountValue.value) {
    error.value = 'Rabattwert ist erforderlich'
    return
  }

  if (!startsAt.value) {
    error.value = 'Startdatum ist erforderlich'
    return
  }

  if (!expiresAt.value) {
    error.value = 'Enddatum ist erforderlich (AC-14)'
    return
  }

  isSaving.value = true

  try {
    if (existingOffer.value) {
      // Bestehendes Angebot bearbeiten (PATCH)
      await $fetch(`/api/admin/offers/${existingOffer.value.id}`, {
        method: 'PATCH',
        body: {
          discountValue: discountValue.value,
          startsAt: new Date(startsAt.value).toISOString(),
          expiresAt: new Date(expiresAt.value).toISOString(),
        },
      })
    } else {
      // Neues Angebot erstellen (POST)
      await $fetch('/api/admin/offers', {
        method: 'POST',
        body: {
          productId: props.productId,
          discountType: discountType.value,
          discountValue: discountValue.value,
          startsAt: new Date(startsAt.value).toISOString(),
          expiresAt: new Date(expiresAt.value).toISOString(),
        },
      })
    }

    emit('saved')
    emit('close')
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Speichern des Angebots'
  } finally {
    isSaving.value = false
  }
}

/** Aktiviert oder deaktiviert ein bestehendes Angebot */
const handleToggleActive = async () => {
  if (!existingOffer.value || isSaving.value) return

  isSaving.value = true
  error.value = null

  try {
    await $fetch(`/api/admin/offers/${existingOffer.value.id}`, {
      method: 'PATCH',
      body: { isActive: !existingOffer.value.isActive },
    })

    emit('saved')
    emit('close')
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Ändern des Angebots'
  } finally {
    isSaving.value = false
  }
}

/** Löscht das bestehende Angebot nach Bestätigung */
const handleDelete = async () => {
  if (!existingOffer.value || isDeleting.value) return

  if (!confirm(`Angebot für "${props.productName}" wirklich löschen?`)) return

  isDeleting.value = true
  error.value = null

  try {
    await $fetch(`/api/admin/offers/${existingOffer.value.id}`, {
      method: 'DELETE',
    })

    emit('saved')
    emit('close')
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Fehler beim Löschen des Angebots'
  } finally {
    isDeleting.value = false
  }
}

// ========================================
// LIFECYCLE
// ========================================

/** Angebot laden wenn Modal geöffnet wird */
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadExistingOffer()
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="emit('close')"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-modal-title"
    >
      <div class="bg-background rounded-lg max-w-lg w-full p-6 border shadow-xl my-8">

        <!-- Kopfzeile -->
        <div class="flex justify-between items-center mb-6">
          <h2 id="offer-modal-title" class="text-xl font-bold">
            Angebot für {{ productName }}
          </h2>
          <button
            @click="emit('close')"
            class="text-muted-foreground hover:text-foreground p-1"
            aria-label="Modal schliessen"
          >
            ✕
          </button>
        </div>

        <!-- Ladeindikator -->
        <div v-if="isLoading" class="text-center py-8">
          <p class="text-muted-foreground">Wird geladen...</p>
        </div>

        <template v-else>
          <!-- Status-Anzeige -->
          <div class="mb-6">
            <span :class="['px-3 py-1.5 text-sm rounded-full font-medium', statusClass]">
              {{ offerStatus }}
            </span>
          </div>

          <!-- Formular -->
          <div class="space-y-4">
            <!-- Rabatttyp-Auswahl -->
            <div>
              <p class="text-sm font-medium mb-2">Rabatttyp</p>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    v-model="discountType"
                    type="radio"
                    value="percent"
                    :disabled="existingOffer !== null"
                    class="accent-primary"
                  />
                  Prozent (%)
                </label>
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    v-model="discountType"
                    type="radio"
                    value="absolute"
                    :disabled="existingOffer !== null"
                    class="accent-primary"
                  />
                  Absoluter Betrag (EUR)
                </label>
              </div>
              <p v-if="existingOffer" class="text-xs text-muted-foreground mt-1">
                Rabatttyp kann nicht geändert werden. Neues Angebot erstellen um den Typ zu wechseln.
              </p>
            </div>

            <!-- Rabattwert -->
            <div>
              <label for="offer-discount-value" class="block text-sm font-medium mb-1">
                Rabattwert {{ discountType === 'percent' ? '(0–100 %)' : '(EUR)' }} *
              </label>
              <input
                id="offer-discount-value"
                v-model.number="discountValue"
                type="number"
                :min="0"
                :max="discountType === 'percent' ? 100 : undefined"
                step="0.01"
                :placeholder="discountType === 'percent' ? 'z.B. 20' : 'z.B. 0.50'"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-background"
              />
            </div>

            <!-- Startdatum -->
            <div>
              <label for="offer-starts-at" class="block text-sm font-medium mb-1">Startdatum *</label>
              <input
                id="offer-starts-at"
                v-model="startsAt"
                type="datetime-local"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-background"
              />
            </div>

            <!-- Enddatum -->
            <div>
              <label for="offer-expires-at" class="block text-sm font-medium mb-1">Enddatum *</label>
              <input
                id="offer-expires-at"
                v-model="expiresAt"
                type="datetime-local"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-background"
              />
            </div>

            <!-- Live-Vorschau -->
            <div
              v-if="previewDiscountedPrice !== null"
              class="p-3 bg-muted rounded-lg text-sm"
            >
              <span class="text-muted-foreground">Originalpreis: </span>
              <span class="font-medium">{{ parseFloat(productPrice).toFixed(2) }} EUR</span>
              <span class="mx-2 text-muted-foreground">—</span>
              <span class="text-muted-foreground">Angebotspreis: </span>
              <span class="font-bold text-green-600">{{ previewDiscountedPrice }} EUR</span>
            </div>
          </div>

          <!-- Fehlermeldung -->
          <div
            v-if="error"
            class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {{ error }}
          </div>

          <!-- Aktions-Buttons -->
          <div class="mt-6 space-y-3">
            <!-- Hauptaktion: Speichern -->
            <div class="flex gap-3">
              <button
                @click="emit('close')"
                class="flex-1 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors text-sm"
              >
                Abbrechen
              </button>
              <button
                @click="handleSave"
                :disabled="isSaving"
                class="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {{ isSaving ? 'Wird gespeichert...' : existingOffer ? 'Speichern' : 'Angebot erstellen' }}
              </button>
            </div>

            <!-- Aktivieren/Deaktivieren -->
            <button
              v-if="canToggleActive"
              @click="handleToggleActive"
              :disabled="isSaving"
              :class="[
                'w-full py-2.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed',
                existingOffer?.isActive
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
            >
              {{ existingOffer?.isActive ? 'Angebot deaktivieren' : 'Angebot aktivieren' }}
            </button>

            <!-- Löschen -->
            <button
              v-if="canDelete"
              @click="handleDelete"
              :disabled="isDeleting"
              class="w-full py-2.5 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isDeleting ? 'Wird gelöscht...' : 'Angebot löschen' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>
