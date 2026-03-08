/**
 * POST /api/admin/offers
 *
 * FEAT-14: Neues Angebot erstellen oder bestehendes ersetzen (Admin)
 *
 * @description
 * Erstellt ein neues Angebot für ein Produkt.
 * Bestehendes Angebot für dasselbe Produkt wird automatisch ersetzt
 * (via onConflictDoUpdate auf UNIQUE-Constraint productId).
 *
 * @route POST /api/admin/offers
 * @access Admin
 *
 * @requestBody
 * ```json
 * {
 *   "productId": 1,
 *   "discountType": "percent",
 *   "discountValue": 20,
 *   "startsAt": "2026-03-08T00:00:00Z",
 *   "expiresAt": "2026-03-15T23:59:59Z"
 * }
 * ```
 *
 * @throws {400} - Validierungsfehler
 * @throws {401/403} - Nicht autorisiert
 * @throws {404} - Produkt nicht gefunden
 * @throws {500} - DB-Fehler
 */

import { db } from '~/server/db'
import { productOffers, products } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { calculateDiscountedPrice, isOfferCurrentlyActive } from '~/server/utils/offers'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const body = await readBody(event)
    const { productId, discountType, discountValue, startsAt, expiresAt } = body as {
      productId: number
      discountType: string
      discountValue: number
      startsAt: string
      expiresAt: string
    }

    // ----------------------------------------
    // Validierung: Pflichtfelder
    // ----------------------------------------
    if (!productId || typeof productId !== 'number') {
      throw createError({ statusCode: 400, message: 'Produkt-ID ist erforderlich' })
    }

    if (!discountType || !['percent', 'absolute'].includes(discountType)) {
      throw createError({ statusCode: 400, message: 'Rabatttyp muss "percent" oder "absolute" sein' })
    }

    if (discountValue === undefined || discountValue === null || typeof discountValue !== 'number') {
      throw createError({ statusCode: 400, message: 'Rabattwert ist erforderlich' })
    }

    if (!startsAt) {
      throw createError({ statusCode: 400, message: 'Startdatum ist erforderlich' })
    }

    if (!expiresAt) {
      throw createError({ statusCode: 400, message: 'Enddatum ist erforderlich' })
    }

    // ----------------------------------------
    // Datum-Validierungen
    // ----------------------------------------
    const startsAtDate = new Date(startsAt)
    const expiresAtDate = new Date(expiresAt)
    const now = new Date()

    if (isNaN(startsAtDate.getTime())) {
      throw createError({ statusCode: 400, message: 'Startdatum ist ungültig' })
    }

    if (isNaN(expiresAtDate.getTime())) {
      throw createError({ statusCode: 400, message: 'Enddatum ist ungültig' })
    }

    if (expiresAtDate <= startsAtDate) {
      throw createError({ statusCode: 400, message: 'Startdatum muss vor dem Enddatum liegen' })
    }

    if (expiresAtDate <= now) {
      throw createError({ statusCode: 400, message: 'Enddatum muss in der Zukunft liegen' })
    }

    // ----------------------------------------
    // Produkt laden + Rabattwert validieren
    // ----------------------------------------
    const productList = await db
      .select({ id: products.id, price: products.price, name: products.name })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (productList.length === 0) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' })
    }

    const product = productList[0]
    const originalPrice = parseFloat(product.price)

    if (discountType === 'percent') {
      if (discountValue < 0 || discountValue > 100) {
        throw createError({ statusCode: 400, message: 'Prozent-Rabatt muss zwischen 0 und 100 liegen' })
      }
    } else {
      // absolute
      if (discountValue <= 0) {
        throw createError({ statusCode: 400, message: 'Absoluter Rabatt muss größer als 0 sein' })
      }
      if (discountValue > originalPrice) {
        throw createError({
          statusCode: 400,
          message: `Rabatt darf den Produktpreis nicht überschreiten. Maximaler Rabatt: ${originalPrice.toFixed(2)} EUR`,
        })
      }
    }

    // ----------------------------------------
    // Angebot erstellen oder bestehendes ersetzen
    // onConflictDoUpdate auf UNIQUE-Index productId (EC-1, REQ-10)
    // ----------------------------------------
    const insertedOffers = await db
      .insert(productOffers)
      .values({
        productId,
        discountType,
        discountValue: discountValue.toFixed(2),
        startsAt: startsAtDate,
        expiresAt: expiresAtDate,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: productOffers.productId,
        set: {
          discountType,
          discountValue: discountValue.toFixed(2),
          startsAt: startsAtDate,
          expiresAt: expiresAtDate,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning()

    const offer = insertedOffers[0]
    const discountedPrice = calculateDiscountedPrice(
      originalPrice,
      offer.discountType as 'percent' | 'absolute',
      parseFloat(offer.discountValue),
    )

    return {
      id: offer.id,
      productId: offer.productId,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      discountedPrice: discountedPrice.toFixed(2),
      startsAt: offer.startsAt.toISOString(),
      expiresAt: offer.expiresAt.toISOString(),
      isActive: offer.isActive,
      isCurrentlyActive: isOfferCurrentlyActive(offer),
      createdAt: offer.createdAt?.toISOString() ?? null,
      updatedAt: offer.updatedAt?.toISOString() ?? null,
    }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Fehler beim Erstellen des Angebots',
    })
  }
})
