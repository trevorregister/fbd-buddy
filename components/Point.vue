<template>
    <v-circle :config="circleConfig" />
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { gridToCanvasCoordinates } from '~/utils/coordinates'
  
  const props = defineProps({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    radius: { type: Number, default: 5 },
    fill: { type: String, default: 'red' }
  })
  
  const circleConfig = computed(() => {
    const { x, y } = gridToCanvasCoordinates(props.x, props.y)
    return {
      x,
      y,
      radius: props.radius,
      fill: props.fill,
    }
  })
  </script>