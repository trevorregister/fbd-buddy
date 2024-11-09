<template>
  <div class="grid-column">
    <div class="grid-header">
      <div class="free-body-diagram-label">
        <div class="label-content">
          <span>Free Body Diagram for:</span>
          <v-text-field
            :value="objectExperiencingForce"
            @input="$emit('update:objectExperiencingForce', $event.target.value)"
            placeholder="object"
            dense
            hide-details
            class="ml-2"
            style="max-width: 200px;"
          ></v-text-field>
        </div>
      </div>
    </div>
    <div class="grid-stage-container">
      <ClientOnly>
        <v-stage ref="leftGrid" :config="configStage" class="grid-stage">
          <v-layer>
            <v-image :config="backgroundConfig" />
            <Point 
              :x="0"
              :y="0"
              :radius="8"
              :fill="'black'"
            />
            <Grid 
              :spacing="50" 
              :hideGrid="hideGrid"
            />
            <ForceVector 
              v-for="vector in vectors" 
              :key="vector.id"
              :tail="vector.tail" 
              :head="vector.head" 
              :showComponents="showComponents"
              :id="vector.id"
              :canDrag="!isAnimating"
              :isHighlighted="vector.id === forceVectorsStore.highlightedVectorId"
              :label="vector.name"
              :offset="vectorOffsets.get(vector.id) || { x: 0, y: 0 }"
              :hideLabels="hideLabels"
              @update:head="(newHead) => updateVectorHead(vector.id, newHead)"
            />  
          </v-layer>
        </v-stage>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
import { defineProps, watch, ref, computed } from 'vue'
import Grid from '~/components/Grid.vue'
import Point from '~/components/Point.vue'
import ForceVector from '~/components/ForceVector.vue'
import { useForceVectorsStore } from '~/stores/forceVectors'

const props = defineProps({
  objectExperiencingForce: String,
  configStage: Object,
  backgroundConfig: Object,
  hideGrid: Boolean,
  showComponents: Boolean,
  isAnimating: Boolean,
  hideLabels: Boolean
})

const emit = defineEmits(['updateVectorHead', 'update:objectExperiencingForce'])

const forceVectorsStore = useForceVectorsStore()

// Create a computed property for the vectors
const vectors = computed(() => forceVectorsStore.vectors)

// Add this computed property to calculate offsets for parallel vectors
const vectorOffsets = computed(() => {
  const offsets = new Map()
  const parallelGroups = []
  
  // Group parallel vectors
  vectors.value.forEach((v1, i) => {
    const dx1 = v1.head.x - v1.tail.x
    const dy1 = v1.head.y - v1.tail.y
    let foundGroup = false
    
    for (let group of parallelGroups) {
      const v2 = group[0]
      const dx2 = v2.head.x - v2.tail.x
      const dy2 = v2.head.y - v2.tail.y
      
      // Check if vectors are parallel (cross product = 0)
      if (Math.abs(dx1 * dy2 - dy1 * dx2) < 0.0001) {
        group.push(v1)
        foundGroup = true
        break
      }
    }
    
    if (!foundGroup) {
      parallelGroups.push([v1])
    }
  })
  
  // Calculate offsets for each group
  parallelGroups.forEach(group => {
    if (group.length > 1) {
      const offsetDistance = 10
      group.forEach((vector, index) => {
        const centerIndex = (group.length - 1) / 2
        const relativeIndex = index - centerIndex
        
        // Calculate perpendicular direction
        const dx = vector.head.x - vector.tail.x
        const dy = vector.head.y - vector.tail.y
        const length = Math.sqrt(dx * dx + dy * dy)
        
        offsets.set(vector.id, {
          x: (-dy / length) * offsetDistance * relativeIndex,
          y: (dx / length) * offsetDistance * relativeIndex,
          isParallel: true,
          relativeIndex
        })
      })
    } else {
      offsets.set(group[0].id, { 
        x: 0, 
        y: 0, 
        isParallel: false,
        relativeIndex: 0 
      })
    }
  })
  
  return offsets
})

const updateVectorHead = (id, newHead) => {
  emit('updateVectorHead', id, newHead)
}
</script>

<style scoped>
.grid-column {
  display: flex;
  flex-direction: column;
  width: 500px; /* Exact width */
}

.grid-header {
  height: 48px;
  display: flex;
  align-items: center;
  width: 100%;
}

.grid-stage-container {
  width: 500px; /* Exact width */
  height: 500px; /* Exact height */
}

.grid-stage {
  width: 100%;
  height: 100%;
}

.free-body-diagram-label {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.label-content {
  display: flex;
  align-items: center;
}
</style>