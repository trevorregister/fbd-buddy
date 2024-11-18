<template>
  <div>
    <svg
      ref="svgCanvas"
      :width="canvasSize"
      :height="canvasSize"
      @mousedown="onCanvasMouseDown"
      @keydown="onKeyDown"
      tabindex="0"
      style="border:1px solid black; outline: none;"
    >
      <!-- Draw objects -->
      <g
        v-for="object in store.objects"
        :key="object.id"
        :transform="'translate(' + object.x + ',' + object.y + ')'"
        @mousedown.stop.prevent="onObjectMouseDown($event, object)"
      >
        <ellipse
          :rx="getObjectWidth(object) / 2"
          :ry="getObjectHeight(object) / 2"
          :fill="object.selected ? 'lightblue' : 'white'"
          stroke="black"
        />
        <g v-if="object.selected" 
           @mousedown.stop
           @click="deleteObject(object.id)"
           style="cursor: pointer;"
           :transform="`translate(${getObjectWidth(object)/2}, ${-getObjectHeight(object)/2})`"
        >
          <circle
            r="8"
            fill="#ff4444"
            stroke="#cc0000"
            stroke-width="1"
          />
          <text
            x="0"
            y="1"
            text-anchor="middle"
            alignment-baseline="middle"
            fill="white"
            font-size="12"
            font-weight="bold"
          >×</text>
        </g>
        <foreignObject
          :x="-getObjectWidth(object)/2"
          :y="-getObjectHeight(object)/2"
          :width="getObjectWidth(object)"
          :height="getObjectHeight(object)"
          @dblclick.stop.prevent="startEditing(object)"
        >
          <div xmlns="http://www.w3.org/1999/xhtml"
               style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
            <input v-if="object.isEditing"
                   v-model="object.label"
                   @blur="stopEditing(object)"
                   @keyup.enter="stopEditing(object)"
                   style="width: 90%; text-align: center; border: none; background: transparent;"
                   ref="editInput"
                   type="text"
            />
            <span v-else @dblclick.stop.prevent="startEditing(object)">{{ object.label }}</span>
          </div>
        </foreignObject>
      </g>

      <!-- Draw interactions -->
      <g
        v-for="interaction in store.interactions"
        :key="interaction.id"
        @mousedown.stop.prevent="onInteractionMouseDown($event, interaction)"
      >
        <path
          :d="getInteractionPath(interaction)"
          stroke="black"
          fill="none"
          stroke-width="2"
        />
        <foreignObject
          :x="getInteractionMidpoint(interaction).x - 25"
          :y="getInteractionMidpoint(interaction).y - 8"
          width="50"
          height="20"
        >
          <div 
            xmlns="http://www.w3.org/1999/xhtml" 
            class="math-container"
            v-html="renderKatex(interaction.label)"
          >
          </div>
        </foreignObject>
      </g>

      <!-- System boundary -->
      <g v-if="systemBoundary">
        <ellipse
          :cx="systemBoundary.x + systemBoundary.width/2"
          :cy="systemBoundary.y + systemBoundary.height/2"
          :rx="systemBoundary.width/2"
          :ry="systemBoundary.height/2"
          fill="rgba(0,0,0,0.01)"
          :stroke="isSystemSelected ? '#2196F3' : 'black'"
          :stroke-width="isSystemSelected ? 2 : 1"
          stroke-dasharray="5,5"
          @mousedown.stop.prevent="onSystemBoundaryMouseDown"
          style="cursor: move; pointer-events: all;"
        />
        
        <!-- Resize handles -->
        <template v-for="handle in ['nw', 'ne', 'sw', 'se']" :key="handle">
          <rect
            :x="handle.includes('w') ? systemBoundary.x - HANDLE_SIZE/2 : systemBoundary.x + systemBoundary.width - HANDLE_SIZE/2"
            :y="handle.includes('n') ? systemBoundary.y - HANDLE_SIZE/2 : systemBoundary.y + systemBoundary.height - HANDLE_SIZE/2"
            :width="HANDLE_SIZE"
            :height="HANDLE_SIZE"
            fill="white"
            stroke="black"
            @mousedown.stop="onResizeHandleMouseDown($event, handle)"
            style="cursor: pointer;"
          />
        </template>
      </g>
    </svg>

    <div class="button-container">
      <v-btn @click.prevent="addNewObject" class="mr-4">+ Object</v-btn>
      <v-btn @click="showInteractionDialog = true" :disabled="store.selectedObjects.length !== 2">
        + Interaction
      </v-btn>
      <v-btn @click="addSystemBoundary" class="ml-4">+ System</v-btn>
    </div>

    <!-- Interaction Dialog -->
    <v-dialog v-model="showInteractionDialog" max-width="400px">
      <v-card>
        <v-card-title>Add Interaction</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedInteractionType"
            :items="store.interactionTypes"
            item-title="text"
            item-value="value"
            label="Select Interaction Type"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showInteractionDialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="createInteraction">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useInteractionDiagramStore } from '~/stores/interactionDiagram'
