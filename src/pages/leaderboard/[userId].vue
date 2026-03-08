<script setup lang="ts">
// Platzhalter-Seite fuer User-Details auf der Bestenliste
// Inhalt folgt in einem zukuenftigen Feature
const route = useRoute()
const userId = route.params.userId
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
    <h1 class="text-2xl font-bold text-foreground mb-2">Benutzerprofil</h1>
    <p class="text-muted-foreground">
      Benutzer-Details fuer ID: {{ userId }}
    </p>
    <p class="text-muted-foreground mt-2">
      Der Inhalt folgt in einem zukuenftigen Feature.
    </p>
  </div>
</template>
