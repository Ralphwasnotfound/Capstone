<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">Teacher's Subjects</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead class="bg-green-500 text-white">
          <tr>
            <th class="py-3 px-6 text-left">Subject Code</th>
            <th class="py-3 px-6 text-left">Subject Name</th>
            <th class="py-3 px-6 text-left">Units</th>
            <th class="py-3 px-6 text-left">Year Level</th>
            <th class="py-3 px-6 text-left">Enrolled Students</th>
            <th class="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjects" :key="subject.id" class="border-b hover:bg-gray-100">
            <td class="py-2 px-6">{{ subject.code }}</td>
            <td class="py-2 px-6">{{ subject.name }}</td>
            <td class="py-2 px-6">{{ subject.units }}</td>
            <td class="py-2 px-6">{{ subject.year_level }}</td>
            <td class="py-2 px-6">
              <ul v-if="subject.students.length" class="list-disc pl-5">
                <li v-for="student in subject.students" :key="student.id">{{ student.full_name }}</li>
              </ul>
              <p v-else class="text-gray-500 italic">No students enrolled</p>
            </td>
            <td class="py-2 px-6">
              <button @click="goToGrades(subject.id)" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                Manage Grades
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TeacherSubjectsTable",
  data() {
    return {
      subjects: [],
      token: sessionStorage.getItem("token") || "",
      user: null,
    };
  },
  methods: {
    // Fetch the logged-in user from backend if sessionStorage is empty
    async fetchUser() {
      try {
        if (!this.token) throw new Error("No token found");

        const userId = sessionStorage.getItem("user_id");
        if (!userId) {
          console.error("No user_id in sessionStorage");
          return null;
        }

        const response = await axios.get(
          `http://localhost:3000/teachers/subjects?user_id=${userId}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        if (!response.data.success || !response.data.data.length) {
          console.error("❌ Could not fetch user from backend");
          return null;
        }

        const user = response.data.data[0];
        sessionStorage.setItem("user", JSON.stringify(user));
        this.user = user;
        return user;
      } catch (err) {
        console.error("❌ Error fetching user:", err);
        return null;
      }
    },

    async fetchTeacherSubjects() {
      try {
        // Get user from sessionStorage
        const userId = sessionStorage.getItem("user_id")

        if (!userId) {
          console.error("No user_id in sessionStorage")
          return
        }

        const response = await axios.get(
          `http://localhost:3000/teachers/subjects?user_id=${userId}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        if (!response.data.success) {
          console.error("❌ Failed to fetch subjects:", response.data.message);
          return;
        }

        this.subjects = response.data.data || [];
        console.log("✅ Subjects fetched:", this.subjects);
      } catch (err) {
        console.error("❌ Failed to fetch teacher subjects:", err);
      }
    },

    goToGrades(subjectId) {
      this.$router.push({ name: "GradesPage", params: { subjectId } });
    },
  },

  mounted() {
    this.fetchTeacherSubjects();
  },
};
</script>

<style scoped>
/* Optional styling */
</style>
