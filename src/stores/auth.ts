export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null as { id: number; email: string; name: string } | null,
  }),
  
  actions: {
    login(userData: { id: number; email: string; name: string }) {
      this.isLoggedIn = true
      this.user = userData
      
      const authCookie = useCookie('auth_token', {
        maxAge: 60 * 60 * 24 * 7,
        secure: true,
        sameSite: 'lax',
      })
      authCookie.value = 'authenticated'
    },
    
    logout() {
      this.isLoggedIn = false
      this.user = null
      
      const authCookie = useCookie('auth_token')
      authCookie.value = null
    },
    
    initFromCookie() {
      const authCookie = useCookie('auth_token')
      this.isLoggedIn = !!authCookie.value
    },
  },
})
