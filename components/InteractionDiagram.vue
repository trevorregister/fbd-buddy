<template>
  <div>
    <svg
      ref="svgCanvas"
      :width="canvasSize"
      :height="canvasSize -100"
      @mousedown="onCanvasMouseDown"
      style="border:1px solid black"
    >
      <!-- Draw objects -->
      <g
        v-for="object in objects"
        :key="object.id"
        :transform="'translate(' + object.x + ',' + object.y + ')'"
        @mousedown.stop.prevent="onObjectMouseDown($event, object)"
        @dblclick.stop.prevent="editObjectLabel(object)"
      >
        <ellipse
          :rx="objectWidth / 2"
          :ry="objectHeight / 2"
          :fill="object.selected ? 'lightblue' : 'white'"
          stroke="black"
        />
        <text
          x="0"
          y="5"
          text-anchor="middle"
          font-size="14"
          fill="black"
        >
          {{ object.label }}
        </text>
      </g>

      <!-- Draw interactions -->
      <g
        v-for="interaction in interactions"
        :key="interaction.id"
        @mousedown.stop.prevent="onInteractionMouseDown($event, interaction)"
      >
        <path
          :d="getInteractionPath(interaction)"
          stroke="black"
          fill="none"
          stroke-width="2"
        />
        <text
          :x="getInteractionMidpoint(interaction).x"
          :y="getInteractionMidpoint(interaction).y"
          text-anchor="middle"
          font-size="12"
          fill="red"
        >
          {{ interaction.label }}
        </text>
      </g>
    </svg>

    <!-- Buttons -->
    <div style="margin-top:10px;">
      <button @click="addObject">Add Object</button>
      <button @click="addInteraction" :disabled="selectedObjects.length !== 2">
        Add Interaction
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "InteractionDiagram",
  data() {
    return {
      canvasSize: 500,
      objectWidth: 60,
      objectHeight: 40,
      objects: [],
      interactions: [],
      selectedObjects: [],
      dragData: null,
    };
  },
  methods: {
    addObject() {
      const newObject = {
        id: Date.now(),
        x: this.canvasSize / 2,
        y: this.canvasSize / 2,
        label: "Object",
        selected: false,
      };
      this.objects.push(newObject);
    },
    editObjectLabel(object) {
      const label = prompt("Enter object label:", object.label);
      if (label !== null) {
        object.label = label;
      }
    },
    onObjectMouseDown(event, object) {
      if (event.shiftKey) {
        // Toggle selection
        object.selected = !object.selected;
        if (object.selected) {
          this.selectedObjects.push(object);
        } else {
          this.selectedObjects = this.selectedObjects.filter(
            (obj) => obj.id !== object.id
          );
        }
      } else {
        // Start dragging
        this.dragData = {
          type: "object",
          object: object,
          offsetX: event.offsetX - object.x,
          offsetY: event.offsetY - object.y,
        };
      }
    },
    addInteraction() {
      const [obj1, obj2] = this.selectedObjects;
      const interactionType = prompt(
        "Select interaction type:\n1. Gravitational\n2. Electrostatic\n3. Magnetic\n4. Normal\n5. Frictional",
        "1"
      );
      const types = [
        "Gravitational",
        "Electrostatic",
        "Magnetic",
        "Normal",
        "Frictional",
      ];
      const label = types[parseInt(interactionType) - 1] || "Interaction";
      const newInteraction = {
        id: Date.now(),
        fromObjectId: obj1.id,
        toObjectId: obj2.id,
        label: label,
      };
      this.interactions.push(newInteraction);
      // Reset selection
      this.objects.forEach((obj) => (obj.selected = false));
      this.selectedObjects = [];
    },
    getInteractionPath(interaction) {
      const fromObject = this.objects.find(
        (obj) => obj.id === interaction.fromObjectId
      );
      const toObject = this.objects.find(
        (obj) => obj.id === interaction.toObjectId
      );
      if (!fromObject || !toObject) return "";
      const controlPoint = {
        x: (fromObject.x + toObject.x) / 2,
        y: Math.min(fromObject.y, toObject.y) - 50,
      };
      return `M ${fromObject.x} ${fromObject.y} Q ${controlPoint.x} ${controlPoint.y} ${toObject.x} ${toObject.y}`;
    },
    getInteractionMidpoint(interaction) {
      const fromObject = this.objects.find(
        (obj) => obj.id === interaction.fromObjectId
      );
      const toObject = this.objects.find(
        (obj) => obj.id === interaction.toObjectId
      );
      if (!fromObject || !toObject) return { x: 0, y: 0 };
      return {
        x: (fromObject.x + toObject.x) / 2,
        y: (fromObject.y + toObject.y) / 2,
      };
    },
    onCanvasMouseDown(event) {
      // Clear selection when clicking on canvas
      this.objects.forEach((obj) => (obj.selected = false));
      this.selectedObjects = [];
    },
    onInteractionMouseDown(event, interaction) {
      // Start dragging interaction (adjust control point)
      this.dragData = {
        type: "interaction",
        interaction: interaction,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
      };
    },
    onMouseMove(event) {
      if (!this.dragData) return;
      if (this.dragData.type === "object") {
        const object = this.dragData.object;
        object.x = event.offsetX - this.dragData.offsetX;
        object.y = event.offsetY - this.dragData.offsetY;
      } else if (this.dragData.type === "interaction") {
        // Optional: Implement interaction dragging logic here
      }
    },
    onMouseUp() {
      this.dragData = null;
    },
  },
  mounted() {
    const svgCanvas = this.$refs.svgCanvas;
    svgCanvas.addEventListener("mousemove", this.onMouseMove);
    svgCanvas.addEventListener("mouseup", this.onMouseUp);
    svgCanvas.addEventListener("mouseleave", this.onMouseUp);
  },
  beforeUnmount() {
    const svgCanvas = this.$refs.svgCanvas;
    svgCanvas.removeEventListener("mousemove", this.onMouseMove);
    svgCanvas.removeEventListener("mouseup", this.onMouseUp);
    svgCanvas.removeEventListener("mouseleave", this.onMouseUp);
  },
};
</script>

<style scoped>
svg {
  cursor: default;
}
</style> 