export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const protectedPaths = [
    '/dashboard',
    '/leaderboard',
    '/orders',
    '/search',
    '/profile',
    '/cart',
    '/product',
    '/profile/credit',
    '/profile/payment',
  ]
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

  // REQ-37: Admin auf /dashboard wird zu /admin weitergeleitet
  if (to.path === '/dashboard' && authStore.user.role === 'admin') {
    return navigateTo('/admin')
  }

  // Leaderboard: Admins werden zu /admin weitergeleitet (FEAT-8 AC-3)
  if (to.path === '/leaderboard' && authStore.user.role === 'admin') {
    return navigateTo('/admin')
  }

  // FEAT-20 AC-19: Admins haben keinen Zugriff auf /profile (zu /admin weiterleiten)
  if (to.path === '/profile' && authStore.user.role === 'admin') {
    return navigateTo('/admin')
  }

  // FEAT-24 EC-4: Admins haben keinen Zugriff auf /profile/credit und /profile/payment
  if ((to.path === '/profile/credit' || to.path === '/profile/payment') && authStore.user.role === 'admin') {
    return navigateTo('/admin')
  }
})
