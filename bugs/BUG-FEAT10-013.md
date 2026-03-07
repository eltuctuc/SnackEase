# BUG-FEAT10-013: Kein Schutz gegen parallele System-Reset Anfragen (EC-5)

**Feature:** FEAT-10 Erweitertes Admin-Dashboard
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-06
**App URL:** http://localhost:3000/admin

---

## Beschreibung

Die Feature-Spec definiert EC-5 ("Parallele Reset-Anfragen: Nur eine Anfrage zurzeit") als Anforderung, aber der implementierte `/api/admin/reset` POST-Endpunkt hat keinen Mechanismus um gleichzeitige Requests zu verhindern. Der Frontend-Code setzt zwar `isResetting.value = true`, aber das schuetzt nur den Button im gleichen Browser-Tab - nicht gegen parallele Requests von verschiedenen Browser-Tabs oder direkten API-Aufrufen.

**Betroffene Datei:** `src/server/api/admin/reset.post.ts`

Wenn zwei Reset-Requests gleichzeitig eintreffen:
1. Beide starten eine Transaktion
2. Beide loeschen `purchases` und `creditTransactions`
3. Beide setzen Guthaben auf 25 EUR
4. Das kann zu Datenkonsistenz-Problemen fuehren (z.B. doppelter Guthaben-Reset auf 25 EUR wenn zwischendurch Guthaben geaendert wurde)

## Steps to Reproduce

1. Zwei Browser-Tabs als Admin oeffnen
2. In beiden Tabs das System-Reset-Modal oeffnen und "RESET" eingeben
3. Beide "Bestaetigen"-Buttons schnell hintereinander klicken
4. Oder: Zwei gleichzeitige API-Aufrufe senden:
```bash
curl -X POST http://localhost:3000/api/admin/reset -H "Cookie: auth_token=user_1" &
curl -X POST http://localhost:3000/api/admin/reset -H "Cookie: auth_token=user_1" &
```

## Expected Behavior

Nur einer der beiden Requests wird ausgefuehrt. Der zweite Request erhaelt HTTP 409 ("Reset bereits aktiv") oder wartet bis der erste abgeschlossen ist.

## Actual Behavior

Beide Requests werden ausgefuehrt. Dies kann bei gleichzeitigen Schreiboperationen auf denselben Daten zu Race Conditions fuehren.

## Environment

- Browser: Alle
- Device: Desktop
- OS: Alle

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-10: EC-5 explizit als Edge Case definiert

---

## Attachments

- Screenshots: keine
- Logs: keine

## Loesungsvorschlag

Einfachste Loesung fuer Demo-Kontext: Einen In-Memory-Lock implementieren oder einen DB-basierten Semaphor. Alternativ: PostgreSQL Advisory Locks via `pg_try_advisory_lock()` in der Transaktion verwenden.
