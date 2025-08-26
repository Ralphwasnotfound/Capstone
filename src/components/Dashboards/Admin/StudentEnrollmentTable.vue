<template>
  <div class="p-6">
    <!-- PENDING STUDENTS -->
    <div>
      <h1 class="text-xl font-bold mb-2">Pending Students</h1>
      <table class="w-full border mt-4">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 text-left">Full Name</th>
            <th class="p-2 text-left">Student ID</th>
            <th class="p-2 text-left">Email</th>
            <th class="p-2 text-left">Status</th>
            <th class="p-2 text-left">Enrollment Type</th>
            <th class="p-2 text-left">Date Enrolled</th>
            <th class="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(student, index) in pendingStudents"
            :key="student.id"
            :class="index % 2 === 0 ? 'bg-white hover:bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'"
          >
            <td class="p-2">{{ student.full_name || 'N/A' }}</td>
            <td class="p-2">{{ student.student_id || 'N/A' }}</td>
            <td class="p-2">{{ student.email || 'N/A' }}</td>
            <td class="p-2">{{ student.status || 'Pending' }}</td>
            <td class="p-2">{{ student.enrollment_type || 'N/A' }}</td>
            <td class="p-2">{{ formatDate(student.created_at) }}</td>
            <td class="p-2">
              <button
                v-if="student.status?.toLowerCase() === 'pending'"
                @click="goToSubjectSelection(student.id)"
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Select Subjects
              </button>
              <span v-else class="text-green-600 font-semibold">Approved</span>
            </td>
          </tr>
          <tr v-if="pendingStudents.length === 0">
            <td colspan="7" class="text-center py-4">No pending students</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ENROLLED STUDENTS -->
    <div class="mt-8">
      <h1 class="text-xl font-bold mb-2">Enrolled Students</h1>
      <table class="w-full border mt-4">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 text-left">Full Name</th>
            <th class="p-2 text-left">Student ID</th>
            <th class="p-2 text-left">Email</th>
            <th class="p-2 text-left">Status</th>
            <th class="p-2 text-left">Enrollment Type</th>
            <th class="p-2 text-left">Date Enrolled</th>
            <th class="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(student, index) in enrolledStudents"
            :key="student.id"
            :class="index % 2 === 0 ? 'bg-white hover:bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'"
          >
            <td class="p-2">{{ student.full_name || 'N/A' }}</td>
            <td class="p-2">{{ student.student_id || 'N/A' }}</td>
            <td class="p-2">{{ student.email || 'N/A' }}</td>
            <td class="p-2">{{ student.status || 'Approved' }}</td>
            <td class="p-2">{{ student.enrollment_type || 'N/A' }}</td>
            <td class="p-2">{{ formatDate(student.created_at) }}</td>
            <td class="p-2 text-green-600 font-semibold">Approved</td>
          </tr>
          <tr v-if="enrolledStudents.length === 0">
            <td colspan="7" class="text-center py-4">No enrolled students</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { fetchPendingStudents, fetchEnrolledStudents } from '@/composables/utils/api.js'

export default {
  name: 'StudentEnrollmentTable',
  data() {
    return {
      pendingStudents: [],
      enrolledStudents: []
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A'
      const parsed = new Date(date)
      return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    async loadPendingStudents() {
      try {
        const res = await fetchPendingStudents()
        if (res.success && Array.isArray(res.data)) {
          // Access the correct array
          this.pendingStudents = res.data
        } else if (res.success && Array.isArray(res.data?.data)) {
          this.pendingStudents = res.data.data
        } else {
          this.pendingStudents = []
        }
      } catch (err) {
        console.error('Failed to fetch pending students:', err)
      }
    },

    async loadEnrolledStudents() {
      try {
        const res = await fetchEnrolledStudents()
        if (res.success && Array.isArray(res.data)) {
          this.enrolledStudents = res.data
        } else if (res.success && Array.isArray(res.data?.data)) {
          this.enrolledStudents = res.data.data
        } else {
          this.enrolledStudents = []
        }
      } catch (err) {
        console.error('Failed to fetch enrolled students:', err)
      }
    },

    goToSubjectSelection(studentId) {
      this.$router.push(`/student/${studentId}/subjects`)
    }
  },
  mounted() {
    this.loadPendingStudents()
    this.loadEnrolledStudents()
  }
}
</script>

