# SnackEase - Product Requirements Document (PRD)

## 1. Executive Summary

**Produktname:** SnackEase  
**Unternehmen:** Anwalt.de  
**Standorte:** Nürnberg, Berlin

**Vision:** "SnackEase - Dein Weg zu Gesundheit und Genuss"  
Eine Employee Snack Kiosk App, die eine gesunde, bequeme und köstliche Erfahrung für Mitarbeiter schafft.

**Ziele:**
1. Möglichkeit schaffen, sich gesund zu ernähren
2. Motivierte und loyale Mitarbeiter durch attraktive Angebote
3. Anreize schaffen, regelmäßig in die Firma zu kommen
4. Wir-Gefühl unter Kollegen fördern

---

## 2. Zielgruppe

**Primäre Zielgruppe:** Nachhaltigkeitsbewusste Professionals mit Fokus auf gesunde Ernährung und ausgewogene Lebensweise

### Haupt-Personas (Mitarbeiter)

| Persona | Alter | Beruf | Kernbedürfnis |
|---------|-------|-------|---------------|
| Nina Neuanfang | 24 | Junior-Anwältin | Einfache Einarbeitung, klare Anleitung |
| Maxine Snackliebhaber | 32 | Rechtsanwältin | Schneller Zugang zu Favoriten, Nährwerte |
| Lucas Gesundheitsfan | 28 | Paralegal | Vegetarische Optionen, detaillierte Nährwerte |
| Alex Gelegenheitskäufer | 40 | Büro-Manager | Schneller, einfacher Kauf |
| Tom Schnellkäufer | 35 | Rechtsanwalt | One-Touch Kauf |

### Sekundäre Personas

- **Sarah Teamkapitän** (45, Abteilungsleiterin) - Gruppenbestellungen
- **David Helferlein** (31, Rechtsanwalt) - App-Botschafter
- **Martin Meeting-Organisator** (37, Senior-Anwalt) - Event-Bestellungen
- **Emily Technikliebhaberin** (29, IT-Spezialistin) - Feedback & Features
- **Mia Entdeckerin** (27, Junior-Anwältin) - Funktionen erkunden

---

## 3. Funktionale Anforderungen

### 3.1 Konto & Authentifizierung

| ID | Feature | Beschreibung | Priorität |
|----|---------|--------------|-----------|
| AUTH-01 | Registrierung | Mitarbeiter können sich mit Firmen-E-Mail registrieren | Must-Have |
| AUTH-02 | Anmeldung | E-Mail + Passwort Login | Must-Have |
| AUTH-03 | Profilverwaltung | Name, Standort, persönliche Einstellungen | Must-Have |
| AUTH-04 | Passwort vergessen | Password-Reset-Funktion | Should-Have |

### 3.2 Guthaben-System

| ID | Feature | Beschreibung | Priorität |
|----|---------|--------------|-----------|
| CREDIT-01 | Monatliches Guthaben | 25 € pro Monat | Must-Have |
| CREDIT-02 | Guthaben anzeigen | Aktuelles Guthaben auf Startseite | Must-Have |
| CREDIT-03 | Guthaben aufladen | Zusätzliches Guthaben (Prepaid) | Must-Have |
| CREDIT-04 | Guthabenverlauf | Transaktionshistorie | Should-Have |

> **Offene Punkte:**
> - Wann wird monatliches Guthaben gutgeschrieben? → **Am 1. des Monats**
> - Verfällt Restguthaben oder wird übertragen? → **Wird übertragen**
> - Zahlungsanbieter für Aufladung? → **Simuliert (Demo)**

> **Demo-Modus Besonderheiten:**
> - Keine echte Registrierung - User Switch via Login/Logout Flow
> - Kein echtes Payment - Guthaben-Aufladung wird nur simuliert
> - Admin kann System-Reset durchführen und Demo-Nutzer anlegen
> - Login via Email (@demo.de) und Passwort (demo123)

### 3.3 Produktkatalog

