/**
 * Auth Store - Verwaltung der Benutzer-Authentifizierung
 * 
 * @description
 * Dieser Store verwaltet:
 * - Login/Logout-Funktionalität
 * - User-Session-State
 * - Auth-Cookie-Handling
 * - Rolle-basierte Berechtigungen (Admin, Mitarbeiter)
 * 
 * REFACTORING:
 * Von Options API (state/getters/actions) zu Composition API (setup-Syntax)
 * für Konsistenz mit credits.ts und products.ts Stores.
 * 
 * @see src/types/user.ts für Type-Definitionen
 */

import type { User, LoginCredentials, LoginResponse, MeResponse } from '~/types'
import { useCartStore } from '~/stores/cart'

/**
 * Auth Store mit Composition API
 * 
 * MIGRATION: Options API → Composition API
 * 
 * VORHER (Options API):
 * - state: () => ({ ... })
 * - getters: { ... }
 * - actions: { ... }
 * 
 * NACHHER (Composition API):
 * - const state = ref(...)
 * - const getter = computed(...)
 * - const action = async () => { ... }
 * - return { state, getter, action }
 */
export const useAuthStore = defineStore('auth', () => {
  // ========================================
  // STATE - Reactive Properties
  // ========================================
  
  /**
   * Login-Status
   * 
   * @description
   * true = User ist eingeloggt (hat valides Session-Cookie)
   * false = User ist ausgeloggt oder Session abgelaufen
   */
  const isLoggedIn = ref(false)
  
  /**
   * Aktuell eingeloggter User
   * 
   * @description
   * Enthält User-Daten nach erfolgreichem Login:
   * - id: User-ID (Primary Key)
   * - email: Email-Adresse
   * - name: Anzeigename
   * - role: Benutzerrolle ('admin' | 'mitarbeiter')
   * - location: Standort ('Nürnberg' | 'Berlin')
   * 
   * null = Kein User eingeloggt
   */
  const user = ref<User | null>(null)

  // ========================================
  // GETTERS - Computed Properties
  // ========================================
  
  /**
   * Prüft ob eingeloggter User Admin ist
   * 
   * @returns true wenn User Admin-Rolle hat, sonst false
   * 
   * @description
   * Wird verwendet für:
   * - Anzeige von Admin-Links (z.B. Admin-Panel-Link)
   * - Route-Guards für Admin-Only-Pages
   * - Conditional-Rendering von Admin-Features
   * 
   * @example
   * <NuxtLink v-if="authStore.isAdmin" to="/admin">Admin</NuxtLink>
   */
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  /**
   * Prüft ob eingeloggter User Mitarbeiter ist
   * 
   * @returns true wenn User Mitarbeiter-Rolle hat, sonst false
   * 
   * @description
   * Wird verwendet für:
   * - Feature-Toggling (z.B. Monatspauschale nur für Mitarbeiter)
   * - Conditional-Rendering
   * 
   * BEACHTE: Admins haben auch Mitarbeiter-Rechte!
   * Für "NUR Mitarbeiter" verwende: isMitarbeiter && !isAdmin
   */
  const isMitarbeiter = computed(() => user.value?.role === 'mitarbeiter')

  // ========================================
  // ACTIONS - Methods
  // ========================================
  
  /**
   * Meldet User an (Login)
   * 
   * @param credentials - Email und Passwort
   * @returns Promise mit success-Flag und optionaler error-Message
   * 
   * @description
   * Workflow:
   * 1. POST /api/auth/login mit Credentials
   * 2. Backend prüft:
   *    - Email-Domain (@demo.de)
   *    - Passwort-Hash (bcrypt)
   *    - User-Rolle (admin oder mitarbeiter)
   *    - Account-Status (isActive = true)
   * 3. Bei Erfolg:
   *    - Backend setzt Session-Cookie (httpOnly)
   *    - Store aktualisiert isLoggedIn und user
   *    - Returned { success: true }
   * 4. Bei Fehler:
   *    - Returned { success: false, error: '...' }
   * 
   * @example
   * const result = await authStore.login({
   *   email: 'admin@demo.de',
   *   password: 'geheim123'
   * })
   * 
   * if (result.success) {
   *   router.push('/dashboard')
   * } else {
   *   showError(result.error)
   * }
   * 
   * @see src/server/api/auth/login.post.ts für Backend-Implementierung
   */
  async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await $fetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })
      
      if (data.success && data.user) {
        isLoggedIn.value = true
        user.value = data.user

        // FEAT-16: Warenkorb für User laden
        const cartStore = useCartStore()
        cartStore.setUserId(data.user.id)

        return { success: true }
      }
      
      return { success: false, error: data.error || 'Anmeldung fehlgeschlagen' }
    } catch (error) {
      // Network-Error oder Server-Error
      return { success: false, error: 'Ein Fehler ist aufgetreten' }
    }
  }
  
  /**
   * Meldet User ab (Logout)
   * 
   * @description
   * Workflow:
   * 1. Resettet Store-State (isLoggedIn = false, user = null)
   * 2. POST /api/auth/logout (Backend löscht Session-Cookie)
   * 3. Navigiert zu Login-Page
   * 
   * BEACHTE:
   * - State wird SOFORT resettet (optimistic update)
   * - Backend-Call läuft async (Cookie-Deletion)
   * - Navigation blockiert nicht auf Backend-Response
   * 
   * @example
   * <button @click="authStore.logout()">Abmelden</button>
   * 
   * @see src/server/api/auth/logout.post.ts für Backend-Implementierung
   */
  async function logout(): Promise<void> {
    // Optimistic Update: State sofort resetten
    isLoggedIn.value = false
    user.value = null

    // FEAT-16: Warenkorb löschen
    const cartStore = useCartStore()
    cartStore.logout()

    // Backend: Session-Cookie löschen (async, nicht blockierend)
    await $fetch('/api/auth/logout', { method: 'POST' })

    // Redirect zu Login-Page
    navigateTo('/login')
  }
  
  /**
   * Initialisiert User-Session aus Cookie
   * 
   * @description
   * Wird beim App-Start aufgerufen um Session wiederherzustellen.
   * 
   * Workflow:
   * 1. Prüft ob auth_token Cookie existiert
   * 2. GET /api/auth/me (Backend validiert Cookie und gibt User zurück)
   * 3. Bei Erfolg: Store aktualisiert isLoggedIn und user
   * 4. Bei Fehler: Silent fail (User bleibt ausgeloggt)
   * 
   * WICHTIG:
   * - Silent Fail bei Fehler (keine Error-Message)
   * - Cookie kann abgelaufen oder invalide sein
   * - User muss sich neu einloggen falls Session ungültig
   * 
   * @example
   * // In dashboard.vue onMounted:
   * await authStore.initFromCookie()
   * if (!authStore.user) {
   *   router.push('/login')
   * }
   * 
   * @see src/server/api/auth/me.get.ts für Backend-Implementierung
   */
  async function initFromCookie(): Promise<void> {
    try {
      // httpOnly-Cookies sind client-seitig nicht lesbar (document.cookie).
      // Deshalb direkt /api/auth/me aufrufen – der Server liest den Cookie.
      const data = await $fetch<MeResponse>('/api/auth/me')

      // Cookie valide und User gefunden
      if (data?.user) {
        isLoggedIn.value = true
        user.value = data.user

        // FEAT-16: Warenkorb für User laden
        const cartStore = useCartStore()
        cartStore.setUserId(data.user.id)
      }
    } catch (e) {
      // Silent fail - Cookie abgelaufen oder invalide
      // User bleibt ausgeloggt (isLoggedIn = false)
    }
  }

  // ========================================
  // RETURN - Public API
  // ========================================
  
  /**
   * Store-Exports
   * 
   * @description
   * Alle State-Properties, Getters und Actions die von Components
   * verwendet werden können.
   * 
   * WICHTIG: Nur explizit exportierte Properties sind public.
   */
  return {
    // State
    isLoggedIn,
    user,
    
    // Getters (Computed)
    isAdmin,
    isMitarbeiter,
    
    // Actions
    login,
    logout,
    initFromCookie,
  }
})
