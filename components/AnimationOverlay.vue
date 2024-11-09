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
import { ref, computed } from 'vue'
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

const animateVectors = async () => {
  console.log('Starting vector animation')
  animatingVectors.value = []

  // Calculate the distance to move to the center of the right grid
  const moveDistance = props.configStage.width + 100 // 500px (grid width) + 100px (gap)

  // Keep track of cumulative position in the right grid
  let cumulative = { x: 0, y: 0 }

  // Animate each vector one by one
  for (const vector of props.forceVectors) {
    console.log('Animating vector:', vector)
    
    // Calculate vector displacement
    const dx = vector.head.x - vector.tail.x
    const dy = vector.head.y - vector.tail.y
    const angle = Math.atan2(dy, dx)
    
    // Start position - use the exact position from the FBD
    const startVector = {
      id: vector.id,
      tail: { ...vector.tail },
      head: { ...vector.head },
      name: vector.name
    }

    // End position in the FAD
    const endVector = {
      id: vector.id,
      tail: { ...cumulative },
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
      const duration = 1000 // 1 second animation

      const animate = () => {
        const elapsed = Date.now() - startTime
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

    // Update cumulative position for next vector
    cumulative = {
      x: endVector.head.x,
      y: endVector.head.y
    }

    // Pause between vectors
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Clear the vectors after animation is complete
  animatingVectors.value = []
  console.log('Animation complete')
}

defineExpose({ animateVectors })
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
