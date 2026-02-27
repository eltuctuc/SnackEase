# Bug Report: FEAT-0 Splashscreen

**Tested:** 2026-02-27
**App URL:** http://localhost:3000
**Tester:** QA Engineer

---

## Zusammenfassung

- **Bugs gefunden:** 1
- **Status:** ✅ Behoben

---

## Bugs

### BUG-1: Auth-Middleware läuft nur client-seitig (BEHOBEN)
- **Severity:** Low → None
- **Status:** ✅ Behoben
- **Fix:** Cookie-basierte Auth mit SSR-Unterstützung implementiert (FEAT-0-auth-ssr)

**Lösung:**
- Pinia Store mit Cookie (`auth_token`)
- `auth.global.ts` prüft Cookie auf Server und Client
- SSR rendert Dashboard nur mit gültigem Cookie

---

## ✅ Alle Bugs behoben

Das SSR-Auth Feature (FEAT-0-auth-ssr) behebt den ursprünglichen Bug.
Die Auth-Middleware läuft jetzt sowohl auf Server als auch Client.
