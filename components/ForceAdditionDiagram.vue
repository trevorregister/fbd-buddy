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
            :label="vector.name"
            :highlighted="vector.id === forceVectorsStore.highlightedVectorId"
            :hideLabels="hideLabels"
            @mouseenter="highlightVector(vector.id)"
            @mouseleave="unhighlightVector"
          />  
          <!-- Net Force Vector -->
          <v-group v-if="showNetForce && forceVectorsStore.vectors.length > 0">
            <v-arrow :config="netForceConfig" />
            <v-label v-if="!hideLabels" :config="netForceLabelConfig">
              <v-tag :config="netForceLabelTagConfig" />
              <v-text :config="netForceMainTextConfig" />
              <v-text :config="netForceSubscriptConfig" />
            </v-label>
          </v-group>
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
import Point from '~/components/Point.vue'
import { gridToCanvasCoordinates } from '~/utils/coordinates'
import Konva from 'konva'
import { useForceVectorsStore } from '~/stores/forceVectors'

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
  isAnimating: {
    type: Boolean,
    default: false
  },
  hideLabels: {
    type: Boolean,
    default: false
  }
})

const forceVectorsStore = useForceVectorsStore()

// Initialize showNetForce as true
const showNetForce = ref(true)
const netForceProgress = ref(1) // Set to 1 to show full vector by default

const ARROW_HEAD_LENGTH = 120
const GRID_SCALE = 15

// Hide vectors during animation
const cumulativeVectors = computed(() => {
  if (props.isAnimating) return []
  
  let cumulative = { x: 0, y: 0 }
  return forceVectorsStore.vectors.map(v => {
    const dx = v.head.x - v.tail.x
    const dy = v.head.y - v.tail.y
    
    const angle = Math.atan2(dy, dx)
    
    const newVector = {
      id: `cumulative-${v.id}`,
      name: v.name,
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
  if (forceVectorsStore.vectors.length === 0) return {}
  
  const start = gridToCanvasCoordinates(0, 0)
  let sumX = 0
  let sumY = 0
  forceVectorsStore.vectors.forEach(vector => {
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

// Add these computed properties for the net force label
const netForceLabelConfig = computed(() => {
  // Check if netForceConfig.value and points exist
  if (!netForceConfig.value?.points || netForceConfig.value.points.length < 4) {
    return {
      x: 0,
      y: 0,
      offsetX: -30,
      offsetY: -20
    }
  }

  const startX = netForceConfig.value.points[0]  // Origin x
  const startY = netForceConfig.value.points[1]  // Origin y
  const endX = netForceConfig.value.points[2]    // End point x
  const endY = netForceConfig.value.points[3]    // End point y
  
  // Calculate midpoint
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  
  return {
    x: midX,
    y: midY,
  }
})

const netForceLabelTagConfig = computed(() => ({
  fill: 'white',
  cornerRadius: 4,
  pointerDirection: 'none',
  pointerWidth: 0,
  pointerHeight: 0,
  lineJoin: 'round'
}))

const netForceMainTextConfig = computed(() => ({
  text: 'F',
  fontSize: 20,
  fontFamily: 'KaTeX_Math, Arial',
  fill: 'red',
  padding: 5,
  align: 'center'
}))

const netForceSubscriptConfig = computed(() => ({
  text: 'net',
  fontSize: 16,
  fontFamily: 'KaTeX_Math, Arial',
  fill: 'red',
  padding: 5,
  align: 'center',
  x: 12,
  y: 6
}))

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

const highlightVector = (id) => {
  forceVectorsStore.setHighlightedVector(id)
}

const unhighlightVector = () => {
  forceVectorsStore.clearHighlightedVector()
}

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
