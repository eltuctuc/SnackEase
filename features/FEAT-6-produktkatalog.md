# FEAT-6: Produktkatalog

## Status: 🔵 Planned

## Abhängigkeiten
- Keine direkten Abhängigkeiten

## 1. Overview

**Beschreibung:** Anzeige aller verfügbaren Snacks und Getränke mit Kategorien, Suche und Produktdetails.

**Ziel:** Übersichtliche Darstellung des Produktangebots mit allen relevanten Informationen.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Nutzer möchte ich alle Produkte auf einen Blick sehen | Must-Have |
| US-2 | Als Nutzer möchte ich nach Kategorien filtern | Must-Have |
| US-3 | Als Nutzer möchte ich nach Produktnamen suchen | Must-Have |
| US-4 | Als Nutzer möchte ich Details zu einem Produkt sehen (Nährwerte, Inhaltsstoffe) | Must-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Übersicht aller Produkte als Grid oder Liste | Must-Have |
| REQ-2 | Kategorien: Obst, Proteinriegel, Shakes, Schokoriegel, Nüsse, Getränke | Must-Have |
| REQ-3 | Suchfeld mit Echtzeit-Filterung | Must-Have |
| REQ-4 | Kategorie-Filter (eine oder mehrere) | Must-Have |
| REQ-5 | Produktdetail-Ansicht: Bild, Name, Preis, Nährwerte, Allergene | Must-Have |
| REQ-6 | Verfügbarkeitsanzeige (vorrätig/nicht vorrätig) | Must-Have |

## 4. Kategorien

| Kategorie | Farbe | Icon |
|-----------|-------|------|
| Obst | Grün | 🍎 |
| Proteinriegel | Blau | 💪 |
| Shakes | Lila | 🥤 |
| Schokoriegel | Braun | 🍫 |
| Nüsse | Orange | 🥜 |
| Getränke | Cyan | 🧃 |

## 5. Produkt-Datenmodell

```
products:
- id: UUID
- name: string
- description: text
- category: enum
- price: decimal
- image_url: string
- calories: number
- protein: number
- sugar: number
- fat: number
- allergens: string[]
- is_vegan: boolean
- is_gluten_free: boolean
- stock: number (vorrätig > 0)
- created_at: timestamp
```

## 6. Acceptance Criteria

- [ ] Alle Produkte werden im Grid angezeigt
- [ ] Kategorie-Filter funktioniert (alle/ausgewählte)
- [ ] Suchfeld filtert Produkte nach Namen
- [ ] Klick auf Produkt öffnet Detailansicht
- [ ] Nährwerte und Allergene werden angezeigt
- [ ] Nicht vorrätige Produkte sind markiert

## 7. UI/UX Vorgaben

- Grid-Layout mit 2-4 Spalten (responsive)
- Suchfeld oben fixiert
- Kategorien als Filter-Buttons oder Tabs
- Produktkarte: Bild, Name, Preis, vegetarisch/vegan Icon

## 8. Technische Hinweise

- Supabase Tabelle `products`
- Produkte werden zur Demo seeded
- Suche über PostgreSQL ILIKE
- Kategorien als Enum oder Referenz-Tabelle
