<!--
  OrderHistoryItem — Einzelne Bestellkarte im Profil-Verlauf

  Zeigt:
  - Abhol-Datum (pickedUpAt, Format DD.MM.YYYY HH:MM)
  - Gesamtbetrag
  - Produktliste (kollabierbar bei >1 Produkt, analog OrderCard.vue)

  Nur fuer abgeholte Bestellungen (status = picked_up).
  Kein Status-Badge, keine Countdown-Logik (historische Ansicht).
-->
<script setup lang="ts">
interface OrderItem {
  productName: string
  quantity: number
  price: string
}

interface Props {
  id: number
  pickedUpAt: string
  totalAmount: string
  items: OrderItem[]
}

const props = defineProps<Props>()

const { formatPrice } = useFormatter()

/** Ob die Produktliste eingeklappt ist (nur bei Mehrprodukt-Bestellungen) */
const isCollapsed = ref(true)

/** Ist dies eine Mehrprodukt-Bestellung? */
const isMultiItemOrder = computed(() => props.items.length > 1)

/** Anzeigename (Zusammenfassung oder einzelnes Produkt) */
const displaySummary = computed(() => {
  if (isMultiItemOrder.value) {
    return `${props.items.length} Produkte`
  }
  return props.items[0]?.productName || 'Produkt'
})

/** Formatiertes Abhol-Datum: DD.MM.YYYY HH:MM */
const pickedUpFormatted = computed(() => {
  if (!props.pickedUpAt) return '–'
  return new Date(props.pickedUpAt).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <div
    class="bg-card rounded-xl border p-4 shadow-sm"
    :data-testid="`history-item-${id}`"
  >
    <!-- Obere Zeile: Datum und Gesamtbetrag -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <!-- Teenyicons: calendar (inline SVG) -->
        <svg
          class="w-4 h-4 opacity-50 flex-shrink-0"
          viewBox="0 0 15 15"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          aria-hidden="true"
        >
          <path d="M3.5 0v5m8-5v5m-10-2.5h12a1 1 0 011 1v10a1 1 0 01-1 1h-12a1 1 0 01-1-1v-10a1 1 0 011-1z" />
        </svg>
        <span>{{ pickedUpFormatted }} Uhr</span>
      </div>
      <span class="text-base font-semibold text-foreground">
        {{ formatPrice(totalAmount) }}
      </span>
    </div>

    <!-- Produkt-Zusammenfassung (klickbar bei Mehrprodukt) -->
    <div
      :class="['flex items-center gap-2', isMultiItemOrder ? 'cursor-pointer' : '']"
      @click="isMultiItemOrder && (isCollapsed = !isCollapsed)"
    >
      <!-- Produkt-Icon (Teenyicons: bag, inline SVG) -->
      <div class="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        <svg
          class="w-4 h-4 opacity-40"
          viewBox="0 0 15 15"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          aria-hidden="true"
        >
          <path d="M2.401 6.39l-.497-.056.497.056zm-.778 7l.497.055-.497-.055zm11.754 0l-.497.055.497-.055zm-.778-7l.497-.056-.497.056zM1.904 6.334l-.778 7 .994.11.778-7-.994-.11zM2.617 15h9.766v-1H2.617v1zm11.257-1.666l-.778-7-.994.11.778 7 .993-.11zM11.604 5H3.396v1h8.21V5zm1.492 1.334A1.5 1.5 0 0011.605 5v1a.5.5 0 01.497.445l.994-.11zM12.383 15a1.5 1.5 0 001.49-1.666l-.993.11a.5.5 0 01-.497.556v1zM1.126 13.334A1.5 1.5 0 002.617 15v-1a.5.5 0 01-.497-.555l-.994-.11zm1.772-6.89A.5.5 0 013.395 6V5a1.5 1.5 0 00-1.49 1.334l.993.11zM5 4v-.5H4V4h1zm5-.5V4h1v-.5h-1zM7.5 1A2.5 2.5 0 0110 3.5h1A3.5 3.5 0 007.5 0v1zM5 3.5A2.5 2.5 0 017.5 1V0A3.5 3.5 0 004 3.5h1z" />
        </svg>
      </div>

      <span class="flex-1 text-sm text-foreground font-medium">
        {{ displaySummary }}
      </span>

      <!-- Chevron fuer Mehrprodukt-Bestellungen -->
      <span
        v-if="isMultiItemOrder"
        class="transition-transform text-muted-foreground"
        :class="{ 'rotate-180': !isCollapsed }"
        aria-hidden="true"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>

    <!-- Aufgeklappte Produktliste (nur bei Mehrprodukt-Bestellungen) -->
    <div
      v-if="isMultiItemOrder && !isCollapsed"
      class="mt-3 pl-10 space-y-2"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center gap-2 text-sm"
      >
        <span class="flex-1 text-foreground">{{ item.productName }}</span>
        <span class="text-muted-foreground">x{{ item.quantity }}</span>
        <span class="text-foreground font-medium">{{ formatPrice(item.price) }}</span>
      </div>
    </div>

    <!-- Einzelprodukt: Menge direkt anzeigen -->
    <div
      v-else-if="!isMultiItemOrder && items[0]"
      class="mt-1 pl-10 text-sm text-muted-foreground"
    >
      x{{ items[0].quantity }}
    </div>
  </div>
</template>
