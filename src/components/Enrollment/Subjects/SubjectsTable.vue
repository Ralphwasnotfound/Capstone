<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">Available Subjects</h2>

    <!-- Loop through year levels -->
    <div v-for="(semesters, year) in groupedSubjects" :key="year" class="mb-8">
      <h3 class="text-lg font-semibold mb-2">Year {{ year }}</h3>

      <!-- Loop through semesters inside the year -->
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
            <tr
              v-for="subject in subjects"
              :key="subject.id"
              :class="subject.enrolled ? 'bg-green-50' : ''"
            >
              <td class="border px-4 py-2">{{ subject.code }}</td>
              <td class="border px-4 py-2">{{ subject.name }}</td>
              <td class="border px-4 py-2">{{ subject.units }}</td>
              <td class="border px-4 py-2">
                <select 
                v-if="!subject.enrolled"
                v-model=subject.selectedTeacherId
                class="border rounded px-2 py-1">
                  <option disabled value="">Select Teacher</option>
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.full_name }}
                  </option>
                </select>
                <span v-else>{{ subject.teacher_name || "Assigned" }}</span>
              </td>
              <td class="border px-4 py-2 text-center">
                <button
                  v-if="!subject.enrolled"
                  @click="addToSelection(subject)"
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
          {{ subject.name }}
        </li>
      </ul>
      <button
        @click="confirmEnrollment"
        class="bg-green-500 text-white px-4 py-2 rounded mt-2"
      >
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
      this.subjects.forEach((subj) => {
        if (!grouped[subj.year_level]) {
          grouped[subj.year_level] = {};
        }
        if (!grouped[subj.year_level][subj.semester]) {
          grouped[subj.year_level][subj.semester] = [];
        }
        grouped[subj.year_level][subj.semester].push(subj);
      });
      return grouped;
    },
  },
  async mounted() {
    await this.fetchStudentAndSubjects();
    await this.fetchTeachers()
  },
  methods: {
    async fetchStudentAndSubjects() {
      try {
        const studentSchoolId = this.$route.params.schoolId;

        // Fetch student
        const studentRes = await axios.get(
          `http://localhost:3000/students/${studentSchoolId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        this.student = studentRes.data;

        if (!this.student.course_id) {
          console.warn("Student has no course_id assigned yet.");
          this.subjects = [];
          return;
        }

        // Fetch subjects by course
        const subjectsRes = await axios.get(
          `http://localhost:3000/subjects/course/${this.student.course_id}?studentId=${this.student.school_id}&year_level=${this.student.year_level}&semester=${this.student.semester || 1}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );


        const enrolledSubjects = this.student.subjects || [];

        this.subjects = subjectsRes.data.data.map((sub) => ({
          ...sub,
          enrolled: enrolledSubjects.some(
            (e) => e.id == sub.id && e.status === 'enrolled'
          ),
          selectedTeacherId: sub.teacher_id || sub.enrolled_teacher_id || null
        }));
      } catch (err) {
        console.error("Error fetching student or subjects:", err);
      }
    },
    async fetchTeachers() {
      try {
        const res = await axios.get("http://localhost:3000/teachers/enrollment/approved", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        this.teachers = res.data.data || []
      } catch (err) {
        console.error("error fetching teachers:", err)
      }
    },

    addToSelection(subject) {
      if (!this.selectedSubjects.some((s) => s.id === subject.id)) {
        this.selectedSubjects.push(subject);
      }
    },
    async confirmEnrollment() {
      if (!this.selectedSubjects.length) 
        return alert("No subjects selected!");

  // Make sure each subject has a teacher
    for (const subj of this.selectedSubjects) {
      if (!subj.selectedTeacherId) {
        return alert(`Please select a teacher for ${subj.name}`);
      }
    }

    const studentSchoolId = this.$route.params.schoolId

    try {
      for (const s of this.selectedSubjects) {
        await axios.put(
          `http://localhost:3000/students/${studentSchoolId}/approve`,
          {
            schoolId: this.student.school_id,
            subjectId: s.id,
            teacherId: s.selectedTeacherId,
            academicYearId: this.student.academic_year_id,
            semester: this.student.semester,
            yearLevel: this.student.year_level
            
          },
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`
            }
          }
        )
      }

      alert("Enrolled Successfully!")
      this.selectedSubjects = []
      await this.fetchStudentAndSubjects()
    } catch (err) {
      console.error("Enrollment Failed:", err.response?.data || err)
      alert("enrollment Failed")
    }
  },
  }
};
</script>
