<template>
  <div class="p-6">
    <!-- TEACHER VIEW -->
    <div v-if="role === 'teacher'">
      <h1 class="text-2xl font-bold mb-6">Your Assigned Subjects</h1>

      <div v-if="loading" class="text-gray-500">Loading subjects...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else>
        <!-- Group by year -->
        <div v-for="(yearSubjects, year) in subjectsByYear" :key="year" class="mb-8">
          <h2 class="text-xl font-semibold mb-4">{{ year }} Year</h2>

          <!-- Each subject card -->
          <div
            v-for="subject in yearSubjects"
            :key="subject.id"
            class="mb-6 border rounded-xl shadow-md bg-white overflow-hidden"
          >
            <!-- Subject Header -->
            <div class="p-4 bg-blue-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-bold text-gray-800">
                  {{ subject.code }} - {{ subject.name }}
                </h2>
                <p class="text-gray-600 text-sm">
                  Units: {{ subject.units }} | Semester: {{ subject.semester || 'N/A' }}
                </p>
              </div>
            </div>

            <!-- Students Table (always visible) -->
            <div class="overflow-x-auto p-4">
              <table class="min-w-full divide-y divide-gray-200 border-t">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Student ID</th>
                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Full Name</th>
                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">School ID</th>
                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Grade</th>
                    <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Remarks</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="(student, i) in subject.students"
                    :key="student.id"
                    :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                  >
                    <td class="px-4 py-2 text-sm">{{ student.id }}</td>
                    <td class="px-4 py-2 text-sm">{{ student.full_name }}</td>
                    <td class="px-4 py-2 text-sm">{{ student.school_id }}</td>
                    <td class="px-4 py-2 text-sm">
                      <input
                        v-model="student.grade"
                        class="border p-1 w-20 rounded"
                        type="text"
                        @input="saveLocalEdit(subject.id, student.id, student.grade, student.remarks)"
                      />
                    </td>
                    <td class="px-4 py-2 text-sm">
                      <input
                        v-model="student.remarks"
                        class="border p-1 w-32 rounded"
                        type="text"
                        @input="saveLocalEdit(subject.id, student.id, student.grade, student.remarks)"
                      />
                    </td>
                  </tr>

                  <tr v-if="subject.students.length === 0">
                    <td colspan="5" class="px-4 py-3 text-center text-gray-500">
                      No students enrolled yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="text-right mt-6">
          <button
            class="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 shadow-md"
            @click="submitAllGrades"
          >
            Submit All Grades
          </button>
        </div>
      </div>
    </div>

    <!-- STUDENT VIEW -->
    <div v-else-if="role === 'student'">
      <h1 class="text-2xl font-bold mb-6">Your Grades</h1>

      <div v-if="loading" class="text-gray-500">Loading subjects...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else>
        <div v-for="(semesters, year) in subjectsByYearSemester" :key="year" class="mb-8">
          <h2 class="text-xl font-semibold mb-4">{{ year }} Year</h2>

          <div v-for="(subjects, semester) in semesters" :key="semester" class="mb-6">
            <h3 class="text-lg font-medium mb-2">{{ semester }} Semester</h3>

            <table class="min-w-full divide-y divide-gray-200 border rounded-lg">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Code</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Subject</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Grade</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Remarks</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">School ID</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="subject in subjects" :key="subject.id">
                  <td class="px-4 py-2 text-sm">{{ subject.code }}</td>
                  <td class="px-4 py-2 text-sm">{{ subject.name }}</td>
                  <td class="px-4 py-2 text-sm">{{ subject.students[0]?.grade || '-' }}</td>
                  <td class="px-4 py-2 text-sm">{{ subject.students[0]?.remarks || '-' }}</td>
                  <td class="px-4 py-2 text-sm">{{ subject.students[0]?.school_id || '-' }}</td>
                </tr>
                <tr v-if="subjects.length === 0">
                  <td colspan="5" class="px-4 py-2 text-center text-gray-500">No subjects found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      role: sessionStorage.getItem("role") || "student",
      subjects: [],
      loading: true,
      error: null,
    };
  },

  computed: {
    subjectsByYear() {
      return this.subjects.reduce((acc, subject) => {
        const year = subject.year_level || "Unknown";
        if (!acc[year]) acc[year] = [];
        acc[year].push(subject);
        return acc;
      }, {});
    },

    // ✅ Added: Proper grouping by Year + Semester
    subjectsByYearSemester() {
      const grouped = {};

      this.subjects.forEach((subject) => {
        const year = subject.year_level || "Unknown";
        const semester =
          subject.semester === "2nd" || subject.semester === "Second"
            ? "2nd"
            : subject.semester === "Midyear"
            ? "Midyear"
            : "1st"; // fallback

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][semester]) grouped[year][semester] = [];

        grouped[year][semester].push(subject);
      });

      return grouped;
    },
  },
  async mounted() {
  this.loading = true;
  this.error = null;

  try {
    const token = sessionStorage.getItem("token");
    let user = JSON.parse(sessionStorage.getItem("user"));
    const role = sessionStorage.getItem("role") || "teacher";

    // If user missing or no user_id, fetch teachers from backend
    if (!user || !user.user_id) {
      const res = await axios.get(`http://localhost:3000/teachers/subjects?users_id=${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.data.length > 0) {
        user = res.data.data[0]; // pick the first teacher
        if (!user.user_id && user.id) user.user_id = user.id; // ensure user_id exists
        sessionStorage.setItem("user", JSON.stringify(user));
      } else {
        throw new Error("No teacher found in backend.");
      }
    }

    // Now we are sure user.user_id exists
    await this.fetchTeacherSubjects(user.user_id);

  } catch (err) {
    console.error("Error initializing teacher subjects:", err);
    this.error = err.message || "Failed to load teacher subjects.";
  } finally {
    this.loading = false;
  }
},

methods: {
  async fetchTeacherSubjects(userId) {
    if (!userId) {
      this.error = "User ID is missing";
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/teachers/subjects?user_id=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Make sure subjects and students arrays exist
      this.subjects = (res.data.data || []).map(sub => ({
        ...sub,
        students: Array.isArray(sub.students) ? sub.students : [],
        semester: sub.semester || "1st",
      }));

      console.log("✅ Subjects fetched:", this.subjects);

    } catch (err) {
      console.error("❌ Failed to fetch teacher subjects:", err);
      this.error = err.response?.data?.error || err.message || "Failed to fetch subjects.";
      this.subjects = [];
    } finally {
      this.loading = false;
    }
  },
}


};
</script>
