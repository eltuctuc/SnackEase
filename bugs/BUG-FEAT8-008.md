# BUG-FEAT8-008: "← Dashboard"-Link unterschreitet 4.5:1 Kontrast (text-muted-foreground)

**Feature:** FEAT-8 Leaderboard
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-05
**App URL:** http://localhost:3000/leaderboard

---

## Beschreibung

Der Zurück-Link "← Dashboard" im Header der Leaderboard-Seite verwendet die Klasse `text-muted-foreground`. Laut `main.css` ist `--muted-foreground: 213 15% 50%`, was einem RGB-Wert von ca. (108, 126, 147) entspricht. Das Kontrastverhältnis gegenüber weißem Hintergrund beträgt **4.16:1** — knapp unter der WCAG 2.1 AA-Anforderung von **4.5:1** für Normaltext (14px / text-sm).

Hinweis: Auf dem leicht getönten `bg-background` (216 29% 97%) sinkt das Verhältnis weiter auf ca. **3.88:1**.

## Steps to Reproduce

1. Navigiere zu http://localhost:3000/leaderboard als Mitarbeiter
2. Betrachte den "← Dashboard"-Link oben links im Header
3. Klasse: `text-muted-foreground`, CSS-Variable: `213 15% 50%` ≈ RGB(108, 126, 147)
4. Hintergrund: `bg-background` (216 29% 97%) ≈ RGB(245, 247, 250)
5. Kontrast: ~3.88:1 auf Background, ~4.16:1 auf reinem Weiß

## Expected Behavior

Der Navigation-Link sollte einen Kontrast >= 4.5:1 haben (WCAG 2.1 AA, SC 1.4.3). Der Hover-State `hover:text-primary` wäre mit primary color ausreichend (~9.88:1), aber der Ruhezustand muss bereits zugänglich sein.

## Actual Behavior

`text-muted-foreground` (RGB ~108, 126, 147) auf `bg-background` (~RGB 245, 247, 250) ergibt ca. **3.88:1** — WCAG-Verstoß im Ruhezustand.

## Betroffene Datei

`src/pages/leaderboard.vue`, Zeile 106-114:
```html
<NuxtLink
  to="/dashboard"
  class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary focus:ring-2 focus:ring-primary rounded"
>
  ...
  Dashboard
</NuxtLink>
```

## Mögliche Lösung

Klasse ändern zu `text-foreground` oder `text-gray-600` für ausreichenden Kontrast im Ruhezustand. Alternativ könnte `text-muted-foreground` angepasst werden, aber das würde die gesamte App betreffen.

## Environment

- Browser: Alle (rechnerisches Problem, nicht browser-spezifisch)
- Device: Desktop/Mobile
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keiner

### Zu anderen Features
- FEAT-8: Leaderboard — Accessibility-Anforderung aus Spec Abschnitt 12.4

---

## Attachments

- Screenshots: —
- Logs: —
