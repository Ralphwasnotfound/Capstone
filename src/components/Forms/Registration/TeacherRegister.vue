<template>
    <div class="max-w-md mx-auto bg-white p-8 rounded shadow mt-10">
        <h2 class="text-2xl font-bold mb-6 text-center">Teacher Registration</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
                <label class="block mb-1 font-medium">Full Name</label>
                <input 
                    v-model="form.fullName"
                    type="text" 
                    class="w-full border p-2 rounded"
                    placeholder="Full Name"
                    required
                >
            </div>

            <div>
                <label class="block mb-1 font-medium">Email</label>
                <input
                    v-model="form.email" 
                    type="email" 
                    class="w-full border p-2 rounded"
                    placeholder="email@gmail.com"
                    required
                >
            </div>

            <div>
                <label class="block mb-1 font-medium">Password</label>
                <input
                    v-model="form.password" 
                    type="password" 
                    class="w-full border p-2 rounded"
                    placeholder="Password"
                    required
                >
            </div>

            <div>
                <label class="block mb-1 font-medium">Confirm Password</label>
                <input
                    v-model="form.confirmPassword" 
                    type="password" 
                    class="w-full border p-2 rounded"
                    placeholder="Confirm Password"
                    required
                >
            </div>

            <div>
                <label class="block mb-1 font-medium">Specialization</label>
                <input
                    v-model="form.specialization"
                    type="text"
                    class="w-full border p-2 rounded"
                    placeholder="e.g. Mathematics, English"
                >
            </div>

            <div>
                <label class="block mb-1 font-medium">Credentials</label>
                <textarea
                    v-model="form.credentials"
                    class="w-full border p-2 rounded"
                    placeholder="e.g. Master's Degree, 5 years teaching experience"
                ></textarea>
            </div>

            <div>
                <label class="block mb-1 font-medium">Contact Number</label>
                <input
                    v-model="form.contact" 
                    type="text" 
                    class="w-full border p-2 rounded"
                    placeholder="09XXXXXXXXX"
                    required
                >
            </div>

            <div class="flex justify-center">
                <button
                    type="submit"
                    class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                >
                    Register
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import { registration, registerTeacher } from '@/composables/registration'

export default {
    data() {
        return {
            form: {
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                contact: '',
                specialization: '',
                credentials: ''
            }
        }
    },
    methods: {
        async handleSubmit() {
            const isValid = registration(this.form)
            if (!isValid) return

            // Split payloads: user fields vs teacher fields
            const payload = {
                user: {
                    full_name: this.form.fullName,
                    email: this.form.email,
                    password: this.form.password,
                    role: 'teacher'
                },
                teacher: {
                    contact: this.form.contact,
                    specialization: this.form.specialization,
                    credentials: this.form.credentials
                }
            }

            const { success, error } = await registerTeacher(payload)

            if (success) {
                alert('Registration Successful!')
                this.form = {
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    contact: '',
                    specialization: '',
                    credentials: ''
                }
            } else {
                alert(`Registration Failed: ${error}`)
            }
        }
    }
}
</script>
