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
          :fill="'black'"/>
        <ForceVector v-for="vector in cumulativeVectors" 
          :key="vector.id"
          :tail="vector.tail" 
          :head="vector.head" 
          :id="vector.id"
          :showComponents="showComponents"
          :canDrag="false"
        />  
      </v-layer>
    </v-stage>
  </ClientOnly>
</template>

<script setup>
import { computed } from 'vue'
import Grid from '~/components/Grid.vue'
import ForceVector from '~/components/ForceVector.vue'

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

const cumulativeVectors = computed(() => {
  let cumulative = { x: 0, y: 0 }
  return props.forceVectors.map(v => {
    const newVector = {
      id: `cumulative-${v.id}`,
      tail: { x: cumulative.x, y: cumulative.y },
      head: { 
        x: cumulative.x + (v.head.x - v.tail.x),
        y: cumulative.y + (v.head.y - v.tail.y)
      }
    }
    cumulative = newVector.head
    return newVector
  })
})
</script>

<style scoped>
.grid-stage {
  width: 100%;
  height: 500px; /* Adjust this value to match your desired grid height */
}
</style>