# SnackEase - Development-Probleme und Lösungen

**Erstellt:** 2026-03-04  
**Zweck:** Dokumentation häufiger Probleme bei `npm run dev`

---

## Problem 1: "Unable to find an available port (tried 3000)"

### Symptom
```bash
npm run dev
→ [get-port] Unable to find an available port (tried 3000 on host "localhost"). 
→ Using alternative port 3001.
```

### Ursache
Port 3000 ist bereits belegt, weil:
1. **Vorheriger `npm run dev` läuft noch** (nicht sauber beendet)
2. **Anderer Dev-Server nutzt Port 3000** (z.B. React, Next.js)
3. **Prozess hängt** nach Ctrl+C

### Lösung

#### Option 1: Port freigeben (Empfohlen)
```bash
# Finde Prozess auf Port 3000
lsof -ti:3000

# Stoppe Prozess
lsof -ti:3000 | xargs kill -9

# Oder: Alle Nuxt-Prozesse stoppen
pkill -9 -f "nuxt|node.*dev"
```

#### Option 2: Anderen Port nutzen
```bash
# In package.json oder direkt:
PORT=3001 npm run dev

# Oder nuxt.config.ts:
export default defineNuxtConfig({
  devServer: {
    port: 3001
  }
})
```

#### Option 3: Clean-Start
```bash
# Cache löschen und neu starten
rm -rf .nuxt .output node_modules/.vite
npm run dev
```

---

## Problem 2: Vite Pre-transform Error "#app-manifest"

### Symptom
```bash
ERROR Pre-transform error: Failed to resolve import "#app-manifest" 
from "node_modules/nuxt/dist/app/composables/manifest.js"
```

### Ursache
- **Development-Warnung von Nuxt 3.21+**
- Tritt bei `if (false)` Code-Branches auf
- **Nicht kritisch** - Code wird nie ausgeführt
- Bekanntes Nuxt-Problem: https://github.com/nuxt/nuxt/issues/...

### Lösung

#### Option 1: Ignorieren (Empfohlen)
```bash
# Server funktioniert trotz Warnung!
# Keine Action nötig
```

#### Option 2: Cache löschen
```bash
rm -rf .nuxt node_modules/.vite
npm run dev
```

#### Option 3: Nuxt updaten
```bash
npm update nuxt @nuxt/devtools
```

**Status:** ⚠️ Bekannte Warnung, nicht kritisch

---

## Problem 3: "No transactions support in neon-http driver"

### Symptom
```bash
POST /api/credits/recharge
→ Error 500: "No transactions support in neon-http driver"
```

### Ursache
```typescript
// src/server/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';  // ← HTTP-Driver

// Transactions funktionieren NICHT:
await db.transaction(async (tx) => { ... })
```

**neon-http vs neon-serverless:**

| Feature | neon-http | neon-serverless |
|---------|-----------|-----------------|
| **Transactions** | ❌ NEIN | ✅ JA |
| **Connection** | HTTP (stateless) | WebSockets |
| **Use Case** | Edge Functions | Serverless Functions |
| **Vercel** | ✅ Optimal | ⚠️ Kann Probleme machen |

### Lösung

#### Option 1: Ohne Transactions arbeiten (AKTUELL)
```typescript
// Race Condition-Risiko akzeptieren
const credits = await db.select()...
const newBalance = currentBalance + amount
await db.update(userCredits).set({ balance: newBalance })...
```
⚠️ **Risiko:** Parallele Requests können sich überschreiben

#### Option 2: Auf neon-serverless wechseln (EMPFOHLEN für Production)
```typescript
// src/server/db/index.ts
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

// Jetzt funktionieren Transactions:
await db.transaction(async (tx) => {
  // Atomic operations
})
```

**Änderungen:**
```bash
# package.json bleibt gleich (Pool ist in @neondatabase/serverless)
# Nur src/server/db/index.ts ändern
```

#### Option 3: Optimistic Locking
```typescript
// Statt Transactions: Version-basiert
await db.update(userCredits)
  .set({ balance: newBalance, version: version + 1 })
  .where(and(
    eq(userCredits.userId, userId),
    eq(userCredits.version, version)  // Nur wenn Version noch gleich
  ))
```

