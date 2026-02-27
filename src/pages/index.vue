<script setup lang="ts">
const router = useRouter()
const progress = ref(0)
const isLoaded = ref(false)

const modules = [
  () => import('~/pages/login.vue'),
  () => import('~/pages/dashboard.vue'),
]

const loadModules = async () => {
  const total = modules.length
  let loaded = 0
  
  for (const mod of modules) {
    try {
      await mod()
      loaded++
      progress.value = Math.round((loaded / total) * 100)
    } catch (e) {
      console.error('Failed to load module', e)
      loaded++
      progress.value = Math.round((loaded / total) * 100)
    }
  }
  
  isLoaded.value = true
}

const checkLoginAndRedirect = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  if (isLoggedIn === 'true') {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

onMounted(async () => {
  await loadModules()
  
  setTimeout(() => {
    checkLoginAndRedirect()
  }, 3000)
})
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <div class="text-center max-w-md">
      <div class="mb-8">
        <h1 class="text-5xl font-bold text-primary">SnackEase</h1>
      </div>
      
      <p class="text-xl text-primary/80 mb-12">
        Dein Weg zu Gesundheit und Genuss
      </p>
      
      <div class="w-full">
        <div class="h-2 bg-accent/20 rounded-full overflow-hidden mb-2">
          <div 
            class="h-full bg-accent transition-all duration-300 ease-out rounded-full"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        
        <p class="text-sm text-muted-foreground">
          {{ progress }}% geladen
        </p>
      </div>
    </div>
  </div>
</template>
