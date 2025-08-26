<template>
    <!-- TEACHER -->

    <div v-if="role === 'admin'">
        <h1>This is the Admin Grades View</h1>
    </div>
    <!-- TEACHER -->

    <div v-else-if="role === 'teacher'">
        <GradesView/>
    </div>
    
    <!-- STUDENT -->
    <div v-else>
        <GradeTable/>
    </div>
</template>

<script>
import GradeTable from '@/components/Enrollment/Grades/GradeTable.vue';
import GradesView from '@/views/Auth/GradesView.vue';

    export default {
        props:{
            role: {
                type: String,
                required: true
            }
        },
        components: {
            GradeTable,
            GradesView
        }
    }
</script>

<style lang="scss" scoped>

</style>