| ID | Feature | Beschreibung | Priorität |
|----|---------|--------------|-----------|
| PROD-01 | Produktübersicht | Alle verfügbaren Snacks/Getränke anzeigen | Must-Have |
| PROD-02 | Kategorien | Obst, Proteinriegel, Shakes, Schokoriegel, Nüsse | Must-Have |
| PROD-03 | Produktsuche | Nach Namen suchen | Must-Have |
| PROD-04 | Filter | Vegan, Glutenfrei, Allergene | Must-Have |
| PROD-05 | Produktdetails | Logo, Name, Nährwerte, Inhaltsstoffe | Must-Have |
| PROD-06 | Favoriten | Produkte als Favorit speichern | Should-Have |

### 3.4 Kaufabwicklung

| ID | Feature | Beschreibung | Priorität |
|----|---------|--------------|-----------|
| BUY-01 | One-Touch Kauf | Mit einem Tap kaufen | Must-Have |
| BUY-02 | Warenkorb | Mehrere Produkte auf einmal | Should-Have |
| BUY-03 | Kaufbestätigung | Erfolgreiche Transaktion anzeigen | Must-Have |
| BUY-04 | Kaufhistorie | Alle getätigten Käufe anzeigen | Must-Have |
| BUY-05 | Kontaktlose Abwicklung | Kein Scan/Checkout nötig | Must-Have |

### 3.5 Statistiken

| ID | Feature | Beschreibung | Priorität |
|----|---------|--------------|-----------|
| STAT-01 | Guthaben-Übersicht | Aktueller Kontostand | Must-Have |
| STAT-02 | Ausgaben-Statistik | Bereits ausgegebene Beträge | Must-Have |
| STAT-03 | Kaufhistorie | Liste aller Käufe | Must-Have |
| STAT-04 | Nährwert-Zusammenfassung | Zucker, Fett, Kalorien, Eiweiß | Should-Have |
| STAT-05 | Ziele setzen | Schwellwerte für Produktarten | Could-Have |

### 3.6 Leaderboard

| ID | Feature | Beschreibung | Priorität |
|----|---------|--------------|-----------|
| LEADER-01 | Rangliste | Mitarbeiter vergleichen | Must-Have |
| LEADER-02 | Bonuspunkte | Gesunde Artikel = Extrapunkte | Must-Have |
| LEADER-03 | Kategorie "Meistens" | Wer hat am meisten konsumiert? | Must-Have |
| LEADER-04 | Kategorie "Gesündeste" | Wer isst am gesündesten? | Must-Have |

> **Offene Punkte:**
> - Zeitraum für Leaderboard? (Wöchentlich/Monatlich?)
> - Sichtbarkeit: Alle oder nur eigene Abteilung?

### 3.7 Support & Feedback

| ID | Feature | Beschreibung | Priorität |
|----|---------|--------------|-----------|
| SUP-01 | Kundensupport | Kontakt über App | Should-Have |
| SUP-02 | Feedback | Verbesserungsvorschläge | Could-Have |

---

## 4. Technische Anforderungen

### Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | Vue.js (Composition API) |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | E-Mail/Passwort (Supabase Auth) |
| Deployment | Vercel |

### Plattform

- **Web-App:** Primär (Browser)
- **Responsive:** Mobile + Desktop

---

## 5. Accessibility & Standards

| Standard | Anforderung |
|----------|-------------|
| ISO 9241 | Benutzbarkeit |
| EAA (European Accessibility Act) | Barrierefreiheit |
| WCAG 2.1 | Web Content Accessibility |

---

## 6. Offene Punkte / ToDo

- [x] Guthaben-Logik (Zeitpunkt: 1. des Monats, Übertrag: ja)
- [x] Zahlungsanbieter für Aufladung (Simuliert für Demo)
- [x] Leaderboard (Global sichtbar)
- [ ] SSO-Integration (Microsoft/Google) - Future

---

## 7. Feature-Priorisierung

### Release 0: App-Start

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-0 | Splashscreen | Begrüßungsbildschirm beim Start | 🟢 UX Complete |

