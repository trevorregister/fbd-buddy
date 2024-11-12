<template>
  <div class="grid-column">
    <div class="grid-header">
      <div class="free-body-diagram-label">
        <div class="label-content">
          <span>Free Body Diagram for:</span>
          <v-combobox
            v-model="localObjectName"
            :items="objectLabels"
            @blur="handleObjectCreation"
            @keyup.enter="handleObjectCreation"
            placeholder="Select or create object"
            :error="!localObjectName"
            :error-messages="!localObjectName ? 'Required' : ''"
            :hint="!localObjectName ? 'Please select or type an object' : ''"
            :persistent-hint="!localObjectName"
            dense
            hide-details="auto"
            class="ml-2 object-input"
            style="max-width: 200px;"
          >
            <template v-slot:prepend-inner>
              <v-tooltip
                activator="parent"
                location="bottom"
                :open-on-hover="!localObjectName"
              >
                Please select or type an object
              </v-tooltip>
            </template>
          </v-combobox>
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
              v-for="vector in forceVectorsStore.vectors" 
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
              :coordinateSystem="coordinateSystem"
              :isDragging="draggedVectorId === vector.id"
              @update:head="(newHead) => updateVectorHead(vector.id, newHead)"
              @drag-start="draggedVectorId = vector.id"
              @drag-end="draggedVectorId = null"
            />  
          </v-layer>
        </v-stage>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useInteractionDiagramStore } from '~/stores/interactionDiagram'
import { useForceVectorsStore } from '~/stores/forceVectors'

const props = defineProps({
  objectExperiencingForce: String,
  configStage: Object,
  backgroundConfig: Object,
  hideGrid: Boolean,
  showComponents: Boolean,
  isAnimating: Boolean,
  hideLabels: Boolean,
  coordinateSystem: {
    type: String,
    default: 'cartesian'
  }
})

const emit = defineEmits(['updateVectorHead', 'update:objectExperiencingForce'])

const forceVectorsStore = useForceVectorsStore()
const interactionStore = useInteractionDiagramStore()

// Create a computed property for the object labels
const objectLabels = computed(() => {
  return interactionStore.objects.map(obj => obj.label)
})

// Create a ref for the local object name
const localObjectName = ref('')

// Watch for changes in the prop
watch(() => props.objectExperiencingForce, (newValue) => {
  localObjectName.value = newValue || ''
})

// Update the handleObjectCreation function
const handleObjectCreation = () => {
  if (!localObjectName.value) return

  console.log('handleObjectCreation called with localObjectName:', localObjectName.value)

  // Check if this is a new object
  const existingObject = interactionStore.objects.find(obj => obj.label === localObjectName.value)
  
  if (!existingObject) {
    console.log('No existing object found, creating new one with label:', localObjectName.value)
    // Add new object to the interaction diagram
    const label = localObjectName.value.trim()
    interactionStore.addObject(
      interactionStore.objects.length * 60 + 100,
      250,
      label
    )
    console.log('Object creation requested with label:', label)
  }

  // Emit the update
  emit('update:objectExperiencingForce', localObjectName.value)
}

// Add a watcher for the v-model of the combobox
watch(localObjectName, (newValue) => {
  console.log('localObjectName changed to:', newValue)
})

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

// Add draggedVectorId ref
const draggedVectorId = ref(null)
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

.object-input {
  font-size: 14px !important;
  width: 100px !important;
}

/* Add these styles to reduce the height */
:deep(.object-input .v-field__input) {
  min-height: 32px !important;
  padding: 4px 8px !important;
}

:deep(.object-input .v-field) {
  min-height: 32px !important;
}

:deep(.object-input .v-select__selection),
:deep(.object-input .v-combobox__selection) {
  margin: 0 !important;
  padding: 0 !important;
}

/* Style for error state */
:deep(.object-input.error .v-field) {
  border-color: rgb(var(--v-theme-error)) !important;
}

:deep(.object-input .v-field--error) {
  --v-field-border-width: 2px;
}

/* Adjust tooltip style */
:deep(.v-tooltip) {
  font-size: 14px;
}
</style>