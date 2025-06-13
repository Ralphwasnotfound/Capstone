<template>

    <div v-if="role === 'admin'">
        <h1>This is the admin reports</h1>
    </div>

    <div v-else>
        this is reports
    </div>
</template>

<script>
    export default {
        props: {
            role: {
                type: String,
                required: true
            }
        }
    }
</script>

<style scoped>

</style>