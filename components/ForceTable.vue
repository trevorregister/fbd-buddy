<template>
  <div class="force-table-container">
    <v-table>
      <thead>
        <tr>
          <th>Force Name</th>
          <th>Object Exerting Force</th>
          <th>{{ isPolar ? 'Magnitude' : 'X Component' }}</th>
          <th>{{ isPolar ? 'Angle' : 'Y Component' }}</th>
          <th>Actions</th>
          <th>
            <v-btn icon @click="openSettingsModal">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vector in localForceVectors" :key="vector.id">
          <td class="align-center">
            <div v-if="vector.isEditing">
              <v-text-field
                v-model="vector.name"
                placeholder="Enter force name (LaTeX enabled)"
                dense
                hide-details
                @blur="finishEditingName(vector)"
                @keyup.enter="finishEditingName(vector)"
              ></v-text-field>
            </div>
            <div 
              v-else 
              class="math-content" 
              @click="startEditingName(vector)"
              v-html="vector.renderedName"
            ></div>
          </td>
          <td class="align-center">
            <v-text-field
              v-model="vector.objectExerting"
              placeholder="Enter object exerting force"
              dense
              hide-details
            ></v-text-field>
          </td>
          <td class="align-center">
            <v-text-field
              :value="roundToTwoDecimals(isPolar ? vector.magnitude : vector.xComponent)"
              @input="isPolar ? updateMagnitude(vector, $event) : updateXComponent(vector, $event)"
              type="number"
              dense
              hide-details
            ></v-text-field>
          </td>
          <td class="align-center">
            <v-text-field
              :value="roundToTwoDecimals(isPolar ? vector.angle : vector.yComponent)"
              @input="isPolar ? updateAngle(vector, $event) : updateYComponent(vector, $event)"
              type="number"
              dense
              hide-details
            ></v-text-field>
          </td>
          <td class="align-center">
            <v-btn @click="deleteVector(vector.id)" size="small">Delete</v-btn>
          </td>
        </tr>
        <tr class="net-force-row">
          <td>
            <div class="math-content net-force-label" v-html="renderKatex({ name: 'F_net' })"></div>
          </td>
          <td></td>
          <td>{{ isPolar ? netForceMagnitude : netForceX }}</td>
          <td>{{ isPolar ? netForceAngle : netForceY }}</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </v-table>
    
    <div class="controls-container">
      <v-btn @click="addNewVector" color="primary">Add New Force</v-btn>
    </div>

    <v-dialog v-model="settingsModalOpen" max-width="400px">
      <v-card>
        <v-card-title>Settings</v-card-title>
        <v-card-text>
          <v-switch
            v-model="isPolar"
            :label="isPolar ? 'Polar Coordinates' : 'Cartesian Coordinates'"
          ></v-switch>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="settingsModalOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  forceVectors: Array,
  objectExperiencingForce: String,
})

const emit = defineEmits(['addVector', 'deleteVector', 'updateVector', 'highlightVector', 'unhighlightVector'])

const isPolar = ref(false)
const settingsModalOpen = ref(false)

// Add this after other ref declarations
const editingStates = ref(new Map())

// Create a reactive copy of forceVectors
const localForceVectors = computed(() => 
  props.forceVectors.map(vector => ({
    ...vector,
    isEditing: editingStates.value.has(vector.id),
    renderedName: vector.renderedName || vector.name,
    magnitude: calculateMagnitude(vector),
    angle: calculateAngle(vector),
    xComponent: vector.head.x - vector.tail.x,
    yComponent: vector.head.y - vector.tail.y
  }))
)

const roundToTwoDecimals = (value) => {
  return Number(value).toFixed(2);
}

const addNewVector = () => {
  const id = Date.now().toString()
  editingStates.value.set(id, true)
  emit('addVector', {
    id,
    type: '',
    name: '',
    label: '',
    renderedName: '',
    objectExerting: '',
    objectExperiencing: '',
    tail: { x: 0, y: 0 },
    head: { x: 100, y: 100 },
    magnitude: 100,
    angle: 0,
    xComponent: 100,
    yComponent: 0
  })
}

const deleteVector = (id) => {
  editingStates.value.delete(id)
  emit('deleteVector', id)
}

const updateVector = (vector) => {
  emit('updateVector', vector)
}

const highlightVector = (id) => {
  emit('highlightVector', id)
}

const unhighlightVector = () => {
  emit('unhighlightVector')
}

const clearVectors = () => {
  emit('clearVectors')
}

function calculateMagnitude(vector) {
  const dx = vector.head.x - vector.tail.x
  const dy = vector.head.y - vector.tail.y
  return Math.sqrt(dx * dx + dy * dy)
}

function calculateAngle(vector) {
  const dx = vector.head.x - vector.tail.x
  const dy = vector.head.y - vector.tail.y
  let angle = Math.atan2(dy, dx) * (180 / Math.PI)
  if (angle < 0) {
    angle += 360
  }
  return angle
}

const updateXComponent = (vector, event) => {
  vector.xComponent = Number(event.target.value);
  vector.head.x = vector.tail.x + vector.xComponent;
  vector.magnitude = roundToTwoDecimals(calculateMagnitude(vector));
  vector.angle = roundToTwoDecimals(calculateAngle(vector));
  emit('updateVector', vector);
}

