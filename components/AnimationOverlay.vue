<template>
  <div class="animation-overlay-container">
    <ClientOnly>
      <v-stage :config="overlayConfig" class="overlay-stage">
        <v-layer ref="layer">
          <ForceVector v-for="vector in animatingVectors" 
            :key="`anim-${vector.id}`"
            :tail="vector.tail" 
            :head="vector.head" 
            :showComponents="false"
            :id="`anim-${vector.id}`"
            :canDrag="false"
            :label="vector.name"
            :hideLabels="hideLabels"
          />
        </v-layer>
      </v-stage>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Konva from 'konva'
import ForceVector from './ForceVector.vue'
import { useForceVectorsStore } from '~/stores/forceVectors'

const props = defineProps({
  configStage: Object,
  forceVectors: {
    type: Array,
    required: true
  },
  hideLabels: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  vectorOrder: {
    type: Array,
    default: () => []
  }
})

const layer = ref(null)
const animatingVectors = ref([])

// Update overlay config to match grid size exactly
const overlayConfig = computed(() => ({
  width: props.configStage.width * 2 + 100, // Width of both grids plus 100px gap
  height: props.configStage.height,
}))

const ARROW_HEAD_LENGTH = 120
const GRID_SCALE = 15

// Add local ref for pause state
const localIsPaused = ref(false)

// Watch for changes in props.isPaused
watch(() => props.isPaused, (newValue) => {
  localIsPaused.value = newValue
})

const animateVectors = async () => {
  console.log('Starting vector animation')
  animatingVectors.value = []

  const moveDistance = props.configStage.width + 100

  // Initialize cumulative position at (0,0)
  let cumulative = { 
    x: 0,
    y: 0 
  }

  // Use the provided vector order if available, otherwise use default order
  let vectorsToAnimate = props.vectorOrder.length > 0 
    ? props.vectorOrder
    : props.forceVectors

  console.log('Animation order:', vectorsToAnimate.map(v => v.name))

  for (const vector of vectorsToAnimate) {
    // Calculate vector components
    const dx = vector.head.x - vector.tail.x
    const dy = vector.head.y - vector.tail.y
    
    // Calculate angle for arrowhead offset
    const angle = Math.atan2(dy, dx)
    
    // Start position - exact position from FBD
    const startVector = {
      id: vector.id,
      tail: { ...vector.tail },
      head: { ...vector.head },
      name: vector.name
    }

    // End position - in the right grid
    const endVector = {
      id: vector.id,
      tail: { 
        x: cumulative.x,
        y: cumulative.y
      },
      head: {
        x: cumulative.x + dx,
        y: cumulative.y + dy
      },
      name: vector.name
    }

    // Add vector to animation with its original position
    animatingVectors.value = [...animatingVectors.value, startVector]
    
    // Animate the vector
    await new Promise(resolve => {
      const startTime = Date.now()
      const duration = 1000
      let pausedTime = 0
      let lastPauseTime = null

      const animate = () => {
        if (localIsPaused.value) {
          if (!lastPauseTime) {
            lastPauseTime = Date.now()
          }
          requestAnimationFrame(animate)
          return
        }

        if (lastPauseTime) {
          pausedTime += Date.now() - lastPauseTime
          lastPauseTime = null
        }

        const elapsed = Date.now() - startTime - pausedTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Calculate current position
        const currentVector = {
          id: vector.id,
          name: vector.name,
          tail: {
            x: startVector.tail.x + (endVector.tail.x + moveDistance - startVector.tail.x) * progress,
            y: startVector.tail.y + (endVector.tail.y - startVector.tail.y) * progress
          },
          head: {
            x: startVector.head.x + (endVector.head.x + moveDistance - startVector.head.x) * progress,
            y: startVector.head.y + (endVector.head.y - startVector.head.y) * progress
          }
        }
        
        // Update the animating vectors
        animatingVectors.value = animatingVectors.value.map(v => 
          v.id === vector.id ? currentVector : v
        )
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })

    // Update cumulative position with arrowhead offset
    cumulative = {
      x: endVector.head.x + (ARROW_HEAD_LENGTH * Math.cos(angle) / GRID_SCALE),
      y: endVector.head.y + (ARROW_HEAD_LENGTH * Math.sin(angle) / GRID_SCALE)
    }

    if (!localIsPaused.value) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  await new Promise(resolve => setTimeout(resolve, 1000))
  animatingVectors.value = []
  console.log('Animation complete')
}

// Update the togglePause method
const togglePause = (isPaused) => {
  localIsPaused.value = isPaused
}

// Make sure to expose the togglePause method
defineExpose({ animateVectors, togglePause })
</script>

<style scoped>
.animation-overlay-container {
  width: 1100px; /* Two grid widths (500px each) plus 100px gap */
  height: 500px;
}

.overlay-stage {
  width: 100%;
  height: 100%;
}
</style>
