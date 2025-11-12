<template>
  <div class="p-6">
    <!-- TEACHER VIEW -->
    <div v-if="role === 'teacher'">
      <h1 class="text-2xl font-bold mb-6">Your Assigned Subjects</h1>

      <div v-if="loading" class="text-gray-500">Loading subjects...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else>
        <div v-for="(yearSubjects, year) in subjectsByYear" :key="year" class="mb-8">
          <h2 class="text-xl font-semibold mb-4">{{ year }} Year</h2>

          <div
            v-for="subject in yearSubjects"
            :key="subject.id"
            class="mb-6 border rounded-lg shadow-sm bg-white"
          >
            <!-- Subject header with toggle -->
            <div
              class="p-4 flex justify-between items-center cursor-pointer bg-gray-100 rounded-t-lg"
              @click="subject.isOpen = !subject.isOpen"
            >
              <div>
                <h2 class="text-lg font-semibold">{{ subject.code }} - {{ subject.name }}</h2>
                <p class="text-gray-600 text-sm">Units: {{ subject.units }}</p>
              </div>
              <div class="text-gray-500">
                <span v-if="subject.isOpen">▼</span>
                <span v-else>▶</span>
              </div>
            </div>

            <!-- Students table -->
            <div v-show="subject.isOpen" class="overflow-x-auto p-4">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Student ID</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Full Name</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">School ID</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Grade</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Remarks</th>
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
                    <td colspan="5" class="px-4 py-2 text-center text-gray-500">No students enrolled yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="text-right mt-4">
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            @click="submitAllGrades"
          >
            Submit All Grades
          </button>
        </div>
      </div>
    </div>

    <!-- STUDENT VIEW -->
    <!-- STUDENT VIEW -->
