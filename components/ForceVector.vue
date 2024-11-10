<template>
    <v-group :config="groupConfig">
        <v-line :config="lineConfig" />
        <v-regular-polygon :config="arrowHeadConfig" />
        <v-circle :config="dragHandleConfig" @dragmove="handleArrowHeadDragMove" />
        <v-label 
            v-if="!props.hideLabels && (props.name || props.label)" 
            :config="labelGroupConfig"
        >
            <v-tag :config="labelTagConfig" />
            <v-text :config="mainTextConfig" />
            <v-text v-if="parsedLabel.subscript" :config="subscriptConfig" />
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
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    offset: {
        type: Object,
        default: () => ({ x: 0, y: 0, isParallel: false })
    },
    hideLabels: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:head'])

const groupConfig = computed(() => {
    const { x, y } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    return { id: props.id, x, y }
})

const lineConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    return {
        points: [0, 0, x2 - x1, y2 - y1],
        stroke: props.isHighlighted ? 'green' : 'black',
        strokeWidth: 2
    }
})

const arrowHeadConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    const dx = x2 - x1
    const dy = y2 - y1
    const angle = Math.atan2(dy, dx)
    return {
        x: dx,
        y: dy,
        sides: 3,
        radius: props.offset.isParallel ? 6 : 10,
        fill: props.isHighlighted ? 'green' : 'black',
        rotation: angle * 180 / Math.PI + 90
    }
})

const dragHandleConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    return {
        x: x2 - x1,
        y: y2 - y1,
        radius: 20,
        fill: 'transparent',
        draggable: props.canDrag
    }
})

const labelGroupConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    const dx = x2 - x1
    const dy = y2 - y1
    
    // Calculate base position at midpoint
    const baseLabelPos = {
        x: dx / 2,
        y: dy / 2 - 30,
    }

    // If this is a parallel vector, offset the label along the vector direction
    if (props.offset.isParallel) {
        const vectorLength = Math.sqrt(dx * dx + dy * dy)
        const normalizedDx = dx / vectorLength
        const normalizedDy = dy / vectorLength
        const labelOffset = 30 // Adjust this value to control label spacing

        // Use the relative index to determine label offset direction
        const offsetDirection = props.offset.relativeIndex || 0
        
        baseLabelPos.x += normalizedDx * labelOffset * offsetDirection
        baseLabelPos.y += normalizedDy * labelOffset * offsetDirection
    }
    
    return baseLabelPos
})

const labelTagConfig = computed(() => ({
    fill: (props.name || props.label) ? 'white' : 'transparent',
    cornerRadius: 4,
    pointerDirection: 'none',
    pointerWidth: 0,
    pointerHeight: 0,
    lineJoin: 'round'
}))

const parsedLabel = computed(() => {
    const textToUse = props.name || props.label || ''
    if (!textToUse) return { main: '', subscript: '' }
    const cleanLabel = textToUse.replace(/[{}]/g, '')
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
    fill: props.isHighlighted ? 'green' : 'black',
    padding: 5,
    align: 'center'
}))

const subscriptConfig = computed(() => ({
    text: parsedLabel.value.subscript,
    fontSize: 16,
    fontFamily: 'KaTeX_Math, Arial',
    fill: props.isHighlighted ? 'green' : 'black',
    padding: 5,
    align: 'center',
    x: 12,
    y: 6
}))

const xComponentConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    return {
        points: [0, 0, x2 - x1, 0],
        stroke: 'blue',
        strokeWidth: 2,
        dash: [5, 5]
    }
})

const yComponentConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
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

    // Subtract the offset when emitting the new head position
    const finalHead = {
        x: gridPos.x - props.offset.x,
        y: gridPos.y - props.offset.y
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

