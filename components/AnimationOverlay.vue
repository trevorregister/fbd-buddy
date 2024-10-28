<template>
  <div id="animation-container" class="animation-overlay" :style="overlayStyle">
    <ClientOnly>
      <v-stage :config="overlayConfig" class="overlay-stage">
        <v-layer ref="layer">
          <v-circle :config="dotConfig" />
        </v-layer>
      </v-stage>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Konva from 'konva'

const props = defineProps({
  configStage: Object
})

const layer = ref(null)
const isMounted = ref(false)
const position = ref({ left: 0, top: 0, totalWidth: 1020 })

// Calculate total width including the gap between grids
const totalWidth = computed(() => {
  return position.value.totalWidth
})

const overlayConfig = computed(() => ({
  width: totalWidth.value,
  height: props.configStage.height,
}))

const dotPosition = ref({ x: 0, y: props.configStage.height / 2 })

const dotConfig = computed(() => ({
  x: dotPosition.value.x,
  y: dotPosition.value.y,
  radius: 20,
  fill: 'red',
  opacity: 1
}))

const overlayStyle = computed(() => ({
  position: 'fixed',
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  width: `${totalWidth.value}px`,
  height: `${props.configStage.height}px`,
  pointerEvents: 'none',
  zIndex: 9999,
  background: 'transparent',}))

const setPosition = (pos) => {
  position.value = pos
}

onMounted(() => {
  console.log('Animation overlay mounted')
  isMounted.value = true
})

const animateDot = async () => {
  console.log('Starting dot animation')
  
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
  
  const startX = 0
  const endX = totalWidth.value // Use the full width for animation
  
  return new Promise(resolve => {
    const anim = new Konva.Animation(frame => {
      const progress = Math.min(frame.time / 1000, 1)
      const currentX = startX + (endX - startX) * progress
      
      dotPosition.value = {
        x: currentX,
        y: props.configStage.height / 2
      }
      
      if (progress >= 1) {
        anim.stop()
        resolve()
      }
    }, layer.value.getNode())

    anim.start()
  })
}

defineExpose({ animateDot, layer, isMounted, setPosition })
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
