<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h2 class="text-2xl font-bold mb-4">Teacher's Subjects</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead class="bg-green-500 text-white">
          <tr>
            <th class="py-3 px-6 text-left">Subject Code</th>
            <th class="py-3 px-6 text-left">Subject Name</th>
            <th class="py-3 px-6 text-left">Units</th>
            <th class="py-3 px-6 text-left">Year Level</th>
            <th class="py-3 px-6 text-left">Enrolled Students</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="subject in subjects"
            :key="subject.id"
            class="border-b hover:bg-gray-100"
          >
            <td class="py-2 px-6">{{ subject.code }}</td>
            <td class="py-2 px-6">{{ subject.name }}</td>
            <td class="py-2 px-6">{{ subject.units }}</td>
            <td class="py-2 px-6">{{ subject.year_level }}</td>
            <td class="py-2 px-6">
              <ul class="list-disc pl-5">
                <li v-for="student in subject.students" :key="student.id">
                  {{ student.full_name }}
                </li>
              </ul>
            </td>
            <td class="py-2 px-6">
              <button
                  @click="goToGrades(subject.id)"
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                  Manage Grades
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
import axios from 'axios'

    export default {
        name: 'TeacherSubjectsTable',
        data() {
            return {
                subjects: [],
                token: localStorage.getItem('token') || ''
            }
        },
        methods: {
            async fetchTeacherSubjects() {
                try {
                    const teacherId = 1
                    const response = await axios.get(`http://localhost:3000/teachers/${teacherId}/subjects`,{
                        headers: { Authorization: `Bearer ${this.token}` }
                    })
                        
                    this.subjects = response.data.data
                } catch (err) {
                    console.error('Failed to fetch subjects:', err)
                } 
            },
            goToGrades(subjectId) {
              this.$router.push({ name: 'GradesPage', params: {subjectId} })
            }
        },
        mounted() {
            this.fetchTeacherSubjects()
        }
    }
</script>

<style lang="scss" scoped>

</style>