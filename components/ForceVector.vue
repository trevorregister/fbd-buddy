<template>
    <v-arrow :config="arrowConfig"/>
    <v-circle 
        :x="arrowConfig.points[2]" 
        :y="arrowConfig.points[3]" 
        :radius="8"
        :fill="'red'"
        :draggable="true"/>
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

const arrowConfig = computed(() => {
/*     const tailPoint = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    const headPoint = gridToCanvasCoordinates(props.head.x, props.head.y) */
    const tailPoint = {x: props.tail.x, y: props.tail.y}
    const headPoint = {x: props.head.x, y: props.head.y}
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