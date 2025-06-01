
<template>
  <header>
    <NavView v-if="!hideNavbar"/>
  </header>
  <RouterView />

</template>

<script >
import NavView from './components/NavView.vue'

export default{
  components: {
    NavView
  },
  methods: {
    
  },
  computed:{
    hideNavbar(){
      const hiddenRoutes = 
      [
        '/login', 
        '/register',
        '/register/student', 
        '/register/teacher',
        // Teacher Dashboards
        '/dashboard/teacher',
        // Student Dashboards
        '/dashboard/student',
        '/dashboard/student/subject-courses',
        '/dashboard/student/attendance',
        '/dashboard/student/digital-IDs',
        '/dashboard/student/grades',
        '/dashboard/student/announcements',
        '/dashboard/student/contact-concern',
        '/dashboard/student/profile-settings',
        // Admin Dashboards
        '/dashboard/admin'
      ]
      return hiddenRoutes.includes(this.$route.path)
    }
  }
}

</script>


