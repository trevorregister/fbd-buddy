<template>
    <v-btn icon="mdi-cog-outline" @click="toggleShowModal"/>
    <v-dialog v-model="showModal" max-width="350px">
        <v-card class="pa-3">
            <v-card-title>Settings</v-card-title>
            <v-card-text>
                <v-checkbox
                    v-model="showComponents"
                    @change="toggleShowComponents"
                    label="Show Vector Components"/>
                <v-checkbox
                    v-model="hideGrid"
                    @change="toggleHideGrid"
                    label="Hide Grid"/>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="toggleShowModal">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
const emit = defineEmits(['hideGrid', 'showComponents'])

const showModal = ref(false)
const showComponents = ref(false)
const hideGrid = ref(false)

const toggleShowModal = () => {
    showModal.value = !showModal.value
}

const toggleShowComponents = () => {
    console.log(showComponents.value)
    emit('showComponents')
}
const toggleHideGrid = () => {
    emit('hideGrid')
}

</script>