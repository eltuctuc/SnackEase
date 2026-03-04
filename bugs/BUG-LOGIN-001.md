# BUG-LOGIN-001: Admin-Login leitet zu /dashboard statt /admin weiter

**Feature:** FEAT-1 / FEAT-3 Admin Authentication / User Switcher
**Severity:** Medium
**Priority:** Should Fix
**Status:** Offen
**Gefunden am:** 2026-03-04
**App URL:** http://localhost:3000

---

## Beschreibung

Nach erfolgreichem Admin-Login wird der Admin zu `/dashboard` statt `/admin` weitergeleitet. Das ist nicht der optimale Flow fur einen Admin - er muss manuell zum Admin-Bereich navigieren. Zusatzlich wird `window.location.href` statt Nuxt's `navigateTo()` verwendet, was den SSR-Kontext umgeht und kein korrektes Nuxt-Routing darstellt.

---

## Betroffene Datei

`src/pages/login.vue` (Zeile 61):
```javascript
window.location.href = '/dashboard'  // Feste Weiterleitung zu /dashboard fur alle User
```

---

## Steps to Reproduce

1. /login aufrufen
2. Admin-Karte auswahlen (admin@demo.de)
3. Passwort admin123 eingeben
4. "Anmelden" klicken
5. Nach 500ms Weiterleitung zu /dashboard (nicht /admin)

---

## Expected Behavior

- Admin-User (role='admin') wird nach Login zu `/admin` weitergeleitet
- Mitarbeiter-User (role='mitarbeiter') werden wie bisher zu `/dashboard` weitergeleitet
- Verwendung von `navigateTo()` statt `window.location.href` fur korrektes Nuxt-Routing

---

## Actual Behavior

Alle User werden zu `/dashboard` weitergeleitet, unabhangig von ihrer Rolle.

```javascript
// login.vue Zeile 59-62:
if (result.success) {
  setTimeout(() => {
    window.location.href = '/dashboard'  // Immer /dashboard, nie /admin!
  }, 500)
}
```

---

## Security Note

`window.location.href` ist ein Hard-Redirect, der:
- Den Nuxt-Router-State umgeht
- Das Server-Side-Rendering-Lifecycle unterbricht
- Nicht idiomatisches Nuxt 3 ist (sollte `navigateTo()` sein)

Das ist technisch funktional, aber Tech-Stack-Compliance verletzt.

---

## Environment

- Browser: Code-Review (static analysis)
- Device: Desktop
- OS: macOS

---

## Abhangigkeiten

### Zu anderen Features
- FEAT-1: Admin Authentication
- FEAT-3: User Switcher - Login Flow
