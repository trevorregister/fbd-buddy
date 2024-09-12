<template>
    <slot></slot>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { provideCanvasDimensions } from '~/composables/useCanvasDimensions'
  
  const props = defineProps({
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  })
  
  onMounted(() => {
    provideCanvasDimensions(props.width, props.height)
  })
  </script>