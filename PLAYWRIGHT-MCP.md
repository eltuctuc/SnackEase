# Playwright MCP Server - Integration

**Status:** ✅ Erfolgreich konfiguriert  
**Version:** @playwright/mcp@latest  
**Datum:** 2026-03-04

---

## Was ist Playwright MCP?

Der **Playwright MCP Server** ist ein Model Context Protocol (MCP) Server, der **Browser-Automation-Fähigkeiten** direkt für LLMs bereitstellt.

### Unterschied: Playwright MCP vs. Playwright CLI

**Es gibt ZWEI verschiedene Playwright-Integrationen:**

| Feature | Playwright CLI + Tests | Playwright MCP Server |
|---------|------------------------|----------------------|
| **Verwendung** | E2E-Tests schreiben & ausführen | LLM kann Browser steuern |
| **Installation** | `npm install @playwright/test` | MCP-Server in OpenCode Config |
| **Zugriff** | Über `npm run test:e2e` | Über OpenCode/LLM-Agent direkt |
| **Use Case** | Testing, CI/CD | LLM-gesteuerte Browser-Automation |
| **Browser** | Headed/Headless Tests | LLM steuert Browser live |

### Was wurde installiert?

#### 1. Playwright für E2E-Tests (bereits erledigt)
```bash
npm install -D @playwright/test
```

**Was es kann:**
- E2E-Tests schreiben (`tests/e2e/*.spec.ts`)
- Tests lokal ausführen (`npm run test:e2e`)
- Screenshots & Traces bei Fehlern
- CI/CD Integration

**Konfiguration:** `playwright.config.ts`

#### 2. Playwright MCP Server (NEU)
```json
{
  "mcp": {
    "playwright": {
      "command": ["npx", "-y", "@playwright/mcp@latest"],
      "enabled": true,
      "type": "local"
    }
  }
}
```

**Was es kann:**
- **LLM kann Browser direkt steuern** 🚀
- Keine Screenshots nötig (nutzt Accessibility Tree)
- LLM-freundlich durch strukturierte Daten
- Deterministische Tool-Anwendung

---

## Wie funktioniert Playwright MCP?

### Traditioneller Ansatz (Screenshot-basiert)
```
User → LLM → Screenshot analysieren → Koordinaten erraten → Click(x, y)
              ❌ Unzuverlässig
              ❌ Token-intensiv
              ❌ Braucht Vision-Model
```

### Playwright MCP Ansatz (Accessibility Tree)
```
User → LLM → Structured Page Snapshot → Click(ref="button-123")
              ✅ Zuverlässig
              ✅ Token-effizient
              ✅ Kein Vision-Model nötig
```

---

## Verfügbare Tools für LLM

Der Playwright MCP Server stellt folgende Tools bereit, die ich (OpenCode) direkt nutzen kann:

### Core Browser-Automation

| Tool | Beschreibung |
|------|--------------|
| `browser_navigate` | Navigiere zu URL |
| `browser_snapshot` | Accessibility-Snapshot der Page |
| `browser_click` | Klicke auf Element (über ref) |
| `browser_type` | Text in Element eingeben |
| `browser_fill_form` | Formular ausfüllen |
| `browser_select_option` | Dropdown-Option wählen |
| `browser_press_key` | Taste drücken |
| `browser_hover` | Hover über Element |
| `browser_drag` | Drag & Drop |
| `browser_evaluate` | JavaScript ausführen |
| `browser_run_code` | Playwright-Code ausführen |

### Navigation & Tabs

| Tool | Beschreibung |
|------|--------------|
| `browser_navigate_back` | Zurück navigieren |
| `browser_tabs` | Tabs verwalten (list, create, close, select) |
| `browser_close` | Browser schließen |

### Debugging & Monitoring

| Tool | Beschreibung |
|------|--------------|
| `browser_take_screenshot` | Screenshot erstellen |
| `browser_console_messages` | Console-Logs abrufen |
| `browser_network_requests` | Netzwerk-Requests auflisten |
| `browser_wait_for` | Warten auf Text/Zeit |

