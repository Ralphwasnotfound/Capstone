<template>
    <div>
        <h1>ENROLLMENT SYSTEM</h1>
        <div>
            <table class="w-full border mt-6">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left">Full Name</th>
                        <th class="p-2 text-left">Student ID</th>
                        <th class="p-2 text-left">Email</th>
                        <th class="p-2 text-left">Status</th>
                        <th class="p-2 text-left">Enrollment Type</th>
                        <th class="p-2 text-left">Date Enrolled</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in students" :key="student.id">
                        <td class="p-2">{{ student.full_name }}</td>
                        <td class="p-2">{{ student.student_id }}</td>
                        <td class="p-2">{{ student.email }}</td>
                        <td class="p-2">{{ student.status }}</td>
                        <td class="p-2">{{ student.enrollment_type }}</td>
                        <td class="p-2">{{ formatDate(student.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { fetchStudents } from '@/composables/utils/api'

export default {
    name: 'StudentEnrollmentTable',
    data () {
        return {
            students: []
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return 'N/A'
            const parsed = new Date(date)
            return parsed.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        async fetchStudents() {
            const res = await fetchStudents()
            if (res.success) {
                this.students = res.data
                console.log('fetched Students:', this.students)
            } else {
                console.error('FETCH students failed:', res.error)
            }
        }
    },
    mounted() {
        console.log('Token before fetch:', localStorage.getItem('token'))
        this.fetchStudents()
    }
}
</script>
