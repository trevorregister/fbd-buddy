import { provide, inject, ref } from 'vue'

const canvasDimensionsSymbol = Symbol()

export function provideCanvasDimensions(width, height) {
    const dimensions = ref({ width, height })
    provide(canvasDimensionsSymbol, dimensions)
}

export function useCanvasDimensions() {
    const dimensions = inject(canvasDimensionsSymbol)
    if (!dimensions) {
        throw new Error('Canvas dimensions not provided')
    }
    return dimensions
}