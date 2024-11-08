<template>
    <v-group :config="groupConfig">
        <v-line :config="lineConfig" />
        <v-regular-polygon :config="arrowHeadConfig" />
        <v-circle :config="dragHandleConfig" @dragmove="handleArrowHeadDragMove" />
        <v-label v-if="props.label" :config="labelGroupConfig">
            <v-tag :config="labelTagConfig" />
            <v-text :config="mainTextConfig" />
            <v-text :config="subscriptConfig" />
        </v-label>
        <v-line v-if="showComponents" :config="xComponentConfig" />
        <v-line v-if="showComponents" :config="yComponentConfig" />
    </v-group>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { gridToCanvasCoordinates, canvasToGridCoordinates } from '~/utils/coordinates'
import { useDebounceFn } from '@vueuse/core'
import katex from 'katex'
import 'katex/dist/katex.min.css'

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
    },
    label: {
        type: String,
        default: 'No Label'
    }
})

const emit = defineEmits(['update:head'])

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

const labelGroupConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(props.head.x, props.head.y)
    const { x: x1, y: y1 } = gridToCanvasCoordinates(props.tail.x, props.tail.y)
    const dx = x2 - x1
    const dy = y2 - y1
    
    return {
        x: dx / 2,
        y: dy / 2 - 30,
    }
})

const labelTagConfig = computed(() => ({
    fill: props.label ? 'white' : 'transparent',
    cornerRadius: 4,
    pointerDirection: 'none',
    pointerWidth: 0,
    pointerHeight: 0,
    lineJoin: 'round'
}))

const parsedLabel = computed(() => {
    const cleanLabel = props.label.replace(/[{}]/g, '')
    const parts = cleanLabel.split('_')
    return {
        main: parts[0] || '',
        subscript: parts[1] || ''
    }
})

const mainTextConfig = computed(() => ({
    text: parsedLabel.value.main,
    fontSize: 20,
    fontFamily: 'KaTeX_Math, Arial',
    fill: 'black',
    padding: 5,
    align: 'center'
}))

const subscriptConfig = computed(() => ({
    text: parsedLabel.value.subscript,
    fontSize: 16,
    fontFamily: 'KaTeX_Math, Arial',
    fill: 'black',
    padding: 5,
    align: 'center',
    x: 12,
    y: 6
}))

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

const handleArrowHeadDragMove = (e) => {
    const dragHandle = e.target
    const group = dragHandle.getParent()
    const stage = group.getStage()
    
    const stagePos = stage.getPointerPosition()
    const groupPos = group.absolutePosition()

    const cursorX = stagePos.x
    const cursorY = stagePos.y

    const gridPos = canvasToGridCoordinates(cursorX, cursorY)

    const finalHead = {
        x: gridPos.x,
        y: gridPos.y
    }

    emit('update:head', finalHead)

    dragHandle.absolutePosition({
        x: cursorX,
        y: cursorY
    })
}

const renderKatex = (text) => {
  try {
    return katex.renderToString(text, {
      throwOnError: false,
      displayMode: true
    });
  } catch (e) {
    console.error('KaTeX error:', e);
    return text;
  }
}
</script>

<style>
.math-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border: 2px solid red;
    border-radius: 4px;
    font-size: 14px;
}

.katex {
    font-size: 1em !important;
}

.katex-html {
    white-space: nowrap !important;
}

@font-face {
    font-family: 'KaTeX_Math';
    src: url('node_modules/katex/dist/fonts/KaTeX_Math-Italic.woff2') format('woff2');
    font-style: italic;
    font-weight: normal;
}
</style>

