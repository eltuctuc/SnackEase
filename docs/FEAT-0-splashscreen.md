# Splashscreen mit Preloading

**Feature-ID:** FEAT-0  
**Status:** ✅ Abgeschlossen  
**Getestet am:** 2026-02-27

---

## Zusammenfassung

Der Splashscreen ist der erste Bildschirm beim Start der SnackEase App. Er zeigt ein Logo, einen Slogan und einen Ladebalken. Währenddessen werden alle Programmdaten (Styles, Komponenten, Seiten) im Hintergrund vorgeladen. Nach mindestens 3 Sekunden werden Benutzer je nach Login-Status weitergeleitet: Eingeloggte zum Dashboard, nicht Eingeloggte zur Login-Seite.

---

## Was wurde gemacht

### Hauptfunktionen
- **Splashscreen** mit SnackEase Logo und Slogan
- **Progress Bar** zeigt Ladefortschritt (0-100%)
- **Preloading** aller Seiten (Login, Dashboard) für schnelle Navigation
- **Automatische Weiterleitung** nach 3 Sekunden
- **Login-Status Prüfung** via LocalStorage
- **Auth-Middleware** schützt das Dashboard

### Benutzer-Flow
1. User öffnet die App
2. Splashscreen erscheint mit Logo + Slogan
3. Progress Bar zeigt Ladefortschritt
4. Nach min. 3 Sekunden: automatische Weiterleitung
5. Eingeloggte User → Dashboard
6. Nicht eingeloggte User → Login-Seite

---

## Wie es funktioniert

### Für Benutzer
Beim Öffnen der App sieht der Benutzer den SnackEase-Splashscreen mit einem Ladebalken. Der Bildschirm bleibt mindestens 3 Sekunden sichtbar, damit die App genug Zeit hat, alle Komponenten im Hintergrund zu laden. Danach wird automatisch weitergeleitet - eingeloggte Benutzer zum Dashboard, alle anderen zur Login-Seite.

### Technische Umsetzung
- **Nuxt Pages:** `/` (Splashscreen), `/login`, `/dashboard`
- **LocalStorage:** Speichert Login-Status (`isLoggedIn`)
- **Dynamische Imports:** `import('~/pages/login.vue')` lädt Komponenten vor
- **Middleware:** `auth.global.ts` schützt Dashboard-Route

**Verwendete Technologien:**
- Nuxt 3 (Vue 3)
- LocalStorage API
- TypeScript

---

## Abhängigkeiten

- Keine externen Abhängigkeiten
- Erstes Feature der App

---

## Getestet

- ✅ Acceptance Criteria: Alle 9 bestanden
- ✅ Edge Cases: Alle 5 bestanden
- ✅ Accessibility: WCAG 2.1 konform
- ✅ Security: 1 Low-Severity Bug (nicht kritisch für MVP)
- ✅ Regression: Keine (erstes Feature)

---

## Bekannte Einschränkungen

- **Auth-Middleware** läuft nur client-seitig. Für vollständige Sicherheit sollte später ein serverseitiger Auth-Check implementiert werden (z.B. via Cookie/Session).

---

## Nächste Schritte

- FEAT-1: User Authentication (Login/Register)
- FEAT-2: Guthaben-System
