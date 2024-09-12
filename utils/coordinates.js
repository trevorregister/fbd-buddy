import { useCanvasDimensions } from '~/composables/useCanvasDimensions'

export function gridToCanvasCoordinates(x, y) {
    console.log('gridToCanvasCoordinates called with:', x, y)
    try {
        const dimensions = useCanvasDimensions()
        console.log('Canvas dimensions in gridToCanvasCoordinates:', dimensions.value)
        const { width, height } = dimensions.value
        const centerX = Math.floor(width / 2)
        const centerY = Math.floor(height / 2)
        return {
            x: centerX + x,
            y: centerY - y  // Subtract y because canvas Y increases downwards
        }
    } catch (error) {
        console.error('Error in gridToCanvasCoordinates:', error)
        return { x: 0, y: 0 }  // Return a default value
    }
}