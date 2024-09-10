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
                  <Point :x="10" :y="20" />
                  <ForceVector v-for="vector in forceVectors" 
                    :key="vector.id"
                    :tail="vector.tail" 
                    :head="vector.head" 
                    :showComponents="showComponents"
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
                  <ForceVector v-for="(vector, index) in cumulativeVectors" 
                    :key="vector.id"
                    :tail="vector.tail" 
                    :head="vector.head" 
                    :showComponents="showComponents"
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

const cumulativeVectors = computed(() => {
  let cumulative = { x: 0, y: 0 };
  return forceVectors.value.map((vector, index) => {
    const newVector = {
      id: `cumulative-${vector.id}`,
      tail: { x: cumulative.x, y: cumulative.y },
      head: { 
        x: cumulative.x + (vector.head.x - vector.tail.x),
        y: cumulative.y + (vector.head.y - vector.tail.y)
      }
    };
    cumulative = newVector.head;
    return newVector;
  });
});

// Provide canvas dimensions to all child components
provideCanvasDimensions(configStage.width, configStage.height)

// ... rest of your script
</script>