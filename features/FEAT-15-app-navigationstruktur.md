ig# FEAT-15: App-Navigationstruktur

## Status: Planned

## Abhaengigkeiten
- Benoetigt: FEAT-0 (SSR-Auth) - fuer serverseitiges Session-Handling und initiale Weiterleitung
- Benoetigt: FEAT-1 (Admin Authentication) - fuer Admin-Nav-Anzeige
- Benoetigt: FEAT-2 (Demo User Authentication) - fuer Mitarbeiter-Nav-Anzeige
- Voraussetzung fuer: FEAT-16 (Warenkorb), FEAT-17, FEAT-18, FEAT-19 (Suche), FEAT-20 (Profil), FEAT-21 (Admin Settings), FEAT-22, FEAT-23

## Wireframes

| Screen | Datei |
|--------|-------|
| Dashboard / Snacks-Tab | `resources/high-fidelity/produkte.png` |
| Suche | `resources/high-fidelity/suche.png` |
| Produktdetail (/product/[id]) | `resources/high-fidelity/produktdetails.png` |
| Vorbestellung / Beleg | `resources/high-fidelity/proof of purchase.png` |
| Bestenliste | `resources/high-fidelity/leaderboard.png` |
| User Details (/leaderboard/[userId]) | `resources/high-fidelity/anderes-profil.png` |
| Profil | `resources/high-fidelity/profil.png` |
| Splashscreen | `resources/high-fidelity/splashscreen.png` |

> Wireframes zeigen Struktur und Informationsarchitektur. Die visuelle Umsetzung richtet sich nach `resources/moodboard.png`, dem Tailwind-Theme und dem UX Expert Review. Fehlt ein Wireframe fuer einen Screen (z.B. Warenkorb /cart, Admin-Seiten), muss vor der Umsetzung die Informationsarchitektur, das Navigationskonzept und die Darstellung mit dem User geklaert werden.

---

## 1. Uebersicht

**Beschreibung:** Einfuehrung einer konsistenten, appweiten Navigationsstruktur fuer beide Nutzergruppen (Mitarbeiter und Admin). Mitarbeiter erhalten eine Bottom-Tab-Bar mit 5 Tabs (auf Desktop: Sidebar), Admins eine Bottom-Tab-Bar mit 5 Tabs (auf Desktop: Sidebar). Beide Apps erhalten ausserdem einen fixierten Header. Die bestehende AdminNav.vue (horizontale Top-Navigation) wird vollstaendig ersetzt. Alle bestehenden Zurueck-Buttons und Zurueck-Links werden entfernt. Der Warenkorb (/cart) ist eine eigene Seite und wird ueber das Header-Icon erreicht. Die Bestenliste erhaelt eine Detail-Unterseite (/leaderboard/[userId]) als Platzhalter fuer kuenftige Nutzer-Details.

**Ziel:** Eine einheitliche, intuitive Navigation schaffen, die als Fundament fuer alle kuenftigen Features dient und die bestehende, inkonsistente Navigation vereinheitlicht.

---

## 2. User Stories

| ID | Story | Rolle | Prioritaet |
|----|-------|-------|------------|
| US-1 | Als Mitarbeiter moechte ich jederzeit per Tab zur Hauptseite, Suche, Bestellungen, Bestenliste oder meinem Profil navigieren koennen | Mitarbeiter | Must-Have |
| US-2 | Als Admin moechte ich jederzeit per Tab zum Dashboard, Benutzer, Produkte, Kategorien oder Einstellungen navigieren koennen | Admin | Must-Have |
| US-3 | Als Mitarbeiter moechte ich auf einen Blick sehen, wie viele Artikel sich in meinem Warenkorb befinden (Badge am Warenkorb-Icon im Header) | Mitarbeiter | Must-Have |
| US-4 | Als Admin moechte ich Benachrichtigungen schnell erreichen koennen (Glocken-Icon im Header) | Admin | Must-Have |
| US-5 | Als Nutzer (Mitarbeiter oder Admin) moechte ich sofort erkennen, auf welcher Seite ich mich befinde (aktiver Tab ist hervorgehoben) | Beide | Must-Have |
| US-6 | Als Nutzer am Desktop moechte ich die Navigation als Sidebar links sehen, damit die Bedienung am grossen Bildschirm ergonomischer ist | Beide | Must-Have |
| US-7 | Als Mitarbeiter moechte ich im Header immer den App-Namen "SnackEase" sehen, um mich orientieren zu koennen | Mitarbeiter | Must-Have |
| US-8 | Als Admin moechte ich im Header immer den Namen der aktuellen Seite sehen, damit ich weiss wo ich bin | Admin | Must-Have |

