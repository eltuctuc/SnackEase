# BUG-FEAT4-001: Admin kann Guthaben sehen

**Feature:** FEAT-4 Demo-Guthaben
**Severity:** Critical
**Priority:** Must Fix
**Status:** Offen
**Gefunden am:** 2026-02-28
**Tester:** QA Engineer

---

## Beschreibung

Der Admin kann das Guthaben der User sehen und aufladen. Dies verstößt gegen das Datenschutzprinzip - Admin darf keine individuellen User-Daten sehen.

## Steps to Reproduce

1. Als Admin einloggen (admin@demo.de / admin123)
2. Dashboard öffnen
3. Guthaben-Karte ist sichtbar

## Expected Behavior

Admin sollte KEIN Guthaben sehen

## Actual Behavior

Admin sieht Guthaben mit Auflade-Buttons

---

## Abhängigkeiten

### Zu anderen Features
- FEAT-9 (Admin ohne Guthaben): Dieses Bug wird in FEAT-9 behoben