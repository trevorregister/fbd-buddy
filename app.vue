<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage :config="configStage">
            <v-layer>
              <Grid :spacing="50" />
              <ForceVector v-for="vector in forceVectors" :key="vector.id"
                :tail="vector.tail" 
                :head="vector.head" 
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

const addForceVector = () => {
  // keeping it simple for now
  forceVectors.value.push({ 
    tail: { x: 0, y: 0 }, 
    head: { x: 50, y: 50 },
  })
}

const clearForceVectors = () => {
  forceVectors.value = []
}

// Provide canvas dimensions to all child components
provideCanvasDimensions(configStage.width, configStage.height)

// ... rest of your script
</script>