# FEAT-10: Erweitertes Admin-Dashboard

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-5 (Admin-Basis) - für bestehende Admin-Funktionen
- Benötigt: FEAT-6 (Produktkatalog) - für Produktverwaltung

## 1. Overview

**Beschreibung:** Erweitertes Admin-Dashboard für umfassende Systemverwaltung ohne Bestellfunktion.

**Ziel:** Admin kann ausschließlich das System verwalten - keine Möglichkeit zu bestellen.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin möchte ich Nutzer verwalten (hinzufügen, aktivieren/deaktivieren, Guthaben zuweisen) | Must-Have |
| US-2 | Als Admin möchte ich Produkte verwalten (hinzufügen, ändern, aktivieren/deaktivieren, löschen, Bilder hochladen) | Must-Have |
| US-3 | Als Admin möchte ich Produktkategorien verwalten (hinzufügen, bearbeiten, aktivieren/deaktivieren, löschen) | Must-Have |
| US-4 | Als Admin möchte ich das System komplett zurücksetzen können | Must-Have |
| US-5 | Als Admin möchte ich das Guthaben aller Nutzer zurücksetzen können | Should-Have |
| US-6 | Als Admin möchte ich anonyme Statistiken einsehen (Bestellungen, Transaktionen, Logins, aktive Nutzer, Peak-Zeiten) | Must-Have |

## 3. Funktionale Anforderungen

### 3.1 Admin-Bereich (Kein Bestell-Dashboard)

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Admin hat KEIN Zugriff auf Produktkatalog/Bestellfunktion | Must-Have |
| REQ-2 | Admin wird bei Login auf /admin weitergeleitet (nicht /dashboard) | Must-Have |
| REQ-3 | Admin sieht KEIN Guthaben für sich selbst | Must-Have |
| REQ-4 | Admin-Bereich nur über /admin erreichbar | Must-Have |

### 3.2 Nutzer-Verwaltung

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-5 | Admin kann alle Nutzer in einer Liste sehen | Must-Have |
| REQ-6 | Admin kann neue Nutzer hinzufügen (Name, Email, Standort) | Must-Have |
| REQ-7 | Admin kann Nutzer aktivieren/deaktivieren (Toggle) | Must-Have |
| REQ-8 | Admin kann einzelnen Nutzern Guthaben zuweisen (manuell) | Must-Have |
| REQ-9 | Admin sieht KEINE Transaktionshistorie einzelner Nutzer | Must-Have |
| REQ-10 | Admin sieht KEINE Guthaben-Einzelwerte (nur aggregiert) | Must-Have |

### 3.3 Produkt-Verwaltung

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-11 | Admin kann alle Produkte in einer Liste/Tabelle sehen | Must-Have |
| REQ-12 | Admin kann neue Produkte hinzufügen | Must-Have |
| REQ-13 | Admin kann Produktdaten ändern (Name, Beschreibung, Preis, Kategorie) | Must-Have |
| REQ-14 | Admin kann Produkte aktivieren/deaktivieren | Must-Have |
| REQ-15 | Admin kann Produkte löschen | Must-Have |
| REQ-16 | Admin kann Bilder für Produkte hochladen | Must-Have |
| REQ-17 | Admin kann Kategorien zuweisen | Must-Have |

### 3.4 Produktkategorien-Verwaltung

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-18 | Admin kann alle Kategorien in einer Liste sehen | Must-Have |
| REQ-19 | Admin kann neue Kategorien hinzufügen | Must-Have |
| REQ-20 | Admin kann Kategorien bearbeiten | Must-Have |
| REQ-21 | Admin kann Kategorien aktivieren/deaktivieren | Must-Have |
| REQ-22 | Wenn Kategorie deaktiviert → alle Produkte dieser Kategorie werden NICHT deaktiviert, sondern nur im Frontend ausgeblendet | Must-Have |
| REQ-22a | Bei Wiederveraktivierung der Kategorie werden alle Produkte wieder sichtbar | Must-Have |
| REQ-22b | Admin kann Produkte auch einzeln deaktivieren (unabhängig von Kategorie) | Must-Have |
| REQ-23 | Admin kann Kategorien löschen (nur wenn Produkte zugeordnet) | Must-Have |
| REQ-23a | Beim Löschen einer Kategorie: Admin sieht Liste der betroffenen Produkte | Must-Have |
| REQ-23b | Admin kann Produkten neue Kategorien zuweisen (vor dem Löschen) | Must-Have |
| REQ-23c | Produkte können MEHREREN Kategorien zugeordnet werden | Must-Have |
| REQ-23d | Beim Löschen einer Kategorie: Nur Produkte neu zuordnen, die KEINE anderen Kategorien haben (kein Produkt soll ohne Kategorie sein) | Must-Have |
| REQ-24 | Admin kann Produkte einer Kategorie zuordnen | Must-Have |

