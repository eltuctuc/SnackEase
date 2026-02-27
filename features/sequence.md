# Feature Umsetzungsreihenfolge

## Empfohlene Reihenfolge

| Reihenfolge | Feature | Nummer | Status | Abhängigkeiten |
|-------------|---------|--------|--------|----------------|
| 1 | Splashscreen mit Preloading | FEAT-0 | ✅ Implementiert | Keine |
| 2 | SSR-Auth (Bug-Fix) | FEAT-0 | ✅ Implementiert | Von FEAT-0 |
| 3 | Admin Authentication | FEAT-1 | ✅ Implementiert | FEAT-0 (Login-Seite) |
| 4 | Demo User Authentication | FEAT-2 | ✅ Implementiert | FEAT-1 (Admin muss existieren) |
| 5 | User Switcher | FEAT-3 | 📋 Geplant | FEAT-2 (User müssen existieren) |
| 6 | Demo Guthaben | FEAT-4 | 📋 Geplant | FEAT-2 (User brauchen Guthaben) |
| 7 | Produktkatalog | FEAT-6 | 📋 Geplant | FEAT-4 (Guthaben für Käufe) |
| 8 | One-Touch-Kauf | FEAT-7 | 📋 Geplant | FEAT-4, FEAT-6 |
| 9 | Leaderboard | FEAT-8 | 📋 Geplant | FEAT-7 (Käufe für Rangliste) |
| 10 | Admin Basis | FEAT-5 | 📋 Geplant | FEAT-1 |

## Bereits umgesetzte Features

- ✅ FEAT-0: Splashscreen
- ✅ FEAT-0 (SSR-Auth): Pinia + Cookie Auth
- ✅ FEAT-1: Admin Authentication
- ✅ FEAT-2: Demo User Authentication

## Offene Features (nach Reihenfolge)

1. FEAT-3: User Switcher
2. FEAT-3: User Switcher
3. FEAT-4: Demo Guthaben
4. FEAT-6: Produktkatalog
5. FEAT-7: One-Touch-Kauf
6. FEAT-8: Leaderboard
7. FEAT-5: Admin Basis

## Hinweis zu Abweichungen

Falls die Umsetzungsreihenfolge geändert wird:
1. Diese Datei aktualisieren
2. In den betroffenen Feature-Files die Abhängigkeiten anpassen
3. Grund für Änderung in den Feature-Notes dokumentieren
