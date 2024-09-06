<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage :config="configKonva" @click="drawCircle"> 
          <v-layer>
            <v-circle v-for="circle in circles" :config="circle" />
            <v-arrow :config="configArrow" />
          </v-layer>
        </v-stage>
        <v-btn @click="clearCircles">
            Clear Circles
          </v-btn>
        </ClientOnly>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
const clickCoords = ref({x: 0, y: 0})
const circles = ref([])

const configKonva = {
  width: 500,
  height: 500,
}

const configCircle = {
  x: 100,
  y: 100,
  radius: 5,
  fill: 'black',
  stroke: 'black',
  strokeWidth: 4,
}

const configArrow = {
  points: [configCircle.x, configCircle.y, configCircle.x+100, configCircle.y],
  fill: 'black',
  stroke: 'black',
  strokeWidth: 4,
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

const clearCircles = () => {
  circles.value = []
}
  
</script>
