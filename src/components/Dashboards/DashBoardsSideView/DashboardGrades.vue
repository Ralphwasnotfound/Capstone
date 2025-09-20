<template>
  <div>
    <!-- ADMIN -->
    <div v-if="role === 'admin'">
      <h1>This is the Admin Grades View</h1>
    </div>

    <!-- TEACHER -->
    <div v-else-if="role === 'teacher'">
      
    </div>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/users.js'
import { fetchGradesByStudent } from '@/composables/utils/api'

export default {
  props: { role: { type: String, required: true } },
  data() {
    return { teacherId: null, grades: [] }
  },
  async mounted() {
    const userStore = useUserStore()

    if (this.role === 'teacher') {
      this.teacherId = userStore.user?.id || null
    }

    if (this.role === 'student') {
      const studentId = userStore.user?.id
      if (!studentId) return
      const res = await fetchGradesByStudent(studentId)
      if (res.success) this.grades = res.data
    }
  }
}
</script>