### Dialog-Handling

| Tool | Beschreibung |
|------|--------------|
| `browser_handle_dialog` | Alert/Confirm/Prompt behandeln |
| `browser_file_upload` | Dateien hochladen |

---

## Beispiel-Anwendungsfälle

### 1. Test automatisch schreiben lassen

**Prompt an OpenCode:**
```
Nutze Playwright MCP um die Login-Seite zu öffnen und automatisch 
einen E2E-Test dafür zu generieren.
```

**Was passiert:**
1. OpenCode nutzt `browser_navigate` → http://localhost:3000/login
2. OpenCode nutzt `browser_snapshot` → strukturierte Page-Daten
3. OpenCode analysiert die Seite
4. OpenCode schreibt Test-Code basierend auf tatsächlicher Struktur

### 2. Bug reproduzieren

**Prompt an OpenCode:**
```
Öffne das Dashboard und reproduziere den Bug: 
"Guthaben wird nicht geladen wenn User direkt auf /dashboard navigiert"
```

**Was passiert:**
1. OpenCode öffnet Browser via MCP
2. OpenCode navigiert zu /dashboard
3. OpenCode prüft Netzwerk-Requests
4. OpenCode prüft Console-Errors
5. OpenCode erstellt Bug-Report mit exakten Schritten

### 3. UI testen ohne Tests zu schreiben

**Prompt an OpenCode:**
```
Teste ob der Produktkatalog funktioniert:
1. Login als Mitarbeiter
2. Suche nach "Apfel"
3. Öffne Produkt-Detail
4. Prüfe ob "Kaufen"-Button sichtbar ist
```

**Was passiert:**
OpenCode führt alle Schritte automatisch aus und berichtet Ergebnisse.

---

## Konfiguration & Optionen

### Basis-Konfiguration (bereits aktiv)
```json
{
  "playwright": {
    "command": ["npx", "-y", "@playwright/mcp@latest"],
    "enabled": true,
    "type": "local"
  }
}
```

### Erweiterte Optionen

Du kannst die Konfiguration mit zusätzlichen Argumenten erweitern:

```json
{
  "playwright": {
    "command": [
      "npx", "-y", "@playwright/mcp@latest",
      "--browser", "chromium",
      "--headless",
      "--viewport-size", "1280x720"
    ],
    "enabled": true,
    "type": "local"
  }
}
```

**Wichtige Optionen:**

| Option | Beschreibung | Beispiel |
|--------|--------------|----------|
| `--browser` | Browser-Typ | `chromium`, `firefox`, `webkit` |
| `--headless` | Headless-Modus | (Flag ohne Wert) |
| `--headed` | Headed-Modus (Standard) | (Flag ohne Wert) |
| `--viewport-size` | Viewport-Größe | `1280x720` |
| `--device` | Device emulieren | `iPhone 15` |
| `--user-data-dir` | Profile-Verzeichnis | `/pfad/zum/profile` |
| `--storage-state` | Storage-State laden | `/pfad/zu/storage.json` |
| `--timeout-action` | Action-Timeout (ms) | `5000` |
| `--timeout-navigation` | Navigation-Timeout (ms) | `60000` |
| `--save-trace` | Trace speichern | (Flag ohne Wert) |
| `--save-video` | Video speichern | `800x600` |

### Headless vs. Headed

**Headed (Standard):**
```json
"command": ["npx", "-y", "@playwright/mcp@latest"]
```
- Browser-Fenster wird geöffnet
- Du siehst was der LLM macht
- Gut für Debugging

**Headless:**
```json
"command": ["npx", "-y", "@playwright/mcp@latest", "--headless"]
```
- Kein Browser-Fenster
- Schneller
- Gut für CI/CD

---

## Best Practices

### 1. Browser-Profile nutzen

Playwright MCP speichert Profile standardmäßig:

**macOS:**
```
~/Library/Caches/ms-playwright/mcp-chrome-profile
```

**Vorteile:**
- Login-Sessions bleiben erhalten
- Cookies gespeichert
- Schneller für wiederholte Tests

