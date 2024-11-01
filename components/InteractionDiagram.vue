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
      <v-btn @click="addObject" class="mr-4">+ Object</v-btn>
      <v-btn @click="showInteractionDialog = true" :disabled="selectedObjects.length !== 2">
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
            :items="interactionTypes"
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
      showInteractionDialog: false,
      selectedInteractionType: null,
      interactionTypes: [
        { text: 'Gravitational', value: 'Gravitational' },
        { text: 'Electrostatic', value: 'Electrostatic' },
        { text: 'Magnetic', value: 'Magnetic' },
        { text: 'Normal', value: 'Normal' },
        { text: 'Frictional', value: 'Frictional' }
      ]
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
    createInteraction() {
      const [obj1, obj2] = this.selectedObjects;
      const newInteraction = {
        id: Date.now(),
        fromObjectId: obj1.id,
        toObjectId: obj2.id,
        label: this.selectedInteractionType,
      };
      this.interactions.push(newInteraction);
      // Reset selection
      this.objects.forEach((obj) => (obj.selected = false));
      this.selectedObjects = [];
      // Close dialog and reset selection
      this.showInteractionDialog = false;
      this.selectedInteractionType = null;
    },
    getInteractionPath(interaction) {
    const fromObject = this.objects.find(
      (obj) => obj.id === interaction.fromObjectId
    );
    const toObject = this.objects.find(
      (obj) => obj.id === interaction.toObjectId
    );
    if (!fromObject || !toObject) return "";

    const fromPoint = this.getEllipseEdgePoint(fromObject, toObject);
    const toPoint = this.getEllipseEdgePoint(toObject, fromObject);

    const controlPoint = {
      x: (fromPoint.x + toPoint.x) / 2,
      y: Math.min(fromPoint.y, toPoint.y) - 50,
    };
    return `M ${fromPoint.x} ${fromPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${toPoint.x} ${toPoint.y}`;
  },

  getEllipseEdgePoint(fromObject, toObject) {
    const dx = toObject.x - fromObject.x;
    const dy = toObject.y - fromObject.y;
    const angle = Math.atan2(dy, dx);

    const rx = this.objectWidth / 2;
    const ry = this.objectHeight / 2;

    const edgeX = fromObject.x + rx * Math.cos(angle);
    const edgeY = fromObject.y + ry * Math.sin(angle);

    return { x: edgeX, y: edgeY };
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