### 3.5 System-Reset

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-25 | Admin kann System komplett zurücksetzen | Must-Have |
| REQ-26 | Bestätigungsdialog mit Eingabe "RESET" | Must-Have |
| REQ-27 | Guthaben-Reset单独 durchführbar | Should-Have |

### 3.6 Statistiken (Anonym)

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-28 | Admin kann Gesamt-Bestellungen sehen | Must-Have |
| REQ-29 | Admin kann Gesamt-Transaktionen sehen | Must-Have |
| REQ-30 | Admin kann Login-Versuche/-Erfolge sehen | Must-Have |
| REQ-31 | Admin kann aktive Nutzer (derzeit eingeloggt) sehen | Must-Have |
| REQ-32 | Admin kann Peak-Zeiten sehen (wann sind Nutzer eingeloggt) | Must-Have |
| REQ-33 | Alle Statistiken sind ANONYM (keine individuellen Daten) | Must-Have |

## 4. Navigation / Struktur

```
/admin
├── /admin/index      → Dashboard mit Statistiken
├── /admin/users      → Nutzer-Verwaltung
├── /admin/products   → Produkt-Verwaltung
├── /admin/categories → Kategorien-Verwaltung
└── /admin/reset     → System-Reset
```

## 5. UI-Komponenten

### 5.1 Admin-Dashboard (/admin/index)
- Statistik-Karten:
  - Gesamt-Bestellungen (heute/woche/gesamt)
  - Gesamt-Transaktionen (heute/woche/gesamt)
  - Aktive Nutzer (eingeloggt)
  - Login-Versuche (erfolgreich/fehlgeschlagen)
  - Peak-Zeiten (grafische Darstellung)

### 5.2 Nutzer-Verwaltung (/admin/users)
- Suchfeld
- Filter nach Status (aktiv/inaktiv)
- Tabelle: Name, Email, Standort, Status, Aktionen
- "Neuer Nutzer" Button → Modal/Page
- Guthaben zuweisen: Modal mit Eingabefeld

### 5.3 Produkt-Verwaltung (/admin/products)
- Tabelle/Karten-Ansicht: Bild, Name, Preis, Kategorie, Status
- Filter nach Kategorie, Status
- "Neues Produkt" Button
- Bearbeiten: Slide-over oder Modal
- Bild-Upload: Drag & Drop oder Datei-Auswahl
- Löschen mit Bestätigung

### 5.4 Kategorien-Verwaltung (/admin/categories)
- Liste der Kategorien
- "Neue Kategorie" Button
- Bearbeiten: Modal
- Toggle für aktivieren/deaktivieren
- Löschen: nur möglich wenn keine Produkte zugeordnet

## 6. Acceptance Criteria

### Admin-Bereich
- [ ] Admin-Login leitet auf /admin weiter (nicht /dashboard)
- [ ] Admin hat KEINE Möglichkeit zu bestellen
- [ ] Admin sieht KEIN eigenes Guthaben

### Nutzer-Verwaltung
- [ ] Admin kann Nutzer-Liste sehen
- [ ] Admin kann neue Nutzer hinzufügen
- [ ] Admin kann Nutzer aktivieren/deaktivieren
- [ ] Admin kann einzelnen Nutzern Guthaben zuweisen
- [ ] Admin sieht KEINE Transaktionshistorie einzelner Nutzer

### Produkt-Verwaltung
- [ ] Admin kann Produkt-Liste sehen
- [ ] Admin kann neue Produkte hinzufügen
- [ ] Admin kann Produktdaten ändern
- [ ] Admin kann Produkte aktivieren/deaktivieren
- [ ] Admin kann Produkte löschen
- [ ] Admin kann Bilder hochladen

