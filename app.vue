<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage 
            :config="configStage" 
            @click="drawArrow"
          > 
            <v-layer>
              <v-circle v-for="circle in circles" :config="circle" />
              <v-arrow v-for="arrow in arrows" :config="arrow" />
              <v-circle v-for="gridPoint in grid" :config="gridPoint" />
            </v-layer>
          </v-stage>
        </ClientOnly>
        <v-btn @click="clearCanvas">
            Clear Canvas
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const circles = ref([])
const arrows = ref([])
const grid = ref([])
const arrowPointsBeingDrawn = ref([])
const arrowBeingDrawn = ref({  
    fill: 'black',
    stroke: 'black',
    strokeWidth: 4,
    points: [],
  })
const isDrawingArrow = ref(false)

const configStage = {
  width: 500,
  height: 500,
}

const drawCircle = (e) => {
  const stage = e.target.getStage()
  const pointerPosition = stage.getPointerPosition()
  clickCoords.value = pointerPosition

  const circle = {
    x: pointerPosition.x,
    y: pointerPosition.y,
    radius: 5,
    fill: 'black',
    stroke: 'black',
    strokeWidth: 4,
  }
  circles.value.push(circle)
  return circle
}

const drawArrow = (e) => {
  const arrow = {  
    fill: 'black',
    stroke: 'black',
    strokeWidth: 4,
    points: [],
  }
  const stage = e.target.getStage()
  const pointerPosition = stage.getPointerPosition()

  if (!isDrawingArrow.value) {
    arrowBeingDrawn.value.points = [pointerPosition.x, pointerPosition.y]
    isDrawingArrow.value = true
  } else {
    arrow.points = [...arrowBeingDrawn.value.points, pointerPosition.x, pointerPosition.y]
    arrows.value.push(arrow)
    arrowBeingDrawn.value.points = []
    isDrawingArrow.value = false
  }
}

const drawGrid = () => {
  for (let i = 0; i < configStage.width; i += 50) {
    for (let j = 0; j < configStage.height; j += 50) {
      const gridPoint = {
        x: i+5,
        y: j+5,
        fill: 'lightgrey',
        radius: 5,
      }
      grid.value.push(gridPoint)
    }
  }
}

const clearCanvas = () => {
  circles.value = []
  arrows.value = []
  arrowPointsBeingDrawn.value = []
}

onMounted(() => {
  drawGrid()
})
  
</script>
