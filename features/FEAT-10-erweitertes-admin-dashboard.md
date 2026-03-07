# FEAT-10: Erweitertes Admin-Dashboard

## Status: 🟢 Implemented

## Teilweise implementiert (Basis aus FEAT-5)

| Bereich | Status | Details |
|---------|--------|---------|
| Admin-Dashboard `/admin` | ⚠️ Basis | Stats-Karten, Reset-Modals vorhanden; Navigation fehlt |
| Nutzer-Verwaltung `/admin/users` | ⚠️ Basis | Liste, Erstellen, Toggle vorhanden; Edit + Guthaben-Zuweisung fehlt |
| Produkt-Verwaltung `/admin/products` | ❌ Fehlt | Seite und alle APIs fehlen |
| Kategorie-Verwaltung `/admin/categories` | ❌ Fehlt | Seite, APIs und DB-Schema fehlen |
| System-Reset | ⚠️ Bug | Löscht nicht `purchases`-Tabelle (EC-8) |
| Guthaben-Reset | ✅ Implementiert | - |

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
| REQ-28 | Admin kann Gesamt-Bestellungen sehen (aus `purchases`-Tabelle, nicht `creditTransactions`) | Must-Have |
| REQ-29 | Admin kann Gesamt-Transaktionen sehen (Guthaben-Aufladungen + Käufe) | Must-Have |
| REQ-30 | Admin kann Login-Versuche/-Erfolge sehen | Must-Have |
| REQ-31 | Admin kann Gesamt-Nutzer und Mitarbeiter-Nutzer sehen | Must-Have |
| REQ-32 | Admin kann Peak-Zeiten sehen (Zeitraum-Aggregation aus `login_events`) | Should-Have |
| REQ-33 | Alle Statistiken sind ANONYM (keine individuellen Daten) | Must-Have |

> **Implementierungs-Hinweis REQ-30/32:** Login-Statistiken und Peak-Zeiten erfordern die neue `login_events`-Tabelle (siehe 8.1). Ohne diese Tabelle können nur REQ-28/29/31/33 implementiert werden. REQ-30/32 sind daher abhängig von der DB-Migration.

> **Aktuell implementierte Stats (Teilimplementierung):** `totalUsers`, `activeUsers (= Mitarbeiter-Rolle)`, `totalTransactions (creditTransactions)`, `todayTransactions`, `totalCredits`. Fehlend: `totalPurchases`, `todayPurchases`, Login-Events, Peak-Zeiten.

### 3.7 Admin-Navigation

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-34 | Admin-Bereich hat eine persistente horizontale Navigation: Dashboard, Nutzer, Produkte, Kategorien | Must-Have |
| REQ-35 | Aktiver Navigationspunkt ist visuell hervorgehoben | Must-Have |
| REQ-36 | Admin sieht KEINEN Link zum User-Dashboard (`/dashboard`) im Admin-Bereich | Must-Have |
| REQ-37 | Wenn Admin `/dashboard` aufruft, wird er zu `/admin` weitergeleitet | Must-Have |

> **Bekannte Abweichung:** Die aktuelle `admin/index.vue` zeigt einen „Zurück zum Dashboard" Button, der zu `/dashboard` (User-Ordering-Bereich) navigiert. Das widerspricht REQ-1 und REQ-36 und ist im Rahmen von FEAT-10 zu entfernen.

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
| EC-6 | Produkt löschen mit Bestellhistorie | Nur Soft-Delete (`isActive = false`), keine echte Löschung |
| EC-7 | Peak-Zeiten bei sehr wenig Nutzung | "Keine Daten verfügbar" anzeigen |
| EC-8 | System-Reset muss `purchases` löschen | Aktuell löscht `/api/admin/reset` nur `creditTransactions` und setzt Guthaben zurück — `purchases` wird NICHT gelöscht (Bug). Reset muss auch `purchases`-Tabelle leeren. |
| EC-9 | Produkt-Kategorie bei Soft-Delete | Wenn Produkt auf `isActive = false` gesetzt wird, bleibt es in `product_categories` — beim Reaktivieren ist Kategorie-Zuordnung noch vorhanden |
| EC-10 | Kategorie deaktivieren vs. Produkt deaktivieren | Produkt ist ausgeblendet wenn: Produkt.isActive = false ODER Kategorie.isActive = false. Logische ODER-Verknüpfung im Frontend-Filter |

## 8. Technische Anforderungen

- **File-Upload:** Bild-Upload für Produkte (max. 5MB, JPG/PNG/WebP)
- **Datenbank:** Neon mit Drizzle ORM
- **Auth:** Cookie-basiert (bestehend)
- **Middleware:** /admin Routes nur für Admin-Rolle

### 8.1 Erforderliche DB-Schema-Migrationen

Die folgenden Schema-Änderungen sind für FEAT-10 notwendig und noch nicht im Schema vorhanden:

