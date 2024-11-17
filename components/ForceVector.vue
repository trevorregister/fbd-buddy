<template>
    <v-group :config="groupConfig">
        <v-line :config="lineConfig" />
        <v-regular-polygon :config="arrowHeadConfig" />
        <v-circle :config="dragHandleConfig" @dragmove="handleArrowHeadDragMove" @dragstart="handleDragStart" @dragend="handleDragEnd" />
        
        <!-- Component lines (visible when showComponents is true OR vector is being dragged) -->
        <template v-if="showComponents || isDragging">
            <template v-if="coordinateSystem === 'cartesian'">
                <v-line :config="xComponentConfig" />
                <v-line :config="yComponentConfig" />
            </template>
        </template>

        <!-- Component measurements (visible when showComponents is true OR vector is being dragged) -->
        <template v-if="(showComponents && isHighlighted) || isDragging">
            <template v-if="coordinateSystem === 'cartesian'">
                <v-text :config="xMeasurementConfig" />
                <v-text :config="yMeasurementConfig" />
            </template>
            <template v-else>
                <v-text :config="magnitudeMeasurementConfig" />
                <v-arc :config="angleArcConfig" />
                <v-text :config="angleMeasurementConfig" />
            </template>
        </template>

        <!-- Vector label -->
        <v-label 
            v-if="shouldShowLabel" 
            :config="labelGroupConfig"
        >
            <v-tag :config="labelTagConfig" />
            <v-text :config="mainTextConfig" />
            <v-text :config="subscriptConfig" />
        </v-label>
    </v-group>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { gridToCanvasCoordinates, canvasToGridCoordinates } from '~/utils/coordinates'
import { useDebounceFn } from '@vueuse/core'

const GRID_SCALE = 15

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
    },
    coordinateSystem: {
        type: String,
        default: 'cartesian'
    },
    isDragging: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:head', 'dragStart', 'dragEnd'])

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
    if (!textToUse) return { main: 'F', subscript: '' }

    // Remove LaTeX notation but keep the structure
    const cleanText = textToUse
        .replace('\\vec{', '')
        .replace('\\text{', '')
        .replace(/[{}\\]/g, '')

    // Split into main and subscript parts
    const parts = cleanText.split('_')
    return {
        main: parts[0] || 'F',
        subscript: parts[1] || ''
    }
})

const mainTextConfig = computed(() => ({
    text: parsedLabel.value.main,
    fontSize: 20,
    fontFamily: 'KaTeX_Math, Arial',
    fill: props.isHighlighted ? 'green' : 'black',
    padding: 5,
    align: 'center',
    fontStyle: 'italic'
}))

const subscriptConfig = computed(() => ({
    text: parsedLabel.value.subscript,
    fontSize: 14,
    fontFamily: 'KaTeX_Math, Arial',
    fill: props.isHighlighted ? 'green' : 'black',
    padding: 5,
    align: 'left',
    x: 15,
    y: 8
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

const xMeasurementConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    return {
        x: (x2 - x1) / 2,
        y: -20,
        text: `${(props.head.x - props.tail.x).toFixed(1)} N`,
        fill: 'blue',
        align: 'center'
    }
})

const yMeasurementConfig = computed(() => {
    const { x: x2, y: y2 } = gridToCanvasCoordinates(
        props.head.x + props.offset.x,
        props.head.y + props.offset.y
    )
    const { x: x1, y: y1 } = gridToCanvasCoordinates(
        props.tail.x + props.offset.x,
        props.tail.y + props.offset.y
    )
    return {
        x: x2 - x1 + 10,
        y: (y2 - y1) / 2,
        text: `${(props.head.y - props.tail.y).toFixed(1)} N`,
        fill: 'red',
        align: 'left'
    }
})

const magnitudeMeasurementConfig = computed(() => {
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
    const magnitude = Math.sqrt(
        Math.pow(props.head.x - props.tail.x, 2) + 
        Math.pow(props.head.y - props.tail.y, 2)
    )
    const angle = Math.atan2(dy, dx)
    
    // Position magnitude label further along the vector
    return {
        x: dx / 2,
        y: dy / 2 - 40,
        text: `${magnitude.toFixed(1)} N`,
        fill: 'green',
        align: 'center'
    }
})

const angleArcConfig = computed(() => {
    const dx = props.head.x - props.tail.x
    const dy = props.head.y - props.tail.y
    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    let clockwise = angle >0
    if (clockwise) {
        angle = 360 - Math.abs(angle)
    }
    return {
        x: 0,
        y: 0,
        innerRadius: 5,
        outerRadius: 30,
        opacity: 0.5,
        angle: Math.abs(angle),  // Use positive angle magnitude
        rotation: 0,
        fill: 'green',
        stroke: 'green',
        strokeWidth: 1,
       clockwise  // Draw clockwise for all arcs
    }
})

const angleMeasurementConfig = computed(() => {
    const dx = props.head.x - props.tail.x
    const dy = props.head.y - props.tail.y
    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    
    // Normalize angle to [-180, 180]
    while (angle > 180) angle -= 360
    while (angle <= -180) angle += 360
    
    const arcRadius = 20
    const midAngle = angle / 2
    
    return {
        x: arcRadius * Math.cos(midAngle * Math.PI / 180),
        y: arcRadius * Math.sin(midAngle * Math.PI / 180),
        text: `${angle.toFixed(1)}°`,
        fill: 'green',
        align: 'center'
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

const handleDragStart = () => {
    emit('dragStart')
}

const handleDragEnd = () => {
    emit('dragEnd')
}

const shouldShowLabel = computed(() => !props.hideLabels && (props.name || props.label))
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

