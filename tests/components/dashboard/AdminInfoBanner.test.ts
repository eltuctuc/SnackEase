/**
 * Unit-Tests fuer AdminInfoBanner Komponente (FEAT-9)
 *
 * Testet:
 * - Korrekte Darstellung (SVG-Icon sichtbar, Text vorhanden, Link zu /admin)
 * - Accessibility-Attribute (role, aria-label)
 * - Tailwind-Klassen fuer blaues Info-Panel
 *
 * HINWEIS: NuxtLink wird als einfacher <a>-Tag gemockt,
 * da Nuxt-Routing im Test-Kontext nicht verfuegbar ist.
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminInfoBanner from '~/components/dashboard/AdminInfoBanner.vue'
import { defineComponent, h } from 'vue'

/**
 * Mock fuer NuxtLink: rendert als <a>-Tag mit to-Attribut als href
 */
const NuxtLinkMock = defineComponent({
  name: 'NuxtLink',
  props: { to: String },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

describe('AdminInfoBanner (FEAT-9)', () => {
  function mountBanner() {
    return mount(AdminInfoBanner, {
      global: {
        components: {
          NuxtLink: NuxtLinkMock,
        },
      },
    })
  }

  it('rendert ohne Fehler', () => {
    const wrapper = mountBanner()
    expect(wrapper.exists()).toBe(true)
  })

  it('hat role="region" fuer Accessibility', () => {
    const wrapper = mountBanner()
    const region = wrapper.find('[role="region"]')
    expect(region.exists()).toBe(true)
  })

  it('hat aria-label auf dem Haupt-Container', () => {
    const wrapper = mountBanner()
    const region = wrapper.find('[role="region"]')
    expect(region.attributes('aria-label')).toBeTruthy()
  })

  it('zeigt den Titel "Admin-Modus aktiv"', () => {
    const wrapper = mountBanner()
    expect(wrapper.text()).toContain('Admin-Modus aktiv')
  })

  it('zeigt Erklaerungstext ueber fehlendes Guthaben', () => {
    const wrapper = mountBanner()
    expect(wrapper.text()).toContain('kein persoenliches Guthaben-Konto')
  })

  it('zeigt CTA-Link zum Admin-Bereich', () => {
    const wrapper = mountBanner()
    expect(wrapper.text()).toContain('Zum Admin-Bereich')
  })

  it('CTA-Link zeigt auf /admin', () => {
    const wrapper = mountBanner()
    const link = wrapper.find('a[href="/admin"]')
    expect(link.exists()).toBe(true)
  })

  it('CTA-Link hat aria-label fuer Accessibility', () => {
    const wrapper = mountBanner()
    const link = wrapper.find('a[href="/admin"]')
    expect(link.attributes('aria-label')).toBeTruthy()
  })

  it('enthaelt ein SVG-Icon (kein Emoji)', () => {
    const wrapper = mountBanner()
    const svgs = wrapper.findAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('SVG-Icon ist aria-hidden (dekorativ)', () => {
    const wrapper = mountBanner()
    // Das erste SVG (Info-Icon) ist dekorativ
    const firstSvg = wrapper.find('svg')
    expect(firstSvg.attributes('aria-hidden')).toBe('true')
  })

  it('hat blaue Hintergrund-Klassen (blaues Info-Panel)', () => {
    const wrapper = mountBanner()
    const container = wrapper.find('[role="region"]')
    expect(container.classes()).toContain('bg-blue-50')
    expect(container.classes()).toContain('border-blue-200')
  })

  it('hat identische Rahmen-Optik wie BalanceCard (rounded-lg, border-2, p-6)', () => {
    const wrapper = mountBanner()
    const container = wrapper.find('[role="region"]')
    expect(container.classes()).toContain('rounded-lg')
    expect(container.classes()).toContain('border-2')
    expect(container.classes()).toContain('p-6')
  })

  it('Text hat blaue Farbe (text-blue-800)', () => {
    const wrapper = mountBanner()
    const container = wrapper.find('[role="region"]')
    expect(container.classes()).toContain('text-blue-800')
  })
})
