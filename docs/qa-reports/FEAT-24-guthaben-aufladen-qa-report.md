# FEAT-24 QA Report — Guthaben aufladen & Zahlungsmethode

**Tested:** 2026-03-13
**App URL:** http://localhost:3000
**QA Engineer:** QA Engineer Agent

---

## Ergebnis: NOT Production Ready (1 offener Bug: Medium/Should Fix)

---

## Unit-Tests

**Command:** `npm test -- --run`

| Test-Suite | Tests | Passing | Failing |
|------------|-------|---------|---------|
| useCreditNumpad.test.ts | 42 | 42 | 0 |
| Alle weiteren Suites (20 Dateien) | 356 | 335 + 21 skip | 0 |
| **GESAMT** | **398** | **377 passing** | **0** |

**Coverage useCreditNumpad.ts:** 94% Statements, 83% Branches, 100% Functions, 100% Lines

**Status:** Alle Unit-Tests bestanden

---

## E2E-Tests

**Command:** `npx playwright test --reporter=list`

| Test-Suite | Tests | Passing | Failing | Skipped |
|------------|-------|---------|---------|---------|
| feat24-guthaben-aufladen.spec.ts | 16 | 16 | 0 | 0 |
| accessibility.spec.ts | 7 | 5 | 0 | 2 |
| admin-ohne-guthaben.spec.ts | 10 | 8 | 0 | 2 |
| admin-settings.spec.ts | 15 | 15 | 0 | 0 |
| app.spec.ts | 8 | 7 | 0 | 1 |
| feat-11-bestellabholung.spec.ts | 8 | 3 | 0 | 5 |
| feat-13-notifications.spec.ts | 11 | 8 | 0 | 3 |
| offers-slider.spec.ts | 7 | 7 | 0 | 0 |
| offers.spec.ts | 13 | 12 | 0 | 1 |
| profile.spec.ts | 14 | 14 | 0 | 0 |
| purchase.spec.ts | 5 | 0 | 0 | 5 |
| **GESAMT** | **116** | **96** | **0** | **20** |

(20 geskippte Tests aus früheren Features — keine neue Regression, unverändert)

**Status:** Alle E2E-Tests bestanden

---

## Acceptance Criteria Status

| AC | Status | Notes |
|----|--------|-------|
| AC-1 | ✅ | Kreditkarten-Icon in ProfileHeader navigiert zu /profile/credit |
| AC-2 | ✅ | Numpad: 1-0-0-0 → 1000 Cent → "10,00 €" korrekt dargestellt |
| AC-3 | ✅ | Button disabled bei 0,00 €; enabled nach erster Zifferneingabe |
| AC-4 | ✅ | POST /api/profile/credit erfolgt; neues Guthaben in Anzeige; Toast; /profile |
| AC-5 | ✅ | "Falsche Zahlungsmethode? Ändern" → /profile/payment |
| AC-6 | ✅ | VISA/MAESTRO, PayPal, Nettogehalt alle sichtbar und auswählbar |
| AC-7 | ✅ | "AUSWAHL SPEICHERN" schreibt localStorage und navigiert zu /profile/credit |
| AC-8 | ✅ | Radio-Input nach erneutem Öffnen auf gespeicherter Methode vorausgewählt |
| AC-9 | ✅ | Unauthentifiziert → /login; Middleware + onMounted-Guard beide greifen |
| AC-10 | ⚠️ | Tab-Bar sichtbar und Profil-Tab aktiv — BUG-FEAT24-001: DOM enthält doppeltes Nav-Element auf /profile/payment |

---

## Edge Cases Status

| EC | Status | Notes |
|----|--------|-------|
| EC-1 | ✅ | MAX_CENTS = 999999 (9.999,99 €) wird korrekt dargestellt; darüber hinaus wird Input abgelehnt |
| EC-2 | ✅ | pressBackspace() bei 0 → bleibt 0, kein Fehler (Unit-Test bestanden) |
| EC-3 | ✅ | /profile/credit ohne Session → /login (E2E Test 14 bestanden) |
| EC-4 | ✅ | Admin → /admin (Middleware-Regel + onMounted-Guard, E2E Test 16 bestanden) |

---

## Accessibility (WCAG 2.1)

