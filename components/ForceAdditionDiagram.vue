<template>
  <ClientOnly>
    <v-stage :config="configStage" class="grid-stage">
      <v-layer>
        <Grid 
          :spacing="50"
          :hideGrid="hideGrid" 
        />
        <Point 
          :x="0"
          :y="0"
          :radius="8"
          :fill="'black'"
        />
        <ForceVector v-for="vector in cumulativeVectors" 
          :key="vector.id"
          :tail="vector.tail" 
          :head="vector.head" 
          :showComponents="showComponents"
          :id="vector.id"
          :canDrag="false"
        />  
        <!-- Net Force Vector -->
        <v-arrow v-if="showNetForce"
          :config="{
            points: [netForceStart.x, netForceStart.y, netForceEnd.x, netForceEnd.y],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'red',
            stroke: 'red',
            strokeWidth: 8,
            dash: [10, 5],
          }"
        />
      </v-layer>
    </v-stage>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Grid from '~/components/Grid.vue'
import ForceVector from '~/components/ForceVector.vue'
import { gridToCanvasCoordinates } from '~/utils/coordinates'

const props = defineProps({
  configStage: {
    type: Object,
    required: true
  },
  hideGrid: {
    type: Boolean,
    required: true
  },
  showComponents: {
    type: Boolean,
    required: true
  },
  forceVectors: {
    type: Array,
    required: true
  }
})

const showNetForce = ref(true)

const ARROW_HEAD_LENGTH = 120
 // Increased arrowhead length
const GRID_SCALE = 15 // Adjusted scale factor

const cumulativeVectors = computed(() => {
  let cumulative = { x: 0, y: 0 }
  return props.forceVectors.map(v => {
    const dx = v.head.x - v.tail.x
    const dy = v.head.y - v.tail.y
    
    // Calculate vector angle
    const angle = Math.atan2(dy, dx)
    
    // Create new vector starting at previous vector's head
    const newVector = {
      id: `cumulative-${v.id}`,
      tail: { ...cumulative }, // Start at previous vector's head
      head: { 
        x: cumulative.x + dx,
        y: cumulative.y + dy
      }
    }
    
    // Update cumulative to be at the tip of the arrowhead
    // Add the full arrowhead length in the direction of the vector
    cumulative = {
      x: newVector.head.x + (ARROW_HEAD_LENGTH * Math.cos(angle) / GRID_SCALE),
      y: newVector.head.y + (ARROW_HEAD_LENGTH * Math.sin(angle) / GRID_SCALE)
    }
    
    return newVector
  })
})

const netForceStart = computed(() => {
  if (props.forceVectors.length === 0) return { x: 0, y: 0 }
  const firstVector = props.forceVectors[0]
  return gridToCanvasCoordinates(firstVector.tail.x, firstVector.tail.y)
})

const netForceEnd = computed(() => {
  if (props.forceVectors.length === 0) return { x: 0, y: 0 }
  let sumX = 0
  let sumY = 0
  props.forceVectors.forEach(vector => {
    sumX += vector.head.x - vector.tail.x
    sumY += vector.head.y - vector.tail.y
  })
  const firstVector = props.forceVectors[0]
  return gridToCanvasCoordinates(
    firstVector.tail.x + sumX,
    firstVector.tail.y + sumY
  )
})

watch(() => props.forceVectors, (newVectors) => {
  console.log('ForceAdditionDiagram received new vectors:', newVectors)
}, { deep: true })
</script>

<style scoped>
.grid-stage {
  width: 100%;
  height: 500px; /* Adjust this value to match your desired grid height */
}
</style>
