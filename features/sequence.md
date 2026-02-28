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
| 7 | Admin ohne Guthaben | FEAT-9 | 📋 Geplant | FEAT-4 (Admin sieht kein Guthaben) |
| 8 | Produktkatalog | FEAT-6 | 📋 Geplant | FEAT-4 (Guthaben für Käufe) |
| 9 | One-Touch-Kauf | FEAT-7 | 📋 Geplant | FEAT-4, FEAT-6 |
| 10 | Leaderboard | FEAT-8 | 📋 Geplant | FEAT-7 (Käufe für Rangliste) |
| 11 | Admin Basis | FEAT-5 | 📋 Geplant | FEAT-1 |

## Bereits umgesetzte Features

- ✅ FEAT-0: Splashscreen
- ✅ FEAT-0 (SSR-Auth): Pinia + Cookie Auth
- ✅ FEAT-1: Admin Authentication
- ✅ FEAT-2: Demo User Authentication
- ✅ FEAT-3: User Switcher
- ✅ FEAT-4: Demo Guthaben

## Offene Features (nach Reihenfolge)

1. FEAT-9: Admin ohne Guthaben
2. FEAT-6: Produktkatalog
3. FEAT-7: One-Touch-Kauf
4. FEAT-8: Leaderboard
5. FEAT-5: Admin Basis

## Hinweis zu Abweichungen

Falls die Umsetzungsreihenfolge geändert wird:
1. Diese Datei aktualisieren
2. In den betroffenen Feature-Files die Abhängigkeiten anpassen
3. Grund für Änderung in den Feature-Notes dokumentieren
