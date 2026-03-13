/**
 * search.ts — Utility-Funktionen für die Suche (FEAT-19)
 *
 * Zentrale Logik für Suchbegriff-Verarbeitung.
 * Wird von products/index.get.ts importiert.
 * Exportiert für Unit-Tests in tests/utils/search.test.ts.
 */

// ========================================
// ILIKE-ESCAPING
// ========================================

/**
 * Escaped Sonderzeichen im Suchbegriff für PostgreSQL ILIKE.
 * Verhindert ungewollte Wildcard-Interpretation.
 *
 * Escaping-Reihenfolge (wichtig!):
 * 1. `\` → `\\` (muss zuerst, sonst werden später eingefügte Backslashes nochmals escaped)
 * 2. `%` → `\%`
 * 3. `_` → `\_`
 *
 * Ebenfalls angewendet:
 * - trim(): EC-2: führende/folgende Leerzeichen entfernen
 * - slice(0, maxLength): EC-3: Suchbegriff auf maxLength Zeichen kürzen
 *
 * @param term - Roher Suchbegriff vom Client
 * @param maxLength - Maximale Zeichenlänge (Standard: 100 Zeichen, EC-3)
 * @returns Bereinigter, geescapeter Suchbegriff oder null wenn leer/nur-Whitespace
 */
export function escapeIlikeTerm(term: string, maxLength = 100): string | null {
  const trimmed = term.trim() // EC-2: führende/folgende Leerzeichen entfernen
  if (!trimmed) return null

  const limited = trimmed.slice(0, maxLength) // EC-3: max 100 Zeichen
  const escaped = limited
    .replace(/\\/g, '\\\\') // Backslash zuerst (vor % und _!)
    .replace(/%/g, '\\%')   // Prozentzeichen
    .replace(/_/g, '\\_')   // Underscore

  return escaped
}