### 2. Storage-State für Tests

Für isolierte Test-Sessions:

```json
"command": [
  "npx", "-y", "@playwright/mcp@latest",
  "--isolated",
  "--storage-state", "tests/fixtures/auth.json"
]
```

### 3. Timeouts anpassen

Für langsame Seiten:

```json
"command": [
  "npx", "-y", "@playwright/mcp@latest",
  "--timeout-navigation", "120000"
]
```

---

## Unterschied zu normalen E2E-Tests

| Aspekt | E2E-Tests (`npm run test:e2e`) | Playwright MCP |
|--------|--------------------------------|----------------|
| **Wer schreibt Code?** | Du (manuell) | LLM (automatisch) |
| **Ausführung** | CI/CD, lokal | On-Demand via LLM |
| **Use Case** | Regression Testing | Explorative Testing, Bug-Reproduktion |
| **Wiederverwendbar?** | Ja (Test-Dateien) | Nein (einmalige Aktionen) |
| **Browser-Zustand** | Frisch | Persistent (Login bleibt) |

**Fazit:** Beide ergänzen sich!
- **E2E-Tests:** Für automatisierte Regression-Tests
- **MCP:** Für explorative Tests, Bug-Reproduktion, Test-Generierung

---

## Sicherheit

### Standardmäßig sichere Einstellungen

Playwright MCP hat folgende Sicherheits-Features:

1. **Blocked Origins:** Verhindert Requests zu blockierten Domains
2. **Allowed Hosts:** Nur erlaubte Hosts dürfen bedient werden
3. **File Access:** Beschränkt auf Workspace (Standard)
4. **No Service Workers:** Blockiert Service Workers (optional)

### Secrets verwalten

Für Login-Credentials:

```json
"command": [
  "npx", "-y", "@playwright/mcp@latest",
  "--secrets", "tests/fixtures/secrets.env"
]
```

**secrets.env:**
```
ADMIN_EMAIL=admin@snackease.de
ADMIN_PASSWORD=geheim123
```

**WICHTIG:** Füge `secrets.env` zu `.gitignore` hinzu!

---

## Troubleshooting

### Problem: Browser öffnet sich nicht

**Lösung:**
```bash
# Browser installieren
npx playwright install chromium
```

### Problem: "Port already in use"

**Lösung:**
```json
"command": ["npx", "-y", "@playwright/mcp@latest", "--port", "8932"]
```

### Problem: Timeout bei Navigation

**Lösung:**
```json
"command": [
  "npx", "-y", "@playwright/mcp@latest",
  "--timeout-navigation", "120000"
]
```

### Problem: Headless funktioniert nicht

**Lösung:**
Verwende Headed-Modus für Debugging:
```json
"command": ["npx", "-y", "@playwright/mcp@latest"]
```

---

## Weitere Ressourcen

- **Playwright MCP GitHub:** https://github.com/microsoft/playwright-mcp
- **MCP Dokumentation:** https://modelcontextprotocol.io
- **Playwright Docs:** https://playwright.dev/docs/intro

---

## Zusammenfassung

✅ **Was du jetzt hast:**

1. **Playwright E2E-Tests** (`npm run test:e2e`)
   - Für geschriebene Tests
   - CI/CD Integration
   - Regression Testing

2. **Playwright MCP Server** (via OpenCode)
   - LLM kann Browser steuern
   - Automatische Test-Generierung
   - Bug-Reproduktion
   - Explorative Testing

🎯 **Nächste Schritte:**

1. **Teste Playwright MCP:**
   ```
   Prompt: "Nutze Playwright MCP um http://localhost:3000 zu öffnen"
   ```

2. **Test automatisch generieren lassen:**
   ```
   Prompt: "Öffne die Login-Seite und schreibe einen E2E-Test dafür"
   ```

3. **Bug reproduzieren:**
   ```
   Prompt: "Reproduziere Bug: Guthaben wird nicht geladen"
   ```

---

**Happy Automating! 🎭✨**
