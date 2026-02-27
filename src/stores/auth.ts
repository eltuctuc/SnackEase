export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null as { id: number; email: string; name: string | null; role: string; location: string | null } | null,
  }),
  
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isMitarbeiter: (state) => state.user?.role === 'mitarbeiter',
  },
  
  actions: {
    async login(credentials: { email: string; password: string }) {
      try {
        const data = await $fetch<{ success: boolean; user: { id: number; email: string; name: string | null; role: string; location: string | null } | null; error?: string }>('/api/auth/login', {
          method: 'POST',
          body: credentials,
        })
        
        if (data.success) {
          this.isLoggedIn = true
          this.user = data.user as { id: number; email: string; name: string | null; role: string; location: string | null }
          
          return { success: true }
        }
        
        return { success: false, error: data.error || 'Anmeldung fehlgeschlagen' }
      } catch (error) {
        return { success: false, error: 'Ein Fehler ist aufgetreten' }
      }
    },
    
    async logout() {
      this.isLoggedIn = false
      this.user = null
      
      await $fetch('/api/auth/logout', { method: 'POST' })
      
      navigateTo('/login')
    },
    
    async initFromCookie() {
      const authCookie = useCookie('auth_token')
      
      if (authCookie.value) {
        try {
          const data = await $fetch<{ success: boolean; user: { id: number; email: string; name: string | null; role: string; location: string | null } | null }>('/api/auth/me')
          
          if (data?.user) {
            this.isLoggedIn = true
            this.user = data.user as { id: number; email: string; name: string | null; role: string; location: string | null }
          }
        } catch (e) {
          // Silent fail - user stays logged out
        }
      }
    },
  },
})
