<template>
    <v-arrow :config="arrowConfig"/>
    <v-circle 
        :x="arrowConfig.points[2]" 
        :y="arrowConfig.points[3]" 
        :radius="15"
        :opacity="0"
        :fill="'black'"
        :draggable="true"
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
const SNAP_TOLERANCE = 25

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
    }
})

const emit = defineEmits(['dragEnd'])


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
    const stage = event.target.getStage()
    const pointerPosition = stage.getPointerPosition() // canvas coords
    
    // Round to nearest 50
    const snappedX = Math.round(pointerPosition.x / 50) * 50
    const snappedY = Math.round(pointerPosition.y / 50) * 50
    
    const shouldSnapX = Math.abs(pointerPosition.x - snappedX) <= SNAP_TOLERANCE
    const shouldSnapY = Math.abs(pointerPosition.y - snappedY) <= SNAP_TOLERANCE
    
    const gridCoords = canvasToGridCoordinates(
        shouldSnapX ? snappedX : pointerPosition.x,
        shouldSnapY ? snappedY : pointerPosition.y,
    )
    
    head.value.x = Math.round(gridCoords.x)
    head.value.y = Math.round(gridCoords.y)
    
    console.log('Pointer:', pointerPosition, 'Grid:', gridCoords, 'Head:', head.value)
}

const arrowConfig = computed(() => {
    const tailCanvasPoint = gridToCanvasCoordinates(tail.value.x, tail.value.y)
    const headCanvasPoint = gridToCanvasCoordinates(head.value.x, head.value.y)

    return {
        fill: 'black',
        stroke: 'black',
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
        fill: 'blue',
        stroke: 'blue',
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
        fill: 'blue',
        stroke: 'blue',
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
const dragEnd = () => {
    const vector = {
        tail: {
            x: arrowConfig.value.points[0],
            y: arrowConfig.value.points[1],
        },
        head: {
            x: arrowConfig.value.points[2],
            y: arrowConfig.value.points[3],
        },
        id: props.id
    }
    emit('dragEnd', vector)
}


</script>