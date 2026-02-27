# Feature Umsetzungsreihenfolge

## Empfohlene Reihenfolge

| Reihenfolge | Feature | Nummer | Status | Abhängigkeiten |
|-------------|---------|--------|--------|----------------|
| 1 | Splashscreen mit Preloading | FEAT-0 | ✅ Implementiert | Keine |
| 2 | SSR-Auth (Bug-Fix) | FEAT-0 | ✅ Implementiert | Von FEAT-0 |
| 3 | User Authentication | FEAT-2 | 📋 Geplant | FEAT-0 (Login-Seite) |
| 4 | User Switcher | FEAT-3 | 📋 Geplant | FEAT-2 (User müssen existieren) |
| 5 | Demo Guthaben | FEAT-4 | 📋 Geplant | FEAT-2 (User brauchen Guthaben) |
| 6 | Produktkatalog | FEAT-6 | 📋 Geplant | FEAT-4 (Guthaben für Käufe) |
| 7 | One-Touch-Kauf | FEAT-7 | 📋 Geplant | FEAT-4, FEAT-6 |
| 8 | Leaderboard | FEAT-8 | 📋 Geplant | FEAT-7 (Käufe für Rangliste) |
| 9 | Admin Authentication | FEAT-1 | 📋 Geplant | FEAT-2 |
| 10 | Admin Basis | FEAT-5 | 📋 Geplant | FEAT-1 |

## Begründung der Reihenfolge

### Phase 1: Foundation (FEAT-0)
- Splashscreen als Einstiegspunkt
- Auth-System als Grundlage für alle weiteren Features

### Phase 2: User Management (FEAT-2, FEAT-3)
- User müssen sich anmelden können
- User Switcher ermöglicht Tests mit verschiedenen Accounts

### Phase 3: Guthaben & Produkte (FEAT-4, FEAT-6)
- Guthaben-System als Währung
- Produktkatalog zum Durchsuchen

### Phase 4: Kernfunktionen (FEAT-7, FEAT-8)
- One-Touch-Kauf als Hauptfeature
- Leaderboard motiviert durch Wettbewerb

### Phase 5: Admin (FEAT-1, FEAT-5)
- Admin-Funktionen zuletzt, da sie nicht kundenrelevant sind

## Bereits umgesetzte Features

- ✅ FEAT-0: Splashscreen
- ✅ FEAT-0 (SSR-Auth): Pinia + Cookie Auth

## Offene Features (nach Reihenfolge)

1. FEAT-2: Demo User Authentication
2. FEAT-3: User Switcher
3. FEAT-4: Demo Guthaben
4. FEAT-6: Produktkatalog
5. FEAT-7: One-Touch-Kauf
6. FEAT-8: Leaderboard
7. FEAT-1: Admin Authentication
8. FEAT-5: Admin Basis

## Hinweis zu Abweichungen

Falls die Umsetzungsreihenfolge geändert wird:
1. Diese Datei aktualisieren
2. In den betroffenen Feature-Files die Abhängigkeiten anpassen
3. Grund für Änderung in den Feature-Notes dokumentieren
