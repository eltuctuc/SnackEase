# BUG-FEAT9-001: FEAT-9 nicht implementiert - Admin sieht Guthaben-UI im Dashboard

**Feature:** FEAT-9 Admin ohne Guthaben
**Severity:** Critical
**Priority:** Must Fix
**Status:** Offen
**Gefunden am:** 2026-03-04
**App URL:** http://localhost:3000

---

## Beschreibung

FEAT-9 ("Admin ohne Guthaben") hat Status "Ready for Solution Architect" - es wurde noch nicht implementiert. Der Admin kann sich am Dashboard einloggen und sieht dort die vollstandige BalanceCard mit Auflade-Buttons und Monatspauschale-Button. Daruber hinaus fehlen die geforderten 403-Checks in den Credits-API-Routen fur Admin-User.

Dies ist die fehlende Implementierung fur BUG-FEAT4-001 (Admin sieht Guthaben).

---

## Betroffene Dateien

### Frontend (dashboard.vue)
- `src/pages/dashboard.vue` - BalanceCard wird ohne Rollen-Prufung fur alle User gerendert (Zeile 324-335)
- Kein `v-if="authStore.isMitarbeiter"` oder `v-if="!authStore.isAdmin"` um BalanceCard zu verstecken

### Backend (Credits-APIs)
- `src/server/api/credits/balance.get.ts` - Kein Admin-Rollen-Check (nur Login-Check via `getCurrentUser`)
- `src/server/api/credits/recharge.post.ts` - Kein Admin-Rollen-Check
- `src/server/api/credits/monthly.post.ts` - Kein Admin-Rollen-Check

---

## Steps to Reproduce

1. Als Admin einloggen: admin@demo.de / admin123
2. Nach Login auf /dashboard navigieren
3. Dashboard ladt vollstandig - BalanceCard ist sichtbar
4. Admin sieht Guthaben-Stand, "Guthaben aufladen" Button und "Monatspauschale +25 Euro" Button
5. Admin kann Guthaben aufladen (API-Call wird akzeptiert, kein 403)
6. Admin kann Monatspauschale abrufen (API-Call wird akzeptiert, kein 403)

---

## Expected Behavior

Gemas FEAT-9 Acceptance Criteria:
- Admin-Dashboard zeigt KEINE Guthaben-Karte (REQ-4)
- API /api/credits/balance gibt 403 fur Admin zuruck (REQ-5 / AC-2)
- API /api/credits/recharge gibt 403 fur Admin zuruck (AC-3)
- API /api/credits/monthly gibt 403 fur Admin zuruck (AC-4)

---

## Actual Behavior

- Admin sieht vollstandige BalanceCard mit Guthaben-Stand
- Admin kann Guthaben aufladen (API akzeptiert den Request)
- Admin kann Monatspauschale abrufen (API akzeptiert den Request)
- Credits-APIs geben kein 403 fur Admin-User zuruck

---

## Root Cause

FEAT-9 wurde noch nicht implementiert. Der Status in der Feature-Datei lautet "Ready for Solution Architect" - d.h. weder Solution Architect noch Developer haben dieses Feature bearbeitet.

### Konkrete Implementierungslucken:

**1. dashboard.vue (Zeile 324-335):**
```html
<!-- FEHLT: v-if="!authStore.isAdmin" oder v-if="authStore.isMitarbeiter" -->
<div class="grid gap-6 mb-8">
  <BalanceCard ... />  <!-- Sichtbar fur alle User inkl. Admin! -->
</div>
```

**2. Credits-APIs fehlen Admin-Check:**
```typescript
// balance.get.ts, recharge.post.ts, monthly.post.ts
// FEHLT nach getCurrentUser():
// if (user.role === 'admin') {
//   throw createError({ statusCode: 403, message: 'Admin hat kein Guthaben' })
// }
```

---

## Environment

- Browser: Code-Review (static analysis)
- Device: Desktop
- OS: macOS

---

## Abhangigkeiten

### Zu anderen Bugs
- BUG-FEAT4-001: Gleiche Problematik - Admin sieht Guthaben. Dieser Bug ist die fehlende Implementierung.

### Zu anderen Features
- FEAT-9: Dieses Bug dokumentiert den nicht-implementierten Zustand von FEAT-9
- FEAT-4: FEAT-4 hat BUG-FEAT4-001 offen, das durch FEAT-9-Implementierung behoben werden soll

---

## Attachments

- Logs: Keine (Code-Review-Fund)
