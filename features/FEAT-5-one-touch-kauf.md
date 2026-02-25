# FEAT-5: One-Touch Kauf

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-1 (User Switcher) - für Benutzer-Identifikation
- Benötigt: FEAT-2 (Demo-Guthaben) - für Guthaben-Prüfung
- Benötigt: FEAT-4 (Produktkatalog) - für Produktinformationen

## 1. Overview

**Beschreibung:** Ermöglicht den Kauf eines Produkts mit nur einem Klick/Tap.

**Ziel:** Schnellster möglicher Kaufprozess für Vielbeschäftigte.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich ein Produkt mit einem Klick kaufen | Must-Have |
| US-2 | Als Nutzer möchte ich eine Bestätigung nach dem Kauf sehen | Must-Have |
| US-3 | Als Nutzer möchte ich wissen, ob genug Guthaben vorhanden ist | Must-Have |
| US-4 | Als Nutzer möchte ich eine Kaufbestätigung (digital) erhalten | Must-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | One-Touch Button auf jedem Produkt | Must-Have |
| REQ-2 | Direkter Kauf ohne Warenkorb | Must-Have |
| REQ-3 | Guthaben-Prüfung vor Kauf | Must-Have |
| REQ-4 | Erfolgsbestätigung (Animation/Toast) | Must-Have |
| REQ-5 | Automatischer Guthaben-Abzug | Must-Have |
| REQ-6 | Kontaktlose Abwicklung (kein Scan/Checkout) | Must-Have |
| REQ-7 | Bonuspunkte für gesunde Produkte | Must-Have |

## 4. Kaufprozess

```
1. Nutzer klickt "Kaufen" auf Produkt
       ↓
2. System prüft Guthaben
       ↓
   [Wenn nicht genug] → Fehlermeldung → Abbruch
       ↓
3. [Wenn genug] → Guthaben abziehen
       ↓
4. Kauf in Historie speichern
       ↓
5. Erfolgsbestätigung anzeigen
       ↓
6. Leaderboard aktualisieren
```

## 5. Bonuspunkte-Logik

| Produkttyp | Punkte |
|------------|--------|
| Obst | +3 Punkte |
| Nüsse | +2 Punkte |
| Proteinriegel | +2 Punkte |
| Shakes | +2 Punkte |
| Schokoriegel | +1 Punkt |
| Getränke | +1 Punkt |

## 6. Acceptance Criteria

- [ ] "Kaufen" Button auf jedem Produkt sichtbar
- [ ] Bei genug Guthaben: Kauf wird durchgeführt
- [ ] Bei zu wenig Guthaben: Fehlermeldung "Nicht genug Guthaben"
- [ ] Nach Kauf: Bestätigungsanimation/-toast
- [ ] Guthaben wird sofort aktualisiert
- [ ] Kauf wird in Historie gespeichert
- [ ] Leaderboard-Punkte werden aktualisiert

## 7. UI/UX Vorgaben

- "Kaufen" Button prominent auf Produktkarte
- Bei Klick: Kurze Ladeanimation (0.5s)
- Erfolgsbestätigung: Check-Animation + "Gekauft!" Text
- Aktuelles Guthaben immer sichtbar
- Farbiger Button (z.B. grün oder Markenfarbe)

## 8. Technische Hinweise

- Supabase Function für Transaktion (atomar):
  1. Guthaben prüfen
  2. Guthaben abziehen
  3. Kauf speichern
  4. Punkte berechnen und zu Leaderboard hinzufügen
- Row Level Security für Transaktionen
- Transaktion in einer Function bündeln

## 9. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Guthaben nicht ausreichend | Kauf blockieren, "Nicht genug Guthaben" Fehler |
| EC-2 | Produkt wird während Kauf ausverkauft | "Produkt nicht mehr verfügbar" Nachricht |
| EC-3 | Doppelter Kauf-Klick | Button während Verarbeitung deaktivieren |
| EC-4 | Netzwerkfehler während Kauf | Transaktion rollt zurück, Fehlermeldung |
| EC-5 | Kauf mit 0,00€ Produkt | Erlaubt, keine Guthaben-Abzug |
| EC-6 | Leaderboard-Update schlägt fehl | Kauf trotzdem erfolgreich, asynchrones Update |
