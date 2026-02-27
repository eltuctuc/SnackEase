export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  if (to.path === '/dashboard' && isLoggedIn !== 'true') {
    return navigateTo('/login')
  }
})
