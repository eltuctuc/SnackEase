# Feature Umsetzungsreihenfolge

## Empfohlene Reihenfolge

| Reihenfolge | Feature | Nummer | Status | Abhängigkeiten |
|-------------|---------|--------|--------|----------------|
| 1 | Splashscreen mit Preloading | FEAT-0 | ✅ Implementiert | Keine |
| 2 | SSR-Auth (Bug-Fix) | FEAT-0 | ✅ Implementiert | Von FEAT-0 |
| 3 | Admin Authentication | FEAT-1 | ✅ Implementiert | FEAT-0 |
| 4 | Demo User Authentication | FEAT-2 | ✅ Implementiert | FEAT-1 |
| 5 | User Switcher | FEAT-3 | ✅ Implementiert | FEAT-2 |
| 6 | Demo Guthaben | FEAT-4 | ✅ Implementiert | FEAT-2, FEAT-3 |
| 7 | Admin Basis | FEAT-5 | ✅ Implementiert | FEAT-1 |
| 8 | Produktkatalog | FEAT-6 | ✅ Implementiert | FEAT-4 |
| 9 | Admin ohne Guthaben | FEAT-9 | ✅ Implementiert | FEAT-4 |
| 10 | One-Touch-Kauf | FEAT-7 | ✅ Implementiert | FEAT-4, FEAT-6 |
| 11 | Erweitertes Admin-Dashboard | FEAT-10 | ✅ Implementiert | FEAT-5, FEAT-6 |
| 12 | Leaderboard | FEAT-8 | ✅ Implementiert | FEAT-7 |
| 13 | Bestandsverwaltung | FEAT-12 | ✅ Implementiert | FEAT-5, FEAT-6, FEAT-10 |
| 14 | Bestellabholung am Automaten | FEAT-11 | ✅ Implementiert | FEAT-2, FEAT-7, FEAT-12 |
| 15 | Low-Stock-Benachrichtigungen | FEAT-13 | ✅ Implementiert | FEAT-5, FEAT-12 |
| 16 | Angebote & Rabatte | FEAT-14 | ✅ Implementiert | FEAT-6 |
| 17 | App-Navigationstruktur | FEAT-15 | ✅ Implementiert | FEAT-1, FEAT-2 |
| 18 | Warenkorb-System | FEAT-16 | ✅ Implementiert | FEAT-7, FEAT-11, FEAT-14 |
| 19 | Angebote-Querslider | FEAT-17 | ✅ Implementiert | FEAT-14, FEAT-15 |
| 20 | Profil-Seite | FEAT-20 | ✅ Implementiert | FEAT-2, FEAT-15 |
| 21 | Admin Einstellungsseite | FEAT-21 | ✅ Implementiert | FEAT-5, FEAT-15 |

## Offene Features (nach Reihenfolge)

| Reihenfolge | Feature | Nummer | Status | Abhängigkeiten |
|-------------|---------|--------|--------|----------------|
| 22 | Empfehlungen & Favoriten | FEAT-18 | ✅ Implementiert | FEAT-6, FEAT-16 |
| 23 | Erweiterte Suche | FEAT-19 | 📋 Spezifiziert | FEAT-6 |
| 24 | Konfigurierbarer Schwellwert | FEAT-22 | 📋 Spezifiziert | FEAT-13 |
| 25 | Leaderboard-Erweiterung | FEAT-23 | 📋 Spezifiziert | FEAT-8 |
| 26 | Guthaben aufladen & Zahlungsmethode | FEAT-24 | 📋 Spezifiziert | FEAT-4 |

## Hinweis zu Abweichungen

Falls die Umsetzungsreihenfolge geändert wird:
1. Diese Datei aktualisieren
2. In den betroffenen Feature-Files die Abhängigkeiten anpassen
3. Grund für Änderung in den Feature-Notes dokumentieren
