<template>
    <div class="max-w-md mx-auto bg-white p-8 rounded shadow mt-10">
        <h2 class="text-2xl font-bold mb-6 text-center">Student Registration</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
                <label for="" class="block mb-1 font-medium">Full Name</label>
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
                type="text" 
                class="w-full border p-2 rounded"
                placeholder="Email@gmail.com"
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
                <label for="" class="block mb-1 font-medium">Contact Number</label>
                <input
                v-model="form.contact" 
                type="text" 
                class="w-full border p-2 rounded"
                placeholder="09XXXXXXXXX"
                >
            </div>

            <div class="flex justify-center">
                <button 
                type="submit"
                class="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 transition">
                    Register
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import { useUserStore } from '@/stores/users';
import { registerStudent } from '@/composables/registration';

export default {
    name: 'StudentRegister',
    data() {
        return {
            form :{
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                contact: ''
            },
        }
    },
    methods: {
        async handleSubmit() {
            if (this.form.password !== this.form.confirmPassword) {
                alert("Password do not match!")
                return
            }

    const payload = {
        full_name: this.form.fullName,
        email: this.form.email,
        password: this.form.password,
        role: 'student',
        contact: this.form.contact,

        // Default values for required student fields
        street: null,
        barangay: null,
        city: null,
        province: null,
        zipcode: null,
        guardian_name: null,
        guardian_contact: null
    }

    const res = await registerStudent(payload)
    const userStore = useUserStore()

    if(res.success) {
        userStore.setUser(res.user)
        localStorage.setItem('token', res.token)
        alert('Registration Successful!')

        this.form.fullName = ''
        this.form.email = ''
        this.form.password = ''
        this.form.confirmPassword = ''
        this.form.contact = ''
    } else {
        alert(`registration Failed: ${res.error}`)
    }
}

    }
}
</script>

<style lang="scss" scoped>

</style>