const updateYComponent = (vector, event) => {
  vector.yComponent = Number(event.target.value);
  vector.head.y = vector.tail.y + vector.yComponent;
  vector.magnitude = roundToTwoDecimals(calculateMagnitude(vector));
  vector.angle = roundToTwoDecimals(calculateAngle(vector));
  emit('updateVector', vector);
}

const updateMagnitude = (vector, event) => {
  vector.magnitude = Number(event.target.value);
  const angle = vector.angle * (Math.PI / 180);
  vector.head.x = vector.tail.x + vector.magnitude * Math.cos(angle);
  vector.head.y = vector.tail.y + vector.magnitude * Math.sin(angle);
  vector.xComponent = roundToTwoDecimals(vector.head.x - vector.tail.x);
  vector.yComponent = roundToTwoDecimals(vector.head.y - vector.tail.y);
  emit('updateVector', vector);
}

const updateAngle = (vector, event) => {
  vector.angle = Number(event.target.value);
  const angle = vector.angle * (Math.PI / 180);
  vector.head.x = vector.tail.x + vector.magnitude * Math.cos(angle);
  vector.head.y = vector.tail.y + vector.magnitude * Math.sin(angle);
  vector.xComponent = roundToTwoDecimals(vector.head.x - vector.tail.x);
  vector.yComponent = roundToTwoDecimals(vector.head.y - vector.tail.y);
  emit('updateVector', vector);
}

const openSettingsModal = () => {
  settingsModalOpen.value = true
}

// Update vectors when objectExperiencingForce changes
watch(() => props.objectExperiencingForce, (newValue) => {
  if (newValue) {
    props.forceVectors.forEach(vector => {
      if (!vector.objectExperiencingForce) {
        vector.objectExperiencingForce = newValue
      }
    })
  }
})

const netForceX = computed(() => {
  return roundToTwoDecimals(localForceVectors.value.reduce((sum, vector) => sum + vector.xComponent, 0))
})

const netForceY = computed(() => {
  return roundToTwoDecimals(localForceVectors.value.reduce((sum, vector) => sum + vector.yComponent, 0))
})

const netForceMagnitude = computed(() => {
  return roundToTwoDecimals(
    Math.sqrt(netForceX.value ** 2 + netForceY.value ** 2)
  )
})

const netForceAngle = computed(() => {
  let angle = Math.atan2(netForceY.value, netForceX.value) * (180 / Math.PI)
  if (angle < 0) angle += 360
  return roundToTwoDecimals(angle)
})

const renderKatex = (vector) => {
  if (!vector.name) return '';
  
  try {
    // Format the content with proper LaTeX notation
    let content = vector.name;
    
    // If it doesn't already have $ signs, add proper vector notation
    if (!content.includes('$')) {
      content = content.trim();
      // If it contains an underscore, it has a subscript
      if (content.includes('_')) {
        const [base, subscript] = content.split('_');
        content = `\\vec{${base}}_{${subscript}}`; // Format as \vec{F}_N
      } else {
        content = `\\vec{${content}}`; // Just add vector notation
      }
    } else {
      // Remove the dollar signs as katex doesn't need them
      content = content.replace(/\$/g, '');
    }
    
    return katex.renderToString(content, {
      displayMode: false,
      throwOnError: false,
      output: 'html',
      strict: false,
      trust: true,
      style: {
        fontSize: '1em',
      }
    });
  } catch (error) {
    console.error('KaTeX rendering error:', error);
    return vector.name; // Return plain text if rendering fails
  }
}

const startEditingName = (vector) => {
  editingStates.value.set(vector.id, true)
}

const finishEditingName = async (vector) => {
  editingStates.value.delete(vector.id)
  vector.renderedName = renderKatex(vector)
  emit('updateVector', {
    ...vector,
    renderedName: vector.renderedName
  })
}

watch(() => localForceVectors.value.map(v => v.name), (newNames, oldNames) => {
  localForceVectors.value.forEach((vector, index) => {
    if (newNames[index] !== oldNames?.[index]) {
      vector.renderedName = renderKatex(vector)
      emit('updateVector', {
        ...vector,
        renderedName: vector.renderedName
      })
    }
  })
}, { deep: true })
</script>

<style scoped>
.force-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.controls-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.net-force-separator td {
  padding: 0;
}

.net-force-separator hr {
  margin: 0;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.net-force-row {
  font-weight: bold;
}

.math-content {
  min-height: 32px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.math-content:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* KaTeX specific styles */
:deep(.katex) {
  font-size: 1em !important;
  line-height: 1.2 !important;
  color: black !important;
}

:deep(.katex-html) {
  white-space: normal !important;
}

td {
  height: 48px !important;
  padding: 0 8px !important;
  vertical-align: middle !important;
}

.net-force-label :deep(.katex) {
  font-size: 1.3em !important;  /* Adjust this value to make it bigger or smaller */
}

/* Make the numbers in the net force row bigger too */
.net-force-row td {
  font-size: 1.3em;
}

/* Make regular force names bigger */
.math-content :deep(.katex) {
    font-size: 1.5em !important;  /* Increase from 1em to 1.3em */
}

/* Keep net force even bigger or adjust if needed */
.net-force-label :deep(.katex) {
    font-size: 1.3em !important;
}
</style>
