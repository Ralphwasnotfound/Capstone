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
  <div v-else class="space-y-6">
    <p v-if="loadingStudent || loadingAcademic" class="text-gray-500">
      Loading your enrollment status...
    </p>

    <div v-else>
      <div v-for="year in Object.keys(academicYearsMap)" :key="year" class="space-y-4">
        <h2 class="text-xl font-bold">{{ year }}</h2>

        <div v-for="semester in ['1st', '2nd']" :key="semester" class="mb-4">

          <!-- Enrollment Buttons -->
          <button
            v-if="!academicYearsMap[year]?.[semester] || !academicYearsMap[year][semester].is_active"
            disabled
            class="bg-red-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full mb-2"
          >
            Enrollment Closed – {{ semester }} Semester
          </button>

          <button
            v-else-if="semesterStatus[year]?.[semester] === 'pending'"
            disabled
            class="bg-yellow-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full mb-2"
          >
            Enrollment Pending – {{ semester }} Semester
          </button>

          <button
            v-else-if="semesterStatus[year]?.[semester] === 'enrolled'"
            disabled
            class="bg-green-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full mb-2"
          >
            ✅ Enrolled – {{ semester }} Semester
          </button>

          <router-link
            v-else
            :to="student?.school_id
              ? `/student-enrollment/student?year=${year}&semester=${semester}`
              : `/student-enrollment?year=${year}&semester=${semester}`"
          >
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full mb-2"
            >
              Enroll Now – {{ semester }}
            </button>
          </router-link>

          <!-- Subjects for this semester -->
          <SubjectsCourses
            v-if="subjectsByYear[year]?.[semester]?.length"
            :subjects="subjectsByYear[year][semester]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import TeacherSubjectsTable from '@/components/Enrollment/Teachers/TeacherSubjectsTable.vue';
import SubjectsCourses from '../Subject&Courses/SubjectsCourses.vue';

export default {
  components: { TeacherSubjectsTable, SubjectsCourses },
  props: { role: { type: String, required: true } },

  data() {
    return {
      student: null,
      subjectsByYear: {},
      semesterStatus: {},
      academicYearsMap: {},
      loadingStudent: true,
      loadingAcademic: true
    };
  },

  methods: {
    async fetchStudent() {
      try {
        const userId = sessionStorage.getItem("user_id");
        const token = sessionStorage.getItem("token");
        if (!userId) return console.error("No user ID found");

        // Fetch student by user_id
        const res = await axios.get(`http://localhost:3000/students?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const studentData = res.data.data?.[0];
        if (!studentData) return console.error("Student not found");
        this.student = studentData;

        // Fetch subjects (already enrolled-only from backend)
        const subjectsRes = await axios.get(
          `http://localhost:3000/students/${studentData.school_id}/subjects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const subjects = subjectsRes.data.data || [];

        // Group subjects by year + semester
        this.subjectsByYear = {};
        this.semesterStatus = {};

        subjects.forEach(sub => {
          // 🔧 FIX: Normalize academic_year completely
          const year = (sub.academic_year || "UnknownYear").trim().replace(/\s+/g, '');

          const semKey = sub.semester === "2nd" ? "2nd" : "1st";

          if (!this.subjectsByYear[year]) {
            this.subjectsByYear[year] = { '1st': [], '2nd': [] };
          }

          if (!this.semesterStatus[year]) {
            this.semesterStatus[year] = { '1st': 'none', '2nd': 'none' };
          }

          this.subjectsByYear[year][semKey].push(sub);
          this.semesterStatus[year][semKey] = 'enrolled';
        });

      } catch (err) {
        console.error('Error fetching student:', err.response || err);
      } finally {
        this.loadingStudent = false;
      }
    },

    async fetchAcademicYears() {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get('http://localhost:3000/enrollment/academicYears', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.data) {
          res.data.data.forEach(y => {
            // 🔧 FIX: Normalize academic year key exactly like subjects
            const yearKey = y.year.trim().replace(/\s+/g, '');
            const semKey = y.semester.toLowerCase().includes('1st') ? '1st' : '2nd';

            if (!this.academicYearsMap[yearKey]) {
              this.academicYearsMap[yearKey] = { '1st': null, '2nd': null };
            }

            this.academicYearsMap[yearKey][semKey] = {
              is_active: y.is_active === 1,
              semester: y.semester,
              enrollment_start: y.enrollment_start,
              enrollment_end: y.enrollment_end
            };
          });
        }

      } catch (err) {
        console.error('Error fetching academic years:', err.response || err);
      } finally {
        this.loadingAcademic = false;
      }
    }
  },

  mounted() {
    if (this.role === 'student') {
      this.fetchStudent();
      this.fetchAcademicYears();
    } else {
      this.loadingStudent = false;
      this.loadingAcademic = false;
    }
  }
};
</script>

