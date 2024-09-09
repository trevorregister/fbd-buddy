<template>
    <v-group>
      <v-circle
        v-for="point in gridPoints"
        :key="`${point.x},${point.y}`"
        :config="point"
      />
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
  
 
  

  </script>