**Status:** ✅ Gefixt durch Entfernung der Transactions

---

## Problem 4: Mehrere Nuxt-Prozesse laufen parallel

### Symptom
```bash
ps aux | grep nuxt
→ 6 nuxt/node Prozesse gefunden!
```

### Ursache
- `npm run dev` wurde mehrfach gestartet
- Hintergrund-Prozesse (`&`) wurden nicht gestoppt
- Ctrl+C beendet nur Vordergrund-Prozess

### Lösung

#### Alle Nuxt-Prozesse stoppen
```bash
# Variante 1: Gezielt
pkill -9 -f "nuxt"

# Variante 2: Alle Node Dev-Prozesse
pkill -9 -f "node.*dev"

# Variante 3: Nach Port
lsof -ti:3000,3001 | xargs kill -9

# Bestätigung
ps aux | grep nuxt | grep -v grep
→ (leer = alle gestoppt)
```

---

## Problem 5: HMR (Hot Module Reload) funktioniert nicht

### Symptom
- Änderungen werden nicht live übernommen
- Muss Server immer neu starten

### Ursache
1. **Cache-Problem** - .nuxt/ ist korrupt
2. **Vite-Config** - HMR deaktiviert
3. **Firewall** - Blockt WebSocket-Verbindungen

### Lösung

#### Option 1: Cache löschen
```bash
rm -rf .nuxt node_modules/.vite
npm run dev
```

#### Option 2: Vite-Config prüfen
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    server: {
      hmr: true,  // Sicherstellen dass aktiviert
      watch: {
        usePolling: true  // Falls Datei-Watching nicht funktioniert
      }
    }
  }
})
```

#### Option 3: Browser-Cache löschen
```bash
# In Browser: Hard Reload
Cmd+Shift+R (Mac) oder Ctrl+Shift+R (Windows)
```

---

## Problem 6: TypeScript-Fehler blockieren Start

### Symptom
```bash
npm run dev
→ ERROR: Type error in src/...
→ Server startet nicht
```

### Ursache
- **Strict TypeScript** aktiviert
- Type-Errors in Code

### Lösung

#### Option 1: Errors fixen (Empfohlen)
```bash
# Type-Errors anzeigen
npm run dev  # Zeigt Fehler

# Oder separat:
npx vue-tsc --noEmit
```

#### Option 2: TypeScript temporär deaktivieren
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    strict: false,
    typeCheck: false  // Deaktiviert Type-Checking beim Dev
  }
})
```

---

## Problem 7: Module nicht gefunden

### Symptom
```bash
npm run dev
→ Error: Cannot find module '@neondatabase/serverless'
```

