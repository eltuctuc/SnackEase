# BUG-FEAT10-009: handleDrop in products.vue ruft handleImageSelect doppelt auf

**Feature:** FEAT-10 Erweitertes Admin-Dashboard
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-06
**App URL:** http://localhost:3000/admin/products

---

## Beschreibung

In `src/pages/admin/products.vue` ist die `handleDrop`-Funktion fehlerhaft implementiert. Sie erstellt zunachst ein `fakeEvent`-Objekt (Zeile 208), verwendet es aber nicht - stattdessen wird ein zweites neues Objekt an `handleImageSelect` uebergeben (Zeile 209). Das urspruengliche `fakeEvent` ist toter Code. Ausserdem hat der Drop-Handler eine potenziell fehlerhafte Logik, weil `handleImageSelect` intern `event.target as HTMLInputElement` castet, was bei einem synthetischen Event-Objekt fehlschlagen kann.

**Betroffene Datei:** `src/pages/admin/products.vue` (Zeile 203-210)

```typescript
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  const fakeEvent = { target: { files: [file] } } as unknown as Event  // TOTER CODE - wird nicht verwendet
  handleImageSelect({ target: { files: [file] } } as unknown as Event)  // Zweiter identischer Event
}
```

Das synthetische Event-Objekt hat kein echtes `FileList`-Objekt - `target.files?.[0]` liefert `undefined` in manchen Browsern, weil ein normales Array kein `FileList` ist. Tatsaechlich funktioniert `handleImageSelect` jedoch durch `target.files?.[0]` mit dem Array-Zugriff, weil JavaScript Arrays ebenfalls Index-Zugriff per `[0]` unterstuetzen.

Die eigentliche Fehlerquelle: Der Code hat redundante Zeile 208 (toter Code) und der Drag-und-Drop koennte in Browsern mit strikter FileList-Pruefung fehlschlagen.

## Steps to Reproduce

1. /admin/products aufrufen
2. "Neues Produkt" klicken
3. Eine Bild-Datei per Drag & Drop in den Upload-Bereich ziehen

## Expected Behavior

Bild wird korrekt als Vorschau angezeigt und fuer Upload vorbereitet.

## Actual Behavior

In den meisten Browsern (Chrome, Firefox) funktioniert es zufallig korrekt, da JavaScript-Arrays Index-Zugriff unterstuetzen. In Safari oder Edge mit strikterem Type-Checking koennte die Datei-Auswahl per Drag & Drop stillschweigend fehlschlagen. Zusaetzlich ist Zeile 208 toter Code, der Code-Qualitaet verschlechtert.

## Environment

- Browser: Safari (potenziell), alle anderen als "funktioniert zufallig"
- Device: Desktop
- OS: macOS

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-10: REQ-16 (Bild-Upload fuer Produkte)

---

## Attachments

- Screenshots: keine
- Logs: keine

## Loesungsvorschlag

Die `handleDrop`-Funktion sollte die Datei direkt aus `event.dataTransfer.files[0]` nehmen und direkt verarbeiten (Typ-Pruefung, Groessen-Pruefung, Preview generieren), statt ein synthetisches Event-Objekt zu konstruieren.