- ✅ Farbkontrast CTA-Button: ~5.9:1 (besteht AA)
- ✅ aria-live="polite" auf Betragsanzeige
- ✅ role="alert" + aria-live="assertive" auf Toast
- ✅ disabled + aria-disabled="true" auf Aufladen-Button korrekt
- ✅ aria-hidden="true" auf dekorativer "+*#"-Zelle
- ✅ aria-label auf allen 11 Numpad-Tasten
- ✅ aria-labelledby + aria-describedby auf Radio-Inputs
- ✅ Touch-Targets Numpad: min-h-[56px] > 44px-Anforderung
- ✅ Touch-Targets Zahlungsoptionen: min-h-[72px] > 44px
- ✅ Focus States: focus:ring-2 auf allen interaktiven Elementen
- ⚠️ BUG-FEAT24-001: Zwei `<nav aria-label="Navigation">` auf /profile/payment

---

## Security Audit

| Check | Status | Detail |
|-------|--------|--------|
| Auth-Check in API | ✅ | getCurrentUser() wirft 401 bei fehlendem/ungültigem Cookie |
| Admin-Guard in API | ✅ | 403 wenn role === 'admin' |
| Input-Validierung | ✅ | amountCents: positiver Integer > 0 erforderlich, sonst 400 |
| Middleware-Schutz | ✅ | /profile/credit + /profile/payment in protectedPaths |
| Admin-Redirect in Middleware | ✅ | Admin → /admin bei beiden Routen |
| Cookie-basierte Auth | ✅ | HttpOnly Cookie, kein localStorage/sessionStorage für Auth |
| DB-Zugriff | ✅ | Nur serverseitig via Drizzle ORM |
| Race Condition Recharge | ℹ️ | Bekannte Demo-Einschränkung: kein DB-Transaction (wie in recharge.post.ts dokumentiert) |

---

## Tech Stack & Code Quality

- ✅ Composition API + `<script setup>` in allen neuen Komponenten
- ✅ TypeScript: PaymentMethod-Union-Type, keine `any`-Verwendung
- ✅ defineProps/defineEmits mit Generics korrekt
- ✅ Kein direkter DOM-Zugriff; SSR-Guard für localStorage
- ✅ Nuxt Routing via `pages/` — kein manueller Vue Router
- ✅ Pinia: kein neuer Store nötig (Composable reicht)
- ✅ DB-Client aus `~/server/db` importiert
- ✅ Drizzle für alle Queries
- ✅ try/catch + createError() in Server Route
- ✅ Auth-Check korrekt implementiert
- ⚠️ payment.vue enthält explizites `<UserTabBar />` — widerspricht Projektkonvention (alle anderen Pages nutzen Layout)

---

## Optimierungen

- Keine kritischen Optimierungsprobleme gefunden.
- `loadBalance()` macht separaten API-Call für Guthaben — notwendig, da Auth-Store kein Guthaben cached.
- `useCreditNumpad` ist ein Factory-Composable (jeder Aufruf erzeugt eigenen State) — korrekt für diese Verwendung.

---

## Regression

- ✅ Alle 80 pre-existing passing E2E-Tests weiterhin bestanden
- ✅ profile.spec.ts: 14/14 Tests nach dem Verschieben von profile.vue → profile/index.vue
- ✅ auth.global.ts-Änderungen: Keine bestehenden Routes beeinträchtigt

---

## Gefundene Bugs

| Bug-ID | Titel | Severity | Priority |
|--------|-------|----------|----------|
| BUG-FEAT24-001 | Doppelte Tab-Bar auf /profile/payment | Medium | Should Fix |

---

## UX-Empfehlung

**Soll UX Expert nochmals prüfen?** Nein

**Begründung:** Der gefundene Bug ist technischer Natur (DOM-Duplikat) und hat keine visuellen UX-Auswirkungen — beide TabBars überlagern sich an identischer Position. Alle UX-Vorgaben aus dem UX Expert Review (aria-live, Numpad-Tastergroesse, Touch-Targets, Beschreibungstexte, Disabled-State) wurden korrekt umgesetzt. Eine erneute UX-Prüfung ist nicht notwendig.

---

## Entscheidung

**NOT Production Ready** — wegen BUG-FEAT24-001 (Medium/Should Fix).

Die Kernfunktionalität (Aufladen, Zahlungsmethode, Auth-Schutz) ist vollständig und korrekt implementiert. Der Bug hat keine Auswirkung auf die Funktionalität, aber das duplizierte Nav-Landmark ist ein WCAG-Problem. Empfehlung: Fix (1 Zeile in payment.vue entfernen), dann re-testen.
