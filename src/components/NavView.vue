<template>
  <header >
    <div class="flex justify-end items-center mx-10 pt-5">
      <img class="w-[8%] absolute left-44 top-2 " src="@/assets/img/Logo.png" alt="Logo">
      <div class="flex gap-10 text-[25px]">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/enroll">Enrollment</RouterLink>
        <RouterLink to="/digital-ID">Digital ID</RouterLink>
        <RouterLink to="/grades">Grades</RouterLink>
        <RouterLink to="/admin">Contact & Support</RouterLink>
        <div class="flex gap-5 justify-center items-center">
          <LoginButton @click="goToLogin" class="text-[20px]"/>
          <Register @click="goToRegister" class="text-[20px]"/>
        </div>
      </div>
    </div>
    <div class="mx-full mt-3">
      <hr class="w-full h-[2px] bg-[#37555e] border-0" />
    </div>
  </header>
</template>

<script >
import LoginButton from '@/components/Buttons/LoginButton.vue'
import Register from '@/components/Buttons/RegisterButton.vue'


export default{
  components: {
    LoginButton, Register
  },
  methods: {
    goToLogin() {
      this.$router.push('/login')
      console.log('You Log In')
    },
    goToRegister(){
      this.$router.push('/register')
      console.log('You Registerd')
    }
  }
}

</script>


