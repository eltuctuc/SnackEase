<!--
  PinInputModal — 4-stellige PIN-Eingabe für Bestellabholung (FEAT-11)

  Funktionen:
  - 4 einzelne Eingabefelder (Auto-Focus + Auto-Advance)
  - Zeigt Fehlermeldung bei falscher PIN (mit Versuchszähler)
  - ESC-Taste zum Schließen
  - Focus-Management: Erstes Feld fokussiert beim Öffnen
  - Bei Schließen: Fokus zurück auf aufrufendes Element

  @component
-->

<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  /** Ob das Modal sichtbar ist */
  isOpen: boolean
  /** Fehlermeldung (z.B. "Falsche PIN. Noch 2 Versuche.") */
  errorMessage?: string
  /** Ob die Eingabe gesperrt ist (max. Versuche erreicht) */
  isLocked?: boolean
  /** Ob der Bestätigungs-Button lädt */
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Wird emitted wenn der User die PIN bestätigt */
  confirm: [pin: string]
  /** Wird emitted wenn der User abbricht */
  cancel: []
}>()

// ========================================
// REACTIVE STATE
// ========================================

/** Die 4 PIN-Ziffern (Index 0–3) */
const digits = ref<string[]>(['', '', '', ''])

/** Refs auf die einzelnen Input-Elemente für Focus-Management */
const inputRefs = ref<(HTMLInputElement | null)[]>([null, null, null, null])

// ========================================
// COMPUTED
// ========================================

/** Vollständige PIN als String */
const fullPin = computed(() => digits.value.join(''))

/** Ist die PIN vollständig (4 Ziffern eingegeben)? */
const isPinComplete = computed(() => fullPin.value.length === 4)

// ========================================
// LIFECYCLE
// ========================================

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // PIN zurücksetzen beim Öffnen
      digits.value = ['', '', '', '']

      // Fokus auf erstes Feld setzen
      nextTick(() => {
        inputRefs.value[0]?.focus()
      })
    }
  }
)

// ESC-Taste zum Schließen (VueUse übernimmt Cleanup automatisch beim Unmount)
useEventListener(document, 'keydown', handleKeydown)

// ========================================
// METHODS
// ========================================

function handleKeydown(event: KeyboardEvent) {
  if (props.isOpen && event.key === 'Escape') {
    handleCancel()
  }
}

/**
 * Verarbeitet Eingabe in einem PIN-Feld
 */
function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value

  // Nur Ziffern erlauben
  const digit = value.replace(/\D/g, '').slice(-1)
  digits.value[index] = digit

  // Auto-Advance: Wenn eine Ziffer eingegeben, nächstes Feld fokussieren
  if (digit && index < 3) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }

  // Input-Wert auf bereinigte Ziffer setzen
  input.value = digit
}

/**
 * Rückwärts-Navigation mit Backspace
 */
function handleKeydownOnInput(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    // Leeres Feld + Backspace → vorheriges Feld fokussieren und leeren
    digits.value[index - 1] = ''
    nextTick(() => {
      inputRefs.value[index - 1]?.focus()
    })
  }
}

/**
 * Paste-Handler: Fügt 4-stellige PIN aus Zwischenablage ein
 */
function handlePaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text') ?? ''
  const cleanedPin = pasted.replace(/\D/g, '').slice(0, 4)

  if (cleanedPin.length > 0) {
    event.preventDefault()
    for (let i = 0; i < 4; i++) {
      digits.value[i] = cleanedPin[i] ?? ''
    }
    // Fokus auf letztes ausgefülltes Feld
    const lastIndex = Math.min(cleanedPin.length - 1, 3)
    nextTick(() => {
      inputRefs.value[lastIndex]?.focus()
    })
  }
}

/**
 * PIN bestätigen
 */
function handleConfirm() {
  if (!isPinComplete.value || props.isLoading || props.isLocked) return
  emit('confirm', fullPin.value)
}

/**
 * Modal schließen / Abbrechen
 */
function handleCancel() {
  digits.value = ['', '', '', '']
  emit('cancel')
}

/**
 * Input-Ref-Setter für Template-Array
 */
function setInputRef(index: number, el: HTMLInputElement | null) {
  inputRefs.value[index] = el
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="handleCancel"
        data-testid="pin-input-modal"
      >
        <div
          class="bg-card rounded-lg border shadow-lg max-w-sm w-full p-6 relative"
          @click.stop
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-modal-title"
          :aria-describedby="errorMessage ? 'pin-modal-error' : undefined"
        >
          <!-- Close Button -->
          <button
            @click="handleCancel"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Modal schließen"
            data-testid="pin-modal-close"
          >
            ✕
          </button>

          <!-- Titel -->
          <h2 id="pin-modal-title" class="text-xl font-bold text-foreground mb-2">
            PIN eingeben
          </h2>

          <!-- Erklärungstext -->
          <p class="text-sm text-muted-foreground mb-6">
            Gib deine 4-stellige PIN ein um die Bestellung am Automaten abzuholen.
            <br />
            <span class="text-xs">Die PIN findest du auf der Bestellkarte.</span>
          </p>

          <!-- PIN-Eingabefelder -->
          <div class="flex gap-3 justify-center mb-4" role="group" aria-label="PIN-Eingabe">
            <input
              v-for="i in 4"
              :key="i - 1"
              :ref="(el) => setInputRef(i - 1, el as HTMLInputElement | null)"
              type="text"
              inputmode="numeric"
              maxlength="1"
              :value="digits[i - 1]"
              :disabled="isLocked || isLoading"
              :aria-label="`PIN Stelle ${i} von 4`"
              :class="[
                'w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errorMessage
                  ? 'border-destructive bg-destructive/10'
                  : digits[i - 1]
                    ? 'border-primary bg-primary/5'
                    : 'border-input bg-background',
              ]"
              :data-testid="`pin-input-${i - 1}`"
              @input="handleInput(i - 1, $event)"
              @keydown="handleKeydownOnInput(i - 1, $event)"
              @paste="handlePaste"
            />
          </div>

          <!-- Fehlermeldung -->
          <div
            v-if="errorMessage"
            id="pin-modal-error"
            class="text-sm text-destructive text-center mb-4 font-medium"
            role="alert"
            data-testid="pin-modal-error"
          >
            {{ errorMessage }}
          </div>

          <!-- Gesperrt-Meldung -->
          <div
            v-if="isLocked"
            class="text-sm text-destructive text-center mb-4 font-medium bg-destructive/10 rounded-lg p-3"
            role="alert"
            data-testid="pin-modal-locked"
          >
            Maximale Versuche erreicht. Bitte lade die Seite neu.
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 mt-2">
            <button
              @click="handleCancel"
              class="flex-1 py-3 rounded-lg border border-input text-foreground font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="pin-modal-cancel"
            >
              Abbrechen
            </button>

            <button
              @click="handleConfirm"
              :disabled="!isPinComplete || isLoading || isLocked"
              :class="[
                'flex-1 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                isPinComplete && !isLoading && !isLocked
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              ]"
              data-testid="pin-modal-confirm"
            >
              <span v-if="isLoading">Wird geprüft...</span>
              <span v-else>Bestätigen</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