| Migration | Beschreibung | Warum nötig |
|-----------|-------------|-------------|
| Neue Tabelle `categories` | `id, name, description, isActive, createdAt` | Kategorien werden aktuell als Text-Feld in `products.category` gespeichert – kein eigenständiges Entity |
| Neue Tabelle `product_categories` | Junction-Tabelle: `productId (FK), categoryId (FK)` | REQ-23c: Produkte können MEHREREN Kategorien zugeordnet werden – erfordert Many-to-Many |
| Migration `products.category` → `product_categories` | Bestehende Kategorie-Textwerte in Junction-Tabelle migrieren | Datenmigration bei Schema-Umstellung |
| Neues Feld `products.isActive` (boolean, default true) | Aktivierungs-Status für Produkte | REQ-14: Produkte aktivieren/deaktivieren – aktuell kein `isActive` im `products`-Schema |
| Neue Tabelle `login_events` | `id, userId (FK, nullable), success (boolean), ip (text), createdAt` | REQ-30/32: Login-Statistiken und Peak-Zeiten können ohne dieses Log nicht ausgewertet werden |

### 8.2 Image-Storage-Strategie

REQ-16 fordert Bild-Upload, aber die aktuelle `products.imageUrl` ist nur ein Text-Feld ohne Upload-Infrastruktur.

**Entscheidung:** Produktbilder werden als Base64-Strings oder Dateipfade in der Datenbank gespeichert. Für die Demo-Umgebung gilt:
- Upload via `multipart/form-data` an `/api/admin/products/:id/image`
- Dateien werden im Verzeichnis `public/uploads/products/` gespeichert (Nuxt public assets)
- `imageUrl` wird auf relativen Pfad `/uploads/products/<uuid>.<ext>` gesetzt
- **Einschränkung:** Bei Serverless-Deployments (z.B. Vercel) ist `public/uploads/` nicht persistent → für Production müsste auf externen Storage (z.B. Supabase Storage) migriert werden

**Open Point:** Falls Deployment auf Vercel geplant ist, muss Image-Storage-Lösung vor Implementierung von REQ-16 geklärt werden.

### 8.3 Demo-Nutzer Email-Auto-Generierung

Abweichend von Section 3.2 (REQ-6) wird bei der Nutzer-Erstellung **keine Email-Eingabe** benötigt:
- Email wird automatisch aus dem Namen generiert: `vorname.nachname@demo.de`
- Passwort ist immer `demo123`
- **Begründung:** Demo-Kontext – kein echter User-Onboarding-Flow
- Das Erstellungs-Formular benötigt daher nur: Name, Standort, Startguthaben
- **Anpassung REQ-6:** "Admin kann neue Nutzer hinzufügen (Name, Standort, Startguthaben)" — Email-Feld entfällt

## 9. API Endpoints (Übersicht)

| Endpoint | Methode | Beschreibung | Status |
|----------|--------|--------------|--------|
| `/api/admin/stats` | GET | Anonyme Statistiken | ⚠️ Teilweise (fehlt: purchases, logins, peak-times) |
| `/api/admin/users` | GET | Nutzer-Liste | ✅ Implementiert |
| `/api/admin/users` | POST | Neuer Nutzer | ✅ Implementiert |
| `/api/admin/users/:id` | PATCH | Nutzer bearbeiten | ❌ Fehlt |
| `/api/admin/users/:id/toggle` | POST | Aktivieren/Deaktivieren | ✅ Implementiert |
| `/api/admin/users/:id/credit` | POST | Guthaben zuweisen | ❌ Fehlt |
| `/api/admin/products` | GET | Produkt-Liste | ❌ Fehlt |
| `/api/admin/products` | POST | Neues Produkt | ❌ Fehlt |
| `/api/admin/products/:id` | PATCH | Produkt bearbeiten | ❌ Fehlt |
| `/api/admin/products/:id` | DELETE | Produkt löschen (Soft-Delete) | ❌ Fehlt |
| `/api/admin/products/:id/image` | POST | Bild hochladen | ❌ Fehlt |
| `/api/admin/categories` | GET | Kategorie-Liste | ❌ Fehlt |
| `/api/admin/categories` | POST | Neue Kategorie | ❌ Fehlt |
| `/api/admin/categories/:id` | PATCH | Kategorie bearbeiten | ❌ Fehlt |
| `/api/admin/categories/:id` | DELETE | Kategorie löschen | ❌ Fehlt |
| `/api/admin/categories/:id/toggle` | POST | Aktivieren/Deaktivieren | ❌ Fehlt |
| `/api/admin/reset` | POST | System-Reset | ⚠️ Teilweise (löscht nicht `purchases`) |
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
   - Name (Pflicht) → Email wird automatisch generiert: vorname.nachname@demo.de
   - Standort (Select: Nürnberg/Berlin)
   - Startguthaben (Zahl, default 25€)
7. "Speichern" klicken
8. Modal schließt
9. Toast: "Nutzer erfolgreich angelegt – Login: vorname.nachname@demo.de / demo123"
10. Nutzer erscheint in Liste
```

**Alternative Flows:**
- **Fehler:** Validation fehlschlägt → Fehlermeldung unter Feld, Modal bleibt offen
- **Abbruch:** "Abbrechen" klicken → Modal schließt, keine Änderung
- **Name bereits vergeben:** "Ein Nutzer mit ähnlichem Namen existiert bereits" → Fehlermeldung
- **Leerer Name:** "Name ist erforderlich" → Inline Validation

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
   - Bestellungen (heute/woche/gesamt) [aus purchases]
   - Transaktionen (heute/woche/gesamt) [aus creditTransactions]
   - Gesamt-Guthaben aller Nutzer (aggregiert, anonym)
   - Peak-Zeiten (Diagramm) [nur wenn login_events-Tabelle existiert]
4. Skeleton Loader während Daten geladen werden
5. Werte erscheinen ohne Seitenreload
```

