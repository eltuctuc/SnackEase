/**
 * PATCH /api/admin/offers/[id]
 *
 * FEAT-14: Angebot aktivieren/deaktivieren oder bearbeiten (Admin)
 *
 * @description
 * Aktualisiert ein bestehendes Angebot. Alle Felder sind optional.
 *
 * @route PATCH /api/admin/offers/[id]
 * @access Admin
 *
 * @requestBody
 * ```json
 * {
 *   "isActive": false,
 *   "discountValue": 15,
 *   "startsAt": "2026-03-08T00:00:00Z",
 *   "expiresAt": "2026-03-20T23:59:59Z"
 * }
 * ```
 *
 * @throws {400} - Validierungsfehler
 * @throws {401/403} - Nicht autorisiert
 * @throws {404} - Angebot nicht gefunden
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

    const id = parseInt(getRouterParam(event, 'id') ?? '', 10)
    if (isNaN(id)) {
      throw createError({ statusCode: 400, message: 'Ungültige Angebots-ID' })
    }

    // Angebot aus DB laden
    const existingOffers = await db
      .select()
      .from(productOffers)
      .where(eq(productOffers.id, id))
      .limit(1)

    if (existingOffers.length === 0) {
      throw createError({ statusCode: 404, message: 'Angebot nicht gefunden' })
    }

    const existingOffer = existingOffers[0]

    const body = await readBody(event)
    const { isActive, discountValue, startsAt, expiresAt } = body as {
      isActive?: boolean
      discountValue?: number
      startsAt?: string
      expiresAt?: string
    }

    // ----------------------------------------
    // Werte für Update zusammenstellen
    // ----------------------------------------
    const updateData: Partial<{
      isActive: boolean
      discountValue: string
      startsAt: Date
      expiresAt: Date
      updatedAt: Date
    }> = {
      updatedAt: new Date(),
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    // Datums-Validierung falls Felder übergeben wurden
    const newStartsAt = startsAt ? new Date(startsAt) : existingOffer.startsAt
    const newExpiresAt = expiresAt ? new Date(expiresAt) : existingOffer.expiresAt
    const now = new Date()

    if (startsAt !== undefined) {
      if (isNaN(newStartsAt.getTime())) {
        throw createError({ statusCode: 400, message: 'Startdatum ist ungültig' })
      }
      updateData.startsAt = newStartsAt
    }

    if (expiresAt !== undefined) {
      if (isNaN(newExpiresAt.getTime())) {
        throw createError({ statusCode: 400, message: 'Enddatum ist ungültig' })
      }
      if (newExpiresAt <= now) {
        throw createError({ statusCode: 400, message: 'Enddatum muss in der Zukunft liegen' })
      }
      updateData.expiresAt = newExpiresAt
    }

    if (startsAt !== undefined || expiresAt !== undefined) {
      if (newExpiresAt <= newStartsAt) {
        throw createError({ statusCode: 400, message: 'Startdatum muss vor dem Enddatum liegen' })
      }
    }

    // Rabattwert validieren falls übergeben
    if (discountValue !== undefined) {
      if (typeof discountValue !== 'number') {
        throw createError({ statusCode: 400, message: 'Rabattwert muss eine Zahl sein' })
      }

      // Produkt laden für Preis-Validierung
      const productList = await db
        .select({ price: products.price })
        .from(products)
        .where(eq(products.id, existingOffer.productId))
        .limit(1)

      if (productList.length === 0) {
        throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' })
      }

      const originalPrice = parseFloat(productList[0].price)
      const discountType = existingOffer.discountType

      if (discountType === 'percent') {
        if (discountValue < 0 || discountValue > 100) {
          throw createError({ statusCode: 400, message: 'Prozent-Rabatt muss zwischen 0 und 100 liegen' })
        }
      } else {
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

      updateData.discountValue = discountValue.toFixed(2)
    }

    // ----------------------------------------
    // DB-Update
    // ----------------------------------------
    const updatedOffers = await db
      .update(productOffers)
      .set(updateData)
      .where(eq(productOffers.id, id))
      .returning()

    const offer = updatedOffers[0]

    // Produkt-Preis für discountedPrice-Berechnung laden
    const productList = await db
      .select({ price: products.price })
      .from(products)
      .where(eq(products.id, offer.productId))
      .limit(1)

    const originalPrice = productList[0] ? parseFloat(productList[0].price) : 0
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
      message: err.message || 'Fehler beim Aktualisieren des Angebots',
    })
  }
})