### Kategorien-Verwaltung
- [ ] Admin kann Kategorie-Liste sehen
- [ ] Admin kann neue Kategorien hinzufügen
- [ ] Admin kann Kategorien bearbeiten
- [ ] Admin kann Kategorien aktivieren/deaktivieren
- [ ] Deaktivierte Kategorien blenden zugehörige Produkte aus (ohne sie zu deaktivieren)
- [ ] Bei Reaktivierung werden alle Produkte wieder sichtbar
- [ ] Admin kann Produkte mehreren Kategorien zuordnen
- [ ] Admin kann Kategorien löschen mit Produkten → zeigt betroffene Produkte
- [ ] Admin kann Produkten neue Kategorien zuweisen beim Löschen
- [ ] Niemals Produkt ohne Kategorie möglich

### Reset-Funktionen
- [ ] System-Reset mit Bestätigungsdialog
- [ ] Guthaben-Reset单独

### Statistiken
- [ ] Anonyme Bestellstatistiken
- [ ] Anonyme Transaktionsstatistiken
- [ ] Login-Statistiken
- [ ] Aktive Nutzer (eingeloggt)
- [ ] Peak-Zeiten Übersicht

## 7. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Kategorie löschen mit zugeordneten Produkten | Modal zeigt Liste der betroffenen Produkte; Admin kann neue Kategorien zuweisen |
| EC-1a | Produkt in mehreren Kategorien | Wenn Kategorie gelöscht wird, bleibt Produkt in anderen Kategorien sichtbar |
| EC-1b | Produkt nur in einer Kategorie | Admin muss neue Kategorie zuweisen bevor Löschung möglich |
| EC-1c | Produkt ohne Kategorie | Darf NIEMALS passieren - Validierung verhindert das |
| EC-2 | Kategorie deaktivieren mit aktiven Produkten | Produkte werden NICHT deaktiviert, nur im Frontend ausgeblendet |
| EC-2a | Kategorie wieder aktivieren | Alle Produkte werden automatisch wieder sichtbar |
| EC-2b | Produkt zusätzlich deaktiviert | Auch bei aktiver Kategorie bleibt Produkt unsichtbar |
| EC-3 | Bild-Upload fehlschlägt | Fehlermeldung, Produkt wird nicht gespeichert |
| EC-4 | Guthaben zuweisen an deaktivierten Nutzer | Erlaubt, Nutzer kann bei Reaktivierung damit bestellen |
| EC-5 | Parallele Reset-Anfragen | Nur eine Anfrage zurzeit (Queue/Lock) |
| EC-6 | Produkt löschen mit Bestellhistorie | Nur Soft-Delete (als inaktiv markieren) |
| EC-7 | Peak-Zeiten bei sehr wenig Nutzung | "Keine Daten verfügbar" anzeigen |

## 8. Technische Anforderungen

- **File-Upload:** Bild-Upload für Produkte (max. 5MB, JPG/PNG/WebP)
- **Datenbank:** Neon mit Drizzle ORM
- **Auth:** Cookie-basiert (bestehend)
- **Middleware:** /admin Routes nur für Admin-Rolle

## 9. API Endpoints (Übersicht)

| Endpoint | Methode | Beschreibung |
|----------|--------|--------------|
| `/api/admin/stats` | GET | Anonyme Statistiken |
| `/api/admin/users` | GET | Nutzer-Liste |
| `/api/admin/users` | POST | Neuer Nutzer |
| `/api/admin/users/:id` | PATCH | Nutzer bearbeiten |
| `/api/admin/users/:id/toggle` | POST | Aktivieren/Deaktivieren |
| `/api/admin/users/:id/credit` | POST | Guthaben zuweisen |
| `/api/admin/products` | GET | Produkt-Liste |
| `/api/admin/products` | POST | Neues Produkt |
| `/api/admin/products/:id` | PATCH | Produkt bearbeiten |
| `/api/admin/products/:id` | DELETE | Produkt löschen |
| `/api/admin/products/:id/image` | POST | Bild hochladen |
| `/api/admin/categories` | GET | Kategorie-Liste |
| `/api/admin/categories` | POST | Neue Kategorie |
| `/api/admin/categories/:id` | PATCH | Kategorie bearbeiten |
| `/api/admin/categories/:id` | DELETE | Kategorie löschen |
| `/api/admin/categories/:id/toggle` | POST | Aktivieren/Deaktivieren |
| `/api/admin/reset` | POST | System-Reset |
| `/api/admin/credits/reset` | POST | Guthaben-Reset |

---

## 10. UX Design

### 10.1 Personas-Analyse

**Wichtig:** FEAT-10 betrifft keine End-User Personas, sondern die **Admin-Rolle**.

