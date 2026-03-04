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
  // Nicht-Admins werden zu /dashboard weitergeleitet (nicht zu /login)
  // Siehe FEAT-5 Edge Case EC-1 und BUG-FEAT5-001
  if (adminPaths.some(p => to.path.startsWith(p)) && authStore.user.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
