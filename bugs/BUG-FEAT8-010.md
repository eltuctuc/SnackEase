# BUG-FEAT8-010: Empty-State Subtext "text-gray-400" unterschreitet 4.5:1 Kontrast

**Feature:** FEAT-8 Leaderboard
**Severity:** High
**Priority:** Must Fix
**Gefunden am:** 2026-03-05
**App URL:** http://localhost:3000/leaderboard

---

## Beschreibung

Im `LeaderboardList.vue` wird im Empty-State (keine Käufe im Zeitraum) der Subtext "Kauf einen Snack und erscheine auf der Rangliste!" mit der Klasse `text-gray-400` auf weißem Hintergrund (`bg-white` / `bg-card`) gerendert. Das Kontrastverhältnis von `gray-400` (#9CA3AF) zu Weiß (#FFFFFF) beträgt **2.54:1** — deutlich unter der WCAG 2.1 AA-Anforderung von **4.5:1** für Normaltext (Schriftgröße < 18px / 14px bold).

## Steps to Reproduce

1. Navigiere zu http://localhost:3000/leaderboard als Mitarbeiter
2. Wähle einen Zeitraum ohne Käufe (z.B. "Woche" am Montag)
3. Im Empty-State erscheint der Subtext "Kauf einen Snack und erscheine auf der Rangliste!"
4. Prüfe Kontrast: #9CA3AF (gray-400) auf #FFFFFF (weiß) = **2.54:1**

## Expected Behavior

Kontrastrate >= 4.5:1 für alle sichtbaren Text-Elemente (WCAG 2.1 AA, SC 1.4.3). Der Subtext sollte mindestens `text-gray-500` (#6B7280, ~4.83:1) oder dunkler verwenden.

## Actual Behavior

`text-gray-400` (#9CA3AF) auf weißem Hintergrund ergibt 2.54:1 — WCAG-Verstoß.

## Betroffene Datei

`src/components/leaderboard/LeaderboardList.vue`, Zeile 73:
```html
<p class="text-gray-400 text-xs">Kauf einen Snack und erscheine auf der Rangliste!</p>
```

## Mögliche Lösung

```html
<p class="text-gray-500 text-xs">Kauf einen Snack und erscheine auf der Rangliste!</p>
```
`gray-500` (#6B7280) ergibt ~4.83:1 auf Weiß — WCAG AA konform.

## Environment

- Browser: Alle (rechnerisches Problem, nicht browser-spezifisch)
- Device: Desktop/Mobile
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- BUG-FEAT8-006 (ähnliches Problem: text-gray-400 in LeaderboardEntry Suffix)

### Zu anderen Features
- FEAT-8: Leaderboard — Accessibility-Anforderung

---

## Attachments

- Screenshots: —
- Logs: —
