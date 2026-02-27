export default defineNuxtRouteMiddleware((to) => {
  const authCookie = useCookie('auth_token')
  
  if (to.path === '/dashboard' && !authCookie.value) {
    return navigateTo('/login')
  }
})