**Alternative Flows:**
- **Keine Daten:** "Noch keine Daten" Placeholder anzeigen (kein Fehler-State)
- **Peak-Zeiten ohne login_events:** Karte wird ausgeblendet oder zeigt "Feature in Vorbereitung"
- **API-Fehler:** Fehler-State mit Retry-Button

---

#### Flow 8: Produkt bearbeiten

**Akteur:** Sandra (Admin)
**Ziel:** Bestehenden Produkt-Preis korrigieren

**Haupt-Flow:**
```
1. Auf /admin/products
2. Produkt in Liste/Grid finden
3. [✏️] Edit-Button klicken
4. Slide-over öffnet sich von rechts (Kontext bleibt sichtbar)
5. Felder vorausgefüllt: Name, Beschreibung, Preis, Kategorien, Bild-Vorschau
6. Preis-Feld anklicken → Wert ändern
7. "Speichern" klicken
8. Slide-over schließt
9. Toast: "Produkt aktualisiert"
10. Produkt in Liste zeigt neuen Preis (ohne Seitenreload)
```

**Alternative Flows:**
- **Kein Name:** Validation verhindert Speichern
- **Preis = 0 oder negativ:** Validierungsfehler "Preis muss > 0 sein"
- **Alle Kategorien entfernt:** "Mind. 1 Kategorie erforderlich"
- **Abbruch mit Änderungen:** "Änderungen verwerfen?" Dialog (Unsaved Changes Guard)
- **Bild ändern:** Neues Bild hochladen → ersetzt altes Bild erst nach Speichern

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

---

#### Wireframe 5: Kategorien-Verwaltung (/admin/categories)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: SnackEase Admin                    [Sandra] [Logout]│
├─────────────────────────────────────────────────────────────┤
│ Navigation (horizontal)                                      │
│ [Dashboard] [Nutzer] [Produkte] [Kategorien*]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Kategorien-Verwaltung                                       │
│                                                              │
│                                    [+ Neue Kategorie]       │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Name         Produkte  Status       Aktionen            ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Obst         12        ● Aktiv   [✏️ Edit] [🗑️ Löschen] ││
│ │ Proteinriegel  8       ● Aktiv   [✏️ Edit] [🗑️ Löschen] ││
│ │ Getränke      5        ○ Inaktiv [✏️ Edit] [🗑️ Löschen] ││
│ │ Süßes         9        ● Aktiv   [✏️ Edit] [🗑️ Löschen] ││
│ └─────────────────────────────────────────────────────────┘│
│                                                              │
│ Legende: ● = Aktiv (Produkte sichtbar), ○ = Inaktiv        │
│          (Produkte ausgeblendet, nicht deaktiviert)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**UX-Hinweis:** Inaktive Kategorien sind visuell gedimmt (opacity-50), aber Zeile bleibt lesbar. Der Status-Toggle ist ein klickbarer Badge (`●/○`), kein separater Switch, damit die Tabelle kompakt bleibt.

---

#### Wireframe 6: Produkt Slide-over (Erstellen / Bearbeiten)

```
┌────────────────────────┐ ┌────────────────────────────────┐
│                        │ │ Produkt bearbeiten          [×] │
│  Produkt-Liste         │ ├────────────────────────────────┤
│  (bleibt sichtbar)     │ │                                │
│                        │ │ Name *                         │
│  [✏️] Apfel            │ │ ┌──────────────────────────┐  │
│  [✏️] Proteinr.  ◄─────┼─┤ │ Proteinriegel Nuss-Kaka│  │
│  [✏️] Shake            │ │ └──────────────────────────┘  │
│                        │ │                                │
│                        │ │ Preis (€) *    Beschreibung    │
│                        │ │ ┌──────────┐  ┌─────────────┐ │
│                        │ │ │  2.50    │  │ Optional... │ │
│                        │ │ └──────────┘  └─────────────┘ │
│                        │ │                                │
│                        │ │ Kategorien * (mind. 1)         │
│                        │ │ ┌──────────────────────────┐  │
│                        │ │ │ [✅ Protein] [✅ Gesund]  │  │
│                        │ │ │ [+ Kategorie hinzufügen ▾]│  │
│                        │ │ └──────────────────────────┘  │
│                        │ │                                │
│                        │ │ Bild                           │
│                        │ │ ┌──────────────────────────┐  │
│                        │ │ │  [Bild-Vorschau 80x80]   │  │
│                        │ │ │  [📎 Bild ändern]        │  │
│                        │ │ └──────────────────────────┘  │
│                        │ │                                │
│                        │ │ Status                         │
│                        │ │ ● Aktiv  ○ Inaktiv             │
│                        │ │                                │
│                        │ │ [Abbrechen]   [💾 Speichern]  │
│                        │ └────────────────────────────────┘
└────────────────────────┘
```

**UX-Hinweise:**
- Slide-over öffnet von rechts, nicht als zentriertes Modal → Kontext (Produktliste) bleibt sichtbar
- Pflichtfelder mit `*` markiert
- Kategorien als Chips mit ✕ zum Entfernen; Dropdown zeigt alle verfügbaren Kategorien
- Bei Abbrechen mit ungespeicherten Änderungen: Unsaved Changes Dialog

### 10.5 Accessibility-Prüfung (WCAG 2.1)

