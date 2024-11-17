import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInteractionDiagramStore = defineStore('interactionDiagram', {
      state: () => ({
            objects: [],
            interactions: [],
            selectedObjects: [],
            interactionTypes: [
                  { text: 'Gravitational', value: '\\vec{F}_{g}' },
                  { text: 'Electrostatic', value: '\\vec{F}_{e}' },
                  { text: 'Magnetic', value: '\\vec{F}_{m}' },
                  { text: 'Normal', value: '\\vec{F}_{N}' },
                  { text: 'Frictional', value: '\\vec{f}' }
            ]
      }),

      actions: {
            addObject(x, y, label = "Object") {
                  try {
                        const newObject = {
                              id: Date.now(),
                              x,
                              y,
                              label: label,
                              selected: false,
                              isEditing: false,
                        }
                        this.objects.push({ ...newObject })
                  } catch (error) {
                        // Keep error handling without console.error
                  }
            },

            updateObjectPosition(id, x, y) {
                  const object = this.objects.find(obj => obj.id === id)
                  if (object) {
                        object.x = x
                        object.y = y
                  }
            },

            updateObjectLabel(id, label) {
                  const object = this.objects.find(obj => obj.id === id)
                  if (object) {
                        object.label = label
                  }
            },

            toggleObjectSelection(id) {
                  const object = this.objects.find(obj => obj.id === id)
                  if (object) {
                        object.selected = !object.selected
                        if (object.selected) {
                              this.selectedObjects.push(object)
                        } else {
                              this.selectedObjects = this.selectedObjects.filter(obj => obj.id !== id)
                        }
                  }
            },

            setObjectEditing(id, isEditing) {
                  this.objects.forEach(obj => obj.isEditing = false)
                  const object = this.objects.find(obj => obj.id === id)
                  if (object) {
                        object.isEditing = isEditing
                  }
            },

            clearSelection() {
                  this.objects.forEach(obj => obj.selected = false)
                  this.selectedObjects = []
            },

            addInteraction(label, fromObjectId, toObjectId) {
                  let obj1Id = fromObjectId
                  let obj2Id = toObjectId

                  if (!obj1Id || !obj2Id) {
                        if (this.selectedObjects.length !== 2) return
                        [obj1Id, obj2Id] = this.selectedObjects.map(obj => obj.id)
                  }

                  const fromObject = this.objects.find(obj => obj.id === obj1Id)
                  const toObject = this.objects.find(obj => obj.id === obj2Id)

                  const forceBase = label.split('_')[0]
                  const forceType = label.split('_')[1]?.replace('}', '')

                  const newLabel = `${forceBase}_{${forceType}\\text{(${toObject.label})}}`

                  const existingInteractions = this.getInteractionsBetween(obj1Id, obj2Id)
                  const hasExactInteraction = existingInteractions.some(i => i.label === newLabel)

                  if (!hasExactInteraction) {
                        const existingCount = this.getInteractionCount(obj1Id, obj2Id)
                        const newInteraction = {
                              id: Date.now(),
                              fromObjectId: obj1Id,
                              toObjectId: obj2Id,
                              label: newLabel,
                              arcHeight: 50 + (existingCount * 30)
                        }
                        this.interactions.push(newInteraction)
                  }

                  this.clearSelection()
            },

            deleteObject(id) {
                  this.objects = this.objects.filter(obj => obj.id !== id)
                  this.selectedObjects = this.selectedObjects.filter(obj => obj.id !== id)
            },

            deleteInteractionsForObject(objectId) {
                  this.interactions = this.interactions.filter(interaction =>
                        interaction.fromObjectId !== objectId &&
                        interaction.toObjectId !== objectId
                  )
            },

            getInteractionsBetween(obj1Id, obj2Id) {
                  return this.interactions.filter(interaction =>
                        (interaction.fromObjectId === obj1Id && interaction.toObjectId === obj2Id) ||
                        (interaction.fromObjectId === obj2Id && interaction.toObjectId === obj1Id)
                  )
            },

            getInteractionCount(obj1Id, obj2Id) {
                  return this.getInteractionsBetween(obj1Id, obj2Id).length
            }
      }
}) 