export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }
  
  const authCookie = useCookie('auth_token')
  
  if (to.path === '/dashboard' && !authCookie.value) {
    return navigateTo('/login')
  }
  
  if (to.path.startsWith('/admin')) {
    if (!authCookie.value) {
      return navigateTo('/login')
    }
    
    // Prüfe Admin-Rolle
    try {
      const { data } = await useFetch('/api/auth/me')
      if (!data.value?.user || data.value.user.role !== 'admin') {
        return navigateTo('/login')
      }
    } catch (error) {
      return navigateTo('/login')
    }
  }
})
