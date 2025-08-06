<template>

    <!-- ADMIN -->
    
    <div v-if="role === 'admin'">
        <h1>This is the Admin subject-courses</h1>
    </div>

    <!-- TEACHER -->
    
    <div v-else-if="role === 'teacher'">
        <h1>This is the teacher subject-courses</h1>
    </div>

    <!-- STUDENT -->

    <div v-else> 
        <router-link v-if="!isEnrolled" to="/student-enrollment">
            <button class="bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:from-green-600 hover:to-green-800 transition duration-200">
                Enroll Now
            </button>
        </router-link>
        
        <SubjectsCourses/>

    </div>
</template>

<script>

import SubjectsCourses from '../Subject&Courses/SubjectsCourses.vue';
// import axios from 'axios'

    export default {
        components:{
            SubjectsCourses,
            
        },
        props: {
            role: {
                type: String,
                required: true
            },
            data() {
                return {
                    isEnrolled: false
                }
            }
        },
        
    }
</script>

