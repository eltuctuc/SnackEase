# BUG-FEAT4-010: Monatspauschale hat kein Server-seitiges Limit — User kann unbegrenzt abrufen

**Feature:** FEAT-4 Demo-Guthaben
**Severity:** High
**Priority:** Must Fix
**Gefunden am:** 2026-03-05
**App URL:** http://localhost:3000/dashboard

---

## Beschreibung

Die `POST /api/credits/monthly` Route in `monthly.post.ts` prüft **nicht**, ob der eingeloggte Mitarbeiter die Monatspauschale im aktuellen Monat bereits abgerufen hat. Jeder Klick auf "Monatspauschale +25€" fügt dem Konto 25€ hinzu — ohne Limit. Ein Mitarbeiter kann die Monatspauschale beliebig oft (z.B. 100x täglich) aufrufen und sein Guthaben unbegrenzt erhöhen.

Die Feature-Spec (FEAT-4, REQ-5) definiert: "Monatliche Gutschrift (simuliert) - **25€ pro Monat**, manuell via Button". Die Einschränkung "pro Monat" wird serverseitig nicht durchgesetzt.

Der Frontend-Button hat ebenfalls keine Sperre nach erfolgreichem Abruf, da der lokale `creditsStore.isLoading`-State nur während des API-Calls gesetzt ist und nach dem Abschluss wieder `false` wird.

## Steps to Reproduce

1. Navigiere zu http://localhost:3000/dashboard als Mitarbeiter (z.B. nina@demo.de)
2. Klicke mehrfach auf "Monatspauschale +25€"
3. Jeder Klick erhöht das Guthaben um 25€ — ohne Fehlermeldung oder Limit
4. Direkt via API: `POST /api/credits/monthly` wiederholt aufrufen → jeder Call fügt 25€ hinzu

## Expected Behavior

Serverseitig: Vor dem Gutschreiben prüfen, ob für den aktuellen Benutzer in diesem Kalendermonat bereits eine Monatspauschale gutgeschrieben wurde (über `lastRechargedAt` oder ein dediziertes Feld).

Bei erneutem Versuch sollte der Server mit einem 409-Fehler antworten: "Monatspauschale bereits in diesem Monat abgerufen."

## Actual Behavior

Kein serverseitiges Limit. Jeder API-Call schreibt 25€ gut. `monthly.post.ts` prüft nur ob der User eingeloggt ist und nicht Admin ist — kein Monats-Check.

## Betroffene Datei

`src/server/api/credits/monthly.post.ts`:
```typescript
// Fehlendes Business-Logic-Check:
// Keine Prüfung ob lastRechargedAt im aktuellen Monat liegt
// Kein Datenbankfeld für "monatliche Gutschrift bereits abgerufen"

const creditsResults = await db.select().from(userCredits).where(...)
// Direkt newBalance = currentBalance + 25 → kein Limit-Check
```

## Security-Impact

- **Finanziell:** Mitarbeiter können ihr Guthaben beliebig erhöhen (Demo-Umgebung, aber trotzdem)
- **Audit-Log:** Alle Aufladungen werden als `type: 'recharge'` geloggt — Missbrauch ist nachvollziehbar, aber nicht verhindert

## Mögliche Lösung

In `monthly.post.ts` nach dem Abrufen der `creditsResults` prüfen:
```typescript
if (creditsResults[0]?.lastRechargedAt) {
  const lastRecharged = new Date(creditsResults[0].lastRechargedAt)
  const now = new Date()
  if (
    lastRecharged.getFullYear() === now.getFullYear() &&
    lastRecharged.getMonth() === now.getMonth()
  ) {
    throw createError({
      statusCode: 409,
      message: 'Monatspauschale wurde in diesem Monat bereits abgerufen.',
    })
  }
}
```

Alternativ: Separates `monthlyReceivedAt`-Feld in `user_credits` Tabelle.

## Environment

- Browser: Alle
- Device: Desktop/Mobile
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keiner

### Zu anderen Features
- FEAT-4: Demo-Guthaben — Business-Logic-Anforderung REQ-5

---

## Attachments

- Screenshots: —
- Logs: —
