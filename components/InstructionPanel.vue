<template>
  <div class="instruction-panel" :class="{ 'collapsed': !isOpen }">
    <!-- Tab handle -->
    <div class="panel-tab" @click="togglePanel">
      <span class="tab-text vertical-text">Instructions</span>
      <v-icon>{{ isOpen ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
    </div>

    <!-- Panel content -->
    <div v-if="isOpen" class="panel-content">
      <h3>{{ currentInstructions.title }}</h3>
      <div class="instruction-text" v-html="currentInstructions.content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  currentTab: {
    type: String,
    required: true
  }
})

const isOpen = ref(true)

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const currentInstructions = computed(() => {
  switch (props.currentTab) {
    case 'interaction':
      return {
        title: 'Interaction Diagram',
        content: `
          <ol>
            <li>Click "+ Object" to add objects to your diagram</li>
            <li>Double-click an object's name to edit it</li>
            <li>Hold Shift and click two objects to select them</li>
            <li>Click "+ Interaction" to add a force between selected objects</li>
            <li>Click "+ System" to add a system boundary</li>
            <li>Drag objects to reposition them</li>
          </ol>
        `
      }
    case 'fbd':
      return {
        title: 'Free Body Diagram',
        content: `
          <ol>
            <li>Select or create an object using the dropdown menu</li>
            <li>Click and drag the arrow heads to adjust forces</li>
            <li>Toggle components view using the settings</li>
            <li>Forces are automatically named based on their type</li>
          </ol>
        `
      }
    case 'addition':
      return {
        title: 'Vector Addition',
        content: `
          <ol>
            <li>Forces from your Free Body Diagram appear here</li>
            <li>Watch the animation to see how forces add</li>
            <li>The resultant force is shown in the final position</li>
            <li>Use the table below to see numerical values</li>
          </ol>
        `
      }
    default:
      return {
        title: 'Instructions',
        content: 'Select a diagram to see specific instructions.'
      }
  }
})
</script>

<style scoped>
.instruction-panel {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  background-color: white;
  border-left: 1px solid #ddd;
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
  z-index: 100;
  height: 80vh;
  display: flex;
}

.collapsed {
  width: 40px;
}

.panel-tab {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 120px;
  background-color: white;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 14px;
  font-weight: 500;
}

.panel-content {
  padding: 20px;
  overflow-y: auto;
  width: 100%;
}

h3 {
  margin-bottom: 16px;
  color: #2196F3;
}

.instruction-text {
  font-size: 14px;
  line-height: 1.6;
}

ol {
  padding-left: 20px;
}

li {
  margin-bottom: 12px;
}
</style> 