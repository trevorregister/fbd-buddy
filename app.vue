<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage :config="configStage">
            <v-layer>
              <Grid :spacing="50" />
              <ForceVector v-for="vector in forceVectors" :key="vectorIndex"
                :tail="vector.tail" 
                :head="vector.head" 
                :id="vector.id"
                @dragEnd="handleDragEnd" 
              />
              <!-- Add more points and arrows as needed -->
            </v-layer>
          </v-stage>
        </ClientOnly>
        <v-btn @click="clearForceVectors">
          Clear Vectors
        </v-btn>
        <v-btn @click="addForceVector">
          Add Force Vector
        </v-btn>
        <p>
          vectors: {{ forceVectors }}
        </p>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import Grid from '~/components/Grid.vue'
import Point from '~/components/Point.vue'
import ForceVector from '~/components/ForceVector.vue'
import { provideCanvasDimensions } from '~/composables/useCanvasDimensions'

const configStage = {
  width: 500,
  height: 500,
}
const forceVectors = ref([])
const vectorIndex = ref(0)

const addForceVector = () => {
  // keeping it simple for now
  forceVectors.value.push({ 
    tail: { x: 250, y: 250 }, 
    head: { x: 250, y: 100 },
    id: Math.random().toString(36).substring(2, 8)
  })
  vectorIndex.value++
}

const clearForceVectors = () => {
  forceVectors.value = []
}

const handleDragEnd = (vector) => {
  forceVectors.value = forceVectors.value.map((v) => {
    if (v.id === vector.id) {
      v.head = vector.head
      v.tail = vector.tail
    }
    console.log(forceVectors.value)
    return v
  })
}

// Provide canvas dimensions to all child components
provideCanvasDimensions(configStage.width, configStage.height)

// ... rest of your script
</script>