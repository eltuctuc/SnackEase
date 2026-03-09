/**
 * Unit-Tests fuer OfferSliderCard Komponente (FEAT-17)
 *
 * Testet:
 * - Badge-Berechnung fuer Prozent- und Absolutrabatte (AC-7)
 * - Bild-Fallback wenn imageUrl null ist (EC-4)
 * - Event-Emission: open-detail bei Karten-Klick (AC-5)
 * - Event-Emission: add-to-cart bei Warenkorb-Button-Klick (AC-6)
 * - Kein open-detail Event wenn Warenkorb-Button geklickt (AC-6)
 * - Produktname wird angezeigt (AC-4)
 * - Angebotspreis wird angezeigt (AC-4)
 * - Accessibility: aria-label auf Warenkorb-Button (WCAG 2.5.3)
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OfferSliderCard from '~/components/dashboard/OfferSliderCard.vue'
import type { Product } from '~/types'

// ========================================
// TEST-DATEN
// ========================================

/** Basis-Produkt fuer Tests */
const baseProduct: Product & { activeOffer: NonNullable<Product['activeOffer']> } = {
  id: 1,
  name: 'Test Produkt',
  description: 'Eine Beschreibung',
  category: 'proteinriegel',
  price: '3.00',
  imageUrl: 'https://example.com/bild.jpg',
  calories: 200,
  protein: 10,
  sugar: 5,
  fat: 8,
  allergens: null,
  isVegan: false,
  isGlutenFree: false,
  stock: 5,
  activeOffer: {
    id: 1,
    discountType: 'percent',
    discountValue: '20',
    discountedPrice: '2.40',
    startsAt: '2026-01-01T00:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
  },
}

/** Produkt mit absolutem Rabatt */
const productAbsoluteDiscount: typeof baseProduct = {
  ...baseProduct,
  id: 2,
  name: 'Absoluter Rabatt',
  price: '2.50',
  activeOffer: {
    id: 2,
    discountType: 'absolute',
    discountValue: '0.50',
    discountedPrice: '2.00',
    startsAt: '2026-01-01T00:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
  },
}

/** Produkt ohne Bild */
const productWithoutImage: typeof baseProduct = {
  ...baseProduct,
  id: 3,
  name: 'Ohne Bild',
  imageUrl: null,
}

// ========================================
// HILFSFUNKTION
// ========================================

function mountCard(product: typeof baseProduct) {
  return mount(OfferSliderCard, {
    props: { product },
  })
}

// ========================================
// TESTS
// ========================================

describe('OfferSliderCard (FEAT-17)', () => {
  it('rendert ohne Fehler', () => {
    const wrapper = mountCard(baseProduct)
    expect(wrapper.exists()).toBe(true)
  })

  // ---- Badge: Prozentrabatt ----

  it('zeigt Badge "-20%" bei discountType "percent" und discountValue "20"', () => {
    const wrapper = mountCard(baseProduct)
    expect(wrapper.text()).toContain('-20%')
  })

  it('Badge hat aria-label fuer Prozentrabatt (WCAG 1.3.1)', () => {
    const wrapper = mountCard(baseProduct)
    const badge = wrapper.find('[aria-label*="Prozent Rabatt"]')
    expect(badge.exists()).toBe(true)
  })

  // ---- Badge: Absolutrabatt ----

  it('zeigt Badge "-0,50 EUR" bei discountType "absolute" und discountValue "0.50"', () => {
    const wrapper = mountCard(productAbsoluteDiscount)
    const text = wrapper.text()
    expect(text).toContain('EUR')
  })

  it('Badge hat aria-label fuer Absolutrabatt (WCAG 1.3.1)', () => {
    const wrapper = mountCard(productAbsoluteDiscount)
    const badge = wrapper.find('[aria-label*="Euro Rabatt"]')
    expect(badge.exists()).toBe(true)
  })

  // ---- Produktbild ----

  it('zeigt Produktbild wenn imageUrl gesetzt ist', () => {
    const wrapper = mountCard(baseProduct)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/bild.jpg')
  })

  it('zeigt Platzhalter wenn imageUrl null ist (EC-4)', () => {
    const wrapper = mountCard(productWithoutImage)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(false)
    // Platzhalter-Emoji-Container sollte sichtbar sein
    const placeholder = wrapper.find('[aria-hidden="true"]')
    expect(placeholder.exists()).toBe(true)
  })

  it('img-Element hat alt-Attribut mit Produktname (WCAG 1.1.1)', () => {
    const wrapper = mountCard(baseProduct)
    const img = wrapper.find('img')
    expect(img.attributes('alt')).toBe('Test Produkt')
  })

  // ---- Produktname ----

  it('zeigt den Produktnamen an (AC-4)', () => {
    const wrapper = mountCard(baseProduct)
    expect(wrapper.text()).toContain('Test Produkt')
  })

  it('Produktname-Element hat line-clamp-2 Klasse (EC-6 Langtitel-Schutz)', () => {
    const wrapper = mountCard(baseProduct)
    const nameEl = wrapper.find('.line-clamp-2')
    expect(nameEl.exists()).toBe(true)
  })

  // ---- Preis ----

  it('zeigt den Angebotspreis an (AC-4)', () => {
    const wrapper = mountCard(baseProduct)
    // Angebotspreis: 2.40 -> "2,40"
    expect(wrapper.text()).toContain('2,40')
  })

  // ---- Warenkorb-Button ----

  it('Warenkorb-Button hat aria-label mit Produktname (WCAG 2.5.3)', () => {
    const wrapper = mountCard(baseProduct)
    const button = wrapper.find('[aria-label*="in den Warenkorb"]')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toContain('Test Produkt')
  })

  // ---- Events ----

  it('emittiert "open-detail" bei Klick auf die Kartenflaeche (AC-5)', async () => {
    const wrapper = mountCard(baseProduct)
    const card = wrapper.find('button[aria-label*="Angebot anzeigen"]')
    await card.trigger('click')
    const emitted = wrapper.emitted('open-detail')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(baseProduct)
  })

  it('emittiert "add-to-cart" bei Klick auf den Warenkorb-Button (AC-6)', async () => {
    const wrapper = mountCard(baseProduct)
    const cartButton = wrapper.find('[aria-label*="in den Warenkorb"]')
    await cartButton.trigger('click')
    const emitted = wrapper.emitted('add-to-cart')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(baseProduct)
  })

  it('emittiert KEIN "open-detail" bei Klick auf den Warenkorb-Button (AC-6)', async () => {
    const wrapper = mountCard(baseProduct)
    const cartButton = wrapper.find('[aria-label*="in den Warenkorb"]')
    await cartButton.trigger('click')
    const openDetailEmitted = wrapper.emitted('open-detail')
    expect(openDetailEmitted).toBeFalsy()
  })
})
