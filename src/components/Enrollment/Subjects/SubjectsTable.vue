<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Available Subjects</h2>

    <!-- Subjects grouped by Year -> Semester -->
    <div v-for="(semesters, year) in groupedSubjects" :key="year" class="mb-8">
      <h3 class="text-lg font-semibold mb-2">Year {{ year }}</h3>

      <div v-for="(subjects, semester) in semesters" :key="semester" class="mb-6">
        <h4 class="font-medium mb-2">Semester {{ semester }}</h4>

        <table class="table-auto w-full border mb-4">
          <thead>
            <tr class="bg-gray-100">
              <th class="border px-4 py-2">CODE</th>
              <th class="border px-4 py-2">NAME</th>
              <th class="border px-4 py-2">UNITS</th>
              <th class="border px-4 py-2">INSTRUCTOR</th>
              <th class="border px-4 py-2">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.id" :class="subject.enrolled ? 'bg-green-50' : ''">
              <td class="border px-4 py-2">{{ subject.code }}</td>
              <td class="border px-4 py-2">{{ subject.name }}</td>
              <td class="border px-4 py-2">{{ subject.units }}</td>
              <td class="border px-4 py-2">
                <select
                  v-if="!subject.enrolled"
                  v-model="subject.selectedTeacherId"
                  class="border rounded px-2 py-1"
                >
                  <option disabled value="">Select Teacher</option>
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.full_name }}
                  </option>
                </select>
                <span v-else>{{ subject.teacher_name || 'Assigned' }}</span>
              </td>
              <td class="border px-4 py-2 text-center">
                <button
                  v-if="!subject.enrolled"
                  @click="addToSelection(subject)"
                  :disabled="!subject.selectedTeacherId || isSelected(subject.id)"
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Add
                </button>
                <span v-else class="text-green-600 font-semibold">Enrolled</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Selected Subjects -->
    <div v-if="selectedSubjects.length" class="mt-4">
      <h3 class="font-bold mb-2">Selected Subjects</h3>
      <ul>
        <li v-for="subject in selectedSubjects" :key="subject.id">
          {{ subject.name }} - Teacher: {{ getTeacherName(subject.selectedTeacherId) }}
        </li>
      </ul>
      <button @click="confirmEnrollment" class="bg-green-500 text-white px-4 py-2 rounded mt-2">
        Confirm Enrollment
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      subjects: [],
      selectedSubjects: [],
      student: null,
      teachers: []
    };
  },
  computed: {
    groupedSubjects() {
      const grouped = {};
      this.subjects.forEach(subj => {
        if (!grouped[subj.year_level]) grouped[subj.year_level] = {};
        if (!grouped[subj.year_level][subj.semester]) grouped[subj.year_level][subj.semester] = [];
        grouped[subj.year_level][subj.semester].push(subj);
      });
      return grouped;
    }
  },
  async mounted() {
    await this.fetchStudentAndSubjects();
    await this.fetchTeachers();
  },
  methods: {
    getTeacherName(id) {
      const t = this.teachers.find(t => t.id === id);
      return t ? t.full_name : "N/A";
    },
    isSelected(subjectId) {
      return this.selectedSubjects.some(s => s.id === subjectId);
    },
    addToSelection(subject) {
      if (!this.isSelected(subject.id)) {
        this.selectedSubjects.push(subject);
      }
    },
    async fetchStudentAndSubjects() {
      try {
        const studentId = this.$route.params.schoolId;
        const studentRes = await axios.get(
          `http://localhost:3000/students/${studentId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.student = studentRes.data;

        // Fetch all subjects for the student's course
        const subjectsRes = await axios.get(
          `http://localhost:3000/subjects/course/${this.student.course_id}?studentId=${this.student.school_id}&year_level=${this.student.year_level}&semester=${this.student.semester || 1}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const enrolledSubjects = this.student.subjects || [];

        // Map subjects and mark enrolled ones
        this.subjects = subjectsRes.data.data.map(sub => ({
          ...sub,
          enrolled: enrolledSubjects.some(e => e.subject_id === sub.id && e.enrollment_status === 'enrolled'),
          selectedTeacherId: sub.teacher_id || null
        }));
      } catch (err) {
        console.error("Fetch student or subjects failed:", err);
      }
    },
    async fetchTeachers() {
      try {
        const res = await axios.get("http://localhost:3000/teachers/enrollment/approved", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.teachers = res.data.data || [];
      } catch (err) {
        console.error("Fetch teachers failed:", err);
      }
    },
    async confirmEnrollment() {
      if (!this.selectedSubjects.length) return alert("No subjects selected!");

      // Validate teacher selection
      for (const subj of this.selectedSubjects) {
        if (!subj.selectedTeacherId) {
          return alert(`Please select a teacher for ${subj.name}`);
        }
      }

      const payload = {
        schoolId: this.student.school_id,
        subjects: this.selectedSubjects.map(s => ({
          subjectId: s.id,
          teacherId: s.selectedTeacherId,
          academicYearId: this.student.academic_year_id,
          semester: this.student.semester,
          yearLevel: this.student.year_level
        }))
      };

      try {
        await axios.put(
          `http://localhost:3000/students/${this.student.school_id}/approve`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        alert("Enrolled Successfully!");
        this.selectedSubjects = [];
        await this.fetchStudentAndSubjects();
      } catch (err) {
        console.error("Enrollment Failed:", err.response?.data || err);
        alert("Enrollment Failed. Please check the console for details.");
      }
    }
  }
};
</script>
