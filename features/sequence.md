# Feature Umsetzungsreihenfolge

## Empfohlene Reihenfolge

| Reihenfolge | Feature | Nummer | Status | Abhängigkeiten |
|-------------|---------|--------|--------|----------------|
| 1 | Splashscreen mit Preloading | FEAT-0 | ✅ Implementiert | Keine |
| 2 | SSR-Auth (Bug-Fix) | FEAT-0 | ✅ Implementiert | Von FEAT-0 |
| 3 | Admin Authentication | FEAT-1 | ✅ Implementiert | FEAT-0 (Login-Seite) |
| 4 | Demo User Authentication | FEAT-2 | ✅ Implementiert | FEAT-1 (Admin muss existieren) |
| 5 | User Switcher | FEAT-3 | ✅ Implementiert | FEAT-2 (User müssen existieren) |
| 6 | Demo Guthaben | FEAT-4 | ✅ Implementiert | FEAT-2, FEAT-3 (User brauchen Guthaben + User-Wechsel) |
| 7 | Admin Basis | FEAT-5 | ✅ Implementiert | FEAT-1 |
| 8 | Produktkatalog | FEAT-6 | ✅ Implementiert | FEAT-4 (Guthaben für Käufe) |
| 9 | Admin ohne Guthaben | FEAT-9 | ✅ Implementiert | FEAT-4 (Admin sieht kein Guthaben) |
| 10 | One-Touch-Kauf | FEAT-7 | ✅ Implementiert | FEAT-4, FEAT-6 |
| 11 | Erweitertes Admin-Dashboard | FEAT-10 | ✅ Implementiert | FEAT-5, FEAT-6 |
| 12 | Leaderboard | FEAT-8 | ✅ Implementiert | FEAT-7 |
| 13 | Bestandsverwaltung | FEAT-12 | ✅ Implementiert | FEAT-5, FEAT-6, FEAT-10 |
| 14 | Bestellabholung am Automaten | FEAT-11 | ✅ Implementiert | FEAT-2, FEAT-7, FEAT-12 |
| 15 | Low-Stock-Benachrichtigungen | FEAT-13 | ✅ Implementiert | FEAT-5, FEAT-12 |

## Bereits umgesetzte Features

- ✅ FEAT-0: Splashscreen
- ✅ FEAT-0 (SSR-Auth): Pinia + Cookie Auth
- ✅ FEAT-1: Admin Authentication
- ✅ FEAT-2: Demo User Authentication
- ✅ FEAT-3: User Switcher
- ✅ FEAT-4: Demo Guthaben
- ✅ FEAT-5: Admin Basis
- ✅ FEAT-6: Produktkatalog
- ✅ FEAT-9: Admin ohne Guthaben
- ✅ FEAT-7: One-Touch-Kauf
- ✅ FEAT-10: Erweitertes Admin-Dashboard
- ✅ FEAT-8: Leaderboard
- ✅ FEAT-12: Bestandsverwaltung
- ✅ FEAT-11: Bestellabholung am Automaten
- ✅ FEAT-13: Low-Stock-Benachrichtigungen

## Offene Features (nach Reihenfolge)

Keine offenen Features.

## Hinweis zu Abweichungen

Falls die Umsetzungsreihenfolge geändert wird:
1. Diese Datei aktualisieren
2. In den betroffenen Feature-Files die Abhängigkeiten anpassen
3. Grund für Änderung in den Feature-Notes dokumentieren
