<template>
  <div>
    <svg
      ref="svgCanvas"
      :width="canvasSize"
      :height="canvasSize"
      @mousedown="onCanvasMouseDown"
      style="border:1px solid black"
    >
      <!-- Draw objects -->
      <g
        v-for="object in store.objects"
        :key="object.id"
        :transform="'translate(' + object.x + ',' + object.y + ')'"
        @mousedown.stop.prevent="onObjectMouseDown($event, object)"
      >
        <ellipse
          :rx="objectWidth / 2"
          :ry="objectHeight / 2"
          :fill="object.selected ? 'lightblue' : 'white'"
          stroke="black"
        />
        <foreignObject
          :x="-objectWidth/2"
          :y="-objectHeight/2"
          :width="objectWidth"
          :height="objectHeight"
          @dblclick.stop="startEditing(object)"
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
            <span v-else>{{ object.label }}</span>
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
    </svg>

    <div class="button-container">
      <v-btn @click="addNewObject" class="mr-4">+ Object</v-btn>
      <v-btn @click="showInteractionDialog = true" :disabled="store.selectedObjects.length !== 2">
        + Interaction
      </v-btn>
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useInteractionDiagramStore } from '~/stores/interactionDiagram'

const store = useInteractionDiagramStore()

const canvasSize = 500
const objectWidth = 60
const objectHeight = 40
const dragData = ref(null)
const showInteractionDialog = ref(false)
const selectedInteractionType = ref(null)
const svgCanvas = ref(null)
const editInput = ref(null)

const addNewObject = () => {
  store.addObject(canvasSize / 2, canvasSize / 2)
}

const startEditing = (object) => {
  store.setObjectEditing(object.id, true)
  nextTick(() => {
    if (editInput.value && editInput.value.length > 0) {
      editInput.value[0].focus()
      editInput.value[0].select()
    }
  })
}

const stopEditing = (object) => {
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

  const rx = objectWidth / 2;
  const ry = objectHeight / 2;

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
}

const onMouseMove = (event) => {
  if (!dragData.value) return
  
  if (dragData.value.type === "object") {
    const rect = svgCanvas.value.getBoundingClientRect()
    const newX = event.clientX - rect.left - dragData.value.offsetX
    const newY = event.clientY - rect.top - dragData.value.offsetY
    
    const halfWidth = objectWidth / 2
    const halfHeight = objectHeight / 2
    
    const constrainedX = Math.max(halfWidth, Math.min(canvasSize - halfWidth, newX))
    const constrainedY = Math.max(halfHeight, Math.min(canvasSize - halfHeight, newY))
    
    store.updateObjectPosition(dragData.value.object.id, constrainedX, constrainedY)
  }
}

const onMouseUp = () => {
  dragData.value = null
}

onMounted(() => {
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
})

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMouseMove)
  window.removeEventListener("mouseup", onMouseUp)
})

const renderKatex = (text) => {
  try {
    return katex.renderToString(text, {
      throwOnError: false,
      displayMode: true
    });
  } catch (e) {
    console.error('KaTeX error:', e);
    return text;
  }
}
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

/* Add KaTeX specific styles */
.katex {
  font-size: 1em !important;
  color: red;
  line-height: 1;
}

.katex-display {
  margin: 0 !important;
  padding: 0 !important;
}

.button-container {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.ml-4 {
  margin-left: 16px;
}
</style> 