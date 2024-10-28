<template>
  <div class="force-addition-container">
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
            :config="netForceConfig"
          />
        </v-layer>
      </v-stage>
    </ClientOnly>
    <div class="button-container">
      <v-btn @click="$emit('animate')" :disabled="isAnimating">
        {{ isAnimating ? 'Animating...' : 'Animate Vectors' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Grid from '~/components/Grid.vue'
import ForceVector from '~/components/ForceVector.vue'
import { gridToCanvasCoordinates } from '~/utils/coordinates'
import Konva from 'konva'

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
  },
  isAnimating: {
    type: Boolean,
    default: false
  }
})

// Initialize showNetForce as true
const showNetForce = ref(true)
const netForceProgress = ref(1) // Set to 1 to show full vector by default

const ARROW_HEAD_LENGTH = 120
const GRID_SCALE = 15

// Hide vectors during animation
const cumulativeVectors = computed(() => {
  if (props.isAnimating) return []
  
  let cumulative = { x: 0, y: 0 }
  return props.forceVectors.map(v => {
    const dx = v.head.x - v.tail.x
    const dy = v.head.y - v.tail.y
    
    const angle = Math.atan2(dy, dx)
    
    const newVector = {
      id: `cumulative-${v.id}`,
      tail: { ...cumulative },
      head: { 
        x: cumulative.x + dx,
        y: cumulative.y + dy
      }
    }
    
    cumulative = {
      x: newVector.head.x + (ARROW_HEAD_LENGTH * Math.cos(angle) / GRID_SCALE),
      y: newVector.head.y + (ARROW_HEAD_LENGTH * Math.sin(angle) / GRID_SCALE)
    }
    
    return newVector
  })
})

const netForceConfig = computed(() => {
  if (props.forceVectors.length === 0) return {}
  
  const start = gridToCanvasCoordinates(0, 0)
  let sumX = 0
  let sumY = 0
  props.forceVectors.forEach(vector => {
    sumX += vector.head.x - vector.tail.x
    sumY += vector.head.y - vector.tail.y
  })
  const end = gridToCanvasCoordinates(sumX, sumY)
  
  // Calculate current end point based on animation progress
  const currentEnd = {
    x: start.x + (end.x - start.x) * netForceProgress.value,
    y: start.y + (end.y - start.y) * netForceProgress.value
  }
  
  return {
    points: [start.x, start.y, currentEnd.x, currentEnd.y],
    pointerLength: 10,
    pointerWidth: 10,
    fill: 'red',
    stroke: 'red',
    strokeWidth: 8,
    dash: [10, 5],
  }
})

// Watch for animation end and trigger net force animation
watch(() => props.isAnimating, async (newValue, oldValue) => {
  if (newValue) { // Animation starting
    showNetForce.value = false
  } else if (oldValue && !newValue) { // Animation just finished
    // Reset and show net force
    netForceProgress.value = 0
    showNetForce.value = true
    
    // Animate net force
    const startTime = Date.now()
    const duration = 1000 // 1 second animation
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      netForceProgress.value = progress
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }
})

// Add emit for animate button click
defineEmits(['animate'])
</script>

<style scoped>
.force-addition-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-stage {
  width: 100%;
  height: 500px;
}

.button-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
