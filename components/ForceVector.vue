<template>
    <v-group :config="groupConfig">
        <v-line :config="lineConfig" />
        <v-regular-polygon :config="arrowHeadConfig" />
        <v-circle :config="dragHandleConfig" @dragmove="handleArrowHeadDragMove" />
        <v-text :config="labelConfig" />
        <v-line v-if="showComponents" :config="xComponentConfig" />
        <v-line v-if="showComponents" :config="yComponentConfig" />
    </v-group>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { gridToCanvasCoordinates, canvasToGridCoordinates } from '~/utils/coordinates'
import { useDebounceFn } from '@vueuse/core'

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
        default: true
    },
    isHighlighted: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:head'])

const vectorLength = ref(0)

watch(() => [props.tail, props.head], ([newTail, newHead]) => {
    const dx = newHead.x - newTail.x
    const dy = newHead.y - newTail.y
    vectorLength.value = Math.sqrt(dx * dx + dy * dy)
}, { immediate: true })

const groupConfig = computed(() => {
    const { x, y } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    return { id: props.id, x, y }
})

const lineConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(props.head.x, props.head.y)
    const { x: x1, y: y1 } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    return {
        points: [0, 0, x2 - x1, y2 - y1],
        stroke: props.isHighlighted ? 'red' : 'black',
        strokeWidth: 2
    }
})

const arrowHeadConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(props.head.x, props.head.y)
    const { x: x1, y: y1 } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    const dx = x2 - x1
    const dy = y2 - y1
    const angle = Math.atan2(dy, dx)
    return {
        x: dx,
        y: dy,
        sides: 3,
        radius: 10,
        fill: props.isHighlighted ? 'red' : 'black',
        rotation: angle * 180 / Math.PI + 90
    }
})

const dragHandleConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(props.head.x, props.head.y)
    const { x: x1, y: y1 } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    return {
        x: x2 - x1,
        y: y2 - y1,
        radius: 20,
        fill: 'transparent',
        draggable: props.canDrag
    }
})

const labelConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(props.head.x, props.head.y)
    const { x: x1, y: y1 } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    return {
    }
})

const xComponentConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(props.head.x, props.head.y)
    const { x: x1, y: y1 } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    return {
        points: [0, 0, x2 - x1, y1 - y1],
        stroke: 'blue',
        strokeWidth: 2,
        dash: [5, 5]
    }
})

const yComponentConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(props.head.x, props.head.y)
    const { x: x1, y: y1 } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    return {
        points: [x2 - x1, 0, x2 - x1, y2 - y1],
        stroke: 'red',
        strokeWidth: 2,
        dash: [5, 5]
    }
})

const debouncedEmit = useDebounceFn((newHead) => {
  emit('update:head', newHead)
}, 16) // 60fps

const handleArrowHeadDragMove = (e) => {
    const dragHandle = e.target
    const group = dragHandle.getParent()
    const stage = group.getStage()
    
    const stagePos = stage.getPointerPosition()
    const groupPos = group.absolutePosition()

    // Get the cursor position relative to the stage
    const cursorX = stagePos.x
    const cursorY = stagePos.y

    // Convert cursor position to grid coordinates
    const gridPos = canvasToGridCoordinates(cursorX, cursorY)

    // Calculate new head position directly from cursor position
    const finalHead = {
        x: gridPos.x,
        y: gridPos.y
    }

    // Emit the new head position
    emit('update:head', finalHead)

    // Update the drag handle to match cursor position
    dragHandle.absolutePosition({
        x: cursorX,
        y: cursorY
    })
}
</script>
