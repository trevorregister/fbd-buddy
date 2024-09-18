<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row>
          <v-col>
            <ClientOnly>
              <v-stage :config="configStage">
                <v-layer>
                  <v-image :config="backgroundConfig" />
                  <Grid 
                    :spacing="50" 
                    :hideGrid="hideGrid"/>
                  <ForceVector v-for="vector in forceVectors" :key="vector.Grid"
                    :tail="vector.tail" 
                    :head="vector.head" 
                    :showComponents="showComponents"
                    :id="vector.id"
                    :canDrag="true"
                  />  
                </v-layer>
              </v-stage>
            </ClientOnly>
          </v-col>
          <v-col>
            <ClientOnly>
              <v-stage :config="configStage">
                <v-layer>
                  <Grid 
                    :spacing="50"
                    :hideGrid="hideGrid" 
                    />
                  <ForceVector v-for="vector in cumulativeVectors" 
                    :key="vector.id"
                    :tail="vector.tail" 
                    :head="vector.head" 
                    :id="vector.id"
                    :showComponents="showComponents"
                    :canDrag="false"
                  />  
                </v-layer>
              </v-stage>
            </ClientOnly>
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="clearForceVectors">
            Clear Vectors
          </v-btn>
          <v-btn @click="addForceVector">
            Add Force Vector
          </v-btn>
        <v-btn @click="triggerImageUpload">
          Upload Background Image
        </v-btn>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept="image/*"
          @change="handleImageUpload"
        />
        </v-row>
        <v-row>
          <v-checkbox
            v-model="showComponents"
            label="Show Vector Components"/>
          <v-checkbox
          v-model="hideGrid"
          label="Hide Grid"/>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Grid from '~/components/Grid.vue'
import Point from '~/components/Point.vue'
import ForceVector from '~/components/ForceVector.vue'
import { provideCanvasDimensions } from '~/composables/useCanvasDimensions'

const showComponents = ref(false) 
const hideGrid = ref(false)

const configStage = {
  width: 500,
  height: 500,
}
const forceVectors = ref([])

const addForceVector = () => {
  forceVectors.value.push({ 
    id: Date.now().toString(),
    tail: { x: 0 , y: 0 }, 
    head: { x: 100, y:200 } 
  })
}

const clearForceVectors = () => {
  forceVectors.value = []
}

const cumulativeVectors = computed(() => {
  let cumulative = { x: 0, y: 0 }
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

const backgroundImage = ref(null)
const fileInput = ref(null)

const backgroundConfig = computed(() => ({
  image: backgroundImage.value,
  width: configStage.width,
  height: configStage.height,
  x: 0,
  y: 0,
}))

const triggerImageUpload = () => {
  fileInput.value.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        backgroundImage.value = img
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

onMounted(() => {
  // ... existing code ...
})
</script>