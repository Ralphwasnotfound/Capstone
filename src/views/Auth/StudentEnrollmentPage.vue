<template>
    <div>
        <EnrollmentForm/>
    </div>
</template>

<script>
import EnrollmentForm from '@/components/Forms/Enrollment/EnrollmentForm.vue';


    export default {
        components: {
            EnrollmentForm,
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