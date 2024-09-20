<template>
    <v-arrow :config="arrowConfig"/>
    <v-circle 
        :config="circleConfig"
        @dragmove="dragCircle"
        @dragend="dragEnd"
        />
    <div v-if="props.showComponents && hasNoZeroComponents">
        <v-arrow :config="xComponentConfig"/>
        <v-arrow :config="yComponentConfig"/>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useCanvasDimensions } from '~/composables/useCanvasDimensions'
import { gridToCanvasCoordinates, canvasToGridCoordinates } from '~/utils/coordinates';

const { width, height } = useCanvasDimensions()
const props = defineProps({
    tail: {
        type: Object,
        required: true
    },
    head: {
        type: Object,
        required: true
    },
    showComponents: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true
    },
    canDrag: {
        type: Boolean,
        required: true
    },
    isHighlighted: {
        type: Boolean,
        default: false
    }
})

const SNAP_TOLERANCE = 25
const tail = ref(props.tail)
const head = ref(props.head)

// Watch for changes in props and update refs
watch(() => props.tail, (newTail) => {
    tail.value = newTail
})

watch(() => props.head, (newHead) => {
    head.value = newHead
})

const magnitude = computed(() => {
    const dx = head.value.x - tail.value.x
    const dy = head.value.y - tail.value.y
    return Math.sqrt(dx * dx + dy * dy)
})


// Watch for changes in initialTail and initialHead
watch(() => props.initialTail, (newTail) => {
    tail.value = { ...newTail }
}, { deep: true })

watch(() => props.initialHead, (newHead) => {
    head.value = { ...newHead }
}, { deep: true })

const dragCircle = (event) => {
    if(props.canDrag === false){
        return
    }

    const stage = event.target.getStage()
    const pointerPosition = stage.getPointerPosition()

    // Convert canvas coordinates to grid coordinates
    let gridCoords = canvasToGridCoordinates(pointerPosition.x, pointerPosition.y)

    // Snap to grid if within tolerance
    const snappedX = Math.round(gridCoords.x / 50) * 50
    const snappedY = Math.round(gridCoords.y / 50) * 50

    if (Math.abs(gridCoords.x - snappedX) <= SNAP_TOLERANCE) {
        gridCoords.x = snappedX
    }
    if (Math.abs(gridCoords.y - snappedY) <= SNAP_TOLERANCE) {
        gridCoords.y = snappedY
    }

    // Update head position
    head.value.x = gridCoords.x
    head.value.y = gridCoords.y

    // Update circle position
    const canvasCoords = gridToCanvasCoordinates(gridCoords.x, gridCoords.y, )
    event.target.position({
        x: canvasCoords.x,
        y: canvasCoords.y
    })
}

const arrowColor = computed(() => props.isHighlighted ? 'yellow' : 'black')

const arrowConfig = computed(() => {
    const tailCanvasPoint = gridToCanvasCoordinates(tail.value.x, tail.value.y)
    const headCanvasPoint = gridToCanvasCoordinates(head.value.x, head.value.y)

    return {
        fill: arrowColor.value,
        stroke: arrowColor.value,
        strokeWidth: 2,
        points: [
            tailCanvasPoint.x,
            tailCanvasPoint.y,
            headCanvasPoint.x,
            headCanvasPoint.y
        ],
    }
})

const xComponentConfig = computed(() => {
    const tailCanvasPoint = gridToCanvasCoordinates(tail.value.x, tail.value.y)
    const headCanvasPoint = gridToCanvasCoordinates(head.value.x, tail.value.y)
    
    return {
        fill: arrowColor.value,
        stroke: arrowColor.value,
        strokeWidth: 1,
        dash: [5, 5],
        points: [
            tailCanvasPoint.x,
            tailCanvasPoint.y,
            headCanvasPoint.x,
            tailCanvasPoint.y
        ],
    }
})

const yComponentConfig = computed(() => {
    const tailCanvasPoint = gridToCanvasCoordinates(head.value.x, tail.value.y)
    const headCanvasPoint = gridToCanvasCoordinates(head.value.x, head.value.y)
    
    return {
        fill: arrowColor.value,
        stroke: arrowColor.value,
        strokeWidth: 1,
        dash: [5, 5],
        points: [
            tailCanvasPoint.x,
            tailCanvasPoint.y,
            headCanvasPoint.x,
            headCanvasPoint.y
        ],
    }
})

const hasNoZeroComponents = computed(()=>{
    const isXComponentZero = Math.abs(props.head.y - props.tail.y) > 0
    const isYComponentZero = Math.abs(props.head.x - props.tail.x) > 0
    return isXComponentZero && isYComponentZero
})

//necessary for ensuring the draggable circle snaps back to the vector head
const dragEnd = (event) => {
    const headCanvasPoint = gridToCanvasCoordinates(head.value.x, head.value.y)
    
    // Get the Konva.Circle instance
    const circle = event.target

    // Check if it's a Konva.Circle and has the x() and y() methods
    if (circle && typeof circle.x === 'function' && typeof circle.y === 'function') {
        circle.x(headCanvasPoint.x)
        circle.y(headCanvasPoint.y)
        
        // If using Konva v8+, you might need to call this to update the position
        circle.getLayer()?.batchDraw()
    } else {
        console.error('Invalid target for dragEnd event', circle)
    }
}

const circleConfig = computed(() => {
    const headCanvasPoint = gridToCanvasCoordinates(head.value.x, head.value.y)
    return {
        x: headCanvasPoint.x,
        y: headCanvasPoint.y,
        radius: 15,
        opacity: 0,
        fill: 'black',
        draggable: true
    }
})
</script>