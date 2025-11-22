<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
    <h2 class="text-2xl font-bold mb-4">Enrollment Form</h2>

    <p v-if="loading" class="text-gray-500">Loading...</p>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">

      <!-- Name -->
      <div>
        <label class="block font-medium">Full Name</label>
        <input type="text" :value="student.full_name" class="border p-2 rounded w-full" readonly />
      </div>

      <!-- Email -->
      <div>
        <label class="block font-medium">Email</label>
        <input type="email" :value="student.email" class="border p-2 rounded w-full" readonly />
      </div>

      <!-- School ID -->
      <div>
        <label class="block font-medium">School ID</label>
        <input type="text" :value="student.school_id" class="border p-2 rounded w-full" readonly />
      </div>

      <!-- Course Picker -->
      <div>
        <label class="block font-medium">Select Course</label>
        <select v-model="form.course_id" class="border p-2 rounded w-full" required>
          <option disabled value="">Select Course</option>
          <option value="1">BSIT</option>
          <option value="2">BSBA</option>
          <option value="3">BSCRIM</option>
        </select>
      </div>

      <!-- Year Level -->
      <div>
        <label class="block font-medium">Year Level</label>
        <select v-model="form.year_level" class="border p-2 rounded w-full" required>
          <option disabled value="">Select Year</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>

      <!-- Semester + Academic Year -->
      <div v-if="activeYear">
        <p class="text-gray-700">
          Semester: <strong>{{ activeYear.semester }}</strong> |
          Academic Year: <strong>{{ activeYear.year }}</strong>
        </p>
      </div>

      <button type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700">
        Submit Enrollment
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      student: null,
      activeYear: null,
      form: {
        student_id: null,
        school_id: null,
        course_id: "",
        year_level: "",
        academic_year_id: "",
        semester: "",
      },
    };
  },

  async mounted() {
    await this.loadActiveYear();
    await this.loadStudent();
  },

  methods: {
    async loadActiveYear() {
      try {
        const res = await axios.get("http://localhost:3000/academic-years/active", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        this.activeYear = res.data.data;
        this.form.academic_year_id = this.activeYear.id;
        this.form.semester = this.activeYear.semester;
      } catch (err) {
        console.error("Failed to load active academic year:", err);
      }
    },

    async loadStudent() {
      try {
        const userId = sessionStorage.getItem("user_id");
        const token = sessionStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:3000/students?user_id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data.data?.[0];
        if (!data) return alert("Student profile not found.");

        this.student = data;

        // Auto-fill form
        this.form.student_id = data.id;
        this.form.school_id = data.school_id;
        this.form.course_id = data.course_id || "";
      } catch (err) {
        console.error("Failed to load student:", err);
      } finally {
        this.loading = false;
      }
    },

    async handleSubmit() {
      try {
        /* ---------------------------------------------------------
           1) SAVE COURSE ID INTO registration.students TABLE
        ---------------------------------------------------------- */
        const updateCoursePayload = {
          student_id: this.form.student_id,
          course_id: Number(this.form.course_id),
        };

        await axios.post(
          "http://localhost:3000/students/update-course",
          updateCoursePayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✔ Course ID updated in registration.students");

        /* ---------------------------------------------------------
           2) CREATE PENDING ENROLLMENT
        ---------------------------------------------------------- */
        const pendingPayload = {
          student_id: this.form.student_id,
          school_id: this.form.school_id,
          academic_year_id: this.form.academic_year_id,
          semester: this.form.semester,
          year_level: Number(this.form.year_level),
        };

        const res = await axios.post(
          "http://localhost:3000/students/pending",
          pendingPayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.data.success) {
          alert("Enrollment Submitted!");
          this.form.year_level = "";
        } else {
          alert("Enrollment Failed");
        }
      } catch (err) {
        console.error("Enrollment error:", err.response?.data || err);
        alert("Error submitting enrollment.");
      }
    },
  },
};
</script>


