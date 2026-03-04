export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const protectedPaths = ['/dashboard']
  const adminPaths = ['/admin']

  const isProtected = protectedPaths.includes(to.path) || adminPaths.some(p => to.path.startsWith(p))

  if (!isProtected) return

  const authStore = useAuthStore()

  // Use cached store state; fetch from server if not yet initialized
  if (!authStore.user) {
    await authStore.initFromCookie()
  }

  if (!authStore.user) {
    return navigateTo('/login')
  }

  // Admin-only routes
  if (adminPaths.some(p => to.path.startsWith(p)) && authStore.user.role !== 'admin') {
    return navigateTo('/login')
  }
})
