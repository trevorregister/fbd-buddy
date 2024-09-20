<template>
  <v-table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Object Exerting Force</th>
        <th>Object Experiencing Force</th>
        <th>X-Component</th>
        <th>Y-Component</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="vector in forceVectors" 
        :key="vector.id"
        @mouseenter="highlightVector(vector.id)"
        @mouseleave="unhighlightVector"
      >
        <td>
          <v-select
            v-model="vector.type"
            :items="forceTypes"
            @update:modelValue="updateVector(vector)"
          ></v-select>
        </td>
        <td>
          <v-text-field
            v-model="vector.objectExerting"
            @update:modelValue="updateVector(vector)"
          ></v-text-field>
        </td>
        <td>
          <v-text-field
            v-model="vector.objectExperiencing"
            @update:modelValue="updateVector(vector)"
          ></v-text-field>
        </td>
        <td>{{ vector.head.x - vector.tail.x }}</td>
        <td>{{ vector.head.y - vector.tail.y }}</td>
        <td>
          <v-btn @click="deleteVector(vector.id)" size="small">Delete</v-btn>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="6">
          <v-btn @click="addNewVector">Add New Vector</v-btn>
        </td>
      </tr>
    </tfoot>
  </v-table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  forceVectors: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['addVector', 'deleteVector', 'updateVector', 'highlightVector', 'unhighlightVector'])

const forceTypes = [
  'Gravitational',
  'Electrostatic',
  'Normal',
  'Frictional',
  'Magnetic'
]

const addNewVector = () => {
  emit('addVector', {
    id: Date.now().toString(),
    type: 'Gravitational',
    objectExerting: '',
    objectExperiencing: '',
    tail: { x: 0, y: 0 },
    head: { x: 100, y: 100 }
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
</script>