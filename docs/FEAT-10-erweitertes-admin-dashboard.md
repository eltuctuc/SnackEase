# Erweitertes Admin-Dashboard

**Feature-ID:** FEAT-10
**Status:** Implementiert (mit offenen Bugs - siehe unten)
**Getestet am:** 2026-03-06

---

## Zusammenfassung

FEAT-10 erweitert das bestehende Admin-Dashboard (FEAT-5) um eine vollstaendige Systemverwaltung. Administratoren koennen nun Produkte, Kategorien und Nutzer verwalten, Statistiken einsehen und das System zuruecksetzen - alles ohne Zugriff auf die Bestellfunktion.

---

## Was wurde gemacht

### Hauptfunktionen

- **Nutzer-Verwaltung:** Neue Nutzer anlegen, Nutzerdaten bearbeiten, Nutzer aktivieren/deaktivieren, Guthaben manuell zuweisen
- **Produkt-Verwaltung:** Produkte anlegen, bearbeiten, aktivieren/deaktivieren (Soft-Delete), Bilder hochladen (JPG/PNG/WebP, max. 5MB)
- **Kategorie-Verwaltung:** Kategorien anlegen, bearbeiten, aktivieren/deaktivieren, loeschen mit Produkt-Neuzuordnungs-Flow
- **Erweiterte Statistiken:** Gesamt-Nutzer, Bestellungen (heute/gesamt), Transaktionen, Login-Statistiken
- **System-Reset:** Alle Kaeufe, Transaktionen und Guthaben zuruecksetzen (mit "RESET"-Bestaetigung)
- **Guthaben-Reset:** Nur das Guthaben aller Nutzer auf 25 EUR zuruecksetzen
- **Admin-Navigation:** Persistente horizontale Navigation mit Dashboard, Nutzer, Produkte, Kategorien

### Benutzer-Flow

1. Admin loggt sich ein mit `admin@demo.de`
2. Redirect automatisch zu `/admin` (nicht zum User-Dashboard)
3. Dashboard zeigt anonyme Statistiken (Nutzeranzahl, Bestellungen, Transaktionen, Logins)
4. Navigation oben: Nutzer / Produkte / Kategorien anwaehlen
5. Aenderungen werden sofort gespeichert, Listen aktualisieren sich ohne Seitenreload
6. Bei destruktiven Aktionen (Loeschen, Reset) erscheint immer ein Bestaetigungs-Dialog

---

## Wie es funktioniert

### Fuer Administratoren

Der Admin sieht nach dem Login das Dashboard mit Statistik-Karten:
- Gesamtzahl Nutzer und aktive Mitarbeiter
- Logins heute und fehlgeschlagene Login-Versuche
- Bestellungen gesamt und heute
- Transaktionen gesamt und Gesamt-Guthaben aller Nutzer

In der **Nutzer-Verwaltung** (`/admin/users`):
- Tabelle mit allen Mitarbeiter-Konten (kein eigenes Guthaben sichtbar, keine Transaktionshistorie)
- Suche nach Name oder E-Mail, Filter nach aktiv/inaktiv
- "Bearbeiten" oeffnet ein Modal fuer Name und Standort
- "Guthaben" oeffnet ein Modal fuer manuelle Guthaben-Zuweisung mit optionaler Notiz
- "Aktivieren/Deaktivieren" schaltet den Nutzer-Status sofort um

In der **Produkt-Verwaltung** (`/admin/products`):
- Tabelle mit Produktbild, Name, Kategorien, Preis, Lagerbestand, Status
- Filter nach Kategorie und Status (aktiv/inaktiv)
- Neues Produkt anlegen: Name, Preis, Kategorien (Multi-Select), Bild, Naehrwertangaben
- Produkte koennen mehreren Kategorien zugeordnet werden
- "Loeschen" = Soft-Delete: Produkt wird deaktiviert, bestehende Bestellungen bleiben erhalten

In der **Kategorie-Verwaltung** (`/admin/categories`):
- Tabelle mit Name, Beschreibung, Produktanzahl, Status
- Kategorie deaktivieren blendet alle zugehoerigen Produkte im Frontend aus - ohne sie zu deaktivieren
- Bei Reaktivierung werden Produkte automatisch wieder sichtbar
- Kategorie loeschen: Wenn Produkte nur dieser Kategorie zugeordnet sind, muss eine neue Kategorie zugewiesen werden. Ein Produkt darf niemals ohne Kategorie existieren.

### Technische Umsetzung

Alle Admin-Routen sind durch `requireAdmin()` serverseitig geschuetzt - jeder Request prueft das HttpOnly-Cookie und verifiziert die Admin-Rolle in der Datenbank.

