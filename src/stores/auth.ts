export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null as { id: number; email: string; name: string | null; role: string } | null,
  }),
  
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
  },
  
  actions: {
    async login(credentials: { email: string; password: string }) {
      try {
        const { data } = await useFetch('/api/auth/login', {
          method: 'POST',
          body: credentials,
        })
        
        if (data.value?.success) {
          this.isLoggedIn = true
          this.user = data.value.user as { id: number; email: string; name: string | null; role: string }
          
          return { success: true }
        }
        
        return { success: false, error: data.value?.error || 'Anmeldung fehlgeschlagen' }
      } catch (error) {
        return { success: false, error: 'Ein Fehler ist aufgetreten' }
      }
    },
    
    async logout() {
      this.isLoggedIn = false
      this.user = null
      
      await useFetch('/api/auth/logout', { method: 'POST' })
      
      navigateTo('/login')
    },
    
    async initFromCookie() {
      const authCookie = useCookie('auth_token')
      
      if (authCookie.value) {
        const { data } = await useFetch('/api/auth/me')
        
        if (data.value?.user) {
          this.isLoggedIn = true
          this.user = data.value.user as { id: number; email: string; name: string | null; role: string }
        }
      }
    },
  },
})
