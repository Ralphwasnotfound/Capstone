<template>
  <form @submit.prevent="handleSubmit" class="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
    <h2 class="text-2xl font-bold mb-4">Enrollment Form</h2>

    <!-- Full Name -->
    <div>
      <label class="block font-medium">Full Name</label>
      <input type="text" :value="student?.full_name" class="border rounded p-2 w-full" readonly />
    </div>

    <!-- Email -->
    <div>
      <label class="block font-medium">Email</label>
      <input type="email" :value="student?.email" class="border rounded p-2 w-full" readonly />
    </div>

    <!-- Course -->
    <div>
      <label class="block font-medium">Course</label>
      <input type="text" :value="student?.course_name" class="border rounded p-2 w-full" readonly />
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

    <!-- Semester & Academic Year -->
    <div v-if="form.semester && activeYear">
      <p class="text-gray-700">
        Semester: <strong>{{ form.semester }}</strong> | Academic Year: <strong>{{ activeYear.year }}</strong>
      </p>
    </div>

    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" :disabled="!activeYear">
      Enroll
    </button>
  </form>
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
    }
  },
  async mounted() {
    this.form.school_id = this.$route.query.schoolId;
    this.form.semester = this.$route.query.semester;

    await this.loadActiveYear();
    await this.loadStudent();
    console.log(this.student);
  console.log(this.form);
  },
  methods: {
    async loadActiveYear() {
      const resp = await axios.get('http://localhost:3000/academic-years/active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.activeYear = resp.data.data;

      if (!this.form.semester) this.form.semester = this.activeYear?.semester || '1st';
      if (!this.form.academic_year_id) this.form.academic_year_id = this.activeYear?.id;
    },

    async loadStudent() {
      // 1️⃣ Get basic student data from /students/me
      const meResp = await axios.get('http://localhost:3000/students/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const meStudent = meResp.data.data;
      this.student = meStudent;
      this.form.student_id = meStudent.id;

      // 2️⃣ Fetch full student info including course_id from /students
      const allResp = await axios.get(`http://localhost:3000/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const allStudents = allResp.data;

      // Find matching student by id
      const fullStudent = allStudents.find(s => s.id === meStudent.id);
      if (fullStudent) {
        // Map course_id to course_name dynamically
        const courseMap = {
          1: 'BSIT',
          2: 'BSBA',
          3: 'BSCRIM'
        };
        this.student.course_name = courseMap[fullStudent.course_id] || 'Unknown';
      } else {
        this.student.course_name = 'Unknown';
      }
    },

    async handleSubmit() {
      try {
        const payload = {
          student_id: this.form.student_id,
          school_id: this.student.school_id,
          academic_year_id: this.form.academic_year_id,
          semester: this.form.semester,
          year_level: Number(this.form.year_level)
        }
        const resp = await axios.post(
          `http://localhost:3000/students/pending`,
            payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (resp.data.success) alert('Enrollment submitted!');
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert('Enrollment failed');
      }
    }
  }
}
</script>