---

## 3. Funktionale Anforderungen

### 3.1 Mitarbeiter-App: Bottom-Tab-Bar (Mobile)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-1 | Die Bottom-Tab-Bar ist auf allen Mitarbeiter-Seiten sichtbar und fixiert am unteren Bildschirmrand | Must-Have |
| REQ-2 | Die Tab-Bar enthaelt genau 5 Tabs in dieser Reihenfolge: Dashboard (/dashboard), Suche (/search), Vorbestellung (/orders), Bestenliste (/leaderboard), Profil (/profile) | Must-Have |
| REQ-3 | Jeder Tab besteht aus einem Icon und einem Label (Text unterhalb des Icons) | Must-Have |
| REQ-4 | Der aktive Tab wird visuell hervorgehoben — genaue Darstellung obliegt dem UX Expert | Must-Have |
| REQ-5 | Ein Tap auf einen Tab navigiert direkt zur entsprechenden Route | Must-Have |
| REQ-6 | Die Tab-Bar ist nur fuer eingeloggte Mitarbeiter sichtbar (nicht auf /login oder /) | Must-Have |

### 3.2 Admin-App: Bottom-Tab-Bar (Mobile)

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-7 | Die Bottom-Tab-Bar ist auf allen Admin-Seiten sichtbar und fixiert am unteren Bildschirmrand | Must-Have |
| REQ-8 | Die Tab-Bar enthaelt genau 5 Tabs in dieser Reihenfolge: Dashboard (/admin), Benutzer (/admin/users), Produkte (/admin/products), Kategorien (/admin/categories), Einstellungen (/admin/settings) | Must-Have |
| REQ-9 | Jeder Tab besteht aus einem Icon und einem Label | Must-Have |
| REQ-10 | Der aktive Tab wird visuell hervorgehoben — genaue Darstellung obliegt dem UX Expert | Must-Have |
| REQ-11 | Ein Tap auf einen Tab navigiert direkt zur entsprechenden Route | Must-Have |
| REQ-12 | Die Tab-Bar ist nur fuer eingeloggte Admins sichtbar (nicht auf /login oder /) | Must-Have |

### 3.3 Desktop-Verhalten: Sidebar

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-13 | Ab einem definierten Breakpoint (Entscheidung liegt beim UX Expert / Solution Architect) wird die Bottom-Tab-Bar durch eine linke Sidebar ersetzt | Must-Have |
| REQ-14 | Die Sidebar enthaelt dieselben Tabs (Icon + Label) wie die Bottom-Tab-Bar | Must-Have |
| REQ-15 | Der aktive Tab in der Sidebar wird analog zur Bottom-Tab-Bar hervorgehoben | Must-Have |
| REQ-16 | Der Haupt-Content-Bereich nimmt auf Desktop den verbleibenden Platz rechts neben der Sidebar ein | Must-Have |

### 3.4 Mitarbeiter-Header

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-17 | Alle Mitarbeiter-Seiten haben einen fixierten Header am oberen Bildschirmrand | Must-Have |
| REQ-18 | Der Header zeigt links den App-Namen "SnackEase" | Must-Have |
| REQ-19 | Der Header zeigt rechts ein Warenkorb-Icon | Must-Have |
| REQ-20 | Das Warenkorb-Icon zeigt ein Badge mit der Anzahl der Artikel im Warenkorb, wenn der Warenkorb nicht leer ist (0 = kein Badge) | Must-Have |
| REQ-21 | Ein Tap auf das Warenkorb-Icon navigiert zur /cart-Seite (vollstaendige Warenkorb-Logik wird in FEAT-16 definiert) | Must-Have |

