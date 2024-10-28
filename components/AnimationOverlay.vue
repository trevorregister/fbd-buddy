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

const animateVectors = async () => {
  console.log('Starting vector animation with vectors:', props.forceVectors)
  
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
  const moveDistance = props.configStage.width + 82 // Width of one grid plus spacing plus padding

  // Keep track of cumulative position in the right grid
  let cumulativePosition = { x: 0, y: 0 }

  // Animate each vector one by one
  for (let i = 0; i < props.forceVectors.length; i++) {
    const vector = props.forceVectors[i]
    console.log('Starting animation for vector:', vector, 'Current cumulative position:', cumulativePosition)
    
    // Calculate vector displacement
    const dx = vector.head.x - vector.tail.x
    const dy = vector.head.y - vector.tail.y
    console.log('Vector displacement:', { dx, dy })
    
    // Calculate start and end positions
    const startVector = {
      ...vector,
      id: vector.id
    }

    // Calculate end position (tail at cumulative position)
    const endVector = {
      ...vector,
      tail: { ...cumulativePosition },
      head: {
        x: cumulativePosition.x + dx,
        y: cumulativePosition.y + dy
      }
    }

    console.log('Animation details:', {
      startVector: {
        tail: startVector.tail,
        head: startVector.head
      },
      endVector: {
        tail: endVector.tail,
        head: endVector.head
      },
      cumulativePosition,
      moveDistance
    })

    // Add vector to animation
    animatingVectors.value = [...animatingVectors.value, startVector]
    
    // Animate the vector
    await new Promise(resolve => {
      let startTime = Date.now()
      const duration = 1000 // 1 second

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
          }
        }

        console.log('Animation frame:', {
          progress,
          currentPosition: {
            tail: currentVector.tail,
            head: currentVector.head
          }
        })
        
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

    // Update cumulative position to be at the head of this vector
    cumulativePosition = {
      x: cumulativePosition.x + dx,
      y: cumulativePosition.y + dy
    }
    console.log('Updated cumulative position:', cumulativePosition)

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
