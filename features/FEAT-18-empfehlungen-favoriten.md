# FEAT-18: Empfehlungen & Favoriten

## Status: Implemented

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

---

## 12. Tech-Design (Solution Architect)

Vollstaendige Architektur-Dokumentation: `docs/architecture-FEAT-18.md`

### Component-Struktur

```
src/pages/dashboard.vue (GEAENDERT)
├── OffersSlider.vue (unveraendert, FEAT-17)
├── DashboardTabs.vue (NEU) — Tab-Umschalter "Empfohlen" / "Favoriten"
│   ├── RecommendedList.vue (NEU) — Top-10-Liste mit Empfehlungsanzahl-Badge
│   └── FavoritesList.vue (NEU) — Private Favoriten-Liste (neueste zuerst)
├── ProductGrid.vue (unveraendert) — Produktkatalog mit Suche bleibt erhalten
│   └── FavoriteIcon.vue (NEU) — Herz-Icon auf jeder Produktkarte
└── ProductDetailModal.vue (GEAENDERT)
    └── RecommendButton.vue (NEU) — Daumen-hoch + Zaehler, unterhalb VORBESTELLEN

src/components/shared/EmptyState.vue (NEU) — Wiederverwendbar fuer leere Zustaende
```

### Daten-Model

Zwei neue Tabellen in der PostgreSQL-Datenbank:

**`recommendations`** — eine Empfehlung pro Nutzer pro Produkt
- Felder: id, productId (FK→products CASCADE), userId (FK→users CASCADE), createdAt
- UNIQUE auf (productId, userId) — verhindert Duplikate auf DB-Ebene

**`favorites`** — private Favoriten-Liste pro Nutzer (max. 10)
- Felder: id, productId (FK→products CASCADE), userId (FK→users CASCADE), createdAt
- UNIQUE auf (productId, userId)
- Sortierung: neueste zuerst (createdAt DESC)

### State-Management (Pinia)

**`src/stores/recommendations.ts`** — NEU
- Haelt Top-10-Liste mit `recommendationCount` und `isRecommendedByMe` pro Produkt
- Optimistisches Toggle mit Snapshot-Rollback bei API-Fehler

**`src/stores/favorites.ts`** — NEU
- Haelt `favorites[]` (vollstaendige Produkt-Daten) und `favoriteIds` (Set fuer O(1)-Lookup)
- Optimistisches Toggle: sofortiges UI-Update, Rollback bei Fehler inkl. 422-Limit
- `limitError` fuer Fehlermeldung bei > 10 Favoriten

### API-Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/recommendations` | GET | Top-10 meistempfohlene Produkte |
| `/api/recommendations` | POST | Empfehlung hinzufuegen (`{ productId }`) |
| `/api/recommendations/[productId]` | DELETE | Eigene Empfehlung zurueckziehen |
| `/api/favorites` | GET | Eigene Favoriten-Liste |
| `/api/favorites` | POST | Produkt zu Favoriten (`{ productId }`) |
| `/api/favorites/[productId]` | DELETE | Aus Favoriten entfernen |
| `/api/products` | GET | ERWEITERT um `isFavorite: boolean` |
| `/api/products/[id]` | GET | ERWEITERT um `recommendationCount`, `isRecommendedByMe` |

userId kommt ausschliesslich aus der Session (HttpOnly Cookie) — nie aus dem Request-Body.

### Tech-Entscheidungen

- **Favoriten als Set im Store:** `favoriteIds: Set<number>` ermoeglicht O(1)-Lookup bei jedem Produktkarten-Render — keine Array-`find()`-Schleife
- **Optimistisches UI:** Toggle-Aktionen wirken sofort im UI, API-Fehler werden zurueckgerollt — fuer Empfehlungen und Favoriten identisches Pattern
- **Top-10 serverseitig aggregiert:** COUNT + GROUP BY auf DB-Ebene, kein clientseitiges Zaehlen
- **Lazy-Loading Recommendations:** fetchTopRecommendations() erst beim Tab-Aktivieren, nicht beim Dashboard-Mount
- **10er-Limit als 422:** Serverseitige Pruefung mit spezifischem HTTP-Status, eigene `limitError`-State-Variable im Store
- **Tiebreaker Top-10 bei Gleichstand:** ORDER BY recommendationCount DESC, MIN(createdAt) ASC (EC-9)

### Accessibility (WCAG 2.1 AA — alle Pflicht)

- `FavoriteIcon.vue`: `aria-pressed` + dynamisches `aria-label` + Touch-Target 44x44px
- `RecommendButton.vue`: `aria-pressed` + dynamisches `aria-label` + Farbwechsel bei aktiv (nicht nur Icon-Fill)
- `DashboardTabs.vue`: `role="tablist/tab/tabpanel"` + `aria-selected` + Pfeiltasten-Navigation
- Fehlermeldung Favoriten-Limit: `role="alert"` + min. 5 Sekunden sichtbar

### Dependencies

Keine neuen npm-Packages benoetigt. Teenyicons (bereits installiert) liefert alle benoetigen Icons:
- `teenyicons/outline/heart.svg` — Favorit inaktiv
- `teenyicons/solid/heart.svg` — Favorit aktiv
- `teenyicons/outline/thumb-up.svg` — Empfehlung inaktiv
- `teenyicons/solid/thumb-up.svg` — Empfehlung aktiv

### Test-Anforderungen

