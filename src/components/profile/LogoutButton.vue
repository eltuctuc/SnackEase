<!--
  LogoutButton — Logout-Schaltflaeche (destruktiv)

  Zweistufiger Logout gemaess UX-Empfehlung Abschnitt 13, Punkt 2:
  1. Erster Tap: Button-Text wechselt zu "Abmelden bestaetigen?"
  2. Zweiter Tap: authStore.logout() wird ausgefuehrt

  Visuell klar als destruktive Aktion erkennbar (Outline-Rot).
-->
<script setup lang="ts">
const authStore = useAuthStore()

/** Zwei-Stufen-Bestaetigung: true = Bestaetigung ausstehend */
const confirmPending = ref(false)

/** Erster Klick: Bestaetigung anfordern */
function handleFirstClick() {
  confirmPending.value = true
}

/** Zweiter Klick: Logout ausfuehren */
async function handleConfirm() {
  await authStore.logout()
}

/** Abbruch: Zurueck zum normalen Zustand */
function handleCancel() {
  confirmPending.value = false
}
</script>

<template>
  <div class="px-4 py-4 pb-6">
    <!-- Normaler Zustand -->
    <button
      v-if="!confirmPending"
      class="w-full py-3 rounded-xl border-2 border-destructive text-destructive font-semibold text-sm hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive min-h-[44px]"
      data-testid="logout-btn"
      @click="handleFirstClick"
    >
      <div class="flex items-center justify-center gap-2">
        <!-- Teenyicons: x-circle (inline SVG) -->
        <svg
          class="w-5 h-5"
          viewBox="0 0 15 15"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          aria-hidden="true"
        >
          <path d="M4.5 4.5l6 6m-6 0l6-6m-3 10a7 7 0 110-14 7 7 0 010 14z" />
        </svg>
        <span>Abmelden</span>
      </div>
    </button>

    <!-- Bestaetigung ausstehend -->
    <div v-else class="space-y-2">
      <button
        class="w-full py-3 rounded-xl bg-destructive text-white font-semibold text-sm hover:bg-destructive/90 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive min-h-[44px]"
        data-testid="logout-confirm-btn"
        @click="handleConfirm"
      >
        Abmelden bestaetigen?
      </button>
      <button
        class="w-full py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
        data-testid="logout-cancel-btn"
        @click="handleCancel"
      >
        Abbrechen
      </button>
    </div>
  </div>
</template>
