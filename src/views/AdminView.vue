<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/lib/supabase'

const userStore = useUserStore()

const showResetModal = ref(false)
const resetOptions = ref({
  credit: true,
  purchases: true,
  leaderboard: true,
})
const confirmText = ref('')
const isResetting = ref(false)

async function resetSystem() {
  if (confirmText.value !== 'RESET') {
    alert('Bitte "RESET" eintippen zur Bestätigung')
    return
  }
  
  isResetting.value = true
  
  try {
    if (resetOptions.value.purchases) {
      await supabase.from('purchases').delete().neq('id', '')
    }
    
    if (resetOptions.value.leaderboard) {
      // Leaderboard is derived from purchases, so this is handled by purchases reset
    }
    
    if (resetOptions.value.credit) {
      const users = await supabase.from('users').select('*').neq('role', 'admin')
      if (users.data) {
        for (const user of users.data) {
          await supabase.from('users').update({ credit: 25 }).eq('id', user.id)
        }
      }
    }
    
    await userStore.loadUsers()
    alert('System erfolgreich zurückgesetzt!')
    showResetModal.value = false
    confirmText.value = ''
  } catch (error) {
    console.error('Reset failed:', error)
    alert('Reset fehlgeschlagen!')
  } finally {
    isResetting.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Admin-Bereich</h2>
    
    <div class="space-y-6">
      <!-- System Reset -->
      <div class="bg-card rounded-lg border border-border p-6">
        <h3 class="font-bold text-lg mb-4">System-Reset</h3>
        <p class="text-muted-foreground mb-4">
          Setzen Sie die Demo-Daten auf den Startzustand zurück.
        </p>
        <button
          @click="showResetModal = true"
          class="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          System zurücksetzen
        </button>
      </div>
      
      <!-- Nutzerübersicht -->
      <div class="bg-card rounded-lg border border-border p-6">
        <h3 class="font-bold text-lg mb-4">Nutzer ({{ userStore.users.length }})</h3>
        <div class="space-y-2">
          <div 
            v-for="user in userStore.users" 
            :key="user.id"
            class="flex items-center justify-between p-2 bg-muted rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                {{ user.avatar }}
              </div>
              <div>
                <div class="font-medium">{{ user.name }}</div>
                <div class="text-xs text-muted-foreground">{{ user.location }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold">{{ user.credit }}€</div>
              <div class="text-xs text-muted-foreground">{{ user.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Reset Modal -->
    <div v-if="showResetModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
        <h3 class="font-bold text-lg mb-4">System-Reset</h3>
        
        <div class="space-y-3 mb-6">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="resetOptions.credit" class="w-4 h-4" />
            <span>Nur Guthaben auf 25€ zurücksetzen</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="resetOptions.purchases" class="w-4 h-4" />
            <span>Nur Käufe/Historie löschen</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="resetOptions.leaderboard" class="w-4 h-4" />
            <span>Nur Leaderboard zurücksetzen</span>
          </label>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">
            Zur Bestätigung "RESET" eintippen:
          </label>
          <input 
            v-model="confirmText"
            type="text" 
            class="w-full px-3 py-2 rounded-lg border border-input bg-background"
            placeholder="RESET"
          />
        </div>
        
        <div class="flex gap-3">
          <button
            @click="showResetModal = false"
            class="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted"
          >
            Abbrechen
          </button>
          <button
            @click="resetSystem"
            :disabled="isResetting || confirmText !== 'RESET'"
            class="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:opacity-90 disabled:opacity-50"
          >
            {{ isResetting ? '...' : 'Zurücksetzen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
