import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User, Purchase, Product } from '@/lib/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  const demoUsers: User[] = [
    { id: '1', name: 'Nina Neuanfang', location: 'Nürnberg', credit: 25, role: 'mitarbeiter', avatar: 'N' },
    { id: '2', name: 'Maxine Snackliebhaber', location: 'Berlin', credit: 15, role: 'mitarbeiter', avatar: 'M' },
    { id: '3', name: 'Lucas Gesundheitsfan', location: 'Nürnberg', credit: 30, role: 'mitarbeiter', avatar: 'L' },
    { id: '4', name: 'Alex Gelegenheitskäufer', location: 'Berlin', credit: 20, role: 'mitarbeiter', avatar: 'A' },
    { id: '5', name: 'Tom Schnellkäufer', location: 'Nürnberg', credit: 10, role: 'mitarbeiter', avatar: 'T' },
    { id: 'admin', name: 'Admin', location: 'Nürnberg', credit: 0, role: 'admin', avatar: 'A' },
  ]

  async function loadUsers() {
    const { data } = await supabase.from('users').select('*')
    if (data && data.length > 0) {
      users.value = data as User[]
    } else {
      users.value = demoUsers
      for (const user of demoUsers) {
        await supabase.from('users').upsert(user)
      }
    }
    currentUser.value = users.value[0] || demoUsers[0]
  }

  function switchUser(userId: string) {
    const user = users.value.find(u => u.id === userId)
    if (user) {
      currentUser.value = user
      sessionStorage.setItem('currentUserId', userId)
    }
  }

  async function updateCredit(amount: number) {
    if (!currentUser.value) return
    currentUser.value.credit += amount
    await supabase.from('users').update({ credit: currentUser.value.credit }).eq('id', currentUser.value.id)
  }

  function loadFromSession() {
    const savedId = sessionStorage.getItem('currentUserId')
    if (savedId && users.value.length > 0) {
      const user = users.value.find(u => u.id === savedId)
      if (user) currentUser.value = user
    }
  }

  return { currentUser, users, isAdmin, loadUsers, switchUser, updateCredit, loadFromSession }
})
