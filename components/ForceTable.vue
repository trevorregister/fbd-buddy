<template>
  <div class="force-table">
    <v-table>
      <thead>
        <tr>
          <th>Force Label</th>
          <th>Type</th>
          <th>Object Experiencing Force</th>
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
            <v-select
              v-model="vector.type"
              :items="interactionDiagramStore.interactionTypes"
              item-title="text"
              item-value="value"
              :error="!vector.type"
              :error-messages="!vector.type ? 'Required' : ''"
              density="compact"
              variant="outlined"
              @update:model-value="updateForceType(vector.id, $event)"
            />
          </td>
          <td>
            <div class="experiencing-force">
              {{ objectExperiencingForce }}
            </div>
          </td>
          <td>
            <v-combobox
              v-model="vector.objectExertingForce"
              :items="interactionDiagramStore.objects.map(obj => obj.label)"
              :error="!vector.objectExertingForce"
              :error-messages="!vector.objectExertingForce ? 'Required' : ''"
              variant="outlined"
              class="object-combobox"
              @blur="handleObjectCreation($event, vector.id)"
              @keyup.enter="handleObjectCreation($event, vector.id)"
              placeholder="Select or create object"
            />
          </td>
          <td>
            <div class="components">
              <template v-if="coordinateSystem === 'cartesian'">
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
                  <span class="unit-label">N</span>
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
                  <span class="unit-label">N</span>
                </div>
              </template>
              <template v-else>
                <div class="component-input">
                  r: <v-text-field
                    :value="getMagnitude(vector)"
                    :hide-details="true"
                    density="compact"
                    variant="outlined"
                    type="number"
                    class="component-field"
                    @update:model-value="updateVectorPolar(vector, $event, getAngle(vector))"
                  />
                  <span class="unit-label">N</span>
                </div>
                <div class="component-input">
                  θ: <v-text-field
                    :value="getAngle(vector)"
                    :hide-details="true"
                    density="compact"
                    variant="outlined"
                    type="number"
                    class="component-field"
                    @update:model-value="updateVectorPolar(vector, getMagnitude(vector), $event)"
                  />
                  <span class="unit-label">°</span>
                </div>
              </template>
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
          <td>
            <div class="math-container" style="color: red;">
              <span v-html="renderKatex('F_{net}')"></span>
            </div>
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            <div class="components">
              <template v-if="coordinateSystem === 'cartesian'">
                <div class="component-input">
                  x: <span class="net-force-value">{{ formatComponent(getNetXComponent()) }}</span>
                  <span class="unit-label">N</span>
                </div>
                <div class="component-input">
                  y: <span class="net-force-value">{{ formatComponent(getNetYComponent()) }}</span>
                  <span class="unit-label">N</span>
                </div>
              </template>
              <template v-else>
                <div class="component-input">
                  r: <span class="net-force-value">{{ formatComponent(getNetMagnitude()) }}</span>
                  <span class="unit-label">N</span>
                </div>
                <div class="component-input">
                  θ: <span class="net-force-value">{{ getNetAngle().toFixed(2) }}°</span>
                  <span class="unit-label">°</span>
                </div>
              </template>
            </div>
          </td>
          <td></td>
        </tr>
      </tbody>
    </v-table>

    <!-- Button Container with Toggle and Add Force -->
    <div class="button-container">
      <v-btn-toggle
        v-model="coordinateSystem"
        mandatory
        class="mr-4"
      >
        <v-btn value="cartesian">
          Cartesian
        </v-btn>
        <v-btn value="polar">
          Polar
        </v-btn>
      </v-btn-toggle>

      <v-btn
        color="primary"
        @click="addForce"
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

const formatComponent = (value, includeUnit = false) => {
  if (!includeUnit) return value.toFixed(2)
  return value.toString().includes('°') 
    ? value.toFixed(2) + '°'
    : value.toFixed(2) + ' N'
}

