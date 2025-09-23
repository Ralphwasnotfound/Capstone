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

    <!-- Enrollment closed -->
    <p v-else-if="!academicYearActive" class="text-red-600 font-semibold">
      Enrollment is currently closed for this academic year.
    </p>

    <!-- Pending -->
    <p v-else-if="isPending" class="text-yellow-600 font-semibold">
      Your enrollment is pending approval.
    </p>

    <!-- Enrolled -->
    <p v-else-if="isEnrolled && activeYear" class="text-green-600 font-semibold">
      You are enrolled for the current semester: {{ activeYear.semester }} ({{ activeYear.year }})
    </p>

    <!-- Enroll button -->
    <router-link
      v-if="!isEnrolled && academicYearActive && !isPending"
      to="/student-enrollment"
    >
      <button
        :class="buttonClass"
        class="text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition duration-200"
      >
        Enroll Now
      </button>
    </router-link>

    <!-- Student subjects -->
    <SubjectsCourses v-if="isEnrolled" />
  </div>
</template>

<script>
import TeacherSubjectsTable from '@/components/Enrollment/Teachers/TeacherSubjectsTable.vue';
import SubjectsCourses from '../Subject&Courses/SubjectsCourses.vue';
import api, { fetchActiveAcademicYear } from '@/composables/utils/api';

export default {
  components: { TeacherSubjectsTable, SubjectsCourses },
  props: { role: { type: String, required: true } },
  data() {
    return {
      isEnrolled: false,
      isPending: false,
      academicYearActive: false,
      activeYear: null,
      loading: true
    };
  },
  computed: {
    buttonClass() {
      if (!this.academicYearActive) return 'bg-red-500 hover:bg-red-600';
      if (this.isEnrolled) return 'bg-green-500 hover:bg-green-600';
      if (this.isPending) return 'bg-yellow-500 hover:bg-yellow-600';
      return 'bg-blue-500 hover:bg-blue-600';
    }
  },
  async mounted() {
    console.log('Fetching student status and active academic year...');
    
    // Fetch student status
    if (this.role === 'student') {
      try {
        const resStudent = await api.get('/students/me');
        const status = resStudent.data?.data?.status;
        this.isEnrolled = status === 'enrolled';
        this.isPending = status === 'pending';
        console.log('Student status:', status);
      } catch (err) {
        console.error('Error fetching student info:', err);
      }

      // Fetch active academic year
      try {
        const resYear = await fetchActiveAcademicYear();
        console.log('Active academic year response:', resYear);

        if (resYear.success && resYear.data) {
          this.academicYearActive = resYear.data.is_active === 1;
          this.activeYear = resYear.data;
        } else {
          this.academicYearActive = false;
          this.activeYear = null;
        }
      } catch (err) {
        console.error('Error fetching active academic year:', err);
        this.academicYearActive = false;
        this.activeYear = null;
      } finally {
        this.loading = false;
      }
    } else {
      // Admin/teacher don't need these checks
      this.loading = false;
    }
  }
};
</script>
