/**
 * Unit-Tests fuer OffersSlider Komponente (FEAT-17)
 *
 * Testet:
 * - Slider wird ausgeblendet wenn keine Angebote vorhanden (AC-2)
 * - Slider zeigt korrekte Anzahl Karten wenn Angebote vorhanden (AC-4)
 * - Filterlogik: Nur Produkte mit activeOffer !== null werden angezeigt (AC-8)
 * - Skeleton-Karten werden angezeigt waehrend isLoading === true (UX)
 * - Abschnittstitel "Aktuelle Angebote" ist vorhanden (REQ-7)
 * - ARIA-Attribute fuer Accessibility (WCAG 2.1.1)
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OffersSlider from '~/components/dashboard/OffersSlider.vue'
import OfferSliderCard from '~/components/dashboard/OfferSliderCard.vue'
import type { Product } from '~/types'

// ========================================
// TEST-DATEN
// ========================================

/** Angebots-Produkt (activeOffer vorhanden) */
const createOfferProduct = (id: number): Product => ({
  id,
  name: `Angebot Produkt ${id}`,
  description: null,
  category: 'proteinriegel',
  price: '3.00',
  imageUrl: null,
  calories: null,
  protein: null,
  sugar: null,
  fat: null,
  allergens: null,
  isVegan: false,
  isGlutenFree: false,
  stock: 5,
  activeOffer: {
    id,
    discountType: 'percent',
    discountValue: '10',
    discountedPrice: '2.70',
    startsAt: '2026-01-01T00:00:00Z',
    expiresAt: '2026-12-31T23:59:59Z',
  },
})

/** Normales Produkt ohne Angebot */
const createNormalProduct = (id: number): Product => ({
  id,
  name: `Normal Produkt ${id}`,
  description: null,
  category: 'obst',
  price: '1.50',
  imageUrl: null,
  calories: null,
  protein: null,
  sugar: null,
  fat: null,
  allergens: null,
  isVegan: true,
  isGlutenFree: true,
  stock: 10,
  activeOffer: null,
})

// ========================================
// HILFSFUNKTIONEN
// ========================================

function mountSlider(products: Product[], isLoading = false) {
  return mount(OffersSlider, {
    props: { products, isLoading },
    global: {
      stubs: {
        // OfferSliderCard wird vollstaendig gemountet (kein Stub) — wir testen die Filterlogik
      },
    },
  })
}

// ========================================
// TESTS
// ========================================

describe('OffersSlider (FEAT-17)', () => {
  // ---- Ausblendung bei keinen Angeboten ----

  it('rendert nichts wenn keine Produkte vorhanden und nicht laedt (AC-2)', () => {
    const wrapper = mountSlider([])
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('rendert nichts wenn nur Produkte ohne Angebot vorhanden (AC-2)', () => {
    const products = [createNormalProduct(1), createNormalProduct(2)]
    const wrapper = mountSlider(products)
    expect(wrapper.find('section').exists()).toBe(false)
  })

  // ---- Anzeige mit Angeboten ----

  it('rendert section wenn Produkte mit Angebot vorhanden (AC-1)', () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    expect(wrapper.find('section').exists()).toBe(true)
  })

  it('Abschnittstitel "Aktuelle Angebote" ist sichtbar (REQ-7)', () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    expect(wrapper.text()).toContain('Aktuelle Angebote')
  })

  it('Titel ist als h2-Element gerendert (WCAG 2.4.6)', () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    const h2 = wrapper.find('h2')
    expect(h2.exists()).toBe(true)
    expect(h2.text()).toContain('Aktuelle Angebote')
  })

  // ---- Filterlogik ----

  it('zeigt 1 OfferSliderCard wenn 1 Angebot vorhanden (EC-1)', () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    const cards = wrapper.findAllComponents(OfferSliderCard)
    expect(cards).toHaveLength(1)
  })

  it('zeigt 2 OfferSliderCards wenn 2 Angebote vorhanden (EC-2)', () => {
    const products = [createOfferProduct(1), createOfferProduct(2)]
    const wrapper = mountSlider(products)
    const cards = wrapper.findAllComponents(OfferSliderCard)
    expect(cards).toHaveLength(2)
  })

  it('zeigt 3 OfferSliderCards wenn 3 Angebote vorhanden', () => {
    const products = [createOfferProduct(1), createOfferProduct(2), createOfferProduct(3)]
    const wrapper = mountSlider(products)
    const cards = wrapper.findAllComponents(OfferSliderCard)
    expect(cards).toHaveLength(3)
  })

  it('filtert Produkte ohne Angebot heraus (AC-8 Filterlogik)', () => {
    const products = [
      createNormalProduct(1),
      createOfferProduct(2),
      createNormalProduct(3),
      createOfferProduct(4),
    ]
    const wrapper = mountSlider(products)
    const cards = wrapper.findAllComponents(OfferSliderCard)
    // Nur die 2 Angebots-Produkte
    expect(cards).toHaveLength(2)
  })

  // ---- Skeleton-Loader ----

  it('zeigt Skeleton-Karten waehrend isLoading === true (UX Anti-CLS)', () => {
    const wrapper = mountSlider([], true)
    expect(wrapper.find('section').exists()).toBe(true)
    // Skeleton-Container mit animate-pulse
    const skeletons = wrapper.findAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('zeigt KEINE OfferSliderCards waehrend isLoading === true', () => {
    const wrapper = mountSlider([], true)
    const cards = wrapper.findAllComponents(OfferSliderCard)
    expect(cards).toHaveLength(0)
  })

  it('section ist sichtbar waehrend isLoading === true (kein Layout-Shift)', () => {
    const wrapper = mountSlider([], true)
    expect(wrapper.find('section').exists()).toBe(true)
  })

  // ---- Accessibility ----

  it('section hat role="region" (WCAG 2.1.1)', () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    const section = wrapper.find('section')
    expect(section.attributes('role')).toBe('region')
  })

  it('section hat aria-label "Aktuelle Angebote" (WCAG 2.1.1)', () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    const section = wrapper.find('section')
    expect(section.attributes('aria-label')).toBe('Aktuelle Angebote')
  })

  // ---- Events weiterleiten ----

  it('leitet open-detail-Event aus OfferSliderCard weiter', async () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    const card = wrapper.findComponent(OfferSliderCard)
    await card.vm.$emit('open-detail', products[0])
    const emitted = wrapper.emitted('open-detail')
    expect(emitted).toBeTruthy()
  })

  it('leitet add-to-cart-Event aus OfferSliderCard weiter', async () => {
    const products = [createOfferProduct(1)]
    const wrapper = mountSlider(products)
    const card = wrapper.findComponent(OfferSliderCard)
    await card.vm.$emit('add-to-cart', products[0])
    const emitted = wrapper.emitted('add-to-cart')
    expect(emitted).toBeTruthy()
  })
})
