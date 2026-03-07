# FEAT-14: Angebote & Rabatte

## Status: Planned

## Abhaengigkeiten
- Benoetigt: FEAT-6 (Produktkatalog) - Produktkarten und Preis-Anzeige fuer User
- Benoetigt: FEAT-7 (One-Touch Kauf) - Angebotspreis muss beim Kauf automatisch angewendet werden
- Benoetigt: FEAT-10 (Erweitertes Admin-Dashboard) - Admin-Produktuebersicht als Einstiegspunkt

---

## 1. Uebersicht

**Beschreibung:** Admins koennen fuer jedes Produkt ein zeitlich begrenztes Angebot mit Rabatt (Prozent oder absoluter Betrag) erstellen. Aktive Angebote werden im Produktkatalog fuer User sichtbar angezeigt (Originalpreis durchgestrichen, neuer Preis) und beim Kauf automatisch angewendet.

**Ziel:** Anreize schaffen, bestimmte Produkte verstaerkt zu kaufen, und Mitarbeiter durch attraktive, zeitlich begrenzte Angebote zu motivieren.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Admin moechte ich fuer ein Produkt ein Angebot erstellen, damit ich gezielt Rabatte anbieten kann | Admin | Must-Have |
| US-2 | Als Admin moechte ich einen Rabatt entweder als Prozentsatz oder als absoluten Betrag angeben koennen | Admin | Must-Have |
| US-3 | Als Admin moechte ich einen Gueltigkeitszeitraum (von/bis Datum) fuer ein Angebot festlegen | Admin | Must-Have |
| US-4 | Als Admin moechte ich ein Angebot in der Produktuebersicht per Schaltflaeche oeffnen und verwalten koennen | Admin | Must-Have |
| US-5 | Als Admin moechte ich ein bestehendes Angebot manuell deaktivieren koennen, auch wenn es noch im Gueltigkeitszeitraum liegt | Admin | Must-Have |
| US-6 | Als Admin moechte ich ein deaktiviertes Angebot wieder aktivieren koennen | Admin | Must-Have |
| US-7 | Als Admin moechte ich ein Angebot loeschen koennen | Admin | Must-Have |
| US-8 | Als Admin moechte ich in der Produktuebersicht auf einen Blick sehen, welche Produkte gerade ein aktives Angebot haben | Admin | Must-Have |
| US-9 | Als Mitarbeiter moechte ich in der Produktuebersicht den Angebotspreis (Originalpreis durchgestrichen + neuer Preis) sehen, damit ich erkennen kann, welche Produkte im Angebot sind | User | Must-Have |
| US-10 | Als Mitarbeiter moechte ich beim Kauf automatisch den Angebotspreis bezahlen, ohne einen Code eingeben zu muessen | User | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Admin: Angebot erstellen/bearbeiten (Modal)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | In der Admin-Produktuebersicht hat jede Produktkarte eine Schaltflaeche "Angebot", die ein Modal oeffnet | Must-Have |
| REQ-2 | Das Modal zeigt an, ob ein aktives oder inaktives Angebot existiert, oder ob noch keins vorhanden ist | Must-Have |
| REQ-3 | Admin kann Rabatttyp waehlen: "Prozent" oder "Absoluter Betrag (EUR)" | Must-Have |
| REQ-4 | Admin gibt Rabattwert ein (z.B. 20 fuer 20% oder 0.50 fuer 0,50 EUR) | Must-Have |
| REQ-5 | Admin gibt Startdatum und Enddatum ein (beide Pflichtfelder) | Must-Have |
| REQ-6 | Das Modal zeigt eine Live-Vorschau des Angebotspreises (Originalpreis - Rabatt = Angebotspreis) | Must-Have |
| REQ-7 | Admin kann ein Angebot aktivieren (manuell, falls es deaktiviert ist) | Must-Have |
| REQ-8 | Admin kann ein Angebot deaktivieren (manuell, auch wenn Datum noch gueltig) | Must-Have |
| REQ-9 | Admin kann ein Angebot vollstaendig loeschen | Must-Have |
| REQ-10 | Ein neues Angebot ersetzt automatisch das bestehende Angebot des Produkts (max. 1 Angebot pro Produkt im MVP) | Must-Have |

### 3.2 Automatische Aktivierung nach Datum

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-11 | Ein Angebot ist automatisch aktiv, wenn das heutige Datum zwischen Startdatum und Enddatum liegt UND es nicht manuell deaktiviert wurde | Must-Have |
| REQ-12 | Ein Angebot ist automatisch inaktiv, wenn das Enddatum ueberschritten wurde — abgelaufene Angebote werden automatisch aus der DB geloescht | Must-Have |
| REQ-13 | Ein Angebot mit Startdatum in der Zukunft ist "geplant" (noch nicht aktiv) | Must-Have |

