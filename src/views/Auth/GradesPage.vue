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
          :teacherId="student.teacher_id"
          :subjectId="subjectId"
          :academicYearId="student.academic_year_id"
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
      subjectId: null,
      subjectName: "",
      students: [],
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
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        // Map each student to ensure teacher_id and academic_year_id exist
        this.students = res.data.students.map(s => ({
          ...s,
          teacher_id: s.teacher_id,       // from enrollment
          academic_year_id: s.academic_year_id, // from enrollment
        }));

        this.subjectName = res.data.subjectName || "Subject " + this.subjectId;
      }
    } catch (err) {
      console.error("Failed to fetch enrolled students:", err);
    }
  },
  methods: {
    onGradeSaved(updatedStudent) {
      const idx = this.students.findIndex(
        s => s.id === updatedStudent.id || s.id === updatedStudent.student_id
      );
      if (idx !== -1) {
        this.students[idx] = { ...this.students[idx], ...updatedStudent };
      }
    },
  },
};
</script>
