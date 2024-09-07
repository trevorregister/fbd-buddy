<template>
  <v-app>
    <v-main>
      <v-container>
        <ClientOnly>
          <v-stage :config="configStage">
            <v-layer>
              <Grid :spacing="50" />
              <Point :x="10" :y="20" />
              <!-- Add more points and arrows as needed -->
            </v-layer>
          </v-stage>
        </ClientOnly>
        <v-btn @click="clearCanvas">
          Clear Canvas
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import Grid from '~/components/Grid.vue'
import Point from '~/components/Point.vue'
import { provideCanvasDimensions } from '~/composables/useCanvasDimensions'

const configStage = {
  width: 500,
  height: 500,
}

// Provide canvas dimensions to all child components
provideCanvasDimensions(configStage.width, configStage.height)

// ... rest of your script
</script>