### 3.3 Anzeige fuer User (Produktkatalog/Dashboard)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-14 | Wenn ein Angebot aktiv ist, zeigt die Produktkarte: Originalpreis durchgestrichen + Angebotspreis | Must-Have |
| REQ-15 | Der Angebotspreis wird beim One-Touch Kauf automatisch vom Guthaben abgezogen | Must-Have |
| REQ-16 | In der Kaufhistorie wird der tatsaechlich bezahlte Preis (Angebotspreis) gespeichert | Must-Have |

### 3.4 Admin-Produktuebersicht: Badge

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-17 | Produkte mit aktivem Angebot erhalten ein Badge "Angebot aktiv" in der Admin-Produktuebersicht | Must-Have |
| REQ-18 | Produkte ohne aktives Angebot zeigen kein Badge | Must-Have |

---

## 4. Angebots-Datenmodell

```
Tabelle: product_offers
- id (serial, PK)
- productId (FK -> products.id, UNIQUE — max. 1 Angebot pro Produkt)
- discountType ('percent' | 'absolute')
- discountValue (decimal, z.B. 20.00 fuer 20% oder 0.50 fuer 0,50 EUR)
- startsAt (timestamp, Pflichtfeld)
- expiresAt (timestamp, Pflichtfeld)
- isActive (boolean, default true — kann manuell deaktiviert werden)
- createdAt (timestamp, defaultNow)
- updatedAt (timestamp)
```

**Angebotspreis-Berechnung:**
- Prozent: `angebotspreis = produktpreis * (1 - discountValue / 100)`
- Absolut: `angebotspreis = produktpreis - discountValue`
- Angebotspreis wird serverseitig berechnet, nie clientseitig

**Aktiv-Logik (serverseitig):**
```
isCurrentlyActive = isActive === true
  AND startsAt <= NOW()
  AND expiresAt > NOW()
```

---

## 5. Acceptance Criteria

- [ ] AC-1: Admin kann in der Produktuebersicht fuer jedes Produkt eine Schaltfläche "Angebot" sehen und anklicken
- [ ] AC-2: Das Modal zeigt korrekt an, ob ein Angebot vorhanden ist (inkl. Status: aktiv/inaktiv/geplant/abgelaufen)
- [ ] AC-3: Admin kann einen Rabatt als Prozent (0-100%) oder absoluten Betrag (0 bis Produktpreis) eingeben
- [ ] AC-4: Live-Vorschau des Angebotspreises wird korrekt berechnet und angezeigt
- [ ] AC-5: Angebot mit Startdatum heute und Enddatum morgen wird sofort als aktiv erkannt
- [ ] AC-6: Abgelaufenes Angebot (Enddatum gestern) wird nicht mehr angezeigt und wird automatisch geloescht
- [ ] AC-7: Admin kann ein aktives Angebot manuell deaktivieren — Produkt zeigt danach Normalpreis
- [ ] AC-8: Admin kann ein deaktiviertes Angebot wieder aktivieren
- [ ] AC-9: Wenn ein neues Angebot erstellt wird und bereits eines existiert, wird das alte geloescht
- [ ] AC-10: Produkte mit aktivem Angebot zeigen in der Admin-Uebersicht das Badge "Angebot aktiv"
- [ ] AC-11: Im User-Produktkatalog wird bei aktivem Angebot der Originalpreis durchgestrichen und der Angebotspreis angezeigt
- [ ] AC-12: Beim One-Touch Kauf wird der Angebotspreis (nicht der Normalpreis) vom Guthaben abgezogen
- [ ] AC-13: Ein absoluter Rabatt, der den Produktpreis uebersteigt, wird mit Fehlermeldung abgelehnt
- [ ] AC-14: Enddatum ist ein Pflichtfeld — Formular kann ohne Enddatum nicht gespeichert werden
- [ ] AC-15: Ein 100%-Rabatt (Produkt kostenlos) ist erlaubt

---

## 6. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Neues Angebot wird erstellt, aber Produkt hat bereits ein Angebot | Altes Angebot wird automatisch ersetzt (geloescht), neues wird gespeichert |
| EC-2 | Absoluter Rabatt groesser als Produktpreis (z.B. Produkt 1,00 EUR, Rabatt 1,50 EUR) | Fehlermeldung: "Rabatt darf den Produktpreis nicht ueberschreiten. Maximaler Rabatt: 1,00 EUR" |
| EC-3 | Prozent-Rabatt 100% | Erlaubt — Angebotspreis = 0,00 EUR (Produkt kostenlos) |
| EC-4 | Enddatum liegt in der Vergangenheit | Formular-Validierung: "Enddatum muss in der Zukunft liegen" |
| EC-5 | Startdatum nach Enddatum | Formular-Validierung: "Startdatum muss vor dem Enddatum liegen" |
| EC-6 | Angebot wird waehrend eines laufenden Kaufs deaktiviert | Bereits abgeschlossene Kaufe bleiben unveraendert; nur neue Kaufe nach Deaktivierung zahlen Normalpreis |
| EC-7 | Cron-Job/Cleanup: Enddatum ist gestern | Angebot wird automatisch aus DB geloescht (via Cron-Job, analog zu FEAT-13) |
| EC-8 | Admin loescht Produkt mit aktivem Angebot | Angebot wird kaskadierend mitgeloescht (ON DELETE CASCADE) |
| EC-9 | Gleichzeitiger Kauf waehrend Admin Angebot deaktiviert | Serverseitige Preis-Berechnung zum Kaufzeitpunkt ist massgeblich |
| EC-10 | Angebot mit Startdatum in der Zukunft (geplant) | Kein Badge in Admin-Uebersicht, kein Angebotspreis fuer User — bis Startdatum erreicht ist |

