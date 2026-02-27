export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null as { id: number; email: string; name: string; role: string } | null,
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
          this.user = data.value.user
          
          const authCookie = useCookie('auth_token', {
            maxAge: 60 * 60 * 24 * 7,
            secure: true,
            sameSite: 'lax',
          })
          authCookie.value = `user_${data.value.user.id}`
          
          return { success: true }
        }
        
        return { success: false, error: data.value?.error || 'Anmeldung fehlgeschlagen' }
      } catch (error) {
        return { success: false, error: 'Ein Fehler ist aufgetreten' }
      }
    },
    
    logout() {
      this.isLoggedIn = false
      this.user = null
      
      const authCookie = useCookie('auth_token')
      authCookie.value = null
      
      navigateTo('/login')
    },
    
    async initFromCookie() {
      const authCookie = useCookie('auth_token')
      
      if (authCookie.value) {
        const { data } = await useFetch('/api/auth/me')
        
        if (data.value?.user) {
          this.isLoggedIn = true
          this.user = data.value.user
        }
      }
    },
  },
})
