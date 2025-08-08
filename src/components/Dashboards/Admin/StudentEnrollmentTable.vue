<template>

    <div>
        <div>
        <h1>PENDING</h1>
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
                        <th class="p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in pendingStudents" :key="student.id">
                        {{ console.log(student) }}
                        <td class="p-2">{{ student.full_name }}</td>
                        <td class="p-2">{{ student.student_id || 'N/A' }}</td>
                        <td class="p-2">{{ student.email }}</td>
                        <td class="p-2">{{ student.status || 'Pending' }}</td>
                        <td class="p-2">{{ student.enrollment_type }}</td>
                        <td class="p-2">{{ formatDate(student.created_at) }}</td>
                        <td class="py-2">
                            <button
                            v-if="student.status !== 'Enrolled'"
                            @click="approveStudent(student.id)"
                            class="bg-blue-500 text-white px-3 py-1 rounded">
                            Aprove
                            </button>
                            <span v-else class="text-green-600 font-semibold"></span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        </div>
    
        <div>
        <h1>ENROLLED</h1>
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
                        <th class="p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in enrolledStudents" :key="student.id">
                        {{ console.log(student) }}
                        <td class="p-2">{{ student.full_name }}</td>
                        <td class="p-2">{{ student.student_id }}</td>
                        <td class="p-2">{{ student.email }}</td>
                        <td class="p-2">{{ student.status }}</td>
                        <td class="p-2">{{ student.enrollment_type }}</td>
                        <td class="p-2">{{ formatDate(student.created_at) }}</td>
                        <td class="py-2">
                            <button
                            v-if="student.status !== 'approved'"
                            @click="approveStudent(student.id)"
                            class="bg-blue-500 text-white px-3 py-1 rounded">
                            Aprove
                            </button>
                            <span v-else class="text-green-600 font-semibold"></span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        </div>
    </div>
</template>

<script>
import { fetchPendingStudents, fetchEnrolledStudents, approveStudentById,fetchStudents } from '@/composables/utils/api.js'

export default {
    name: 'StudentEnrollmentTable',
    data () {
        return {
            pendingStudents: [],
            enrolledStudents: []
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
        },
        async fetchPendingStudents() {
            const res = await fetchPendingStudents()
            if (res.success) {
                this.pendingStudents = res.data.filter(s => s.status ==='pending')
            }
        },
        async fetchEnrolledStudents() {
        const res = await fetchEnrolledStudents()
        if (res.success) {
            this.enrolledStudents = res.data.filter(s => s.status === 'approved')
        }
        },
        async approveStudent(id) {
            const res = await approveStudentById(id)
            if (res.success) {
                alert(`Approved! Student: ${res.student_id}`)
                await this.fetchPendingStudents()
                await this.fetchEnrolledStudents()
            }
        }
    },
    mounted() {
        this.fetchEnrolledStudents()
        this.fetchPendingStudents()
    }
}
</script>
