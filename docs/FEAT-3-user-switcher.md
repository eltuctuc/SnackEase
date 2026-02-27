# User Switcher (Login Flow)

**Feature-ID:** FEAT-3  
**Status:** ✅ Abgeschlossen  
**Getestet am:** 2026-02-27

---

## Zusammenfassung

Das User Switcher Feature ermöglicht das Umschalten zwischen Demo-Nutzern nach Abmeldung. Nach dem Logout kann ein anderer User ausgewählt werden. Die Login-Seite zeigt 6 Persona-Karten (5 Demo-User + Admin) mit einem einheitlichen UI.

---

## Was wurde gemacht

### Hauptfunktionen
- **Persona-Karten:** 6 Karten auf der Login-Seite (5 Demo-Personas + Admin)
- **User-Auswahl:** Ein Klick auf eine Persona-Karte wählt den User aus
- **Passwort-Vorbelegung:** demo123 für Demo-User, admin123 für Admin
- **Auto-Fokus:** Passwort-Feld wird automatisch fokussiert nach Auswahl
- **Dynamischer Hinweis:** Zeigt korrektes Passwort basierend auf Auswahl

### Benutzer-Flow

1. User ist eingeloggt
2. User klickt "Abmelden" (Logout)
3. System löscht Session-Cookie
4. User sieht Login-Seite mit 6 Persona-Karten
5. User wählt Persona-Karte (klick/tap)
6. Persona ist markiert (hervorgehoben)
7. Passwort-Feld ist fokussiert
8. User gibt Passwort ein
9. User klickt "Anmelden"
10. Bei Erfolg: Weiterleitung zur App

---

## Wie es funktioniert

### Für Benutzer

Die Login-Seite zeigt 6 Persona-Karten:
- Nina Neuanfang (Nürnberg)
- Maxine Snackliebhaber (Berlin)
- Lucas Gesundheitsfan (Nürnberg)
- Alex Gelegenheitskäufer (Berlin)
- Tom Schnellkäufer (Nürnberg)
- Admin (Nürnberg)

Nach Auswahl einer Karte wird die Email vorbelegt und das Passwort-Feld fokussiert. Der Hinweis unter dem Formular zeigt das korrekte Passwort für die gewählte Persona.

### Technische Umsetzung

- **Frontend:** Vue.js mit Composition API (`<script setup>`)
- **Styling:** Tailwind CSS
- **State:** Pinia Store
- **Auth:** Cookie-basiert (useCookie)
- **Passwörter:** bcrypt gehashed in Neon Database

**Verwendete Technologien:**
- Nuxt 3
- Vue.js (Composition API)
- Pinia
- Tailwind CSS
- Neon (PostgreSQL)
- Drizzle ORM

---

## Abhängigkeiten

- FEAT-1 (Admin Authentication) - Login-System existiert bereits
- FEAT-2 (Demo User Authentication) - Persona-System existiert bereits

---

## Getestet

- ✅ Acceptance Criteria: Alle bestanden
- ✅ Edge Cases: Alle bestanden
- ✅ Accessibility: WCAG 2.1 konform
- ✅ Security: Keine Issues gefunden
- ✅ Regression: FEAT-1 und FEAT-2 funktionieren noch

---

## Nächste Schritte

- FEAT-4 (Demo Guthaben) - Guthaben auf Dashboard anzeigen
- FEAT-5 (Admin Basis) - Admin-Funktionen erweitern
- FEAT-6 (Produktkatalog) - Produkte anzeigen

---

## Kontakt

Bei Fragen zu diesem Feature: Development Team
