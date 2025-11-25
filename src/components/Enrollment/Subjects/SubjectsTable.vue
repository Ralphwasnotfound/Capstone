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
            <tr v-for="subject in subjects" :key="subject.id">
              <td class="border px-4 py-2">{{ subject.code }}</td>
              <td class="border px-4 py-2">{{ subject.name }}</td>
              <td class="border px-4 py-2">{{ subject.units }}</td>
              <td class="border px-4 py-2">
                <select
                  v-model="subject.selectedTeacherId"
                  class="border rounded px-2 py-1"
                >
                  <option disabled value="">Select Teacher</option>
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.full_name }}
                  </option>
                </select>
              </td>
              <td class="border px-4 py-2 text-center">
                <button
                  @click="addToSelection(subject)"
                  :disabled="!subject.selectedTeacherId || isSelected(subject.id)"
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Add
                </button>
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
        this.selectedSubjects.push({ ...subject });
      }
    },
    async fetchStudentAndSubjects() {
  try {
    const schoolIdParam = this.$route.params.schoolId || this.$route.params.id;
    const token = localStorage.getItem("token");

    // 1️⃣ Fetch student (by school_id)
    const studentRes = await axios.get(
      `http://localhost:3000/students?school_id=${schoolIdParam}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!studentRes.data.data || !studentRes.data.data.length) {
      return alert("Student not found.");
    }

    this.student = 
      studentRes.data.data.find(s => s.school_id === schoolIdParam) ||
      studentRes.data.data[0];

    // Map course name
    const courseMap = { 1: "BSIT", 2: "BSBA", 3: "BSCRIM" };
    this.student.course_name = courseMap[this.student.course_id] || "Unknown";

    // Save school_id to session (student viewing dashboard will need this)
    // sessionStorage.setItem("school_id", this.student.school_id);

    // 2️⃣ Fetch ACTIVE academic year to get correct SEMESTER
    let activeSemester = "1st";
    let activeYearId = null;

    try {
      const yearRes = await axios.get(
        `http://localhost:3000/academic-years/active?school_id=${schoolIdParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (yearRes.data?.data) {
        this.student.activeYear = yearRes.data.data;
        activeSemester = yearRes.data.data.semester;  // <-- CORRECT
        activeYearId = yearRes.data.data.id;
      }
    } catch (err) {
      console.warn("Active academic year not found.");
    }

    // 3️⃣ Determine year_level dynamically
    const yearLevel =
      this.$route.query.year ||
      this.student.year_level ||
      1;

    const semester =
      this.$route.query.semester ||
      activeSemester ||           // <-- FROM academic year, not student table
      "1st";

    // 4️⃣ Fetch subjects for this student's course (dynamic + correct)
    const subjectsRes = await axios.get(
      `http://localhost:3000/subjects/course/${this.student.course_id}?studentId=${schoolIdParam}&year_level=${yearLevel}&semester=${semester}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 5️⃣ Prepare subjects list
    this.subjects = subjectsRes.data.data.map(sub => ({
      ...sub,
      enrolled: false,
      selectedTeacherId: null
    }));

    console.log("✔ Final Dynamic URL Used:");
    console.log(
      `http://localhost:3000/subjects/course/${this.student.course_id}?studentId=${this.student.school_id}&year_level=${yearLevel}&semester=${semester}`
    );

  } catch (err) {
    console.error("Fetch student or subjects failed:", err.response?.data || err);
    alert("Failed to load student or subjects. Check console.");
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

  // Use the student's academic year info
  const academicYearId = this.student.academic_year_id || this.student.activeYear?.id;
  const semester = this.student.semester || this.student.activeYear?.semester || "1st";
  const yearLevel = this.student.year_level || 1;

  if (!academicYearId) {
    return alert("Cannot enroll: Missing academic year. Please contact admin.");
  }

  // Validate teacher selection before sending
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
      academicYearId,
      semester,
      yearLevel
    }))
  };

  
console.log("🔥 FRONTEND — Enrolling student:", this.student.school_id);
console.log("🔥 FRONTEND — Payload:", payload);
console.log("🔥 FINAL USED SCHOOL ID:", this.student.school_id);

  try {
    // ✅ Updated URL to match your backend
    const res = await axios.put(
      `http://localhost:3000/students/${this.student.school_id}/approve`,
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    if (res.status === 207 || (res.data.failedSubjects?.length > 0)) {
      console.warn("Some subjects failed:", res.data.failedSubjects);
      alert(
        `Enrollment completed, but ${res.data.failedSubjects.length} subjects failed. Check console for details.`
      );
    } else {
      alert("Enrolled Successfully!");
    }

    this.selectedSubjects = [];
    await this.fetchStudentAndSubjects();

  } catch (err) {
    console.error("Enrollment Failed:", err.response?.data || err);
    alert("Enrollment Failed. Check console for details.");
  }
}

  }
};
</script>
