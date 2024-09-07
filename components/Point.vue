<template>
    <v-circle :config="config"/>
</template>

<script setup>
const props = defineProps({
    config: {
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    radius: {
        type: Number,
        default: 5,
    },
    fill: {
        type: String,
        default: 'lightgrey',
    },
    }
})

const config = computed(() => {
    return {
        x: props.config.x,
        y: props.config.y,
        radius: props.config.radius ?? 5,
        fill: props.config.fill ?? 'lightgrey',
    }
})

onMounted(() => {
    console.log(`POINT CREATED ${props.config.radius} ${props.config.fill}`)
})
</script>