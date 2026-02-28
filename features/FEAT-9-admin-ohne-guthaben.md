# FEAT-9: Admin ohne Guthaben

## Status: 🟡 Ready for Solution Architect

## Abhängigkeiten
- Benötigt: FEAT-4 (Demo-Guthaben) - für Guthaben-Funktionalität

---

## 1. Overview

**Beschreibung:** Der Admin (admin@demo.de) hat KEIN Guthaben in der Datenbank. Admin kann nichts kaufen und bekommt keine monatliche Pauschale. Das Guthaben-System gilt nur für Mitarbeiter (role: mitarbeiter).

**Ziel:** Vollständige Trennung - Admin hat kein Guthaben, weder in der UI noch in der Datenbank.

---

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Admin habe ich KEIN Guthaben in der Datenbank | Must-Have |
| US-2 | Als Admin kann ich KEINE Produkte kaufen | Must-Have |
| US-3 | Als Admin erhalte ich KEINE monatliche Pauschale | Must-Have |
| US-4 | Als Admin sehe ich KEINE Guthaben-UI | Must-Have |
| US-5 | Als Mitarbeiter habe ich weiterhin Guthaben | Must-Have |

---

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Admin (role=admin): KEIN Eintrag in user_credits | Must-Have |
| REQ-2 | Admin kann KEINE Guthaben-API aufrufen | Must-Have |
| REQ-3 | Admin kann KEINE Monatspauschale erhalten | Must-Have |
| REQ-4 | Admin sieht KEINE Guthaben-Karte im Dashboard | Must-Have |
| REQ-5 | Wenn Admin Guthaben-API aufruft: Error 403 | Must-Have |
| REQ-6 | Mitarbeiter (role=mitarbeiter): Guthaben wie bisher | Must-Have |

---

## 4. Datenbank-Logik

```
BEI NEUEM USER:
  IF role === 'admin':
    → KEIN user_credits Eintrag erstellen
  ELSE:
    → user_credits mit Startguthaben erstellen

BEI API AUFRUFEN:
  IF user.role === 'admin':
    → Error 403: "Admin hat kein Guthaben"
  ELSE:
    → Normale Guthaben-Logik
```

---

## 5. Acceptance Criteria

- [ ] Admin (admin@demo.de) hat KEINEN Eintrag in user_credits
- [ ] API /api/credits/balance gibt 403 für Admin zurück
- [ ] API /api/credits/recharge gibt 403 für Admin zurück
- [ ] API /api/credits/monthly gibt 403 für Admin zurück
- [ ] Admin-Dashboard zeigt KEINE Guthaben-Karte
- [ ] Mitarbeiter haben weiterhin Guthaben wie bisher

---

## 6. Edge Cases

| ID | Scenario | Erwartetes Verhalten |
|----|---------|---------------------|
| EC-1 | Admin versucht Guthaben abzurufen | 403 Error |
| EC-2 | Admin versucht aufzuladen | 403 Error |
| EC-3 | Neuer Admin wird erstellt | Kein Guthaben-Eintrag |
| EC-4 | Admin versucht Monatspauschale | 403 Error |
