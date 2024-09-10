<template>
    <v-arrow :config="arrowConfig"/>
    <v-circle 
        :x="arrowConfig.points[2]" 
        :y="arrowConfig.points[3]" 
        :radius="10"
        :opacity="0"
        :draggable="true"
        @dragmove="dragCircle"/>
</template>
<script setup>
import { gridToCanvasCoordinates } from '~/utils/coordinates'
const props = defineProps({
    tail: {
        x: {type: Number, required: true},
        y: {type: Number, required: true},
    },
    head: {
        x: {type: Number, required: true},
        y: {type: Number, required: true},
    },
})

const dragCircle = (event) => {
    const stage = event.target.getStage()
    const pointerPosition = stage.getPointerPosition()
    arrowConfig.value.points[2] = pointerPosition.x
    arrowConfig.value.points[3] = pointerPosition.y
}

const arrowConfig = computed(() => {
    const tailPoint = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    const headPoint = gridToCanvasCoordinates(props.head.x, props.head.y)
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

const magnitude = computed(() => {
    const dx = arrowConfig.value.points[2] - arrowConfig.value.points[0]
    const dy = arrowConfig.value.points[3] - arrowConfig.value.points[1]
    return Math.sqrt(dx * dx + dy * dy)
})
</script>