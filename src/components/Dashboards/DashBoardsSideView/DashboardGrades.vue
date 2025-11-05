<template>
  <div class="p-6">
    <!-- ADMIN -->
    <div v-if="role === 'admin'">
      <h1 class="text-2xl font-bold mb-4">Admin Subject-Courses</h1>
      <p class="text-gray-500">Admin view will be added later.</p>
    </div>

    <!-- TEACHER -->
    <div v-else-if="role === 'teacher'">
      <h1 class="text-2xl font-bold mb-6">Your Assigned Subjects</h1>

      <div v-if="loading" class="text-gray-500">Loading subjects...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else>
        <div
          v-for="subject in subjects"
          :key="subject.subject_id"
          class="mb-6 border rounded-lg shadow-sm bg-white"
        >
          <!-- Subject header with toggle -->
          <div
            class="p-4 flex justify-between items-center cursor-pointer bg-gray-100 rounded-t-lg"
            @click="subject.isOpen = !subject.isOpen"
          >
            <div>
              <h2 class="text-lg font-semibold">
                {{ subject.subject_code }} - {{ subject.subject_name }}
              </h2>
              <p class="text-gray-600 text-sm">
                Year Level: {{ subject.year_level }} | Units: {{ subject.units }}
              </p>
            </div>
            <div class="text-gray-500">
              <span v-if="subject.isOpen">▼</span>
              <span v-else>▶</span>
            </div>
          </div>

          <!-- Students table -->
          <div v-show="subject.isOpen" class="overflow-x-auto p-4">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Student ID</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Full Name</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Grade</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-700">Remarks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="(student, i) in subject.students"
                  :key="student.student_id"
                  :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                >
                  <td class="px-4 py-2 text-sm">{{ student.student_id }}</td>
                  <td class="px-4 py-2 text-sm">{{ student.full_name }}</td>
                  <td class="px-4 py-2 text-sm">
                    <input
                      v-model="student.grade"
                      class="border p-1 w-20 rounded"
                      type="text"
                      @input="saveLocalEdit(subject.subject_id, student.student_id, student.grade, student.remarks)"
                    />
                  </td>
                  <td class="px-4 py-2 text-sm">
                    <input
                      v-model="student.remarks"
                      class="border p-1 w-32 rounded"
                      type="text"
                      @input="saveLocalEdit(subject.subject_id, student.student_id, student.grade, student.remarks)"
                    />
                  </td>
                </tr>

                <tr v-if="subject.students.length === 0">
                  <td colspan="4" class="px-4 py-2 text-center text-gray-500">
                    No students enrolled yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Submit All Button -->
        <div class="text-right mt-4">
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            @click="submitAllGrades"
          >
            Submit All Grades
          </button>
        </div>
      </div>
    </div>

    <!-- STUDENT -->
    <div v-else-if="role === 'student'">
      <h2 class="text-2xl font-bold mb-4">Your Grades</h2>

      <div v-if="loading" class="text-gray-500">Loading your grades...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <table v-else class="w-full border text-left">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2">Subject Code</th>
            <th class="p-2">Subject Name</th>
            <th class="p-2">Grade</th>
            <th class="p-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in students" :key="subject.subject_id">
            <td class="p-2">{{ subject.subject_code }}</td>
            <td class="p-2">{{ subject.subject_name }}</td>
            <td class="p-2">{{ subject.grade ?? '—' }}</td>
            <td class="p-2">{{ subject.remarks ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- OTHER ROLES -->
    <div v-else>
      <p class="text-gray-500">Unauthorized role or missing credentials.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      subjects: [],
      students: [],
      error: null,
      loading: true,
      role: sessionStorage.getItem('role') || null
    }
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
  try {
    const user = JSON.parse(sessionStorage.getItem('user'))
    const token = sessionStorage.getItem('token')

    if (!user || !token) {
      this.error = 'No user or token found.'
      this.loading = false
      return
    }

    // 🧑‍🏫 TEACHER SIDE
    if (this.role === 'teacher') {
      const response = await axios.get(
        `http://localhost:3000/teachers/${user.teacher_id}/subjects`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const savedGrades = JSON.parse(localStorage.getItem('grades_edits') || '{}')

      // 🔧 Map backend fields to frontend expectations
      this.subjects = (response.data.data || []).map(subject => {
        return {
          subject_id: subject.id,
          subject_code: subject.code,
          subject_name: subject.name,
          units: subject.units,
          year_level: subject.year_level,
          students: (subject.students || []).map(student => {
            const saved = savedGrades[`${subject.id}-${student.id}`]
            return {
              student_id: student.id,
              full_name: student.full_name,
              grade: saved?.grade ?? student.grade ?? '',
              remarks: saved?.remarks ?? student.remarks ?? ''
            }
          }),
          isOpen: true
        }
      })
    }

    // 🎓 STUDENT SIDE
    else if (this.role === 'student') {
      const response = await axios.get(
        `http://localhost:3000/grades/student/${user.student_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      this.students = response.data.data || []
    }

  } catch (err) {
    console.error('Error fetching data:', err)
    this.error = err.response?.data?.error || 'Failed to fetch data.'
  } finally {
    this.loading = false
  }
},


    saveLocalEdit(subjectId, studentId, grade, remarks) {
      const savedGrades = JSON.parse(localStorage.getItem('grades_edits') || '{}')
      savedGrades[`${subjectId}-${studentId}`] = { grade, remarks }
      localStorage.setItem('grades_edits', JSON.stringify(savedGrades))
    },

    async submitAllGrades() {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'))
        const token = sessionStorage.getItem('token')
        const academic_year_id = sessionStorage.getItem('academic_year_id') || 1

        const allGrades = []
        this.subjects.forEach(subject => {
          subject.students.forEach(student => {
            allGrades.push({
              student_id: student.student_id,
              subject_id: subject.subject_id,
              teacher_id: user.teacher_id,
              grade: student.grade,
              remarks: student.remarks,
              academic_year_id
            })
          })
        })

        if (!allGrades.length) {
          alert('No grades to submit.')
          return
        }

        const response = await axios.post(
          'http://localhost:3000/grades/bulk-update',
          { grades: allGrades },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (response.data.success) {
          alert('All grades submitted successfully!')
          localStorage.removeItem('grades_edits')
        } else {
          alert('Failed to submit grades: ' + (response.data.error || 'Unknown error'))
        }
      } catch (err) {
        console.error(err)
        alert('Error submitting grades: ' + (err.response?.data?.error || err.message))
      }
    }
  }
}
</script>
