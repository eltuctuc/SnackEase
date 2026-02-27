export default defineNuxtConfig({
  srcDir: 'src/',

  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  routeRules: {
    '/login': { ssr: false },
    '/dashboard': { ssr: false },
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
      ],
    },
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2025-01-01',
})
