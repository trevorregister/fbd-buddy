<template>
  <v-app>
    <MenuBar />
    <v-main>
      <v-container>
        <v-row>
            <SettingsModal
              @hide-grid="handleHideGrid"
              @show-components="handleShowComponents"/>
        </v-row>
        <v-row>
          <v-col cols="6" class="grid-column">
            <div ref="tabPlaceholder" class="tab-placeholder"></div>
            <ClientOnly>
              <v-stage :config="configStage" class="grid-stage">
                <v-layer>
                  <v-image :config="backgroundConfig" />
                  <Grid 
                    :spacing="50" 
                    :hideGrid="hideGrid"/>
                  <ForceVector v-for="vector in forceVectors" :key="vector.id"
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
          <v-col cols="6" class="grid-column">
            <div ref="tabsContainer" class="tabs-container">
              <v-tabs v-model="activeTab">
                <v-tab value="interaction">Interaction Diagram</v-tab>
                <v-tab value="forces">Forces</v-tab>
                <v-tab value="forceAddition">Force Addition Diagram</v-tab>
              </v-tabs>
            </div>
            <v-window v-model="activeTab" class="grid-window">
              <v-window-item value="forceAddition">
                <ClientOnly>
                  <v-stage :config="configStage" class="grid-stage">
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
              </v-window-item>
              <v-window-item value="forces">
                <p>Forces content goes here</p>
              </v-window-item>
              <v-window-item value="interaction">
                <p>Interaction Diagram content goes here</p>
              </v-window-item>
            </v-window>
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
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import Grid from '~/components/Grid.vue'
import Point from '~/components/Point.vue'
import ForceVector from '~/components/ForceVector.vue'
import MenuBar from '~/components/MenuBar.vue'
import { provideCanvasDimensions } from '~/composables/useCanvasDimensions'
import SettingsModal from '~/components/SettingsModal.vue'

const showComponents = ref(false) 
const hideGrid = ref(false)
const showSettingsModal = ref(true)

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

const handleHideGrid = () => {
  hideGrid.value = !hideGrid.value
}

const handleShowComponents = () => {
  showComponents.value = !showComponents.value
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

const activeTab = ref('forceAddition')
const tabsContainer = ref(null)
const tabPlaceholder = ref(null)

onMounted(() => {
  nextTick(() => {
    updateTabPlaceholder()
  })
})

function updateTabPlaceholder() {
  if (tabsContainer.value && tabPlaceholder.value) {
    const tabHeight = tabsContainer.value.offsetHeight
    tabPlaceholder.value.style.height = `${tabHeight}px`
  }
}

watch(tabsContainer, (newVal) => {
  if (newVal) {
    nextTick(() => {
      updateTabPlaceholder()
    })
  }
})
</script>

<style scoped>
.grid-column {
  display: flex;
  flex-direction: column;
  height: 550px; /* Adjust this value as needed */
}

.grid-stage {
  width: 100%;
  height: 500px; /* Adjust this value to match your desired grid height */
}

.grid-window {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.v-window-item {
  height: 100%;
}

.tab-placeholder {
  min-height: 48px; /* Set a minimum height */
  height: auto !important; /* Allow it to grow if needed */
}

.tabs-container {
  display: flex;
  flex-direction: column;
}
</style>