Die existierenden Personas (Nina, Maxine, Lucas, Alex, Sarah, David, Mia, Tom, Emily, Martin) sind alle End-User. FEAT-10 benötigt eine **Admin-Persona**.

#### Admin-Persona (neu)

**Name:** Sandra Systemverwalter  
**Alter:** 42 Jahre  
**Rolle:** System-Administrator / Office Manager

**Hintergrund:**
- Verantwortlich für die Verwaltung des SnackEase-Systems
- Technisch versiert, aber kein Entwickler
- Arbeitet oft unter Zeitdruck
- Muss Nutzer-Support leisten

**Ziele:**
- Effiziente Systemverwaltung
- Schnelle Problemlösung bei Nutzer-Anfragen
- Überblick über System-Nutzung
- Fehlerfreie Produkt-/Kategorien-Verwaltung

**Bedürfnisse:**
- Klare, strukturierte Oberfläche
- Schneller Zugriff auf häufige Aktionen
- Fehlertoleranz (Undo-Funktionen, Bestätigungen)
- Aussagekräftige Statistiken
- Bulk-Operationen (mehrere Produkte/Nutzer gleichzeitig)

**Pain Points:**
- Versehentliches Löschen von Daten
- Unklare Auswirkungen von Aktionen (z.B. Kategorie deaktivieren)
- Zeitaufwändige Einzel-Operationen
- Fehlende Übersicht bei vielen Produkten/Nutzern
- Komplizierte Workflows

**Technische Fähigkeiten:** Mittel (kann mit Admin-Tools umgehen, aber braucht intuitive UI)

### 10.2 Personas-Abdeckung

| Persona | Relevanz | Abdeckung | Anmerkungen |
|---------|----------|-----------|-------------|
| Nina (Neuanfang) | ❌ Keine | - | End-User, kein Admin-Zugriff |
| Maxine (Snackliebhaber) | ❌ Keine | - | End-User, kein Admin-Zugriff |
| Lucas (Gesundheitsfan) | ❌ Keine | - | End-User, kein Admin-Zugriff |
| Alex (Gelegenheitskäufer) | ❌ Keine | - | End-User, kein Admin-Zugriff |
| Tom (Schnellkäufer) | ❌ Keine | - | End-User, kein Admin-Zugriff |
| **Sandra (Admin)** | ✅ Primär | ✅ 100% | Alle Features für Admin-Rolle |

**Wichtig:** Admin hat KEINE End-User-Features (kein Bestellen, kein Guthaben sehen).

### 10.3 User Flows

#### Flow 1: Nutzer verwalten

**Akteur:** Sandra (Admin)  
**Ziel:** Neuen Nutzer hinzufügen

**Haupt-Flow:**
```
1. Login als admin@demo.de
2. Redirect zu /admin (Dashboard)
3. Navigation: "Nutzer" klicken
4. Button "Neuer Nutzer" klicken
5. Modal öffnet sich
6. Felder ausfüllen:
   - Name (Pflicht)
   - Email (Pflicht)
   - Standort (Select: Nürnberg/Berlin)
7. "Speichern" klicken
8. Modal schließt
9. Toast: "Nutzer erfolgreich angelegt"
10. Nutzer erscheint in Liste
```

**Alternative Flows:**
- **Fehler:** Validation fehlschlägt → Fehlermeldung unter Feld, Modal bleibt offen
- **Abbruch:** "Abbrechen" klicken → Modal schließt, keine Änderung
- **Doppelte Email:** "Email bereits vergeben" → Fehlermeldung

---

#### Flow 2: Guthaben zuweisen

**Akteur:** Sandra (Admin)  
**Ziel:** Nutzer zusätzliches Guthaben geben

**Haupt-Flow:**
```
1. Auf /admin/users
2. Nutzer in Liste finden (Suche oder Scrollen)
3. Button "Guthaben zuweisen" klicken
4. Modal öffnet sich
5. Betrag eingeben (z.B. 10€)
6. Optional: Notiz (z.B. "Bonus für Event")
7. "Zuweisen" klicken
8. Modal schließt
9. Toast: "Guthaben zugewiesen"
```

**Alternative Flows:**
- **Ungültiger Betrag:** (z.B. negativ, 0) → Fehlermeldung
- **Deaktivierter Nutzer:** Guthaben-Zuweisung erlaubt (für spätere Reaktivierung)

