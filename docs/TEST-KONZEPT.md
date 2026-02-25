# SnackEase Test-Konzept

## Übersicht

Dieses Dokument beschreibt das Test-Konzept für SnackEase basierend auf der Testpyramide.

---

## Testpyramide

```
           /\
          /  \         E2E Tests (wenige, kritische Flows)
         /    \
        /------\       Integration Tests (Business Logic)
       /        \
      /----------\     Unit Tests (viele, basis)
```

### Ebene 1: Unit Tests (Basis)

**Ziel:** Einzelne Funktionen, Komponenten isoliert testen

**Tools:**
- Vitest (für Vue.js)
- Vue Test Utils

**Was wird getestet:**
- Pinia Stores (userStore, productStore)
- Utility-Funktionen (Guthaben-Berechnung, Bonuspunkte)
- Einzelne Vue-Komponenten

**Beispiele:**
```typescript
// Guthaben-Berechnung
test('Bonuspunkte für Obst = 3', () => {
  expect(getHealthPoints('obst')).toBe(3)
})

// User Store
test('switchUser ändert currentUser', () => {
  store.switchUser('nina@demo.de')
  expect(store.currentUser.email).toBe('nina@demo.de')
})
```

---

### Ebene 2: Integration Tests

**Ziel:** Zusammenspiel mehrerer Komponenten testen

**Tools:**
- Vitest + Vue Test Utils
- Testing Library

**Was wird getestet:**
- Login-Flow (Formular → Auth → Redirect)
- Kauf-Flow (Produkt → Kauf → Guthaben-Abzug)
- Admin-Reset-Flow

**Beispiele:**
```typescript
test('Login mit gültigen Credentials', async () => {
  render(LoginView)
  
  await fireEvent.input(emailInput, 'nina@demo.de')
  await fireEvent.input(passwordInput, 'demo123')
  await fireEvent.click(submitButton)
  
  expect(router.push).toHaveBeenCalledWith('/')
})
```

---

### Ebene 3: E2E Tests (End-to-End)

**Ziel:** Kritische User-Journeys durchtesten

**Tools:**
- Playwright

**Was wird getestet:**
1. **Admin Journey:**
   - Login als Admin → Admin-Dashboard → Nutzer anlegen → Logout

2. **Demo-User Journey:**
   - Login als Nina → Produkt kaufen → Guthaben reduziert → Logout

3. **User-Switch Journey:**
   - Login als Nina → Kauf → Logout → Login als Maxine → Andere Daten

**Test-Szenarien:**
```typescript
test('Vollständiger Kauf-Flow', async () => {
  // 1. Als Nina einloggen
  await page.goto('/login')
  await page.fill('[data-testid=email]', 'nina@demo.de')
  await page.fill('[data-testid=password]', 'demo123')
  await page.click('[data-testid=login-btn]')
  
  // 2. Produkt kaufen
  await page.click('[data-testid=buy-apfel]')
  
  // 3. Guthaben reduziert
  const credit = await page.textContent('[data-testid=credit]')
  expect(credit).toBe('20€') // 25 - 5
  
  // 4. Kauf in Historie
  await page.click('[data-testid=history-tab]')
  await expect(page.locator('.purchase-item')).toContainText('Apfel')
})
```

---

## Test Coverage Matrix

| Feature | Unit | Integration | E2E |
|---------|------|-------------|-----|
| Admin Login | ✅ | ✅ | ✅ |
| Demo User Login | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| User Switch | - | ✅ | ✅ |
| Guthaben anzeigen | ✅ | ✅ | ✅ |
| Guthaben aufladen | ✅ | ✅ | ✅ |
| Produktkatalog | ✅ | ✅ | ✅ |
| One-Touch Kauf | ✅ | ✅ | ✅ |
| Leaderboard | ✅ | ✅ | ✅ |
| Admin Reset | ✅ | ✅ | ✅ |

---

## Test Execution Plan

### 1. Vor jedem Commit (Local)
```bash
npm run test:unit     # Unit Tests
npm run test:lint     # Linting
```

### 2. Vor Merge (CI/CD)
```bash
npm run test:unit     # Unit Tests
npm run test:e2e      # E2E Tests (Playwright)
npm run build         # Produktions-Build
```

### 3. Regelmäßig (Nightly/Weekly)
- Full E2E Test Suite
- Performance Tests
- Accessibility Tests

---

## Test-Daten

### Demo-Nutzer (für Tests)

| Email | Passwort | Rolle |
|-------|----------|-------|
| admin@demo.de | demo123 | Admin |
| nina@demo.de | demo123 | Demo-User (Nina) |
| maxine@demo.de | demo123 | Demo-User (Maxine) |
| lucas@demo.de | demo123 | Demo-User (Lucas) |
| alex@demo.de | demo123 | Demo-User (Alex) |
| tom@demo.de | demo123 | Demo-User (Tom) |

### Test-Produkte

| Name | Preis | Kategorie |
|------|------|-----------|
| Apfel | 1,50€ | Obst |
| Bananen-Riegel | 2,50€ | Proteinriegel |
| Schoko-Riegel | 1,80€ | Schokoriegel |
| Cashew-Nüsse | 3,00€ | Nüsse |
| Orangen-Saft | 2,20€ | Getränke |

---

## Definition of Done (DoD)

Ein Feature gilt als getestet wenn:

- [ ] Alle Unit Tests bestanden
- [ ] Alle Integration Tests bestanden  
- [ ] Alle relevanten E2E Szenarien bestanden
- [ ] Keine neuen Accessibility Issues (WCAG 2.1)
- [ ] Keine Regression (bestehende Tests bestehen)
- [ ] Code Coverage > 70%

---

## Bugs dokumentieren

Gefundene Bugs werden in `./bugs/` dokumentiert:
- `bugs/FEAT-X-bugs.md` - Feature-spezifische Bugs
- `bugs/general-bugs.md` - Allgemeine Bugs

---

## Weiteres

### Performance Tests
- Lighthouse CI für Performance-Metriks
- Core Web Vitals prüfen

### Accessibility Tests
- axe-core für automatische A11y-Tests
- Manuelle Screen Reader Tests

### Security Tests
- Input Validation Tests
- Auth-Flow Tests
