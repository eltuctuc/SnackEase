/**
 * useFormatter - Composable für Formatierungs-Funktionen
 * 
 * @description
 * Sammlung von wiederverwendbaren Formatter-Funktionen:
 * - Preis-Formatierung (z.B. "2.50 €")
 * - Datums-Formatierung (z.B. "04.03.2026")
 * - Zahlen-Formatierung (z.B. "1.234,56")
 * - Währungs-Formatierung mit Intl.NumberFormat
 * 
 * @example
 * ```vue
 * <script setup>
 * const { formatPrice, formatDate, formatNumber } = useFormatter()
 * 
 * const price = formatPrice("12.5") // "12,50 €"
 * const date = formatDate("2026-03-04T10:30:00Z") // "04.03.2026"
 * const number = formatNumber(1234.56) // "1.234,56"
 * </script>
 * ```
 * 
 * @example Mit Custom-Locale
 * ```vue
 * <script setup>
 * const { formatPrice } = useFormatter({ locale: 'en-US' })
 * 
 * const price = formatPrice("12.5") // "$12.50"
 * </script>
 * ```
 */

/**
 * Optionen für useFormatter Composable
 */
export interface UseFormatterOptions {
  /**
   * Locale für Formatierung
   * @default 'de-DE'
   */
  locale?: string
  
  /**
   * Währung für Preis-Formatierung
   * @default 'EUR'
   */
  currency?: string
  
  /**
   * Datums-Format
   * - 'short': 04.03.2026
   * - 'medium': 04. März 2026
   * - 'long': 4. März 2026
   * - 'full': Dienstag, 4. März 2026
   * @default 'short'
   */
  dateStyle?: 'short' | 'medium' | 'long' | 'full'
}

/**
 * Return-Type von useFormatter
 */
export interface UseFormatterReturn {
  /** Formatiert Preis-String zu Währungs-Format */
  formatPrice: (price: string | number) => string
  
  /** Formatiert Datum zu deutschem Format */
  formatDate: (date: string | Date | null) => string | null
  
  /** Formatiert Zahl mit Tausender-Trennzeichen */
  formatNumber: (number: number, decimals?: number) => string
  
  /** Formatiert Prozent-Wert */
  formatPercent: (value: number, decimals?: number) => string
  
  /** Formatiert kompakte Zahlen (1.2K, 1.5M) */
  formatCompact: (value: number) => string
}

/**
 * Composable für Formatierungs-Funktionen
 * 
 * @param options - Optionale Konfiguration
 * @returns Formatter-Funktionen
 */
export function useFormatter(options: UseFormatterOptions = {}): UseFormatterReturn {
  const {
    locale = 'de-DE',
    currency = 'EUR',
    dateStyle = 'short',
  } = options

  // ========================================
  // PREIS-FORMATIERUNG
  // ========================================
  
  /**
   * Formatiert Preis zu Währungs-String
   * 
   * @param price - Preis als String oder Number
   * @returns Formatierter Preis mit Währungs-Symbol
   * 
   * @description
   * - String-Input wird zu Number konvertiert
   * - Verwendet Intl.NumberFormat für Locale-Aware Formatierung
   * - Zeigt immer 2 Dezimalstellen
   * 
   * @example
   * formatPrice("2.5") → "2,50 €"
   * formatPrice(10) → "10,00 €"
   * formatPrice("1234.56") → "1.234,56 €"
   */
  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    
    // Fallback wenn Parsing fehlschlägt
    if (isNaN(numericPrice)) {
      return '0,00 €'
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericPrice)
  }

  // ========================================
  // DATUMS-FORMATIERUNG
  // ========================================
  
  /**
   * Formatiert Datum zu lokalisiertem String
   * 
   * @param date - Datum als ISO-String, Date-Objekt oder null
   * @returns Formatiertes Datum oder null
   * 
   * @description
   * - Akzeptiert ISO-8601 Strings (z.B. "2026-03-04T10:30:00Z")
   * - Akzeptiert Date-Objekte
   * - Gibt null zurück wenn Input null/undefined
   * - Verwendet Intl.DateTimeFormat für Locale-Aware Formatierung
   * 
   * @example
   * formatDate("2026-03-04T10:30:00Z") → "04.03.2026"
   * formatDate(new Date(2026, 2, 4)) → "04.03.2026"
   * formatDate(null) → null
   */
  const formatDate = (date: string | Date | null): string | null => {
    if (!date) return null
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    // Prüfe ob Datum valide ist
    if (isNaN(dateObj.getTime())) {
      return null
    }
    
    return new Intl.DateTimeFormat(locale, {
      dateStyle,
    }).format(dateObj)
  }

  // ========================================
  // ZAHLEN-FORMATIERUNG
  // ========================================
  
  /**
   * Formatiert Zahl mit Tausender-Trennzeichen
   * 
   * @param number - Zu formatierende Zahl
   * @param decimals - Anzahl Dezimalstellen (optional)
   * @returns Formatierte Zahl
   * 
   * @description
   * Verwendet Intl.NumberFormat für Locale-Aware Formatierung.
   * 
   * @example
   * formatNumber(1234.56) → "1.234,56"
   * formatNumber(1234.567, 1) → "1.234,6"
   * formatNumber(1000000) → "1.000.000"
   */
  const formatNumber = (number: number, decimals?: number): string => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)
  }

  /**
   * Formatiert Prozent-Wert
   * 
   * @param value - Wert zwischen 0 und 1 (z.B. 0.25 = 25%)
   * @param decimals - Anzahl Dezimalstellen
   * @returns Formatierter Prozent-String
   * 
   * @example
   * formatPercent(0.25) → "25 %"
   * formatPercent(0.333, 1) → "33,3 %"
   * formatPercent(1.5) → "150 %"
   */
  const formatPercent = (value: number, decimals = 0): string => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  /**
   * Formatiert große Zahlen kompakt (1.2K, 1.5M, 2.3B)
   * 
   * @param value - Zu formatierende Zahl
   * @returns Kompakt formatierte Zahl
   * 
   * @description
   * Verwendet notation: 'compact' für automatische Skalierung.
   * 
   * @example
   * formatCompact(1234) → "1,2 Tsd."
   * formatCompact(1234567) → "1,2 Mio."
   * formatCompact(1234567890) → "1,2 Mrd."
   */
  const formatCompact = (value: number): string => {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value)
  }

  // ========================================
  // RETURN
  // ========================================
  
  return {
    formatPrice,
    formatDate,
    formatNumber,
    formatPercent,
    formatCompact,
  }
}