---

#### Flow 3: Produkt mit Bild hinzufügen

**Akteur:** Sandra (Admin)  
**Ziel:** Neues Produkt zum Katalog hinzufügen

**Haupt-Flow:**
```
1. Auf /admin/products
2. Button "Neues Produkt" klicken
3. Slide-over oder Modal öffnet sich
4. Felder ausfüllen:
   - Name (Pflicht)
   - Beschreibung (Optional)
   - Preis (Pflicht, z.B. 2.50)
   - Kategorien auswählen (Multi-Select, mind. 1)
5. Bild hochladen:
   - Drag & Drop ODER
   - "Datei auswählen" klicken
   - Vorschau anzeigen
6. "Speichern" klicken
7. Validierung läuft
8. Produkt wird angelegt
9. Toast: "Produkt erfolgreich angelegt"
10. Produkt erscheint in Liste
```

**Alternative Flows:**
- **Bild-Upload fehlschlägt:** Fehlermeldung, Produkt wird NICHT gespeichert
- **Bild zu groß:** (>5MB) → "Bild zu groß (max. 5MB)"
- **Falsches Format:** (z.B. PDF) → "Nur JPG, PNG, WebP erlaubt"
- **Keine Kategorie:** Validierung verhindert Speichern → "Mind. 1 Kategorie erforderlich"

---

#### Flow 4: Kategorie löschen mit Produkten

**Akteur:** Sandra (Admin)  
**Ziel:** Kategorie löschen

**Haupt-Flow (Produkte in mehreren Kategorien):**
```
1. Auf /admin/categories
2. Kategorie in Liste finden
3. "Löschen" Button klicken
4. Modal öffnet sich:
   - "Diese Kategorie enthält X Produkte"
   - Liste der betroffenen Produkte
   - Für jedes Produkt: Anzahl verbleibender Kategorien
5. Produkte mit nur 1 Kategorie (kritisch):
   - ⚠️ Symbol
   - "Neue Kategorie zuweisen" Dropdown
6. Produkte mit >1 Kategorie:
   - ✅ Symbol
   - "Verbleibende Kategorien: ..." (Info)
7. Alle kritischen Produkte neu zugewiesen?
   - Ja: "Löschen" Button aktiv
   - Nein: "Löschen" Button deaktiviert
8. "Löschen" klicken
9. Kategorie wird gelöscht
10. Toast: "Kategorie gelöscht, X Produkte neu zugewiesen"
11. Zurück zu /admin/categories
```

**Alternative Flows:**
- **Abbruch:** "Abbrechen" → Modal schließt, keine Änderung
- **Keine Produkte:** Kategorie kann direkt gelöscht werden
- **Produkt ohne alternative Kategorie:** Admin MUSS neue Kategorie zuweisen

---

#### Flow 5: Kategorie deaktivieren

**Akteur:** Sandra (Admin)  
**Ziel:** Kategorie temporär ausblenden

**Haupt-Flow:**
```
1. Auf /admin/categories
2. Kategorie in Liste finden
3. Toggle "Aktiv" klicken
4. Bestätigungsdialog (optional):
   - "Diese Kategorie enthält X Produkte"
   - "Produkte werden im Frontend ausgeblendet (nicht deaktiviert)"
5. "Bestätigen" klicken
6. Toggle ändert sich auf "Inaktiv"
7. Toast: "Kategorie deaktiviert"
```

**Wichtig:**
- Produkte werden NICHT deaktiviert (Status bleibt)
- Produkte werden nur im Frontend ausgeblendet
- Bei Reaktivierung: Alle Produkte wieder sichtbar

---

#### Flow 6: System-Reset

**Akteur:** Sandra (Admin)  
**Ziel:** Alle Demo-Daten zurücksetzen

**Haupt-Flow:**
```
1. Auf /admin (Dashboard)
2. Button "System-Reset" klicken
3. Modal öffnet sich:
   - ⚠️ Warnung: "ACHTUNG: Alle Daten werden gelöscht"
   - Liste was gelöscht wird:
     - Alle Käufe
     - Alle Transaktionen
     - Guthaben (zurück auf 25€)
     - Leaderboard
   - Liste was NICHT gelöscht wird:
     - Produkte
     - Kategorien
     - Nutzer (nur Guthaben)
   - Eingabefeld: "Tippe RESET zum Bestätigen"
4. "RESET" eintippen
5. "Bestätigen" Button wird aktiv
6. "Bestätigen" klicken
7. Ladezustand (Spinner)
8. Reset läuft (SQL-Transaktion)
9. Erfolgsmeldung
10. Dashboard aktualisiert (Stats = 0)
```