### Ursache
- **node_modules/** fehlt oder korrupt
- **package-lock.json** out of sync

### Lösung

#### Clean Install
```bash
# Alles löschen
rm -rf node_modules package-lock.json .nuxt .output

# Neu installieren
npm install

# Dev starten
npm run dev
```

---

## Best Practices für `npm run dev`

### 1. Sauberer Start (Empfohlen)
```bash
#!/bin/bash
# Script: dev-clean.sh

# Alte Prozesse stoppen
pkill -9 -f "nuxt|node.*dev"

# Cache löschen
rm -rf .nuxt .output node_modules/.vite

# Starten
npm run dev
```

### 2. Port-Check vor Start
```bash
# Prüfe ob Port frei ist
lsof -ti:3000 && echo "❌ Port 3000 belegt" || echo "✅ Port 3000 frei"

# Bei Bedarf freigeben
lsof -ti:3000 | xargs kill -9

# Dann starten
npm run dev
```

### 3. Prozess-Management
```bash
# Im Hintergrund starten (NICHT empfohlen für Dev)
npm run dev &

# Im Vordergrund (EMPFOHLEN)
npm run dev

# Stoppen: Ctrl+C
# Falls das nicht funktioniert:
pkill -9 -f nuxt
```

### 4. Logs überwachen
```bash
# Mit Log-File
npm run dev 2>&1 | tee dev.log

# Oder in separatem Terminal:
tail -f dev.log
```

---

## Häufigste Probleme - Schnellreferenz

| Problem | Schnell-Fix |
|---------|-------------|
| Port 3000 belegt | `lsof -ti:3000 \| xargs kill -9` |
| Vite-Warnungen | Ignorieren (nicht kritisch) |
| HMR funktioniert nicht | `rm -rf .nuxt && npm run dev` |
| Type-Errors | `npx vue-tsc --noEmit` prüfen |
| Module fehlen | `rm -rf node_modules && npm install` |
| Mehrere Prozesse | `pkill -9 -f nuxt` |
| Server hängt | Ctrl+C, dann `pkill -9 -f nuxt` |

---

## Warum macht Nuxt öfters Probleme?

### Technische Gründe

1. **Komplexe Build-Pipeline**
   - Vite (Frontend)
   - Nitro (Backend)
   - Vue Compiler
   - TypeScript
   - Tailwind JIT
   → 5 Build-Tools gleichzeitig!

2. **File-Watching**
   - Vite watchet 1000+ Dateien
   - macOS File-Descriptor-Limits
   - Manchmal hängt File-Watcher

3. **Hot Module Reload (HMR)**
   - WebSocket-Verbindung zwischen Browser ↔ Server
   - Kann brechen bei Netzwerk-Problemen

4. **Cache-Probleme**
   - `.nuxt/` Cache kann korrupt werden
   - `node_modules/.vite` Cache
   - Browser-Cache

5. **Nuxt 3 ist relativ neu**
   - Noch einige Bugs in 3.21.1
   - Vite 7.3.1 ist sehr neu (Jan 2026)

---

## Empfohlener Workflow

### Täglicher Start
```bash
# 1. Prüfe ob alte Prozesse laufen
ps aux | grep nuxt

# 2. Falls ja, stoppen
pkill -9 -f nuxt

# 3. Clean-Start (nur bei Problemen)
rm -rf .nuxt

# 4. Starten
npm run dev
```

### Bei Problemen
```bash
# Nuclear Option: Alles löschen
pkill -9 -f nuxt
rm -rf .nuxt .output node_modules/.vite
npm run dev
```

### Vor Git-Operationen
```bash
# Server stoppen
Ctrl+C
pkill -9 -f nuxt

# Git-Operationen
git add ...
git commit ...

# Neu starten
npm run dev
```

---

## Monitoring-Script (Optional)

Erstelle `scripts/dev.sh`:
```bash
#!/bin/bash

echo "🧹 Cleaning up old processes..."
pkill -9 -f "nuxt|node.*dev" 2>/dev/null

echo "🔍 Checking ports..."
if lsof -ti:3000 >/dev/null 2>&1; then
  echo "⚠️  Port 3000 still in use, trying 3001..."
fi

echo "🚀 Starting Nuxt Dev Server..."
npm run dev
```

**Nutzung:**
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

---

## Zusammenfassung

### Warum Probleme bei `npm run dev`?

1. ✅ **Mehrere Build-Tools** (Vite, Nitro, Vue, TS, Tailwind)
2. ✅ **File-Watching** komplex
3. ✅ **HMR über WebSockets** kann brechen
4. ✅ **Cache-Probleme** in .nuxt/
5. ✅ **Prozesse bleiben hängen** nach Ctrl+C

### Schnellste Lösung (90% der Fälle)
```bash
pkill -9 -f nuxt && rm -rf .nuxt && npm run dev
```

### Vermeide
❌ Server im Hintergrund starten (`npm run dev &`)  
❌ Mehrere `npm run dev` parallel  
❌ Ctrl+Z statt Ctrl+C (pausiert, beendet nicht)

### Empfohlen
✅ Server im Vordergrund  
✅ Sauber stoppen mit Ctrl+C  
✅ Bei Problemen: Cache löschen  
✅ Vor Git-Ops: Server stoppen

---

**Hinweis:** Diese Probleme sind **normal** für moderne Full-Stack-Frameworks (Nuxt, Next.js, SvelteKit). Der Trade-off für die vielen Features (HMR, SSR, API-Routes, etc.) ist höhere Komplexität.
