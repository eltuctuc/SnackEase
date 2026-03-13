/**
 * GET /api/products
 *
 * Ruft Produktkatalog mit optionalen Filtern ab
 *
 * @description
 * Dieser Endpunkt:
 * - Gibt alle Produkte zurück (ohne Filter)
 * - Filtert nach Kategorie (z.B. 'obst', 'shakes')
 * - Sucht in Produktnamen (case-insensitive, partial match) — Legacy-Parameter `search`
 * - Sucht in Produktname + Beschreibung (ILIKE) — neuer Parameter `q` (FEAT-19)
 * - Filtert nach Verfügbarkeit (inStock), Preis (minPrice/maxPrice), Diätform (isVegan/isGlutenFree)
 * - Sortiert nach Relevanz, Preis aufsteigend oder absteigend (FEAT-19)
 * - Kombiniert mehrere Filter (AND-Verknüpfung)
 *
 * @route GET /api/products
 * @access Public (kein Login erforderlich)
 *
 * @queryParams
 * - category?: string         - Filtert nach Kategorie ('obst' | 'shakes' | 'alle' | ...)
 * - search?: string           - Legacy: Sucht in Produktnamen (ILIKE, case-insensitive)
 * - q?: string                - FEAT-19: Volltext-Suche in name + description (ILIKE); max 100 Zeichen
 * - inStock?: string          - FEAT-19: 'true' = nur vorrätige Produkte (stock > 0)
 * - minPrice?: string         - FEAT-19: Preis ab (inklusiv), CAST zu numeric
 * - maxPrice?: string         - FEAT-19: Preis bis (inklusiv), CAST zu numeric
 * - isVegan?: string          - FEAT-19: 'true' = nur vegane Produkte
 * - isGlutenFree?: string     - FEAT-19: 'true' = nur glutenfreie Produkte
 * - sortBy?: string           - FEAT-19: 'relevance' | 'price_asc' | 'price_desc'
 *
 * @example
 * GET /api/products → Alle Produkte
 * GET /api/products?category=obst → Nur Obst-Produkte
 * GET /api/products?q=apfel → Produkte mit "apfel" in Name oder Beschreibung
 * GET /api/products?q=protein&isVegan=true&sortBy=price_asc → Vegane Protein-Produkte, günstigste zuerst
 * GET /api/products?minPrice=1.00&maxPrice=2.00&inStock=true → Vorrätige Produkte zwischen 1 und 2 EUR
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
 *     "stock": 50,
 *     "activeOffer": null
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
import { escapeIlikeTerm } from '~/server/utils/search'

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
   * - /api/products?q=apfel&isVegan=true → query = { q: 'apfel', isVegan: 'true' }
   */
  const query = getQuery(event)

  // FEAT-19: Neue Parameter auslesen
  const rawQ = typeof query.q === 'string' ? query.q : null
  const inStock = query.inStock === 'true'
  const minPrice = query.minPrice ? parseFloat(query.minPrice as string) : null
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice as string) : null
  const filterVegan = query.isVegan === 'true'
  const filterGlutenFree = query.isGlutenFree === 'true'
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'relevance'

  // Suchbegriff bereinigen und escapen (EC-1, EC-2, EC-3)
  const escapedQ = rawQ ? escapeIlikeTerm(rawQ) : null

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
    // FILTER 2: Legacy-Suche im Produktnamen (search-Parameter)
    // ----------------------------------------

    /**
     * Textsuche im Produktnamen (optional, Legacy)
     *
     * Nur noch für abwärtskompatible Aufrufer. Neuer Parameter ist `q`.
     *
     * SQL: WHERE name ILIKE '%apfel%'
     */
    if (query.search && !escapedQ) {
      conditions.push(
        sql`${products.name} ILIKE ${'%' + query.search + '%'}` as unknown as ReturnType<typeof eq>
      )
    }

    // ----------------------------------------
    // FILTER 3: FEAT-19 Volltext-Suche (q-Parameter)
    // ----------------------------------------

    /**
     * Volltext-Suche über name + description (ILIKE, OR-Verknüpfung, FEAT-19)
     *
     * - Sonderzeichen werden escaped (EC-1)
     * - Leerzeichen-only → wie leere Suche behandelt (EC-2)
     * - Max 100 Zeichen (EC-3)
     *
     * SQL: WHERE (name ILIKE '%apfel%' OR description ILIKE '%apfel%')
     */
    if (escapedQ) {
      const pattern = `%${escapedQ}%`
      conditions.push(
        sql`(${products.name} ILIKE ${pattern} OR ${products.description} ILIKE ${pattern})` as unknown as ReturnType<typeof eq>
      )
    }

    // ----------------------------------------
    // FILTER 4: FEAT-19 Verfügbarkeit (inStock)
    // ----------------------------------------

    /**
     * Nur vorrätige Produkte (stock > 0)
     *
     * SQL: WHERE stock > 0
     */
    if (inStock) {
      conditions.push(
        sql`${products.stock} > 0` as unknown as ReturnType<typeof eq>
      )
    }

    // ----------------------------------------
    // FILTER 5: FEAT-19 Preis-Untergrenze (minPrice)
    // ----------------------------------------

    /**
     * Preis ab (inklusiv) — serverseitiger CAST wegen text-Typ (EC-12)
     *
     * SQL: WHERE CAST(price AS numeric) >= 1.00
     */
    if (minPrice !== null && !isNaN(minPrice)) {
      conditions.push(
        sql`CAST(${products.price} AS numeric) >= ${minPrice}` as unknown as ReturnType<typeof eq>
      )
    }

    // ----------------------------------------
    // FILTER 6: FEAT-19 Preis-Obergrenze (maxPrice)
    // ----------------------------------------

    /**
     * Preis bis (inklusiv) — serverseitiger CAST wegen text-Typ (EC-12)
     *
     * SQL: WHERE CAST(price AS numeric) <= 2.00
     */
    if (maxPrice !== null && !isNaN(maxPrice)) {
      conditions.push(
        sql`CAST(${products.price} AS numeric) <= ${maxPrice}` as unknown as ReturnType<typeof eq>
      )
    }

    // ----------------------------------------
    // FILTER 7: FEAT-19 Vegan
    // ----------------------------------------

    /**
     * Nur vegane Produkte
     *
     * SQL: WHERE is_vegan = true
     */
    if (filterVegan) {
      conditions.push(
        eq(products.isVegan, true) as unknown as ReturnType<typeof eq>
      )
    }

    // ----------------------------------------
    // FILTER 8: FEAT-19 Glutenfrei
    // ----------------------------------------

    /**
     * Nur glutenfreie Produkte
     *
     * SQL: WHERE is_gluten_free = true
     */
    if (filterGlutenFree) {
      conditions.push(
        eq(products.isGlutenFree, true) as unknown as ReturnType<typeof eq>
      )
    }

    // Produkte mit ausschließlich inaktiven Kategorien ausblenden (EC-10)
    if (productIdsToExclude.length > 0) {
      conditions.push(
        notInArray(products.id, productIdsToExclude) as unknown as ReturnType<typeof eq>
      )
    }

    // ----------------------------------------
    // SCHRITT 3: ORDER BY aufbauen (FEAT-19)
    // ----------------------------------------

    /**
     * Sortier-Logik:
     *
     * - price_asc:   CAST(price AS numeric) ASC
     * - price_desc:  CAST(price AS numeric) DESC
     * - relevance (Standard):
     *     Wenn Suchbegriff vorhanden:
     *       CASE WHEN name ILIKE '%term%' THEN 0 ELSE 1 END ASC, name ASC
     *     Sonst: name ASC (alphabetisch)
     */
    let orderByClause: ReturnType<typeof sql>

    if (sortBy === 'price_asc') {
      orderByClause = sql`CAST(${products.price} AS numeric) ASC`
    } else if (sortBy === 'price_desc') {
      orderByClause = sql`CAST(${products.price} AS numeric) DESC`
    } else if (escapedQ) {
      // Relevanz: Name-Match hat Vorrang vor Description-Match
      const namePattern = `%${escapedQ}%`
      orderByClause = sql`CASE WHEN ${products.name} ILIKE ${namePattern} THEN 0 ELSE 1 END ASC, ${products.name} ASC`
    } else {
      // Keine Suche + keine spezifische Sortierung → alphabetisch nach Name
      orderByClause = sql`${products.name} ASC`
    }

    // ----------------------------------------
    // SCHRITT 4: DB-Query ausführen
    // ----------------------------------------

    /**
     * Query mit WHERE-Clause und ORDER BY
     *
     * Mindestens isActive-Filter ist immer vorhanden (conditions.length >= 1)
     */
    const productList = await db.select(productSelectFields)
      .from(products)
      .where(and(...conditions))
      .orderBy(orderByClause)

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
