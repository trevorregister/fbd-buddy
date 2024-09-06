<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage 
            :config="configKonva" 
            @dblclick="drawCircle"
            @click="drawArrow"
          > 
            <v-layer>
              <v-circle v-for="circle in circles" :config="circle" />
              <v-arrow v-for="arrow in arrows" :config="arrow" />
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
import { ref } from 'vue'
const clickCoords = ref({x: 0, y: 0})
const circles = ref([])
const arrows = ref([])
const arrowPointsBeingDrawn = ref([])
const isDrawingArrow = ref(false)

const configKonva = {
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
    points: []
  }
  const stage = e.target.getStage()
  const pointerPosition = stage.getPointerPosition()
  clickCoords.value = pointerPosition

  if (!isDrawingArrow.value) {
    arrowPointsBeingDrawn.value = [pointerPosition.x, pointerPosition.y]
    isDrawingArrow.value = true
  } else {
    arrow.points = [...arrowPointsBeingDrawn.value, pointerPosition.x, pointerPosition.y]
    arrows.value.push(arrow)
    arrowPointsBeingDrawn.value = []
    isDrawingArrow.value = false
  }
}

const clearCanvas = () => {
  circles.value = []
  arrows.value = []
  arrowPointsBeingDrawn.value = []
}
  
</script>
