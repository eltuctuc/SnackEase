# SnackEase - Agenten Anweisungen

Dieses Dokument enthält zentrale Regeln und Workflows für die Entwicklung.

---

## Sprache

**WICHTIG:** Alle Ausgaben des Agents müssen auf **Deutsch** sein.
- Zusammenfassungen auf Deutsch
- Kommentare auf Deutsch
- Dokumentation auf Deutsch
- Alle Kommunikation mit dem Benutzer auf Deutsch

---

## Feature-Nummerierung

### Regeln
1. **Keine Doppelung:** Niemals zwei Features mit derselben Nummer anlegen
2. **Nächste Nummer:** Immer die nächste freie Nummer verwenden (siehe `features/index.md`)
3. **Erweiterungen:** Erweiterungen zu bestehenden Features als Unterpunkt dokumentieren (keine neue Nummer)
4. **Tracking:** Nach jedem neuen Feature `features/index.md` aktualisieren

### Aktuelle Nummerierung
- Höchste vergebene Nummer: **FEAT-8**
- Nächste freie Nummer: **FEAT-9**

### Bei neuen Features
1. `features/index.md` prüfen für nächste freie Nummer
2. Neues Feature mit dieser Nummer erstellen
3. `features/index.md` und `features/sequence.md` aktualisieren

---

## Feature-Reihenfolge

### Umsetzungsreihenfolge
Siehe `features/sequence.md` für die aktuelle empfohlene Reihenfolge.

### Bei Abweichungen
1. `features/sequence.md` aktualisieren
2. Betroffene Feature-Files: Abhängigkeiten anpassen
3. Grund für Änderung dokumentieren

---

## Feature-Entwicklung Workflow

### 1. Requirements Engineer
- Feature-Spec erstellen in `features/FEAT-X.md`
- `features/index.md` aktualisieren
- `features/sequence.md` aktualisieren

### 2. UX Expert (optional)
- Design prüfen und optimieren

### 3. Solution Architect
- Tech-Design erstellen

### 4. Development
- Feature implementieren auf Branch `feat/FEAT-X-feature-name`

### 5. QA Engineer
- Testen und dokumentieren
- Keine separaten Bug-Files mehr (Bugs in Feature-Docs dokumentieren)

### 6. Nach dem Merge
- `features/index.md` aktualisieren (Feature als implementiert markieren)
- `features/sequence.md` aktualisieren (Reihenfolge anpassen)
- Feature-Status in FEAT-X.md auf "✅ Implementiert" setzen

---

## Bugs

- **Jeder Bug** → Eigenes Markdown-File in `./bugs/BUG-[FEAT-Nummer]-[laufende Nummer].md`
- **BUG-ID Format:** `BUG-[FEAT-Nummer]-[laufende Nummer]` z.B. `BUG-FEAT4-001`
- **Im Feature-File:** Offene Bugs nach Priorität dokumentieren (Critical zuerst)
- **Bei Fix:** Bug-File löschen UND aus Feature-File entfernen
- **Template:** Siehe `./bugs/TEMPLATE.md`

---

## Ordner-Struktur

```
├── features/                    # Feature-Spezifikationen
│   ├── index.md                # Feature-Nummern-Übersicht
│   ├── sequence.md             # Umsetzungsreihenfolge
│   └── FEAT-*.md               # Einzelne Features (inkl. UX-Review + Tech-Design + QA-Ergebnis)
├── docs/                        # Projektdokumentation
│   ├── FEAT-X-feature-name.md  # Post-Impl.-Doku (erstellt von QA nach erfolgreichem Test)
│   ├── qa-reports/             # QA-Reports: FEAT-X-qa-report.md
│   └── ...                     # Sonstige Projektdokumentation (PRD, Personas, etc.)
├── bugs/                        # Bug-Files: BUG-FEAT-X-NNN.md
├── src/                         # Quellcode
└── .claude/                     # Agenten-Konfiguration
```

## ⛔ No-Gos: Datei-Ablage

| Was | Falsch | Richtig |
|-----|--------|---------|
| UX-Review-Ergebnis | `docs/ux-review-FEAT-X.md` | Als Abschnitt in `features/FEAT-X.md` |
| Architektur-Dokument | `docs/architecture-FEAT-X.md` | Als Abschnitt in `features/FEAT-X.md` |
| QA-Report | `docs/qa-report-FEAT-X.md` | `docs/qa-reports/FEAT-X-qa-report.md` |

**Merksatz:** Feature-Artefakte (UX, Architektur, Implementation Notes, QA-Ergebnis) gehören IN die Feature-Spec unter `features/FEAT-X.md`. Nur Post-Impl.-Doku und QA-Reports landen in `docs/`.
