<!--
  PaymentMethodSelector — Radio-Button-Liste fuer Zahlungsmethoden (FEAT-24)

  Zeigt drei Zahlungsmethoden als auswaehlbare Optionen:
  - VISA / MAESTRO
  - PayPal
  - Nettogehalt

  Jede Option ist als vollstaendige Touch-Flaeche implementiert (P1/P2-Anforderung).
  Accessibility: aria-describedby fuer Beschreibungstexte.
-->
<script setup lang="ts">
import type { PaymentMethod } from '~/composables/useCreditNumpad'

interface Props {
  modelValue: PaymentMethod
}

interface Emits {
  'update:modelValue': [value: PaymentMethod]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

interface PaymentOption {
  value: PaymentMethod
  label: string
  description: string
}

const options: PaymentOption[] = [
  {
    value: 'visa',
    label: 'VISA / MAESTRO',
    description: 'Kartenzahlung über deine Kredit- oder Debitkarte',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'Zahlung über dein PayPal-Konto',
  },
  {
    value: 'salary',
    label: 'Nettogehalt',
    description: 'Betrag wird von deinem nächsten Netto-Gehalt abgezogen',
  },
]

function selectOption(value: PaymentMethod) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="flex flex-col gap-0"
    role="radiogroup"
    aria-label="Zahlungsmethode auswählen"
  >
    <label
      v-for="option in options"
      :key="option.value"
      class="flex items-center justify-between px-4 py-4 min-h-[72px] cursor-pointer border-b border-border last:border-b-0 active:bg-muted/40 transition-colors"
      :for="`payment-${option.value}`"
    >
      <!-- Text-Bereich -->
      <div class="flex-1 min-w-0 pr-4">
        <span
          :id="`payment-label-${option.value}`"
          class="block text-base font-semibold text-foreground"
        >
          {{ option.label }}
        </span>
        <span
          :id="`payment-desc-${option.value}`"
          class="block text-sm text-muted-foreground mt-0.5"
        >
          {{ option.description }}
        </span>
      </div>

      <!-- Radio-Input + Custom Radio-Circle -->
      <div class="flex-shrink-0 flex items-center justify-center w-6 h-6">
        <input
          :id="`payment-${option.value}`"
          type="radio"
          :value="option.value"
          :checked="modelValue === option.value"
          class="sr-only"
          :aria-labelledby="`payment-label-${option.value}`"
          :aria-describedby="`payment-desc-${option.value}`"
          @change="selectOption(option.value)"
        />
        <!-- Custom Radio-Circle (sichtbar, visuell) -->
        <div
          :class="[
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
            modelValue === option.value
              ? 'border-primary'
              : 'border-border',
          ]"
          aria-hidden="true"
        >
          <div
            v-if="modelValue === option.value"
            class="w-3 h-3 rounded-full bg-primary"
          />
        </div>
      </div>
    </label>
  </div>
</template>
