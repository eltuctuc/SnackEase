<!--
  NfcPickupAnimation — 2-Sekunden-Animation für NFC-Abholung (FEAT-11)

  Zeigt eine Animations-Overlay mit dem Text "NFC erkannt... Produkt wird ausgegeben"
  für 2 Sekunden, dann wird das `done`-Event emitted.

  Wird beim NFC-Button-Klick angezeigt.

  @component
-->

<script setup lang="ts">
// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  /** Ob die Animation aktiv ist */
  isVisible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Wird nach 2 Sekunden emitted */
  done: []
}>()

// ========================================
// LIFECYCLE
// ========================================

let timeoutId: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.isVisible,
  (isVisible) => {
    // Laufenden Timeout abbrechen (verhindert mehrfache done-Events bei rapid toggle)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (isVisible) {
      // Nach 2 Sekunden done emittieren
      timeoutId = setTimeout(() => {
        emit('done')
        timeoutId = null
      }, 2000)
    }
  }
)

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-primary/95"
      data-testid="nfc-pickup-animation"
      aria-live="assertive"
      role="status"
    >
      <!-- NFC-Icon (pulsierend) -->
      <div class="text-8xl mb-6 animate-pulse">
        📲
      </div>

      <!-- Primärer Text -->
      <h2 class="text-3xl font-bold text-white mb-3">
        NFC erkannt!
      </h2>

      <!-- Sekundärer Text -->
      <p class="text-xl text-white/80 animate-pulse">
        Produkt wird ausgegeben...
      </p>

      <!-- Ladebalken -->
      <div class="mt-8 w-48 h-1.5 bg-white/30 rounded-full overflow-hidden">
        <div class="h-full bg-white rounded-full nfc-progress-bar" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.nfc-progress-bar {
  animation: nfc-fill 2s ease-in-out forwards;
}

@keyframes nfc-fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nfc-progress-bar {
    animation: none;
    width: 100%;
  }

  .animate-pulse {
    animation: none;
  }
}
</style>
