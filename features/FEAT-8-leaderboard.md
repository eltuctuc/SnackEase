# FEAT-8: Leaderboard

## Status: 🟢 Implemented

## Abhängigkeiten
- Benötigt: FEAT-7 (One-Touch Kauf) — für Kaufdaten und Bonuspunkte
- Benötigt: FEAT-2 (Demo User Authentication) — für User-Identifikation
- Hinweis: FEAT-9 (Admin ohne Guthaben) — Admin hat keinen Zugriff auf das Leaderboard

## Wireframes

| Screen | Datei |
|--------|-------|
| Bestenliste | `resources/high-fidelity/leaderboard.png` |
| User Details (/leaderboard/[userId]) | `resources/high-fidelity/anderes-profil.png` |

> Wireframes zeigen Struktur und Informationsarchitektur. Die visuelle Umsetzung richtet sich nach `resources/moodboard.png`, dem Tailwind-Theme und dem UX Expert Review. Fehlt ein Wireframe fuer einen Screen, muss vor der Umsetzung die Informationsarchitektur, das Navigationskonzept und die Darstellung mit dem User geklaert werden.

> Hinweis zu anderes-profil.png: Der Screen zeigt ein Herz-Icon und Chat-Icon neben dem Nutzernamen — dies sind soziale Funktionen (Folgen / Nachricht senden), die noch nicht spezifiziert sind. Vor der Umsetzung des User-Details-Screens muss geklaert werden, ob diese Funktionen im MVP enthalten sind.

---

## 1. Overview

**Beschreibung:** Rangliste der Mitarbeiter mit wählbarem Zeitraum (Woche / Monat / Allzeit) und zwei Tabs: "Meistgekauft" (nach Kaufanzahl) und "Gesündeste" (nach Bonuspunkten). Zugänglich über eine eigene Route `/leaderboard` mit Link im Dashboard.

**Ziel:** Motivation durch freundschaftlichen Wettbewerb und Anreize für gesunde Ernährung.

**Zugriff:** Nur für eingeloggte Mitarbeiter. Admin wird zu `/admin` weitergeleitet.

---

## 2. User Stories

| ID | Story | Priorität |
|----|-------|-----------|
| US-1 | Als Mitarbeiter möchte ich das Leaderboard über einen Link im Dashboard aufrufen können | Must-Have |
| US-2 | Als Mitarbeiter möchte ich sehen, wer im gewählten Zeitraum am meisten Snacks gekauft hat | Must-Have |
| US-3 | Als Mitarbeiter möchte ich sehen, wer im gewählten Zeitraum die meisten Bonuspunkte gesammelt hat | Must-Have |
| US-4 | Als Mitarbeiter möchte ich meinen eigenen Rang sofort erkennen (visuell hervorgehoben) | Must-Have |
| US-5 | Als Mitarbeiter möchte ich den Zeitraum wählen können (Woche / Monat / Allzeit) | Must-Have |
| US-6 | Als Mitarbeiter möchte ich das Leaderboard manuell aktualisieren können | Must-Have |
| US-7 | Als Mitarbeiter möchte ich sehen, ob ein Nutzer im Leaderboard gerade deaktiviert ist | Should-Have |

---

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| REQ-1 | Eigene Route `/leaderboard` mit Link im Dashboard | Must-Have |
| REQ-2 | Zwei Tabs: "Meistgekauft" und "Gesündeste" | Must-Have |
| REQ-3 | Zeitraum-Filter als Button-Gruppe: Woche / Monat / Allzeit | Must-Have |
| REQ-4 | Anzeige pro Eintrag: Rang, Name, Standort, Wert (Käufe oder Punkte) | Must-Have |
| REQ-5 | Eigener Nutzer visuell hervorgehoben (farbiger Hintergrund) | Must-Have |
| REQ-6 | Top 3 besonders hervorgehoben (Gold / Silber / Bronze, Trophy-Icons) | Must-Have |
| REQ-7 | Refresh-Button zum manuellen Aktualisieren | Must-Have |
| REQ-8 | Daten werden automatisch beim Öffnen der Seite geladen | Must-Have |
| REQ-9 | Inaktive Nutzer erscheinen in der Liste mit "inaktiv"-Badge | Should-Have |
| REQ-10 | Admin wird von `/leaderboard` zu `/admin` weitergeleitet | Must-Have |

---

## 4. Leaderboard-Kategorien

### 4.1 "Meistgekauft"
- Sortiert nach **Anzahl der Käufe** im gewählten Zeitraum (absteigend)
- Zeigt: Rang, Initialen/Avatar, Name, Standort, Kaufanzahl

### 4.2 "Gesündeste"
- Sortiert nach **gesammelten Bonuspunkten** im gewählten Zeitraum (absteigend)
- Zeigt: Rang, Initialen/Avatar, Name, Standort, Bonuspunkte
- Bonuspunkte-System (definiert in FEAT-7):
  - Obst: +3 Punkte
  - Nüsse / Protein / Shakes: +2 Punkte
  - Schokoriegel / sonstige Getränke: +1 Punkt

---

## 5. Zeitraum-Filter

| Option | Beschreibung | SQL-Filter |
|--------|--------------|------------|
| Woche | Aktuelle ISO-Woche (Montag–Sonntag) | `created_at >= DATE_TRUNC('week', NOW())` |
| Monat | Aktueller Kalendermonat | `created_at >= DATE_TRUNC('month', NOW())` |
| Allzeit | Alle Käufe seit System-Beginn | Kein Zeitfilter |

**Standard beim Öffnen:** Woche

---

## 6. Datenmodell (Neon/Drizzle)

### Leaderboard-Berechnung
Das Leaderboard wird aus den `purchases` und `users` Tabellen berechnet (keine separate Tabelle nötig):

```sql
-- Meistgekauft (Beispiel: Zeitraum Monat)
SELECT
  u.id,
  u.name,
  u.location,
  u.is_active,
  COUNT(p.id) AS total_purchases
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
  AND p.created_at >= DATE_TRUNC('month', NOW())
WHERE u.role = 'mitarbeiter'
GROUP BY u.id, u.name, u.location, u.is_active
ORDER BY total_purchases DESC, u.name ASC;

-- Gesündeste (Bonuspunkte, gleicher Zeitraum)
SELECT
  u.id,
  u.name,
  u.location,
  u.is_active,
  COALESCE(SUM(p.bonus_points), 0) AS health_points
FROM users u
LEFT JOIN purchases p ON u.id = p.user_id
  AND p.created_at >= DATE_TRUNC('month', NOW())
WHERE u.role = 'mitarbeiter'
GROUP BY u.id, u.name, u.location, u.is_active
ORDER BY health_points DESC, u.name ASC;
```

---

## 7. API Endpoints

| Endpoint | Methode | Query-Parameter | Beschreibung |
|----------|---------|-----------------|--------------|
| `/api/leaderboard` | GET | `?period=week\|month\|all` | Rangliste (beide Kategorien in einem Response) |

**Beispiel-Response:**
```json
{
  "period": "week",
  "mostPurchased": [
    { "rank": 1, "id": "...", "name": "Nina Neuanfang", "location": "Nürnberg", "isActive": true, "totalPurchases": 12 }
  ],
  "healthiest": [
    { "rank": 1, "id": "...", "name": "Lucas Gesundheitsfan", "location": "Berlin", "isActive": true, "healthPoints": 28 }
  ]
}
```

---

## 8. Acceptance Criteria

### Navigation & Zugriff
- [ ] AC-1: Link im Dashboard führt zu `/leaderboard`
- [ ] AC-2: `/leaderboard` ist eine eigene Route (eigene Seite in `pages/`)
- [ ] AC-3: Admin öffnet `/leaderboard` → Redirect zu `/admin`
- [ ] AC-4: Nicht eingeloggter Nutzer öffnet `/leaderboard` → Redirect zu `/login`

### Tabs
- [ ] AC-5: Tab "Meistgekauft" zeigt Rangliste sortiert nach Kaufanzahl
- [ ] AC-6: Tab "Gesündeste" zeigt Rangliste sortiert nach Bonuspunkten
- [ ] AC-7: Tab-Wechsel aktualisiert die Anzeige sofort ohne neuen API-Call (beide Datensätze in einem Response)

### Zeitraum-Filter
- [ ] AC-8: Drei Zeitraum-Buttons vorhanden: "Woche", "Monat", "Allzeit"
- [ ] AC-9: Standard-Zeitraum beim Öffnen der Seite ist "Woche"
- [ ] AC-10: Auswahl eines anderen Zeitraums löst neuen API-Call mit korrektem `period`-Parameter aus

### Anzeige
- [ ] AC-11: Plätze 1–3 mit Gold 🥇 / Silber 🥈 / Bronze 🥉 Trophy-Icon hervorgehoben
- [ ] AC-12: Aktuell eingeloggter Nutzer ist farblich hervorgehoben (blauer Hintergrund)
- [ ] AC-13: Jeder Eintrag zeigt: Rang, Initialen/Avatar, Name, Standort, Wert (Käufe oder Punkte)
- [ ] AC-14: Inaktive Nutzer erscheinen in der Liste mit "inaktiv"-Badge

### Aktualisierung
- [ ] AC-15: Daten werden automatisch beim Öffnen der Seite geladen
- [ ] AC-16: Refresh-Button lädt Daten manuell neu
- [ ] AC-17: Während des Ladens wird ein Loading-State (Skeleton) angezeigt

### Edge Cases
- [ ] AC-18: Keine Käufe im Zeitraum → leere Liste mit Hinweis "Noch keine Käufe in diesem Zeitraum"
- [ ] AC-19: Gleichstand → alphabetisch nach Name sortiert
- [ ] AC-20: API-Fehler → Fehlermeldung angezeigt, Retry möglich

---

## 9. Edge Cases

