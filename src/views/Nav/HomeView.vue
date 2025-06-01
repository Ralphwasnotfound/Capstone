<template>
  <div>
    <HeroView @login="goToLogin" @register="goToRegister"/>
  </div>
</template>

<script>
import HeroView from '@/components/LandingPage/HeroView.vue'

export default {
  components: {
    HeroView
  },
  methods: {
    goToLogin(){
      console.log('You Click the Login Button in the Hero Component')
      this.$router.push('/login')
    },
    goToRegister(){
      console.log('You Click the Register Button in the Hero Component')
      this.$router.push('/register')
    }
  }
}
</script>

<style scoped>

</style>
