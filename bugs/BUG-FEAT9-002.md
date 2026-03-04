# BUG-FEAT9-002: Skeleton-Loading zeigt BalanceCard-Form fuer Admin

**Feature:** FEAT-9 Admin ohne Guthaben
**Severity:** Low
**Priority:** Nice to Fix
**Status:** Offen
**Gefunden am:** 2026-03-04
**App URL:** http://localhost:3000

---

## Beschreibung

Waehrend des initialen Ladevorgangs des Dashboards (bevor `pageReady = true` gesetzt wird) zeigt der Lade-Skeleton eine BalanceCard-aehnliche Form an. Diese Skeleton-Form ist identisch fuer Admin und Mitarbeiter - sie impliziert visuell, dass eine Guthaben-Karte geladen wird. Fuer Admin ist das semantisch inkorrekt: Admin hat keine Guthaben-Karte, sollte also auch keinen BalanceCard-Skeleton sehen.

Das Tech-Design hatte dieses Problem bereits erkannt (Entscheidung 5) und als Kompromiss akzeptiert. Es bleibt jedoch ein kleiner UX-Mangel: Admin sieht kurz einen Skeleton, der eine Guthaben-Karte andeutet, die dann nie erscheint.

---

## Betroffene Dateien

- `src/pages/dashboard.vue` - Zeilen 303-325 (Skeleton-Template)

## Betroffener Code

```html
<!-- Lade-Skeleton bis alle Daten bereit sind -->
<template v-if="!pageReady">
  <div class="grid gap-6 mb-8">
    <div class="rounded-lg p-6 border-2 bg-gray-100 border-gray-200 animate-pulse">
      <!-- BalanceCard-Skeleton - identisch fuer Admin und Mitarbeiter -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="h-3 bg-gray-300 rounded w-16 mb-2"></div>
          <div class="h-10 bg-gray-300 rounded w-28"></div>
        </div>
        <div class="w-4 h-4 rounded-full bg-gray-300"></div>
      </div>
      <div class="flex gap-3">
        <div class="flex-1 h-12 bg-gray-300 rounded-lg"></div>
        <div class="flex-1 h-12 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  </div>
</template>
```

Der Skeleton hat zwei Buttons (wie BalanceCard: "Aufladen" + "Monatspauschale"), die fuer Admin nie erscheinen.

---

## Steps to Reproduce

1. Als Admin einloggen: admin@demo.de / admin123
2. Nach erfolgreichem Login direkt /dashboard beobachten
3. Kurzzeitig (ca. 100-500ms je nach Netzwerkgeschwindigkeit) ist ein grauer Skeleton mit zwei Button-Platzhaltern sichtbar
4. Nach dem Laden erscheint korrekt der AdminInfoBanner (ohne Buttons)

## Expected Behavior

- Admin sieht waehrend des Ladens einen neutralen Skeleton ohne implizite BalanceCard-Struktur
- ODER: Admin sieht einen AdminInfoBanner-Skeleton (blaue Einfaerbung, kein Button-Skeleton)
- ODER: Der Skeleton ist voellig neutral und zeigt keine Buttons an

## Actual Behavior

- Admin sieht kurzzeitig einen Skeleton mit zwei Button-Platzhaltern
- Die Button-Platzhalter implizieren Guthaben-Funktionen, die fuer Admin nicht existieren
- Nach dem Laden verschwindet der Skeleton und wird korrekt durch AdminInfoBanner ersetzt

---

## Auswirkung

- Severity: Low - betrifft nur den kurzen Ladezustand (< 1 Sekunde)
- Kein Datenschutzproblem (echte Daten werden nicht angezeigt)
- Kein Funktionsproblem (nach Laden ist alles korrekt)
- Kleiner UX-Mangel: Layout-Shift und semantisch irrefuehrender Skeleton fuer Admin

---

## Root Cause

Die `pageReady`-Variable wird erst auf `true` gesetzt nachdem `initFromCookie()` und `productsStore.fetchProducts()` abgeschlossen sind. Zu diesem Zeitpunkt ist die Rolle des Users bereits bekannt (`authStore.isAdmin`), aber der Skeleton-Block (`v-if="!pageReady"`) unterscheidet noch nicht zwischen Admin und Mitarbeiter.

Das Tech-Design hat dies als Kompromiss akzeptiert (Entscheidung 5: "Skeleton unveraendert - waehrend Ladezeit ist Rolle noch nicht bekannt"). Die Aussage ist jedoch technisch nicht ganz korrekt: Die Rolle wird NACH initFromCookie() bekannt, aber der Skeleton zeigt immer noch die BalanceCard-Form an bis ALLE Promises aufgeloest sind.

---

## Environment

- Browser: Code-Review (static analysis)
- Device: Desktop
- OS: macOS

---

## Abhangigkeiten

### Zu anderen Features
- FEAT-9: Dieses Feature hat das Skeleton-Problem als bewusste Entscheidung akzeptiert

---

## Attachments

- Logs: Keine (Code-Review-Fund)
