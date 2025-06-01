<template>
    <div class="flex min-h-screen">
    <!-- Left side: Logo -->
        <div class="w-1/2 flex justify-center items-center">
            <img src="@/assets/img/Logo.png" alt="Logo" class="w-full max-w-xs" />
        </div>

    <!-- Right side: Buttons -->
        <div class="w-1/2 flex flex-col justify-center items-center gap-10">
            <StudentButton @click="goToStudentRegister"/>
            <TeacherButton @click="goToTeacherRegister"/>
        </div>
    </div>
</template>


<script>
import StudentButton from "@/components/Buttons/StudentButton.vue"
import TeacherButton from "@/components/Buttons/TeacherButton.vue"

export default{
    components:{
        StudentButton, TeacherButton
    },
    methods:{
        goToStudentRegister(){
        console.log('You Click Me')
        this.$router.push('/register/student')   
        },
        goToTeacherRegister(){
        console.log('You Click Me Teacher')
        this.$router.push('/register/teacher')    
        }
    }
}
</script>
