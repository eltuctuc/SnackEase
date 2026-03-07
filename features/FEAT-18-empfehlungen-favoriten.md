# FEAT-18: Empfehlungen & Favoriten

## Status: Planned

## Abhaengigkeiten
- Benoetigt: FEAT-15 (App-Navigationsstruktur) - Dashboard-Layout muss existieren
- Benoetigt: FEAT-16 (Warenkorb-System) - "In den Warenkorb"-Button im ProductDetailModal muss existieren
- Optional: FEAT-17 (Angebote-Querslider) - Tab-Umschalter erscheint unterhalb des Angebots-Sliders

---

## 1. Uebersicht

**Beschreibung:** Nutzer koennen Produkte empfehlen (sichtbar fuer alle Nutzer als aggregierte Top-10-Liste) und eigene private Favoriten-Listen verwalten (max. 10 Produkte). Auf dem Dashboard erscheint unterhalb des Angebots-Sliders ein Tab-Umschalter zwischen "Empfohlen" und "Favoriten". Empfehlungen werden im ProductDetailModal ausgeloest, Favoriten koennen direkt auf der Produktkarte getoggelt werden.

**Ziel:** Nutzer sollen schnell auf ihre bevorzugten Produkte zugreifen und von den kollektiven Empfehlungen ihrer Kollegen profitieren.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich auf dem Dashboard zwischen "Empfohlen" und "Favoriten" umschalten, damit ich gezielt die fuer mich relevante Produktliste sehe | User | Must-Have |
| US-2 | Als Mitarbeiter moechte ich beim Oeffnen des Dashboards automatisch die "Empfohlen"-Ansicht sehen, damit ich sofort die beliebtesten Produkte im Ueberblick habe | User | Must-Have |
| US-3 | Als Mitarbeiter moechte ich im ProductDetailModal ein Produkt empfehlen koennen, damit meine Kollegen von meiner Einschaetzung profitieren | User | Must-Have |
| US-4 | Als Mitarbeiter moechte ich meine Empfehlung per erneutem Antippen des Empfehlungs-Buttons zurueckziehen koennen, falls ich meine Meinung aendere | User | Must-Have |
| US-5 | Als Mitarbeiter moechte ich sehen, ob ich ein Produkt bereits empfohlen habe (aktiver/inaktiver Zustand des Buttons), damit ich keinen doppelten Klick mache | User | Must-Have |
| US-6 | Als Mitarbeiter moechte ich die Gesamtanzahl der Empfehlungen fuer ein Produkt sehen, damit ich einschaetzen kann, wie beliebt es ist | User | Must-Have |
| US-7 | Als Mitarbeiter moechte ich in der "Empfohlen"-Ansicht die Top-10 meistempfohlenen Produkte aller Kollegen sehen | User | Must-Have |
| US-8 | Als Mitarbeiter moechte ich direkt auf der Produktkarte ein Herz-Icon antippen, um ein Produkt zu meinen Favoriten hinzuzufuegen oder zu entfernen | User | Must-Have |
| US-9 | Als Mitarbeiter moechte ich in der "Favoriten"-Ansicht meine eigene private Liste mit max. 10 Produkten sehen | User | Must-Have |
| US-10 | Als Mitarbeiter moechte ich beim Versuch, mehr als 10 Favoriten hinzuzufuegen, eine klare Fehlermeldung erhalten, damit ich weiss, dass ich zuerst ein Produkt entfernen muss | User | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Tab-Umschalter auf dem Dashboard

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Unterhalb des Angebots-Sliders erscheint ein Tab-Umschalter mit zwei Tabs: "Empfohlen" und "Favoriten" | Must-Have |
| REQ-2 | Beim Oeffnen des Dashboards ist "Empfohlen" der aktive Standard-Tab | Must-Have |
| REQ-3 | Der aktive Tab ist visuell hervorgehoben (aktive Tab-Markierung) | Must-Have |
| REQ-4 | Ein Klick auf einen Tab wechselt die Produktliste unterhalb des Umschalters | Must-Have |
| REQ-5 | Der zuletzt gewaehlte Tab wird nicht persistiert — nach Reload/Navigation zurueck zum Dashboard ist immer "Empfohlen" aktiv | Must-Have |

