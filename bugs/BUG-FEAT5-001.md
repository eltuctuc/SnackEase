# BUG-FEAT5-001: Middleware leitet Mitarbeiter bei /admin-Zugriff zu /login statt /dashboard

**Feature:** FEAT-5 Admin-Basis
**Severity:** Medium
**Priority:** Should Fix
**Status:** Offen
**Gefunden am:** 2026-03-04
**App URL:** http://localhost:3000

---

## Beschreibung

Gemas FEAT-5 Edge Case EC-1 soll ein Nicht-Admin-User der versucht /admin aufzurufen zu /dashboard weitergeleitet werden. Die aktuelle Middleware leitet stattdessen zu /login weiter. Dies ist verwirrend fur eingeloggte Mitarbeiter.

---

## Steps to Reproduce

1. Als Mitarbeiter einloggen (z.B. nina@demo.de / demo123)
2. URL manuell auf /admin andern (z.B. direkt in die Adressleiste tippen)
3. Middleware greift - aber leitet zu /login weiter

---

## Expected Behavior

Gemas FEAT-5 EC-1: Nicht-Admin versucht /admin -> Redirect zu /dashboard

```typescript
// Erwartet in middleware/auth.global.ts:
if (adminPaths.some(p => to.path.startsWith(p)) && authStore.user.role !== 'admin') {
  return navigateTo('/dashboard')  // <-- Mitarbeiter zum Dashboard
}
```

---

## Actual Behavior

```typescript
// Tatsachlich in middleware/auth.global.ts (Zeile 26):
if (adminPaths.some(p => to.path.startsWith(p)) && authStore.user.role !== 'admin') {
  return navigateTo('/login')  // <-- Mitarbeiter zum Login (falsch!)
}
```

Ein eingeloggter Mitarbeiter wird zum Login weitergeleitet, obwohl er bereits eingeloggt ist. Das fuhrt zu einem schlechten UX-Erlebnis und ist irreführend.

---

## Environment

- Browser: Code-Review (static analysis)
- Device: Desktop
- OS: macOS

---

## Abhangigkeiten

### Zu anderen Features
- FEAT-5: Acceptance Criteria und Edge Case EC-1 direkt betroffen