import { storeToRefs } from 'pinia'

const store = useInteractionDiagramStore()
// Destructure for better reactivity
const { objects, interactions } = storeToRefs(store)

watch(() => store.objects, (newObjects) => {
  console.log('Objects updated:', newObjects)
}, { deep: true })

const canvasSize = 500
const objectWidth = 60
const objectHeight = 40
const dragData = ref(null)
const showInteractionDialog = ref(false)
const selectedInteractionType = ref(null)
const svgCanvas = ref(null)
const editInput = ref(null)
const systemBoundary = ref(null)
const isResizing = ref(false)
const resizeHandle = ref(null)
const HANDLE_SIZE = 8
const isSystemSelected = ref(false)

const addNewObject = (event) => {
  try {
    console.log('Adding new object')
    // Prevent any default behavior
    event?.preventDefault()
    // Add the object at the center of the canvas
    store.addObject(canvasSize / 2, canvasSize / 2)
    console.log('Current objects:', objects.value)
  } catch (error) {
    console.error('Error adding object:', error)
  }
}

const startEditing = (object) => {
  // Prevent event propagation
  event?.stopPropagation()
  event?.preventDefault()
  
  store.setObjectEditing(object.id, true)
  nextTick(() => {
    if (editInput.value) {
      const input = Array.isArray(editInput.value) 
        ? editInput.value[0] 
        : editInput.value
      if (input) {
        input.focus()
        input.select()
      }
    }
  })
}

const stopEditing = (object) => {
  if (!object.label.trim()) {
    object.label = 'Object' // Prevent empty labels
  }
  store.setObjectEditing(object.id, false)
  store.updateObjectLabel(object.id, object.label)
}

const onObjectMouseDown = (event, object) => {
  if (event.shiftKey) {
    store.toggleObjectSelection(object.id)
  } else {
    const rect = svgCanvas.value.getBoundingClientRect()
    dragData.value = {
      type: "object",
      object: object,
      offsetX: event.clientX - rect.left - object.x,
      offsetY: event.clientY - rect.top - object.y,
    }
  }
}

const getInteractionPath = (interaction) => {
  const fromObject = store.objects.find(
    (obj) => obj.id === interaction.fromObjectId
  );
  const toObject = store.objects.find(
    (obj) => obj.id === interaction.toObjectId
  );
  if (!fromObject || !toObject) return "";

  const fromPoint = getEllipseEdgePoint(fromObject, toObject);
  const toPoint = getEllipseEdgePoint(toObject, fromObject);

  // Get all interactions between these two objects
  const interactions = store.getInteractionsBetween(fromObject.id, toObject.id);
  // Find index of current interaction
  const currentIndex = interactions.findIndex(i => i.id === interaction.id);
  
  // Calculate offset based on interaction index
  const baseHeight = 50;
  const heightOffset = currentIndex * 30;
  const arcHeight = baseHeight + heightOffset;

  // Determine if arc should go above or below based on relative positions
  const shouldInvert = fromPoint.x > toPoint.x;
  const finalArcHeight = shouldInvert ? -arcHeight : arcHeight;

  const controlPoint = {
    x: (fromPoint.x + toPoint.x) / 2,
    y: Math.min(fromPoint.y, toPoint.y) - finalArcHeight,
  };
  return `M ${fromPoint.x} ${fromPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${toPoint.x} ${toPoint.y}`;
}

const getEllipseEdgePoint = (fromObject, toObject) => {
  const dx = toObject.x - fromObject.x;
  const dy = toObject.y - fromObject.y;
  const angle = Math.atan2(dy, dx);

  const rx = getObjectWidth(fromObject) / 2;
  const ry = getObjectHeight(fromObject) / 2;

  const edgeX = fromObject.x + rx * Math.cos(angle);
  const edgeY = fromObject.y + ry * Math.sin(angle);

  return { x: edgeX, y: edgeY };
}

