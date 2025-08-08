<template>
    <div>
        <StudentEnrollmentTable :students="students" class="pt-10"/>
    </div>
</template>

<script>
import StudentEnrollmentTable from '../StudentEnrollmentTable.vue';

    export default {
        components: {
            StudentEnrollmentTable
        }
    }
</script>

<style>

</style>