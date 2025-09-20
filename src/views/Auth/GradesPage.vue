<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">Manage Grades - {{ subjectName }}</h2>

    <div v-if="students.length === 0">
      No students enrolled in this subject.
    </div>
    

    <div v-else>
      <div v-for="student in students" :key="student.id" class="mb-4">
        <GradeForm
          :student="student"
          :teacherId="teacherId"
          :subjectId="subjectId"
          :academicYearId="academicYearId"
          @saved="onGradeSaved"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import GradeForm from "@/components/Enrollment/Grades/GradeForm.vue";

export default {
  components: { GradeForm },
  data() {
    return {
      teacherId: null,
      subjectId: null,
      subjectName: "",
      students: [],  // always starts as empty array
      academicYearId: 1, // make dynamic later
    };
  },
  async mounted() {
    this.subjectId = this.$route.params.subjectId;

    if (!this.subjectId) return;

    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `http://localhost:3000/students/subject/${this.subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        this.students = res.data.students; // ✅ fix here
        this.subjectName = "Subject " + this.subjectId;
      }
    } catch (err) {
      console.error("Failed to fetch enrolled students:", err);
    }
  },
  methods: {
    onGradeSaved(updatedStudent) {
      const idx = this.students.findIndex(
        (s) => s.student_id === updatedStudent.student_id
      );
      if (idx !== -1) this.students[idx] = updatedStudent;
    },
  },
};
</script>

