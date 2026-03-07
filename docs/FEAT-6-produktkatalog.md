# Produktkatalog

**Feature-ID:** FEAT-6
**Status:** Abgeschlossen
**Getestet am:** 2026-03-04

---

## Zusammenfassung

Der Produktkatalog zeigt alle verfügbaren Snacks und Getränke übersichtlich in einem Grid-Layout an. Nutzer können Produkte nach Kategorien filtern und per Echtzeit-Suche nach Namen suchen — das Herzstück der SnackEase-App.

---

## Was wurde gemacht

### Hauptfunktionen

- Produkt-Grid mit allen 20 verfügbaren Snacks und Getränken (2–4 Spalten, responsive)
- Kategorie-Filter mit 6 Kategorien: Obst, Proteinriegel, Shakes, Schokoriegel, Nüsse, Getränke
- Echtzeit-Suchfeld: filtert Produkte nach Namen, kategorie-übergreifend
- Verfügbarkeitsanzeige: nicht vorratige Produkte sind visuell markiert und nicht kaufbar
- Vegan- und Glutenfrei-Icons direkt auf der Produktkarte sichtbar

### Benutzer-Flow

1. Nutzer öffnet die App und sieht das Produkt-Grid auf dem Dashboard
2. Nutzer klickt optional auf einen Kategorie-Filter (z.B. "Proteinriegel")
3. Die Produktliste aktualisiert sich sofort auf die ausgewählte Kategorie
4. Nutzer gibt optional einen Suchbegriff im Suchfeld ein (z.B. "Apfel")
5. Die Anzeige filtert die Produkte in Echtzeit — Kategorie- und Suchfilter sind kombinierbar
6. Bei keinem Treffer erscheint die Meldung "Keine Produkte gefunden fur '[Suchbegriff]'"
7. Nutzer klickt auf eine Produktkarte, um Details aufzurufen

---

## Wie es funktioniert

### Fur Benutzer

Auf dem Dashboard sehen Nutzer sofort alle verfügbaren Snacks und Getränke in einem übersichtlichen Grid. Oben befindet sich ein Suchfeld — einfach den Produktnamen eintippen, und die Liste aktualisiert sich live. Darunter sind Kategorie-Buttons (Alle / Obst / Proteinriegel / ...), mit denen das Sortiment auf eine Warengruppe eingeschränkt werden kann. Beide Filter lassen sich kombinieren.

Produktkarten zeigen Bild, Name, Preis sowie kleine Icons fur vegane und glutenfreie Produkte. Nicht vorratige Artikel sind visuell abgedimmt und können nicht gekauft werden.

### Technische Umsetzung

Das Backend stellt zwei API-Endpunkte bereit:

- `GET /api/products` — liefert alle Produkte, optional gefiltert nach Kategorie (`?category=obst`) und/oder Suchbegriff (`?search=apfel`). Die Suche nutzt PostgreSQL `ILIKE` fur case-insensitive Volltextsuche auf dem Produktnamen.
- `GET /api/products/:id` — liefert ein einzelnes Produkt mit allen Details.

Die Daten liegen in einer eigenen Tabelle `products` in der Neon PostgreSQL-Datenbank (getrennt von der alteren `snacks`-Tabelle), um erweiterte Attribute wie Nährwerte und Allergene sauber abzubilden. Der DB-Zugriff erfolgt ausschliesslich serverseitig uber Drizzle ORM.

Das Frontend (Nuxt 3) verwendet einen Pinia-Store und die Composition API. Suchbegriff und aktive Kategorie sind reaktive Zustande; geanderte Werte losten automatisch einen neuen API-Call aus.

**Verwendete Technologien:**

- Nuxt 3 (Vue 3, Composition API mit `<script setup>`)
- TypeScript (keine `any`-Typen)
- Pinia (Store im Setup-Syntax)
- Drizzle ORM + Neon PostgreSQL
- Tailwind CSS (responsives Grid-Layout)

---

## Screenshots

Screenshots sind im QA-Report vom 2026-03-04 abgelegt (siehe `features/FEAT-6-produktkatalog.md`, Sektion 13).

---

## Abhängigkeiten

- FEAT-4 (Demo-Guthaben) — Produktpreise werden gegen das Nutzerguthaben geprüft; wird fur die spatere Kauf-Integration benotigt
- FEAT-7 (One-Touch Kauf) — baut auf dem Produktkatalog auf und nutzt die Produkt-IDs aus dieser Tabelle

---

## Getestet

- Acceptance Criteria: 4/6 bestanden (2 nicht testbar, da ProductDetailModal in separatem Feature)
- Edge Cases: 2/6 vollstandig getestet, 4 nicht testbar oder nicht relevant
- Cross-Browser: Chrome, Firefox, Safari
- Responsive: Mobile (375 px), Tablet (768 px), Desktop (1440 px)
- Accessibility: WCAG 2.1 konform (Kontrast, Tab-Navigation, ARIA-Labels, Touch-Targets)
- Security: Keine Issues gefunden
- Regression: Keine bestehenden Features beeintrachtigt
- Kritischer Bug BUG-FEAT6-001 (Suche ignorierte Kategorie-Filter) wurde vor Abnahme behoben

---

## Nachste Schritte

- ProductDetailModal implementieren (AC-4 und AC-5 sind aktuell nicht testbar)
- Nicht vorratige Produkte als Seed-Daten anlegen, um EC-2 vollstandig zu testen
- Pagination oder Virtual Scrolling fur den Fall >100 Produkte vorbereiten (EC-6)
- Favoriten-Funktion fur Maxine Snackliebhaber (als eigenes Feature geplant)

---

## Kontakt

Bei Fragen zu diesem Feature: Entwicklungsteam SnackEase
