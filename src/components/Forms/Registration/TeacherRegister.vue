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
                <label class="block mb-1 font-medium">Upload Credentails</label>
                <input 
                type="file"
                @change="handleFileUpload($event, 'credential')" 
                class="w-full border p-2 rounded">
                required
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

            <div>
                <label class="block mb-1 font-medium">Upload Valid ID</label>
                <input 
                    type="file"
                    @change="handleFileUpload($event, 'id')" 
                    class="w-full border p-2 rouned"
                    required>
            </div>

            <div class="flex justify-center">
                <button
                    type="submit"
                    :disabled="loading"
                    class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                >
                    {{ loading ? "Registering..." : "Register" }}
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import { registerTeacher } from '@/composables/registration'

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
                credential: null,
                id: null
            },
            loading: false
        }
    },
    methods: {
        handleFileUpload(event, field) {
            this.form[field] = event.target.files[0]
        },
        async handleSubmit() {
            if (this.form.password !== this.form.confirmPassword) {
                alert("Passwords do not match!")
                return
            }
            this.loading = true
            const formData = new FormData()

            formData.append("full_name", this.form.fullName)
            formData.append("email", this.form.email)
            formData.append("password", this.form.password)
            formData.append("contact", this.form.contact)
            formData.append("specialization", this.form.specialization)
            formData.append("credential", this.form.credential)
            formData.append("id", this.form.id)

            const { success, error} = await registerTeacher(formData, true)

            if (success) {
                alert('Registration Successful!')
                this.form = {
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    contact: '',
                    specialization: '',
                    credential: null,
                    id: null
                }
            } else {
                alert(`Registration Failed:${error}`)
            }

            this.loading = false
        }
    }
}
</script>
