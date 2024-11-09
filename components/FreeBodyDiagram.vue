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
                @update:head="(newHead) => updateVectorHead(vector.id, newHead)"
              />  
            </v-layer>
          </v-stage>
        </ClientOnly>
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
    })
    
    const emit = defineEmits(['updateVectorHead', 'update:objectExperiencingForce'])
    
    const forceVectorsStore = useForceVectorsStore()
    
    // Create a computed property for the vectors
    const vectors = computed(() => forceVectorsStore.vectors)
    
    const updateVectorHead = (id, newHead) => {
      emit('updateVectorHead', id, newHead)
    }
    </script>
    
    <style scoped>
    .grid-column {
      display: flex;
      flex-direction: column;
    }
    
    .grid-header {
      height: 48px;
      display: flex;
      align-items: center;
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