### 3.5 Admin-Header

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-22 | Alle Admin-Seiten haben einen fixierten Header am oberen Bildschirmrand | Must-Have |
| REQ-23 | Der Header zeigt links den Namen der aktuell aktiven Seite (z.B. "Dashboard", "Benutzer", "Produkte") | Must-Have |
| REQ-24 | Der Header zeigt rechts ein Glocken-Icon fuer Benachrichtigungen | Must-Have |
| REQ-25 | Das Glocken-Icon zeigt ein Badge mit der Anzahl ungelesener Benachrichtigungen, wenn welche vorhanden sind (analog zu bestehender FEAT-13-Logik) | Must-Have |
| REQ-26 | Ein Tap auf das Glocken-Icon oeffnet das bestehende Benachrichtigungs-Dropdown (NotificationDropdown.vue) | Must-Have |
| REQ-27 | Der Seitentitel im Header entspricht dem Tab-Label des aktiven Tabs (z.B. aktiver Tab "Benutzer" → Header zeigt "Benutzer") | Must-Have |

### 3.6 Ersatz bestehender Navigation und Aufraeumaktion

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-28 | Die bestehende AdminNav.vue (horizontale Top-Navigation) wird vollstaendig entfernt und durch den neuen Admin-Header + Admin-Tab-Bar ersetzt | Must-Have |
| REQ-29 | Alle bestehenden Zurueck-Buttons und Zurueck-Links auf den **Tab-Hauptseiten** (Dashboard, Suche, Vorbestellung, Bestenliste, Profil, Admin-Tab-Seiten) werden entfernt | Must-Have |
| REQ-30 | Die Navigation zwischen Tab-Hauptseiten erfolgt ausschliesslich ueber die Tab-Bar bzw. Sidebar | Must-Have |
| REQ-37a | Sub-Pages (z.B. /product/[id], /leaderboard/[userId]) zeigen einen Zurueck-Pfeil (←) im Header, da sie keine Tab-Seiten sind | Must-Have |
| REQ-37b | Die Tab-Bar bleibt auch auf Sub-Pages sichtbar — der aktive Tab reflektiert die uebergeordnete Tab-Route (z.B. /product/[id] → Tab "Snacks" bleibt aktiv) | Must-Have |

### 3.7 Platzhalter-Seiten fuer neue Routen

| ID | Anforderung | Prioritaet |
|----|-------------|------------|
| REQ-31 | Die Seite /search wird als leere Platzhalter-Seite angelegt (Inhalt folgt in FEAT-19) | Must-Have |
| REQ-32 | Die Seite /profile wird als leere Platzhalter-Seite angelegt (Inhalt folgt in FEAT-20) | Must-Have |
| REQ-33 | Die Seite /admin/settings wird als leere Platzhalter-Seite angelegt (Inhalt folgt in FEAT-21) | Must-Have |
| REQ-34 | Platzhalter-Seiten zeigen einen kurzen Hinweistext, dass der Inhalt noch folgt | Must-Have |
| REQ-35 | Die Seite /cart wird als leere Platzhalter-Seite angelegt (vollstaendige Warenkorb-Logik folgt in FEAT-16); der Header zeigt "Warenkorb" als Titel | Must-Have |
| REQ-36 | Die Seite /leaderboard/[userId] wird als leere Platzhalter-Seite angelegt (User-Details-Inhalt folgt in einem kuenftigen Feature); erreichbar durch Tap auf einen Nutzer in der Bestenliste | Must-Have |
| REQ-38 | Die Seite /product/[id] (Produktdetail) wird als neue Sub-Page angelegt; erreichbar durch Tap auf ein Produkt vom Dashboard, der Suche und der Vorbestellungsseite | Must-Have |
| REQ-39 | /product/[id] zeigt die Tab-Bar am unteren Rand (aktiver Tab = "Snacks", da Unterseite des Dashboards); der Header zeigt einen Zurueck-Pfeil (←) links und das Warenkorb-Icon mit Badge rechts | Must-Have |
| REQ-40 | Inhalt von /product/[id]: Swipeable Bildgalerie (Bild des Produkts), Kategorie + Produktname, Mengenauswahl (−/Zahl/+), "Vorbestellen"-Button, Produktbeschreibung, Nährwert-Infos (Kalorien, Fett, Zucker) — vollstaendige Logik wird in FEAT-16 definiert | Must-Have |

---

## 4. Tab-Definitionen