<div v-else-if="role === 'student'">
  <h1 class="text-2xl font-bold mb-6">Your Grades</h1>

  <div v-if="loading" class="text-gray-500">Loading subjects...</div>
  <div v-else-if="error" class="text-red-500">{{ error }}</div>

  <div v-else>
    <div v-for="(yearSubjects, year) in subjectsByYear" :key="year" class="mb-8">
      <h2 class="text-xl font-semibold mb-4">{{ year }} Year</h2>

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
          <tr v-for="subject in yearSubjects" :key="subject.id">
            <!-- Since the student sees only their own grades, pick the first student -->
            <td class="px-4 py-2 text-sm">{{ subject.code }}</td>
            <td class="px-4 py-2 text-sm">{{ subject.name }}</td>
            <td class="px-4 py-2 text-sm">{{ subject.students[0]?.grade || '-' }}</td>
            <td class="px-4 py-2 text-sm">{{ subject.students[0]?.remarks || '-' }}</td>
            <td class="px-4 py-2 text-sm">{{ subject.students[0]?.school_id || '-' }}</td>
          </tr>
          <tr v-if="yearSubjects.length === 0">
            <td colspan="5" class="px-4 py-2 text-center text-gray-500">No subjects found.</td>
          </tr>
        </tbody>
      </table>
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
      error: null
    };
  },
  computed: {
    subjectsByYear() {
      return this.subjects.reduce((acc, subject) => {
        const year = subject.year_level;
        if (!acc[year]) acc[year] = [];
        acc[year].push(subject);
        return acc;
      }, {});
    },
  },
  async mounted() {
  const userRaw = sessionStorage.getItem("user");
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role") || "student";

  if (!userRaw) {
    console.warn("Session user missing. Using test dev data.");
    const testUser = {
      id: 1,
      full_name: "Ralph Joseph Batiancila",
      user_id: 1, // user_id for API
      school_id: "000001",
      teacher_id: 1, // optional for teacher role
      role
    };
    sessionStorage.setItem("user", JSON.stringify(testUser));

    if (!token) {
      sessionStorage.setItem("token", "dev-test-token");
    }

    sessionStorage.setItem("role", role);
  }

  const user = JSON.parse(sessionStorage.getItem("user"));

  try {
    this.loading = true;
    this.error = null;

    if (role === "student") {
      // Step 1: Get student info using user_id
      const studentResp = await axios.get(
        `http://localhost:3000/students?user_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!studentResp.data.data.length) {
        throw new Error("Student not found for this user_id");
      }

      const student = studentResp.data.data[0];
      const schoolId = student.school_id;

      // Step 2: Get grades using school_id
      const gradesResp = await axios.get(
        `http://localhost:3000/students/${schoolId}/grades`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.subjects = gradesResp.data.data.map(subject => ({
        ...subject,
        isOpen: true,
        students: subject.students?.map(s => ({
          ...s,
          grade: s.grade || "",
          remarks: s.remarks || ""
        })) || []
      }));

      // Load saved local edits
      const savedEdits = JSON.parse(localStorage.getItem("grades_edits") || "{}");
      this.subjects.forEach(subject => {
        subject.students.forEach(student => {
          const key = `${subject.id}-${student.id}`;
          if (savedEdits[key]) {
            student.grade = savedEdits[key].grade;
            student.remarks = savedEdits[key].remarks;
          }
        });
      });

    } else if (role === "teacher") {
      // Teacher flow: use teacher_id
      const teacherId = user.teacher_id;
      const endpoint = `http://localhost:3000/teachers/${teacherId}/subjects`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.subjects = response.data.data.map(subject => ({
        ...subject,
        isOpen: true,
        students: subject.students?.map(s => ({
          ...s,
          grade: s.grade || "",
          remarks: s.remarks || ""
        })) || []
      }));

      // Load saved local edits for teacher as well
      const savedEdits = JSON.parse(localStorage.getItem("grades_edits") || "{}");
      this.subjects.forEach(subject => {
        subject.students.forEach(student => {
          const key = `${subject.id}-${student.id}`;
          if (savedEdits[key]) {
            student.grade = savedEdits[key].grade;
            student.remarks = savedEdits[key].remarks;
          }
        });
      });
    }

  } catch (err) {
    console.error("Error fetching subjects:", err);
    this.error = err.response?.data?.error || err.message || "Failed to fetch subjects.";
  } finally {
    this.loading = false;
  }
},

  methods: {
    async fetchSubjects(idParam) {
      try {
        this.loading = true;
        this.error = null;

        const token = sessionStorage.getItem("token");
        const endpoint =
          this.role === "student"
            ? `http://localhost:3000/students/${idParam}/grades`
            : `http://localhost:3000/teachers/${idParam}/subjects`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.subjects = response.data.data.map(subject => ({
          ...subject,
          isOpen: true,
          students: subject.students?.map(student => ({
            ...student,
            grade: student.grade || "",
            remarks: student.remarks || ""
          })) || []
        }));

        // Load saved local edits
        const savedEdits = JSON.parse(localStorage.getItem("grades_edits") || "{}");
        this.subjects.forEach(subject => {
          subject.students.forEach(student => {
            const key = `${subject.id}-${student.id}`;
            if (savedEdits[key]) {
              student.grade = savedEdits[key].grade;
              student.remarks = savedEdits[key].remarks;
            }
          });
        });

      } catch (err) {
        console.error("Error fetching subjects:", err);
        this.error = err.response?.data?.error || err.message || "Failed to fetch subjects.";
      } finally {
        this.loading = false;
      }
    },

    saveLocalEdit(subjectId, studentId, grade, remarks) {
      const savedGrades = JSON.parse(localStorage.getItem("grades_edits") || "{}");
      savedGrades[`${subjectId}-${studentId}`] = { grade, remarks };
      localStorage.setItem("grades_edits", JSON.stringify(savedGrades));
    },

    async submitAllGrades() {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const token = sessionStorage.getItem("token");

        const grades = this.subjects.flatMap(subject =>
          subject.students.map(student => ({
            student_id: student.id,
            subject_id: subject.id,
            teacher_id: user.teacher_id || null,
            grade: student.grade || '',
            remarks: student.remarks || '',
            academic_year_id: student.academic_year_id || 1 // fallback if needed
          }))
        );

        if (!grades.length) {
          alert("No grades to submit.");
          return;
        }

        const response = await axios.post(
          "http://localhost:3000/grades/bulk-update",
          { grades },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          alert("All grades submitted successfully!");
          localStorage.removeItem("grades_edits");
        } else {
          alert("Failed to submit grades: " + (response.data.error || "Unknown error"));
        }

      } catch (err) {
        console.error(err);
        alert("Error submitting grades: " + (err.response?.data?.error || err.message));
      }
    }
  }
};
</script>
