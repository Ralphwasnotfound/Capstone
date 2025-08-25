<template>
  <div class="min-h-screen flex flex-col">
    
    <!-- ✅ Hero Section -->
    <div 
    class="relative flex flex-col items-center justify-center text-center h-screen bg-cover bg-center"
      style="background-image: url('/img/PCC-BUILDING.jpg');"
    >
      <!-- Dark overlay -->
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- Hero content -->
      <div class="relative z-10 flex flex-col items-center gap-6 px-6">
        <img src="@/assets/img/PCC/PCC.png" class="w-40 md:w-64 drop-shadow-lg" alt="PCC Logo">

        <h1 class="text-white text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
          Philippine Countryville <br class="hidden md:block" /> College Inc.
        </h1>

        <h2 class="text-white text-xl md:text-3xl font-medium drop-shadow-md">
          Web-Based Integrated System for Student Management
        </h2>
      </div>
    </div>

    <!-- ✅ Buttons Section -->
    <div class="flex items-center justify-center gap-6 md:gap-20 py-10">
      <LoginButton @click="$emit('login')" class="w-40 md:w-72 text-lg md:text-2xl h-14 md:h-16 shadow-lg" />
      <RegisterButton @click="$emit('register')" class="w-40 md:w-72 text-lg md:text-2xl h-14 md:h-16 shadow-lg" />
    </div>

    <!-- ✅ Cards Section -->
    <div class="pt-10 md:pt-24 pb-10 px-6">
      <CardView />
    </div>
    
  </div>
</template>

<script>
import LoginButton from '@/components/Buttons/LoginButton.vue'
import RegisterButton from '@/components/Buttons/RegisterButton.vue'
import CardView from '@/components/Common/Cards/CardView.vue'

export default {
  components: {
    LoginButton,
    RegisterButton,
    CardView
  }
}
</script>
