<template>
    <v-arrow :config="config"/>
</template>
<script setup>
import Point from './Point.vue'
const props = defineProps({
    startPoint: {
        type: Point,
        required: true,
    },
    endPoint: {
        type: Point,
        required: true,
    },
})

const config = {
    fill: 'black',
    stroke: 'black',
    strokeWidth: 2,
    points: [
        props.startPoint.x, 
        props.startPoint.y, 
        props.endPoint.x, 
        props.endPoint.y
    ],
}

const magnitude = computed(() => {
    const dx = props.endPoint.x - props.startPoint.x
    const dy = props.endPoint.y - props.startPoint.y
    return Math.sqrt(dx * dx + dy * dy)
})
</script>