# Konfigurierbarer Nachbestellschwellwert

**Feature-ID:** FEAT-22
**Status:** Implementiert (2 Bugs offen — NOT Production Ready)
**Getestet am:** 2026-03-13

---

## Zusammenfassung

FEAT-22 macht den Nachbestellschwellwert pro Produkt konfigurierbar. Bisher war der Wert für alle Produkte fest auf 3 gesetzt — jetzt kann jedes Produkt seinen eigenen Schwellwert haben. Das ermöglicht eine differenzierte Nachbestellplanung: Hochnachfrage-Produkte können früher warnen, Nischenprodukte später.

---

## Was wurde gemacht

### Hauptfunktionen

- Neues Datenbankfeld `stockThreshold` in der Produkttabelle (Ganzzahl, Standard: 3)
- Inline-Bearbeitung des Schwellwerts direkt in der Bestandsverwaltung (`/admin/inventory`)
- Schwellwert-Feld im Produkt-Erstellen- und Bearbeiten-Modal (`/admin/products`)
- Automatische Löschung von Low-Stock-Warnungen wenn Bestand über den Schwellwert steigt
- Neuer Admin-Tab "Bestand" in der mobilen Navigation

### Benutzer-Flow (Admin)

1. Admin navigiert zu /admin/inventory (über "Bestand"-Tab in der Fusszeile)
2. Tabelle zeigt alle Produkte mit aktuellem Bestand, Schwellwert und Status-Badge
3. Admin ändert Schwellwert direkt in der Tabelle (Zahleneingabe)
4. Klick auf "Speichern" — Erfolgsmeldung erscheint, Tabelle wird sofort aktualisiert
5. Status-Badge (OK / Niedrig / Leer) aktualisiert sich entsprechend dem neuen Schwellwert

Alternativ beim Anlegen/Bearbeiten eines Produkts:

1. Admin öffnet Produkt-Erstellen- oder Bearbeiten-Modal in /admin/products
2. Feld "Nachbestellschwellwert" ist vorausgefüllt mit 3 (oder dem gespeicherten Wert)
3. Wert ändern und Produkt speichern

---

## Wie es funktioniert

### Für Benutzer

Wenn ein Mitarbeiter ein Produkt kauft und der Bestand danach den Schwellwert unterschreitet (oder genau trifft), erscheint automatisch eine Warnung in der Admin-Glocke. Der Admin sieht die Warnung im Notification-Dropdown und kann in der Bestandsverwaltung direkt nachbestellen.

Die Status-Badges in der Bestandsverwaltung zeigen:
- **OK** (grün): Bestand > Schwellwert
- **Niedrig** (gelb): Bestand <= Schwellwert, aber > 0
- **Leer** (rot): Bestand = 0

### Technische Umsetzung

Das Feature erweitert das bestehende `products`-Datenbankfeld um eine Spalte. Keine neue Tabelle war nötig. Der Schwellwert wird in drei Kontexten verwendet:

1. **Bestandsverwaltung-API** (`/api/admin/inventory`): Liest und schreibt den Schwellwert, berechnet Status-Badges serverseitig
2. **Kaufprozess** (`/api/purchases` POST): Prüft nach jedem Kauf ob der neue Bestand den produktspezifischen Schwellwert unterschreitet
3. **Produkt-API** (`/api/admin/products`): Speichert den Schwellwert beim Anlegen und Bearbeiten

**Verwendete Technologien:**
- Drizzle ORM für Datenbankzugriff (Schema-Erweiterung + Migration)
- Nuxt 3 Server API Routes
- Vue 3 Composition API mit `<script setup>`
- Tailwind CSS für Status-Badges und Tabellen-Styling
- Teenyicons für das Archiv-Icon im neuen "Bestand"-Tab

---

## Neue Seite: /admin/inventory

Die Bestandsverwaltungsseite wurde neu erstellt (war vorher nur als API vorhanden). Sie zeigt:

- **Statistik-Karten** oben: Gesamtanzahl, Ausreichend, Niedrig, Leer
- **Suchfeld** und **Status-Filter** (Alle / OK / Niedrig / Leer)
- **Tabelle** mit Produktbild, Name, Kategorie, Bestand (editierbar), Schwellwert (editierbar), Status-Badge, Speichern-Button
- **Fehlermeldungen** inline per Produkt bei ungültigem Schwellwert

---

## Abhängigkeiten

- FEAT-12 (Bestandsverwaltung) — Inventory-API war bereits vorhanden, wurde erweitert
- FEAT-13 (Low-Stock-Benachrichtigungen) — Trigger-Logik wurde auf den konfigurierbaren Schwellwert umgestellt

---

## Getestet

- Acceptance Criteria: 9/10 bestanden (AC-4 durch BUG-FEAT22-002 betroffen)
- Edge Cases: 6/6 bestanden
- Unit-Tests: 302/302 bestanden
- E2E-Tests: 80/80 bestanden
- Accessibility: WCAG 2.1 konform
- Security: Keine Issues gefunden
- Regression: Keine bestehenden Features beeinträchtigt

---

## Offene Bugs

| Bug-ID | Beschreibung | Priorität |
|--------|-------------|-----------|
| BUG-FEAT22-001 | AdminSidebar (Desktop) fehlt "Bestand"-Tab — Seite nur via URL erreichbar | Must Fix |
| BUG-FEAT22-002 | Bearbeiten-Modal zeigt stockThreshold immer als 3 statt gespeichertem Wert | Must Fix |

---

## Nächste Schritte

- Bug-Fixes für BUG-FEAT22-001 und BUG-FEAT22-002 durch Developer
- Nach Fix: Regression-Test (E2E + manuelle Verifikation der beiden Bugs)
- Optional: E2E-Tests in `tests/e2e/feat22-schwellwert.spec.ts` implementieren (laut Feature-Spec vorgesehen, aber noch nicht vorhanden)
