// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: [
    'vuetify/styles',
  ],
  build: {
    transpile: ['vuetify'],
  },
  plugins: [
    '~/plugins/vue-konva.js',
    '~/plugins/vuetify.js',
  ],
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
})
