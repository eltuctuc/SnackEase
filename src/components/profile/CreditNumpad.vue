<!--
  CreditNumpad — Numerisches Numpad fuer die Betragseingabe (FEAT-24)

  Zeigt ein iOS-artiges Numpad mit:
  - Ziffern 1-9 (3x3 Grid)
  - Nicht-interaktive "+*#"-Zelle links unten (iOS-Stil, aria-hidden)
  - "0"-Taste Mitte unten
  - Backspace-Taste rechts unten

  Jede Taste ist mindestens 44x44pt gross (P1-Anforderung).
  Tastatur-Navigation: Enter/Space loest die Taste aus.
-->
<script setup lang="ts">
interface Emits {
  digit: [digit: number]
  backspace: []
}

const emit = defineEmits<Emits>()

function handleDigit(digit: number) {
  emit('digit', digit)
}

function handleBackspace() {
  emit('backspace')
}
</script>

<template>
  <div
    class="bg-muted/40 border-t border-border"
    role="group"
    aria-label="Zifferntastatur"
  >
    <!-- 4 Zeilen je eine Zeile: 1-9 + unterste Zeile -->
    <!-- Zeile 1 -->
    <div class="grid grid-cols-3">
      <button
        v-for="digit in [1, 2, 3]"
        :key="digit"
        type="button"
        class="flex flex-col items-center justify-center min-h-[56px] border-b border-r border-border bg-white active:bg-muted transition-colors text-foreground font-medium text-xl select-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary last:border-r-0"
        :aria-label="`Ziffer ${digit}`"
        @click="handleDigit(digit)"
        @keydown.enter.prevent="handleDigit(digit)"
        @keydown.space.prevent="handleDigit(digit)"
      >
        {{ digit }}
        <span class="text-[9px] text-muted-foreground font-normal mt-0.5 tracking-widest" aria-hidden="true">
          <template v-if="digit === 2">ABC</template>
          <template v-else-if="digit === 3">DEF</template>
        </span>
      </button>
    </div>

    <!-- Zeile 2 -->
    <div class="grid grid-cols-3">
      <button
        v-for="digit in [4, 5, 6]"
        :key="digit"
        type="button"
        class="flex flex-col items-center justify-center min-h-[56px] border-b border-r border-border bg-white active:bg-muted transition-colors text-foreground font-medium text-xl select-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary last:border-r-0"
        :aria-label="`Ziffer ${digit}`"
        @click="handleDigit(digit)"
        @keydown.enter.prevent="handleDigit(digit)"
        @keydown.space.prevent="handleDigit(digit)"
      >
        {{ digit }}
        <span class="text-[9px] text-muted-foreground font-normal mt-0.5 tracking-widest" aria-hidden="true">
          <template v-if="digit === 4">GHI</template>
          <template v-else-if="digit === 5">JKL</template>
          <template v-else-if="digit === 6">MNO</template>
        </span>
      </button>
    </div>

    <!-- Zeile 3 -->
    <div class="grid grid-cols-3">
      <button
        v-for="digit in [7, 8, 9]"
        :key="digit"
        type="button"
        class="flex flex-col items-center justify-center min-h-[56px] border-b border-r border-border bg-white active:bg-muted transition-colors text-foreground font-medium text-xl select-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary last:border-r-0"
        :aria-label="`Ziffer ${digit}`"
        @click="handleDigit(digit)"
        @keydown.enter.prevent="handleDigit(digit)"
        @keydown.space.prevent="handleDigit(digit)"
      >
        {{ digit }}
        <span class="text-[9px] text-muted-foreground font-normal mt-0.5 tracking-widest" aria-hidden="true">
          <template v-if="digit === 7">PQRS</template>
          <template v-else-if="digit === 8">TUV</template>
          <template v-else-if="digit === 9">WXYZ</template>
        </span>
      </button>
    </div>

    <!-- Unterste Zeile: +*# (dekorativ) | 0 | Backspace -->
    <div class="grid grid-cols-3">
      <!-- Dekorative "+*#"-Zelle — nicht interaktiv, iOS-Numpad-Optik -->
      <div
        class="flex items-center justify-center min-h-[56px] border-r border-border bg-muted/40"
        aria-hidden="true"
      >
        <span class="text-muted-foreground text-base tracking-widest select-none">+*#</span>
      </div>

      <!-- "0"-Taste -->
      <button
        type="button"
        class="flex items-center justify-center min-h-[56px] border-r border-border bg-white active:bg-muted transition-colors text-foreground font-medium text-xl select-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
        aria-label="Ziffer 0"
        @click="handleDigit(0)"
        @keydown.enter.prevent="handleDigit(0)"
        @keydown.space.prevent="handleDigit(0)"
      >
        0
      </button>

      <!-- Backspace-Taste -->
      <button
        type="button"
        class="flex items-center justify-center min-h-[56px] bg-white active:bg-muted transition-colors text-foreground select-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
        aria-label="Letzte Ziffer löschen"
        @click="handleBackspace"
        @keydown.enter.prevent="handleBackspace"
        @keydown.space.prevent="handleBackspace"
      >
        <!-- Backspace-Icon (Teenyicons: backspace-outline) -->
        <svg
          class="w-6 h-6 text-foreground"
          viewBox="0 0 15 15"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          aria-hidden="true"
        >
          <path d="M5.5 1.5h8a1 1 0 011 1v10a1 1 0 01-1 1h-8l-4-6 4-6z" />
          <path d="M7.5 5.5l4 4m0-4l-4 4" />
        </svg>
      </button>
    </div>
  </div>
</template>