### 4.1 Mitarbeiter-Tabs

| Position | Label | Route | Teenyicons-Icon | Anmerkung |
|----------|-------|-------|-----------------|-----------|
| 1 | Snacks | /dashboard | `home-outline` / `home-solid` (aktiv) | Bestehende Seite; Tab-Label lautet "Snacks" |
| 2 | Suche | /search | `search-outline` / `search-solid` (aktiv) | Neue Platzhalter-Seite (Inhalt: FEAT-19) |
| 3 | Vorbestellung | /orders | `bag-outline` / `bag-solid` (aktiv) | Bestehende Seite, wird umgebaut |
| 4 | Bestenliste | /leaderboard | `trophy-outline` / `trophy-solid` (aktiv) | Bestehende Seite |
| 5 | Profil | /profile | `user-outline` / `user-solid` (aktiv) | Neue Platzhalter-Seite (Inhalt: FEAT-20) |

### 4.2 Admin-Tabs

| Position | Label | Route | Teenyicons-Icon | Anmerkung |
|----------|-------|-------|-----------------|-----------|
| 1 | Dashboard | /admin | `bar-chart-outline` / `bar-chart-solid` (aktiv) | Bestehende Seite |
| 2 | Benutzer | /admin/users | `users-outline` / `users-solid` (aktiv) | Bestehende Seite |
| 3 | Produkte | /admin/products | `box-outline` / `box-solid` (aktiv) | Bestehende Seite; erhaelt Bestandsverwaltungs-Funktionen |
| 4 | Kategorien | /admin/categories | `tag-outline` / `tag-solid` (aktiv) | Bestehende Seite |
| 5 | Einstellungen | /admin/settings | `cog-outline` / `cog-solid` (aktiv) | Neue Platzhalter-Seite (Inhalt: FEAT-21) |

*Hinweis: Solid-Variante wird fuer den aktiven Tab verwendet, Outline-Variante fuer inaktive Tabs. Finale Auswahl obliegt dem UX Expert — alle Icons aus Teenyicons 1.0 (npm: teenyicons).*

---

## 5. Acceptance Criteria

- [ ] AC-1: Auf allen Mitarbeiter-Seiten ist die Bottom-Tab-Bar mit 5 Tabs am unteren Rand sichtbar
- [ ] AC-2: Auf allen Admin-Seiten ist die Bottom-Tab-Bar mit 5 Tabs am unteren Rand sichtbar
- [ ] AC-3: Der Tab der aktuell aktiven Route ist visuell hervorgehoben
- [ ] AC-4: Ein Tap auf einen Tab navigiert zur zugehoerigen Route ohne Seitenreload
- [ ] AC-5: Die Tab-Bar ist auf /login und / (Startseite) nicht sichtbar
- [ ] AC-6: Auf Desktop-Viewports wird die Bottom-Tab-Bar durch eine linke Sidebar ersetzt
- [ ] AC-7: Die Sidebar enthaelt dieselben Tabs wie die Mobile-Tab-Bar
- [ ] AC-8: Der Mitarbeiter-Header zeigt "SnackEase" links und ein Warenkorb-Icon rechts
- [ ] AC-9: Das Warenkorb-Badge zeigt die korrekte Anzahl an Artikeln (0 = kein Badge)
- [ ] AC-10: Der Admin-Header zeigt den Seitentitel der aktuellen Seite links
- [ ] AC-11: Der Seitentitel im Admin-Header aendert sich beim Tab-Wechsel korrekt
- [ ] AC-12: Das Glocken-Icon im Admin-Header zeigt ungelesene Benachrichtigungen als Badge
- [ ] AC-13: AdminNav.vue ist vollstaendig entfernt — keine alte Navigation mehr sichtbar
- [ ] AC-14: Kein Zurueck-Button und kein Zurueck-Link ist mehr auf Tab-Hauptseiten vorhanden; Sub-Pages (/product/[id], /leaderboard/[userId]) haben einen Zurueck-Pfeil im Header
- [ ] AC-15: Die Platzhalter-Seiten /search, /profile, /cart, /product/[id], /admin/settings und /leaderboard/[userId] existieren und sind erreichbar
- [ ] AC-16: /search, /profile, /cart, /product/[id] und /leaderboard/[userId] sind durch Auth-Guard geschuetzt (nur fuer eingeloggte Mitarbeiter)
- [ ] AC-17: /admin/settings ist durch Auth-Guard geschuetzt (nur fuer eingeloggte Admins)
- [ ] AC-18: Neue und bestehende Routen sind korrekt im Auth-Middleware eingetragen
- [ ] AC-19: Ein Tap auf einen Bestenlisten-Eintrag navigiert zu /leaderboard/[userId]

