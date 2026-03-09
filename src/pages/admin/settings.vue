<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

// ========================================
// Auth-Guard (identisches Pattern wie admin/index.vue)
// ========================================
const pageReady = ref(false)

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

  pageReady.value = true
})

// ========================================
// Logout
// ========================================
const handleLogout = async () => {
  await authStore.logout()
}

// ========================================
// Modal-State: System-Reset
// ========================================
// Ref auf den ausloesenden Button fuer Fokus-Rueckgabe nach Modal-Schliessen
const resetTriggerButtonRef = ref<HTMLButtonElement | null>(null)

const { isOpen: isResetModalOpen, open: openResetModal, close: closeResetModal } = useModal({
  onClose: () => {
    resetConfirmation.value = ''
    resetError.value = null
  },
})

const openSystemResetModal = () => {
  openResetModal()
  // Fokus wird durch autofocus am Input-Feld nativ gesetzt
}

const handleCloseResetModal = () => {
  closeResetModal()
  nextTick(() => {
    resetTriggerButtonRef.value?.focus()
  })
}

// ========================================
// Modal-State: Guthaben-Reset
// ========================================
// Ref auf den Bestaetigungs-Button (nextTick-Focus nach Modal-Oeffnen)
const creditsConfirmButtonRef = ref<HTMLButtonElement | null>(null)
// Ref auf den ausloesenden Button fuer Fokus-Rueckgabe nach Modal-Schliessen
const creditsResetTriggerButtonRef = ref<HTMLButtonElement | null>(null)

const { isOpen: isCreditsResetModalOpen, open: openCreditsResetModal, close: closeCreditsResetModal } = useModal({
  onClose: () => {
    creditsResetError.value = null
  },
})

const openCreditsModal = () => {
  openCreditsResetModal()
  nextTick(() => {
    creditsConfirmButtonRef.value?.focus()
  })
}

const handleCloseCreditsResetModal = () => {
  closeCreditsResetModal()
  nextTick(() => {
    creditsResetTriggerButtonRef.value?.focus()
  })
}

// ========================================
// System-Reset Handler
// ========================================
const resetConfirmation = ref('')
const isResetting = ref(false)
const resetError = ref<string | null>(null)
const resetSuccessMessage = ref<string | null>(null)

const canReset = computed(() => resetConfirmation.value === 'RESET')

const handleSystemReset = async () => {
  if (!canReset.value || isResetting.value) return

  isResetting.value = true
  resetError.value = null

  try {
    await $fetch('/api/admin/reset', { method: 'POST' })
    handleCloseResetModal()
    resetSuccessMessage.value = 'System-Reset erfolgreich durchgefuehrt. Alle Bestellungen, Transaktionen und Guthaben wurden zurueckgesetzt.'
  } catch (e: unknown) {
    resetError.value = (e as { message?: string }).message || 'Fehler beim System-Reset'
  } finally {
    isResetting.value = false
  }
}

// ========================================
// Guthaben-Reset Handler
// ========================================
const isCreditsResetting = ref(false)
const creditsResetError = ref<string | null>(null)
const creditsSuccessMessage = ref<string | null>(null)

const handleCreditsReset = async () => {
  if (isCreditsResetting.value) return

  isCreditsResetting.value = true
  creditsResetError.value = null

  try {
    await $fetch('/api/admin/credits/reset', { method: 'POST' })
    handleCloseCreditsResetModal()
    creditsSuccessMessage.value = 'Guthaben-Reset erfolgreich durchgefuehrt. Das Guthaben aller Nutzer wurde auf 25 EUR zurueckgesetzt.'
  } catch (e: unknown) {
    creditsResetError.value = (e as { message?: string }).message || 'Fehler beim Guthaben-Reset'
  } finally {
    isCreditsResetting.value = false
  }
}
</script>

