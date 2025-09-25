<template>
    <div>
        <CreateStudentForm/>
    </div>
</template>

<script>
import CreateStudentForm from '@/components/Forms/Enrollment/CreateStudentForm.vue';



    export default {
        components: {
            CreateStudentForm,
        },
        data() {
            return {
                selectedForm: null
            }
        }
    }
</script>

<style >

</style>