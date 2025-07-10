<template>
<div class="max-w-xl mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Old Student Re-Enrollment Form</h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
        <label class="block mb-1 font-medium">Student ID</label>
        <input v-model="form.student_id" type="text" class="w-full border p-2 rounded" required />
    </div>

    <div>
        <label class="block mb-1 font-medium">Full Name</label>
        <input v-model="form.full_name" type="text" class="w-full border p-2 rounded" required />
    </div>

    <div>
        <label class="block mb-1 font-medium">Email</label>
        <input v-model="form.email" type="email" class="w-full border p-2 rounded" required />
    </div>

        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Re-Enroll</button>
    </form>
</div>
</template>

<script>
import { submitEnrollment, fetchStudents } from '@/composables/utils/api';

export default {
    name: 'OldStudentForm',
    data() {
        return {
            form: {
            student_id: '',
            full_name: '',
            email: ''
            },
            students: []
        }
    },
    methods: {
        async handleSubmit() {
            const payload = {
                student_id: this.form.student_id,
                full_name: this.form.full_name,
                email: this.form.email,
                enrollment_type: 'old',
            }
            const { success } = await submitEnrollment(payload)

            if (success) {
                alert('Enrollment Submitted!')
                this.form.student_id = ''
                this.form.full_name = ''
                this.form.email = ''
                this.loadStudents()
            } else {
                alert('Submission Failed. Please try Again')
            }
        },
        async loadStudents() {
            const { success, data } = await fetchStudents()
            if (success) {
                this.student =  data
            }
        }
    },
    mounted() {
        this.loadStudents()
    }

}
</script>
