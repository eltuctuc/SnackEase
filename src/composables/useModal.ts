/**
 * useModal - Composable für Modal-Verwaltung
 * 
 * @description
 * Wiederverwendbare Logik für Modal-Handling:
 * - Show/Hide State-Management
 * - Keyboard-Event-Handling (ESC zum Schließen)
 * - Auto-Cleanup bei Component-Unmount
 * - Optional: Auto-Close nach Delay
 * 
 * @example
 * ```vue
 * <script setup>
 * const { isOpen, open, close } = useModal()
 * 
 * // In Template:
 * <button @click="open">Öffnen</button>
 * <Modal :show="isOpen" @close="close" />
 * </script>
 * ```
 * 
 * @example Mit Auto-Close
 * ```vue
 * <script setup>
 * const { isOpen, open, close } = useModal({
 *   enableKeyboard: true,
 *   autoCloseDelay: 3000 // Schließt nach 3s automatisch
 * })
 * </script>
 * ```
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Optionen für useModal Composable
 */
export interface UseModalOptions {
  /**
   * Initialer Zustand des Modals
   * @default false
   */
  initialOpen?: boolean
  
  /**
   * Aktiviert ESC-Taste zum Schließen
   * @default true
   */
  enableKeyboard?: boolean
  
  /**
   * Callback der beim Öffnen aufgerufen wird
   */
  onOpen?: () => void
  
  /**
   * Callback der beim Schließen aufgerufen wird
   */
  onClose?: () => void
  
  /**
   * Optional: Automatisches Schließen nach X Millisekunden
   * Nützlich für Success-Modals
   * @default undefined (kein Auto-Close)
   */
  autoCloseDelay?: number
}

/**
 * Return-Type von useModal
 */
export interface UseModalReturn {
  /** Aktueller Modal-Zustand (offen/geschlossen) */
  isOpen: Ref<boolean>
  
  /** Öffnet das Modal */
  open: () => void
  
  /** Schließt das Modal */
  close: () => void
  
  /** Toggle-Funktion (öffnen wenn zu, schließen wenn offen) */
  toggle: () => void
}

/**
 * Composable für Modal-State-Management
 * 
 * @param options - Optionale Konfiguration
 * @returns Modal-State und Control-Funktionen
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const {
    initialOpen = false,
    enableKeyboard = true,
    onOpen,
    onClose,
    autoCloseDelay,
  } = options

  // ========================================
  // STATE
  // ========================================
  
  /** Modal ist offen/geschlossen */
  const isOpen = ref(initialOpen)
  
  /** Timeout-ID für Auto-Close (falls aktiviert) */
  let autoCloseTimeout: ReturnType<typeof setTimeout> | null = null

  // ========================================
  // METHODS
  // ========================================
  
  /**
   * Öffnet das Modal
   * 
   * @description
   * - Setzt isOpen auf true
   * - Ruft onOpen-Callback auf (falls definiert)
   * - Startet Auto-Close-Timer (falls konfiguriert)
   */
  const open = () => {
    isOpen.value = true
    onOpen?.()
    
    // Auto-Close nach Delay (z.B. für Success-Modals)
    if (autoCloseDelay && autoCloseDelay > 0) {
      autoCloseTimeout = setTimeout(() => {
        close()
      }, autoCloseDelay)
    }
  }

  /**
   * Schließt das Modal
   * 
   * @description
   * - Setzt isOpen auf false
   * - Ruft onClose-Callback auf (falls definiert)
   * - Stoppt Auto-Close-Timer (falls aktiv)
   */
  const close = () => {
    isOpen.value = false
    onClose?.()
    
    // Clear Auto-Close-Timer falls vorhanden
    if (autoCloseTimeout) {
      clearTimeout(autoCloseTimeout)
      autoCloseTimeout = null
    }
  }

  /**
   * Toggle Modal-Zustand
   * 
   * Öffnet Modal wenn geschlossen, schließt wenn offen.
   */
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  // ========================================
  // KEYBOARD HANDLING
  // ========================================
  
  /**
   * Keyboard-Event-Handler für ESC-Taste
   * 
   * @description
   * Ermöglicht Schließen des Modals via ESC-Taste für bessere UX.
   * Wird nur registriert wenn enableKeyboard = true.
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      close()
    }
  }

  // ========================================
  // LIFECYCLE
  // ========================================
  
  /**
   * Component-Mount: Event-Listener registrieren
   * 
   * WICHTIG: Nur im Browser registrieren (SSR-Safe)
   */
  if (enableKeyboard) {
    onMounted(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeydown)
      }
    })
  }

  /**
   * Component-Unmount: Cleanup
   * 
   * - Entfernt Event-Listener
   * - Stoppt Auto-Close-Timer
   * 
   * Verhindert Memory-Leaks!
   */
  onUnmounted(() => {
    if (enableKeyboard && typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown)
    }
    
    // Clear Timer falls noch aktiv
    if (autoCloseTimeout) {
      clearTimeout(autoCloseTimeout)
    }
  })

  // ========================================
  // RETURN
  // ========================================
  
  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
