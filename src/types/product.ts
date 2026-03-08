/**
 * Product-bezogene TypeScript-Definitionen
 * 
 * Dieses File enthält alle Product-relevanten Interfaces,
 * passend zum Drizzle-Schema (src/server/db/schema.ts).
 */

/**
 * Produkt-Objekt wie es aus der Datenbank kommt
 * 
 * @property id - Eindeutige Produkt-ID (Primary Key)
 * @property name - Produktname (z.B. "Apfel")
 * @property description - Optional: Produktbeschreibung
 * @property category - Kategorie ('obst' | 'proteinriegel' | 'shakes' | etc.)
 * @property price - Preis als String (wegen Decimal-Precision, z.B. "2.50")
 * @property imageUrl - Optional: URL zum Produktbild
 * @property calories - Optional: Kalorien pro 100g
 * @property protein - Optional: Protein in Gramm pro 100g
 * @property sugar - Optional: Zucker in Gramm pro 100g
 * @property fat - Optional: Fett in Gramm pro 100g
 * @property allergens - Optional: Liste von Allergenen (z.B. ['Nüsse', 'Gluten'])
 * @property isVegan - Ob das Produkt vegan ist (Standard: false)
 * @property isGlutenFree - Ob das Produkt glutenfrei ist (Standard: false)
 * @property stock - Verfügbare Stückzahl im Lager (Standard: 10)
 * @property activeOffer - Aktives Angebot (null wenn keins aktiv)
 */
export interface Product {
  id: number
  name: string
  description: string | null
  category: string
  price: string
  imageUrl: string | null
  calories: number | null
  protein: number | null
  sugar: number | null
  fat: number | null
  allergens: string[] | null
  isVegan: boolean
  isGlutenFree: boolean
  stock: number
  activeOffer?: {
    id: number
    discountType: 'percent' | 'absolute'
    discountValue: string
    discountedPrice: string
    startsAt: string
    expiresAt: string
  } | null
}

/**
 * Verfügbare Produkt-Kategorien
 * 
 * Diese werden im Dashboard als Filter-Buttons angezeigt.
 * Siehe: dashboard.vue:15-23
 */
export type ProductCategory = 
  | 'alle'
  | 'obst'
  | 'proteinriegel'
  | 'shakes'
  | 'schokoriegel'
  | 'nuesse'
  | 'getraenke'

/**
 * Kategorie-Definition mit UI-Metadaten
 * Wird für Filter-Buttons im Dashboard verwendet
 */
export interface ProductCategoryOption {
  id: ProductCategory
  label: string
  icon: string
}
