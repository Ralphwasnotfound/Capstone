
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
        '/dashboard/teacher/subject-courses',
        '/dashboard/teacher/attendance',
        '/dashboard/teacher/digital-IDs',
        '/dashboard/teacher/grades',
        '/dashboard/teacher/announcements',
        '/dashboard/teacher/contact-concern',
        '/dashboard/teacher/profile-settings',
        '/dashboard/teacher/reports',
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
        '/dashboard/admin',
        '/dashboard/admin/subject-courses',
        '/dashboard/admin/attendance',
        '/dashboard/admin/digital-IDs',
        '/dashboard/admin/grades',
        '/dashboard/admin/announcements',
        '/dashboard/admin/contact-concern',
        '/dashboard/admin/profile-settings',
        '/dashboard/admin/reports',
        // STUDENT ENROLLMENT PAGE
        '/student-enrollment'
      ]
      return hiddenRoutes.includes(this.$route.path)
    }
  }
}

</script>