### 3.2 Empfehlungen (kollektiv, aggregiert)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-6 | Jeder eingeloggte Nutzer kann ein Produkt genau einmal empfehlen (eine Stimme pro Nutzer pro Produkt) | Must-Have |
| REQ-7 | Der Empfehlungs-Button befindet sich ausschliesslich im ProductDetailModal, nicht auf der Produktkarte | Must-Have |
| REQ-8 | Der Empfehlungs-Button zeigt den aktuellen Zustand an: aktiv (Nutzer hat empfohlen) oder inaktiv (noch nicht empfohlen) | Must-Have |
| REQ-9 | Neben dem Empfehlungs-Button wird die Gesamtanzahl der Empfehlungen fuer das Produkt angezeigt (z.B. "24 Empfehlungen") | Must-Have |
| REQ-10 | Ein erneutes Antippen des aktiven Empfehlungs-Buttons zieht die Empfehlung zurueck (Toggle-Verhalten) | Must-Have |
| REQ-11 | Die "Empfohlen"-Tab-Ansicht zeigt die Top-10 Produkte mit den meisten Empfehlungen aller Nutzer, absteigend sortiert nach Empfehlungsanzahl | Must-Have |
| REQ-12 | In der "Empfohlen"-Ansicht wird neben jeder Produktkarte die Anzahl der Empfehlungen angezeigt | Must-Have |
| REQ-13 | Hat noch kein Produkt Empfehlungen, zeigt die "Empfohlen"-Ansicht einen leeren Zustand mit Hinweistext | Must-Have |

### 3.3 Favoriten (privat, pro Nutzer)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-14 | Jeder eingeloggte Nutzer hat eine eigene private Favoriten-Liste (max. 10 Produkte) | Must-Have |
| REQ-15 | Jede Produktkarte zeigt ein Herz-Icon (Teenyicons), das den Favoriten-Status des eingeloggten Nutzers anzeigt | Must-Have |
| REQ-16 | Ein Klick auf das Herz-Icon toggelt den Favoriten-Status: Produkt wird hinzugefuegt oder entfernt | Must-Have |
| REQ-17 | Wenn der Nutzer versucht, ein 11. Produkt als Favorit hinzuzufuegen, erscheint eine Fehlermeldung: "Maximale Anzahl von 10 Favoriten erreicht. Bitte entferne zuerst ein Produkt aus deinen Favoriten." | Must-Have |
| REQ-18 | Die "Favoriten"-Tab-Ansicht zeigt alle Favoriten-Produkte des eingeloggten Nutzers | Must-Have |
| REQ-19 | Favoriten sind ausschliesslich fuer den eingeloggten Nutzer sichtbar — andere Nutzer sehen die Liste nicht | Must-Have |
| REQ-20 | Hat der Nutzer noch keine Favoriten, zeigt die "Favoriten"-Ansicht einen leeren Zustand mit Hinweistext (z.B. "Noch keine Favoriten. Tippe auf das Herz-Icon auf einer Produktkarte.") | Must-Have |
| REQ-21 | Die Reihenfolge der Favoriten-Liste entspricht dem Zeitpunkt des Hinzufuegens (neuestes zuerst) | Must-Have |

---

## 4. Datenmodell

```
Tabelle: recommendations
- id (serial, PK)
- productId (FK -> products.id, ON DELETE CASCADE)
- userId (FK -> users.id, ON DELETE CASCADE)
- createdAt (timestamp, defaultNow)
- UNIQUE (productId, userId)  -- ein Nutzer kann ein Produkt nur einmal empfehlen

Tabelle: favorites
- id (serial, PK)
- productId (FK -> products.id, ON DELETE CASCADE)
- userId (FK -> users.id, ON DELETE CASCADE)
- createdAt (timestamp, defaultNow)
- UNIQUE (productId, userId)  -- ein Produkt kann pro Nutzer nur einmal favorisiert sein
```

**Empfehlungsanzahl-Abfrage (aggregiert):**
```sql
SELECT productId, COUNT(*) AS recommendationCount
FROM recommendations
GROUP BY productId
ORDER BY recommendationCount DESC
LIMIT 10
```

**Nutzer-spezifischer Status (fuer UI):**
- Hat der eingeloggte Nutzer dieses Produkt empfohlen? → JOIN auf recommendations WHERE userId = currentUserId
- Hat der eingeloggte Nutzer dieses Produkt favorisiert? → JOIN auf favorites WHERE userId = currentUserId

---

## 5. Acceptance Criteria