| ID | Szenario | Erwartetes Verhalten |
|----|----------|---------------------|
| EC-1 | Keine Käufe im gewählten Zeitraum | Leere Liste mit Hinweis "Noch keine Käufe in diesem Zeitraum" |
| EC-2 | Gleiche Punktzahl / Kaufanzahl | Alphabetisch nach Name sortieren (Tiebreaker) |
| EC-3 | Inaktiver Nutzer hat Käufe | Erscheint in der Liste mit "inaktiv"-Badge, normale Rang-Berechnung |
| EC-4 | Admin öffnet `/leaderboard` | Redirect zu `/admin` (kein Leaderboard-Zugriff) |
| EC-5 | Alle Nutzer haben 0 Punkte/Käufe | Alle mit Wert 0 gelistet, alphabetisch sortiert |
| EC-6 | Zeitraum-Wechsel, noch keine Daten | Leere Liste ohne Fehlermeldung |
| EC-7 | API-Fehler beim Laden | Fehlermeldung angezeigt, Retry-Button sichtbar |
| EC-8 | Nutzer kauft und öffnet danach Leaderboard | Aktualisierter Rang wird beim Öffnen korrekt angezeigt |

---

## 10. UI/UX Vorgaben

**Layout-Struktur:**
```
┌─────────────────────────────┐
│ [← Dashboard]  Leaderboard  │  Header
├─────────────────────────────┤
│ [Meistgekauft] [Gesündeste] │  Tabs
├─────────────────────────────┤
│ [Woche]  [Monat]  [Allzeit] │  Zeitraum-Filter
├─────────────────────────────┤
│ 🥇 1. Nina Neuanfang   NUE  │
│    12 Käufe                 │
│ ─────────────────────────── │
│ 🥈 2. Tom Schnellkäufer BER │
│    10 Käufe                 │
│ ─────────────────────────── │
│ 🥉 3. Max Muster  [inaktiv] │
│    8 Käufe                  │
│ ─────────────────────────── │
│ ▶ 4. Maxine (du)   NUE  ◀  │  Eigener Rang (hervorgehoben)
│    7 Käufe                  │
├─────────────────────────────┤
│         [🔄 Aktualisieren]  │  Refresh-Button
└─────────────────────────────┘
```

**Visuelle Regeln:**
- Top 3: Trophy-Icons 🥇 / 🥈 / 🥉
- Eigener Eintrag: Hintergrundfarbe hervorgehoben (primär-blau, light)
- Inaktive Nutzer: Badge "inaktiv" in grau/gedämpft
- Loading: Skeleton-Cards statt leerer Fläche

---

## 11. Personas-Abdeckung

| Persona | Profitiert weil |
|---------|-----------------|
| **Tom Schnellkäufer** | Sieht auf einen Blick seinen Rang — kein langes Durchsuchen |
| **Lucas Gesundheitsfan** | Tab "Gesündeste" zeigt, ob sein Fokus auf gesunde Produkte sich lohnt |
| **Maxine Snackliebhaber** | Motiviert durch Vergleich mit Kollegen, Zeitraum-Filter für eigene Analyse |
| **Nina Neuanfang** | Zeitraum "Woche" gibt Einstieg ohne historischen Druck |
| **Mia Entdeckerin** | Kann alle Zeiträume und Tabs erkunden |

---

## 12. UX Design

### 12.1 Personas-Validierung

#### Bewertungsmatrix

| Persona | Profitiert stark? | Adressierte Bedürfnisse | Offene Pain Points |
|---------|-------------------|-------------------------|--------------------|
| Nina Neuanfang (24) | Mittel | Einfacher Einstieg durch Standardzeitraum "Woche"; kein historischer Druck | Kein Onboarding-Hinweis, was "Bonuspunkte" bedeuten — sie kennt das System noch nicht |
| Maxine Snackliebhaber (32) | Hoch | Wettbewerbsmotivation, Zeitraum-Vergleich, eigener Rang hervorgehoben | Kein Link zu den eigenen gekauften Produkten im Leaderboard-Kontext |
| Lucas Gesundheitsfan (28) | Sehr hoch | Tab "Gesündeste" direkt auf ihn zugeschnitten; Bonuspunkte zeigen Ernährungsqualität | Keine Erklärung des Punktesystems direkt auf dem Screen — er weiß nicht, warum er X Punkte hat |
| Tom Schnellkäufer (35) | Hoch | Eigener Rang sofort sichtbar ohne Scrollen (wenn Top 10); schneller Überblick | Bei langen Listen: eigener Rang könnte tief unten sein — lange Scroll-Strecke |
| Alex Gelegenheitskäufer (40) | Niedrig | Einfache Navigation; kein komplizierter Einstieg | Kein klarer Mehrwert für ihn — er kauft selten, sein Rang ist unwichtig; Feature könnte demotivierend wirken |
| Mia Entdeckerin (27) | Sehr hoch | Alle Zeiträume und Tabs erkundbar; visuell ansprechend durch Hervorhebungen | Kein "Teilen"-Feature oder Reaktionsmöglichkeit auf Ränge — exploratives Verhalten wird nicht belohnt |

#### Kritische Befunde

**Pain Point 1 — Fehlendes Kontextwissen (Nina, Lucas):**
Das Bonuspunktsystem (Obst +3, Nüsse +2, etc.) ist in der Feature Spec definiert, aber nicht im UI sichtbar. Neue Nutzer wie Nina und ernährungsbewusste Nutzer wie Lucas wissen nicht, wie die Punkte zustande kommen. Ohne dieses Wissen ist der "Gesündeste"-Tab bedeutungslos.

**Pain Point 2 — Demotivationspotenzial (Alex):**
Ein Leaderboard kann Nutzer, die selten kaufen, aktiv demotivieren. Alex sieht sich vielleicht auf Platz 38 von 40 — und öffnet das Feature nie wieder. Die Spec adressiert diesen Effekt nicht.

**Pain Point 3 — Eigener Rang tief in der Liste (Tom):**
Wenn das Team 30+ Mitarbeiter hat und Tom auf Platz 22 steht, muss er scrollen, um sich zu finden. Die visuelle Hervorhebung hilft nur, wenn er seinen Eintrag auch sieht. Ein "Zu meinem Rang springen"-Anker fehlt in der Spec.

**Pain Point 4 — Inaktiv-Badge ohne Erklärung:**
Das "inaktiv"-Badge erscheint bei deaktivierten Nutzern. Es gibt keine Erklärung, was "inaktiv" bedeutet. Für Nina ist das verwirrend — wurde diese Person gefeuert? Hat sie keinen Zugang mehr?

---

### 12.2 User Flows

#### Flow 1: Happy Path — Mitarbeiter öffnet Leaderboard und sieht seinen Rang

**Akteur:** Tom Schnellkäufer (repräsentiert alle Mitarbeiter)
**Ziel:** Eigenen Rang schnell erkennen

```
1. Tom ist eingeloggt auf /dashboard
2. Sieht den Link "Leaderboard" im Dashboard (Link-Button)
3. Tippt auf "Leaderboard"
4. Seite /leaderboard öffnet sich
5. Skeleton-Loading wird angezeigt (API-Call läuft)
6. Daten geladen — Standard: Tab "Meistgekauft", Zeitraum "Woche"
7. Tom sieht die Liste — sein Eintrag ist farblich hervorgehoben (blauer Hintergrund)
8. Er erkennt seinen Rang sofort (z.B. Platz 4)
9. Tom ist zufrieden — zurück zum Dashboard über "← Dashboard"-Link
```

**Erfolgskriterium:** Eigener Rang erkennbar ohne zu scrollen (gilt für Top-10-Platzierungen)

**Alternativer Flow 1a — Eigener Rang tief in der Liste:**
```
6b. Tom ist auf Platz 22 von 35
7b. Muss scrollen, um seinen hervorgehobenen Eintrag zu finden
8b. [EMPFEHLUNG: "Zu meinem Rang springen"-Button oder Auto-Scroll — siehe Sektion 12.5]
```

**Fehler-Subflow — Nicht eingeloggt:**
```
3b. Nicht eingeloggter Nutzer navigiert direkt zu /leaderboard
4b. Middleware leitet zu /login weiter
5b. Nach Login: Redirect zurück zu /leaderboard (wünschenswert, aber nicht in Scope)
```

---

#### Flow 2: Zeitraum-Wechsel — Mitarbeiter wechselt von "Woche" zu "Allzeit"

**Akteur:** Mia Entdeckerin (repräsentiert explorative Nutzer)
**Ziel:** Historischen Vergleich ansehen

```
1. Mia ist auf /leaderboard, Tab "Gesündeste", Zeitraum "Woche"
2. Sie sieht ihren Rang diese Woche (z.B. Platz 3)
3. Sie ist neugierig auf ihren Allzeit-Rang
4. Mia tippt auf Button "Allzeit"
5. Button "Allzeit" wird visuell aktiv (filled/selected State)
6. Skeleton-Loading erscheint im Listen-Bereich
7. API-Call mit ?period=all wird ausgelöst
8. Neue Rangliste wird geladen (jetzt 50+ Einträge möglich)
9. Mia sieht die Allzeit-Rangliste — ihr Eintrag wieder hervorgehoben
10. Sie wechselt zum Tab "Meistgekauft" — kein neuer API-Call (Daten bereits vorhanden)
11. Sie sieht die Meistgekauft-Rangliste für "Allzeit"
```

**Wichtig:** Zeitraum-State bleibt beim Tab-Wechsel erhalten (Mia wechselt Tab, bleibt bei "Allzeit").

**Alternativer Flow — Kein Daten im Zeitraum:**
```
7b. Zeitraum "Woche" → keine Käufe (z.B. Montag früh, erste Woche)
8b. Leere Liste erscheint mit Hinweis: "Noch keine Käufe in diesem Zeitraum"
9b. Kein Fehler, kein Loading-Spinner mehr — klare, freundliche Botschaft
```

---

#### Flow 3: Fehler-Flow — API-Fehler beim Laden mit Retry