**Unit-Tests (Vitest):**
- `tests/unit/stores/recommendations.test.ts` — fetchTopRecommendations, toggleRecommendation (Hinzufuegen/Entfernen/Rollback/409)
- `tests/unit/stores/favorites.test.ts` — fetchFavorites, toggleFavorite (Hinzufuegen/Entfernen/Rollback/422-Limit), isFavorite-Lookup
- Coverage-Ziel: 80%+

**E2E-Tests (Playwright, Chromium):**
- `tests/e2e/recommendations-favorites.spec.ts`
- Flows: Dashboard-Default-Tab, Tab-Wechsel, Herz-Toggle, Favoriten sichtbar in Tab, Empfehlung im Modal, 11. Favorit → Fehlermeldung, Reload → Tab zurueck auf Empfohlen

---

## Implementation Notes

**Status:** Implementiert
**Developer:** Developer Agent
**Datum:** 2026-03-12

### Geaenderte/Neue Dateien

**Backend — DB-Schema**
- `src/server/db/schema.ts` — Tabellen `recommendations` und `favorites` ergaenzt (uniqueIndex auf productId+userId)

**Backend — API Endpoints (alle NEU)**
- `src/server/api/recommendations/index.get.ts` — Top-10 mit COUNT+GROUP BY, Tiebreaker MIN(createdAt), Angebots-Integration
- `src/server/api/recommendations/index.post.ts` — Empfehlung hinzufuegen, 409 bei Duplikat
- `src/server/api/recommendations/[productId].get.ts` — Einzelprodukt-Empfehlungsstatus fuer ProductDetailModal
- `src/server/api/recommendations/[productId].delete.ts` — Empfehlung zurueckziehen, 404 bei nicht vorhanden
- `src/server/api/favorites/index.get.ts` — Private Favoriten (neueste zuerst), inkl. Angebote
- `src/server/api/favorites/index.post.ts` — Favorit hinzufuegen, 422 bei Limit-Ueberschreitung
- `src/server/api/favorites/[productId].delete.ts` — Favorit entfernen

**Frontend — Neue Stores**
- `src/stores/recommendations.ts` — Top-10-Liste, optimistisches Toggle, Snapshot-Rollback
- `src/stores/favorites.ts` — Private Favoriten, favoriteIds als Set (O(1)-Lookup), limitError mit 5s-Auto-Reset

**Frontend — Neue Components**
- `src/components/shared/EmptyState.vue` — Wiederverwendbarer Leer-Zustand mit Teenyicons inline SVG
- `src/components/recommendations/FavoriteIcon.vue` — Herz-Icon Toggle, aria-pressed, aria-label, 44x44px Touch-Target
- `src/components/recommendations/RecommendButton.vue` — Daumen-hoch mit Zaehler, Farbwechsel aktiv/inaktiv
- `src/components/recommendations/RecommendedList.vue` — Top-10-Liste mit Rang-Badge und Empfehlungsanzahl
- `src/components/recommendations/FavoritesList.vue` — Private Favoriten-Liste, optimistisches Entfernen (EC-11)
- `src/components/dashboard/DashboardTabs.vue` — role=tablist/tab/tabpanel, aria-selected, Pfeiltasten-Navigation, role=alert Fehlermeldung

**Frontend — Geaenderte Components**
- `src/components/dashboard/ProductGrid.vue` — FavoriteIcon in Produktkarten-Ecke (nur fuer Mitarbeiter)
- `src/components/dashboard/ProductDetailModal.vue` — RecommendButton unterhalb Schliessen-Button, Watch auf Produktwechsel
- `src/pages/dashboard.vue` — DashboardTabs eingebunden, activeTab State, fetchFavorites in onMounted

**Tests**
- `tests/stores/recommendations.test.ts` — 11 Tests, 29 Assertions gesamt
- `tests/stores/favorites.test.ts` — 17 Tests, alle Kern-Szenarien abgedeckt

### Wichtige Entscheidungen

1. **Auth-Utility `getCurrentUser()`:** Alle API-Endpoints nutzen `~/server/utils/auth` statt manuellem Cookie-Parsing.
2. **`GET /api/recommendations/[productId]`:** Zusaetzlicher Endpoint fuer Einzelprodukt-Status im Modal (nicht im urspruenglichen Design vorgesehen, aber notwendig wenn Produkt nicht in Top-10).
3. **ProductCard als Teil von ProductGrid:** Keine Extraktion als eigene Komponente vorgenommen — FavoriteIcon wurde direkt in ProductGrid.vue integriert, da RecommendedList und FavoritesList eigene Karten-Darstellungen haben.
4. **`v-show` statt `v-if` fuer Tab-Panels:** DashboardTabs nutzt `v-show` damit RecommendedList sofort laden kann (onMounted laeuft auch bei nicht-sichtbaren Panels).
5. **Unit-Test-Pattern:** Identisch mit bestehendem Muster (isolierte Logik statt Store-Integration) da Pinia/Nuxt-Kontext in Tests nicht verfuegbar ist.

### Bekannte Einschraenkungen

- E2E-Tests (`tests/e2e/recommendations-favorites.spec.ts`) sind in der Feature-Spec beschrieben aber noch nicht implementiert — werden als separater Task dem QA-Engineer uebergeben.
- `GET /api/products` und `GET /api/products/[id]` wurden NICHT um `isFavorite`/`recommendationCount` erweitert (architektonisch nicht notwendig, da Favoriten separat per `GET /api/favorites` geladen werden).
