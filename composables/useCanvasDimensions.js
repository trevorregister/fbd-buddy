import { provide, inject, ref } from 'vue'

const canvasDimensionsSymbol = Symbol()

export function provideCanvasDimensions(width, height) {
    console.log('Providing canvas dimensions:', width, height)
    const dimensions = ref({ width, height })
    provide(canvasDimensionsSymbol, dimensions)
}

export function useCanvasDimensions() {
    const dimensions = inject(canvasDimensionsSymbol, null)
    if (!dimensions) {
        console.warn('Canvas dimensions not provided yet. Using default values.')
        return ref({ width: 500, height: 500 })
    }
    return dimensions
}