<!--
  SearchInput - Suchfeld mit Lupe-Icon und X-Button (FEAT-19)

  - Texteingabe mit Placeholder "Produkte suchen..."
  - Lupe-Icon links (Teenyicons search-outline)
  - X-Button rechts wenn nicht leer (REQ-5)
  - v-model über modelValue / update:modelValue

  @component
-->

<script setup lang="ts">
// ========================================
// PROPS & EMITS
// ========================================

interface Props {
  /** Aktueller Suchbegriff */
  modelValue: string
  /** Placeholder-Text */
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Produkte suchen...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** X-Button geklickt → Suchbegriff leeren */
  clear: []
}>()

// ========================================
// SVG-PFADE (Teenyicons v0.4.1)
// ========================================

/** outline/search.svg */
const searchPath = 'M10 6.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm-.691 3.516a4.5 4.5 0 111.207-1.208l2.838 2.837-.707.708-2.838-2.837z'

/** outline/x-small.svg */
const xPath = 'M3.5 3.5l8 8m-8 0l8-8'

// ========================================
// METHODEN
// ========================================

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', input.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="relative">
    <!-- Zugängliches Label (versteckt) -->
    <label for="search-input" class="sr-only">Produkte suchen</label>

    <!-- Lupe-Icon links -->
    <span
      class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
      >
        <path :d="searchPath" fill="currentColor" />
      </svg>
    </span>

    <!-- Texteingabe -->
    <input
      id="search-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      class="w-full pl-9 pr-9 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      @input="handleInput"
    />

    <!-- X-Button rechts (nur wenn Suchbegriff nicht leer) -->
    <button
      v-if="modelValue"
      type="button"
      aria-label="Suchbegriff leeren"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      @click="handleClear"
    >
      <svg
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5"
        aria-hidden="true"
      >
        <path :d="xPath" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>
