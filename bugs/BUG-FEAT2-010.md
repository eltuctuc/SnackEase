# BUG-FEAT2-010: Direkter DOM-Zugriff via document.querySelector in login.vue (Tech Stack Violation)

**Feature:** FEAT-2 Demo User Authentication / FEAT-3 User Switcher
**Severity:** Low
**Priority:** Nice to Fix
**Gefunden am:** 2026-03-05
**App URL:** http://localhost:3000/login

---

## Beschreibung

In `login.vue` wird in der `selectPersona()`-Funktion direkt auf das DOM über `document.querySelector` zugegriffen, um das Passwort-Eingabefeld nach Persona-Auswahl zu fokussieren. Dies verstößt gegen die SnackEase-Tech-Stack-Konventionen (kein direkter DOM-Zugriff — VueUse-Composables oder Template-Refs statt `window`/`document`).

Vue-Best-Practice ist die Verwendung von Template-Refs (`ref=""`) für direkte DOM-Element-Zugriffe, da `document.querySelector` bei SSR nicht verfügbar ist und in Vue generell als Anti-Pattern gilt.

Hinweis: Die Seite hat `definePageMeta({ ssr: false })`, was das SSR-Problem für diesen konkreten Fall verhindert. Dennoch ist es ein Tech-Stack-Verstoß und ein Wartbarkeitsproblem.

## Steps to Reproduce

1. Öffne `src/pages/login.vue`, Zeile 42
2. `const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement`
3. Die Funktion `selectPersona()` nutzt direkte DOM-Abfrage statt Vue Template-Ref

## Expected Behavior

Verwendung eines Vue Template-Refs:
```html
<!-- Template -->
<input ref="passwordInputRef" type="password" ... />
```
```typescript
// Script
const passwordInputRef = ref<HTMLInputElement | null>(null)

const selectPersona = (personaEmail: string) => {
  selectedPersona.value = personaEmail
  email.value = personaEmail
  password.value = personaEmail === 'admin@demo.de' ? 'admin123' : 'demo123'
  nextTick(() => {
    passwordInputRef.value?.focus()
  })
}
```

## Actual Behavior

```typescript
const selectPersona = (personaEmail: string) => {
  // ...
  nextTick(() => {
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    passwordInput?.focus()
  })
}
```

## Tech Stack Compliance

Laut Projekt-Konventionen:
- Kein direkter DOM-Zugriff — VueUse-Composables statt `window`/`document`
- Vue Template-Refs für DOM-Element-Zugriffe

## Betroffene Datei

`src/pages/login.vue`, Zeile 41–44:
```typescript
nextTick(() => {
  const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
  passwordInput?.focus()
})
```

## Environment

- Browser: Alle
- Device: Desktop/Mobile
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keiner

### Zu anderen Features
- FEAT-2: Demo User Authentication
- FEAT-3: User Switcher

---

## Attachments

- Screenshots: —
- Logs: —
