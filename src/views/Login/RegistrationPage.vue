<template>
    <div class="flex min-h-screen">
    <!-- Left side: Logo -->
        <div class="w-1/2 flex justify-center items-center">
            <img src="@/assets/img/Logo.png" alt="Logo" class="w-full max-w-xs" />
        </div>

        <div class="w-1/2 flex flex-col justify-center items-center gap-4">
            <div class="flex gap-4">
                <button 
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                @click="goTo('student')">
                    Register as a Student
                </button>

                <button
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                @click="goTo('teacher')"
                >
                Register as a Teacher
                </button>
            </div>
        </div>
        <RouterView/> 
    </div>
</template>


<script>
import { RouterView } from 'vue-router';



export default{
    components: {
        RouterView
    },
    data(){
        return {
            activeForm: null
        }
    },
    methods: {
        goTo(type) {
            if (type === 'student') {
                this.$router.push('/register/student')
            }else if (type === 'teacher'){
                this.$router.push('/register/teacher')
            }
        }
    }
}
</script>
