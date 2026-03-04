export default defineNuxtConfig({
  srcDir: 'src/',

  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  routeRules: {
    // SPA-Modus für dynamische Seiten
    '/login': { ssr: false },
    '/dashboard': { ssr: false },
    '/admin/**': { ssr: false },
    
    // Statische Seiten (könnten gecached werden)
    '/': { prerender: false },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'SnackEase - Dein Weg zu Gesundheit und Genuss',
      htmlAttrs: {
        lang: 'de',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'SnackEase - Gesunde Snacks fürs Büro' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  nitro: {
    compressPublicAssets: true,
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2025-01-01',
})
