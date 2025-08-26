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
    <table class="min-w-full table-auto border-collapse border border-gray-300 mt-4">
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
          <td class="border border-gray-300 px-4 py-2">{{ subject.name }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ subject.code }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ subject.units }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      status: '',
      subjects: []
    };
  },
  async mounted() {
    await this.fetchEnrollment();
  },
  methods: {
    async fetchEnrollment() {
      try {
        const res = await axios.get('/students/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.status = res.data.status || '';
        this.subjects = res.data.subjects || [];
      } catch (err) {
        console.error('Error fetching enrollment:', err);
      }
    }
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
