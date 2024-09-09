<template>
    <v-arrow :config="arrowConfig"/>
</template>
<script setup>
import { gridToCanvasCoordinates } from '~/utils/coordinates'
import Point from './Point.vue'
const props = defineProps({
    tail: {
        type: Point,
        required: true,
    },
    head: {
        type: Point,
        required: true,
    },
})

const arrowConfig = computed(() => {
    const tailPoint = gridToCanvasCoordinates(props.tail.x, props.tail.y, props.canvasWidth, props.canvasHeight)
    const headPoint = gridToCanvasCoordinates(props.head.x, props.head.y, props.canvasWidth, props.canvasHeight)
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
    const dx = props.head.x - props.tail.x
    const dy = props.head.y - props.tail.y
    return Math.sqrt(dx * dx + dy * dy)
})
</script>