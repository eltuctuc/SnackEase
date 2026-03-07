# BUG-FEAT12-003: Client-seitiger Auth-Guard in inventory.vue — kurzes SSR-Flash möglich

**Feature:** FEAT-12 Bestandsverwaltung
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-07
**App URL:** http://localhost:3000

---

## Beschreibung

Die Admin-Seite `/admin/inventory` schützt sich ausschließlich über einen `onMounted`-Hook:

```typescript
onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    await router.push('/login')
    return
  }
  await fetchInventory()
})
```

Das hat zwei Probleme:

1. **SSR-Flash:** Bei Server-Side-Rendering wird die Seite kurz gerendert bevor `onMounted` feuert. Nicht-Admin-Nutzer sehen für einen Moment das leere Inventory-Layout.

2. **API nicht gesondert abgesichert:** Die API `/api/admin/inventory` nutzt `requireAdmin()` korrekt. Aber ein nicht-autorisierter Nutzer, der direkt die URL `/admin/inventory` aufruft, erhält kurz die Seitenstruktur (Header, Nav, leere Tabelle).

Im Vergleich: Andere Admin-Seiten im Projekt sollten via Nuxt-Middleware (`middleware/admin.ts`) geschützt sein.

**Betroffene Datei:** `src/pages/admin/inventory.vue` (Zeile 43-49)

## Steps to Reproduce

1. Als normaler Nutzer (Mitarbeiter) einloggen
2. URL `/admin/inventory` direkt aufrufen
3. Kurz ist das leere Admin-Layout sichtbar, dann Redirect zu `/login`

## Expected Behavior

Sofortiger Server-seitiger Redirect ohne sichtbares Admin-Layout. Alternativ: `definePageMeta({ middleware: 'admin' })` verwenden, falls eine admin-Middleware existiert.

## Actual Behavior

Das Admin-Layout ist kurz (< 100ms) sichtbar vor dem Redirect.

## Root Cause

Verwendung von `onMounted` statt Nuxt Page Middleware für den Auth-Guard.

Lösung: `definePageMeta({ middleware: 'admin' })` am Seitenanfang verwenden oder die bestehende Middleware aus anderen Admin-Seiten übertragen.

## Environment

- Browser: Chrome, Firefox, Safari
- Device: Desktop
- OS: macOS

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-5 (Admin-Basis): Andere Admin-Seiten haben möglicherweise denselben Schutz-Mechanismus

---

## Attachments

- Logs: Keine
- Screenshots: Keine
