<template>
  <div id="animation-container" class="animation-overlay" :style="overlayStyle">
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
            :label="vector.label"
          />
        </v-layer>
      </v-stage>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Konva from 'konva'
import ForceVector from './ForceVector.vue'
import { gridToCanvasCoordinates } from '~/utils/coordinates'

const props = defineProps({
  configStage: Object,
  forceVectors: {
    type: Array,
    required: true
  }
})

const layer = ref(null)
const isMounted = ref(false)
const position = ref({ left: 0, top: 0, totalWidth: 1020 })

const totalWidth = computed(() => position.value.totalWidth)

const overlayConfig = computed(() => ({
  width: totalWidth.value,
  height: props.configStage.height,
}))

const animatingVectors = ref([])

const overlayStyle = computed(() => ({
  position: 'fixed',
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  width: `${totalWidth.value}px`,
  height: `${props.configStage.height}px`,
  pointerEvents: 'none',
  zIndex: 9999,
  background: 'transparent',
  border: '1px solid red',
}))

const setPosition = (pos) => {
  position.value = pos
}

const ARROW_HEAD_LENGTH = 120 // Match the value from ForceAdditionDiagram
const GRID_SCALE = 15 // Match the value from ForceAdditionDiagram

const animateVectors = async () => {
  console.log('Starting vector animation with vectors:', props.forceVectors)
  // Log each vector's label
  props.forceVectors.forEach(v => console.log('Vector label:', v.label))
  
  await new Promise(resolve => {
    const checkLayer = () => {
      if (layer.value?.getNode()) {
        resolve()
      } else {
        setTimeout(checkLayer, 100)
      }
    }
    checkLayer()
  })

  console.log('Layer is ready:', layer.value.getNode())
  animatingVectors.value = []

  // Calculate the distance to move to the center of the right grid
  const moveDistance = props.configStage.width + 82

  // Keep track of cumulative position in the right grid
  let cumulative = { x: 0, y: 0 }

  // Animate each vector one by one
  for (let i = 0; i < props.forceVectors.length; i++) {
    const vector = props.forceVectors[i]
    console.log('Starting animation for vector:', vector)
    console.log('Vector label before animation:', vector.label)
    
    // Calculate vector displacement
    const dx = vector.head.x - vector.tail.x
    const dy = vector.head.y - vector.tail.y
    
    // Calculate vector angle for arrowhead offset
    const angle = Math.atan2(dy, dx)
    
    // Calculate start and end positions with explicit label
    const startVector = {
      id: vector.id,
      tail: { ...vector.tail },
      head: { ...vector.head },
      label: vector.label,
    }
    console.log('Start vector created with label:', startVector.label)

    // Calculate end position (tail at cumulative position)
    const endVector = {
      id: vector.id,
      tail: { ...cumulative },
      head: {
        x: cumulative.x + dx,
        y: cumulative.y + dy
      },
      label: vector.label,
    }
    console.log('End vector created with label:', endVector.label)

    // Add vector to animation with explicit label
    animatingVectors.value = [...animatingVectors.value, startVector]
    console.log('Current animating vectors:', animatingVectors.value)
    
    // Animate the vector
    await new Promise(resolve => {
      let startTime = Date.now()
      const duration = 1000

      const anim = new Konva.Animation(frame => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Calculate current position
        const currentVector = {
          ...vector,
          tail: {
            x: startVector.tail.x + (endVector.tail.x + moveDistance - startVector.tail.x) * progress,
            y: startVector.tail.y + (endVector.tail.y - startVector.tail.y) * progress
          },
          head: {
            x: startVector.head.x + (endVector.head.x + moveDistance - startVector.head.x) * progress,
            y: startVector.head.y + (endVector.head.y - startVector.head.y) * progress
          },
          label: vector.label
        }
        
        // Update the animating vectors
        animatingVectors.value = animatingVectors.value.map(v => 
          v.id === vector.id ? currentVector : v
        )
        
        if (progress >= 1) {
          console.log('Vector animation complete:', vector.id)
          anim.stop()
          resolve()
        }
      }, layer.value.getNode())

      console.log('Starting animation for vector:', vector.id)
      anim.start()
    })

    // Update cumulative position to be at the tip of the arrowhead
    cumulative = {
      x: endVector.head.x + (ARROW_HEAD_LENGTH * Math.cos(angle) / GRID_SCALE),
      y: endVector.head.y + (ARROW_HEAD_LENGTH * Math.sin(angle) / GRID_SCALE)
    }

    // Pause between vectors
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('All vector animations complete')
}

defineExpose({ animateVectors, layer, isMounted, setPosition })
</script>

<style scoped>
.animation-overlay {
  pointer-events: none;
}

.overlay-stage {
  width: 100%;
  height: 100%;
}
</style>
