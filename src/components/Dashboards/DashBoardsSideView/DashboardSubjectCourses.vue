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
              Enroll Now – {{ semester }} Semester
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
      subjectsByYear: {},     // { '2025-2026': { '1st': [...], '2nd': [...] } }
      semesterStatus: {},     // { '2025-2026': { '1st': 'enrolled', '2nd': 'pending' } }
      academicYearsMap: {},   // { '2025-2026': { '1st': {is_active}, '2nd': {...} } }
      loadingStudent: true,
      loadingAcademic: true
    };
  },
  methods: {
    async fetchStudent() {
      try {
        const res = await axios.get('http://localhost:3000/students/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.data.success || !res.data.data) return;
        this.student = res.data.data;

        this.subjectsByYear = {};
        this.semesterStatus = {};

        const subjectsData = this.student.subjects || {};
        Object.values(subjectsData).forEach(semesters => {
          Object.entries(semesters).forEach(([semName, subs]) => {
            let semKey = semName.toLowerCase().includes('1st') ? '1st' : '2nd';

            subs.forEach(sub => {
              const year = sub.academic_year;
              if (!this.subjectsByYear[year]) this.subjectsByYear[year] = { '1st': [], '2nd': [] };
              if (!this.semesterStatus[year]) this.semesterStatus[year] = { '1st': 'none', '2nd': 'none' };

              this.subjectsByYear[year][semKey].push({
                ...sub,
                enrollment_status: sub.status || 'pending'
              });

              // Update semesterStatus
              if (sub.status === 'enrolled') this.semesterStatus[year][semKey] = 'enrolled';
              else if (sub.status === 'pending' && this.semesterStatus[year][semKey] !== 'enrolled')
                this.semesterStatus[year][semKey] = 'pending';
            });
          });
        });

        console.log("Subjects by Year:", this.subjectsByYear);
        console.log("Semester Status:", this.semesterStatus);

      } catch (err) {
        console.error('Error fetching student:', err.response || err);
      } finally {
        this.loadingStudent = false;
      }
    },

    async fetchAcademicYears() {
      try {
        const res = await axios.get('http://localhost:3000/enrollment/academicYears', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (res.data.success && res.data.data) {
          res.data.data.forEach(y => {
            const yearKey = y.year;
            const semKey = y.semester.toLowerCase().includes('1st') ? '1st' : '2nd';
            if (!this.academicYearsMap[yearKey]) this.academicYearsMap[yearKey] = { '1st': null, '2nd': null };
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
