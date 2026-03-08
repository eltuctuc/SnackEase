/**
 * GET /api/products
 * 
 * Ruft Produktkatalog mit optionalen Filtern ab
 * 
 * @description
 * Dieser Endpunkt:
 * - Gibt alle Produkte zurück (ohne Filter)
 * - Filtert nach Kategorie (z.B. 'obst', 'shakes')
 * - Sucht in Produktnamen (case-insensitive, partial match)
 * - Kombiniert mehrere Filter (Kategorie + Suche)
 * 
 * @route GET /api/products
 * @access Public (kein Login erforderlich)
 * 
 * @queryParams
 * - category?: string - Filtert nach Kategorie ('obst' | 'shakes' | 'alle' | ...)
 * - search?: string - Sucht in Produktnamen (ILIKE, case-insensitive)
 * 
 * @example
 * GET /api/products → Alle Produkte
 * GET /api/products?category=obst → Nur Obst-Produkte
 * GET /api/products?search=apfel → Produkte mit "apfel" im Namen
 * GET /api/products?category=obst&search=bio → Bio-Obst
 * 
 * @response Success
 * ```json
 * [
 *   {
 *     "id": 1,
 *     "name": "Apfel",
 *     "description": "Frischer Bio-Apfel",
 *     "category": "obst",
 *     "price": "1.50",
 *     "imageUrl": "https://...",
 *     "calories": 52,
 *     "protein": 0,
 *     "sugar": 10,
 *     "fat": 0,
 *     "allergens": null,
 *     "isVegan": true,
 *     "isGlutenFree": true,
 *     "stock": 50
 *   }
 * ]
 * ```
 * 
 * @throws {500} - DB-Fehler
 * 
 * @see src/types/product.ts für Product-Interface
 */

import { db } from '~/server/db'
import { products, productCategories, categories, productOffers } from '~/server/db/schema'
import { eq, and, sql, inArray, notInArray } from 'drizzle-orm'
import { isOfferCurrentlyActive, calculateDiscountedPrice } from '~/server/utils/offers'

// ========================================
// HELPER - Product Selection
// ========================================

/**
 * Definiert welche Felder aus products-Tabelle selektiert werden
 * 
 * @description
 * Zentralisiert die SELECT-Felder, um Code-Duplikation zu vermeiden.
 * Wir selektieren explizit alle Felder (statt SELECT *) für:
 * - Type-Safety (TypeScript weiß exakt welche Felder zurückkommen)
 * - Performance (keine unnötigen Felder wie createdAt)
 * - Versionierung (Schema-Änderungen brechen nicht automatisch API)
 * 
 * BEACHTE: createdAt wird NICHT zurückgegeben (nicht relevant für Frontend)
 */
const productSelectFields = {
  id: products.id,
  name: products.name,
  description: products.description,
  category: products.category,
  price: products.price,
  imageUrl: products.imageUrl,
  calories: products.calories,
  protein: products.protein,
  sugar: products.sugar,
  fat: products.fat,
  allergens: products.allergens,
  isVegan: products.isVegan,
  isGlutenFree: products.isGlutenFree,
  isActive: products.isActive,
  stock: products.stock,
}

// ========================================
// MAIN HANDLER
// ========================================

