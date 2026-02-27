# FEAT-5: Admin-Basis (Demo-Modus)

## Status: 🔵 Planned

## Abhängigkeiten
- Benötigt: FEAT-1 (Admin Authentication) - für Admin-Login

## 1. Overview

**Beschreibung:** Basis-Admin-Funktionen für die Demo: System-Reset und Demo-Nutzer-Verwaltung.

**Ziel:** Ermöglicht dem Admin das Verwalten des Demo-Systems.

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin möchte ich alle Demo-Daten zurücksetzen können | Must-Have |
| US-2 | Als Admin möchte ich neue Demo-Nutzer anlegen können | Should-Have |
| US-3 | Als Admin möchte ich Guthaben aller Nutzer zurücksetzen können | Should-Have |

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Admin-Bereich nur für admin@demo.de zugänglich | Must-Have |
| REQ-2 | System-Reset: Alle Käufe, Transaktionen zurücksetzen | Must-Have |
| REQ-3 | Bestätigungsdialog vor Reset | Must-Have |
| REQ-4 | Admin-Bereich erreichbar über /admin Route | Must-Have |

## 4. Admin-Zugang

**Bestehender Admin Account (aus FEAT-1):**
- Email: `admin@demo.de`
- Passwort: `admin123`
- Rolle: `admin`

## 5. Funktionen

### 5.1 System-Reset

**Funktion:** Setzt alle Demo-Daten zurück auf Startzustand.

**Zurücksetzen:**
- Alle Käufe löschen
- Transaktionshistorie löschen
- Guthaben aller Nutzer auf Startwert zurücksetzen
- Leaderboard zurücksetzen

**Nicht zurücksetzen:**
- Produktkatalog
- Admin-Account
- Demo-Nutzer-Accounts (nur Guthaben)

### 5.2 Guthaben-Reset (Optional)

**Funktion:** Setzt Guthaben aller Nutzer auf Standard zurück, ohne Käufe zu löschen.

### 5.3 Demo-Nutzer anlegen (Optional)

**Felder:**
| Feld | Typ | Pflicht | Standard |
|------|-----|---------|----------|
| Name | Text | Ja | - |
| Standort | Select (Nürnberg/Berlin) | Ja | Nürnberg |
| Startguthaben | Number | Nein | 25€ |

## 6. Acceptance Criteria

- [ ] Admin-Login mit admin@demo.de / admin123 funktioniert
- [ ] Admin-Bereich nur für eingeloggten Admin sichtbar
- [ ] /admin Route schützt durch Middleware
- [ ] System-Reset zeigt Bestätigungsdialog
- [ ] Nach Reset sind alle Werte auf Startzustand
- [ ] Erfolgreiche Reset-Bestätigung

## 7. UI/UX Vorgaben

- Admin-Bereich über eigenes Icon/Menü im Header (nur für Admin sichtbar)
- Reset-Funktion mit prominentem "Gefahr"-Hinweis (rot)
- Bestätigungsmodal mit Eingabefeld zur Bestätigung ("RESET" eintippen)

## 8. Technische Hinweise

- **Neon Database** mit Drizzle ORM
- **Authentifizierung:** Cookie-basiert (bestehend aus FEAT-1)
- **Admin-Route:** `/admin` mit Middleware-Schutz
- **Reset:** SQL-Transaktion oder DB-Funktion

### Middleware-Schutz (bestehend)
```typescript
// src/middleware/auth.global.ts - muss erweitert werden
if (to.path.startsWith('/admin')) {
  if (!authCookie.value) {
    return navigateTo('/login')
  }
  // Admin-Rolle prüfen
}
```

## 9. API Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/admin/reset` | POST | System-Reset durchführen |
| `/api/admin/credits/reset` | POST | Nur Guthaben zurücksetzen |

## 10. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Nicht-Admin versucht /admin | Redirect zu /dashboard |
| EC-2 | Reset während aktiver Sitzung | Session bleibt, nur Daten zurückgesetzt |
| EC-3 | DB-Fehler beim Reset | Rollback, Fehlermeldung |
