<template>
  <div>
    <p v-if="!student" class="text-center text-gray-500">Loading student info...</p>

    <form v-else @submit.prevent="handleSubmit" class="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 class="text-2xl font-bold mb-4">Enrollment Form</h2>

      <!-- Full Name -->
      <div>
        <label class="block font-medium">Full Name</label>
        <input type="text" :value="student.full_name" class="border rounded p-2 w-full" readonly />
      </div>

      <!-- Email -->
      <div>
        <label class="block font-medium">Email</label>
        <input type="email" :value="student.email" class="border rounded p-2 w-full" readonly />
      </div>

      <!-- Course -->
      <div>
        <label class="block font-medium">Course</label>
        <input type="text" :value="student.course_name" class="border rounded p-2 w-full" readonly />
      </div>

      <!-- Year Level -->
      <div>
        <label class="block font-medium">Year Level</label>
        <select v-model="form.year_level" class="border rounded p-2 w-full" required>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>

      <div v-if="activeYear">
        <p class="text-gray-700">
          Semester: <strong>{{ form.semester }}</strong> | Academic Year: <strong>{{ activeYear.year }}</strong>
        </p>
      </div>

      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Enroll
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
        year_level: '',
        academic_year_id: null,
        semester: '',
        student_id: null,
        school_id: null,
      },
      student: null,
      activeYear: null,
    };
  },
  async mounted() {
    this.form.semester = this.$route.query.semester || '';

    await this.loadActiveYear();
    await this.loadStudent();
  },
  methods: {
    async loadActiveYear() {
      try {
        const resp = await axios.get('http://localhost:3000/academic-years/active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        this.activeYear = resp.data.data;

        if (!this.form.semester) this.form.semester = this.activeYear?.semester || '1st';
        if (!this.form.academic_year_id) this.form.academic_year_id = this.activeYear?.id;
      } catch (err) {
        console.error('Error loading active year:', err.response?.data || err);
      }
    },

  async loadStudent() {
  try {
    const resp = await axios.get('http://localhost:3000/students', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    const studentsArray = resp.data.data || [];

    // Just pick the first student for now
    const studentData = studentsArray[0];

    if (studentData) {
      const courseMap = { 1: 'BSIT', 2: 'BSBA', 3: 'BSCRIM' };

      this.student = {
        full_name: studentData.full_name,
        email: studentData.email,
        course_name: courseMap[studentData.course_id] || 'Unknown',
        school_id: studentData.school_id,
        id: studentData.id,
      };

      // Fill the form automatically
      this.form.student_id = studentData.id;
      this.form.school_id = studentData.school_id;
    } else {
      this.student = { full_name: '', email: '', course_name: 'Unknown' };
      console.warn('No students found');
    }
  } catch (err) {
    console.error('Error loading student:', err.response?.data || err);
    alert('Failed to load student data.');
  }
},


    async handleSubmit() {
      try {
        const payload = {
          student_id: this.form.student_id,
          school_id: this.form.school_id,
          academic_year_id: this.form.academic_year_id,
          semester: this.form.semester,
          year_level: Number(this.form.year_level),
        };

        const resp = await axios.post('http://localhost:3000/students/pending', payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (resp.data.success) {
          alert('Enrollment submitted!');
          this.form.year_level = '';
        } else {
          alert('Enrollment failed: ' + (resp.data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Enrollment error:', err.response?.data || err);
        alert('Enrollment failed.');
      }
    },
  },
};
</script>
