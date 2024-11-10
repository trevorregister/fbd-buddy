import { defineStore } from 'pinia'

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

      getters: {
            getInteractionsBetween: (state) => (obj1Id, obj2Id) => {
                  return state.interactions.filter(interaction =>
                        (interaction.fromObjectId === obj1Id && interaction.toObjectId === obj2Id) ||
                        (interaction.fromObjectId === obj2Id && interaction.toObjectId === obj1Id)
                  )
            },

            getInteractionCount: (state) => (obj1Id, obj2Id) => {
                  return state.interactions.filter(interaction =>
                        (interaction.fromObjectId === obj1Id && interaction.toObjectId === obj2Id) ||
                        (interaction.fromObjectId === obj2Id && interaction.toObjectId === obj1Id)
                  ).length
            }
      },

      actions: {
            addObject(x, y) {
                  const newObject = {
                        id: Date.now(),
                        x,
                        y,
                        label: "Object",
                        selected: false,
                        isEditing: false,
                  }
                  this.objects.push(newObject)
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
                  // First set all objects to not editing
                  this.objects.forEach(obj => obj.isEditing = false)
                  // Then set the specified object's editing state
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

                  // Check if this exact interaction type already exists between these objects
                  const existingInteractions = this.getInteractionsBetween(obj1.id, obj2.id)
                  const hasExactInteraction = existingInteractions.some(i => i.label === label)

                  // Only add if this exact interaction doesn't already exist
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
            }
      }
}) 