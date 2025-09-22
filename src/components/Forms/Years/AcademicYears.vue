<template>
  <div class="max-w-lg mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Academic Years & Semesters</h2>

    <!-- Add Academic Year Form -->
    <form @submit.prevent="addYear" class="space-y-2 mb-6">
      <input v-model="year" type="text" placeholder="e.g 2025-2026" required class="border p-2 rounded w-full">
      <label class="block">
        Semester:
        <select v-model="semester" required class="border p-2 rounded w-full">
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="Summer">Summer</option>
        </select>
      </label>
      <label class="block">
        Enrollment Start:
        <input v-model="enrollmentStart" type="datetime-local" class="border p-2 rounded w-full">
      </label>
      <label class="block">
        Enrollment End:
        <input v-model="enrollmentEnd" type="datetime-local" class="border p-2 rounded w-full">
      </label>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Add Academic Year/Semester
      </button>
    </form>

    <!-- Academic Years List -->
    <ul class="space-y-2">
      <li v-for="ay in academicYears" :key="ay.id" class="border p-2 rounded flex justify-between items-center">
        <div>
          <strong>{{ ay.year }} - {{ ay.semester }}</strong> | Status: {{ ay.is_active ? 'Active' : 'Inactive' }} <br>
          Enrollment: {{ ay.enrollment_start || '-' }} - {{ ay.enrollment_end || '-' }}
        </div>
        <div class="flex space-x-2">
          <button 
            v-if="ay.is_active"
            @click="deactivateSemester(ay)" 
            class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
          >
            Deactivate
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { fetchAcademicYears, createAcademicYear, deactivateAcademicYear } from '@/composables/utils/api.js'

export default {
  data() {
    return {
      academicYears: [],
      year: '',
      semester: '1st',
      enrollmentStart: '',
      enrollmentEnd: ''
    }
  },
  async mounted() {
    const res = await fetchAcademicYears()
    if (res.success) this.academicYears = res.data
  },
  methods: {
    async addYear() {
      const res = await createAcademicYear({
        year: this.year,
        semester: this.semester,
        enrollment_start: this.enrollmentStart,
        enrollment_end: this.enrollmentEnd,
        is_active: 1 // active by default
      })

      if (res.success) {
        this.academicYears.push({
          id: res.data.id,
          year: this.year,
          semester: this.semester,
          enrollment_start: this.enrollmentStart,
          enrollment_end: this.enrollmentEnd,
          is_active: 1 // active by default
        })

        // Reset form
        this.year = ''
        this.semester = '1st'
        this.enrollmentStart = ''
        this.enrollmentEnd = ''
      } else {
        alert('Failed to add academic year/semester')
      }
    },

    async deactivateSemester(ay) {
      const res = await deactivateAcademicYear(ay.id, 0)
      if (res.success) {
        ay.is_active = 0
      } else {
        alert('Failed to deactivate semester')
      }
    }
  }
}
</script>

<style scoped>
/* Optional styling */
</style>