export default defineEventHandler(async (event) => {
  // ----------------------------------------
  // SCHRITT 1: Query-Parameter auslesen
  // ----------------------------------------
  
  /**
   * Liest optionale Filter aus URL-Query-Params
   * 
   * Beispiel-URLs:
   * - /api/products → query = {}
   * - /api/products?category=obst → query = { category: 'obst' }
   * - /api/products?search=apfel → query = { search: 'apfel' }
   */
  const query = getQuery(event)

  try {
    // ----------------------------------------
    // EC-10: Inaktive Kategorien ermitteln
    // Produkte werden ausgeblendet wenn: isActive = false ODER Kategorie.isActive = false
    // ----------------------------------------

    // IDs der inaktiven Kategorien ermitteln
    const inactiveCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.isActive, false))

    // Produkte die ausschließlich in inaktiven Kategorien sind (müssen ausgeblendet werden)
    let productIdsToExclude: number[] = []

    if (inactiveCategories.length > 0) {
      const inactiveCategoryIds = inactiveCategories.map(c => c.id)

      // Alle product_categories Links für inaktive Kategorien
      const linksInInactiveCategories = await db
        .select({ productId: productCategories.productId })
        .from(productCategories)
        .where(inArray(productCategories.categoryId, inactiveCategoryIds))

      if (linksInInactiveCategories.length > 0) {
        const affectedProductIds = [...new Set(linksInInactiveCategories.map(l => l.productId))]

        // Prüfen welche dieser Produkte AUCH in aktiven Kategorien sind
        const linksInActiveCategories = await db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(
            and(
              inArray(productCategories.productId, affectedProductIds),
              notInArray(productCategories.categoryId, inactiveCategoryIds)
            )
          )

        const productIdsWithActiveCategories = new Set(linksInActiveCategories.map(l => l.productId))

        // Nur Produkte ausblenden die KEINE aktive Kategorie haben (oder keine in product_categories stehen)
        productIdsToExclude = affectedProductIds.filter(pid => !productIdsWithActiveCategories.has(pid))
      }
    }

    // ----------------------------------------
    // SCHRITT 2: WHERE-Conditions aufbauen
    // ----------------------------------------

    /**
     * Sammelt alle Filter-Bedingungen für SQL WHERE-Clause
     */
    const conditions: ReturnType<typeof eq>[] = []

    // Nur aktive Produkte (isActive = true oder NULL für alte Einträge ohne isActive-Feld)
    conditions.push(sql`(${products.isActive} IS NULL OR ${products.isActive} = true)` as unknown as ReturnType<typeof eq>)
    
    // ----------------------------------------
    // FILTER 1: Kategorie
    // ----------------------------------------
    
    /**
     * Kategorie-Filter (optional)
     * 
     * BEACHTE:
     * - 'alle' wird ignoriert (zeigt alle Kategorien)
     * - Nur exakter Match (eq = Equals)
     * - Case-sensitive (DB-Schema: text ohne CITEXT)
     * 
     * SQL: WHERE category = 'obst'
     */
    if (query.category && query.category !== 'alle') {
      conditions.push(eq(products.category, query.category as string) as unknown as ReturnType<typeof eq>)
    }
    
    // ----------------------------------------
    // FILTER 2: Suche im Produktnamen
    // ----------------------------------------
    
    /**
     * Textsuche im Produktnamen (optional)
     * 
     * ILIKE = Case-insensitive LIKE (Postgres)
     * % = Wildcard (partial match)
     * 
     * Beispiele:
     * - search=apfel → Findet: "Apfel", "Bio-Apfel", "Apfelsaft"
     * - search=Protein → Findet: "Protein-Riegel", "Proteinshake"
     * 
     * SQL: WHERE name ILIKE '%apfel%'
     * 
     * PERFORMANCE-HINWEIS:
     * Bei großen Produktkatalogen (>10.000 Produkte) sollte ein
     * Full-Text-Search-Index (tsvector) verwendet werden.
     */
    if (query.search) {
      conditions.push(
        sql`${products.name} ILIKE ${'%' + query.search + '%'}` as unknown as ReturnType<typeof eq>
      )
    }

    // Produkte mit ausschließlich inaktiven Kategorien ausblenden (EC-10)
    if (productIdsToExclude.length > 0) {
      conditions.push(
        notInArray(products.id, productIdsToExclude) as unknown as ReturnType<typeof eq>
      )
    }
    
    // ----------------------------------------
    // SCHRITT 3: DB-Query ausführen
    // ----------------------------------------
    
    /**
     * Query mit oder ohne WHERE-Clause
     * 
     * Fall 1: Mit Filtern (conditions.length > 0)
     * - SELECT ... FROM products WHERE condition1 AND condition2
     * 
     * Fall 2: Ohne Filter (conditions.length === 0)
     * - SELECT ... FROM products
     * 
     * REFACTORING-MÖGLICHKEIT:
     * Beide Queries könnten vereint werden mit:
     * .where(conditions.length > 0 ? and(...conditions) : undefined)
     * 
     * Aktuell getrennt für bessere Lesbarkeit.
     */
    // Immer mit WHERE-Clause (mindestens isActive-Filter ist immer vorhanden)
    const productList = await db.select(productSelectFields)
      .from(products)
      .where(and(...conditions))

    // FEAT-14: Aktive Angebote für die gefundenen Produkte laden
    const productIds = productList.map(p => p.id)

    let offersMap = new Map<number, {
      id: number
      discountType: string
      discountValue: string
      discountedPrice: string
      startsAt: string
      expiresAt: string
    }>()

    if (productIds.length > 0) {
      const offers = await db
        .select()
        .from(productOffers)
        .where(inArray(productOffers.productId, productIds))

      for (const offer of offers) {
        if (isOfferCurrentlyActive(offer)) {
          const originalPrice = productList.find(p => p.id === offer.productId)
          if (originalPrice) {
            const discountedPrice = calculateDiscountedPrice(
              parseFloat(originalPrice.price),
              offer.discountType as 'percent' | 'absolute',
              parseFloat(offer.discountValue),
            )
            offersMap.set(offer.productId, {
              id: offer.id,
              discountType: offer.discountType,
              discountValue: offer.discountValue,
              discountedPrice: discountedPrice.toFixed(2),
              startsAt: offer.startsAt.toISOString(),
              expiresAt: offer.expiresAt.toISOString(),
            })
          }
        }
      }
    }

    // activeOffer an jedes Produkt-Objekt anhängen
    return productList.map(product => ({
      ...product,
      activeOffer: offersMap.get(product.id) ?? null,
    }))

  } catch (error) {
    // ----------------------------------------
    // ERROR HANDLING
    // ----------------------------------------
    
    /**
     * Fehlerbehandlung mit Logging
     * 
     * Mögliche Fehler:
     * - DB-Verbindungsfehler (Neon Serverless offline)
     * - SQL-Syntax-Fehler (falsche Query-Konstruktion)
     * - Timeout (langsame Query bei vielen Produkten)
     * 
     * WICHTIG: Fehler-Details werden NUR server-side geloggt.
     * Client bekommt generische Fehlermeldung (Security Best Practice).
     * 
     * TODO: In Production strukturiertes Logging verwenden (z.B. Pino, Winston)
     */
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Produkte'
    })
  }
})
