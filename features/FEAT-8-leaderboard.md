# FEAT-8: Leaderboard

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-7 (One-Touch Kauf) - für Kaufdaten und Bonuspunkte

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
| REQ-2 | Tab-Umschaltung: "Meistgekauft" vs "Gesündeste" | Must-Have |
| REQ-3 | Anzeige: Rang, Name, Punkte/Käufe, Standort | Must-Have |
| REQ-4 | Eigener Rang ist hervorgehoben | Must-Have |
| REQ-5 | Bonuspunkte für gesunde Produkte | Should-Have |

## 4. Leaderboard-Kategorien

### 4.1 "Meistgekauft"
- Sortiert nach Anzahl der Käufe
- Zeigt: Rang, Name, gekaufte Artikel, Standort

### 4.2 "Gesündeste" (Optional)
- Sortiert nach Bonuspunkten
- Zeigt: Rang, Name, Punkte, Standort
- Bonus für: Obst (+3), Nüsse/Protein/Shakes (+2), Schoko/Getränke (+1)

## 5. Datenmodell (Neon/Drizzle)

### Leaderboard-Berechnung
Das Leaderboard wird aus den `purchases` und `user_credits` Tabellen berechnet (keine separate Tabelle nötig):

```sql
-- Meistgekauft
SELECT 
  u.id,
  u.name,
  u.location,
  COUNT(p.id) as total_purchases
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
WHERE u.role = 'mitarbeiter'
GROUP BY u.id, u.name, u.location
ORDER BY total_purchases DESC;

-- Bonuspunkte (optional)
SELECT 
  u.id,
  u.name,
  u.location,
  COALESCE(SUM(p.bonus_points), 0) as health_points
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
WHERE u.role = 'mitarbeiter'
GROUP BY u.id, u.name, u.location
ORDER BY health_points DESC;
```

## 6. Acceptance Criteria

- [ ] Leaderboard zeigt alle Demo-Nutzer (global)
- [ ] Tab "Meistgekauft" zeigt Rang nach Kaufanzahl
- [ ] Tab "Gesündeste" zeigt Rang nach Bonuspunkten (optional)
- [ ] Aktueller Nutzer ist visuell hervorgehoben
- [ ] Rang wird nach jedem Kauf aktualisiert

## 7. UI/UX Vorgaben

- Tabs oben: "Meistgekauft" | "Gesündeste"
- Liste mit:
  - Rang (1., 2., 3. mit Trophy Icon)
  - Avatar/Initialen
  - Name
  - Käufe/Punkte
  - Standort
- Eigener Eintrag farblich hervoben (blauer Hintergrund)
- Top 3 besonders hervorgehoben (Gold, Silber, Bronze)

## 8. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **Berechnung:** Query-basiert (keine separate Tabelle)
- **Indizes:** Für Performance auf user_id, created_at
- **Realtime:** Optional (nicht MVP)

## 9. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/leaderboard` | GET | Rangliste (beide Kategorien) |

## 10. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Keine Käufe | Leere Liste mit Hinweis |
| EC-2 | Gleiche Punktzahl | Alphabetisch sortieren |
| EC-3 | Nutzer gelöscht | Aus Leaderboard entfernen |
