/**
 * Unit-Tests für useModal Composable
 * 
 * Testet Modal-Verwaltung:
 * - open() / close() / toggle()
 * - ESC-Taste zum Schließen
 * - Auto-Close nach Delay
 * - Callbacks (onOpen, onClose)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useModal } from '~/composables/useModal'

describe('useModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('startet mit geschlossenem Modal per Default', () => {
      const { isOpen } = useModal()
      
      expect(isOpen.value).toBe(false)
    })

    it('respektiert initialOpen Option', () => {
      const { isOpen } = useModal({ initialOpen: true })
      
      expect(isOpen.value).toBe(true)
    })
  })

  describe('open()', () => {
    it('öffnet das Modal', () => {
      const { isOpen, open } = useModal()
      
      open()
      
      expect(isOpen.value).toBe(true)
    })

    it('ruft onOpen-Callback auf', () => {
      const onOpen = vi.fn()
      const { open } = useModal({ onOpen })
      
      open()
      
      expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it('startet Auto-Close-Timer wenn konfiguriert', () => {
      const { isOpen, open } = useModal({ autoCloseDelay: 1000 })
      
      open()
      expect(isOpen.value).toBe(true)
      
      vi.advanceTimersByTime(1000)
      
      expect(isOpen.value).toBe(false)
    })
  })

  describe('close()', () => {
    it('schließt das Modal', () => {
      const { isOpen, open, close } = useModal()
      
      open()
      expect(isOpen.value).toBe(true)
      
      close()
      expect(isOpen.value).toBe(false)
    })

    it('ruft onClose-Callback auf', () => {
      const onClose = vi.fn()
      const { open, close } = useModal({ onClose })
      
      open()
      close()
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('stoppt Auto-Close-Timer', () => {
      const { isOpen, open, close } = useModal({ autoCloseDelay: 1000 })
      
      open()
      expect(isOpen.value).toBe(true)
      
      // Schließe vor Ablauf des Timers
      vi.advanceTimersByTime(500)
      close()
      
      // Timer sollte gestoppt sein
      vi.advanceTimersByTime(600)
      expect(isOpen.value).toBe(false)
    })
  })

  describe('toggle()', () => {
    it('öffnet geschlossenes Modal', () => {
      const { isOpen, toggle } = useModal()
      
      expect(isOpen.value).toBe(false)
      toggle()
      expect(isOpen.value).toBe(true)
    })

    it('schließt geöffnetes Modal', () => {
      const { isOpen, toggle } = useModal({ initialOpen: true })
      
      expect(isOpen.value).toBe(true)
      toggle()
      expect(isOpen.value).toBe(false)
    })

    it('ruft entsprechende Callbacks auf', () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const { toggle } = useModal({ onOpen, onClose })
      
      toggle() // Öffnen
      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(0)
      
      toggle() // Schließen
      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Keyboard Handling', () => {
    it('schließt Modal bei ESC-Taste per Default', async () => {
      const { isOpen, open } = useModal()
      
      open()
      expect(isOpen.value).toBe(true)
      
      // Simuliere ESC-Tastendruck
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)
      
      await nextTick()
      expect(isOpen.value).toBe(false)
    })

    it('ignoriert ESC-Taste wenn enableKeyboard=false', async () => {
      const { isOpen, open } = useModal({ enableKeyboard: false })
      
      open()
      expect(isOpen.value).toBe(true)
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)
      
      await nextTick()
      expect(isOpen.value).toBe(true)
    })

    it('ignoriert andere Tasten', async () => {
      const { isOpen, open } = useModal()
      
      open()
      expect(isOpen.value).toBe(true)
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      window.dispatchEvent(event)
      
      await nextTick()
      expect(isOpen.value).toBe(true)
    })

    it('ignoriert ESC wenn Modal bereits geschlossen', async () => {
      const onClose = vi.fn()
      const { isOpen } = useModal({ onClose })
      
      expect(isOpen.value).toBe(false)
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)
      
      await nextTick()
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Auto-Close', () => {
    it('schließt Modal automatisch nach Delay', () => {
      const onClose = vi.fn()
      const { isOpen, open } = useModal({ 
        autoCloseDelay: 2000,
        onClose 
      })
      
      open()
      expect(isOpen.value).toBe(true)
      
      vi.advanceTimersByTime(2000)
      
      expect(isOpen.value).toBe(false)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('startet Timer nur bei open()', () => {
      const { isOpen } = useModal({ 
        initialOpen: true,
        autoCloseDelay: 1000 
      })
      
      // Timer sollte nicht starten nur durch initialOpen
      vi.advanceTimersByTime(1000)
      expect(isOpen.value).toBe(true)
    })

    it('startet Timer neu bei erneutem open()', () => {
      const { isOpen, open, close } = useModal({ autoCloseDelay: 1000 })
      
      open()
      vi.advanceTimersByTime(500)
      close()
      
      open() // Neuer Timer
      vi.advanceTimersByTime(500)
      expect(isOpen.value).toBe(true) // Noch offen
      
      vi.advanceTimersByTime(500)
      expect(isOpen.value).toBe(false) // Jetzt geschlossen
    })
  })

  describe('Integration', () => {
    it('kompletter Workflow: open → close → toggle', () => {
      const onOpen = vi.fn()
      const onClose = vi.fn()
      const { isOpen, open, close, toggle } = useModal({ onOpen, onClose })
      
      // Initial geschlossen
      expect(isOpen.value).toBe(false)
      
      // Öffnen
      open()
      expect(isOpen.value).toBe(true)
      expect(onOpen).toHaveBeenCalledTimes(1)
      
      // Schließen
      close()
      expect(isOpen.value).toBe(false)
      expect(onClose).toHaveBeenCalledTimes(1)
      
      // Toggle (öffnen)
      toggle()
      expect(isOpen.value).toBe(true)
      expect(onOpen).toHaveBeenCalledTimes(2)
      
      // Toggle (schließen)
      toggle()
      expect(isOpen.value).toBe(false)
      expect(onClose).toHaveBeenCalledTimes(2)
    })

    it('ESC und Auto-Close kombiniert', async () => {
      const { isOpen, open } = useModal({ autoCloseDelay: 2000 })
      
      open()
      expect(isOpen.value).toBe(true)
      
      // Schließe mit ESC vor Auto-Close
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)
      
      await nextTick()
      expect(isOpen.value).toBe(false)
      
      // Auto-Close-Timer sollte gestoppt sein
      vi.advanceTimersByTime(2000)
      expect(isOpen.value).toBe(false)
    })
  })
})
