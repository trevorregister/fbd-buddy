<template>
    <v-group>
        <v-arrow :config="arrowConfig"/>
        <v-circle 
            :x="arrowConfig.points[2]" 
            :y="arrowConfig.points[3]" 
            :radius="8"
            :fill="'red'"
            :draggable="true"/>
        <v-arrow v-if="props.showComponents" :config="xComponentConfig"/>
        <v-arrow v-if="props.showComponents" :config="yComponentConfig"/>
    </v-group>
</template>

<script setup>
import { computed } from 'vue'
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
    showComponents: {type: Boolean, default: false},
})

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

const xComponentConfig = computed(() => {
    const tailPoint = gridToCanvasCoordinates(props.tail.x, props.tail.y)
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
    }
})

const yComponentConfig = computed(() => {
    const tailPoint = gridToCanvasCoordinates(props.head.x, props.tail.y)
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
    }
})

const magnitude = computed(() => {
    const dx = props.head.x - props.tail.x
    const dy = props.head.y - props.tail.y
    return Math.sqrt(dx * dx + dy * dy)
})
</script>