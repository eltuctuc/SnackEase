# FEAT-2: Demo-Guthaben-System

## 1. Overview

**Beschreibung:** Simuliertes Guthaben-System für die Demo. Guthaben wird nicht wirklich aufgeladen, nur die UI zeigt den Guthabenstand und Simulation des Aufladens.

**Ziel:** Realistische Demonstration des Guthaben-Systems ohne echte Payment-Integration.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Demo-Nutzer möchte ich mein aktuelles Guthaben sehen | Must-Have |
| US-2 | Als Demo-Nutzer möchte ich mein Guthaben per Klick aufladen | Must-Have |
| US-3 | Als Demo-Nutzer möchte ich eine kurze Ladezeit beim Aufladen sehen | Should-Have |
| US-4 | Als Demo-Nutzer möchte ich sehen, wann mein Guthaben zuletzt aufgeladen wurde | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Anzeige des aktuellen Guthabens auf der Startseite | Must-Have |
| REQ-2 | "Guthaben aufladen" Button mit Auswahlmöglichkeit (10€, 25€, 50€) | Must-Have |
| REQ-3 | Simulation der Aufladung mit 2-3 Sekunden Ladezeit | Must-Have |
| REQ-4 | Guthaben-Abzug bei Käufen | Must-Have |
| REQ-5 | Monatliche Gutschrift (simuliert) - 25€ am 1. des Monats | Must-Have |
| REQ-6 | Nicht verbrauchtes Guthaben wird übertragen | Must-Have |

## 4. Auflade-Optionen

| Betrag | Beschreibung |
|--------|--------------|
| 10€ | Kleine Aufladung |
| 25€ | Standard (entspricht Monatspauschale) |
| 50€ | Große Aufladung |

## 5. Simulation Logik

1. **Startguthaben:** Jeder Demo-Nutzer erhält initial 25€
2. **Monatliche Gutschrift:** Am 1. des Monats werden 25€ gutgeschrieben (Demo: Button zum Simulieren)
3. **Aufladen:** Button zeigt Ladebalken/-spinner, nach 2-3 Sekunden ist Guthaben verfügbar
4. **Übertrag:** Restguthaben bleibt erhalten (kein Verfall)

## 6. Acceptance Criteria

- [ ] Guthaben wird auf Startseite angezeigt
- [ ] Aufladen-Button öffnet Modal mit Betrag-Auswahl
- [ ] Nach Klick auf Aufladen: Ladeanimation 2-3 Sekunden
- [ ] Nach Ladezeit: Guthaben erhöht sich um gewählten Betrag
- [ ] Guthaben-Abzug bei Kauf wird korrekt berechnet
- [ ] Negatives Guthaben verhindert Kauf (genug Guthaben erforderlich)

## 7. UI/UX Vorgaben

- Guthaben prominent auf Startseite (z.B. oberer Bereich oder Header)
- Farbcodierung: Grün bei >20€, Gelb bei 10-20€, Rot bei <10€
- Aufladen-Button deutlich sichtbar
- Ladeanimation während Aufladung (Spinner oder Fortschrittsbalken)

## 8. Technische Hinweise

- Tabelle `user_credits` in Supabase
- Guthaben wird bei jedem Kauf/Aufladen aktualisiert
- Kein echter Payment-Provider
- Transaktionshistorie für spätere Funktionen vorbereiten
