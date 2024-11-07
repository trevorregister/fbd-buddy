<template>
  <v-app>
    <MenuBar />
    <v-main>
      <v-container>
        <v-row>
          <SettingsModal @save-settings="handleSaveSettings"/>
        </v-row>
        <div class="grid-row" style="position: relative;">
          <v-col cols="6" class="grid-column">
            <div class="grid-header">
              <div class="free-body-diagram-label">
                <div class="label-content">
                  <span>Free Body Diagram for:</span>
                  <v-text-field
                    v-model="objectExperiencingForce"
                    placeholder="object"
                    dense
                    hide-details
                    class="ml-2"
                    style="max-width: 200px;"
                  ></v-text-field>
                </div>
              </div>
            </div>
            <ClientOnly>
              <v-stage ref="leftGrid" :config="configStage" class="grid-stage">
                <v-layer ref="layer">
                  <v-image :config="backgroundConfig" />
                  <Point 
                    :x="0"
                    :y="0"
                    :radius="8"
                    :fill="'black'"/>
                  <Grid 
                    :spacing="50" 
                    :hideGrid="hideGrid"/>
                  <ForceVector v-for="vector in forceVectors" :key="vector.id"
                    :tail="vector.tail" 
                    :head="vector.head" 
                    :showComponents="showComponents"
                    :id="vector.id"
                    :canDrag="!isAnimating"
                    :isHighlighted="vector.id === highlightedVectorId"
                    :label="vector.name"
                    @update:head="(newHead) => updateVectorHead(vector.id, newHead)"
                  />  
                </v-layer>
              </v-stage>
            </ClientOnly>
          </v-col>
          <v-col cols="6" class="grid-column">
            <div class="grid-header">
              <v-tabs v-model="activeTab">
                <v-tab value="interaction">Interaction Diagram</v-tab>
                <v-tab value="forces">Forces</v-tab>
                <v-tab value="forceAddition">Force Addition Diagram</v-tab>
              </v-tabs>
            </div>
            <v-window v-model="activeTab" class="grid-window">
              <v-window-item value="forceAddition">
                <ForceAdditionDiagram 
                  :configStage="configStage"
                  :hideGrid="hideGrid"
                  :showComponents="showComponents"
                  :forceVectors="forceVectors"
                  :isAnimating="isAnimating"
                  @animate="animateVectors"
                />
              </v-window-item>
              <v-window-item value="forces">
                <ForceTable 
                  :forceVectors="forceVectors"
                  :objectExperiencingForce="objectExperiencingForce"
                  @addVector="addForceVector"
                  @deleteVector="deleteForceVector"
                  @updateVector="updateForceVector"
                  @highlightVector="highlightVector"
                  @unhighlightVector="unhighlightVector"
                  @clearVectors="handleClearVectors"
                />
              </v-window-item>
              <v-window-item value="interaction">
                <ClientOnly>
                  <InteractionDiagram />
                </ClientOnly>
              </v-window-item>
            </v-window>
          </v-col>
        </div>
        
        <!-- Animation overlay -->
        <Teleport to="body">
          <AnimationOverlay
            v-if="isAnimating"
            ref="animationOverlay"
            :configStage="configStage"
            :forceVectors="forceVectors.map(v => ({ ...v, label: v.name }))"
          />
        </Teleport>
        
        <v-row>
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
import ForceAdditionDiagram from '~/components/ForceAdditionDiagram.vue'
import ForceTable from '~/components/ForceTable.vue'
import { provideCanvasDimensions } from '~/composables/useCanvasDimensions'
import SettingsModal from '~/components/SettingsModal.vue'
import InteractionDiagram from '~/components/InteractionDiagram.vue'
import { useAnimate } from '@vueuse/core'
import Konva from 'konva'
import AnimationOverlay from '~/components/AnimationOverlay.vue'

const showComponents = ref(false) 
const hideGrid = ref(false)

const configStage = {
  width: 500,
  height: 500,
}

const forceVectors = ref([])

