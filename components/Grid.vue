<template>
    <v-group>
      <v-circle
        v-for="point in gridPoints"
        :key="`${point.x},${point.y}`"
        :config="point"
      />
      <v-text :config="originLabel" />
    </v-group>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { gridToCanvasCoordinates } from '~/utils/coordinates'
  
  const props = defineProps({
    width: { type: Number, default: 500 },
    height: { type: Number, default: 500 },
    spacing: { type: Number, default: 50 },
    dotRadius: { type: Number, default: 4 },
  })
  
  const gridPoints = computed(() => {
    const points = []
    for (let x = -Math.floor(props.width / 2); x <= Math.floor(props.width / 2); x += props.spacing) {
      for (let y = -Math.floor(props.height / 2); y <= Math.floor(props.height / 2); y += props.spacing) {
        const { x: canvasX, y: canvasY } = gridToCanvasCoordinates(x, y, props.width, props.height)
        points.push({
          x: canvasX,
          y: canvasY,
          radius: props.dotRadius,
          fill: x === 0 && y === 0 ? 'red' : 'lightgray',
        })
      }
    }
    return points
  })
  
  const originLabel = computed(() => {
    const { x, y } = gridToCanvasCoordinates(5, -5, props.width, props.height)
    if (x === 0 && y === 0) {
    return {
      x,
      y,
      text: '0,0',
      fontSize: 12,
      fill: 'red',
    }}
    return null
  })
  
  const coordinateLabels = computed(() => {
    const labels = []
    for (let x = -Math.floor(props.width / 2); x <= Math.floor(props.width / 2); x += props.spacing) {
      for (let y = -Math.floor(props.height / 2); y <= Math.floor(props.height / 2); y += props.spacing) {
        if (x == 0 && y == 0) {
          const { x: canvasX, y: canvasY } = gridToCanvasCoordinates(x + 5, y - 5, props.width, props.height)
          labels.push({
            x: canvasX,
            y: canvasY,
            text: `${x / props.spacing},${y / props.spacing}`,
            fontSize: 10,
            fill: 'blue',
          })
        }
      }
    }
    return labels
  })
  </script>