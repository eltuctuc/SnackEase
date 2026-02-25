# Snack Ease — shadcn-vue Theme

## Dateien

| Datei | Zweck |
|---|---|
| `globals.css` | Alle CSS-Variablen (Light + Dark Mode), Google Fonts Import |
| `tailwind.config.ts` | Tailwind-Erweiterungen, Farb-Mapping, Radius, Fonts |

---

## Einbindung ins Projekt

### 1. Abhängigkeiten installieren
```bash
npm install tailwindcss-animate
```

### 2. `globals.css` einbinden
Ersetze deine bestehende `globals.css` (oder `main.css`) mit dieser Datei oder importiere sie:
```ts
// main.ts
import './assets/globals.css'
```

### 3. `tailwind.config.ts` übernehmen
Ersetze deine bestehende Tailwind-Konfiguration.
Passe die `content`-Pfade ggf. an deine Projektstruktur an.

---

## Farbpalette

### Moodboard-Farben (Light Mode)
| Token | Tailwind-Klasse | Hex | HSL | Verwendung |
|---|---|---|---|---|
| Primary | `bg-primary` | `#1B4D40` | `165 47% 20%` | Buttons, aktive Nav, Header |
| Accent / Teal | `bg-accent` | `#3AACA7` | `177 49% 45%` | Highlights, Fortschrittsbalken, Focus-Ring |
| Secondary | `bg-secondary` | `#E2E8EE` | `212 20% 92%` | Chips, Tags, inaktive Tabs |
| Brand Pink | `bg-brand-pink` | `#E5B5BF` | `348 48% 80%` | Dekorative Akzente |
| Brand Gold | `bg-brand-gold` | `#B8955A` | `38 40% 54%` | Dekorative Akzente |
| Brand Blue-Gray | `bg-brand-blue-gray` | `#BFC8D2` | `212 16% 78%` | Platzhalter, Sekundärflächen |

### Hintergründe & Text
| Token | Hex | Verwendung |
|---|---|---|
| `background` | `#F4F6F9` | Seitenhintergrund |
| `card` | `#FFFFFF` | Karten, Sheets |
| `foreground` | `#1E2D3D` | Fließtext, Überschriften |
| `muted-foreground` | `#6B7C8F` | Platzhaltertext, Labels |
| `surface-tint` | `#D9E5F0` | Bild-Placeholder, Karten-Header |

---

## Border Radius

| Klasse | Wert | Verwendung |
|---|---|---|
| `rounded-sm` | 8 px | Kleine Badges |
| `rounded-md` | 12 px | Inputs, Checkboxen |
| `rounded-lg` | 14 px | Karten (shadcn default) |
| `rounded-xl` | 18 px | Große Karten |
| `rounded-pill` | 9999 px | CTA-Buttons (VORBESTELLEN, AUSWAHL SPEICHERN) |

---

## Typografie

**Font:** [Mulish](https://fonts.google.com/specimen/Mulish) — wird automatisch via Google Fonts geladen.

```html
<!-- Sicherstellen, dass Mulish geladen ist (alternativ zu @import in CSS) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## Verwendungsbeispiele

### Pill-Button (CTA wie VORBESTELLEN)
```vue
<Button class="rounded-pill uppercase tracking-widest px-8">
  Vorbestellen
</Button>
```

### Karten-Header mit Surface-Tint
```vue
<div class="bg-brand-surface rounded-t-xl p-6">
  <!-- Produktbild -->
</div>
```

### Uppercase-Label (wie EMAIL, GESAMT)
```vue
<span class="label-caps">Gesamt</span>
```

### Dark Mode
Dark Mode wird über die CSS-Klasse `.dark` am `<html>`-Element aktiviert:
```ts
// Vue-Composable Beispiel
document.documentElement.classList.toggle('dark')
```
