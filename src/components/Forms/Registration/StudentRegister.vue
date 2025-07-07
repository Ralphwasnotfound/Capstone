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
                type="text" 
                class="w-full border p-2 rounded"
                placeholder="Password"
                required>
            </div>

            <div>
                <label for="" class="block mb-1 font-medium">Confirm Password</label>
                <input
                v-model="form.confirmPassword"
                type="text"
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
                required>
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
        handleSubmit() {
            if(this.form.password !== this.form.confirmPassword) {
                alert('Password do not match!')
                return
            }

            console.log('Registering student:', this.form)
            alert('Registration Submitted!')

            // API DATA HERE
        }
    }
}
</script>

<style lang="scss" scoped>

</style>