const addForceVector = (newVector) => {
  forceVectors.value.push(newVector)
  console.log('Added new vector:', newVector)
  console.log('Current forceVectors:', forceVectors.value)
}

const deleteForceVector = (id) => {
  forceVectors.value = forceVectors.value.filter(v => v.id !== id)
}

const updateForceVector = (updatedVector) => {
  const index = forceVectors.value.findIndex(v => v.id === updatedVector.id)
  if (index !== -1) {
    forceVectors.value[index] = updatedVector
  }
}

const handleClearVectors = () => {
  forceVectors.value = []
}

const handleSaveSettings = (settings) => {
  const {newShowComponents, newHideGrid} = settings
  showComponents.value = newShowComponents
  hideGrid.value = newHideGrid
}

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

const highlightedVectorId = ref(null)

const highlightVector = (id) => {
  highlightedVectorId.value = id
}

const unhighlightVector = () => {
  highlightedVectorId.value = null
}

const objectExperiencingForce = ref('')

const isAnimating = ref(false)
const animationOverlay = ref(null)

const animateVectors = async () => {
  if (isAnimating.value) return
  console.log('Starting animation sequence')
  
  console.log('Force vectors being passed to overlay:', 
    forceVectors.value.map(v => ({
      id: v.id,
      label: v.label,
      tail: v.tail,
      head: v.head
    }))
  )
  
  isAnimating.value = true

  // Get grid position
  const gridPos = getGridPosition()
  console.log('Grid position:', gridPos)

  await nextTick()

  try {
    if (!animationOverlay.value) {
      console.error('Animation overlay not found')
      return
    }

    animationOverlay.value.setPosition(gridPos)
    await animationOverlay.value.animateVectors()
  } catch (error) {
    console.error('Animation error:', error)
  } finally {
    isAnimating.value = false
    console.log('Animation sequence complete')
  }
}

const stage = ref(null)
const layer = ref(null)

const leftGrid = ref(null)

const getGridPosition = () => {
  if (leftGrid.value) {
    const leftContainer = leftGrid.value.$el
    const leftRect = leftContainer.getBoundingClientRect()
    
    // Get the right grid element
    const rightGrid = document.querySelector('.v-window-item--active .grid-stage')
    const rightRect = rightGrid?.getBoundingClientRect()
    
    console.log('Left grid rect:', leftRect)
    console.log('Right grid rect:', rightRect)
    
    // Calculate total width including the gap
    const totalWidth = rightRect ? (rightRect.right - leftRect.left) : leftRect.width * 2
    console.log('Total width:', totalWidth)
    
    return {
      left: leftRect.left,
      top: leftRect.top,
      totalWidth: totalWidth
    }
  }
  return { left: 0, top: 0, totalWidth: 1020 }
}

onMounted(() => {
  nextTick(() => {
    console.log('Stage ref:', stage.value)
    console.log('Layer ref:', layer.value)
    if (stage.value && layer.value) {
      console.log('Stage node:', stage.value.getNode())
      console.log('Layer node:', layer.value.getNode())
    }
  })

  watch([stage, layer], ([newStage, newLayer]) => {
    if (newStage && newLayer) {
      console.log('Stage and Layer are ready')
      console.log('Stage children:', newStage.getNode().children)
      console.log('Layer children:', newLayer.getNode().children)
    }
  })
})

const updateVectorHead = (id, newHead) => {
  const index = forceVectors.value.findIndex(v => v.id === id)
  if (index !== -1) {
    forceVectors.value[index] = {
      ...forceVectors.value[index],
      head: newHead
    }
  }
}
</script>

<style scoped>
body{
  max-width: clamp(320px, 90%, 1000px);
}
.grid-row {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 500px; /* Match your grid height */
}

.grid-column {
  display: flex;
  flex-direction: column;
}

.grid-header {
  height: 48px; /* Match the height of the tabs */
  display: flex;
  align-items: center;
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

.tabs-container {
  display: flex;
  flex-direction: column;
}

.free-body-diagram-label {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.label-content {
  display: flex;
  align-items: center;
}
</style>
