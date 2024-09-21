<template>
    <v-btn icon="mdi-cog-outline" @click="toggleShowModal"/>
    <v-dialog v-model="showModal" max-width="300px">
        <v-card>
            <v-card-text>this is a modal</v-card-text>
            <v-card-actions>
                <v-btn @click="toggleShowModal">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        required: true,
        default: false
    }
})

const showModal = ref(false)

const toggleShowModal = () => {
    showModal.value = !showModal.value
}

</script>