**Alternative Flows:**
- **Falsche Eingabe:** Button bleibt deaktiviert
- **Abbruch:** Modal schließen
- **Fehler:** Rollback, Fehlermeldung "Reset fehlgeschlagen"

---

#### Flow 7: Statistiken einsehen

**Akteur:** Sandra (Admin)  
**Ziel:** System-Nutzung überblicken

**Haupt-Flow:**
```
1. Login als Admin
2. Redirect zu /admin (Dashboard)
3. Dashboard zeigt Statistik-Karten:
   - Gesamt-Nutzer (Anzahl)
   - Bestellungen (heute/woche/gesamt)
   - Transaktionen (heute/woche/gesamt)
   - Aktive Nutzer (derzeit eingeloggt)
   - Login-Versuche (erfolgreich/fehlgeschlagen)
   - Peak-Zeiten (Diagramm)
4. Über Statistiken hovern:
   - Tooltip mit Details
5. Optional: Zeitraum-Filter (heute/woche/monat)
```

**Alternative Flows:**
- **Keine Daten:** "Keine Daten verfügbar" anzeigen
- **Sehr wenig Nutzung:** Peak-Zeiten = "Nicht genug Daten"

### 10.4 Wireframes (Text-basiert)

#### Wireframe 1: Admin-Dashboard (/admin)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase Admin                    [Sandra] [Logout]│
├─────────────────────────────────────────────────────────────┤
│ Navigation (horizontal)                                      │
│ [Dashboard*] [Nutzer] [Produkte] [Kategorien]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Dashboard                                                    │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ 👥 Nutzer│ │📦 Bestel│ │💰 Trans- │ │🟢 Aktive │       │
│ │   42     │ │    128   │ │   156    │ │    8     │       │
│ │          │ │  (heute) │ │  (heute) │ │          │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ ┌──────────────────────────────────────────────┐           │
│ │ 📊 Peak-Zeiten (Login-Aktivität)            │           │
│ │                                               │           │
│ │     |█                                        │           │
│ │     |██    █                                  │           │
│ │ ────|███─█████──────────────────────────     │           │
│ │   8-10 12-14  16-18  20-22                   │           │
│ └──────────────────────────────────────────────┘           │
│                                                              │
│ Aktionen                                                     │
│ ┌──────────────────────┐ ┌──────────────────────┐          │
│ │ ⚠️ System-Reset      │ │ 🔄 Guthaben-Reset    │          │
│ └──────────────────────┘ └──────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Wireframe 2: Nutzer-Verwaltung (/admin/users)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase Admin                    [Sandra] [Logout]│
├─────────────────────────────────────────────────────────────┤
│ Navigation (horizontal)                                      │
│ [Dashboard] [Nutzer*] [Produkte] [Kategorien]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Nutzer-Verwaltung                                           │
│                                                              │
│ ┌────────────────────┐  [Filter: Alle ▾]  [+ Neuer Nutzer] │
│ │ 🔍 Suche...        │                                       │
│ └────────────────────┘                                       │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Name          Email              Standort   Status Akt. ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Nina Neuanfang nina@demo.de     Nürnberg   ✅ [💰][✏️]││
│ │ Maxine Snack   maxine@demo.de   Berlin     ✅ [💰][✏️]││
│ │ Lucas Gesund   lucas@demo.de    Nürnberg   🔴 [💰][✏️]││
│ │ ...                                                      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                              │
│ Legende: ✅ = Aktiv, 🔴 = Inaktiv, 💰 = Guthaben, ✏️ = Edit│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Wireframe 3: Produkt-Verwaltung (/admin/products)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase Admin                    [Sandra] [Logout]│
├─────────────────────────────────────────────────────────────┤
│ Navigation (horizontal)                                      │
│ [Dashboard] [Nutzer] [Produkte*] [Kategorien]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Produkt-Verwaltung                                          │
│                                                              │
│ [Filter: Kategorie ▾] [Filter: Status ▾] [+ Neues Produkt] │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ [Bild]   │ │ [Bild]   │ │ [Bild]   │ │ [Bild]   │       │
│ │ Apfel    │ │ Proteinr.│ │ Shake    │ │ Schokor. │       │
│ │ 1.50 €   │ │ 2.50 €   │ │ 3.00 €   │ │ 1.80 €   │       │
│ │ Obst     │ │ Protein  │ │ Getränke │ │ Süß      │       │
│ │ ✅ Aktiv │ │ ✅ Aktiv │ │ 🔴 Inakt │ │ ✅ Aktiv │       │
│ │ [✏️][🗑️] │ │ [✏️][🗑️] │ │ [✏️][🗑️] │ │ [✏️][🗑️] │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Wireframe 4: Kategorie löschen (Modal)