**Architektur:**
- Frontend: Nuxt 3 Pages in `src/pages/admin/` mit Composition API
- Backend: Server API Routes in `src/server/api/admin/`
- Datenbank: Neue Tabellen `categories`, `product_categories` (Many-to-Many), `login_events`
- Auth-Middleware: `src/middleware/auth.global.ts` leitet Admins von `/dashboard` nach `/admin` um

**Verwendete Technologien:**
- Nuxt 3 / Vue 3 Composition API (`<script setup>`)
- Drizzle ORM (Neon PostgreSQL)
- HttpOnly Cookie Authentifizierung
- Tailwind CSS fuer UI
- Node.js `fs/promises` fuer lokalen Bild-Upload (Demo-Umgebung)

---

## Screenshots

Die folgenden Admin-Seiten wurden implementiert:
- `/admin` - Dashboard mit Statistik-Karten und Reset-Aktionen
- `/admin/users` - Nutzer-Verwaltung mit Tabelle und Modals
- `/admin/products` - Produkt-Verwaltung mit Grid-Ansicht und Bild-Upload
- `/admin/categories` - Kategorie-Verwaltung mit Loeschen-Flow

---

## Abhaengigkeiten

- **FEAT-5** - Admin-Basis (Login, Grundstruktur) - vorhanden und erweitert
- **FEAT-6** - Produktkatalog - Produkte und Kategorien-Filterlogik wiederverwendet
- **FEAT-7** - One-Touch Kauf - `purchases`-Tabelle wird bei System-Reset geleert
- **FEAT-9** - Admin ohne Guthaben - REQ-1/REQ-3 (kein Bestellen, kein Guthaben) bestaetigt

---

## Bekannte Einschraenkungen

1. **Bild-Upload nicht persistent auf Vercel:** `public/uploads/` ist bei Serverless-Deployments nicht persistent. Fuer Production muss externer Storage (z.B. Supabase Storage, Cloudinary) konfiguriert werden.
2. **Peak-Zeiten nicht implementiert:** Die `login_events`-Tabelle ist bereit, aber die grafische Darstellung (REQ-32, Should-Have) wurde zurueckgestellt.
3. **Alte Produkte ohne Kategorie-Junction:** Produkte die vor FEAT-10 angelegt wurden, haben noch keine Eintraege in `product_categories` - nur das alte Text-Feld `products.category`. Die Admin-UI zeigt beides.

---

## Offene Bugs (Stand 2026-03-06)

| Bug-ID | Severity | Beschreibung |
|--------|----------|--------------|
| BUG-FEAT10-012 | High | Fehlender UNIQUE Constraint auf `product_categories` - Race Conditions moeglich |
| BUG-FEAT10-008 | Medium | Rollback bei Bild-Upload-Fehler hinterlaesst deaktiviertes Geister-Produkt |
| BUG-FEAT10-009 | Medium | Drag-and-Drop Bild-Upload hat redundanten Code, potenzieller Safari-Bug |
| BUG-FEAT10-010 | Medium | Nutzer-Erstellung erlaubt negatives Startguthaben per direktem API-Aufruf |
| BUG-FEAT10-013 | Medium | Kein Server-Lock gegen parallele System-Reset-Anfragen (EC-5) |
| BUG-FEAT10-011 | Low | N+1-nahes Query-Problem in Admin-Produktliste (fehlender WHERE-Filter) |

---

## Getestet

- Unit-Tests: Alle 143 Tests bestanden (15 geskippt), 0 fehlgeschlagen
- Acceptance Criteria: 35 von 37 REQs implementiert (REQ-32 Peak-Zeiten als Should-Have nicht implementiert)
- Edge Cases: EC-1 bis EC-10 geprueft (EC-5 und EC-7 mit Einschraenkungen)
- Cross-Browser: Chrome, Firefox (Safari Drag-and-Drop als BUG-009 dokumentiert)
- Responsive: Desktop und Tablet unterstuetzt (Mobile explizit nicht vorgesehen)
- Accessibility: WCAG 2.1 AA - alle Modals mit `role="dialog"`, `aria-modal`, `aria-labelledby`, Focus-States vorhanden
- Security: Alle Admin-API-Routen serverseitig durch `requireAdmin()` geschuetzt, Drizzle ORM verhindert SQL-Injection
- Regression: FEAT-2, FEAT-4, FEAT-6, FEAT-7, FEAT-8 funktionieren weiterhin korrekt

---

## Naechste Schritte

- BUG-FEAT10-012 (High) muss vor Production-Deployment gefixt werden
- FEAT-11: Bestellabholung am Automaten (nutzt `purchases.status` und `pickupPin`)
- FEAT-12: Bestandsverwaltung (nutzt `products.stock`)
- Production-Storage fuer Produktbilder konfigurieren (Vercel Einschraenkung)
- Peak-Zeiten-Darstellung implementieren (REQ-32, Should-Have)

---

## Kontakt

Bei Fragen zu diesem Feature: Development Team / Admin-Bereich
