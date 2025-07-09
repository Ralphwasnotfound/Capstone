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
                required>
            </div>

            <div>
                <label for="" class="block mb-1 font-medium">Email</label>
                <input
                v-model="form.email" 
                type="email" 
                class="w-full border p-2 rounded"
                placeholder="email@gmail.com"
                required>
            </div>

            <div>
                <label for="" class="block mb-1 font-medium">Password</label>
                <input
                v-model="form.password" 
                type="password" 
                class="w-full border p-2 rounded"
                placeholder="Password"
                required>
            </div>

            <div>
                <label for="" class="block mb-1 font-medium">Confirm Password</label>
                <input
                v-model="form.confirmPassword" 
                type="password" 
                class="w-full border p-2 rounded"
                placeholder="Confirm Password"
                required>
            </div>

            <div>
                <label for="" class="block mb-1 font-medium">Department</label>
                <input
                v-model="form.department"
                type="text"
                class="w-full border p-2 rounded"
                placeholder="e.g., Criminology, IT"
                required>
            </div>

            <div class="flex justify-center">
                <button
                type="submit"
                class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
                    Register
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import { registration } from '@/composables/registration';

export default {
    data() {
        return {
            form: {
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                department: '',
            }
        }
    },
    methods: {
        handleSubmit() {
            const success = registration(this.form)
            if (success) {
                this.form.fullName = ''
                this.form.email = ''
                this.form.password = ''
                this.form.confirmPassword = ''
                this.form.department = ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>