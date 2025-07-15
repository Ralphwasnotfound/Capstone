<template>
    <div class="flex min-h-screen">
        <!-- Left Side: Logo or Image -->
        <div class="w-1/2  flex justify-center items-center">
        <img src="@/assets/img/Logo.png" alt="Logo" class="w-2/3 max-w-xs">
    </div>

    <div class="w-1/2 flex justify-center items-center ">
        
        <LoginForm/>
    </div>
</div>
</template>

<script>
import LoginForm from '@/components/Forms/Login/LoginForm.vue'

export default{
    components:{
        LoginForm
    }
}
</script>

