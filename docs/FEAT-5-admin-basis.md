# Admin-Basis (Demo-Modus)

**Feature-ID:** FEAT-5  
**Status:** ✅ Abgeschlossen  
**Getestet am:** 2026-02-28

---

## Zusammenfassung

Das Admin-Basis Feature ermöglicht es dem Admin eines Demo-Systems, das System zu verwalten. Der Admin kann Demo-Daten zurücksetzen, Statistiken einsehen und Nutzer verwalten.

---

## Was wurde gemacht

### Hauptfunktionen
- **Admin-Dashboard** - Übersicht mit aggregierten Statistiken
- **System-Reset** - Alle Transaktionen löschen, Guthaben auf 25€ zurücksetzen
- **Guthaben-Reset** - Nur Guthaben zurücksetzen, Transaktionen bleiben erhalten
- **Nutzer-Verwaltung** - Liste der Nutzer ansehen, neue Nutzer anlegen, Nutzer deaktivieren/aktivieren
- **Datenschutz** - Admin sieht keine individuellen Guthaben oder Transaktionen

### Benutzer-Flow
1. Admin loggt sich mit admin@demo.de / admin123 ein
2. Admin sieht im Dashboard Link "→ Admin-Bereich"
3. Admin kann Statistiken sehen (aggregiert)
4. Admin kann System-Reset durchführen (mit zweistufiger Bestätigung)
5. Admin kann Nutzer-Liste einsehen und verwalten

---

## Wie es funktioniert

### Für Benutzer
Der Admin sieht nach dem Login einen Link zum Admin-Bereich. Dort hat er Zugriff auf:
- Dashboard mit Statistiken (Anzahl Nutzer, Transaktionen heute, Gesamtguthaben)
- System-Reset mit Bestätigungs-Dialog
- Guthaben-Reset (ohne Transaktionen zu löschen)
- Nutzer-Liste mit Möglichkeit zum Deaktivieren/Aktivieren

### Technische Umsetzung

**Middleware:**
- `/admin` Routes sind durch Middleware geschützt
- Nur eingeloggte User mit Admin-Rolle haben Zugriff

**API-Endpoints:**
- `GET /api/admin/stats` - Aggregierte Statistiken
- `POST /api/admin/reset` - Vollständiger System-Reset
- `POST /api/admin/credits/reset` - Nur Guthaben-Reset
- `GET /api/admin/users` - Nutzer-Liste
- `POST /api/admin/users` - Neuen Nutzer anlegen
- `POST /api/admin/users/:id/toggle` - Nutzer aktivieren/deaktivieren

**Datenschutz:**
- Admin sieht NUR aggregierte Daten
- Keine individuellen Guthaben, Transaktionen oder Kaufhistorien

**Verwendete Technologien:**
- Nuxt 3 (Frontend + Backend)
- Neon Database (PostgreSQL)
- Drizzle ORM
- Tailwind CSS

---

## Abhängigkeiten

- **FEAT-1** - Admin Authentication (Login, Session)

---

## Getestet

- ✅ Acceptance Criteria: Alle bestanden
- ✅ Edge Cases: Alle bestanden
- ✅ Security: Keine Issues gefunden
- ✅ Regression: Bestehende Features beeinträchtigt

---

## Nächste Schritte

- Optional: Admin-Logs für Audit-Trail
- Optional: Erweiterte Statistiken (Charts, etc.)

---

## Kontakt

Bei Fragen zu diesem Feature: Development Team
