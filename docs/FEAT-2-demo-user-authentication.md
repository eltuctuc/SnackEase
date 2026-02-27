# Demo User Authentication (FEAT-2)

**Feature-ID:** FEAT-2  
**Status:** ✅ Abgeschlossen  
**Getestet am:** 2026-02-27

---

## Zusammenfassung

Dieses Feature ermöglicht es Demo-Nutzern (Mitarbeiter-Personas), sich am SnackEase-System anzumelden. Es bietet eine vereinfachte Anmeldung mit vorausgewählten Persona-Profilen für realistisches Testing.

---

## Was wurde gemacht

### Hauptfunktionen

- **Persona-Auswahl:** 5 Demo-User werden als Auswahlkarten angezeigt
- **Schnell-Login:** Ein Klick auf Persona + "Anmelden" (Passwort vorausgefüllt)
- **Admin-Login:** Optionale "Als Admin anmelden" Option
- **Session-Persistenz:** Cookie-basierte Auth mit 7-Tage-Gültigkeit
- **Logout:** Abmeldung mit Weiterleitung zur Login-Seite

### Demo-Personas

| Name | Email | Standort | Rolle |
|------|-------|----------|-------|
| Nina Neuanfang | nina@demo.de | Nürnberg | mitarbeiter |
| Maxine Snackliebhaber | maxine@demo.de | Berlin | mitarbeiter |
| Lucas Gesundheitsfan | lucas@demo.de | Nürnberg | mitarbeiter |
| Alex Gelegenheitskäufer | alex@demo.de | Berlin | mitarbeiter |
| Tom Schnellkäufer | tom@demo.de | Nürnberg | mitarbeiter |

**Passwort für alle:** `demo123`

---

## Technische Umsetzung

### Backend
- `POST /api/auth/login` - Erweitert für mitarbeiter-Rolle
- `GET /api/auth/me` - Liefert User inkl. Standort
- `POST /api/auth/logout` - Löscht Cookie
- Domain-Validierung: Nur @demo.de erlaubt
- Rate-Limiting: 5 Versuche / 15 Minuten

### Frontend
- Pinia Store für Auth-State
- Cookie-basierte Session (client-lesbar)
- SSR-Safe mit `$fetch` statt `useFetch`
- Persona-Karten mit aria-pressed Attributen

### Datenbank
- `users` Tabelle erweitert mit `location` Feld
- 5 Demo-User mit bcrypt-gehashtem Passwort

---

## Getestet

- ✅ Acceptance Criteria: Alle bestanden
- ✅ Edge Cases: Alle bestanden
- ✅ Security: Domain-Validierung, Rate-Limiting
- ✅ Accessibility: WCAG 2.1 konform
- ✅ Bug gefunden: Domain-Validierung (bereits behoben)

---

## Bugs gefunden

**BUG-1 (Medium):** Keine @demo.de Domain-Validierung → **BEHOBEN**

---

## Nächste Schritte

- FEAT-3: User Switcher (zwischen Personas wechseln)
- FEAT-4: Demo Guthaben (Guthaben pro Persona)

---

## Ansprechpartner

Bei Fragen: Development Team