- [ ] AC-1: Beim Oeffnen des Dashboards ist der Tab "Empfohlen" standardmaessig aktiv
- [ ] AC-2: Ein Klick auf "Favoriten" wechselt die Ansicht zur privaten Favoriten-Liste des Nutzers
- [ ] AC-3: Ein Klick auf "Empfohlen" wechselt die Ansicht zurueck zur Top-10-Empfehlungsliste
- [ ] AC-4: Der Empfehlungs-Button erscheint nur im ProductDetailModal, nicht auf der Produktkarte
- [ ] AC-5: Der Empfehlungs-Button zeigt korrekt an, ob der Nutzer das Produkt bereits empfohlen hat (aktiver vs. inaktiver Zustand)
- [ ] AC-6: Ein Klick auf den inaktiven Empfehlungs-Button erhoehe die Empfehlungsanzahl um 1 und markiert den Button als aktiv
- [ ] AC-7: Ein Klick auf den aktiven Empfehlungs-Button verringere die Empfehlungsanzahl um 1 und markiert den Button als inaktiv
- [ ] AC-8: Die "Empfohlen"-Ansicht zeigt max. 10 Produkte, sortiert nach Empfehlungsanzahl absteigend
- [ ] AC-9: Neben jeder Produktkarte in der "Empfohlen"-Ansicht ist die Empfehlungsanzahl sichtbar
- [ ] AC-10: Das Herz-Icon auf der Produktkarte zeigt korrekt den Favoriten-Status des eingeloggten Nutzers an
- [ ] AC-11: Ein Klick auf das Herz-Icon fuegt das Produkt zu den Favoriten hinzu (Icon wird geaendert: leer -> ausgefuellt)
- [ ] AC-12: Ein erneuter Klick auf das Herz-Icon entfernt das Produkt aus den Favoriten (Icon wird geaendert: ausgefuellt -> leer)
- [ ] AC-13: Bei Versuch, ein 11. Produkt als Favorit hinzuzufuegen, erscheint die Fehlermeldung ohne das Produkt hinzuzufuegen
- [ ] AC-14: Favoriten sind privat — Nutzer A sieht nicht die Favoriten von Nutzer B
- [ ] AC-15: Leerer Zustand "Empfohlen": Wenn keine Empfehlungen existieren, wird ein Hinweistext angezeigt
- [ ] AC-16: Leerer Zustand "Favoriten": Wenn der Nutzer keine Favoriten hat, wird ein Hinweistext angezeigt
- [ ] AC-17: Icons stammen aus der Teenyicons 1.0 Bibliothek (npm: teenyicons)
- [ ] AC-18: Nach einem Seiten-Reload ist der Dashboard-Tab wieder auf "Empfohlen" zurueckgesetzt

---

## 6. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Nutzer versucht, mehr als 10 Favoriten hinzuzufuegen | Fehlermeldung wird angezeigt, Produkt wird nicht hinzugefuegt, Favoriten-Zaehler bleibt bei 10 |
| EC-2 | Nutzer empfiehlt ein Produkt, das er bereits empfohlen hat (doppelter API-Aufruf) | Server-seitiger UNIQUE-Constraint verhindert doppelten Eintrag, API gibt 409 Conflict zurueck |
| EC-3 | Nutzer zieht Empfehlung zurueck, hat aber keine Empfehlung fuer dieses Produkt | API gibt 404 Not Found zurueck, UI zeigt keine Fehlermeldung (Silent Fail) |
| EC-4 | Produkt wird von Admin geloescht, waehrend es in Favoriten/Empfehlungen ist | ON DELETE CASCADE loescht automatisch alle zugehoerigen favorites- und recommendations-Eintraege |
| EC-5 | Kein Produkt hat bisher Empfehlungen | "Empfohlen"-Tab zeigt leeren Zustand mit Hinweistext statt leerer Liste |
| EC-6 | Nutzer hat keine Favoriten gespeichert | "Favoriten"-Tab zeigt leeren Zustand mit Hinweistext und Icon |
| EC-7 | Gleichzeitige Empfehlung desselben Produkts durch denselben Nutzer (Race Condition) | UNIQUE-Constraint auf (productId, userId) verhindert Duplikate auf DB-Ebene |
| EC-8 | Nutzer ist nicht eingeloggt und versucht zu empfehlen/favorisieren | API gibt 401 Unauthorized zurueck, UI leitet zum Login weiter |
| EC-9 | Top-10-Liste hat Gleichstand bei Empfehlungsanzahl (z.B. Platz 10 und 11 haben gleich viele) | Tiebreaker: Produkt mit juengster erster Empfehlung wird bevorzugt (ORDER BY recommendationCount DESC, MIN(createdAt) ASC) |
| EC-10 | Produkt aus Favoriten-Liste wird inzwischen aus dem Katalog entfernt | Karte ist nicht mehr abrufbar; favorites-Eintrag wird via CASCADE geloescht; Liste aktualisiert sich beim naechsten Laden |
| EC-11 | Nutzer entfernt Favorit-Produkt in der "Favoriten"-Ansicht | Karte verschwindet sofort aus der Liste (optimistisches UI-Update) |

---

## 7. Validierungsregeln