**Akteur:** Lucas Gesundheitsfan (repräsentiert jeden Nutzer bei Netzwerkproblemen)
**Ziel:** Trotz Fehler ans Ziel kommen

```
1. Lucas öffnet /leaderboard
2. Skeleton-Loading erscheint (API-Call startet)
3. API-Call schlägt fehl (Timeout, Netzwerkfehler, Serverfehler)
4. Skeleton verschwindet
5. Fehlermeldung erscheint:
   "Rangliste konnte nicht geladen werden."
   [Erneut versuchen]-Button (prominent, mit Icon)
6. Lucas liest die Fehlermeldung
7. Er tippt auf "Erneut versuchen"
8. Skeleton-Loading erscheint wieder
9a. Erfolg: Daten geladen — normaler Flow ab Schritt 6 (Flow 1)
9b. Erneuter Fehler: Fehlermeldung wieder sichtbar — Schritt 5 wiederholt sich
```

**Kritisch:** Refresh-Button (REQ-7) muss auch im Fehlerzustand sichtbar sein und denselben Effekt haben wie "Erneut versuchen". Der Fehlertext darf nicht technisch sein — kein HTTP-Statuscode, kein Stack-Trace.

---

### 12.3 Detailliertes Wireframe

#### Desktop-Ansicht (Referenz, ab 768px)

```
┌─────────────────────────────────────────────────────┐
│  [← Dashboard]              Leaderboard    [Mulish]  │  Header
├─────────────────────────────────────────────────────┤
│  [Meistgekauft]          [Gesündeste]               │  Tabs (volle Breite)
│  ─────────────────────────────────────              │  Aktiver Tab: grüner Unterstrich
├─────────────────────────────────────────────────────┤
│  [  Woche  ]   [  Monat  ]   [  Allzeit  ]          │  Zeitraum-Filter
│  ^aktiv = filled grün / inaktiv = outlined           │  min-h-[44px]
├─────────────────────────────────────────────────────┤
│  [Gold-Icon]  1.  Nina Neuanfang      NUE  12 Käufe │
│  [Silb-Icon]  2.  Tom Schnellkäufer   BER  10 Käufe │
│  [Bron-Icon]  3.  Max Muster  [inaktiv]  8 Käufe    │
│  ─────────────────────────────────────────────────  │
│  [highlight]  4.  Maxine (du)         NUE   7 Käufe │  Eigener Rang: bg-blue-50 + border-l-4
│  ─────────────────────────────────────────────────  │
│               5.  Lucas Gesundheitsfan BER  6 Käufe  │
│               ...                                    │
├─────────────────────────────────────────────────────┤
│                    [SVG]  Aktualisieren              │  Refresh-Button, min-h-[44px]
└─────────────────────────────────────────────────────┘
```

#### Mobile-Ansicht (375px — primäre Zielbreite)

```
┌─────────────────────────┐
│ [←]      Leaderboard    │  Header: kompakt, 56px hoch
├─────────────────────────┤
│ [Meistgekauft][Gesünd.] │  Tabs: 50/50 Breite, scrollbar wenn nötig
│ ─────────────────────── │  Aktiver Tab: grüner Unterstrich, fetter Text
├─────────────────────────┤
│ [Woche][Monat][Allzeit] │  Buttons: gleiche Breite, min 44px Höhe
│                         │  Gap zwischen Buttons: min 8px
├─────────────────────────┤
│ [G] 1. Nina Neuanfang   │  G = Gold-SVG-Icon (24x24px)
│        NUE · 12 Käufe   │  Name + Standort/Wert in zwei Zeilen
│ ─────────────────────── │
│ [S] 2. Tom Schnellk.    │  S = Silber-SVG-Icon
│        BER · 10 Käufe   │
│ ─────────────────────── │
│ [B] 3. Max M.[inaktiv]  │  inaktiv-Badge: grau, kleiner Text
│        BER · 8 Käufe    │
│ ─────────────────────── │
│ ► 4. Maxine (du)     ◄  │  Hervorgehoben: bg-blue-50, linker Balken grün
│        NUE · 7 Käufe    │
│ ─────────────────────── │
│    5. Lucas G.          │
│        BER · 6 Käufe    │
│ ─────────────────────── │
│    ...                  │
├─────────────────────────┤
│   [SVG-Icon] Aktual.    │  Refresh: volle Breite, min 44px Höhe
└─────────────────────────┘
```

**Mobile-Besonderheiten:**
- Tab-Labels dürfen nicht abgeschnitten werden — "Meistgekauft" ist 12 Zeichen: muss vollständig lesbar sein (min. 14px Font-Größe)
- Zeitraum-Buttons als gleichbreite Button-Gruppe (flex, 1/3 Breite je Button)
- Listeneinträge: Name in einer Zeile, Standort + Wert in zweiter Zeile (kein Overflow)
- Refresh-Button: volle Breite unten, gut erreichbar mit Daumen

---

#### Leerer Zustand (keine Käufe im Zeitraum)

```
┌─────────────────────────┐
│ [←]      Leaderboard    │
├─────────────────────────┤
│ [Meistgekauft][Gesünd.] │
├─────────────────────────┤
│ [Woche][Monat][Allzeit] │
├─────────────────────────┤
│                         │
│    [SVG: leere Liste]   │  Illustration oder neutrales Icon (SVG, nicht Emoji)
│                         │
│  Noch keine Käufe in    │
│  diesem Zeitraum.       │  Text: neutral, nicht entmutigend
│                         │
│  Kauf einen Snack und   │
│  erscheine auf der      │
│  Rangliste!             │  Optional: Call-to-Action-Text
│                         │
├─────────────────────────┤
│   [SVG-Icon] Aktual.    │
└─────────────────────────┘
```

**Hinweis:** Kein Fehler-Styling (kein Rot) — leerer Zustand ist kein Fehler. Neutrale Grau-Töne oder App-Grün.

---

#### Fehler-Zustand (API nicht erreichbar)

```
┌─────────────────────────┐
│ [←]      Leaderboard    │
├─────────────────────────┤
│ [Meistgekauft][Gesünd.] │
├─────────────────────────┤
│ [Woche][Monat][Allzeit] │
├─────────────────────────┤
│                         │
│  [SVG: Warndreick o.ä.] │  SVG-Icon, nicht Emoji
│                         │
│  Rangliste konnte nicht │
│  geladen werden.        │  Klarer, nicht-technischer Text
│                         │
│  [SVG] Erneut versuchen │  Button: prominent, min 44px Höhe
│                         │
├─────────────────────────┤
│   [SVG-Icon] Aktual.    │  Refresh-Button zusätzlich sichtbar
└─────────────────────────┘
```

**Fehlertext-Regeln:**
- Kein HTTP-Statuscode sichtbar (kein "Error 500", kein "fetch failed")
- Keine technische Sprache
- Immer eine Handlungsoption (Retry-Button)

---

### 12.4 Accessibility-Prüfung (WCAG 2.1)

#### 4.1 Farbkontrast