> **Hinweis:** ✅ Geplant = als Requirement definiert, noch nicht implementiert. ✅ Implementiert = im bestehenden Code vorhanden. ⚠️ Kritisch = muss explizit umgesetzt werden, hohes Risiko vergessen zu werden.

| Prüfpunkt | Status | Implementierungsanforderung |
|-----------|--------|-----------------------------|
| **1. Wahrnehmbar** | | |
| Farbkontrast > 4.5:1 | ✅ Geplant | Dunkler Text auf hellem Hintergrund; Inaktiv-States (`opacity-50`) müssen trotzdem > 3:1 erreichen |
| Text-Alternativen für Bilder | ✅ Geplant | `alt`-Attribut bei Produkt-Bild Pflichtfeld (Validierung beim Upload) |
| Responsives Design | ✅ Geplant | Desktop + Tablet; Mobile nicht unterstützt (explizit) |
| **2. Bedienbar** | | |
| Tastatur-Navigation | ✅ Geplant | Tab-Reihenfolge: Header-Nav → Filter → Tabelle → Aktionen |
| Fokus-Indikatoren | ✅ Geplant | Sichtbarer Focus Ring bei allen interaktiven Elementen |
| Modal Focus Trap | ⚠️ Kritisch | Alle Modals (Delete, Reset, Credits, Create) **müssen** Focus-Trap implementieren: Fokus bleibt im Modal; Escape schließt Modal |
| Zeitlimits | ✅ Geplant | Kein Zeitlimit für Aktionen (Session-Timeout zeigt Warnung 1 min vorher) |
| Touch-Targets | ✅ Geplant | Min. 44x44px für alle Buttons und Toggles |
| **3. Verständlich** | | |
| Klare Fehlermeldungen | ✅ Geplant | Fachsprachlich statt HTTP-Codes: "Name bereits vergeben" statt "Error 400" |
| Konsistente Navigation | ✅ Geplant | Persistente Header-Navigation auf allen /admin/* Seiten (REQ-34) |
| Hilfe-Texte | ✅ Geplant | Tooltips für: Soft-Delete-Erklärung, Kategorie-Deaktivierungs-Auswirkung, Auto-Email-Generierung |
| Unsaved Changes Guard | ⚠️ Kritisch | Slide-over mit Änderungen: "Änderungen verwerfen?" Dialog bei Schließen/Navigation weg |
| **4. Robust** | | |
| Semantisches HTML | ✅ Geplant | `<table>` für Datentabellen, `<form>` für Formulare, `<button>` für Aktionen |
| ARIA-Labels | ✅ Geplant | `aria-label` für Icon-only-Buttons (✏️, 🗑️, 💰); `role="dialog"` + `aria-modal="true"` für Modals |
| Screen Reader Live Regions | ⚠️ Kritisch | Toast-Notifications als `role="alert"` (Fehler) oder `aria-live="polite"` (Erfolg) implementieren |
| ARIA Dialog Attributes | ✅ Implementiert | Vorhanden in bestehenden Reset-Modals (`role="dialog"`, `aria-modal`, `aria-labelledby`) |

### 10.5b UX-Spannungsfelder

#### Spannung 1: Guthaben zuweisen ohne Einzelwerte sehen (REQ-8 vs. REQ-10)

**Problem:** REQ-8 erfordert, dass Admin Guthaben zuweisen kann. REQ-10 verbietet individuelle Guthaben-Werte. Wie weist Admin sinnvoll Credits zu, ohne den aktuellen Stand zu kennen?

**Lösungsvorschlag:** Im Guthaben-Modal wird das aktuelle Guthaben des einzelnen Nutzers einmalig angezeigt — aber nur in diesem Verwaltungskontext, nicht in der Listenansicht.

```
┌──────────────────────────────────────────┐
│  Guthaben zuweisen: Nina Neuanfang   [×] │
├──────────────────────────────────────────┤
│                                          │
│  Aktuelles Guthaben:   8.50 €           │
│  (nur für Zuweisung sichtbar)            │
│                                          │
│  Betrag zuweisen (€) *                   │
│  ┌──────────────────────────────────┐   │
│  │  10.00                           │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Notiz (optional)                        │
│  ┌──────────────────────────────────┐   │
│  │  Bonus für Event                 │   │
│  └──────────────────────────────────┘   │
│                                          │
│  [Abbrechen]       [Zuweisen]            │
└──────────────────────────────────────────┘
```

**Begründung:** REQ-10 schützt vor massenhafter Exposition von Guthaben-Daten in Listen. Ein kontextbezogener Einzelwert im Verwaltungs-Modal ist notwendig für sinnvolle Admin-Entscheidungen und stellt keine Datenschutzverletzung dar.

**Entscheidung erforderlich:** Muss vor Implementierung mit PO/Stakeholder geklärt werden.

---

#### Spannung 2: Produkt-Sichtbarkeit durch Kategorie-Status vs. Produkt-Status (EC-10)

**Problem:** Ein Produkt kann aus zwei Gründen unsichtbar sein — eigener Status (`isActive = false`) oder Kategorie deaktiviert. Admins müssen den tatsächlichen Grund erkennen.

**Lösungsvorschlag:** In der Produkt-Liste zusätzliche Spalte "Sichtbar im Katalog (Ja/Nein)" mit Tooltip-Erklärung bei "Nein":
- "Produkt deaktiviert" oder
- "Kategorie 'Obst' deaktiviert"

---

#### Spannung 3: Empty States bei neuer Instanz

Wenn Admin das System nach einem Reset öffnet oder neu aufgesetzt wird:
- `/admin/products` → "Noch keine Produkte vorhanden. [+ Neues Produkt]"
- `/admin/categories` → "Noch keine Kategorien. Produkte benötigen mind. 1 Kategorie. [+ Neue Kategorie]"
- **Reihenfolge erzwingen:** Wenn keine Kategorien existieren → Produkt erstellen ist blockiert → Admin sieht Hinweis "Zuerst eine Kategorie anlegen"

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

- [✅] Personas-Analyse: Admin-Persona Sandra definiert
- [✅] User Flows: 8 Haupt-Flows dokumentiert (inkl. Flow 8: Produkt bearbeiten)
- [✅] Wireframes: 6 Key-Screens visualisiert (inkl. Kategorien-Seite + Produkt Slide-over)
- [✅] Accessibility: WCAG 2.1 AA Anforderungen geprüft; 3 kritische Punkte markiert (Modal Focus Trap, Unsaved Changes Guard, Screen Reader Live Regions)
- [✅] Empfehlungen: Must-Have/Should-Have/Nice-to-Have dokumentiert
- [✅] Interaktions-Pattern: Modal vs. Slide-over, Inline-Toggle, Toast-Notifications definiert
- [✅] Responsive Design: Desktop/Tablet (Mobile explizit nicht unterstützt)
- [✅] Performance: Ladezeiten und Skeleton Loader definiert
- [✅] UX-Spannungsfelder: 3 Spannungen dokumentiert mit Lösungsvorschlägen
- [✅] Empty States: Verhalten bei leeren Listen und nach System-Reset definiert
- [⚠️] Guthaben-Sichtbarkeit im Credits-Modal (REQ-8 vs. REQ-10): Entscheidung durch PO/Stakeholder erforderlich

---

**Status:** 🟡 UX Design Complete
**Nächster Schritt:** Solution Architect (Tech-Design)

---

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-06

### Geanderte/Neue Dateien

#### Backend
- `src/server/db/schema.ts` - Neue Tabellen: `categories`, `product_categories`, `loginEvents`; neues Feld `products.isActive`
- `src/server/api/admin/reset.post.ts` - EC-8 Bugfix: `purchases`-Tabelle wird jetzt beim System-Reset geleert
- `src/server/api/admin/stats.get.ts` - Erweitert um: `totalPurchases`, `todayPurchases`, `totalLogins`, `todayLogins`, `failedLogins`
- `src/server/api/admin/users/[id].patch.ts` - Neu: Nutzer-Name und Standort bearbeiten
- `src/server/api/admin/users/[id]/credit.post.ts` - Neu: Guthaben manuell zuweisen
- `src/server/api/admin/products/index.get.ts` - Neu: Produktliste mit Kategorien fuer Admin
- `src/server/api/admin/products/index.post.ts` - Neu: Produkt anlegen mit Kategorien
- `src/server/api/admin/products/[id].patch.ts` - Neu: Produkt bearbeiten inkl. Kategorie-Neuzuweisung
- `src/server/api/admin/products/[id].delete.ts` - Neu: Soft-Delete (setzt isActive = false, EC-6)
- `src/server/api/admin/products/[id]/image.post.ts` - Neu: Bild-Upload (JPG/PNG/WebP, max 5MB)
- `src/server/api/admin/categories/index.get.ts` - Neu: Kategorienliste mit Produktanzahl
- `src/server/api/admin/categories/index.post.ts` - Neu: Kategorie anlegen
- `src/server/api/admin/categories/[id].patch.ts` - Neu: Kategorie bearbeiten
- `src/server/api/admin/categories/[id].delete.ts` - Neu: Kategorie loeschen mit Produkt-Neuzuordnung (EC-1)
- `src/server/api/admin/categories/[id]/toggle.post.ts` - Neu: Kategorie aktivieren/deaktivieren (EC-2)
- `src/server/api/auth/login.post.ts` - Login-Events werden jetzt protokolliert
- `src/server/api/products/index.get.ts` - EC-10: Filtert Produkte mit inaktiven Kategorien aus

#### Frontend
- `src/components/admin/AdminNav.vue` - Neu: Persistente Admin-Navigation (REQ-34/35/36)
- `src/pages/admin/index.vue` - Ueberarbeitet: AdminNav integriert, erweiterte Stats, kein /dashboard-Link mehr
- `src/pages/admin/users.vue` - Erweitert: Edit-Modal, Guthaben-Zuweisung, Suche + Status-Filter
- `src/pages/admin/products.vue` - Neu: Vollstaendige Produktverwaltung mit CRUD, Bild-Upload, Kategorie-Multi-Select
- `src/pages/admin/categories.vue` - Neu: Kategorienverwaltung mit CRUD, Toggle, Loeschen mit Neuzuordnungs-Flow
- `src/middleware/auth.global.ts` - REQ-37: Admin wird von /dashboard auf /admin weitergeleitet

### Wichtige Entscheidungen

- **Bild-Storage:** Bilder werden in `public/uploads/products/` gespeichert (Demo-Umgebung). Fuer Production-Deployments (Vercel) muss externer Storage konfiguriert werden (Open Point aus Section 8.2).
- **Soft-Delete fuer Produkte (EC-6):** Produkte werden nicht wirklich geloescht, sondern nur auf `isActive = false` gesetzt, damit bestehende Bestellreferenzen erhalten bleiben.
- **Kategorie-Deaktivierung (EC-2/10):** Produkte werden NICHT direkt deaktiviert, sondern beim Laden aus der oeffentlichen Produkt-API herausgefiltert wenn ihre einzige/alle Kategorien inaktiv sind.
- **Many-to-Many Kategorien:** Neue `product_categories` Junction-Tabelle. Das alte `products.category` Text-Feld bleibt als Rueckwaertskompatibilitaet erhalten und wird mit dem Namen der ersten zugewiesenen Kategorie synchron gehalten.
- **Login-Events:** Werden bei jedem Login-Versuch in `login_events` protokolliert (Fehler werden per `.catch(() => {})` ignoriert um den Login-Flow nicht zu blockieren).

### Bekannte Einschraenkungen

- Bild-Upload persistiert nicht bei Serverless-Deployments (Vercel) - `public/uploads/` ist nicht persistent. Sektion 8.2 der Spec beschreibt diesen Open Point.
- Bestehende Produkte haben noch keinen `product_categories`-Eintrag (nur `products.category` Text-Feld). Die Admin-Produktliste zeigt beides (Kategorien aus Junction-Tabelle wenn vorhanden, sonst `products.category` als Fallback).
- Peak-Zeiten-Visualisierung (REQ-32) ist nicht implementiert - die `login_events`-Tabelle ist bereit, aber die grafische Darstellung war als "Should-Have" eingestuft und wurde zugunsten der Must-Have Features zurueckgestellt.

---

## QA Test Results

**Tested (Nachtest):** 2026-03-06 (Re-Test nach Bug-Fixes)
**App URL:** http://localhost:3000

### Unit-Tests

**Command:** `npm test -- --run`

| Test-Suite | Tests | Passing | Failing | Coverage |
|------------|-------|---------|---------|----------|
| utils/purchase | 12 | 12 | 0 | 100% |
| composables/useLeaderboard | 21 | 21 | 0 | - |
| composables/useFormatter | 19 | 19 | 0 | - |
| composables/useSearch | 22 | 16 | 0 (6 skipped) | - |
| composables/useLocalStorage | 13 | 13 | 0 | - |
| composables/useModal | 20 | 20 | 0 | - |
| components/AdminInfoBanner | 13 | 13 | 0 | - |
| stores/credits | 13 | 9 | 0 (4 skipped) | - |
| constants/credits | 15 | 15 | 0 | - |
| stores/auth | 10 | 5 | 0 (5 skipped) | - |
| **GESAMT** | **158** | **143** | **0** | **~90%** |

**Status:** Alle Unit-Tests bestanden (15 planmaessig geskippt)

### Bug-Fix-Verifikation (BUG-FEAT10-001 bis 004)

| Bug-ID | Status | Verifikation |
|--------|--------|-------------|
| BUG-FEAT10-001 | GEFIXT | `openDeleteModal()` ruft jetzt `/deletion-check` statt DELETE direkt. Confirm-Button immer sichtbar (v-if="!isLoadingDeleteInfo"). |
| BUG-FEAT10-002 | GEFIXT | Confirm-Button `v-if="!isLoadingDeleteInfo"` – wird bei leeren Kategorien korrekt angezeigt. Button-Text adaptiert sich: "Löschen bestätigen" vs. "Löschen und neu zuordnen". |
| BUG-FEAT10-003 | GEFIXT | Bei fehlgeschlagenem Bild-Upload wird das neu erstellte Produkt per DELETE-API rückgängig gemacht (Rollback, Zeile 289-295 in products.vue). |
| BUG-FEAT10-004 | GEFIXT | `[id].patch.ts` hat jetzt Duplikat-Check (ne(categories.id, id) Bedingung). Klare Fehlermeldung: "Eine Kategorie mit dem Namen '...' existiert bereits." |

### Acceptance Criteria Status

| REQ | Beschreibung | Status | Anmerkung |
|-----|-------------|--------|-----------|
| REQ-1 | Admin-Login leitet auf /admin | OK | Middleware korrekt implementiert |
| REQ-2 | Admin hat keine Bestellfunktion | OK | PurchaseButton `v-if="!authStore.isAdmin"` in ProductGrid |
| REQ-3 | Admin sieht kein eigenes Guthaben | OK | AdminInfoBanner statt BalanceCard |
| REQ-4 | /dashboard-Redirect fuer Admin | OK | auth.global.ts Zeile 32-34 |
| REQ-5 | Nutzer-Liste vorhanden | OK | /admin/users mit Tabelle |
| REQ-6 | Neuer Nutzer (Name, Standort, Startguthaben; Email auto) | OK | Create-Modal implementiert |
| REQ-7 | Toggle aktivieren/deaktivieren | OK | toggle.post.ts mit Admin-Schutz |
| REQ-8 | Guthaben zuweisen | OK | credit.post.ts implementiert |
| REQ-9 | KEINE Transaktionshistorie sichtbar | OK | Nicht in UI oder API |
| REQ-10 | KEINE Guthaben-Einzelwerte in Liste | OK | users API gibt keine Balance zurueck |
| REQ-11 | Produkt-Liste | OK | /admin/products mit Tabelle |
| REQ-12 | Produkt erstellen | OK | POST /api/admin/products |
| REQ-13 | Produkt bearbeiten | OK | PATCH /api/admin/products/:id |
| REQ-14 | Produkt deaktivieren (Soft-Delete) | OK | DELETE = isActive false (EC-6) |
| REQ-15 | Produkt aktivieren/deaktivieren Toggle | OK | PATCH mit isActive |
| REQ-16 | Bild-Upload | OK | image.post.ts mit Typ/Groessen-Pruefung |
| REQ-17 | Kategorien zuweisen (Many-to-Many) | OK | product_categories Junction-Tabelle |
| REQ-18 | Kategorie-Liste | OK | /admin/categories |
| REQ-19 | Kategorie erstellen | OK | POST /api/admin/categories |
| REQ-20 | Kategorie bearbeiten | OK | PATCH /api/admin/categories/:id |
| REQ-21 | Toggle aktivieren/deaktivieren | OK | toggle.post.ts |
| REQ-22 | Produkte werden bei Kategorie-Deaktivierung NICHT deaktiviert | OK | EC-2 korrekt |
| REQ-23 | Kategorie loeschen mit Produkt-Neuzuordnung | OK | BUG-001/002 gefixt; deletion-check Endpunkt implementiert |
| REQ-24 | Many-to-Many Produkt-Kategorien | OK | productCategories Tabelle |
| REQ-28 | totalPurchases in Stats | OK | stats.get.ts |
| REQ-29 | todayPurchases in Stats | OK | stats.get.ts |
| REQ-30 | Login-Statistiken | OK | loginEvents-Tabelle + stats |
| REQ-31 | failedLogins in Stats | OK | stats.get.ts |
| REQ-32 | Peak-Zeiten (Should-Have) | Nicht implementiert | Tabelle bereit, Darstellung fehlt |
| REQ-33 | Gesamt-Guthaben | OK | totalCredits in stats |
| REQ-34 | Persistente horizontale Navigation | OK | AdminNav.vue |
| REQ-35 | Aktiver Punkt hervorgehoben | OK | isActive() Funktion in AdminNav |
| REQ-36 | Kein Link zu /dashboard | OK | NavItems nur /admin/* |
| REQ-37 | /dashboard-Redirect fuer Admin | OK | Middleware implementiert |

### Edge Cases Status

| EC | Beschreibung | Status | Anmerkung |
|----|-------------|--------|-----------|
| EC-1 | Kategorie loeschen mit Produkten | OK | BUG-001+002 gefixt: deletion-check vor Loeschung; Confirm-Button immer sichtbar |
| EC-1a | Produkt in mehreren Kategorien | OK | Produkt bleibt sichtbar |
| EC-1b | Produkt nur in einer Kategorie | OK | Neuzuordnung erzwungen |
| EC-1c | Produkt ohne Kategorie | OK | Validierung in API |
| EC-2 | Kategorie deaktivieren blendet Produkte aus | OK | categories/toggle + products API Filter |
| EC-2a | Kategorie reaktivieren | OK | Produkte werden wieder sichtbar |
| EC-2b | Produkt zusaetzlich deaktiviert | OK | Logische ODER-Verknuepfung |
| EC-3 | Bild-Upload fehlschlaegt | OK | BUG-003 gefixt: Rollback loescht Produkt bei Upload-Fehler |
| EC-4 | Guthaben an deaktivierten Nutzer | OK | Kein Check, erlaubt |
| EC-5 | Parallele Reset-Anfragen | WARNUNG | Kein Server-Lock - nur Frontend-Guard |
| EC-6 | Soft-Delete Produkt | OK | isActive = false |
| EC-7 | Peak-Zeiten ohne Daten | Nicht testbar | Peak-Zeiten nicht implementiert |
| EC-8 | System-Reset leert purchases | OK | BUG-Fix korrekt implementiert |
| EC-9 | Produkt-Kategorie bei Soft-Delete | OK | product_categories bleibt erhalten |
| EC-10 | Kategorie/Produkt-Status ODER-Logik | OK | products/index.get.ts korrekt |

### DB-Schema Migrationen

| Tabelle/Feld | Status | Anmerkung |
|---|---|---|
| `categories` (neue Tabelle) | OK | id, name, description, isActive, createdAt |
| `product_categories` (Junction) | OK | Many-to-Many Verknuepfung |
| `products.isActive` | OK | Boolean, Default true |
| `loginEvents` (neue Tabelle) | OK | id, userId, success, ip, createdAt |
| Migration von products.category Text | Teilweise | Altes Feld bleibt, Rueckwaertskompatibilitaet |

### Accessibility (WCAG 2.1)

- OK Farbkontrast > 4.5:1 (Tailwind-Klassen konsistent)
- OK Tastatur-Navigation: alle Modals mit Tab navigierbar
- OK Focus States sichtbar (focus:ring-2)
- OK Touch-Targets > 44px (Buttons min py-2 px-3)
- OK Screen Reader: role="dialog" aria-modal="true" aria-labelledby in allen Modals
- OK Labels fuer alle Formfelder vorhanden (for/id-Paare)

### Security

- OK Alle /admin API Routes mit `requireAdmin` geschuetzt
- OK Admin-Zugriff prueft Cookie + DB-Rolle
- OK Normale User werden von /admin auf /dashboard umgeleitet
- OK Admin kann keine Produkte kaufen (server-seitig blockiert)
- OK Input Validation in allen POST/PATCH Endpunkten
- OK Drizzle ORM verhindert SQL-Injection (parametrisierte Queries)
- OK Kein `v-html` in Admin-Seiten (kein XSS-Risiko)
- OK Soft-Delete schuetzt Bestellhistorie
- OK Admin-Account kann nicht deaktiviert werden (toggle.post.ts)
- WARNUNG Kein Server-seitiger Lock gegen parallele Reset-Anfragen (EC-5)

### Tech Stack Compliance

- OK Composition API + `<script setup>` in allen Admin-Seiten
- OK Kein `any` in TypeScript (alle Interfaces sauber getypt)
- OK Kein direkter DB-Zugriff aus Stores/Components
- OK Drizzle ORM fuer alle Queries
- OK Server Routes haben try/catch mit createError()
- OK Keine N+1 Query Probleme (Kategorien werden in einer zweiten Batch-Query geladen)
- OK Kein localStorage/sessionStorage
- OK Pinia Setup-Syntax (nicht Options-Syntax)
- WARNUNG BUG-FEAT10-011: `products/index.get.ts` - `inArray` nicht importiert, WHERE-Filter auf productId fehlt in Kategorie-Query

### Optimierungen (identifizierte Potenziale)

- BUG-FEAT10-011: `products/index.get.ts` laedt alle `product_categories` ohne WHERE-Filter auf `productId` - bei grosser Datenmenge ineffizient. `inArray`-Import hinzufuegen und WHERE-Clause ergaenzen.
- BUG-FEAT10-009: `handleDrop` in `products.vue` hat toten Code (Zeile 208) und moegliches Safari-Kompatibilitaetsproblem.
- `openDeleteModal` in categories.vue hat zu viel Logik (API-Call + UI-State). Sollte in zwei getrennte Funktionen aufgeteilt werden.

### Regression

- OK Alle bestehenden Features funktionieren noch (FEAT-2, FEAT-4, FEAT-6, FEAT-7, FEAT-8)
- OK Admin-Redirect von /dashboard zu /admin weiterhin korrekt
- OK System-Reset funktioniert (jetzt inkl. purchases)
- OK Produktkatalog filtert inaktive Kategorien korrekt aus (EC-10)

---

## Offene Bugs

Keine offenen Bugs. Alle Bugs wurden behoben.

### Geschlossene Bugs (gefixt)

| Bug-ID | Titel | Severity | Gefixt am |
|--------|-------|----------|-----------|
| BUG-FEAT10-001 | Kategorie mit Multi-Kategorie-Produkten wird ohne Bestaetigung geloescht | Critical | 2026-03-06 |
| BUG-FEAT10-002 | Leere Kategorie zeigt keinen Confirm-Button im Loesc-Modal | High | 2026-03-06 |
| BUG-FEAT10-003 | Neues Produkt wird gespeichert obwohl Bild-Upload fehlschlaegt (EC-3) | Medium | 2026-03-06 |
| BUG-FEAT10-004 | Kategorie-Name-Duplikat beim Bearbeiten gibt unverstaendliche Fehlermeldung | Low | 2026-03-06 |
| BUG-FEAT10-005 | isDeleting-State bleibt bei Fehler auf true – Produkt-Loeschbeschaltflaechebleibt dauerhaft deaktiviert | High | 2026-03-06 |
| BUG-FEAT10-006 | Admin-Produktliste fehlt Kategorie-Filter (REQ-11 / UI-Spec 5.3) | Medium | 2026-03-06 |
| BUG-FEAT10-007 | Stats-Karte "Mitarbeiter" zaehlt auch inaktive Mitarbeiter-Nutzer | Low | 2026-03-06 |
| BUG-FEAT10-012 | Kein UNIQUE Constraint auf product_categories - Doppelte Verknuepfungen moeglich | High | 2026-03-07 |
| BUG-FEAT10-010 | Nutzer-Erstellung erlaubt negatives oder Null-Startguthaben | Medium | 2026-03-07 |
| BUG-FEAT10-008 | Produkt-Rollback bei fehlgeschlagenem Bild-Upload loescht nicht wirklich | Medium | 2026-03-07 |
| BUG-FEAT10-009 | handleDrop in products.vue ruft handleImageSelect doppelt auf (toter Code, Drag&Drop Safari) | Medium | 2026-03-07 |
| BUG-FEAT10-013 | Kein Schutz gegen parallele System-Reset Anfragen (EC-5) | Medium | 2026-03-07 |
| BUG-FEAT10-011 | N+1 Query Problem in /api/admin/products (index.get.ts) - kein WHERE-Filter | Low | 2026-03-07 |

---

## Production-Ready Entscheidung

**Status:** Production-Ready (neu bewertet: 2026-03-07)

**Begruendung:** Alle 13 bekannten Bugs (BUG-FEAT10-001 bis BUG-FEAT10-013) wurden behoben. Der UNIQUE Constraint auf product_categories ist in der DB angelegt. Alle Server-side Validierungen sind vollstaendig.

**Empfehlung UX Expert:** Nicht notwendig

**Begruendung UX:** Alle UX-Vorgaben (Navigation, Modal-Struktur, Labels, Accessibility, Confirm-Dialoge) sind nach den Bug-Fixes korrekt implementiert. BUG-FEAT10-006 (fehlender Kategorie-Filter) ist ein UX-Mangel, aber kein Blocker fuer den Betrieb.
