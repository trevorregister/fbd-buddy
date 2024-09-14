import { useCanvasDimensions } from '~/composables/useCanvasDimensions'

export function gridToCanvasCoordinates(x, y) {
    const { width, height } = useCanvasDimensions().value
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)
    return {
        x: centerX + x,
        y: centerY - y  // Subtract y because canvas Y increases downwards
    }
}

export function canvasToGridCoordinates(x, y) {
    const { width, height } = useCanvasDimensions().value
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)
    return {
        x: x - centerX,
        y: centerY - y  // Invert y because grid Y increases upwards
    }
}
