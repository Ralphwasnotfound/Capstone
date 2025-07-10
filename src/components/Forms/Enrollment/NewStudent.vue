<template>
<form @submit.prevent="handleSubmit" class="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
    <h2 class="text-2xl font-bold mb-4">Freshman Enrollment Form</h2>

    <div>
        <label for="fullName" class="block font-medium">Full Name</label>
        <input v-model="form.full_name" id="fullName" type="text" class="border rounded p-2 w-full" required />
    </div>

    <div>
        <label for="email" class="block font-medium">Email Address</label>
        <input v-model="form.email" id="email" type="email" class="border rounded p-2 w-full" required />
    </div>

    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enroll</button>
    </form>
</template>

<script>
import { submitEnrollment, fetchStudents } from '@/composables/utils/api'

export default {
  name: 'FreshmanEnrollmentForm',
  data() {
    return {
      form: {
        full_name: '',
        email: '',
      },
      students: []
    }
  },
  methods: {
    async handleSubmit() {
      const payload = {
        full_name: this.form.full_name,
        email: this.form.email,
        enrollment_type: 'freshmen',
      }
      const { success } = await submitEnrollment(payload)

      if (success) {
        alert('Enrollment Submitted!')
        this.form.full_name = ''
        this.form.email = ''
        this.loadStudents()
      } else {
        alert('Submission Failed. Please try Again')
      }
    },
    async loadStudents() {
      const { success, data } = await fetchStudents()
      if (success) {
        this.students = data
      }
    }
  },
  mounted() {
    this.loadStudents()
  }
  
}
</script>