### Release 1: Authentication (Login/Logout)

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-1 | Admin Authentication | Login/Logout für Admin (admin@demo.de) | ✅ Tech Spec erstellt |
| FEAT-2 | Demo User Authentication | Login/Logout für Demo-Nutzer (@demo.de) | ✅ Tech Spec erstellt |
| FEAT-3 | User Switch Flow | Via Login/Logout zwischen Usern wechseln | ✅ Tech Spec erstellt |

### Release 2: Guthaben-System

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-4 | Demo-Guthaben | Guthaben anzeigen, aufladen, simulierter Kauf | ✅ Implementiert |
| FEAT-9 | Admin ohne Guthaben | Admin sieht kein Guthaben | 📋 Geplant |
| CREDIT-01 | Monatliches Guthaben | 25€ pro Monat (simuliert) | ✅ Implementiert (FEAT-4) |
| CREDIT-02 | Guthaben anzeigen | Aktuelles Guthaben auf Startseite | ✅ Implementiert (FEAT-4) |
| CREDIT-03 | Guthaben aufladen | Simulation Aufladen (10/25/50€) | ✅ Implementiert (FEAT-4) |
| CREDIT-04 | Guthabenverlauf | Transaktionshistorie | ⏳ Offen |

### Release 3: Kernfunktionen

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| PROD-01 | Produktübersicht | Alle verfügbaren Snacks/Getränke anzeigen | 🔵 UX Complete (FEAT-6) |
| PROD-02 | Kategorien | Obst, Proteinriegel, Shakes, Schokoriegel, Nüsse | 🔵 UX Complete (FEAT-6) |
| PROD-03 | Produktsuche | Nach Namen suchen | 🔵 UX Complete (FEAT-6) |
| PROD-05 | Produktdetails | Logo, Name, Nährwerte, Inhaltsstoffe | 🔵 UX Complete (FEAT-6) |
| BUY-01 | One-Touch Kauf | Mit einem Tap kaufen | ⏳ Offen |
| BUY-03 | Kaufbestätigung | Erfolgreiche Transaktion anzeigen | ⏳ Offen |
| BUY-05 | Kontaktlose Abwicklung | Kein Scan/Checkout nötig | ⏳ Offen |
| LEADER-01 | Rangliste | Mitarbeiter vergleichen | ⏳ Offen |
| LEADER-02 | Bonuspunkte | Gesunde Artikel = Extrapunkte | ⏳ Offen |
| LEADER-03 | Kategorie "Meistens" | Wer hat am meisten konsumiert? | ⏳ Offen |
| LEADER-04 | Kategorie "Gesündeste" | Wer isst am gesündesten? | ⏳ Offen |

### Release 4: Erweiterungen

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-10 | Erweitertes Admin-Dashboard | Nutzer/Produkte/Kategorien/Statistiken/Reset | 📋 Geplant |
| PROD-04 | Filter | Vegan, Glutenfrei, Allergene | ⏳ Offen |
| PROD-06 | Favoriten | Produkte als Favorit speichern | ⏳ Offen |
| BUY-02 | Warenkorb | Mehrere Produkte auf einmal | ⏳ Offen |
| BUY-04 | Kaufhistorie | Alle getätigten Käufe anzeigen | ⏳ Offen |
| STAT-01 | Guthaben-Übersicht | Aktueller Kontostand | ⏳ Offen |
| STAT-02 | Ausgaben-Statistik | Bereits ausgegebene Beträge | ⏳ Offen |
| STAT-04 | Nährwert-Zusammenfassung | Zucker, Fett, Kalorien, Eiweiß | ⏳ Offen |

### Release 5: Navigation & Warenkorb

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-15 | App-Navigationsstruktur | Bottom-Tab-Bar fuer Mitarbeiter (5 Tabs) und Admin (6 Tabs); fixierter Header; Desktop-Sidebar; ersetzt AdminNav.vue und alle Zurueck-Buttons | Planned |
| FEAT-16 | Warenkorb-System | Produkte in Warenkorb legen, Mengen anpassen, Vorbestellung aufgeben; Guthaben-Abzug erst bei Abholung; localStorage-Persistenz | Planned |

