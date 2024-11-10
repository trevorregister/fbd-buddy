<template>
  <v-app>
    <MenuBar />
    <v-main>
      <v-container>
        <v-row>
          <SettingsModal @save-settings="handleSaveSettings"/>
        </v-row>

        <div class="diagram-container">
          <AnimationOverlay
            ref="animationOverlay"
            :configStage="configStage"
            :hideLabels="hideLabels"
            :forceVectors="forceVectorsStore.vectors.map(v => ({ ...v, label: v.name }))"
            :isPaused="isPaused"
            :use-shuffled-order="useShuffledOrder"
            :vector-order="currentVectorOrder"
            class="animation-overlay"
          />
          <div class="left-column">
            <FreeBodyDiagram
              v-model:objectExperiencingForce="objectExperiencingForce"
              :configStage="configStage"
              :backgroundConfig="backgroundConfig"
              :forceVectors="forceVectorsStore.vectors"
              :hideGrid="hideGrid"
              :showComponents="showComponents"
              :hideLabels="hideLabels"
              :isAnimating="isAnimating"
              :highlightedVectorId="forceVectorsStore.highlightedVectorId"
              :coordinateSystem="coordinateSystem"
              @updateVectorHead="updateVectorHead"
            />
            <div class="button-container">
              <v-btn @click="triggerImageUpload">
                Upload Background Image
              </v-btn>
            </div>
          </div>
          <div class="diagram-column">
            <div class="tabs-container">
              <v-tabs v-model="activeTab">
                <v-tab value="interaction">Interaction Diagram</v-tab>
                <v-tab value="forceTable">Force Table</v-tab>
                <v-tab value="forceAddition">Force Addition Diagram</v-tab>
              </v-tabs>

              <v-window v-model="activeTab" class="grid-window">
                <v-window-item value="interaction">
                  <InteractionDiagram 
                    @triggerImageUpload="triggerImageUpload"
                  />
                </v-window-item>

                <v-window-item value="forceTable">
                  <ForceTable
                    :objectExperiencingForce="objectExperiencingForce"
                    @highlightVector="highlightVector"
                    @unhighlightVector="unhighlightVector"
                    @updateCoordinateSystem="updateCoordinateSystem"
                  />
                </v-window-item>

                <v-window-item value="forceAddition">
                  <ForceAdditionDiagram
                    :configStage="configStage"
                    :hideGrid="hideGrid"
                    :showComponents="showComponents"
                    :hideLabels="hideLabels"
                    :isAnimating="isAnimating"
                    :isPaused="isPaused"
                    :coordinateSystem="coordinateSystem"
                    @animate="animateVectors"
                    @togglePause="togglePause"
                  />
                </v-window-item>
              </v-window>
            </div>
          </div>
        </div>

        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept="image/*"
          @change="handleImageUpload"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import MenuBar from '~/components/MenuBar.vue'
import ForceAdditionDiagram from '~/components/ForceAdditionDiagram.vue'
import ForceTable from '~/components/ForceTable.vue'
import { provideCanvasDimensions } from '~/composables/useCanvasDimensions'
import SettingsModal from '~/components/SettingsModal.vue'
import InteractionDiagram from '~/components/InteractionDiagram.vue'
import { useAnimate } from '@vueuse/core'
import AnimationOverlay from '~/components/AnimationOverlay.vue'
import FreeBodyDiagram from '~/components/FreeBodyDiagram.vue'
import { useForceVectorsStore } from '~/stores/forceVectors'

const showComponents = ref(false) 
const hideGrid = ref(false)
const hideLabels = ref(false)

const configStage = {
  width: 500,
  height: 500,
}

const forceVectorsStore = useForceVectorsStore()

const handleClearVectors = () => {
  forceVectorsStore.clearVectors()
}

const handleSaveSettings = (settings) => {
  const {newShowComponents, newHideGrid, newHideLabels} = settings
  showComponents.value = newShowComponents
  hideGrid.value = newHideGrid
  hideLabels.value = newHideLabels
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

const objectExperiencingForce = ref('')

const isAnimating = ref(false)
const isPaused = ref(false)
const animationOverlay = ref(null)

const togglePause = () => {
  isPaused.value = !isPaused.value
  if (animationOverlay.value) {
    animationOverlay.value.togglePause(isPaused.value)
  }
}

const currentVectorOrder = ref([])

const animateVectors = async (event) => {
  if (isAnimating.value) return
  console.log('Starting animation sequence with vectors:', event?.vectorOrder?.map(v => v.name))
  
  currentVectorOrder.value = event?.vectorOrder || []
  
  isAnimating.value = true
  isPaused.value = false

  await nextTick()

  try {
    if (!animationOverlay.value) {
      console.error('Animation overlay not found')
      return
    }

    await animationOverlay.value.animateVectors()
  } catch (error) {
    console.error('Animation error:', error)
  } finally {
    isAnimating.value = false
    isPaused.value = false
    currentVectorOrder.value = []
    console.log('Animation sequence complete')
  }
}

const highlightVector = (id) => {
  forceVectorsStore.setHighlightedVector(id)
}

const unhighlightVector = () => {
  forceVectorsStore.clearHighlightedVector()
}

const updateVectorHead = (id, newHead) => {
  forceVectorsStore.updateVectorHead(id, newHead)
}

const activeTab = ref('interaction')

const coordinateSystem = ref('cartesian')

const updateCoordinateSystem = (newSystem) => {
  coordinateSystem.value = newSystem
}
</script>

<style scoped>
body{
  max-width: clamp(320px, 90%, 1000px);
}
.diagram-container {
  display: grid;
  grid-template-columns: 500px 500px;
  gap: 100px;
  position: relative;
  min-height: 500px;
  margin: 0;
  padding: 0;
}

.diagram-column {
  width: 500px;
  padding: 0;
}

.animation-overlay {
  position: absolute;
  top: 48px; /* Account for header */
  left: 0;
  z-index: 9999;
  pointer-events: none;
}

.tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-window {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.v-window-item {
  height: 100%;
  overflow: auto;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.left-column {
  width: 500px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.button-container {
  display: flex;
  justify-content: center;
}
</style>
