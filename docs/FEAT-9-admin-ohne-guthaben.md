# Admin ohne Guthaben

**Feature-ID:** FEAT-9
**Status:** Abgeschlossen
**Getestet am:** 2026-03-04

---

## Zusammenfassung

Das Feature stellt sicher, dass der Admin-Account (admin@demo.de) vollstaendig vom Guthaben-System getrennt ist. Admins haben kein persoenliches Guthaben-Konto, sehen keine Guthaben-Karte im Dashboard und koennen keine Guthaben-APIs aufrufen. Stattdessen erhaelt der Admin einen informativen Banner mit einem direkten Link zum Admin-Bereich.

---

## Was wurde gemacht

### Hauptfunktionen

- Admin sieht im Dashboard einen AdminInfoBanner (blaues Info-Panel) statt der Guthaben-Karte
- Alle drei Credits-APIs (balance, recharge, monthly) geben 403 zurueck wenn ein Admin sie aufruft
- Das Dashboard laedt fuer Admin nur den Produktkatalog – kein Guthaben-API-Call wird ausgeloest
- Mitarbeiter sind von dieser Aenderung nicht betroffen und sehen weiterhin ihre Guthaben-Karte

### Benutzer-Flow (Admin)

1. Admin loggt sich ein mit admin@demo.de
2. Dashboard oeffnet sich – fetchBalance() wird NICHT aufgerufen
3. Statt der Guthaben-Karte erscheint ein blauer AdminInfoBanner
4. Der Banner erklaert: "Als Admin verfuegst du ueber kein persoenliches Guthaben-Konto."
5. Ein Button "Zum Admin-Bereich" fuehrt direkt zu /admin

### Benutzer-Flow (Mitarbeiter – unveraendert)

1. Mitarbeiter loggt sich ein
2. Dashboard laedt Guthaben (fetchBalance()) und Produktkatalog parallel
3. Guthaben-Karte erscheint mit aktuellem Stand, Auflade-Buttons und Monatspauschale-Button
4. Normaler Kauf-Flow weiterhin verfuegbar

---

## Wie es funktioniert

### Fuer Benutzer

Der Admin sieht im Dashboard an der Stelle der Guthaben-Karte einen neutralen blauen Infokasten. Dieser erklaert, dass das Guthaben-System nur fuer Mitarbeiter gilt. Ein Button fuehrt direkt zum Admin-Bereich. Der Produktkatalog bleibt sichtbar (zur Uebersicht), Kauf-Buttons sind fuer Admin nicht relevant.

Wenn ein Admin versucht, die Credits-API direkt aufzurufen (z.B. via Browser-Entwicklertools oder curl), erhaelt er einen 403-Fehler mit der Meldung "Admin hat kein Guthaben".

### Technische Umsetzung

Das Feature setzt auf zwei unabhaengige Schutzebenen:

**Ebene 1 – Frontend (dashboard.vue):**
```
if (authStore.isAdmin) {
  // Nur Produktkatalog laden – kein fetchBalance()
  await productsStore.fetchProducts()
} else {
  // Mitarbeiter: beides parallel laden
  await Promise.all([creditsStore.fetchBalance(), productsStore.fetchProducts()])
}
```
Im Template: `<AdminInfoBanner v-if="authStore.isAdmin" />` vs. `<BalanceCard v-else ... />`

**Ebene 2 – Backend (alle 3 Credits-API-Routen):**
```typescript
const user = await getCurrentUser(event)
if (user.role === 'admin') {
  throw createError({ statusCode: 403, message: 'Admin hat kein Guthaben' })
}
```

**Verwendete Technologien:**
- Vue 3 Composition API mit `<script setup>`
- Pinia Store (authStore.isAdmin Computed Property)
- Nuxt 3 Server Routes mit H3 createError()
- Drizzle ORM fuer DB-Queries
- Tailwind CSS fuer AdminInfoBanner-Styling

---

## AdminInfoBanner-Komponente

Die neue Komponente `src/components/dashboard/AdminInfoBanner.vue` ist vollstaendig selbststaendig (keine Props, keine Emits). Sie enthaelt:

- SVG Info-Icon (kein Emoji – WCAG-konform)
- Titel "Admin-Modus aktiv"
- Erklaerungstext (2 Saetze)
- CTA-Button "Zum Admin-Bereich" → NuxtLink zu /admin
- Identische Rahmen-Optik wie BalanceCard (rounded-lg, border-2, p-6)
- Blaue Einfaerbung (bg-blue-50, border-blue-200, text-blue-800)
- Vollstaendige WCAG 2.1 Accessibility-Attribute

---

## Abhangigkeiten

- FEAT-4 (Demo-Guthaben) – FEAT-9 baut auf dem Credits-System auf und erweitert es um Admin-Trennung. BUG-FEAT4-001 ("Admin sieht Guthaben") wurde durch FEAT-9 behoben.
- FEAT-5 (Admin-Basis) – Admin-Rolle und Admin-Dashboard sind Voraussetzung

---

## Getestet

- ✅ Acceptance Criteria: Alle 6 bestanden
- ✅ Edge Cases: Alle 4 bestanden
- ✅ Unit-Tests: 13 AdminInfoBanner-Tests, 5 isAdmin-Tests, 9 Credits-Logic-Tests – alle gruен
- ✅ Code Review: Composition API, kein any, Drizzle ORM, korrekte Error-Handler
- ✅ Accessibility: WCAG 2.1 konform (Kontrast 7.8:1, role="region", aria-labels, Focus-States)
- ✅ Security: Doppelter Schutz – Frontend und API-Ebene unabhaengig voneinander
- ✅ Regression: Mitarbeiter-Pfad unveraendert, alle bestehenden Tests bestehen

---

## Bekannte Einschraenkungen

- **BUG-FEAT9-002 (Low):** Waehrend des Ladens zeigt der Skeleton eine BalanceCard-Form an, auch fuer Admin. Nach dem Laden erscheint korrekt der AdminInfoBanner. Dies ist ein kurzzeitiger visueller Mangel ohne funktionale Auswirkung.
- **BUG-TESTING-001 (High, bestehendes Problem):** Store-Integration-Tests sind deaktiviert (describe.skip) wegen fehlendem Pinia-Mock in Vitest. Gesamt-Coverage 10% statt Ziel 80%.

---

## Naechste Schritte

- BUG-FEAT9-002 beheben: Skeleton-Loading fuer Admin anpassen (Low-Prio)
- BUG-TESTING-001 beheben: Echte Store-Tests mit Pinia-Setup implementieren
- Produkt-Grid fuer Admin optional einschraenken: Kein Kauf-Button im ProductDetailModal fuer Admin

---

## Kontakt

Bei Fragen zu diesem Feature: Developer Agent / QA Engineer
