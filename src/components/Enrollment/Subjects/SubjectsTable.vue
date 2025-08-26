<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Available Subjects</h2>

    <table class="table-auto w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2">CODE</th>
          <th class="border px-4 py-2">NAME</th>
          <th class="border px-4 py-2">UNITS</th>
          <th class="border px-4 py-2">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subject in subjects" :key="subject.id" :class="subject.enrolled ? 'bg-green-50' : ''">
          <td class="border px-4 py-2">{{ subject.code }}</td>
          <td class="border px-4 py-2">{{ subject.name }}</td>
          <td class="border px-4 py-2">{{ subject.units }}</td>
          <td class="border px-4 py-2 text-center">
            <button v-if="!subject.enrolled" @click="addToSelection(subject)" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              Add
            </button>
            <span v-else class="text-green-600 font-semibold">Enrolled</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="selectedSubjects.length" class="mt-4">
      <h3 class="font-bold mb-2">Selected Subjects</h3>
      <ul>
        <li v-for="subject in selectedSubjects" :key="subject.id">{{ subject.name }}</li>
      </ul>
      <button @click="confirmEnrollment" class="bg-green-500 text-white px-4 py-2 rounded mt-2">Confirm Enrollment</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      subjects: [],
      selectedSubjects: [],
      student: null,
    };
  },
  async mounted() {
    await this.fetchStudentAndSubjects();
  },
  methods: {
    async fetchStudentAndSubjects() {
      try {
        const studentId = this.$route.params.id;

        // Fetch student by ID (approved or pending)
        const studentRes = await axios.get(`http://localhost:3000/students/${studentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.student = studentRes.data;

        // Fetch all subjects
        const subjectsRes = await axios.get('http://localhost:3000/subjects', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const enrolledSubjects = this.student.subjects || [];

        // Mark enrolled subjects
        this.subjects = subjectsRes.data.map(sub => ({
          ...sub,
          enrolled: enrolledSubjects.some(e => e.id == sub.id)
        }));
      } catch (err) {
        console.error('Error fetching student or subjects:', err);
      }
    },

    addToSelection(subject) {
      if (!this.selectedSubjects.includes(subject)) this.selectedSubjects.push(subject);
    },

    async confirmEnrollment() {
      if (!this.selectedSubjects.length) return alert('No subjects selected!');
      const studentId = this.$route.params.id;
      const subjectIds = this.selectedSubjects.map(s => s.id);

      try {
        await axios.put(`http://localhost:3000/students/${studentId}/approve`, { subjectIds }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Enrolled Successfully!');
        this.selectedSubjects = [];
        await this.fetchStudentAndSubjects();
      } catch (err) {
        console.error('Enrollment failed:', err);
        alert('Enrollment Failed!');
      }
    }
  }
};
</script>
