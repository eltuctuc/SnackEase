/**
 * Unit-Tests für ILIKE-Escaping-Helper (FEAT-19)
 *
 * Testet:
 * - escapeIlikeTerm: Sonderzeichen-Escaping, Trimming, Längen-Limit
 *
 * Ziel-Coverage: 100% für escapeIlikeTerm (zentrale Sicherheitslogik)
 */

import { describe, it, expect } from 'vitest'
import { escapeIlikeTerm } from '~/server/utils/search'

describe('escapeIlikeTerm', () => {
  // ==========================================
  // Leere und Whitespace-Eingaben (EC-2)
  // ==========================================

  it('gibt null zurück für leeren String', () => {
    expect(escapeIlikeTerm('')).toBeNull()
  })

  it('gibt null zurück für nur Leerzeichen (EC-2)', () => {
    expect(escapeIlikeTerm('   ')).toBeNull()
  })

  it('gibt null zurück für Tab und Newline', () => {
    expect(escapeIlikeTerm('\t\n')).toBeNull()
  })

  // ==========================================
  // Trimming (EC-2)
  // ==========================================

  it('entfernt führende Leerzeichen', () => {
    expect(escapeIlikeTerm('  apfel')).toBe('apfel')
  })

  it('entfernt nachfolgende Leerzeichen', () => {
    expect(escapeIlikeTerm('apfel  ')).toBe('apfel')
  })

  it('entfernt führende und nachfolgende Leerzeichen gleichzeitig', () => {
    expect(escapeIlikeTerm('  apfel  ')).toBe('apfel')
  })

  // ==========================================
  // Normaler Suchbegriff
  // ==========================================

  it('gibt normalen Suchbegriff unverändert zurück', () => {
    expect(escapeIlikeTerm('Apfel')).toBe('Apfel')
  })

  it('gibt Suchbegriff mit Bindestrich unverändert zurück', () => {
    expect(escapeIlikeTerm('Protein-Riegel')).toBe('Protein-Riegel')
  })

  // ==========================================
  // Sonderzeichen-Escaping (EC-1)
  // ==========================================

  it('escaped Prozentzeichen % → \\%', () => {
    expect(escapeIlikeTerm('100%')).toBe('100\\%')
  })

  it('escaped Underscore _ → \\_', () => {
    expect(escapeIlikeTerm('test_produkt')).toBe('test\\_produkt')
  })

  it('escaped Backslash \\ → \\\\', () => {
    expect(escapeIlikeTerm('a\\b')).toBe('a\\\\b')
  })

  it('escaped mehrere Sonderzeichen gleichzeitig', () => {
    expect(escapeIlikeTerm('%_\\')).toBe('\\%\\_\\\\')
  })

  it('escaped & (kein Sonderzeichen in ILIKE) unverändert', () => {
    expect(escapeIlikeTerm('Kekse & Riegel')).toBe('Kekse & Riegel')
  })

  it('escapt Backslash vor Prozentzeichen korrekt (Reihenfolge)', () => {
    // "\\%" soll zu "\\\\\\%" werden (Backslash escaped, dann Prozent escaped)
    expect(escapeIlikeTerm('\\%')).toBe('\\\\\\%')
  })

  // ==========================================
  // Längen-Limit (EC-3)
  // ==========================================

  it('kürzt Suchbegriff auf 100 Zeichen (EC-3)', () => {
    const longTerm = 'a'.repeat(150)
    const result = escapeIlikeTerm(longTerm)
    expect(result).toHaveLength(100)
    expect(result).toBe('a'.repeat(100))
  })

  it('lässt Suchbegriff mit genau 100 Zeichen unverändert', () => {
    const exactTerm = 'b'.repeat(100)
    expect(escapeIlikeTerm(exactTerm)).toBe(exactTerm)
  })

  it('lässt Suchbegriff mit weniger als 100 Zeichen unverändert', () => {
    const shortTerm = 'Apfel'
    expect(escapeIlikeTerm(shortTerm)).toBe(shortTerm)
  })

  it('unterstützt eigenes maxLength-Argument', () => {
    const result = escapeIlikeTerm('abcdefghij', 5)
    expect(result).toBe('abcde')
    expect(result).toHaveLength(5)
  })

  it('Längen-Limit gilt nach Trimming, nicht vor', () => {
    // Nach Trim: 5 Zeichen "apfel", maxLength=3 → "apf"
    const result = escapeIlikeTerm('  apfel  ', 3)
    expect(result).toBe('apf')
  })

  // ==========================================
  // Kombination: Trim + Escaping + Limit
  // ==========================================

  it('kombiniert Trim + Escaping + Limit korrekt', () => {
    // Input: "  test%produkt  ", maxLength=8
    // Nach Trim: "test%produkt" (12 Zeichen)
    // Nach Limit auf 8: "test%pro" (8 Zeichen)
    // Nach Escaping: "test\%pro" (das % wird zu \%, daher 9 Zeichen im Ergebnis)
    const result = escapeIlikeTerm('  test%produkt  ', 8)
    expect(result).toBe('test\\%pro')
  })
})