const addForce = () => {
  const newVector = {
    id: Date.now(),
    name: 'F_g',
    type: 'F_g',
    objectExertingForce: '',
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

const emit = defineEmits([
  'highlightVector', 
  'unhighlightVector', 
  'updateCoordinateSystem'
])

// Add coordinateSystem ref
const coordinateSystem = ref('cartesian')

// Add computed properties for polar conversion
const getMagnitude = (vector) => {
  const dx = vector.head.x - vector.tail.x
  const dy = vector.head.y - vector.tail.y
  return Math.sqrt(dx * dx + dy * dy)
}

const getAngle = (vector) => {
  const dx = vector.head.x - vector.tail.x
  const dy = vector.head.y - vector.tail.y
  return Math.atan2(dy, dx) * 180 / Math.PI
}

const updateVectorPolar = (vector, magnitude, angle) => {
  const angleRad = angle * Math.PI / 180
  const dx = magnitude * Math.cos(angleRad)
  const dy = magnitude * Math.sin(angleRad)
  
  const newHead = {
    x: vector.tail.x + dx,
    y: vector.tail.y + dy
  }
  
  forceVectorsStore.updateVectorHead(vector.id, newHead)
}

// Add methods for net force polar calculations
const getNetMagnitude = () => {
  const netX = getNetXComponent()
  const netY = getNetYComponent()
  return Math.sqrt(netX * netX + netY * netY)
}

const getNetAngle = () => {
  const netX = getNetXComponent()
  const netY = getNetYComponent()
  return Math.atan2(netY, netX) * 180 / Math.PI
}

// In the script section, add a watch to emit coordinate system changes
watch(coordinateSystem, (newValue) => {
  emit('updateCoordinateSystem', newValue)
})

const updateForceType = (vectorId, newType) => {
  const vector = forceVectorsStore.vectors.find(v => v.id === vectorId)
  if (vector) {
    // Strip the LaTeX vector notation for the type
    const cleanType = newType
      .replace('\\vec{', '')
      .replace('}', '')
      .replace('\\', '')

    // Update both the type and name
    forceVectorsStore.updateVectorType(vectorId, cleanType)
    forceVectorsStore.updateVectorName(vectorId, cleanType)
  }
}

// Add the handleObjectCreation function
const handleObjectCreation = (event, vectorId) => {
  const newObjectName = event?.target?.value || event
  if (!newObjectName) return

  // Check if this is a new object
  const existingObject = interactionDiagramStore.objects.find(obj => obj.label === newObjectName)
  
  if (!existingObject) {
    // Add new object to the interaction diagram
    const label = newObjectName.trim()
    interactionDiagramStore.addObject(
      interactionDiagramStore.objects.length * 60 + 100,
      250,
      label
    )
  }

  // Update the force vector's objectExertingForce
  forceVectorsStore.updateObjectExertingForce(vectorId, newObjectName)

  // Create an interaction between the objects
  const vector = forceVectorsStore.vectors.find(v => v.id === vectorId)
  if (vector && vector.type && props.objectExperiencingForce) {
    // Find or create the interaction
    const obj1 = interactionDiagramStore.objects.find(obj => obj.label === props.objectExperiencingForce)
    const obj2 = interactionDiagramStore.objects.find(obj => obj.label === newObjectName)
    
    if (obj1 && obj2) {
      // Check if this interaction already exists
      const existingInteractions = interactionDiagramStore.getInteractionsBetween(obj1.id, obj2.id)
      const hasExactInteraction = existingInteractions.some(i => i.label === vector.type)

      if (!hasExactInteraction) {
        // Create new interaction with the force type
        interactionDiagramStore.addInteraction(vector.type, obj1.id, obj2.id)
      }
    }
  }
}
</script>

<style scoped>
.force-table {
  padding: 8px;
}

.button-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.mr-4 {
  margin-right: 16px;
}

.net-force-row {
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.03);
}

.net-force-row::before {
  display: none;
}

.net-force-row > td {
  position: relative;
  z-index: 1;
}

.components {
  font-family: monospace;
}

.component-input {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0;
}

.unit-label {
  font-size: 14px !important;
  color: rgba(0, 0, 0, 0.6);
}

.component-field {
  width: 50px; /* Reduced from 120px */
  margin: 0;
}

/* Hide the number input spinners */
:deep(.v-field__input input[type="number"]) {
  -moz-appearance: textfield; /* Firefox */
}



.highlighted-row {
  background-color: rgba(76, 175, 80, 0.1) !important; /* Light green with transparency */
}

.math-container {
  cursor: text;
  padding: 4px 8px;
  font-size: 16px; /* Increased from 14px */
}

:deep(.katex) {
  font-size: 1.3em !important; /* Increased from 1.1em */
}

:deep(.katex-html) {
  white-space: nowrap;
}


.net-force-value {
  font-weight: bold;
  color: red;
  padding: 0 4px;
}



 



.object-combobox{
    width: 100px;
}

/* Style for the experiencing force cell */
.experiencing-force {
  padding: 4px 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}

/* Simplified table cell styling */
.v-table th,
.v-table td {
  padding: 4px 8px !important;
  vertical-align: middle !important;
}

/* Only keep specific widths where needed */
.v-table td:first-child {
  width: 120px; /* Increased from 100px */
}

/* Make the label input field match the size */
:deep(.v-text-field input) {
  font-size: 16px !important;
  padding: 8px !important;
}

/* Style for select and combobox inputs */
:deep(.v-field__input) {
  padding: 4px 8px !important;
  min-height: 36px !important;
  font-size: 14px !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

:deep(.v-select__selection),
:deep(.v-combobox__selection) {
  font-size: 14px !important;
  line-height: 20px !important;
}

/* Style for component inputs */
.component-input {
  font-size: 14px !important;
}

.component-input :deep(.v-field__input) {
  font-size: 14px !important;
  min-height: 32px !important;
}

/* Style for dropdown menu items */
:deep(.v-list-item__content) {
  font-size: 14px !important;
}

/* Adjust unit label size */
.unit-label {
  font-size: 14px !important;
}



.net-force-row .unit-label {
  color: red !important; /* Change the color to red */
}

/* Keep the net-force-row background */
.net-force-row {
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.03);
}

/* Make just the math container background transparent */
.net-force-row .math-container {
  background-color: transparent;
  text-align: left;
  padding-left: 0; /* Remove left padding to align with other cells */
}

/* Add specific styling for the Fnet katex container */
.net-force-row .math-container :deep(.katex-html) {
  text-align: left;
  justify-content: flex-start;
}

/* Keep the relative positioning on cells */
.net-force-row > td {
  position: relative;
  z-index: 1;
}

/* Update the hover state for regular force rows */
.v-table tbody tr:not(.net-force-row):hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Make the math container background transparent for regular rows */
.v-table tbody tr:not(.net-force-row):hover .math-container {
  background-color: transparent;
}

/* Remove any hover effects from the math container itself */
.math-container {
  cursor: text;
  padding: 4px 8px;
  font-size: 16px;
  background-color: transparent;
}

</style>
