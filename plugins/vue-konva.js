import VueKonva from 'vue-konva'

export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.client) {
      import('vue-konva').then((VueKonva) => {
        nuxtApp.vueApp.use(VueKonva.default)
      })
    }
  })