---

## 6. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|----------------------|
| EC-1 | Nutzer tippt direkt eine URL einer Platzhalter-Seite ein (z.B. /search ohne eingeloggt zu sein) | Weiterleitung zur Login-Seite (bestehender Auth-Guard greift) |
| EC-2 | Nutzer ist als Admin eingeloggt und navigiert manuell zu /dashboard | Bestehender Auth-Guard leitet zu /admin weiter (unveraendertes Verhalten) |
| EC-3 | Nutzer ist als Mitarbeiter eingeloggt und navigiert manuell zu /admin | Bestehender Auth-Guard leitet zu /dashboard weiter (unveraendertes Verhalten) |
| EC-4 | Warenkorb-Badge: Artikel werden zum Warenkorb hinzugefuegt | Badge-Zahl aktualisiert sich in Echtzeit (reaktiv ueber Pinia Store) |
| EC-5 | Warenkorb-Badge: Warenkorb wird geleert | Badge verschwindet (kein "0"-Badge sichtbar) |
| EC-6 | Admin ist auf /admin/notifications (nicht in Tab-Bar aufgelistet) | Kein Tab ist als aktiv markiert ODER der naechstliegende Tab (Dashboard) bleibt aktiv — Entscheidung liegt beim UX Expert |
| EC-7 | Viewport-Groesse wechselt waehrend der Nutzung (z.B. Tablet gedreht) | Navigation wechselt reaktiv zwischen Bottom-Tab-Bar und Sidebar |
| EC-8 | Sehr langes Tab-Label auf kleinem Screen | Label wird abgeschnitten (truncate) oder der UX Expert entscheidet ueber eine Kurzform |
| EC-9 | Glocken-Icon: Alle Benachrichtigungen werden als gelesen markiert | Badge verschwindet sofort (reaktiv) |
| EC-10 | Navigation waehrend eines laufenden Kaufvorgangs (One-Touch) | Tab-Wechsel ist immer moeglich — kein Blocking der Navigation |

---

## 7. Betroffene Dateien (Bestandsanalyse)

### Zu entfernende / ersetzte Komponenten
| Datei | Aktion |
|-------|--------|
| src/components/admin/AdminNav.vue | Vollstaendig entfernen |
| src/pages/admin/inventory.vue | Vollstaendig entfernen (Bestandsfunktionen werden in /admin/products integriert) |

### Zu aendernde Seiten (Zurueck-Buttons entfernen)
| Datei | Aktion |
|-------|--------|
| src/pages/admin/index.vue | Zurueck-Button entfernen |
| src/pages/admin/users.vue | Zurueck-Button entfernen |
| src/pages/admin/products.vue | Zurueck-Button entfernen; Bestandsanzeige und Auffuellfunktion pro Produkt integrieren |
| src/pages/admin/categories.vue | Zurueck-Button entfernen |
| src/pages/admin/notifications.vue | Zurueck-Button entfernen |
| src/pages/dashboard.vue | Zurueck-Button entfernen |
| src/pages/leaderboard.vue | Zurueck-Button entfernen; Tap auf Nutzer navigiert zu /leaderboard/[userId] |
| src/pages/orders.vue | Zurueck-Button entfernen |

### Neue Platzhalter-Seiten
| Datei | Inhalt |
|-------|--------|
| src/pages/search.vue | Platzhalter mit Hinweistext (Inhalt: FEAT-19) |
| src/pages/profile.vue | Platzhalter mit Hinweistext (Inhalt: FEAT-20) |
| src/pages/cart.vue | Platzhalter mit Hinweistext (vollstaendige Warenkorb-Logik: FEAT-16) |
| src/pages/product/[id].vue | Produktdetail-Seite mit Platzhalter-Struktur (vollstaendige Logik: FEAT-16) |
| src/pages/leaderboard/[userId].vue | Platzhalter mit Hinweistext (User-Details-Inhalt folgt in spaeteren Feature) |
| src/pages/admin/settings.vue | Platzhalter mit Hinweistext (Inhalt: FEAT-21) |

