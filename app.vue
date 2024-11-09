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
            :forceVectors="forceVectorsStore.vectors.map(v => ({ ...v, label: v.name }))"
            class="animation-overlay"
          />
          <div class="diagram-column">
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
              @updateVectorHead="updateVectorHead"
            />
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
                  <InteractionDiagram />
                </v-window-item>

                <v-window-item value="forceTable">
                  <ForceTable
                    :objectExperiencingForce="objectExperiencingForce"
                    @highlightVector="highlightVector"
                    @unhighlightVector="unhighlightVector"
                  />
                </v-window-item>

                <v-window-item value="forceAddition">
                  <ForceAdditionDiagram
                    :configStage="configStage"
                    :hideGrid="hideGrid"
                    :showComponents="showComponents"
                    :hideLabels="hideLabels"
                    :isAnimating="isAnimating"
                    @animate="animateVectors"
                  />
                </v-window-item>
              </v-window>
            </div>
          </div>
        </div>
        
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
const animationOverlay = ref(null)

const animateVectors = async () => {
  if (isAnimating.value) return
  console.log('Starting animation sequence')
  
  console.log('Force vectors being passed to overlay:', 
    forceVectorsStore.vectors.map(v => ({
      id: v.id,
      label: v.label,
      tail: v.tail,
      head: v.head
    }))
  )
  
  isAnimating.value = true

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
</style>
