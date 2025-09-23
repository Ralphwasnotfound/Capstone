<template>
  <form @submit.prevent="handleSubmit" class="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
    <h2 class="text-2xl font-bold mb-4">Enrollment Form</h2>

    <!-- FULLNAME -->
    <div>
      <label for="fullName" class="block font-medium">Full Name</label>
      <input v-model="form.full_name" id="fullName" type="text" class="border rounded p-2 w-full" required>
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block font-medium">Email</label>
      <input v-model="form.email" id="email" type="email" class="border rounded p-2 w-full" required>
    </div>

    <!-- Course Picker -->
    <div>
      <label for="course" class="block font-medium">Course</label>
      <select v-model="form.course_id" id="course" class="border rounded p-2 w-full" required>
        <option disabled value="">Select Course</option>
        <option value="1">BSIT</option>
        <option value="2">BSBA</option>
        <option value="3">BSCRIM</option>
      </select>
    </div>

    <!-- Year Level -->
    <div>
      <label for="year" class="block font-medium">Year Level</label>
      <select v-model="form.year_level" id="year" class="border rounded p-2 w-full" required>
        <option value="1">1st Year</option>
        <option value="2">2nd Year</option>
        <option value="3">3rd Year</option>
        <option value="4">4th Year</option>
      </select>
    </div>

    <!-- Enrollment Type -->
    <div>
      <label for="type" class="block font-medium">Enrollment Type</label>
      <select v-model="form.enrollment_type" id="type" class="border rounded p-2 w-full" required>
        <option disabled value="">Select Type</option>
        <option value="Freshmen">Freshmen</option>
        <option value="Old">Old Student</option>
        <option value="Transferee">Transferee</option>
        <option value="Shifty">Shifty</option>
      </select>
    </div>

    <!-- Active Semester & Year -->
    <div v-if="activeYear">
      <p class="text-gray-700">
        Semester: <strong>{{ activeYear.semester }}</strong> | Academic Year: <strong>{{ activeYear.year }}</strong>
      </p>
    </div>

    <button 
      type="submit" 
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      :disabled="!activeYear"
    >
      Enroll
    </button>
  </form>
</template>

<script>
import { submitEnrollment, fetchStudents, fetchActiveAcademicYear } from '@/composables/utils/api';

export default {
  name: 'EnrollmentForm',
  data() {
    return {
      form: {
        full_name: '',
        email: '',
        course_id: '',
        year_level: '',
        enrollment_type: '',
        academic_year_id: null,
        semester: ''
      },
      students: [],
      activeYear: null
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.activeYear) {
        alert('Cannot submit: Active academic year not found.');
        return;
      }

      // Ensure academic year and semester are always included
      this.form.academic_year_id = this.activeYear.id;
      this.form.semester = this.activeYear.semester;

      console.log('Submitting enrollment:', this.form); // ✅ Debug check

      try {
        const { success } = await submitEnrollment(this.form);

        if (success) {
          alert('Enrollment Submitted');
          this.resetForm();
          this.loadStudents();
        } else {
          alert('Submission Failed');
        }
      } catch (err) {
        console.error('Enrollment error', err);
        alert('Submission Failed');
      }
    },

    resetForm() {
      this.form = {
        full_name: '',
        email: '',
        course_id: '',
        year_level: '',
        enrollment_type: '',
        academic_year_id: this.activeYear.id,
        semester: this.activeYear.semester
      };
    },

    async loadActiveYear() {
      try {
        const { success, data } = await fetchActiveAcademicYear();
        if (success && data) this.activeYear = data;
        else console.warn('No active academic year found');
      } catch (err) {
        console.error('Error fetching active academic year:', err);
      }
    },

    async loadStudents() {
      try {
        const { success, data } = await fetchStudents();
        if (success) this.students = data;
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    }
  },
  mounted() {
    this.loadActiveYear();
    this.loadStudents();
  }
}
</script>
