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
            :coordinateSystem="coordinateSystem"
            @mouseenter="highlightVector(vector.id)"
            @mouseleave="unhighlightVector"
          />  
          <!-- Net Force Vector (arrow line first) -->
          <v-line 
            v-if="showNetForce && forceVectorsStore.vectors.length > 0"
            :config="netForceLineConfig"
          />
          <!-- Net Force Label -->
          <v-label v-if="showNetForce && !hideLabels && forceVectorsStore.vectors.length > 0" 
            :config="netForceLabelConfig"
          >
            <v-tag :config="netForceLabelTagConfig" />
            <v-text :config="netForceMainTextConfig" />
            <v-text :config="netForceSubscriptConfig" />
          </v-label>
          <!-- Net Force Arrow Head (on top of everything) -->
          <v-regular-polygon 
            v-if="showNetForce && forceVectorsStore.vectors.length > 0"
            :config="netForceArrowConfig"
          />
        </v-layer>
      </v-stage>
    </ClientOnly>
    <div class="button-container">
      <v-btn
        @click="handleAnimationControl"
        class="mr-2"
      >
        {{ buttonText }}
      </v-btn>
      <v-btn
        @click="handleRandomizedAnimation"
        :disabled="props.isAnimating"
        variant="outlined"
      >
        Randomize Order
      </v-btn>
    </div>
  </div>
  <AnimationOverlay
    ref="animationOverlayRef"
    :config-stage="configStage"
    :force-vectors="forceVectorsStore.vectors"
    :hide-labels="hideLabels"
    :is-paused="isPaused"
    :vector-order="currentVectorOrder"
  />
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
  isPaused: {
    type: Boolean,
    default: false
  },
  hideLabels: {
    type: Boolean,
    default: false
  },
  coordinateSystem: {
    type: String,
    default: 'cartesian'
  }
})

const forceVectorsStore = useForceVectorsStore()

// Initialize showNetForce as true
const showNetForce = ref(true)
const netForceProgress = ref(1) // Set to 1 to show full vector by default

const ARROW_HEAD_LENGTH = 120
const GRID_SCALE = 15

// Add ref to store the current vector order
const currentVectorOrder = ref([])

// Add shuffle array utility
const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Update the cumulativeVectors computed property
const cumulativeVectors = computed(() => {
  // Hide vectors during animation
  if (props.isAnimating) return []
  
  const vectorsToUse = currentVectorOrder.value.length > 0 
    ? currentVectorOrder.value 
    : forceVectorsStore.vectors

  let cumulative = { x: 0, y: 0 }
  return vectorsToUse.map(v => {
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

// Split the net force config into line and arrow configs
const netForceLineConfig = computed(() => {
  if (forceVectorsStore.vectors.length === 0) return {}
  
  const start = gridToCanvasCoordinates(0, 0)
  let sumX = 0
  let sumY = 0
  forceVectorsStore.vectors.forEach(vector => {
    sumX += vector.head.x - vector.tail.x
    sumY += vector.head.y - vector.tail.y
  })
  const end = gridToCanvasCoordinates(sumX, sumY)
  
  const currentEnd = {
    x: start.x + (end.x - start.x) * netForceProgress.value,
    y: start.y + (end.y - start.y) * netForceProgress.value
  }
  
  return {
    points: [start.x, start.y, currentEnd.x, currentEnd.y],
    stroke: 'red',
    strokeWidth: 8,
    dash: [10, 5],
  }
})

const netForceArrowConfig = computed(() => {
  if (forceVectorsStore.vectors.length === 0) return {}
  
  const start = gridToCanvasCoordinates(0, 0)
  let sumX = 0
  let sumY = 0
  forceVectorsStore.vectors.forEach(vector => {
    sumX += vector.head.x - vector.tail.x
    sumY += vector.head.y - vector.tail.y
  })
  const end = gridToCanvasCoordinates(sumX, sumY)
  
  const currentEnd = {
    x: start.x + (end.x - start.x) * netForceProgress.value,
    y: start.y + (end.y - start.y) * netForceProgress.value
  }

  // Calculate angle for arrow direction
  const dx = currentEnd.x - start.x
  const dy = currentEnd.y - start.y
  const angle = Math.atan2(dy, dx)
  
  return {
    x: currentEnd.x,
    y: currentEnd.y,
    sides: 3,
    radius: 14,
    fill: 'red',
    rotation: angle * 180 / Math.PI + 90
  }
})

// Fix the netForceLabelConfig to use netForceLineConfig instead
const netForceLabelConfig = computed(() => {
  if (!netForceLineConfig.value?.points || netForceLineConfig.value.points.length < 4) {
    return {
      x: 0,
      y: 0
    }
  }

  const startX = netForceLineConfig.value.points[0]
  const startY = netForceLineConfig.value.points[1]
  const endX = netForceLineConfig.value.points[2]
  const endY = netForceLineConfig.value.points[3]
  
  // Calculate exact midpoint
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  
  return {
    x: midX,
    y: midY
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

// Update button text based on animation state
const buttonText = computed(() => {
  if (!props.isAnimating) return 'Animate Vectors'
  return props.isPaused ? 'Resume' : 'Pause'
})

// Handle animation control
const handleAnimationControl = () => {
  if (!props.isAnimating) {
    // Get the current order of vectors from cumulativeVectors
    const currentOrder = cumulativeVectors.value.map(v => {
      const originalVector = forceVectorsStore.vectors.find(orig => 
        orig.name === v.name.replace('cumulative-', '')
      )
      return originalVector
    }).filter(v => v)
    
    console.log('Current vector order:', currentOrder.map(v => v.name))
    
    emit('animate', { 
      vectorOrder: currentOrder
    })
  } else {
    // When animation is running, toggle pause
    emit('togglePause')
  }
}

const handleRandomizedAnimation = () => {
  currentVectorOrder.value = shuffleArray([...forceVectorsStore.vectors])
  console.log('Shuffled order:', currentVectorOrder.value.map(v => v.name))
}

// Make sure we're properly emitting the events
const emit = defineEmits(['animate', 'togglePause', 'animationComplete'])

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

// Reset the order when vectors change
watch(() => forceVectorsStore.vectors, () => {
  currentVectorOrder.value = []
}, { deep: true })

const highlightVector = (id) => {
  forceVectorsStore.setHighlightedVector(id)
}

const unhighlightVector = () => {
  forceVectorsStore.clearHighlightedVector()
}

const useShuffledOrder = ref(false)
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
  gap: 8px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
