/**
 * Notifications Store — FEAT-13: Low-Stock-Benachrichtigungen
 *
 * Verwaltet Low-Stock-Benachrichtigungen für den Admin.
 * Pollt alle 30 Sekunden im Hintergrund.
 */

export interface Notification {
  id: number
  productId: number
  productName: string
  productCategory: string
  stockQuantity: number
  isRead: boolean
  createdAt: string | null
  readAt: string | null
}

interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let pollingInterval: ReturnType<typeof setInterval> | null = null

  // ========================================
  // AKTIONEN
  // ========================================

  async function fetchNotifications() {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<NotificationsResponse>('/api/admin/notifications')
      notifications.value = data.notifications
      unreadCount.value = data.unreadCount
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Laden der Benachrichtigungen'
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(id: number) {
    try {
      await $fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' })
      // Lokal aktualisieren ohne erneuten API-Aufruf
      const notification = notifications.value.find((n) => n.id === id)
      if (notification && !notification.isRead) {
        notification.isRead = true
        notification.readAt = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Markieren der Benachrichtigung'
      throw err
    }
  }

  async function markAllAsRead() {
    try {
      await $fetch('/api/admin/notifications/read-all', { method: 'POST' })
      // Lokal alle als gelesen markieren
      notifications.value.forEach((n) => {
        n.isRead = true
        n.readAt = new Date().toISOString()
      })
      unreadCount.value = 0
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Markieren aller Benachrichtigungen'
      throw err
    }
  }

  function startPolling() {
    if (pollingInterval !== null) return
    pollingInterval = setInterval(() => {
      fetchNotifications()
    }, 30_000)
  }

  function stopPolling() {
    if (pollingInterval !== null) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  }
})