<template>
  <div>
    <div class="max-w-2xl mx-auto px-4 md:px-6 py-8">

      <!-- Seiten-Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground">Einstellungen</h1>
        <p class="text-sm text-muted-foreground mt-1">Verwaltung und System-Aktionen</p>
      </div>

      <!-- Erfolgs-Banner: System-Reset -->
      <div
        v-if="resetSuccessMessage"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
        role="status"
      >
        {{ resetSuccessMessage }}
      </div>

      <!-- Erfolgs-Banner: Guthaben-Reset -->
      <div
        v-if="creditsSuccessMessage"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
        role="status"
      >
        {{ creditsSuccessMessage }}
      </div>

      <!-- Skeleton waehrend Auth-Pruefung -->
      <template v-if="!pageReady">
        <div class="animate-pulse space-y-4">
          <div class="h-12 bg-gray-200 rounded-lg"></div>
          <div class="h-32 bg-gray-200 rounded-lg mt-4"></div>
          <div class="h-32 bg-gray-200 rounded-lg mt-4"></div>
        </div>
      </template>

      <template v-else>

        <!-- ============================= -->
        <!-- Abschnitt: Konto             -->
        <!-- ============================= -->
        <section class="mb-8">
          <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Konto</h2>
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <!-- Teenyicons: logout (outline) -->
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            >
              <path d="M13.5 7.5l-3 3.25m3-3.25l-3-3m3 3H4m4 6H1.5v-12H8" stroke="currentColor" />
            </svg>
            Abmelden
          </button>
        </section>

        <!-- ============================= -->
        <!-- Abschnitt: System-Aktionen   -->
        <!-- ============================= -->
        <section class="mb-8">
          <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">System-Aktionen</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Aktionskarte: System-Reset -->
            <div class="bg-card rounded-lg p-6 border">
              <h3 class="text-base font-bold text-foreground mb-2">System-Reset</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Loescht alle Bestellungen und Transaktionen und setzt das Guthaben und den Bestand aller Nutzer zurueck.
                <strong class="text-red-600">Nicht rueckgaengig machbar!</strong>
              </p>
              <button
                ref="resetTriggerButtonRef"
                @click="openSystemResetModal"
                class="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
              >
                System-Reset durchfuehren
              </button>
            </div>

            <!-- Aktionskarte: Guthaben-Reset -->
            <div class="bg-card rounded-lg p-6 border">
              <h3 class="text-base font-bold text-foreground mb-2">Guthaben-Reset</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Setzt das Guthaben aller Nutzer auf 25 EUR zurueck, ohne die Transaktionshistorie zu loeschen.
              </p>
              <button
                ref="creditsResetTriggerButtonRef"
                @click="openCreditsModal"
                class="w-full py-2.5 bg-yellow-700 text-white rounded-lg font-medium hover:bg-yellow-800 transition-colors text-sm"
              >
                Guthaben-Reset durchfuehren
              </button>
            </div>

          </div>
        </section>

        <!-- ================================ -->
        <!-- Abschnitt: Weitere Einstellungen -->
        <!-- ================================ -->
        <section>
          <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Weitere Einstellungen</h2>
          <div class="bg-card rounded-lg p-6 border">
            <p class="text-sm text-muted-foreground">
              Weitere Einstellungen werden in zukuenftigen Updates hinzugefuegt.
            </p>
          </div>
        </section>

      </template>
    </div>

    <!-- ============================= -->
    <!-- Modal: System-Reset          -->
    <!-- ============================= -->
    <Teleport to="body">
      <div
        v-if="isResetModalOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="handleCloseResetModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-reset-modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">

          <!-- Modal-Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 id="system-reset-modal-title" class="text-xl font-bold text-red-600">System-Reset</h2>
            <button
              @click="handleCloseResetModal"
              class="text-muted-foreground hover:text-foreground p-1 rounded"
              aria-label="Modal schliessen"
            >
              <!-- Teenyicons: x-small (outline) -->
              <svg
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M4.5 4.5l6 6m-6 0l6-6" stroke="currentColor" />
              </svg>
            </button>
          </div>

          <!-- Erklaerungstext -->
          <p class="text-sm text-muted-foreground mb-4">
            Diese Aktion loescht alle Bestellungen und Transaktionen und setzt das Guthaben aller Nutzer auf 25 EUR zurueck. Der Bestand wird ebenfalls auf den Ausgangswert gesetzt.
          </p>
          <p class="text-sm font-medium text-red-600 mb-4">Achtung: Diese Aktion kann nicht rueckgaengig gemacht werden!</p>

          <!-- Pflicht-Eingabe -->
          <label for="system-reset-confirm" class="block text-sm font-medium mb-2">
            Gib <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono">RESET</code> ein, um zu bestaetigen:
          </label>
          <input
            id="system-reset-confirm"
            v-model="resetConfirmation"
            type="text"
            autofocus
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4 bg-background text-foreground"
            placeholder="RESET"
            autocomplete="off"
          />

          <!-- Fehlermeldung -->
          <div
            v-if="resetError"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            role="alert"
          >
            {{ resetError }}
          </div>

          <!-- Bestaetigen-Button -->
          <button
            @click="handleSystemReset"
            :disabled="!canReset || isResetting"
            class="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isResetting ? 'Wird ausgefuehrt...' : 'Reset bestaetigen' }}
          </button>

        </div>
      </div>
    </Teleport>

    <!-- ============================= -->
    <!-- Modal: Guthaben-Reset        -->
    <!-- ============================= -->
    <Teleport to="body">
      <div
        v-if="isCreditsResetModalOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="handleCloseCreditsResetModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-reset-modal-title"
      >
        <div class="bg-background rounded-lg max-w-md w-full p-6 border shadow-xl">

          <!-- Modal-Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 id="credits-reset-modal-title" class="text-xl font-bold text-yellow-700">Guthaben-Reset</h2>
            <button
              @click="handleCloseCreditsResetModal"
              class="text-muted-foreground hover:text-foreground p-1 rounded"
              aria-label="Modal schliessen"
            >
              <!-- Teenyicons: x-small (outline) -->
              <svg
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M4.5 4.5l6 6m-6 0l6-6" stroke="currentColor" />
              </svg>
            </button>
          </div>

          <!-- Erklaerungstext -->
          <p class="text-sm text-muted-foreground mb-4">
            Diese Aktion setzt das Guthaben aller Nutzer auf 25 EUR zurueck, ohne die Transaktionshistorie zu loeschen.
          </p>
          <p class="text-sm font-medium mb-6">Moechten Sie fortfahren?</p>

          <!-- Fehlermeldung -->
          <div
            v-if="creditsResetError"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            role="alert"
          >
            {{ creditsResetError }}
          </div>

          <!-- Aktionsbuttons -->
          <div class="flex gap-3">
            <button
              @click="handleCloseCreditsResetModal"
              class="flex-1 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Abbrechen
            </button>
            <button
              ref="creditsConfirmButtonRef"
              @click="handleCreditsReset"
              :disabled="isCreditsResetting"
              class="flex-1 py-3 bg-yellow-700 text-white rounded-lg font-medium hover:bg-yellow-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreditsResetting ? 'Wird ausgefuehrt...' : 'Reset durchfuehren' }}
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>
