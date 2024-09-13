<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row>
          <v-col>
            <ClientOnly>
              <v-stage :config="configStage">
                <v-layer>
                  <Grid :spacing="50" />
                  <ForceVector v-for="vector in forceVectors" :key="vectorIndex"
                    :tail="vector.tail" 
                    :head="vector.head" 
                    :showComponents="showComponents"
                    :id="vector.id"
                    @dragEnd="handleDragEnd"
                  />  
                </v-layer>
              </v-stage>
            </ClientOnly>
          </v-col>
          <v-col>
            <ClientOnly>
              <v-stage :config="configStage">
                <v-layer>
                  <Grid :spacing="50" />
                  <ForceVector v-for="vector in cumulativeVectors" 
                    :key="vectorIndex"
                    :tail="vector.tail" 
                    :head="vector.head" 
                    :id="vector.id"
                    :showComponents="showComponents"
                    @dragEnd="handleDragEnd"
                  />  
                </v-layer>
              </v-stage>
            </ClientOnly>
          </v-col>
        </v-row>
        <v-btn @click="clearForceVectors">
          Clear Vectors
        </v-btn>
        <v-btn @click="addForceVector">
          Add Force Vector
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
import { ref, computed } from 'vue'
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
const vectorIndex = ref(0)

const addForceVector = () => {
  forceVectors.value.push({ 
    id: Date.now().toString(),
    tail: { x: 250, y: 250 }, 
    head: { x: 250, y: 100 } 
  })
  vectorIndex.value++
}

const clearForceVectors = () => {
  forceVectors.value = []
}

//necessary for ensuring the draggable circle snaps back to the vector head
const handleDragEnd = (vector) => {
  forceVectors.value = forceVectors.value.map((v) => {
    if (v.id === vector.id) {
      v.head = vector.head
      v.tail = vector.tail
    }
    return v
  })
  vectorIndex.value++
}
const toggleShowComponents = () => {
  console.log('toggleShowComponents', showComponents.value)
  showComponents.value = !showComponents.value
}

const cumulativeVectors = computed(() => {
  let cumulative = { x: 250, y: 250 } //needed at 250,250 until we can figure out the issue with gridToCanvasCoordinates
  return forceVectors.value.map(v => {
    const newVector = {
      id: `cumulative-${v.id}`,
      tail: { x: cumulative.x, y: cumulative.y },
      head: { 
        x: cumulative.x + (v.head.x - v.tail.x),
        y: cumulative.y + (v.head.y - v.tail.y)
      }
    }
    cumulative = newVector.head
    return newVector
  })
})

// Provide canvas dimensions to all child components
provideCanvasDimensions(configStage.width, configStage.height)

// ... rest of your script
</script>