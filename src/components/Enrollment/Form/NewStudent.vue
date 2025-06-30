<template>
<form @submit.prevent="handleSubmit" class="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
    <h2 class="text-2xl font-bold mb-4">Freshman Enrollment Form</h2>

    <div>
        <label for="fullName" class="block font-medium">Full Name</label>
        <input v-model="form.fullName" id="fullName" type="text" class="border rounded p-2 w-full" required />
    </div>

    <div>
        <label for="email" class="block font-medium">Email Address</label>
        <input v-model="form.email" id="email" type="email" class="border rounded p-2 w-full" required />
    </div>

    <div>
        <label for="birthdate" class="block font-medium">Birthdate</label>
        <input v-model="form.birthdate" id="birthdate" type="date" class="border rounded p-2 w-full" required />
    </div>

    <div>
        <label for="course" class="block font-medium">Desired Course</label>
        <input v-model="form.course" id="course" type="text" class="border rounded p-2 w-full" required />
    </div>

    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enroll</button>
    </form>
</template>

<script>
import { reactive } from 'vue'

export default {
  name: 'FreshmanEnrollmentForm',
  setup() {
    const form = reactive({
      fullName: '',
      email: '',
      birthdate: '',
      course: '',
    })

    const handleSubmit = () => {
      console.log('Enrollment submitted:', form)
      alert('Enrollment form submitted!')
      // Here you would send `form` data to your server using fetch/axios
    }

    return {
      form,
      handleSubmit,
    }
  },
}
</script>
