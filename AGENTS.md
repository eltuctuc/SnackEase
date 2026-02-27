# SnackEase - Agenten Anweisungen

Dieses Dokument enthält zentrale Regeln und Workflows für die Entwicklung.

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

---

## Bugs

- **Gelöscht:** Bugs werden nicht mehr in separaten Files dokumentiert
- Stattdessen: Bugs direkt in der Feature-Datei im QA-Abschnitt vermerken

---

## Ordner-Struktur

```
├── features/           # Feature-Spezifikationen
│   ├── index.md       # Feature-Nummern-Übersicht
│   ├── sequence.md    # Umsetzungsreihenfolge
│   └── FEAT-*.md      # Einzelne Features
├── docs/              # Projektdokumentation
├── src/               # Quellcode
└── .claude/           # Agenten-Konfiguration
```
