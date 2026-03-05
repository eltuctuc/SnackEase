# BUG-FEAT8-011: Silber-Trophy-SVG "text-gray-400" unterschreitet 3:1 Non-Text-Kontrast (WCAG 1.4.11)

**Feature:** FEAT-8 Leaderboard
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-05
**App URL:** http://localhost:3000/leaderboard

---

## Beschreibung

Das Silber-Trophy-SVG für Platz 2 in `LeaderboardEntry.vue` verwendet die Klasse `text-gray-400` (#9CA3AF) auf weißem Hintergrund. Da das SVG ein `aria-label="Platz 2 — Silber"` und `role="img"` hat, ist es eine bedeutungsTragende Grafik (nicht dekorativ). Laut WCAG 2.1 AA, SC 1.4.11 (Non-Text Contrast) müssen grafische Elemente, die zur Vermittlung von Information dienen, ein Kontrastverhältnis von mindestens **3:1** zum Hintergrund aufweisen.

Das Kontrastverhältnis von #9CA3AF (gray-400) zu #FFFFFF beträgt **2.54:1** — unter dem Mindestwert von 3:1.

Hinweis: Das Error-Warn-Icon in `LeaderboardList.vue` (Zeile 34) hat ebenfalls `text-gray-400`, ist aber mit `aria-hidden="true"` korrekt als dekorativ markiert — kein WCAG-Problem.

## Steps to Reproduce

1. Navigiere zu http://localhost:3000/leaderboard als Mitarbeiter
2. Achte auf den 2. Platz in der Rangliste (Silber-Trophy-Icon)
3. Das Icon ist grau (#9CA3AF) auf weißem Hintergrund
4. Prüfe Non-Text-Kontrast: #9CA3AF auf #FFFFFF = **2.54:1** (Mindestwert: 3:1)

## Expected Behavior

Das Silber-Trophy-SVG sollte einen Kontrast >= 3:1 haben (WCAG 2.1 AA, SC 1.4.11). Für Silber sollte eine dunklere Graustufe verwendet werden, z.B. `text-gray-500` (#6B7280, ~4.83:1).

## Actual Behavior

`text-gray-400` (#9CA3AF) auf weißem Hintergrund ergibt 2.54:1 — WCAG 1.4.11 Non-Text-Contrast-Verstoß.

## Betroffene Datei

`src/components/leaderboard/LeaderboardEntry.vue`, Zeile 39–47:
```html
<svg
  v-else-if="entry.rank === 2"
  aria-label="Platz 2 — Silber"
  role="img"
  class="w-6 h-6 mx-auto text-gray-400"
  ...
>
```

## Mögliche Lösung

```html
class="w-6 h-6 mx-auto text-gray-500"
```
`gray-500` (#6B7280) ergibt ~4.83:1 auf Weiß — WCAG 1.4.11 konform. Der silberne Charakter bleibt mit einer dunkleren Graustufe visuell erhalten.

Alternativ: Expliziter Hex-Wert für "Silber" der > 3:1 Kontrast garantiert, z.B. #757575.

## Environment

- Browser: Alle (rechnerisches Problem, nicht browser-spezifisch)
- Device: Desktop/Mobile
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- BUG-FEAT8-006 (ähnliches Problem: text-gray-400 in Suffix-Text)
- BUG-FEAT8-010 (ähnliches Problem: text-gray-400 in Empty-State)

### Zu anderen Features
- FEAT-8: Leaderboard — WCAG Non-Text Contrast

---

## Attachments

- Screenshots: —
- Logs: —
