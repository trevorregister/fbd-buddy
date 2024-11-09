import { defineStore } from 'pinia';

export const useForceVectorsStore = defineStore('forceVectors', {
      state: () => ({
            vectors: [],
            highlightedVectorId: null,
      }),
      actions: {
            addVector(newVector) {
                  console.log('Adding vector to store:', newVector)
                  this.vectors = [...this.vectors, newVector]
            },
            deleteVector(id) {
                  this.vectors = this.vectors.filter(v => v.id !== id)
            },
            updateVector(updatedVector) {
                  const index = this.vectors.findIndex(v => v.id === updatedVector.id)
                  if (index !== -1) {
                        this.vectors = [
                              ...this.vectors.slice(0, index),
                              updatedVector,
                              ...this.vectors.slice(index + 1)
                        ]
                  }
            },
            updateVectorHead(id, newHead) {
                  const index = this.vectors.findIndex(v => v.id === id)
                  if (index !== -1) {
                        this.vectors = [
                              ...this.vectors.slice(0, index),
                              {
                                    ...this.vectors[index],
                                    head: newHead,
                              },
                              ...this.vectors.slice(index + 1)
                        ]
                  }
            },
            clearVectors() {
                  this.vectors = []
            },
            setHighlightedVector(id) {
                  this.highlightedVectorId = id
            },
            clearHighlightedVector() {
                  this.highlightedVectorId = null
            },
      },
});