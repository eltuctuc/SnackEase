# Bug Report: FEAT-2 Demo User Authentication

**Tested:** 2026-02-27
**App URL:** http://localhost:3000
**Tester:** QA Engineer

---

## Zusammenfassung

- **Bugs gefunden:** 1
- **Bugs behoben:** 1
- **Verbleibende Bugs:** 0
- **Status:** ✅ Alle Bugs behoben

---

## Bugs

### BUG-1: Keine @demo.de Domain-Validierung

- **Severity:** Medium
- **Priority:** Should Fix
- **Status:** ✅ FIXED
- **Steps to Reproduce:**
  1. Gehe zur Login-Seite
  2. Versuche dich mit einer E-Mail anzumelden, die NICHT auf @demo.de endet (z.B. maxine@gmail.com)
  3. Wenn ein User mit dieser E-Mail existiert, ist der Login erfolgreich
- **Expected:** "Nur demo.de Emails erlaubt" Fehlermeldung
- **Actual:** User kann sich anmelden, wenn er existiert (unabhängig von der Domain)
- **Location:** `src/server/api/auth/login.post.ts`
- **Fix:** Domain-Validierung hinzugefügt: `if (!email.toLowerCase().endsWith('@demo.de'))`

---

## Acceptance Criteria Status

| AC | Status | Notes |
|----|--------|-------|
| AC-1: Login-Formular mit Email und Passwort | ✅ | |
| AC-2: Nur @demo.de Domains erlaubt | ✅ | Domain-Validierung implementiert |
| AC-3: Falsches Passwort zeigt Fehlermeldung | ✅ | "Ungültige Anmeldedaten" |
| AC-4: Nach Login: Weiterleitung zur Startseite | ✅ | |
| AC-5: Eingeloggter User wird im Header angezeigt | ✅ | |
| AC-6: Logout-Funktion vorhanden | ✅ | |
| AC-7: Nach Abmeldung: Zurück zur Login-Seite | ✅ | |

---

## Edge Cases Status

| EC | Status | Notes |
|----|--------|-------|
| EC-1: Falsches Passwort | ✅ | "Ungültige Anmeldedaten" |
| EC-2: Andere Domain als @demo.de | ✅ | "Nur demo.de Emails erlaubt" |
| EC-3: User nicht vorhanden | ✅ | "Ungültige Anmeldedaten" |
| EC-4: Session abgelaufen | ✅ | User wird ausgeloggt |
| EC-5: Admin als mitarbeiter | ✅ | Funktioniert |

---

## Security Check

- ✅ Input Validation funktioniert
- ✅ Auth-Checks korrekt (Rolle wird geprüft)
- ✅ Rate Limiting aktiv
- ✅ Domain-Validierung implementiert

---

## UX-Empfehlung

**Soll UX Expert nochmals prüfen?** ❌ Nein

**Begründung:** Der gefundene Bug ist ein fehlendes Feature (Domain-Validierung), beeinträchtigt aber nicht die Kernfunktionalität. Alle anderen UX-Anforderungen sind erfüllt.

---

## Recommendation

✅ **Alle Bugs behoben!** FEAT-2 ist bereit für Production.
