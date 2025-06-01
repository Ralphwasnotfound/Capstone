<template>
    <div class="grid grid-row-2 pt-20">
        <div class="flex items-center justify-center gap-10">
            <img src="@/assets/img/Logo.png" class="w-64" alt="">
            <div>
                <h1 class="text-center text-[70px]">CAMPUS CONNECT</h1>
                <h2 class="text-[30px] text-center">A Web-Base Integrated System for Student Management</h2>
                <LineDesign/>
            </div>
        </div>
        <div class="flex items-center justify-center gap-20 pt-10 ">
            <LoginButton @click="$emit('login')" class="w-72 text-[30px] h-16"/>
            <RegisterButton @click="$emit('register')" class="w-72 text-[30px] h-16" />
        </div>
        <div class="pt-24 pb-10">
            <CardView/>
        </div>
    </div>
</template>

<script>
import LoginButton from '@/components/Buttons/LoginButton.vue'
import RegisterButton from '@/components/Buttons/RegisterButton.vue'
import LineDesign from '@/components/Random/LineDesign.vue'
import CardView from '@/components/Cards/CardView.vue'

export default {
    components: {
        LoginButton, RegisterButton, LineDesign, CardView
    }
}

</script>