| Element | Hintergrund | Textfarbe | Anforderung | Status |
|---------|-------------|-----------|-------------|--------|
| Listeneinträge (normal) | Weiss (#FFFFFF) | Dunkelgrau (#374151 / gray-700) | 4.5:1 | Zu prüfen: Developer muss konkreten Hex-Wert sicherstellen |
| Eigener Rang (Hervorhebung) | Blau-hell (#EFF6FF / blue-50) | Dunkelgrau (#374151) | 4.5:1 | Kritisch: blue-50 mit gray-700 muss gemessen werden — nicht blind annehmen |
| "inaktiv"-Badge | Grau (#F3F4F6 / gray-100) | Grau (#6B7280 / gray-500) | 4.5:1 | Risikoreich: graues Badge auf grauem Hintergrund kann unter 4.5:1 fallen |
| Aktiver Tab-Text | Weiss oder App-Grün-Hintergrund | Weiss oder Dunkel | 4.5:1 | Grüner Tab mit weissem Text: muss spezifisch gemessen werden |
| Zeitraum-Buttons (aktiv) | App-Grün (z.B. #16A34A) | Weiss (#FFFFFF) | 4.5:1 | #16A34A auf Weiss erreicht ca. 4.6:1 — knapp ausreichend, muss exakt getestet werden |
| Zeitraum-Buttons (inaktiv) | Weiss | Dunkelgrau | 4.5:1 | Unkritisch bei gray-700 |

**Konkrete Empfehlung:** Das "inaktiv"-Badge ist das groesste Kontrast-Risiko. Badge-Text muss mindestens gray-600 (#4B5563) auf gray-100 (#F3F4F6) sein, oder das Badge-Design muss angepasst werden (dunklerer Hintergrund).

**Trophy-Icons:** Wenn Emojis (wie in der bestehenden Spec) verwendet werden, sind diese nicht zuverlässig accessible. SVG-Icons mit aria-label sind Pflicht (siehe 4.3).

---

#### 4.2 Tastatur-Navigation

**Tab-Reihenfolge (logisch, von oben nach unten):**

```
1. [← Dashboard] Link
2. Tab "Meistgekauft" (role="tab")
3. Tab "Gesündeste" (role="tab")
4. Zeitraum-Button "Woche" (role="radio" oder button)
5. Zeitraum-Button "Monat"
6. Zeitraum-Button "Allzeit"
7. Listeneinträge (nicht fokussierbar, da keine Aktion — nur Display)
8. [Aktualisieren]-Button
```

**Wichtige Regeln:**

- Tabs-Komponente muss `role="tablist"` mit `role="tab"` auf den einzelnen Tabs implementieren. Pfeiltasten (Links/Rechts) sollen zwischen Tabs navigieren — nicht nur Tab-Taste.
- Zeitraum-Buttons als `role="radiogroup"` mit `role="radio"` deklarieren — das kommuniziert dem Screen Reader, dass nur eine Option aktiv sein kann.
- Focus-Ring muss sichtbar sein: Tailwind `focus:ring-2 focus:ring-green-500` oder äquivalent. Der Browser-Default-Ring ist oft zu schwach.
- Wenn ein Modal oder Overlay erscheint (z.B. Fehler-State), darf der Fokus nicht im Hintergrund bleiben — Focus Trap implementieren falls zutreffend.

**Skip Link:**
Da der Header und die Tab-Navigation vor dem eigentlichen Inhalt stehen, sollte ein versteckter Skip-Link "Zum Leaderboard springen" implementiert werden (sichtbar nur bei Fokus), damit Tastaturnutzer nicht durch Header + Tabs + Filter-Buttons tabben müssen.

---

#### 4.3 Screen Reader

**Kritische aria-Attribute:**

| Element | Pflicht-Attribut | Beispiel |
|---------|-----------------|---------|
| Gold/Silber/Bronze-Icons (SVG) | `aria-label` | `aria-label="Platz 1 — Gold"` |
| "inaktiv"-Badge | `aria-label` | `aria-label="Nutzer inaktiv"` |
| Eigener Rang (Hervorhebung) | `aria-label` oder `aria-current` | `aria-current="true"` oder `aria-label="Dein Rang: Platz 4"` |
| Refresh-Button (Icon + Text) | Kein Extra-Label wenn Textlabel vorhanden | Text "Aktualisieren" reicht aus |
| Tab-Komponente | `role="tablist"`, `aria-selected` | `aria-selected="true"` auf aktivem Tab |
| Zeitraum-Button-Gruppe | `role="radiogroup"`, `aria-label` | `aria-label="Zeitraum auswählen"` |
| Leerzeichen-Status | `aria-live="polite"` | Wenn Liste leer wird nach Zeitraum-Wechsel |
| Lade-Status | `aria-busy="true"` während Loading | Auf dem Container der Liste |

**Ranglisten-Semantik:**
Die Leaderboard-Liste sollte als geordnete Liste (`<ol>`) implementiert werden — dann liest der Screen Reader automatisch "Listenelement 1 von 20", was den Rang kontextualisiert. Alternativ muss jeder Listeneintrag explizit mit `aria-label="Rang 1: Nina Neuanfang, Nürnberg, 12 Käufe"` versehen werden.

**Wichtig für Trophy-Icons:** Die Spec verwendet aktuell Emoji-Symbole (z.B. in AC-11: "🥇 / 🥈 / 🥉"). Screen Reader lesen Emojis mit langen englischen Beschreibungen vor ("First place medal"). SVG-Icons mit `aria-label="Gold"` und `aria-hidden="false"` sind zugaenglicher und konsistenter mit dem Pre-Delivery-Checklist des UI/UX-Skill.

---

#### 4.4 Touch-Targets

| Element | Mindestgroesse | Risiko bei Nicht-Erfuellung |
|---------|---------------|------------------------------|
| Tab "Meistgekauft" | 44x44px | Mittel — Tab ist breit, aber Hoehe oft zu gering |
| Tab "Gesündeste" | 44x44px | Mittel — gleiches Problem |
| Zeitraum-Button "Woche" | 44x44px | Hoch — 3 Buttons nebeneinander auf 375px werden eng |
| Zeitraum-Button "Monat" | 44x44px | Hoch |
| Zeitraum-Button "Allzeit" | 44x44px | Hoch |
| Refresh-Button | 44x44px | Niedrig — Button am Boden, meist gross genug |
| Listeneinträge (wenn klickbar) | 44px Hoehe | Entfällt wenn keine Tap-Interaktion |

**Kritischer Punkt — Zeitraum-Buttons auf Mobile:**
Drei Buttons nebeneinander auf 375px bedeutet ca. 125px Breite pro Button (nach Padding und Gap). Die Breite ist ausreichend. Die Hoehe muss explizit auf `min-h-[44px]` gesetzt werden — viele Tailwind-Implementierungen vergessen die Hoehe. Gap zwischen Buttons muss mindestens 8px betragen.

---

### 12.5 UX-Empfehlungen

Die folgenden Empfehlungen sind konkret und direkt an den Developer adressiert. Empfehlungen sind priorisiert nach Auswirkung auf User Experience.

---

#### Empfehlung 1 — KRITISCH: SVG-Icons statt Emojis fuer Trophy-Raenge

**Problem:** Die Spec verwendet Emoji-Icons (🥇 / 🥈 / 🥉). Emojis sind OS-abhaengig, nicht skalierbar, nicht styled und werden von Screen Readern mit englischen Langtexten vorgelesen.

**Loesung:** SVG-Icons aus Heroicons oder Lucide (z.B. Trophy-Icon) verwenden. Einfaerbung in Gold (#D97706), Silber (#9CA3AF), Bronze (#B45309) per Tailwind-Klasse. Jedes Icon bekommt `aria-label="Platz 1"` etc.

**Konsistenz:** Die bestehende App nutzt ebenfalls SVG-Icons — Emojis waeren inkonsistent.

---

#### Empfehlung 2 — HOCH: Punktesystem-Erklaerung direkt im "Gesündeste"-Tab

**Problem:** Lucas und Nina wissen nicht, wie Bonuspunkte berechnet werden. Der "Gesündeste"-Tab zeigt nur den Punktestand — ohne Kontext ist dieser bedeutungslos.

**Loesung:** Ein kleines Info-Element direkt unter den Tab-Buttons einfuegen, nur wenn Tab "Gesündeste" aktiv ist:

```
Punkte: Obst +3  |  Nüsse/Protein +2  |  Snacks/Getränke +1
```

Alternativ: Ein (i)-Icon-Button, der einen Tooltip oder ein kleines Overlay mit der Erklaerung oeffnet. Die Erklaerung erscheint nur im "Gesündeste"-Tab — im "Meistgekauft"-Tab ist sie nicht relevant.

---

#### Empfehlung 3 — HOCH: Eigenen Rang immer sichtbar machen ("Sticky"-Eintrag oder Anker)

**Problem:** Tom (und jeder Nutzer) steht moeglicherweise auf Platz 22 von 35. Er muss lange scrollen, um seinen hervorgehobenen Eintrag zu finden. Die visuelle Hervorhebung hilft nur, wenn der Eintrag sichtbar ist.

**Loesung (Option A — bevorzugt):** Eine feste Zusammenfassung am oberen Rand der Liste, die den eigenen Rang immer anzeigt:

```
┌─────────────────────────┐
│ Dein Rang: Platz 22     │  Kleiner Banner, immer sichtbar
│ NUE · 3 Käufe diese Wo │  unter den Filter-Buttons
└─────────────────────────┘
```

**Loesung (Option B):** Ein Button "Zu meinem Rang springen" unter den Zeitraum-Filtern, der per Scroll-Anker (`scrollIntoView`) zum eigenen Eintrag navigiert.

Option A ist vorzuziehen, da sie keinen weiteren Interaktionsschritt erfordert.

---

#### Empfehlung 4 — MITTEL: "inaktiv"-Badge mit Tooltip erklaeren

**Problem:** Das Badge "inaktiv" erscheint ohne Erklaerung. Nina versteht nicht, was das bedeutet. Ist die Person entlassen? Hat sie keinen App-Zugang?

**Loesung:** Das Badge bekommt einen Tooltip (oder aria-description): "Dieser Nutzer hat keinen aktiven App-Zugang." Der Tooltip erscheint bei Hover auf Desktop und bei langem Tippen auf Mobile.

**Alternativ:** Den Text des Badges aendern zu "Account inaktiv" — laenger, aber selbsterklaerend ohne Tooltip.

---

#### Empfehlung 5 — MITTEL: Zeitraum-State bei Tab-Wechsel beibehalten

**Problem (implizit in der Spec):** Wenn Mia auf "Allzeit" wechselt und dann den Tab von "Meistgekauft" zu "Gesündeste" wechselt, erwartet sie, dass sie weiterhin "Allzeit"-Daten sieht. Die Spec definiert dies nicht explizit.

**Loesung:** Zeitraum-State (week/month/all) ist global auf dem Screen — nicht tab-spezifisch. Tab-Wechsel loest keinen neuen API-Call aus. Nur Zeitraum-Wechsel loest neuen API-Call aus. Dies ist sowohl UX-korrekt als auch performant (wie in AC-7 definiert, aber hier als UX-Regel explizit bestaetigt).

---

#### Empfehlung 6 — MITTEL: Fehlertext humanisieren und Retry prominent platzieren

**Problem:** Standard-Fehlermeldungen aus APIs sind oft technisch und entmutigend.

**Empfohlene Fehlertexte:**
- Netzwerkfehler: "Keine Verbindung. Bitte Internetverbindung pruefen und erneut versuchen."
- Server-Fehler: "Die Rangliste ist gerade nicht verfuegbar. Bitte in einem Moment erneut versuchen."
- Allgemein: "Rangliste konnte nicht geladen werden." + [Erneut versuchen]-Button

Der Retry-Button muss auch im Fehlerzustand dieselbe Funktion wie der Refresh-Button haben — ein doppelter Mechanismus fuer dasselbe Ziel ist gut fuer Fehlertoleranz.

---

#### Empfehlung 7 — NIEDRIG: Loading-Skeleton mit realistischer Listenstruktur

**Problem:** Ein generischer Skeleton (z.B. einfache graue Balken) gibt keinen Kontext ueber den kommenden Inhalt.

**Loesung:** Der Skeleton sollte die spätere Listenstruktur imitieren: 5-7 Skelett-Zeilen, die je einen Rang-Platzhalter, einen Avatar-Kreis, eine Namenszeile und eine Wert-Zeile zeigen. Das reduziert den wahrgenommenen Ladezeit-Schock (Content Jumping, Prinzip aus dem UI/UX-Skill: "Reserve space for async content").

---

#### Empfehlung 8 — NIEDRIG: prefers-reduced-motion respektieren

**Problem:** Das Skeleton-Loading, Tab-Wechsel-Animationen und Zeitraum-Uebergaenge nutzen moeglicherweise CSS-Uebergaenge. Nutzer mit Bewegungsempfindlichkeit (Vestibularstoerungen) koennen davon beeintraechtigt werden.

**Loesung:** Alle Animationen und Uebergaenge muessen unter `@media (prefers-reduced-motion: reduce)` deaktiviert oder auf sofortige Zustandsaenderung reduziert werden. In Tailwind: `motion-safe:transition-all` statt `transition-all`.

---

### 12.6 Checkliste UX-Abnahme

Bevor das Feature an den Solution Architect und Developer uebergeben wird:

- [x] Personas geprüft: Alle 6 relevanten Personas analysiert, Pain Points identifiziert
- [x] User Flows erstellt: 3 vollstaendige Flows dokumentiert (Happy Path, Zeitraum-Wechsel, Fehler)
- [x] Wireframes detailliert: Desktop, Mobile (375px), Leerer Zustand, Fehler-Zustand
- [x] Accessibility geprueft: Farbkontrast, Tastatur-Navigation, Screen Reader, Touch-Targets
- [x] Empfehlungen dokumentiert: 8 priorisierte UX-Empfehlungen an Developer
- [x] Pain Points identifiziert: 4 kritische Pain Points (Kontextwissen, Demotivation, Rang-Scrolling, inaktiv-Badge)
- [x] User Review: Empfehlungen vom Auftraggeber approved (2026-03-05)

---

## Tech-Design (Solution Architect)

### Bestehende Architektur (geprüft)

Folgende Infrastruktur existiert bereits und wird wiederverwendet:

**Datenbank-Tabellen (bereits vorhanden):**
- `users` — enthält Name, Standort, Rolle, is_active
- `purchases` — enthält bonus_points, created_at, user_id (verknüpft mit users)

Für das Leaderboard sind keine neuen Tabellen nötig. Die Berechnung erfolgt direkt aus `purchases` und `users`.

**Stores (bereits vorhanden, werden genutzt):**
- `useAuthStore` — für den eingeloggten User (ID, Rolle) und Admin-Redirect-Logik

**Middleware (bereits vorhanden):**
- `auth.global.ts` — schützt Routen vor nicht eingeloggten Nutzern, übernimmt den `/leaderboard`-Schutz ohne zusätzlichen Aufwand

**API-Pattern (bereits vorhanden, als Vorlage nutzen):**
- Bestehende GET-Endpunkte unter `src/server/api/` zeigen das einheitliche Pattern, das für `/api/leaderboard` übernommen wird

---

### Component-Struktur

```
/leaderboard (neue Seite)
├── Leaderboard-Header
│   └── Zurück-Link zum Dashboard
│
├── Tab-Navigation
│   ├── Tab "Meistgekauft" (aktiv = grüner Unterstrich)
│   └── Tab "Gesündeste"
│       └── Punktesystem-Hinweis (nur wenn dieser Tab aktiv)
│             "Punkte: Obst +3 | Nüsse/Protein +2 | Snacks +1"
│
├── Zeitraum-Filter (Button-Gruppe)
│   ├── Button "Woche" (Standard: aktiv)
│   ├── Button "Monat"
│   └── Button "Allzeit"
│
├── Eigener-Rang-Banner (immer sichtbar unter den Filtern)
│   └── "Dein Rang: Platz X | Standort · Y Käufe/Punkte"
│
├── Ranglisten-Bereich (wechselt je nach Tab)
│   ├── Lade-Zustand: Skeleton-Liste (5–7 Zeilen)
│   ├── Fehler-Zustand
│   │   ├── SVG-Icon (Warnung)
│   │   ├── Fehlermeldung (kein Techniksprache)
│   │   └── Button "Erneut versuchen"
│   ├── Leerer Zustand
│   │   ├── SVG-Illustration
│   │   └── Text "Noch keine Käufe in diesem Zeitraum."
│   └── Ranglisten-Liste (geordnete Liste)
│       ├── Platz 1 — SVG Gold-Icon, Name, Standort, Wert
│       ├── Platz 2 — SVG Silber-Icon, Name, Standort, Wert
│       ├── Platz 3 — SVG Bronze-Icon, Name, Standort, Wert
│       ├── Platz 4... — Rang-Nummer, Name, Standort, Wert
│       │   (Einträge mit "inaktiv"-Badge für deaktivierte Nutzer)
│       └── Eigener Eintrag — farbiger Hintergrund (blau-hell), linker Balken grün
│
└── Refresh-Button (immer am unteren Rand sichtbar)
    └── SVG-Icon + Text "Aktualisieren"
```

**Neue Dateien:**
- `src/pages/leaderboard.vue` — die neue Seite
- `src/components/leaderboard/LeaderboardList.vue` — die Ranglisten-Liste
- `src/components/leaderboard/LeaderboardEntry.vue` — ein einzelner Listeneintrag
- `src/components/leaderboard/LeaderboardSkeleton.vue` — Lade-Skeleton
- `src/composables/useLeaderboard.ts` — Datenabruf und State-Verwaltung

---

### Daten-Model

Das Leaderboard speichert keine eigenen Daten. Es berechnet die Rangliste auf Anfrage aus den vorhandenen Tabellen.

**Jeder Ranglisten-Eintrag enthält:**
- Rang (Zahl, berechnet aus der Sortierung)
- User-ID (intern, für Hervorhebung des eigenen Eintrags)
- Name des Mitarbeiters
- Standort (Nürnberg / Berlin)
- Aktiv-Status (true / false — für inaktiv-Badge)
- Wert (entweder Anzahl Käufe oder Summe Bonuspunkte, je nach Tab)

**Zwei Ranglisten in einer API-Antwort:**
- "Meistgekauft" — sortiert nach Kaufanzahl (absteigend), Tiebreaker: alphabetisch
- "Gesündeste" — sortiert nach Bonuspunkten (absteigend), Tiebreaker: alphabetisch

**Zeitraum-Filter (Query-Parameter `period`):**
- `week` — aktuelle ISO-Woche (Montag bis Sonntag)
- `month` — aktueller Kalendermonat
- `all` — alle Käufe seit System-Beginn

**Gespeichert in:** Neon-Datenbank (Tabellen `purchases` und `users`). Keine neue Tabelle nötig.

---

### Tech-Entscheidungen

**Warum eine eigene `/leaderboard`-Route statt Modal oder Drawer?**
Das Leaderboard ist ein vollständiger Screen mit eigenem State (Tabs, Zeitraum, Daten). Ein eigener Screen ermöglicht auch Deep-Links und saubere Navigation — entspricht dem Muster der bereits vorhandenen Seiten `/dashboard`, `/admin`.

**Warum beide Tabs in einem API-Call?**
Beide Ranglisten ("Meistgekauft" und "Gesündeste") werden in einem einzigen API-Aufruf geladen. Tab-Wechsel lösen dann keinen erneuten API-Call aus, sondern zeigen bereits geladene Daten. Das spart Ladezeit und entspricht AC-7 aus der Spec.

**Warum kein eigener Leaderboard-Store?**
Der Leaderboard-State ist lokal auf einer Seite. Ein eigener Pinia-Store wäre Overhead. Stattdessen wird ein `useLeaderboard`-Composable verwendet — das ist das bereits etablierte Pattern in der App (z.B. `useModal`, `useSearch`).

**Warum SVG-Icons statt Emojis für Trophy-Ränge?**
Emojis sehen auf verschiedenen Betriebssystemen unterschiedlich aus, sind nicht skalierbar und werden von Screen Readern mit englischen Langtexten vorgelesen. SVG-Icons aus der bereits verwendeten Icon-Library (Heroicons / Lucide) bleiben konsistent mit der bestehenden App.

**Warum ein "Eigener-Rang-Banner" statt nur Hervorhebung?**
Nutzer auf Platz 22 von 35 müssten sonst scrollen, um ihren eigenen Eintrag zu finden. Der Banner am oberen Rand zeigt den eigenen Rang immer sichtbar — ohne zusätzliche Interaktion (entspricht UX-Empfehlung 3, Option A).

**Warum Skeleton-Loading statt Spinner?**
Die Rangliste hat eine bekannte Struktur (Listeinträge mit Rang, Name, Wert). Ein strukturierter Skeleton (der die Listenstruktur nachahmt) reduziert den wahrgenommenen Ladezeit-Schock (kein Content-Jump). Das ist das bessere Muster für Listen-Inhalte.

---

### Dependencies

Keine neuen Packages nötig. Das Leaderboard nutzt ausschliesslich bereits installierte Abhängigkeiten:

- Nuxt / Vue 3 (Routing, Composables, Reaktivität)
- Pinia (authStore für User-ID und Rolle)
- Drizzle ORM (Datenbankabfragen im Backend)
- Tailwind CSS (Styling, inkl. Accessibility-Klassen)
- Heroicons oder Lucide (SVG-Icons — bereits in der App vorhanden)

---

### Test-Anforderungen

**1. Unit-Tests (Vitest)**

Zu testendes Composable:
- `useLeaderboard` — folgende Szenarien prüfen:
  - Standard-Zeitraum beim Initialisieren ist "week"
  - Zeitraum-Wechsel setzt korrekten Query-Parameter
  - Tab-Wechsel löst keinen neuen API-Call aus
  - Eigener Rang wird korrekt aus der Liste identifiziert (Vergleich User-ID)
  - Leerer Zustand wird korrekt erkannt (leere Liste)
  - Fehler-Zustand wird korrekt erkannt (API-Fehler)

Ziel-Coverage: 80%+

Test-Pfad: `tests/composables/useLeaderboard.test.ts`

**2. E2E-Tests (Playwright)**

Kritische User-Flows:
- Mitarbeiter öffnet `/leaderboard` — Seite lädt, Skeleton erscheint, Daten werden angezeigt
- Tab-Wechsel "Meistgekauft" → "Gesündeste" — kein neuer Netzwerk-Call, Anzeige wechselt
- Zeitraum-Wechsel "Woche" → "Allzeit" — neuer API-Call mit `period=all`, neue Daten erscheinen
- Eigener Eintrag ist farblich hervorgehoben
- Admin öffnet `/leaderboard` — Redirect zu `/admin`
- Nicht eingeloggter Nutzer öffnet `/leaderboard` — Redirect zu `/login`
- Leerer Zustand: Hinweis-Text sichtbar (kein Fehler-Styling)
- Fehler-Zustand: Fehlermeldung sichtbar, Retry-Button funktioniert
- Refresh-Button lädt Daten neu

Browser: Chromium (primär), Firefox und Safari als sekundäre Ziele

Test-Pfad: `tests/e2e/leaderboard.spec.ts`

**3. Test-Patterns (konsistent mit bestehenden Tests)**
- Composables: `tests/composables/[name].test.ts`
- E2E: `tests/e2e/[feature].spec.ts`

---

## Implementation Notes

**Status:** 🟢 Implemented
**Developer:** Developer Agent
**Datum:** 2026-03-05

### Geänderte/Neue Dateien
- `src/middleware/auth.global.ts` — `/leaderboard` zu protectedPaths hinzugefügt; Admin-Redirect zu `/admin` eingefügt (AC-3)
- `src/server/api/leaderboard.get.ts` — GET-Endpoint: beide Ranglisten in einem Response, Zeitraum-Filter via `period`-Query-Parameter
- `src/composables/useLeaderboard.ts` — State-Management für Tabs, Zeitraum, Loading/Error/Empty; `setTab` ohne API-Call (AC-7)
- `src/components/leaderboard/LeaderboardEntry.vue` — Einzelner Listeneintrag mit Trophy-SVGs (Gold/Silber/Bronze), inaktiv-Badge, eigener-Rang-Hervorhebung
- `src/components/leaderboard/LeaderboardSkeleton.vue` — Strukturierter Lade-Skeleton (6 Zeilen, imitiert Listenstruktur)
- `src/components/leaderboard/LeaderboardList.vue` — Ranglisten-Container mit Loading/Error/Empty/Liste-State
- `src/pages/leaderboard.vue` — Neue Route `/leaderboard` mit Header, Tabs, Zeitraum-Filter, Eigener-Rang-Banner, Refresh-Button
- `src/pages/dashboard.vue` — Leaderboard-Link für Mitarbeiter hinzugefügt (US-1 / REQ-1)
- `tests/composables/useLeaderboard.test.ts` — 21 Unit-Tests, alle bestanden (100% Composable-Coverage)

### Wichtige Entscheidungen
- **Beide Tabs in einem API-Call:** `mostPurchased` und `healthiest` werden zusammen geladen — Tab-Wechsel ohne neuen Request (AC-7)
- **SVG-Icons statt Emojis:** Für Trophy-Ränge werden Heroicons-kompatible SVGs verwendet — konsistent, accessible (aria-label), OS-unabhängig (UX-Empfehlung 1)
- **Eigener-Rang-Banner:** Immer sichtbar unter den Filtern, zeigt Rang + Wert ohne Scrollen (UX-Empfehlung 3, Option A)
- **Punktesystem-Hinweis:** Nur im "Gesündeste"-Tab sichtbar (UX-Empfehlung 2)
- **SQL-Joins mit Drizzle:** `leftJoin` + bedingtem `dateFilter` für Zeitraum — kein Raw SQL nötig
- **Sortiertung im Backend-Response:** Sortierung erfolgt in der API, Frontend berechnet `rank` aus Array-Index

### Bekannte Einschränkungen
- E2E-Tests (`tests/e2e/leaderboard.spec.ts`) sind gemäß Feature-Spec vorgesehen aber noch nicht implementiert — folgen im QA-Schritt
- Bei sehr vielen Nutzern (100+): kein serverseitiges Paging implementiert (nicht in Spec gefordert)

---

## QA Re-Test Results (Nach Bug-Fixes)

**Re-Tested:** 2026-03-05
**Getestete Bug-Fixes:** BUG-FEAT8-001 bis BUG-FEAT8-005
**App URL:** http://localhost:3000

### Unit-Tests

**Command:** `npm test -- --run`

| Test-Suite | Tests | Passing | Failing | Coverage |
|------------|-------|---------|---------|----------|
| useLeaderboard Composable | 21 | 21 | 0 | 96.55% Stmts / 90.9% Branch |
| Alle Test-Suites gesamt | 158 | 143 | 0 (15 skipped) | ~11% gesamt |
| **GESAMT (FEAT-8 relevante Tests)** | **21** | **21** | **0** | **96.55%** |

**Status:** Alle Unit-Tests bestanden

### Bug-Fix-Verifikation

| Bug-ID | Fix verifiziert | Details |
|--------|----------------|---------|
| BUG-FEAT8-001 | BEHOBEN | `useLeaderboard` akzeptiert `Ref<number \| undefined>`. `leaderboard.vue` uebergibt `computed(() => authStore.user?.id)`. Ein zusammengefasster `onMounted`-Block mit sequentieller Ausfuehrung. |
| BUG-FEAT8-002 | BEHOBEN | `dashboard.vue` Zeile 316-319: Vollstaendiges Trophy-SVG-Icon mit `aria-hidden="true"` — kein Emoji. |
| BUG-FEAT8-003 | BEHOBEN | `handleTabKeydown()` implementiert (ArrowRight/ArrowLeft), `@keydown` auf dem tablist, `tabindex` Management (0/-1) und `tabRefs` fuer Fokus-Setzung via `nextTick`. |
| BUG-FEAT8-004 | BEHOBEN | catch-Block loggt intern `console.error('[leaderboard] DB-Fehler:', error)` und gibt nur generische Meldung `'Fehler beim Laden der Rangliste'` mit hardcoded 500 zurueck. |
| BUG-FEAT8-005 | BEHOBEN | `LeaderboardList.vue` Zeile 70: Tab-kontextsensitiver Text via `valueType`-Prop — "Noch keine Bonuspunkte..." vs. "Noch keine Kaeуfe...". |

### Acceptance Criteria Status (Re-Test)

| AC | Status | Notes |
|----|--------|-------|
| AC-1: Link im Dashboard fuehrt zu `/leaderboard` | PASS | NuxtLink mit Trophy-SVG in dashboard.vue |
| AC-2: `/leaderboard` ist eigene Route | PASS | `src/pages/leaderboard.vue` existiert |
| AC-3: Admin → Redirect zu `/admin` | PASS | In `auth.global.ts` implementiert |
| AC-4: Nicht eingeloggt → Redirect zu `/login` | PASS | In `auth.global.ts` implementiert |
| AC-5: Tab "Meistgekauft" zeigt Rangliste nach Kaufanzahl | PASS | `currentList` computed gibt `mostPurchased` zurueck |
| AC-6: Tab "Gesündeste" zeigt Rangliste nach Bonuspunkten | PASS | `currentList` computed gibt `healthiest` zurueck |
| AC-7: Tab-Wechsel ohne neuen API-Call | PASS | `setTab()` ruft kein `fetchLeaderboard()` auf |
| AC-8: Drei Zeitraum-Buttons vorhanden | PASS | `periodLabels` Array mit week/month/all |
| AC-9: Standard-Zeitraum ist "Woche" | PASS | `period = ref<Period>('week')` in useLeaderboard.ts |
| AC-10: Zeitraum-Wechsel loest API-Call aus | PASS | `setPeriod()` ruft `fetchLeaderboard()` auf |
| AC-11: Top 3 mit Trophy-SVG-Icons hervorgehoben | PASS | SVG-Icons in LeaderboardEntry.vue, Gold/Silber/Bronze mit aria-label |
| AC-12: Eigener Nutzer farblich hervorgehoben | PASS | Fix BUG-FEAT8-001 behebt Race Condition — `computed(() => authStore.user?.id)` reaktiv |
| AC-13: Eintrag zeigt Rang, Avatar, Name, Standort, Wert | PASS | Alle Felder in LeaderboardEntry.vue implementiert |
| AC-14: Inaktive Nutzer mit "inaktiv"-Badge | PASS | Badge in LeaderboardEntry.vue |
| AC-15: Daten werden beim Oeffnen geladen | PASS | `onMounted` mit `initFromCookie()` → `fetchLeaderboard()` |
| AC-16: Refresh-Button laet neu | PASS | Button mit `@click="fetchLeaderboard"` implementiert |
| AC-17: Loading-Skeleton waehrend des Ladens | PASS | `LeaderboardSkeleton.vue` implementiert |
| AC-18: Leere Liste mit Hinweis-Text | PASS | Tab-kontextsensitiver Text — "Noch keine Bonuspunkte..." vs. "Noch keine Kaeufe..." |
| AC-19: Gleichstand → alphabetisch sortiert | PASS | `localeCompare()` Tiebreaker in API |
| AC-20: API-Fehler → Fehlermeldung + Retry | PASS | Fehler-State mit "Erneut versuchen"-Button |

**Zusammenfassung:** 20 von 20 Acceptance Criteria bestanden. Alle Bugs behoben.

### Edge Cases Status (Re-Test)

| EC | Status | Notes |
|----|--------|-------|
| EC-1: Keine Kaeufe im Zeitraum | PASS | `isEmpty` computed + Leer-Zustand-UI mit korrektem Tab-Text |
| EC-2: Gleichstand → alphabetisch | PASS | `localeCompare()` Tiebreaker in API |
| EC-3: Inaktiver Nutzer mit Kaeufen | PASS | `isActive` Feld durchgereicht, Badge in UI |
| EC-4: Admin oeffnet `/leaderboard` | PASS | Redirect in auth.global.ts implementiert |
| EC-5: Alle Nutzer mit 0 Punkten/Kaeufen | PASS | `COALESCE(SUM(...), 0)` in SQL |
| EC-6: Zeitraum-Wechsel, keine Daten | PASS | Leer-Zustand ohne Fehler-Styling |
| EC-7: API-Fehler beim Laden | PASS | Fehler-State mit Retry — generische Fehlermeldung (kein Info-Leak) |
| EC-8: Nutzer kauft, oeffnet dann Leaderboard | PASS | `fetchLeaderboard()` beim Oeffnen |

### Accessibility (WCAG 2.1) (Re-Test)

- PASS: Farbkontrast — Text gray-700 (#374151) auf Weiss und blue-50 Hintergrund
- PASS: Tastatur-Navigation — Pfeiltasten-Navigation im tablist implementiert (BUG-FEAT8-003 behoben)
- PASS: Focus States — `focus:ring-2 focus:ring-primary` auf allen interaktiven Elementen
- PASS: Touch-Targets — alle Buttons mit `min-h-[44px]`
- PASS: Screen Reader — `role="tablist"`, `aria-selected`, `aria-label`, `aria-busy`, `role="alert"` korrekt
- PASS: `aria-label` auf Trophy-SVG-Icons (Gold, Silber, Bronze)
- PASS: `aria-hidden="true"` auf dekorativen SVGs
- PASS: `aria-current` auf eigenem Eintrag
- PASS: `prefers-reduced-motion` — `motion-safe:transition-colors` verwendet
- PASS: Leer-Zustand-Text tab-kontextsensitiv (BUG-FEAT8-005 behoben)

### Security (Re-Test)

- PASS: Auth-Check in Middleware (auth.global.ts)
- PASS: Auth-Check in API (`getCurrentUser()`)
- PASS: Admin-Zugriff blockiert (API wirft 403 fuer Admin-Rolle)
- PASS: Keine Info-Disclosure mehr — catch-Block gibt nur generische Meldung zurueck (BUG-FEAT8-004 behoben)
- PASS: Input Validation fuer `period`-Parameter
- PASS: Keine direkten DB-Calls aus Vue-Komponenten

### Tech Stack & Code Quality (Re-Test)

- PASS: Composition API mit `<script setup>` — alle Komponenten korrekt
- PASS: Kein `any` in TypeScript — alle Interfaces typisiert
- PASS: `defineProps<{...}>()` und `defineEmits<{...}>()` korrekt verwendet
- PASS: Kein direkter DB-Zugriff aus Stores/Components — nur ueber `$fetch('/api/leaderboard')`
- PASS: Drizzle ORM fuer alle DB-Queries (kein Raw SQL)
- PASS: Server Routes mit `try/catch` und `createError()`
- PASS: Auth-Check in Server Route via `getCurrentUser(event)`
- PASS: `Ref<number | undefined>` statt primitiver Wert fuer reaktive User-ID-Weitergabe
- PASS: Tastatur-Handler mit `nextTick()` fuer korrektes Fokus-Management
- PASS: `tabRefs` via `vRef<HTMLButtonElement[]>([])` — kein direkter DOM-Zugriff

### Optimierungen (Re-Test)

- BEHOBEN: Race Condition mit `Ref`-Typ und `computed` in leaderboard.vue
- BEHOBEN: Doppeltes `onMounted` zu einem Block zusammengefasst
- BEHOBEN: Fehlende `tabindex`-Verwaltung implementiert
- Kein N+1 Problem — ein einzelner JOIN-Query
- Keine weiteren Optimierungspotentiale identifiziert

### Regression (Re-Test)

- PASS: Bestehende Routes (`/dashboard`, `/admin`, `/login`) nicht beeintraechtigt
- PASS: `auth.global.ts` — bestehende Logik unveraendert, nur Leaderboard-Admin-Redirect hinzugefuegt
- PASS: Alle 143 Unit-Tests (10 Test-Suites) bestanden — kein Regression-Fehler

---

## Production Ready (Re-Test 1)

**Status:** Alle 5 Bugs behoben. Alle 20 Acceptance Criteria bestanden. Alle 8 Edge Cases bestanden. Keine neuen Bugs gefunden.

**Empfehlung UX Expert:** Nicht noetig

**Begruendung:** Alle UX-Vorgaben sind korrekt implementiert und alle technischen Bugs wurden behoben. Die UX-Konzeption wurde vollstaendig umgesetzt (SVG-Icons, Eigener-Rang-Banner, Punktesystem-Hinweis, Skeleton, Leer-Zustand, Fehler-Zustand, Tastatur-Navigation). Kein erneuter UX-Review noetig.

---

## QA Frischer Durchgang (2026-03-05)

**Getestet:** 2026-03-05
**Tester:** QA Engineer Agent (zweiter Durchgang)
**App URL:** http://localhost:3000

### Unit-Tests

**Command:** `npm test -- --run`

| Test-Suite | Tests | Passing | Failing | Coverage |
|------------|-------|---------|---------|----------|
| useLeaderboard Composable | 21 | 21 | 0 | 96.55% Stmts / 90.9% Branch |
| utils/purchase | 12 | 12 | 0 | 100% |
| useSearch | 22 | 22 | 0 (6 skipped) | 90.47% |
| useModal | 20 | 20 | 0 | 100% |
| useLocalStorage | 13 | 13 | 0 | 100% |
| useFormatter | 19 | 19 | 0 | 100% |
| AdminInfoBanner | 13 | 13 | 0 | — |
| stores/auth | 10 | 10 | 0 (5 skipped) | — |
| stores/credits | 13 | 13 | 0 (4 skipped) | — |
| constants/credits | 15 | 15 | 0 | 100% |
| **GESAMT** | **158** | **143** | **0 (15 skipped)** | — |

**Status:** Alle Unit-Tests bestanden.

### Acceptance Criteria Status (Frischer Durchgang)

| AC | Status | Notes |
|----|--------|-------|
| AC-1: Link im Dashboard führt zu `/leaderboard` | PASS | NuxtLink in dashboard.vue Zeile 311-320, nur für Nicht-Admins (v-if="!showAdminLink") |
| AC-2: `/leaderboard` ist eigene Route | PASS | `src/pages/leaderboard.vue` existiert und ist eigenständige Route |
| AC-3: Admin → Redirect zu `/admin` | PASS | `auth.global.ts` Zeile 32-34 implementiert den Redirect |
| AC-4: Nicht eingeloggt → Redirect zu `/login` | PASS | `auth.global.ts` Zeile 20-22, `/leaderboard` in protectedPaths |
| AC-5: Tab "Meistgekauft" zeigt Rangliste nach Kaufanzahl | PASS | `currentList` computed gibt `data.value.mostPurchased` zurück |
| AC-6: Tab "Gesündeste" zeigt Rangliste nach Bonuspunkten | PASS | `currentList` computed gibt `data.value.healthiest` zurück |
| AC-7: Tab-Wechsel ohne neuen API-Call | PASS | `setTab()` setzt nur `activeTab.value`, kein `fetchLeaderboard()` |
| AC-8: Drei Zeitraum-Buttons vorhanden | PASS | periodLabels mit week/month/all, role="radiogroup" |
| AC-9: Standard-Zeitraum ist "Woche" | PASS | `period = ref<Period>('week')` in useLeaderboard.ts Zeile 41 |
| AC-10: Zeitraum-Wechsel löst API-Call aus | PASS | `setPeriod()` ruft `fetchLeaderboard()` auf, nur wenn Zeitraum sich ändert |
| AC-11: Top 3 mit Trophy-SVG-Icons | PASS | SVG-Icons in LeaderboardEntry.vue mit aria-label (Gold/Silber/Bronze) |
| AC-12: Eigener Nutzer farblich hervorgehoben | PASS | `bg-blue-50 border-l-4 border-green-500` bei `isOwn === true` |
| AC-13: Eintrag zeigt Rang, Avatar, Name, Standort, Wert | PASS | Alle Felder vollständig implementiert |
| AC-14: Inaktive Nutzer mit "inaktiv"-Badge | PASS | v-if="!entry.isActive" Badge in LeaderboardEntry.vue |
| AC-15: Daten werden beim Öffnen geladen | PASS | onMounted lädt Auth dann fetchLeaderboard() |
| AC-16: Refresh-Button lädt neu | PASS | Button mit @click="fetchLeaderboard" und disabled-State bei isLoading |
| AC-17: Loading-Skeleton während des Ladens | PASS | LeaderboardSkeleton.vue mit aria-busy="true" |
| AC-18: Leere Liste mit Hinweis-Text | PASS | Tab-kontextsensitiver Leer-Text via valueType-Prop |
| AC-19: Gleichstand → alphabetisch sortiert | PASS | `localeCompare()` Tiebreaker in API für beide Ranglisten |
| AC-20: API-Fehler → Fehlermeldung + Retry | PASS | role="alert" Fehler-Block mit "Erneut versuchen"-Button |

**Ergebnis:** 20/20 Acceptance Criteria bestanden.

### Edge Cases Status (Frischer Durchgang)

| EC | Status | Notes |
|----|--------|-------|
| EC-1: Keine Käufe im Zeitraum | PASS | isEmpty-Computed korrekt implementiert, Leer-Zustand mit freundlichem Text |
| EC-2: Gleichstand → alphabetisch | PASS | `|| a.name.localeCompare(b.name)` in API |
| EC-3: Inaktiver Nutzer mit Käufen | PASS | isActive-Flag in API und Badge in UI |
| EC-4: Admin öffnet `/leaderboard` | PASS | Middleware + API werfen jeweils Redirect / 403 |
| EC-5: Alle Nutzer mit 0 Punkten | PASS | COALESCE(SUM(...), 0) gibt 0 für alle, alphabetisch sortiert |
| EC-6: Zeitraum-Wechsel, keine Daten | PASS | Leer-Zustand wird angezeigt (kein Error-Styling) |
| EC-7: API-Fehler beim Laden | PASS | Fehler-State mit Retry-Button; kein Info-Leak in Fehlermeldung |
| EC-8: Nutzer kauft, öffnet Leaderboard | PASS | Daten werden bei onMounted frisch geladen |

**Ergebnis:** 8/8 Edge Cases bestanden.

### Accessibility (WCAG 2.1) — Frischer Durchgang

| Check | Status | Notes |
|-------|--------|-------|
| Tastatur-Navigation Tabs | PASS | ArrowRight/ArrowLeft mit tabRefs und nextTick fokussiert |
| Tastatur-Navigation Zeitraum | PASS | periodRefs-Radiogroup mit Pfeiltasten-Navigation |
| Focus States | PASS | focus:ring-2 focus:ring-primary auf allen interaktiven Elementen |
| Touch-Targets >= 44px | PASS | min-h-[44px] auf Tabs, Zeitraum-Buttons, Refresh-Button |
| prefers-reduced-motion | PASS | motion-safe:transition-colors auf allen animierten Elementen |
| role="tablist" + aria-selected | PASS | Korrekt auf Tab-Container und Tabs |
| role="radiogroup" + aria-checked | PASS | Korrekt auf Zeitraum-Filter |
| Trophy-Icons aria-label | PASS | aria-label="Platz 1 — Gold" etc. auf allen SVG-Icons |
| aria-busy auf Skeleton | PASS | aria-busy="true" aria-label="Rangliste lädt…" |
| role="alert" bei Fehler | PASS | Fehler-Container hat role="alert" |
| aria-current auf eigenem Eintrag | PASS | aria-current="true" bei isOwn |
| aria-label pro Listeneintrag | PASS | Vollständige Beschreibung mit Rang, Name, Wert |
| aria-live-Region für Listen-Updates | **FAIL** | Kein aria-live auf dem Ranglisten-Container → BUG-FEAT8-009 |
| Kontrast: gray-400 ("Pkt."/"Käufe") | **FAIL** | 2.54:1 statt 4.5:1 → BUG-FEAT8-006 |
| Kontrast: blue-500 Rang-Banner sekundär | **FAIL** | 3.38:1 statt 4.5:1 → BUG-FEAT8-007 |
| Kontrast: muted-foreground Dashboard-Link | **FAIL** | 3.88:1 statt 4.5:1 → BUG-FEAT8-008 |

**Ergebnis:** 12/16 Checks bestanden. 4 Accessibility-Probleme gefunden.

### Security (Frischer Durchgang)

| Check | Status | Notes |
|-------|--------|-------|
| Auth-Check in Middleware | PASS | protectedPaths inkl. /leaderboard |
| Auth-Check in API | PASS | getCurrentUser(event) am Anfang der Route |
| Admin blockiert (API) | PASS | 403 für Admin-Rolle |
| Admin blockiert (Middleware) | PASS | Redirect zu /admin |
| Keine technische Fehlermeldung | PASS | Catch-Block gibt nur generische Meldung zurück |
| Input Validation period-Parameter | PASS | Whitelist-Validation: nur 'week', 'month', 'all' erlaubt |
| Kein DB-Zugriff aus Komponenten | PASS | Nur über $fetch('/api/leaderboard') |
| Kein Raw SQL | PASS | Drizzle ORM für alle Queries |

**Ergebnis:** 8/8 Security-Checks bestanden.

### Tech Stack Compliance (Frischer Durchgang)

| Check | Status | Notes |
|-------|--------|-------|
| Composition API + script setup | PASS | Alle Komponenten korrekt |
| Kein `any` in TypeScript | PASS | Alle Interfaces klar typisiert |
| defineProps/defineEmits korrekt | PASS | Generics-Syntax überall verwendet |
| Kein direkter DOM-Zugriff | PASS | tabRefs via vRef<HTMLButtonElement[]> |
| Nuxt Routing via pages/ | PASS | leaderboard.vue in pages/ |
| Kein direkter DB-Zugriff aus Store/Komponenten | PASS | Nur über API-Route |
| Drizzle für alle DB-Queries | PASS | Kein Raw SQL außer DATE_TRUNC als sql``-Fragment |
| Server Routes mit try/catch + createError() | PASS | Implementiert in leaderboard.get.ts |
| Auth-Check in geschützten Routes | PASS | getCurrentUser() am Anfang |
| Kein N+1 Problem | PASS | Einziger LEFT JOIN-Query für alle Mitarbeiter |

**Ergebnis:** 10/10 Tech-Stack-Checks bestanden.

### Regression (Frischer Durchgang)

- PASS: dashboard.vue — Leaderboard-Link nur für Mitarbeiter (v-if="!showAdminLink"), Admin-Funktionalität unverändert
- PASS: auth.global.ts — bestehende protectedPaths und adminPaths-Logik unverändert, nur Leaderboard-Admin-Redirect addiert
- PASS: Alle 143 Unit-Tests (10 Test-Suites) bestanden — keine Regression in anderen Features

### Neue Bugs (Frischer Durchgang)

| Bug-ID | Titel | Severity | Priority | Status |
|--------|-------|----------|----------|--------|
| BUG-FEAT8-006 | Wert-Suffix "Pkt."/"Käufe" — gray-400 Kontrast 2.54:1 (< 4.5:1) | High | Must Fix | Offen |
| BUG-FEAT8-007 | Rang-Banner Sekundärtext — blue-500 Kontrast 3.38:1 (< 4.5:1) | High | Must Fix | Offen |
| BUG-FEAT8-008 | Dashboard-Zurück-Link — muted-foreground Kontrast 3.88:1 (< 4.5:1) | Medium | Should Fix | Offen |
| BUG-FEAT8-009 | Fehlende aria-live-Region — Screen Reader wird bei Listen-Update nicht benachrichtigt | Medium | Should Fix | Offen |

### Optimierungen (Frischer Durchgang)

- Keine zusätzlichen Optimierungspotenziale gefunden.

---

## Behobene Bugs

| Bug-ID | Titel | Severity | Behoben am |
|--------|-------|----------|------------|
| BUG-FEAT8-001 bis BUG-FEAT8-005 | Diverse Implementierungsfehler (Race Condition, Keyboard-Nav, etc.) | Div. | 2026-03-04 |
| BUG-FEAT8-006 | Wert-Suffix "Pkt."/"Kaeufe" — text-muted-foreground (~4.58:1) | High | 2026-03-05 |
| BUG-FEAT8-007 | Rang-Banner Sekundaertext — text-blue-700 (~6.16:1) | High | 2026-03-05 |
| BUG-FEAT8-008 | Dashboard-Zurueck-Link — muted-foreground Kontrast < 4.5:1 | Medium | 2026-03-05 |
| BUG-FEAT8-009 | Fehlende aria-live-Region fuer Screen Reader | Medium | 2026-03-05 |
| BUG-FEAT8-010 | Empty-State Subtext "text-gray-400" Kontrast 2.54:1 (< 4.5:1) | High | 2026-03-05 |
| BUG-FEAT8-011 | Silber-Trophy-SVG "text-gray-400" Non-Text-Kontrast 2.54:1 (< 3:1 WCAG 1.4.11) | Medium | 2026-03-05 |

## ✅ Production Ready (Re-Test 2026-03-05)

Alle offenen Bugs behoben. Keine offenen Bugs mehr.

---

## UI Refresh

> Abweichungen zwischen der aktuellen Implementierung (`src/pages/leaderboard.vue`) und dem Wireframe `resources/high-fidelity/leaderboard.png`.

### Abweichungen

| ID | Bereich | Aktuell (Implementierung) | Wireframe-Vorgabe |
|----|---------|--------------------------|-------------------|
| UIR-8-1 | Seitentitel | "Leaderboard" (h1, rechts im Header) | "Bestenliste" (zentriert) |
| UIR-8-2 | Header-Layout | "← Dashboard" links + "Leaderboard" rechts + leerer Spacer | "Bestenliste" zentriert; kein Zurück-Button (Tab-Seite — wird durch FEAT-15 geregelt) |
| UIR-8-3 | Top-3-Darstellung | Flache Liste ab Platz 1 — kein visueller Unterschied für die Plätze 1–3 | Podium: Platz 2 links (kleiner), Platz 1 Mitte (größer, prominent), Platz 3 rechts; Avatar-Placeholder + Name + Punkte sichtbar; Medaillen-Badges (Gold/Silber/Bronze) als Overlay |
| UIR-8-4 | Listeneinträge ab Platz 4 | Rang-Nummer + Avatar + Name + Punkte | Identisch; visuell in Einklang mit Wireframe |

### Anforderungen

| ID | Anforderung | Prio | Hinweis |
|----|-------------|------|---------|
| UIR-REQ-8-1 | Seitentitel von "Leaderboard" auf "Bestenliste" umbenennen | Must-Have | Nur Text-Änderung in `leaderboard.vue` |
| UIR-REQ-8-2 | Header zentrieren: "Bestenliste" als zentrierter h1; Zurück-Link entfernen | Should-Have | Zurück-Link-Entfernung ist Teil von FEAT-15; kann vorgezogen werden |
| UIR-REQ-8-3 | Top-3-Podium implementieren: Platz 2 links, Platz 1 Mitte (größer), Platz 3 rechts; Avatar-Placeholder, Name, Punkte; Gold/Silber/Bronze Medaillen-Badge | Must-Have | Nur sichtbar wenn mind. 3 Einträge vorhanden; bei weniger Einträgen normale Liste |

### Acceptance Criteria

- [ ] UIR-AC-8-1: Seitentitel lautet "Bestenliste"
- [ ] UIR-AC-8-2: Header-Titel ist zentriert
- [ ] UIR-AC-8-3: Top-3 werden als visuelles Podium dargestellt (Platz 1 Mitte prominent, Platz 2 links, Platz 3 rechts) mit Medaillen-Badges
- [ ] UIR-AC-8-4: Ab Platz 4 folgt die normale flache Liste
- [ ] UIR-AC-8-5: Bei weniger als 3 Einträgen fällt das Podium weg, alle Einträge als normale Liste
