<template>
  <!-- ADMIN -->
  <div v-if="role === 'admin'">
    <h1 class="text-2xl font-bold">Admin Subject-Courses</h1>
  </div>

  <!-- TEACHER -->
  <div v-else-if="role === 'teacher'">
    <TeacherSubjectsTable />
  </div>

  <!-- STUDENT -->
  <div v-else class="space-y-4">
    <!-- Loading -->
    <p v-if="loading" class="text-gray-500">Loading your enrollment status...</p>

    <div v-else>
      <!-- Enrollment closed -->
      <button
        v-if="!academicYearActive"
        disabled
        class="bg-red-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full"
      >
        Enrollment Closed – Wait for the next semester
      </button>

      <!-- Semester-specific buttons -->
      <div v-else>
        <div v-for="sem in ['1st', '2nd']" :key="sem" class="mb-2">
          <button
            v-if="semesterStatus[sem] === 'pending'"
            disabled
            class="bg-yellow-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full"
          >
            Enrollment Pending – {{ sem }} Semester
          </button>

          <button
            v-else-if="semesterStatus[sem] === 'enrolled'"
            disabled
            class="bg-green-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full"
          >
            ✅ Enrolled – {{ sem }} Semester
          </button>

          <router-link v-else :to="`/student-enrollment?semester=${sem}`">
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full"
            >
              Enroll Now – {{ sem }} Semester
            </button>
          </router-link>
        </div>
      </div>

      <!-- Show subjects after enrolled in any semester -->
      <SubjectsCourses v-if="subjects.length" :subjects="subjects" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { fetchActiveAcademicYear } from '@/composables/utils/api';
import TeacherSubjectsTable from '@/components/Enrollment/Teachers/TeacherSubjectsTable.vue';
import SubjectsCourses from '../Subject&Courses/SubjectsCourses.vue';

export default {
  components: { TeacherSubjectsTable, SubjectsCourses },
  props: { role: { type: String, required: true } },
  data() {
    return {
      semesterStatus: {},       // { '1st': 'pending', '2nd': 'enrolled' }
      academicYearActive: false,
      activeYear: null,
      loading: true,
      studentFound: true,
      subjects:[]
    };
  },
  methods: {
    async loadStudentStatus() {
      this.loading = true;
      this.semesterStatus = {};
      this.academicYearActive = false;
      this.activeYear = null;
      this.studentFound = true;
   

      try {
        // 1️⃣ Get active academic year
        const resYear = await fetchActiveAcademicYear();
        if (resYear.success && resYear.data) {
          this.activeYear = resYear.data;
          this.academicYearActive = resYear.data.is_active === 1;
        }

        // 2️⃣ Get student with subjects/enrollments using plain axios
        const token = localStorage.getItem('token');
        const resStudent = await axios.get('http://localhost:3000/students/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!resStudent.data.success || !resStudent.data.data) {
          this.studentFound = false;
          return;
        }

        const student = resStudent.data.data;

        if (student.subjects) {
          this.subjects = student.subjects
          .filter(sub => sub.enrollment_status)
          .map(sub => ({
            ...sub,
            semester: sub.semester || 'N/A',
            enrollment_status: sub.enrollment_status || 'pending'
          }))

          for (const sub of this.subjects) {
            const sem = sub.semester
            if (!this.semesterStatus[sem] || this.semesterStatus[sem] !== 'enrolled') {
              this.semesterStatus[sem] = sub.enrollment_status
            }
          }
        }
      } catch (err) {
        console.error('Error loading student status:', err.response?.data || err.message);
        this.studentFound = false;
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    if (this.role === 'student') {
      this.loadStudentStatus();
    } else {
      this.loading = false;
    }
  },
};

</script>