### Release 6: Angebote, Empfehlungen & Suche

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-14 | Angebote & Rabatte | Admin kann zeitlich begrenzte Rabatte (% oder EUR) pro Produkt erstellen; automatische Aktivierung nach Datum; Angebotspreis fuer User sichtbar | Planned |
| FEAT-17 | Angebote-Querslider | Horizontaler Querslider auf dem Dashboard zeigt aktive Angebote; Produktbild, Angebotspreis, Rabatt-Badge; "In den Warenkorb"-Button direkt auf der Karte | Planned |
| FEAT-18 | Empfehlungen & Favoriten | Produktempfehlungen (aggregierte Top-10 fuer alle sichtbar) und private Favoriten-Listen (max. 10); Tab-Umschalter auf Dashboard | Planned |
| FEAT-19 | Erweiterte Suche | Volltext-Echtzeit-Suche auf /search mit Debouncing; Filter-Chips fuer Kategorie, Verfuegbarkeit, Preisbereich, Vegan/Glutenfrei; Sortierung nach Relevanz/Preis | Planned |

### Release 7: Profil, Admin-Einstellungen & Bestand

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-20 | Profil-Seite | Stammdaten, Zeitraum-Statistiken (Ausgaben, Bestellungen, Lieblingsprodukt, Gesundheits-Score 1-10), Bestellverlauf, Logout | Planned |
| FEAT-21 | Admin Einstellungsseite | /admin/settings mit System-Reset, Guthaben-Reset, Logout; loest Reset-Funktionen aus Admin-Index aus | Planned |
| FEAT-22 | Konfigurierbarer Nachbestellschwellwert | `products.stockThreshold` (default 3) ersetzt Hard-Code; konfigurierbar in Produktverwaltung und Bestandsverwaltung | Planned |

### Release 8: Leaderboard-Erweiterung

| ID | Feature | Beschreibung | Status |
|----|---------|--------------|--------|
| FEAT-23 | Leaderboard-Erweiterung (Punktesystem) | Neuer "Gesamt-Punkte"-Tab im Leaderboard; Punkte pro abgeholtem Produkt (Basis +10, Vegan/Gesund +3, Protein +2, Angebot +2); Boni pro Bestellung (Schnelligkeit +5, Streak +20%); Empfehlungs-Bonus +5; Punkte-Aufschluesselung auf Profil-Seite | Planned |

### Release 9: Future

| ID | Feature | Beschreibung |
|----|---------|--------------|
| AUTH-04 | Passwort vergessen | Password-Reset-Funktion |
| STAT-05 | Ziele setzen | Schwellwerte für Produktarten |
| SUP-01 | Kundensupport | Kontakt über App |
| SUP-02 | Feedback | Verbesserungsvorschläge |
| - | Gruppenbestellungen | Team-Bestellungen |
| - | Mehrere Angebote pro Produkt | Zeitlich versetzte Angebote (FEAT-14 Future Scope) |
| - | Wochentag-Angebote | Produkte nur an bestimmten Wochentagen im Angebot (FEAT-14 Future Scope) |

---

## 8. Features (in Entwicklung)

> **Hinweis:** Die detaillierten Feature-Specs werden während der Entwicklung erstellt und sind in `features/FEAT-X.md` dokumentiert.

**Jedes Feature durchläuft:**
1. Requirements Engineer
2. UX Expert
3. Solution Architect
4. Development
5. QA Engineer
6. (Optional: UX Expert)
7. Deployment

---

## Version

- **Version:** 2.6
- **Status:** Draft
- **Erstellt:** 2026-02-24
- **Letzte Änderung:** 2026-03-07
- **Änderungen:** FEAT-15 bis FEAT-23 eingetragen (Navigation, Warenkorb, Angebote, Slider, Empfehlungen, Suche, Profil, Admin-Einstellungen, Nachbestellschwellwert, Leaderboard-Erweiterung)
