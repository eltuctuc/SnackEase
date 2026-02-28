export const useCreditsStore = defineStore('credits', () => {
  const balance = ref('0')
  const lastRechargedAt = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const balanceNumeric = computed(() => parseFloat(balance.value) || 0)

  const balanceStatus = computed(() => {
    const value = balanceNumeric.value
    if (value > 20) return 'good'
    if (value >= 10) return 'warning'
    return 'critical'
  })

  async function fetchBalance() {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<{
        userId: number
        balance: string
        lastRechargedAt: string | null
      }>('/api/credits/balance')

      balance.value = data.balance
      lastRechargedAt.value = data.lastRechargedAt
    } catch (err: unknown) {
      const e = err as { message?: string }
      error.value = e.message || 'Fehler beim Laden des Guthabens'
    } finally {
      isLoading.value = false
    }
  }

  async function recharge(amount: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<{
        success: boolean
        newBalance: string
        message: string
      }>('/api/credits/recharge', {
        method: 'POST',
        body: { amount },
      })

      if (data.success) {
        balance.value = data.newBalance
        lastRechargedAt.value = new Date().toISOString()
        return { success: true }
      }

      return { success: false, error: data.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const errorMessage = e.data?.message || 'Fehler beim Aufladen'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  async function receiveMonthly(): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<{
        success: boolean
        newBalance: string
        message: string
      }>('/api/credits/monthly', {
        method: 'POST',
      })

      if (data.success) {
        balance.value = data.newBalance
        lastRechargedAt.value = new Date().toISOString()
        return { success: true }
      }

      return { success: false, error: data.message }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } }
      const errorMessage = e.data?.message || 'Fehler bei Monatspauschale'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  return {
    balance,
    lastRechargedAt,
    isLoading,
    error,
    balanceNumeric,
    balanceStatus,
    fetchBalance,
    recharge,
    receiveMonthly,
  }
})
