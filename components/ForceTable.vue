<template>
  <div>
    <v-table>
      <thead>
        <tr>
          <th>Force Name</th>
          <th>Magnitude</th>
          <th>Angle</th>
          <th>Object Experiencing Force</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="vector in forceVectors" :key="vector.id">
          <td>
            <v-text-field
              v-model="vector.objectExperiencingForce"
              :placeholder="objectExperiencingForce || 'Enter object'"
              dense
              hide-details
            ></v-text-field>
          </td>
          <td>
            <v-text-field
              v-model="vector.magnitude"
              type="number"
              @update:modelValue="updateMagnitude(vector)"
            ></v-text-field>
          </td>
          <td>
            <v-text-field
              v-model="vector.angle"
              type="number"
              @update:modelValue="updateAngle(vector)"
            ></v-text-field>
          </td>
          <td>
            <v-text-field
              v-model="vector.objectExperiencing"
              @update:modelValue="updateVector(vector)"
            ></v-text-field>
          </td>
          <td>
            <v-btn @click="deleteVector(vector.id)" size="small">Delete</v-btn>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5">
            <v-btn @click="addNewVector">Add New Vector</v-btn>
          </td>
        </tr>
      </tfoot>
    </v-table>
    <v-switch
      v-model="isPolar"
      :label="isPolar ? 'Polar Coordinates' : 'Cartesian Coordinates'"
    ></v-switch>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  forceVectors: Array,
  objectExperiencingForce: String,
})

const emit = defineEmits(['addVector', 'deleteVector', 'updateVector', 'highlightVector', 'unhighlightVector'])

const forceTypes = [
  'Gravitational',
  'Electrostatic',
  'Normal',
  'Frictional',
  'Magnetic'
]

const isPolar = ref(false)

const localForceVectors = ref([])

watch(() => props.forceVectors, (newVectors) => {
  localForceVectors.value = newVectors.map(vector => ({
    ...vector,
    magnitude: calculateMagnitude(vector),
    angle: calculateAngle(vector),
    xComponent: vector.head.x - vector.tail.x,
    yComponent: vector.head.y - vector.tail.y
  }))
}, { immediate: true, deep: true })

const addNewVector = () => {
  emit('addVector', {
    id: Date.now().toString(),
    type: 'Gravitational',
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

const updateXComponent = (vector) => {
  vector.head.x = vector.tail.x + Number(vector.xComponent)
  vector.magnitude = calculateMagnitude(vector)
  vector.angle = calculateAngle(vector)
  emit('updateVector', vector)
}

const updateYComponent = (vector) => {
  vector.head.y = vector.tail.y + Number(vector.yComponent)
  vector.magnitude = calculateMagnitude(vector)
  vector.angle = calculateAngle(vector)
  emit('updateVector', vector)
}

const updateMagnitude = (vector) => {
  const angle = vector.angle * (Math.PI / 180)
  vector.head.x = vector.tail.x + Number(vector.magnitude) * Math.cos(angle)
  vector.head.y = vector.tail.y + Number(vector.magnitude) * Math.sin(angle)
  vector.xComponent = vector.head.x - vector.tail.x
  vector.yComponent = vector.head.y - vector.tail.y
  emit('updateVector', vector)
}

const updateAngle = (vector) => {
  const angle = Number(vector.angle) * (Math.PI / 180)
  vector.head.x = vector.tail.x + vector.magnitude * Math.cos(angle)
  vector.head.y = vector.tail.y + vector.magnitude * Math.sin(angle)
  vector.xComponent = vector.head.x - vector.tail.x
  vector.yComponent = vector.head.y - vector.tail.y
  emit('updateVector', vector)
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
</script>