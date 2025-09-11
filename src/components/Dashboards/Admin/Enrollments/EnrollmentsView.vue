<template>
    <div>
        <StudentEnrollmentTable :students="students" class="pt-10"/>
    </div>

    <div class="mt-6 text-center">
        <button 
        @click="gotoSubjectSection"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            go to Subject Section (DEV)
        </button>
        
    </div>
</template>

<script>
import StudentEnrollmentTable from '../StudentEnrollmentTable.vue';

    export default {
        components: {
            StudentEnrollmentTable
        },
        methods: {
            gotoSubjectSection() {
                const devStudentId = 1
                console.log("Navigatiing to Subject Section...")
                this.$router.push({ name: "SubjectSelection", params: { id: devStudentId}})
            }
        }
    }
</script>

<style>

</style>