const getInteractionMidpoint = (interaction) => {
  const fromObject = store.objects.find(
    (obj) => obj.id === interaction.fromObjectId
  );
  const toObject = store.objects.find(
    (obj) => obj.id === interaction.toObjectId
  );
  if (!fromObject || !toObject) return { x: 0, y: 0 };

  const fromPoint = getEllipseEdgePoint(fromObject, toObject);
  const toPoint = getEllipseEdgePoint(toObject, fromObject);

  // Get all interactions between these two objects
  const interactions = store.getInteractionsBetween(fromObject.id, toObject.id);
  // Find index of current interaction
  const currentIndex = interactions.findIndex(i => i.id === interaction.id);
  
  // Calculate offset based on interaction index
  const baseHeight = 50;
  const heightOffset = currentIndex * 30;
  const arcHeight = baseHeight + heightOffset;

  // Determine if arc should go above or below based on relative positions
  const shouldInvert = fromPoint.x > toPoint.x;
  const finalArcHeight = shouldInvert ? -arcHeight : arcHeight;
  
  return {
    x: (fromPoint.x + toPoint.x) / 2,
    y: Math.min(fromPoint.y, toPoint.y) - finalArcHeight,
  };
}

const createInteraction = () => {
  store.addInteraction(selectedInteractionType.value)
  showInteractionDialog.value = false
  selectedInteractionType.value = null
}

const onCanvasMouseDown = () => {
  store.clearSelection()
  isSystemSelected.value = false
}

const onMouseMove = (event) => {
  if (!dragData.value) return
  
  const rect = svgCanvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  if (dragData.value.type === "object") {
    const newX = mouseX - dragData.value.offsetX
    const newY = mouseY - dragData.value.offsetY
    
    const halfWidth = objectWidth / 2
    const halfHeight = objectHeight / 2
    
    const constrainedX = Math.max(halfWidth, Math.min(canvasSize - halfWidth, newX))
    const constrainedY = Math.max(halfHeight, Math.min(canvasSize - halfHeight, newY))
    
    store.updateObjectPosition(dragData.value.object.id, constrainedX, constrainedY)
  } else if (dragData.value.type === "system") {
    const newX = mouseX - dragData.value.offsetX
    const newY = mouseY - dragData.value.offsetY
    
    // Add boundary constraints
    systemBoundary.value.x = Math.max(0, Math.min(canvasSize - systemBoundary.value.width, newX))
    systemBoundary.value.y = Math.max(0, Math.min(canvasSize - systemBoundary.value.height, newY))
  } else if (dragData.value.type === "resize") {
    const orig = dragData.value.originalBoundary
    const dx = mouseX - dragData.value.startX
    const dy = mouseY - dragData.value.startY

    switch (resizeHandle.value) {
      case 'se':  // Southeast
        const newWidthSE = Math.max(50, Math.min(orig.width + dx, canvasSize - orig.x))
        const newHeightSE = Math.max(50, Math.min(orig.height + dy, canvasSize - orig.y))
        systemBoundary.value.width = newWidthSE
        systemBoundary.value.height = newHeightSE
        break
        
      case 'sw':  // Southwest
        const newWidthSW = Math.max(50, orig.width - dx)
        const newXSW = Math.min(orig.x + dx, orig.x + orig.width - 50)
        const newHeightSW = Math.max(50, Math.min(orig.height + dy, canvasSize - orig.y))
        
        systemBoundary.value.width = newWidthSW
        systemBoundary.value.x = Math.max(0, newXSW)
        systemBoundary.value.height = newHeightSW
        break
        
      case 'ne':  // Northeast
        const newWidthNE = Math.max(50, Math.min(orig.width + dx, canvasSize - orig.x))
        const newHeightNE = Math.max(50, orig.height - dy)
        const newYNE = Math.min(orig.y + dy, orig.y + orig.height - 50)
        
        systemBoundary.value.width = newWidthNE
        systemBoundary.value.height = newHeightNE
        systemBoundary.value.y = Math.max(0, newYNE)
        break
        
      case 'nw':  // Northwest
        const newWidthNW = Math.max(50, orig.width - dx)
        const newXNW = Math.min(orig.x + dx, orig.x + orig.width - 50)
        const newHeightNW = Math.max(50, orig.height - dy)
        const newYNW = Math.min(orig.y + dy, orig.y + orig.height - 50)
        
        systemBoundary.value.width = newWidthNW
        systemBoundary.value.x = Math.max(0, newXNW)
        systemBoundary.value.height = newHeightNW
        systemBoundary.value.y = Math.max(0, newYNW)
        break
    }
  }
}