```
┌─────────────────────────────────────────────────────────────┐
│                 Kategorie löschen                      [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ⚠️ Diese Kategorie enthält 5 Produkte                       │
│                                                              │
│ Produkte mit mehreren Kategorien (kein Problem):            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ✅ Apfel (Verbleibend: Obst, Gesund)                  │   │
│ │ ✅ Banane (Verbleibend: Obst, Gesund)                 │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ Produkte mit nur dieser Kategorie (neue Kategorie nötig):   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ⚠️ Proteinriegel  [Neue Kategorie: Protein ▾]        │   │
│ │ ⚠️ Shake          [Neue Kategorie: Getränke ▾]       │   │
│ │ ⚠️ Nussmix        [Neue Kategorie: Snacks ▾]         │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│                                                              │
│              [Abbrechen]  [Löschen (deaktiviert)]           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Hinweis:** "Löschen" Button wird erst aktiv, wenn alle kritischen Produkte neu zugewiesen wurden.

### 10.5 Accessibility-Prüfung (WCAG 2.1)

| Prüfpunkt | Status | Implementierung |
|-----------|--------|-----------------|
| **1. Wahrnehmbar** | | |
| Farbkontrast > 4.5:1 | ✅ | Dunkler Text auf hellem Hintergrund |
| Text-Alternativen für Bilder | ✅ | Alt-Text für Produkt-Bilder Pflicht |
| Responsives Design | ✅ | Desktop + Tablet optimiert |
| **2. Bedienbar** | | |
| Tastatur-Navigation | ✅ | Tab-Reihenfolge logisch, alle Buttons erreichbar |
| Fokus-Indikatoren | ✅ | Sichtbarer Focus Ring |
| Zeitlimits | ✅ | Kein Zeitlimit für Aktionen |
| Touch-Targets | ✅ | Min. 44x44px Buttons |
| **3. Verständlich** | | |
| Klare Fehlermeldungen | ✅ | "Email bereits vergeben" statt "Error 409" |
| Konsistente Navigation | ✅ | Header-Navigation auf allen Seiten |
| Hilfe-Texte | ✅ | Tooltips für komplexe Aktionen |
| **4. Robust** | | |
| Semantisches HTML | ✅ | `<button>`, `<form>`, `<table>` richtig verwendet |
| ARIA-Labels | ✅ | `aria-label` für Icon-Buttons |
| Screen Reader | ✅ | Alt-Text, Labels, ARIA-Roles |

### 10.6 UX-Empfehlungen

#### Priorität: Must-Have

1. **Bestätigungsdialoge für destruktive Aktionen**
   - System-Reset: "RESET" eintippen
   - Kategorie löschen: Produkt-Liste zeigen
   - Nutzer löschen: Bestätigung mit Name

2. **Klare Feedback-Mechanismen**
   - Toast-Notifications für alle Aktionen
   - Ladezustände (Spinner) bei langsamen Operationen
   - Erfolgs-/Fehlermeldungen mit Icon (✅/❌)

3. **Fehlertoleranz**
   - Undo-Funktion für Nutzer deaktivieren (reaktivieren möglich)
   - Soft-Delete für Produkte (bei Bestellhistorie)
   - Validierung BEVOR Aktion ausgeführt wird

4. **Übersichtliche Darstellung**
   - Suchfeld bei langen Listen
   - Filter (Status, Kategorie)
   - Pagination (max. 50 Einträge pro Seite)

5. **Produkt-Kategorien-Logik visuell klar**
   - ⚠️ Symbol für kritische Produkte (nur 1 Kategorie)
   - ✅ Symbol für unkritische Produkte (mehrere Kategorien)
   - Anzahl verbleibender Kategorien anzeigen

#### Priorität: Should-Have

6. **Bulk-Operationen**
   - Mehrere Nutzer gleichzeitig deaktivieren (Checkboxen)
   - Mehrere Produkte einer Kategorie zuordnen
   - Guthaben für mehrere Nutzer gleichzeitig zuweisen

7. **Statistiken-Visualisierung**
   - Peak-Zeiten als Balken-Diagramm
   - Trend-Anzeige (↗️/↘️) für Vergleich zu letzter Woche
   - Export-Funktion (CSV) für Statistiken

8. **Schnellzugriffe**
   - Letzte 5 Aktionen im Dashboard
   - Favoriten-Produkte für schnelle Bearbeitung
   - Keyboard-Shortcuts (z.B. Strg+K für Suche)

#### Priorität: Nice-to-Have

9. **Drag & Drop**
   - Produkte per Drag & Drop Kategorien zuweisen
   - Reihenfolge von Produkten im Katalog ändern

10. **Erweiterte Filter**
    - Nutzer nach Standort/Guthaben filtern
    - Produkte nach Preis-Range filtern
    - Datum-Range für Statistiken

### 10.7 Interaktions-Pattern

#### Pattern 1: Modal vs. Slide-over

**Regel:**
- **Modal:** Für kritische Aktionen (Reset, Löschen, Bestätigungen)
- **Slide-over:** Für Formulare (Produkt bearbeiten, Nutzer anlegen)

**Warum?**
- Modal blockiert Hintergrund → Nutzer muss Entscheidung treffen
- Slide-over zeigt noch Kontext (z.B. Produkt-Liste sichtbar beim Bearbeiten)

#### Pattern 2: Inline Edit vs. Separate Page

**Regel:**
- **Inline Toggle:** Status aktivieren/deaktivieren (schnell, häufig)
- **Slide-over/Modal:** Alle anderen Bearbeitungen (Name, Preis, etc.)

**Warum?**
- Toggle ist schnell und häufig genutzt
- Komplexere Bearbeitungen brauchen Fokus

#### Pattern 3: Toast-Notifications

**Regel:**
- **Erfolg:** Grünes Toast (✅) für 3 Sekunden
- **Fehler:** Rotes Toast (❌) für 5 Sekunden (mit "Details" Link)
- **Warnung:** Gelbes Toast (⚠️) für 4 Sekunden

**Warum?**
- Nutzer bekommt sofortiges Feedback
- Nicht blockierend (kein Modal)
- Fehler-Toast länger → User kann Fehlermeldung lesen

### 10.8 Responsive Design

| Breakpoint | Layout | Anpassungen |
|------------|--------|-------------|
| Desktop (>1024px) | Primär | Volle Tabellen, Side-by-Side Karten |
| Tablet (768-1024px) | Unterstützt | Karten untereinander, kleinere Tabellen |
| Mobile (<768px) | Nicht unterstützt | Admin-Bereich nur auf Desktop/Tablet |

**Begründung:** Admin-Workflows sind komplex und brauchen größeren Screen.

### 10.9 Performance-Anforderungen

| Aktion | Max. Ladezeit | Feedback |
|--------|---------------|----------|
| Nutzer-Liste laden | 200ms | Skeleton Loader |
| Produkt-Liste laden | 300ms | Skeleton Loader |
| Bild-Upload | 2s | Progress Bar |
| System-Reset | 5s | Spinner mit Text "Daten werden zurückgesetzt..." |

### 10.10 Security UX

1. **Session-Timeout:** Nach 30min Inaktivität → Auto-Logout mit Warnung (1min vorher)
2. **Unsaved Changes:** "Änderungen verwerfen?" Dialog beim Verlassen
3. **Admin-Actions Logging:** (Nicht sichtbar für Admin, aber Backend tracked alle Aktionen)

---

## 11. UX Review Checklist

- [✅] Personas-Analyse: Admin-Persona definiert
- [✅] User Flows: 7 Haupt-Flows dokumentiert
- [✅] Wireframes: 4 Key-Screens visualisiert
- [✅] Accessibility: WCAG 2.1 AA Konformität geprüft
- [✅] Empfehlungen: Must-Have/Should-Have/Nice-to-Have dokumentiert
- [✅] Interaktions-Pattern: Modal, Slide-over, Toast definiert
- [✅] Responsive Design: Desktop/Tablet (Mobile nicht unterstützt)
- [✅] Performance: Ladezeiten definiert

---

**Status:** 🟡 UX Design Complete  
**Nächster Schritt:** Solution Architect (Tech-Design)
