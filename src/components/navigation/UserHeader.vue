<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
const cartCount = computed(() => cartStore?.itemCount ?? 0)
const route = useRoute()

// Bestimmen ob ein Zurück-Button angezeigt werden soll
const showBackButton = computed(() => {
  const path = route.path
  // Sub-Pages zeigen Zurück-Button
  return path.startsWith('/product/') ||
         path.startsWith('/leaderboard/') ||
         path === '/cart'
})

// Warenkorb-Badge: 0 = kein Badge anzeigen
const showCartBadge = computed(() => cartCount.value > 0)
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-50"
  >
    <div class="h-full flex items-center justify-between px-4 max-w-7xl mx-auto">
      <!-- Linke Seite: Zurück-Button oder App-Name -->
      <div class="flex items-center gap-2">
        <!-- Zurück-Button für Sub-Pages -->
        <NuxtLink
          v-if="showBackButton"
          to="/dashboard"
          class="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Zurück"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>

        <!-- App-Name -->
        <span v-if="!showBackButton" class="text-lg font-bold text-primary">SnackEase</span>
      </div>

      <!-- Rechte Seite: Warenkorb-Icon -->
      <NuxtLink
        to="/cart"
        class="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Warenkorb"
      >
        <!-- Warenkorb-Icon (Shopping Bag) -->
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>

        <!-- Badge mit Anzahl (ClientOnly verhindert SSR-Hydration-Mismatch, da cartStore localStorage nutzt) -->
        <ClientOnly>
          <span
            v-if="showCartBadge"
            class="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full"
          >
            {{ cartCount > 99 ? '99+' : cartCount }}
          </span>
        </ClientOnly>
      </NuxtLink>
    </div>
  </header>
</template>
