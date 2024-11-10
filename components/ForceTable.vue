<template>
  <div class="force-table">
    <v-table>
      <thead>
        <tr>
          <th>Force Label</th>
          <th>Object Exerting Force</th>
          <th>Components</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vector in forceVectorsStore.vectors" :key="vector.id"
          @mouseenter="$emit('highlightVector', vector.id)"
          @mouseleave="$emit('unhighlightVector')"
          :class="{ 'highlighted-row': vector.id === forceVectorsStore.highlightedVectorId }"
        >
          <td>
            <v-text-field
              v-if="editingLabel === vector.id"
              v-model="tempLabel"
              :hide-details="true"
              density="compact"
              variant="outlined"
              @blur="finishEditingLabel(vector.id)"
              @keyup.enter="finishEditingLabel(vector.id)"
              ref="labelInput"
            />
            <div 
              v-else 
              @click="startEditingLabel(vector)"
              class="math-container"
              v-html="renderKatex(vector.name)"
            ></div>
          </td>
          <td>
            <v-combobox
              v-model="vector.objectExertingForce"
              :items="interactionDiagramStore.objects.map(obj => obj.label)"
              :hide-details="true"
              density="compact"
              variant="outlined"
              @update:model-value="updateObjectExertingForce(vector.id, $event)"
            />
          </td>
          <td>
            <div class="components">
              <div class="component-input">
                x: <v-text-field
                  v-model="vectorComponents[vector.id].x"
                  :hide-details="true"
                  density="compact"
                  variant="outlined"
                  type="number"
                  class="component-field"
                  @update:model-value="updateVectorComponent(vector, 'x', $event)"
                />
              </div>
              <div class="component-input">
                y: <v-text-field
                  v-model="vectorComponents[vector.id].y"
                  :hide-details="true"
                  density="compact"
                  variant="outlined"
                  type="number"
                  class="component-field"
                  @update:model-value="updateVectorComponent(vector, 'y', $event)"
                />
              </div>
            </div>
          </td>
          <td>
            <v-btn
              icon="mdi-delete"
              variant="text"
              color="black"
              density="compact"
              @click="forceVectorsStore.deleteVector(vector.id)"
            />
          </td>
        </tr>
        <!-- Net Force Row -->
        <tr class="net-force-row">
          <td style="color: red;">
            <div class="math-container" v-html="renderKatex('F_{net}')"></div>
          </td>
          <td>{{ objectExperiencingForce }}</td>
          <td>
            <div class="components">
              <div>x: {{ formatComponent(getNetXComponent()) }}</div>
              <div>y: {{ formatComponent(getNetYComponent()) }}</div>
            </div>
          </td>
          <td></td>
        </tr>
      </tbody>
    </v-table>

    <!-- Add Force Button -->
    <div class="button-container">
      <v-btn
        color="primary"
        @click="addForce"
        class="mt-4"
      >
        Add Force
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useForceVectorsStore } from '~/stores/forceVectors'
import { useInteractionDiagramStore } from '~/stores/interactionDiagram'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  objectExperiencingForce: {
    type: String,
    required: true
  }
})

const forceVectorsStore = useForceVectorsStore()
const interactionDiagramStore = useInteractionDiagramStore()

// Track component values
const vectorComponents = ref({})

const getXComponent = (vector) => {
  return vector.head.x - vector.tail.x
}

const getYComponent = (vector) => {
  return vector.head.y - vector.tail.y
}

// Initialize component values for each vector
const initializeVectorComponents = () => {
  const components = {}
  forceVectorsStore.vectors.forEach(vector => {
    components[vector.id] = {
      x: getXComponent(vector),
      y: getYComponent(vector)
    }
  })
  vectorComponents.value = components
}

// Watch for changes in vectors
watch(() => forceVectorsStore.vectors, () => {
  initializeVectorComponents()
}, { deep: true, immediate: true })

const updateObjectExertingForce = (vectorId, newValue) => {
  forceVectorsStore.updateObjectExertingForce(vectorId, newValue)
}

const updateVectorComponent = (vector, component, value) => {
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return

  const newHead = { ...vector.head }
  if (component === 'x') {
    newHead.x = vector.tail.x + numValue
  } else {
    newHead.y = vector.tail.y + numValue
  }
  
  forceVectorsStore.updateVectorHead(vector.id, newHead)
}

const getNetXComponent = () => {
  return forceVectorsStore.vectors.reduce((sum, vector) => 
    sum + (vector.head.x - vector.tail.x), 0
  )
}

const getNetYComponent = () => {
  return forceVectorsStore.vectors.reduce((sum, vector) => 
    sum + (vector.head.y - vector.tail.y), 0
  )
}

const formatComponent = (value) => {
  return value.toFixed(2)
}

const addForce = () => {
  const newVector = {
    id: Date.now(),
    name: `F_${forceVectorsStore.vectors.length + 1}`,
    objectExertingForce: '',
    type: 'Force',
    tail: { x: 0, y: 0 },
    head: { x: 200, y: 200 }
  }
  forceVectorsStore.addVector(newVector)
}

const editingLabel = ref(null)
const tempLabel = ref('')
const labelInput = ref(null)

const startEditingLabel = (vector) => {
  tempLabel.value = vector.name
  editingLabel.value = vector.id
  nextTick(() => {
    if (labelInput.value) {
      labelInput.value.focus()
    }
  })
}

const finishEditingLabel = (vectorId) => {
  const newLabel = tempLabel.value.trim()
  if (newLabel) {
    // First update the store
    forceVectorsStore.updateVector({
      ...forceVectorsStore.vectors.find(v => v.id === vectorId),
      name: newLabel
    })
  }
  editingLabel.value = null
}

const renderKatex = (text) => {
  try {
    return katex.renderToString(text, {
      throwOnError: false,
      displayMode: false
    })
  } catch (e) {
    console.error('KaTeX error:', e)
    return text
  }
}

onMounted(() => {
  initializeVectorComponents()
})

defineEmits(['highlightVector', 'unhighlightVector'])
</script>

<style scoped>
.force-table {
  padding: 16px;
}

.button-container {
  display: flex;
  justify-content: center;
}

.mt-4 {
  margin-top: 16px;
}

.net-force-row {
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.03);
}

.components {
  font-family: monospace;
}

.component-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.component-field {
  width: 80px;
  margin: 0;
}

/* Override Vuetify's default padding */
:deep(.v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.highlighted-row {
  background-color: rgba(76, 175, 80, 0.1) !important; /* Light green with transparency */
}

.math-container {
  cursor: text;
  padding: 4px 8px;
}

:deep(.katex) {
  font-size: 1.1em;
}

:deep(.katex-html) {
  white-space: nowrap;
}
</style>