const onMouseUp = () => {
  dragData.value = null
  isResizing.value = false
  resizeHandle.value = null
}

const onKeyDown = (event) => {
  console.log('Key pressed:', event.key, 'System selected:', isSystemSelected.value)
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (isSystemSelected.value && systemBoundary.value) {
      systemBoundary.value = null
      isSystemSelected.value = false
    }
  }
}

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
  window.addEventListener("keydown", onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMouseMove)
  window.removeEventListener("mouseup", onMouseUp)
  window.removeEventListener("keydown", onKeyDown)
})

const renderKatex = (text) => {
  try {
    // Extract just the force symbol and type (F_g), removing vector notation and object
    const cleanText = text
      .replace('\\vec{', '')
      .replace(/\\text{[^}]+}/g, '') // Remove any \text{...} parts
      .replace(/[{}\\]/g, '')
      .split('_')
      .slice(0, 2)  // Take only the first two parts (F and g)
      .join('_')    // Rejoin with underscore
      
    return katex.renderToString(cleanText, {
      throwOnError: false,
      displayMode: false
    })
  } catch (e) {
    console.error('KaTeX error:', e)
    return text
  }
}

const addSystemBoundary = () => {
  systemBoundary.value = {
    x: canvasSize / 4,
    y: canvasSize / 4,
    width: canvasSize / 2,
    height: canvasSize / 2,
    isSelected: false
  }
}

const onSystemBoundaryMouseDown = (event) => {
  if (!systemBoundary.value) return
  
  isSystemSelected.value = true
  const rect = svgCanvas.value.getBoundingClientRect()
  dragData.value = {
    type: "system",
    offsetX: event.clientX - rect.left - systemBoundary.value.x,
    offsetY: event.clientY - rect.top - systemBoundary.value.y
  }
}

const onResizeHandleMouseDown = (event, handle) => {
  event.stopPropagation()
  if (!systemBoundary.value) return

  const rect = svgCanvas.value.getBoundingClientRect()
  isResizing.value = true
  resizeHandle.value = handle
  dragData.value = {
    type: "resize",
    startX: event.clientX - rect.left,
    startY: event.clientY - rect.top,
    originalBoundary: { ...systemBoundary.value }
  }
}

const deleteObject = (id) => {
  console.log('Delete button clicked for object:', id)
  console.log('Objects before delete:', objects.value)
  
  // Stop event propagation
  event?.stopPropagation()
  
  store.deleteInteractionsForObject(id)
  store.deleteObject(id)
  
  nextTick(() => {
    console.log('Objects after delete:', objects.value)
  })
}

// Update the getObjectDimensions function to add more horizontal padding
const getObjectDimensions = (object) => {
  // Create a temporary span to measure text width
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.position = 'absolute'
  span.style.fontSize = '14px' // Match your text size
  span.innerText = object.label
  document.body.appendChild(span)
  
  // Get dimensions and add padding
  const width = Math.max(60, span.offsetWidth + 40) // Increased horizontal padding to 40px (20px on each side)
  const height = Math.max(40, span.offsetHeight + 16) // Keep vertical padding the same
  
  // Clean up
  document.body.removeChild(span)
  
  return { width, height }
}

// Replace the fixed objectWidth and objectHeight with computed values
const getObjectWidth = (object) => {
  return getObjectDimensions(object).width
}

const getObjectHeight = (object) => {
  return getObjectDimensions(object).height
}

// Update template references to use the new dynamic dimensions
</script>

<style scoped>
svg {
  cursor: default;
  width: 100%;
  height: 500px;
}

input:focus {
  outline: none;
}

.math-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  padding: 0px 2px;
  border-radius: 3px;
}

/* Update KaTeX specific styles */
:deep(.katex) {
  font-size: 1em !important;
  color: black !important; /* Force black color */
  line-height: 1;
}

:deep(.katex-display) {
  margin: 0 !important;
  padding: 0 !important;
}

.button-container {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.ml-4 {
  margin-left: 16px;
}
</style> 