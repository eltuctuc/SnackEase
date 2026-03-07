# BUG-FEAT10-008: Produkt-Rollback bei fehlgeschlagenem Bild-Upload loescht nicht wirklich

**Feature:** FEAT-10 Erweitertes Admin-Dashboard
**Severity:** Medium
**Priority:** Should Fix
**Gefunden am:** 2026-03-06
**App URL:** http://localhost:3000

---

## Beschreibung

Wenn ein neues Produkt angelegt wird und der anschliessende Bild-Upload fehlschlaegt (EC-3), versucht der Frontend-Code den Rollback durch Aufruf von `DELETE /api/admin/products/:id`. Dieser Endpunkt fuehrt jedoch nur ein Soft-Delete durch (`isActive = false`) statt das Produkt wirklich zu loeschen.

**Resultat:** Nach einem fehlgeschlagenen Bild-Upload existiert ein deaktiviertes "Geister-Produkt" ohne Bild in der Datenbank, das in der Admin-Produktliste unter "Inaktiv" sichtbar ist und manuell geloescht werden muss.

**Betroffene Datei:** `src/pages/admin/products.vue` (Zeile 295-299), `src/server/api/admin/products/[id].delete.ts`

```typescript
// products.vue Zeile 294-299: Rollback-Versuch bei Bild-Upload-Fehler
if (!isEditMode.value) {
  try {
    await $fetch(`/api/admin/products/${savedProductId}`, { method: 'DELETE' })
  } catch {
    // Rollback-Fehler ignorieren, Hauptfehlermeldung zeigen
  }
}
```

```typescript
// [id].delete.ts: Soft-Delete statt echter Loeschung
await db
  .update(products)
  .set({ isActive: false })
  .where(eq(products.id, id));
```

## Steps to Reproduce

1. /admin/products aufrufen
2. "Neues Produkt" klicken
3. Name, Preis, Kategorie auswaehlen
4. Bild-Upload mit einer validen Bild-Datei vorbereiten
5. Produkt speichern (dabei Netzwerkfehler oder Server-Fehler beim Bild-Upload simulieren)
6. Fehlermeldung erscheint: "Produkt wurde nicht gespeichert"
7. Admin-Produktliste auf "Inaktiv" filtern

## Expected Behavior

Nach dem Rollback: Das Produkt ist **vollstaendig aus der Datenbank entfernt** - kein deaktivierter Eintrag verbleibt.

## Actual Behavior

Das Produkt verbleibt als inaktiver Eintrag (`isActive = false`) in der Datenbank. Es ist im Admin-Dashboard unter "Inaktiv" sichtbar.

## Environment

- Browser: Alle Browser
- Device: Desktop
- OS: macOS

---

## Abhängigkeiten

### Zu anderen Bugs
- Keine

### Zu anderen Features
- FEAT-10: EC-3 (Bild-Upload fehlschlaegt → Produkt wird nicht gespeichert)

---

## Attachments

- Screenshots: keine
- Logs: keine

## Loesungsvorschlag

Im Backend einen separaten Admin-only Endpunkt fuer echtes Loeschen bereitstellen (z.B. `DELETE` mit Query-Parameter `?hard=true`), oder die Rollback-Logik direkt serverseitig in einer Transaktion durchfuehren: Produkt anlegen + Bild hochladen in einer atomaren Operation.
