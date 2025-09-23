<template>
  <div>
    <!-- Enrollment Status -->
    <div v-if="status === 'approved' || status === 'enrolled'" class="mb-4 p-3 bg-green-100 text-green-700 rounded">
      ✅ You are officially enrolled!
    </div>
    <div v-else class="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded">
      ⚠️ Your enrollment is not yet approved.
    </div>

    <!-- Enrolled Subjects Table -->
    <table v-if="subjects.length" class="min-w-full table-auto border-collapse border border-gray-300 mt-4">
      <thead class="bg-gray-100">
        <tr>
          <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Subjects</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Course Code</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Units</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(subject, index) in subjects" 
            :key="subject.id"
            :class="index % 2 === 0 ? 'bg-white hover:bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'">
          <td class="border border-gray-300 px-4 py-2">{{ subject.subject_name }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ subject.subject_code }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ subject.units }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="text-gray-500 mt-4">
      No subjects enrolled yet.
    </p>
  </div>
</template>

<script>
import api from '@/composables/utils/api';

export default {
  data() {
    return {
      status: '',
      subjects: [],
    };
  },
  async mounted() {
    await this.fetchEnrollment();
  },
  methods: {
    async fetchEnrollment() {
      try {
        const res = await api.get('/students/me'); // using your api instance with token
        const student = res.data.data;

        this.status = student.status || '';

        // Show subjects for both approved/enrolled
        this.subjects = (student.subjects || []).filter(
          s => s.enrollment_status === 'enrolled' || s.enrollment_status === 'approved'
        );
      } catch (err) {
        console.error('Error fetching enrollment:', err);
        this.subjects = [];
      }
    }
  }
};
</script>
