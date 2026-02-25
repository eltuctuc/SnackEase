# FEAT-6: Leaderboard

## 1. Overview

**Beschreibung:** Rangliste der Mitarbeiter mit Bonuspunkten für gesunde Einkäufe.

**Ziel:** Motivation durch Wettbewerb und Anreize für gesunde Ernährung.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich meine Rangliste sehen | Must-Have |
| US-2 | Als Nutzer möchte ich sehen wer am meisten gekauft hat | Must-Have |
| US-3 | Als Nutzer möchte ich sehen wer am gesündesten isst | Must-Have |
| US-4 | Als Nutzer möchte ich meine eigenen Punkte sehen | Must-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Rangliste aller Nutzer (global sichtbar) | Must-Have |
| REQ-2 | Tab-Umschaltung: "Meistens" vs "Gesündeste" | Must-Have |
| REQ-3 | Anzeige: Rang, Name, Punkte, Standort | Must-Have |
| REQ-4 | Eigener Rang ist hervorgehoben | Must-Have |
| REQ-5 | Bonuspunkte für gesunde Produkte | Must-Have |

## 4. Leaderboard-Kategorien

### 4.1 "Meistens" (Kaufvolumen)
- Sortiert nach Anzahl der Käufe
- Zeigt: Rang, Name, gekaufte Artikel, Standort

### 4.2 "Gesündeste" (Bonuspunkte)
- Sortiert nach Bonuspunkten
- Zeigt: Rang, Name, Punkte, Standort
- Bonus für: Obst (+3), Nüsse/Protein/Shakes (+2), Schoko/Getränke (+1)

## 5. Datenmodell

```
leaderboard_entries:
- user_id: UUID
- total_purchases: number
- health_points: number
- last_updated: timestamp

computed daily/weekly/monthly:
- current_rank_purchases
- current_rank_health
```

## 6. Acceptance Criteria

- [ ] Leaderboard zeigt alle Nutzer (global)
- [ ] Tab "Meistens" zeigt Rang nach Kaufanzahl
- [ ] Tab "Gesündeste" zeigt Rang nach Bonuspunkten
- [ ] Aktueller Nutzer ist visuell hervorgehoben
- [ ] Rang wird nach jedem Kauf aktualisiert
- [ ] Punkte werden bei Kauf automatisch berechnet

## 7. UI/UX Vorgaben

- Tabs oben: "Meistens" | "Gesündeste"
- Liste mit:
  - Rang (1., 2., 3. mit Medaille/Trophy Icon)
  - Avatar/Initialen
  - Name
  - Punkte/Artikel
  - Standort
- Eigener Eintrag farblich hervoben (z.B. blauer Hintergrund)
- Top 3 besonders hervorgehoben (Gold, Silber, Bronze)

## 8. Technische Hinweise

- Leaderboard-Daten werden bei jedem Kauf aktualisiert
- Separate Rankings für Käufe und Bonuspunkte
- Supabase Realtime für Live-Updates (optional)
- Index auf `total_purchases` und `health_points`
