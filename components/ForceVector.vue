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
    <v-arrow v-if="props.showComponents" :config="xComponentConfig"/>
    <v-arrow v-if="props.showComponents" :config="yComponentConfig"/>
</template>

<script setup>
import { computed } from 'vue'
import { gridToCanvasCoordinates } from '~/utils/coordinates'

const emit = defineEmits(['dragEnd'])
const magnitude = ref(0)
const props = defineProps({
    tail: {
        x: {type: Number, required: true},
        y: {type: Number, required: true},
    },
    head: {
        x: {type: Number, required: true},
        y: {type: Number, required: true},
    },
    showComponents: {type: Boolean, default: false},
    id: {
        type: String,
        required: true
    },
})

const dragCircle = (event) => {
    const stage = event.target.getStage()
    const pointerPosition = stage.getPointerPosition()
    const snapTolerance = 15
    
    if(pointerPosition.x % 50 <= snapTolerance || pointerPosition.y % 50 <= snapTolerance) {
        arrowConfig.value.points[2] = Math.round(pointerPosition.x / 50) * 50
        arrowConfig.value.points[3] = Math.round(pointerPosition.y / 50) * 50
        magnitude.value = calculateMagnitude(
            arrowConfig.value.points[2] - arrowConfig.value.points[0], 
            arrowConfig.value.points[3] - arrowConfig.value.points[1]
        )
        
    }
}

const arrowConfig = computed(() => {
    //convert to use gridToCoordinate function when fixed
    const tailPoint = {
        x: props.tail.x,
        y: props.tail.y
    }
    const headPoint = {
        x: props.head.x,
        y: props.head.y
    }
    return {
    fill: 'black',
    stroke: 'black',
    strokeWidth: 2,
    points: [
        tailPoint.x, 
        tailPoint.y, 
        headPoint.x, 
        headPoint.y
    ],
}
})

const xComponentConfig = computed(() => {
    //implementation using commented section below can be used once gridToCoordinate issues are resolved
    const tailPoint = {
        x: props.tail.x,
        y: props.tail.y
    }
    const headPoint = {
        x: props.head.x,
        y: props.head.y
    }
    return {
        fill: 'blue',
        stroke: 'blue',
        strokeWidth: 1,
        dash: [5, 5],
        points: [
            tailPoint.x,
            tailPoint.y,
            headPoint.x,
            tailPoint.y
        ],
    }
/*     const tailPoint = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    const headPoint = gridToCanvasCoordinates(props.head.x, props.tail.y)
    return {
        fill: 'blue',
        stroke: 'blue',
        strokeWidth: 1,
        dash: [5, 5],
        points: [
            tailPoint.x,
            tailPoint.y,
            headPoint.x,
            headPoint.y
        ],
    } */
})

const yComponentConfig = computed(() => {
    //implementation using commented section below can be used once gridToCoordinate issues are resolved
    const tailPoint = {
        x: props.tail.x,
        y: props.tail.y
    }
    const headPoint = {
        x: props.head.x,
        y: props.head.y
    }
    return {
        fill: 'green',
        stroke: 'green',
        strokeWidth: 1,
        dash: [5, 5],
        points: [
            headPoint.x,
            tailPoint.y,
            headPoint.x,
            headPoint.y
        ],
    }
/*     const tailPoint = gridToCanvasCoordinates(props.head.x, props.tail.y)
    const headPoint = gridToCanvasCoordinates(props.head.x, props.head.y)
    return {
        fill: 'green',
        stroke: 'green',
        strokeWidth: 1,
        dash: [5, 5],
        points: [
            tailPoint.x,
            tailPoint.y,
            headPoint.x,
            headPoint.y
        ],
    } */
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
const calculateMagnitude = (x, y) => {
    return Math.sqrt(x * x + y * y)
}

onMounted(() => {
    magnitude.value = calculateMagnitude(
        arrowConfig.value.points[2] - arrowConfig.value.points[0], 
        arrowConfig.value.points[3] - arrowConfig.value.points[1]
    )
})
</script>