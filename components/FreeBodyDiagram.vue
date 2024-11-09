<template>
      <div class="grid-column">
        <div class="grid-header">
          <div class="free-body-diagram-label">
            <div class="label-content">
              <span>Free Body Diagram for:</span>
              <v-text-field
                v-model="props.objectExperiencingForce"
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
          <v-stage ref="leftGrid" :config="props.configStage" class="grid-stage">
            <v-layer ref="layer">
              <v-image :config="props.backgroundConfig" />
              <Point 
                :x="0"
                :y="0"
                :radius="8"
                :fill="'black'"/>
              <Grid 
                :spacing="50" 
                :hideGrid="props.hideGrid"/>
              <ForceVector v-for="vector in props.forceVectors" :key="vector.id"
                :tail="vector.tail" 
                :head="vector.head" 
                :showComponents="props.showComponents"
                :id="vector.id"
                :canDrag="!props.isAnimating"
                :isHighlighted="vector.id === props.highlightedVectorId"
                :label="vector.name"
                @update:head="(newHead) => updateVectorHead(vector.id, newHead)"
              />  
            </v-layer>
          </v-stage>
        </ClientOnly>
      </div>
    </template>
    
    <script setup>
    import { defineProps } from 'vue'
    import Grid from '~/components/Grid.vue'
    import Point from '~/components/Point.vue'
    import ForceVector from '~/components/ForceVector.vue'
    
    const props = defineProps({
      forceVectors: Array,
      objectExperiencingForce: String,
      configStage: Object,
      backgroundConfig: Object,
      hideGrid: Boolean,
      showComponents: Boolean,
      isAnimating: Boolean,
      highlightedVectorId: [String, Number],
    })
    
    const updateVectorHead = (id, newHead) => {
      const index = props.forceVectors.findIndex(v => v.id === id)
      if (index !== -1) {
        props.forceVectors[index] = {
          ...props.forceVectors[index],
          head: newHead
        }
      }
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