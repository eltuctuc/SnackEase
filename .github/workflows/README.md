# CI/CD Pipeline

## Übersicht

Diese Pipeline automatisiert:
- **Lint & Typecheck** - Code-Qualitätsprüfung
- **Unit Tests** - 80%+ Coverage-Ziel
- **E2E Tests** - Playwright Browser-Tests
- **Build** - Production-Build
- **Deploy** - Automatisches Deployment zu Vercel (nur main-Branch)

## Jobs

### 1. Lint & Typecheck
- TypeScript-Typprüfung mit `nuxt typecheck`
- ESLint (optional)

### 2. Unit Tests
- Vitest mit Coverage-Report
- Codecov-Upload für Coverage-Tracking

### 3. E2E Tests
- Playwright Tests
- Browser: Chromium
- Reports werden als Artifact hochgeladen

### 4. Build
- Production-Build mit `nuxt build`
- Build-Artifacts werden gespeichert

### 5. Deploy (nur main)
- Deployment zu Vercel
- Requires secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

## Secrets einrichten

### Vercel
1. Vercel Token erstellen: https://vercel.com/account/tokens
2. Org ID und Project ID aus Vercel Dashboard
3. GitHub Secrets konfigurieren:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID` 
   - `VERCEL_PROJECT_ID`

## Lokal ausführen

```bash
# Lint & Typecheck
npm run typecheck

# Unit Tests
npm run test:coverage

# E2E Tests
npm run test:e2e

# Build
npm run build
```

## Trigger

- **Push** auf `main` oder `develop`: Alle Tests + Build
- **Pull Request** auf `main`: Alle Tests + Build
- **Push auf main**: + Deployment zu Vercel
