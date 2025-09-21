<template>
  <div>
    <!-- ADMIN -->
    <div v-if="role === 'admin'">
      <h1>This is the Admin Grades View</h1>
    </div>

    <!-- TEACHER -->
    <div v-else-if="role === 'teacher'">
      <h1>This is the Teacher Grades View</h1>
    </div>

    <!-- STUDENT -->
    <div v-else-if="role === 'student'">
      <h1>This is the Student Grades View</h1>
      <GradeTable :grades="grades"/>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/users.js'
import { fetchGradesByStudent } from '@/composables/utils/api'
import GradeTable from '@/components/Enrollment/Grades/GradeTable.vue'

export default {
  components: {
    GradeTable
  },
  props: {
    role: { type: String, required: true }
  },
  data() {
    return {
      teacherId: null,
      grades: []
    }
  },
  async mounted() {
    const userStore = useUserStore()
    const studentId = userStore.user?.studentId
    console.log('userStore.user:', userStore.user)

    if (studentId) {
      const res = await fetchGradesByStudent(studentId)
      if (res.success) 
        this.grades = res.data
    } else {
      console.warn('No studentId found, skipping API call')
    }
  }
}
</script>
