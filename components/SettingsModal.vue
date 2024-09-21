<template>
    <v-btn icon="mdi-cog-outline" @click="toggleShowModal"/>
    <v-dialog v-model="showModal" max-width="350px">
        <v-card class="pa-3">
            <v-card-title>Settings</v-card-title>
            <v-card-text>
                <v-checkbox
                    v-model="showComponents"
                    label="Show Vector Components"/>
                <v-checkbox
                    v-model="hideGrid"
                    label="Hide Grid"/>
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
const emit = defineEmits(['saveSettings'])

const showModal = ref(false)
const showComponents = ref(false)
const hideGrid = ref(false)

const toggleShowModal = () => {
    showModal.value = !showModal.value
}

const saveAndClose = () => {
    const settings = {
        newShowComponents: showComponents.value,
        newHideGrid: hideGrid.value
    }
    emit('saveSettings', settings)
    showModal.value = !showModal.value
}

</script>