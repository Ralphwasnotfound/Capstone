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
import { reactive } from 'vue'
import { submitEnrollment } from '@/composables/utils/api'

export default {
  name: 'FreshmanEnrollmentForm',
  setup() {
    const form = reactive({
      full_name: '',
      email: '',
    })

    const handleSubmit = async () => {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        enrollment_type: 'freshmen'
      }

      const { success } = await submitEnrollment(payload)

      if (success) {
        alert('Freshmen enrollment submitted!')
        Object.keys(form).forEach(key => form[key] = '')
      } else {
        alert('Submission failed. Please try again.')
      }
    }

    return {
      form,
      handleSubmit,
    }
  },
}
</script>
