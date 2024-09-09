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
    fill: { type: String, default: 'red' },
    canvasWidth: { type: Number, required: true },
    canvasHeight: { type: Number, required: true },
  })
  
  const circleConfig = computed(() => {
    const { x, y } = gridToCanvasCoordinates(props.x, props.y, props.canvasWidth, props.canvasHeight)
    return {
      x,
      y,
      radius: props.radius,
      fill: props.fill,
    }
  })
  </script>