<template>
    <div>
        <StudentProfile v-if="role === 'student'" :showDetails="showDetails" :role="role" />
        <TeacherProfile v-else-if="role === 'teacher'" :showDetails="showDetails" :role="role" />
    </div>
</template>

<script>
import StudentProfile from './Profile/StudentProfile.vue';
import TeacherProfile from './Profile/TeacherProfile.vue';


    export default {
        props: {
    role: {
        type: String,
        required: true
    },
    showDetails: {
        type: Boolean,
        default: true
        }
    },
    components: {
        StudentProfile,
        TeacherProfile
    }
    

    }
</script>