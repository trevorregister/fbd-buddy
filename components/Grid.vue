<template>
    <v-group v-if="!hideGrid">
      <v-circle 
        v-for="point in gridPoints"
        :key="`${point.x},${point.y}`"
        :config="point"
      />
<!--       <v-text :config="originLabel" />
      <v-text
      v-for="label in axisLabels"
      :key="label.text"
      :config="label"
    /> -->
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
    hideGrid: {type: Boolean, default: false}
  })
  
  const gridPoints = computed(() => {
    const points = []
    for (let x = -Math.floor(props.width / 2); x <= Math.floor(props.width / 2); x += props.spacing) {
      for (let y = -Math.floor(props.height / 2); y <= Math.floor(props.height / 2); y += props.spacing) {
        if(isOrigin(x,y)) {
          continue
        } else{
          const { x: canvasX, y: canvasY } = gridToCanvasCoordinates(x, y, props.width, props.height)
          points.push({
            x: canvasX,
            y: canvasY,
            radius: props.dotRadius,
            fill: 'lightgray',
          })
        }
      }
    }
    return points
  })
  
  const { width, height } = useCanvasDimensions().value

  const originLabel = computed(() => {
  const { x, y } = gridToCanvasCoordinates(5, -5)
  return {
    x,
    y,
    text: '(0,0)',
    fontSize: 12,
    fill: 'red',
  }
})

const isOrigin = (x, y) =>{
  return x === 0 && y === 0
}
 
const axisLabels = computed(() => {
  const labels = []
  for (let x = -Math.floor(width / 2); x <= Math.floor(width / 2); x += props.spacing) {
    if (x !== 0) {
      const { x: canvasX, y: canvasY } = gridToCanvasCoordinates(x, 0)
      labels.push({
        x: canvasX,
        y: canvasY + 15,
        text: x.toString(),
        fontSize: 10,
        fill: 'blue',
        align: 'center',
      })
    }
  }
  for (let y = -Math.floor(height / 2); y <= Math.floor(height / 2); y += props.spacing) {
    if (y !== 0) {
      const { x: canvasX, y: canvasY } = gridToCanvasCoordinates(0, y)
      labels.push({
        x: canvasX - 15,
        y: canvasY,
        text: y.toString(),
        fontSize: 10,
        fill: 'blue',
        align: 'right',
      })
    }
  }
  return labels
})  

  </script>