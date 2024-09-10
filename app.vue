<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage :config="configStage">
            <v-layer>
              <Grid :spacing="50" />
              <Point :x="10" :y="20" />
              <ForceVector v-for="vector in forceVectors" 
                :tail="vector.tail" 
                :head="vector.head" 
                :showComponents="showComponents"
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
        <v-btn @click="incrementX">
          Increment X
        </v-btn>
        <v-checkbox
          v-model="showComponents"
          label="Show Vector Components"
        ></v-checkbox>
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

const showComponents = ref(false) 

const configStage = {
  width: 500,
  height: 500,
}
const forceVectors = ref([])

const addForceVector = () => {
  forceVectors.value.push({ 
    id: Date.now(),  // Use timestamp as a simple unique id
    tail: { x: 0, y: 0 }, 
    head: { x: 50, y: 50 } 
  })
}

const clearForceVectors = () => {
  forceVectors.value = []
}

const incrementX = () => {
  if(forceVectors.value.length > 0) {
    forceVectors.value[0].head.x += 50
  }
}

const toggleShowComponents = () => {
  showComponents.value = !showComponents.value
}

// Provide canvas dimensions to all child components
provideCanvasDimensions(configStage.width, configStage.height)

// ... rest of your script
</script>