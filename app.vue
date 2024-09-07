<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage :config="configStage" > 
            <v-layer>
              <point v-for="gridPoint in grid" :config="gridPoint" />
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
import ForceVector from './components/ForceVector.vue'
import Point from './components/Point.vue'
const points = ref([])
const forces = ref([])
const grid = ref([])
const configStage = {
  width: 500,
  height: 500,
}

const drawGrid = () => {
  for (let i = 50; i <=configStage.width; i += 50) {
    for (let j = 50; j <= configStage.height; j += 50) {
      const gridPoint = {
        x: i+5,
        y: j+5,
      }
      grid.value.push(gridPoint)
    }
  }
}

const clearCanvas = () => {
  points.value = []
  forces.value = []
}

onMounted(() => {
  drawGrid()
})
  
</script>