### Neue Komponenten
| Datei | Beschreibung |
|-------|-------------|
| src/components/navigation/UserTabBar.vue | Bottom-Tab-Bar fuer Mitarbeiter (Mobile) |
| src/components/navigation/AdminTabBar.vue | Bottom-Tab-Bar fuer Admins (Mobile) |
| src/components/navigation/UserSidebar.vue | Sidebar fuer Mitarbeiter (Desktop) |
| src/components/navigation/AdminSidebar.vue | Sidebar fuer Admins (Desktop) |
| src/components/navigation/UserHeader.vue | Header fuer Mitarbeiter (App-Name + Warenkorb-Icon) |
| src/components/navigation/AdminHeader.vue | Header fuer Admins (Seitentitel + Glocke) |

### Zu pruefende / anpassende Dateien
| Datei | Aktion |
|-------|--------|
| src/app.vue | Integration der neuen Layouts / Navigation-Wrapper |
| src/middleware/auth.global.ts | Neue Routen /search, /profile, /cart, /product/[id], /leaderboard/[userId], /admin/settings als Protected Paths eintragen |
| src/layouts/ | Evtl. Nuxt Layouts fuer User-App und Admin-App anlegen |

---

## 8. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| NFR-1 | Navigation-Komponenten sind reaktiv — aktiver Tab und Badges aktualisieren sich ohne Seitenreload |
| NFR-2 | Die Tab-Bar ueberlagert keinen relevanten Content (Seiten haben genuegend Padding-Bottom auf Mobile) |
| NFR-3 | Der Header ueberlagert keinen relevanten Content (Seiten haben genuegend Padding-Top) |
| NFR-4 | Der Breakpoint fuer Mobile/Desktop-Wechsel orientiert sich am bestehenden Tailwind-Theme des Projekts |
| NFR-5 | Keine doppelte Navigation-Logik — eine einzige Source of Truth fuer den aktiven Tab-Zustand |

---

## 9. Abgrenzung (Out of Scope fuer FEAT-15)

Die folgenden Punkte sind explizit NICHT Teil dieser Feature-Spec:

| Thema | Zustaendiges Feature |
|-------|---------------------|
| Inhalt der /search-Seite | FEAT-19 |
| Inhalt der /profile-Seite | FEAT-20 |
| Inhalt der /admin/settings-Seite | FEAT-21 |
| Warenkorb-Logik (Artikel hinzufuegen, entfernen, etc.) | FEAT-16 |
| Warenkorb-Badge-Zaehler (Datenquelle) | FEAT-16 |
| Vollstaendiger Warenkorb-Inhalt auf /cart | FEAT-16 |
| Vollstaendige Produktdetail-Logik auf /product/[id] (Vorbestellen-Button, Mengenauswahl) | FEAT-16 |
| Inhalt der /leaderboard/[userId]-Seite (User Details) | Kuenftiges Feature |
| Bestandsverwaltungs-Logik in /admin/products | FEAT-15 (Umsetzung) — API-Endpoints aus FEAT-12 bleiben erhalten |
| Konkrete Icon-Auswahl (welches Icon fuer welchen Tab) | UX Expert |
| Genaues visuelles Design der aktiven Tab-Hervorhebung | UX Expert |

---

## 10. Technische Anforderungen

- Routing: Nuxt 3 Router (file-based routing) — keine Aenderungen am Router-System noetig
- State fuer Warenkorb-Badge: Pinia Store (wird in FEAT-16 angelegt — FEAT-15 bindet nur die Badge-Zahl ein)
- State fuer Benachrichtigungs-Badge: Bestehender `notifications`-Pinia-Store (FEAT-13) — unveraendert weiterverwenden
- Auth-Guard: Bestehende `src/middleware/auth.global.ts` um neue Routen erweitern
- Kein neuer API-Endpoint benoetigt — reine Frontend-Aenderung
- Icon-Auswahl: ausschliesslich Teenyicons 1.0 (teenyicons npm) — keine anderen Icon-Libraries
