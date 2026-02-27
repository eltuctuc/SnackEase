export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }
  
  const authCookie = useCookie('auth_token')
  
  if (to.path === '/dashboard' && !authCookie.value) {
    return navigateTo('/login')
  }
})
