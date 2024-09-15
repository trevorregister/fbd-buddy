import { provide, inject, ref } from 'vue'

const canvasDimensionsSymbol = Symbol()

export function provideCanvasDimensions(width, height) {
    const dimensions = ref({ width, height })
    provide(canvasDimensionsSymbol, dimensions)
}

export function useCanvasDimensions() {
    const dimensions = inject(canvasDimensionsSymbol)
    if (!dimensions) {
        console.warn('Canvas dimensions not provided, using default values')
        return ref({ width: 500, height: 500 })
    }
    return dimensions
}