---

## 7. Validierungsregeln

| Feld | Regel |
|------|-------|
| discountType | Pflicht, muss 'percent' oder 'absolute' sein |
| discountValue (Prozent) | Pflicht, 0-100 (inklusive), Dezimalzahlen erlaubt |
| discountValue (Absolut) | Pflicht, > 0 und <= Produktpreis |
| startsAt | Pflicht, muss gueltiges Datum sein |
| expiresAt | Pflicht, muss nach startsAt liegen, muss in der Zukunft liegen |

---

## 8. API Endpoints

| Endpoint | Methode | Beschreibung | Auth |
|----------|---------|--------------|------|
| `/api/admin/offers` | GET | Alle Angebote (mit produktId als Query-Param optional) | Admin |
| `/api/admin/offers` | POST | Neues Angebot erstellen (ersetzt bestehendes) | Admin |
| `/api/admin/offers/[id]` | PATCH | Angebot aktivieren/deaktivieren oder bearbeiten | Admin |
| `/api/admin/offers/[id]` | DELETE | Angebot loeschen | Admin |
| `/api/products` | GET | Bereits vorhanden — wird erweitert um aktives Angebot pro Produkt | Public |

**Erweiterung GET /api/products Response:**
```typescript
{
  id: number,
  name: string,
  price: string,          // Normalpreis
  // ... weitere Felder ...
  activeOffer: {           // null wenn kein aktives Angebot
    discountType: 'percent' | 'absolute',
    discountValue: string,
    discountedPrice: string,  // berechneter Angebotspreis
    expiresAt: string
  } | null
}
```

---

## 9. Cron-Job: Abgelaufene Angebote loeschen

Analogie zu FEAT-13 (Cron-Job in `src/server/plugins/cronJobs.ts`):
- Bestehender Cron-Job wird erweitert
- Jede Minute: DELETE FROM product_offers WHERE expiresAt < NOW()
- Kein Sideeffect auf Kaufhistorie (Preise sind bereits in purchases gespeichert)

---

## 10. Future Scope (kein MVP)

Die folgenden Features sind **explizit aus dem MVP-Scope ausgeschlossen**, sollen aber bei der Architektur beruecksichtigt werden:

| Feature | Beschreibung | Architektur-Hinweis |
|---------|--------------|---------------------|
| Mehrere Angebote pro Produkt | Unterschiedliche Zeitraeume fuer dasselbe Produkt | UNIQUE-Constraint auf `productId` entfernen; Logik fuer "welches Angebot ist gerade aktiv?" anpassen |
| Wochentag-basierte Angebote | Produkt nur Do + Fr im Angebot | Neues Feld `activeDays` (int array, z.B. [4,5] fuer Do/Fr) in `product_offers` |
| Angebots-Kombination | Mehrere Rabatte gleichzeitig | Prioritaets-Logik oder Summierung benoetigt |

---

## 11. Technische Anforderungen

- Performance: Angebotspreis-Berechnung serverseitig, nicht clientseitig
- Datenintegritaet: Preis zum Kaufzeitpunkt in `purchases` gespeichert (unveraenderlich)
- Sicherheit: Nur Admin-Session darf Angebote erstellen/bearbeiten/loeschen
- Konsistenz: Angebotspreis-Berechnung an exakt einer Stelle (Server-Utility-Funktion), nicht dupliziert

---

## 12. Abhaengigkeiten von bestehender Architektur

- `src/server/plugins/cronJobs.ts` — wird um Cleanup abgelaufener Angebote erweitert
- `src/server/api/products/index.get.ts` — wird um JOIN auf `product_offers` erweitert
- `src/server/api/purchases/index.post.ts` — Preis-Berechnung muss aktives Angebot pruefen
- `src/pages/admin/` — neue Schaltfläche und Modal in bestehender Produktuebersicht
- `src/components/` — neue Komponenten: `OfferBadge.vue`, `OfferModal.vue`
