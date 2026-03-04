<!--
  AdminInfoBanner - Informations-Banner fuer Admin-User im Dashboard

  Ersetzt die BalanceCard fuer Admin-User.

  Zeigt:
  - Info-Icon (SVG, kein Emoji)
  - Erklaerungstext: Admin hat kein persoenliches Guthaben
  - CTA-Link zu /admin

  Visuell:
  - Blaue Einfaerbung (bg-blue-50, border-blue-200, text-blue-800)
  - Identische Rahmen-Optik wie BalanceCard (rounded-lg, border-2, p-6)

  Accessibility:
  - role="region" + aria-label (WCAG 2.1)
  - focus:ring-2 auf CTA-Link
  - SVG-Icon mit aria-hidden (dekorativ)

  @component
-->

<script setup lang="ts">
// Keine Props und keine Emits noetig - Komponente ist selbststaendig
</script>

<template>
  <div
    class="rounded-lg p-6 border-2 bg-blue-50 border-blue-200 text-blue-800"
    role="region"
    aria-label="Admin-Modus Information"
  >
    <!-- Header: Icon + Titel -->
    <div class="flex items-center gap-3 mb-3">
      <!-- SVG Info-Icon (kein Emoji, WCAG: Icon + Text, nicht nur Farbe) -->
      <svg
        class="w-6 h-6 flex-shrink-0"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
        />
      </svg>
      <p class="text-sm font-semibold">Admin-Modus aktiv</p>
    </div>

    <!-- Erklaerungstext -->
    <p class="text-sm mb-4 leading-relaxed">
      Als Admin verfuegst du ueber kein persoenliches Guthaben-Konto.
      Das Snack-Guthaben-System gilt ausschliesslich fuer Mitarbeiter.
    </p>

    <!-- CTA-Link zu /admin -->
    <NuxtLink
      to="/admin"
      class="inline-flex items-center gap-2 py-3 px-4 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50"
      aria-label="Zum Admin-Bereich navigieren"
    >
      Zum Admin-Bereich
      <!-- Pfeil-Icon -->
      <svg
        class="w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
        />
      </svg>
    </NuxtLink>
  </div>
</template>
