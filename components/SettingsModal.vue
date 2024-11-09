<template>
    <v-btn icon="mdi-cog-outline" @click="toggleShowModal"/>
    <v-dialog v-model="showModal" max-width="350px">
        <v-card class="pa-3">
            <v-card-title>Settings</v-card-title>
            <v-card-text>
                <v-switch
                    v-model="showComponents"
                    label="Show Components"
                ></v-switch>
                <v-switch
                    v-model="hideGrid"
                    label="Hide Grid"
                ></v-switch>
                <v-switch
                    v-model="hideLabels"
                    label="Hide Labels"
                ></v-switch>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="saveAndClose">
                    Save
                </v-btn>
                <v-btn @click="toggleShowModal">
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['saveSettings'])

const showModal = ref(false)
const showComponents = ref(false)
const hideGrid = ref(false)
const hideLabels = ref(false)

const toggleShowModal = () => {
    showModal.value = !showModal.value
}

const saveAndClose = () => {
    const settings = {
        newShowComponents: showComponents.value,
        newHideGrid: hideGrid.value,
        newHideLabels: hideLabels.value
    }
    emit('saveSettings', settings)
    showModal.value = !showModal.value
}

</script>