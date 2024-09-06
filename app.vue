<template>
  <div>
    <ClientOnly>
      <v-stage :config="configKonva"> 
        <v-layer>
          <v-circle :config="configCircle" />
        </v-layer>
      </v-stage>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const configKonva = {
  width: 500,
  height: 500,
}

const configCircle = {
  x: 100,
  y: 100,
  radius: 50,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 4,
};
  
</script>
