<template>
  <div class="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-center">Create Student</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Full Name -->
      <div>
        <label for="fullName" class="block font-medium mb-1">Full Name</label>
        <input
          v-model="form.full_name"
          type="text"
          id="fullName"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter full name"
          required
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block font-medium mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          id="email"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter email"
          required
        />
      </div>

      <!-- Course -->
      <div>
        <label for="course" class="block font-medium mb-1">Course</label>
        <select
          v-model="form.course_id"
          id="course"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="" disabled>Select Course</option>
          <option value="1">BSIT</option>
          <option value="2">BSBA</option>
          <option value="3">BSCRIM</option>
        </select>
      </div>

      <!-- Enrollment Type -->
      <div>
        <label for="enrollmentType" class="block font-medium mb-1">Enrollment Type</label>
        <select
          v-model="form.enrollment_type"
          id="enrollmentType"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="" disabled>Select Type</option>
          <option value="Freshmen">Freshmen</option>
          <option value="Old">Old Student</option>
          <option value="Transferee">Transferee</option>
          <option value="Shifty">Shifty</option>
        </select>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Create Student
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      form: {
        full_name: '',
        email: '',
        course_id: '',
        enrollment_type: ''
      },
      loading: false
    };
  },
  methods: {
    async handleSubmit() {
      if (this.loading) return;
      this.loading = true;

      try {
        // 1️⃣ Create student
        const createResp = await axios.post(
          'http://localhost:3000/students/create',
          { ...this.form, course_id: Number(this.form.course_id) },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        if (!createResp.data.success) {
          alert('Failed to create student: ' + (createResp.data.error || 'Unknown error'));
          this.loading = false;
          return;
        }

        const schoolId = createResp.data.school_id;

        // 2️⃣ Fetch active semester
        const semesterResp = await axios.get('http://localhost:3000/academic-years/active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const semester = semesterResp.data.data?.semester || '1st';

        // 3️⃣ Reset form and redirect
        this.resetForm();

        setTimeout(() => {
            this.$router.push({
                path: '/student-enrollment/student',
                query: { schoolId, semester }
            });
        },)
        

      } catch (err) {
        console.error('Error creating student:', err.response?.data || err);
        alert('Error creating student');
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        full_name: '',
        email: '',
        course_id: '',
        enrollment_type: ''
      };
    }
  }
};
</script>

<style scoped>
/* Optional additional styling */
</style>
