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

            <!-- Students Table -->
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

                    <!-- Grade input -->
                    <td class="px-4 py-2 text-sm">
                      <input
                        v-model="student.grade"
                        class="border p-1 w-20 rounded"
                        type="text"
                        :disabled="submittedGrades[subject.id]?.[student.id]"
                        @input="saveLocalEdit(subject.id, student.id, student.grade, student.remarks)"
                      />
                    </td>

                    <!-- Remarks input -->
                    <td class="px-4 py-2 text-sm">
                      <input
                        v-model="student.remarks"
                        class="border p-1 w-32 rounded"
                        type="text"
                        :disabled="submittedGrades[subject.id]?.[student.id]"
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

              <!-- Buttons -->
              <div class="mt-4 flex gap-2">
                <!-- Reopen Editing -->
                <button
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  @click="unlockSubject(subject.id)"
                >
                  Reopen Editing
                </button>

                <!-- Cancel Editing -->
                <button
                  v-if="originalValues[subject.id]"
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  @click="cancelEdit(subject.id)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit All -->
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

    <!-- STUDENT VIEW (unchanged) -->
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
      role: sessionStorage.getItem("role") || "teacher",
      subjects: [],
      loading: true,
      error: null,

      localEdits: {},
      submittedGrades: {},     // 🔥 Disable fields
      originalValues: {}        // 🔥 Store originals for Cancel
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

    subjectsByYearSemester() {
      const grouped = {};
      this.subjects.forEach((subject) => {
        const year = subject.year_level || "Unknown";
        const semester =
          subject.semester === "2nd" || subject.semester === "Second"
            ? "2nd"
            : subject.semester === "Midyear"
            ? "Midyear"
            : "1st";

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][semester]) grouped[year][semester] = [];
        grouped[year][semester].push(subject);
      });

      return grouped;
    }
  },

async mounted() {
  this.loading = true;

  try {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_id");

    if (!token) throw new Error("Missing token");
    if (!userId) throw new Error("Missing user_id");

    if (this.role === 'student') {
      await this.fetchStudentGrades();
      return;
    }

    await this.fetchTeacherSubjects(userId);

    const saved = localStorage.getItem("gradeEdits");
    if (saved) {
      this.localEdits = JSON.parse(saved);
      this.applyLocalEditsToSubjects();
    }

  } catch (err) {
    this.error = err.message;
  } finally {
    this.loading = false;
  }
},


  methods: {
    saveLocalEdit(subjectId, studentId, grade, remarks) {
      if (!this.localEdits[subjectId]) this.localEdits[subjectId] = {};
      this.localEdits[subjectId][studentId] = { grade, remarks };
      localStorage.setItem("gradeEdits", JSON.stringify(this.localEdits));
    },

    applyLocalEditsToSubjects() {
      for (const subjectId in this.localEdits) {
        const subject = this.subjects.find(s => s.id == subjectId);
        if (!subject) continue;

        for (const studentId in this.localEdits[subjectId]) {
          const edit = this.localEdits[subjectId][studentId];
          const student = subject.students.find(s => s.id == studentId);
          if (!student) continue;

          student.grade = edit.grade;
          student.remarks = edit.remarks;
        }
      }
    },

    unlockSubject(subjectId) {
      const subject = this.subjects.find(s => s.id == subjectId);
      if (!subject) return;

      this.originalValues[subjectId] = {};

      subject.students.forEach(student => {
        this.originalValues[subjectId][student.id] = {
          grade: student.grade,
          remarks: student.remarks
        };
      });

      delete this.submittedGrades[subjectId];
      alert("Editing unlocked for this subject!");
    },

    cancelEdit(subjectId) {
      const subject = this.subjects.find(s => s.id == subjectId);
      if (!subject || !this.originalValues[subjectId]) return;

      for (const student of subject.students) {
        const orig = this.originalValues[subjectId][student.id];
        if (orig) {
          student.grade = orig.grade;
          student.remarks = orig.remarks;
        }
      }

      this.submittedGrades[subjectId] = {};
      subject.students.forEach(student => {
        this.submittedGrades[subjectId][student.id] = true;
      });

      delete this.localEdits[subjectId];
      localStorage.setItem("gradeEdits", JSON.stringify(this.localEdits));

      delete this.originalValues[subjectId];

      alert("Changes canceled.");
    },

    async submitAllGrades() {
      try {
        const token = sessionStorage.getItem("token");
        const teacherId = Number(sessionStorage.getItem("user_id"));

        if (!teacherId) {
          alert("Teacher ID missing. Please re-login.");
          return;
        }

        const payload = [];

        for (const subjectId in this.localEdits) {
          for (const studentId in this.localEdits[subjectId]) {
            const edit = this.localEdits[subjectId][studentId];

            payload.push({
              subject_id: Number(subjectId),
              student_id: Number(studentId),
              teacher_id: teacherId,
              grade: edit.grade,
              remarks: edit.remarks
            });
          }
        }

        if (payload.length === 0) {
          alert("No changes to submit.");
          return;
        }

        await axios.post(
          "http://localhost:3000/teachers/submit-grades",
          { updates: payload },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        for (const subjectId in this.localEdits) {
          if (!this.submittedGrades[subjectId]) {
            this.submittedGrades[subjectId] = {};
          }
          for (const studentId in this.localEdits[subjectId]) {
            this.submittedGrades[subjectId][studentId] = true;
          }
        }

        localStorage.removeItem("gradeEdits");
        this.localEdits = {};

        alert("Grades submitted successfully!");

      } catch (err) {
        alert("Failed to submit grades.", err);
      }
    },

    async fetchTeacherSubjects(userId) {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/teachers/subjects?user_id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.subjects = (res.data.data || []).map(sub => ({
          ...sub,
          students: Array.isArray(sub.students) ? sub.students : [],
          semester: sub.semester || "1st"
        }));

      } catch (err) {
        this.error = "Failed to fetch subjects";
        this.subjects = [];
        alert (err)
      }
    },

    async fetchStudentGrades() {
  try {
    const token = sessionStorage.getItem("token");
    const schoolId = sessionStorage.getItem("school_id");

    if (!schoolId) {
      console.error("Missing school_id in sessionStorage");
      return;
    }

    const res = await axios.get(
      `http://localhost:3000/students/${schoolId}/grades`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data.data || [];

    // Transform backend result for your front-end table
    this.subjects = data.map(sub => ({
      ...sub,
      students: [
        {
          grade: sub.grade,
          remarks: sub.remarks,
          school_id: schoolId
        }
      ]
    }));

  } catch (err) {
    console.error("Error fetching student grades:", err);
  }
}


  }
};
</script>
