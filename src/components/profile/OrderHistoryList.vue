<!--
  OrderHistoryList — Liste aller abgeholten Bestellungen mit Load-More

  - Initial 20 Bestellungen sichtbar
  - "Mehr laden"-Button erscheint wenn mehr als 20 vorhanden (kein neuer API-Call)
  - Leerer Zustand wenn keine Bestellungen im Zeitraum vorhanden
  - Skeleton-States waehrend des Ladens
-->
<script setup lang="ts">
interface OrderItem {
  productName: string
  quantity: number
  price: string
}

interface Order {
  id: number
  pickedUpAt: string
  totalAmount: string
  items: OrderItem[]
}

interface Props {
  orders: Order[]
  loading?: boolean
}

const props = defineProps<Props>()

/** Anzahl sichtbarer Bestellungen (clientseitiges Load-More) */
const visibleCount = ref(20)

/** Sichtbare Bestellungen (clientseitig geschnitten) */
const visibleOrders = computed(() => props.orders.slice(0, visibleCount.value))

/** Ob es mehr Bestellungen zu laden gibt */
const hasMore = computed(() => visibleCount.value < props.orders.length)

/** Weitere 20 Bestellungen einblenden (kein API-Call) */
function loadMore() {
  visibleCount.value += 20
}

// Beim Wechsel des Zeitraums: Limit zuruecksetzen
watch(() => props.orders, () => {
  visibleCount.value = 20
})
</script>

<template>
  <div id="bestellverlauf" class="px-4 py-4">
    <h2 class="text-lg font-bold text-foreground mb-4">Bestellverlauf</h2>

    <!-- Skeleton waehrend Laden -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-card rounded-xl border p-4 animate-pulse"
      >
        <div class="flex justify-between mb-3">
          <div class="h-4 w-32 bg-muted rounded" />
          <div class="h-4 w-16 bg-muted rounded" />
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-muted rounded-lg" />
          <div class="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    </div>

    <!-- Leerer Zustand (EC-2) -->
    <div
      v-else-if="orders.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3"
      data-testid="order-history-empty"
    >
      <!-- Teenyicons: bag (inline SVG) -->
      <svg
        class="w-10 h-10 opacity-25"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        aria-hidden="true"
      >
        <path d="M2.401 6.39l-.497-.056.497.056zm-.778 7l.497.055-.497-.055zm11.754 0l-.497.055.497-.055zm-.778-7l.497-.056-.497.056zM1.904 6.334l-.778 7 .994.11.778-7-.994-.11zM2.617 15h9.766v-1H2.617v1zm11.257-1.666l-.778-7-.994.11.778 7 .993-.11zM11.604 5H3.396v1h8.21V5zm1.492 1.334A1.5 1.5 0 0011.605 5v1a.5.5 0 01.497.445l.994-.11zM12.383 15a1.5 1.5 0 001.49-1.666l-.993.11a.5.5 0 01-.497.556v1zM1.126 13.334A1.5 1.5 0 002.617 15v-1a.5.5 0 01-.497-.555l-.994-.11zm1.772-6.89A.5.5 0 013.395 6V5a1.5 1.5 0 00-1.49 1.334l.993.11zM5 4v-.5H4V4h1zm5-.5V4h1v-.5h-1zM7.5 1A2.5 2.5 0 0110 3.5h1A3.5 3.5 0 007.5 0v1zM5 3.5A2.5 2.5 0 017.5 1V0A3.5 3.5 0 004 3.5h1z" />
      </svg>
      <p class="text-base font-medium">Keine Bestellungen in diesem Zeitraum</p>
      <p class="text-sm">Wechsle den Zeitraum oder kaufe deinen ersten Snack.</p>
    </div>

    <!-- Bestellliste -->
    <div v-else class="space-y-3">
      <ProfileOrderHistoryItem
        v-for="order in visibleOrders"
        :key="order.id"
        :id="order.id"
        :picked-up-at="order.pickedUpAt"
        :total-amount="order.totalAmount"
        :items="order.items"
      />

      <!-- Load-More-Button -->
      <button
        v-if="hasMore"
        class="w-full py-3 rounded-xl border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
        data-testid="load-more-btn"
        @click="loadMore"
      >
        Mehr laden ({{ orders.length - visibleCount }} weitere)
      </button>
    </div>
  </div>
</template>
