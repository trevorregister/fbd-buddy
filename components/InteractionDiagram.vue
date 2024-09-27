<template>
    <div>
      <div id="draw2d-canvas" ref="canvas" style="width: 500px; height: 400px; border: 1px solid black;"></div>
      <v-btn @click="addObject" class="mt-2">Add Object</v-btn>
      <p>{{ debugMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeMount } from 'vue';
  import $ from 'jquery';

  const canvas = ref(null);
  let drawCanvas = null;
  const debugMessage = ref('Initializing...');

  onBeforeMount(() => {
    debugMessage.value = 'Before mount...';
  });

  onMounted(async () => {
    debugMessage.value = 'Mounted, checking if client...';
    if (typeof window !== 'undefined') {
      try {
        debugMessage.value = 'Setting up jQuery...';
        window.jQuery = window.$ = $;
        await import('jquery-ui-dist/jquery-ui');
        debugMessage.value = 'Importing draw2d...';
        const draw2d = await import('draw2d');
        debugMessage.value = 'draw2d imported, initializing canvas...';
        drawCanvas = new draw2d.Canvas('draw2d-canvas');
        drawCanvas.setScrollArea('#draw2d-canvas');
        debugMessage.value = 'Canvas initialized successfully';

      } catch (error) {
        debugMessage.value = `Error initializing canvas: ${error.message}`;
        console.error('Canvas initialization error:', error);
      }
    } else {
      debugMessage.value = 'Not on client side';
    }
  });

  const addObject = async () => {
    if (typeof window !== 'undefined' && drawCanvas) {
      try {
        const draw2d = await import('draw2d');
        const objectName = prompt("Enter object name:");
        if (objectName) {
          const figure = new draw2d.shape.basic.Rectangle({
            width: 100,
            height: 60,
            radius: 10,
            stroke: 3,
            color: "#00A8F0",
            bgColor: "#f0f0f0"
          });

          figure.add(new draw2d.shape.basic.Label({
            text: objectName,
            stroke: 1,
            fontColor: "#000000",
            fontSize: 14
          }), new draw2d.layout.locator.CenterLocator());

          const randomX = Math.random() * 400;
          const randomY = Math.random() * 300;
          drawCanvas.add(figure, randomX, randomY);
          debugMessage.value = `Object "${objectName}" added at (${randomX.toFixed(2)}, ${randomY.toFixed(2)})`;
        } else {
          debugMessage.value = 'Object creation cancelled';
        }
      } catch (error) {
        debugMessage.value = `Error adding object: ${error.message}`;
        console.error('Error adding object:', error);
      }
    } else {
      debugMessage.value = 'Canvas not initialized or not on client side';
    }
  };
  </script>
  
  <style scoped>
  .mt-2 {
    margin-top: 8px;
  }
  </style>