| Aktion | Regel |
|--------|-------|
| Empfehlung hinzufuegen | Nutzer muss eingeloggt sein; max. 1 Empfehlung pro Nutzer pro Produkt |
| Empfehlung entfernen | Nutzer muss eingeloggt sein; Empfehlung muss existieren |
| Favorit hinzufuegen | Nutzer muss eingeloggt sein; max. 10 Favoriten pro Nutzer |
| Favorit entfernen | Nutzer muss eingeloggt sein; Favorit muss existieren |

---

## 8. API Endpoints

| Endpoint | Methode | Beschreibung | Auth |
|----------|---------|--------------|------|
| `/api/recommendations` | GET | Top-10 meistempfohlene Produkte (inkl. Anzahl + ob eingeloggter Nutzer empfohlen hat) | User |
| `/api/recommendations` | POST | Empfehlung fuer ein Produkt hinzufuegen (`{ productId }`) | User |
| `/api/recommendations/[productId]` | DELETE | Eigene Empfehlung fuer ein Produkt zurueckziehen | User |
| `/api/favorites` | GET | Eigene Favoriten-Liste des eingeloggten Nutzers | User |
| `/api/favorites` | POST | Produkt zu Favoriten hinzufuegen (`{ productId }`) | User |
| `/api/favorites/[productId]` | DELETE | Produkt aus eigenen Favoriten entfernen | User |

**GET /api/recommendations Response (Beispiel):**
```typescript
{
  products: [
    {
      id: number,
      name: string,
      price: string,
      imageUrl: string,
      recommendationCount: number,    // Gesamtanzahl aller Empfehlungen
      isRecommendedByMe: boolean       // Hat der eingeloggte Nutzer empfohlen?
    }
  ]
}
```

**GET /api/favorites Response (Beispiel):**
```typescript
{
  favorites: [
    {
      id: number,
      name: string,
      price: string,
      imageUrl: string,
      addedAt: string                  // ISO-Timestamp, wann favorisiert
    }
  ]
}
```

---

## 9. UI-Komponenten

| Komponente | Beschreibung |
|------------|--------------|
| `DashboardTabs.vue` | Tab-Umschalter "Empfohlen" / "Favoriten" unterhalb des Angebots-Sliders |
| `RecommendedList.vue` | Produktliste fuer den "Empfohlen"-Tab (Top-10, mit Empfehlungsanzahl) |
| `FavoritesList.vue` | Produktliste fuer den "Favoriten"-Tab (private Liste des Nutzers) |
| `FavoriteIcon.vue` | Herz-Icon (Teenyicons) auf Produktkarte; toggelt Favoriten-Status |
| `RecommendButton.vue` | Empfehlungs-Button im ProductDetailModal mit Anzahl-Anzeige |
| `EmptyState.vue` | Wiederverwendbar fuer leere "Empfohlen"- und "Favoriten"-Ansichten |

**Icon-Referenz (Teenyicons 1.0):**
- Favoriten-Icon (leer): `teenyicons/outline/heart.svg`
- Favoriten-Icon (aktiv): `teenyicons/solid/heart.svg`
- Empfehlungs-Icon (leer): `teenyicons/outline/thumb-up.svg`
- Empfehlungs-Icon (aktiv): `teenyicons/solid/thumb-up.svg`

---

## 10. Technische Anforderungen

- Performance: Top-10-Empfehlungen werden serverseitig aggregiert (COUNT + GROUP BY), kein clientseitiges Zaehlen
- Sicherheit: Favoriten-API gibt ausschliesslich Daten des eingeloggten Nutzers zurueck (userId aus Session, nicht aus Request-Body)
- Optimistisches UI: Favoriten-Toggle und Empfehlungs-Toggle werden sofort im UI gespiegelt, bei API-Fehler wird zurueckgesetzt
- Datenschutz: Favoriten sind strikt privat; kein Admin-Endpoint, der Favoriten einzelner Nutzer auflistet
- Icons: Ausschliesslich Teenyicons 1.0 (npm-Paket: `teenyicons`) verwenden

---

## 11. Future Scope (kein MVP)

| Feature | Beschreibung |
|---------|--------------|
| Sortierung der Favoriten | Nutzer kann Reihenfolge der Favoriten per Drag & Drop aendern |
| Empfehlungs-Benachrichtigung | Nutzer wird benachrichtigt, wenn sein Lieblingsprodukt in die Top-10 aufsteigt |
| Empfehlungs-Kommentare | Nutzer kann optional einen Kommentar zur Empfehlung hinterlassen |
| Mehr als 10 Favoriten | Limit erhoehen oder aufheben (konfigurierbar durch Admin) |
| Empfehlung im Warenkorb-Flow | "Dieses Produkt empfehlen" als optionaler Schritt nach dem Kauf |
