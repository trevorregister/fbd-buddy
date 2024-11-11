import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInteractionDiagramStore = defineStore('interactionDiagram', {
      state: () => ({
            objects: [],
            interactions: [],
            selectedObjects: [],
            interactionTypes: [
                  { text: 'Gravitational', value: '\\vec{F}_g' },
                  { text: 'Electrostatic', value: '\\vec{F}_e' },
                  { text: 'Magnetic', value: '\\vec{F}_m' },
                  { text: 'Normal', value: '\\vec{F}_N' },
                  { text: 'Frictional', value: '\\vec{f}' }
            ]
      }),

      actions: {
            addObject(x, y) {
                  try {
                        console.log('Store: Adding new object at', x, y)
                        const newObject = {
                              id: Date.now(),
                              x,
                              y,
                              label: "Object",
                              selected: false,
                              isEditing: false,
                        }
                        console.log('New object:', newObject)
                        this.objects.push(newObject)
                        console.log('Updated objects:', this.objects)
                  } catch (error) {
                        console.error('Error in store addObject:', error)
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

            addInteraction(label) {
                  if (this.selectedObjects.length !== 2) return

                  const [obj1, obj2] = this.selectedObjects
                  const existingInteractions = this.getInteractionsBetween(obj1.id, obj2.id)
                  const hasExactInteraction = existingInteractions.some(i => i.label === label)

                  if (!hasExactInteraction) {
                        const existingCount = this.getInteractionCount(obj1.id, obj2.id)
                        const newInteraction = {
                              id: Date.now(),
                              fromObjectId: obj1.id,
                              toObjectId: obj2.id,
                              label,
                              arcHeight: 50 + (existingCount * 30)
                        }
                        this.interactions.push(newInteraction)
                  }

                  this.clearSelection()
            },

            deleteObject(id) {
                  console.log('Store deleteObject called with id:', id)
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