<!--
  ProfileHeader — Oberer Bereich der Profil-Seite

  Zeigt:
  - Avatar-Platzhalter (Teenyicons: user-circle, inline SVG)
  - Name des eingeloggten Mitarbeiters (readonly)
  - Standort (readonly)
  - Guthaben mit Kreditkarten-Icon (navigiert zu /profile/credit fuer FEAT-24)

  Hinweis: Kein Stift-Icon gemaess Spec Abschnitt 13 (UX-Validierung):
  Das Edit-Icon im Wireframe ist veraltet und darf nicht implementiert werden.
-->
<script setup lang="ts">
interface Props {
  name: string
  location: string
  balance: string
  /** Guthaben noch nicht geladen (zeigt Skeleton) */
  loading?: boolean
}

defineProps<Props>()

const { formatPrice } = useFormatter()
</script>

<template>
  <div class="bg-card border-b px-4 py-5">
    <div class="flex items-center gap-4">
      <!-- Avatar-Platzhalter (Teenyicons: user-circle, inline SVG) -->
      <div
        class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20"
        aria-label="Profilbild-Platzhalter"
        role="img"
      >
        <svg
          class="w-10 h-10 text-primary/40"
          viewBox="0 0 15 15"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          aria-hidden="true"
        >
          <path d="M3 13v.5h1V13H3zm8 0v.5h1V13h-1zm-7 0v-.5H3v.5h1zm2.5-3h2V9h-2v1zm4.5 2.5v.5h1v-.5h-1zM8.5 10a2.5 2.5 0 012.5 2.5h1A3.5 3.5 0 008.5 9v1zM4 12.5A2.5 2.5 0 016.5 10V9A3.5 3.5 0 003 12.5h1zM7.5 3A2.5 2.5 0 005 5.5h1A1.5 1.5 0 017.5 4V3zM10 5.5A2.5 2.5 0 007.5 3v1A1.5 1.5 0 019 5.5h1zM7.5 8A2.5 2.5 0 0010 5.5H9A1.5 1.5 0 017.5 7v1zm0-1A1.5 1.5 0 016 5.5H5A2.5 2.5 0 007.5 8V7zm0 7A6.5 6.5 0 011 7.5H0A7.5 7.5 0 007.5 15v-1zM14 7.5A6.5 6.5 0 017.5 14v1A7.5 7.5 0 0015 7.5h-1zM7.5 1A6.5 6.5 0 0114 7.5h1A7.5 7.5 0 007.5 0v1zm0-1A7.5 7.5 0 000 7.5h1A6.5 6.5 0 017.5 1V0z" />
        </svg>
      </div>

      <!-- Name, Standort und Guthaben -->
      <div class="flex-1 min-w-0">
        <!-- Skeleton waehrend Laden -->
        <template v-if="loading">
          <div class="h-6 w-32 bg-muted rounded animate-pulse mb-1" />
          <div class="h-4 w-20 bg-muted rounded animate-pulse mb-3" />
          <div class="h-5 w-24 bg-muted rounded animate-pulse" />
        </template>

        <template v-else>
          <!-- Name -->
          <h1 class="text-xl font-bold text-foreground truncate">
            {{ name || 'Mitarbeiter' }}
          </h1>

          <!-- Standort -->
          <p class="text-sm text-muted-foreground mb-3">
            {{ location || '' }}
          </p>

          <!-- Guthaben + Kreditkarten-Icon -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Guthaben</span>
            <span class="text-base font-semibold text-foreground">
              {{ formatPrice(balance) }}
            </span>
            <!-- Kreditkarten-Icon: navigiert zu /profile/credit (FEAT-24) -->
            <NuxtLink
              to="/profile/credit"
              class="ml-1 p-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Guthaben aufladen"
            >
              <svg
                class="w-5 h-5 text-primary"
                viewBox="0 0 15 15"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                aria-hidden="true"
              >
                <path d="M.5 5.5h14M2 9.5h6m2 0h3M.5 3.5v8a1 1 0 001 1h12a1 1 0 001-1v-8a1 1 0 00-1-1h-12a1 1 0 00-1 1z" />
              </svg>
            </NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
