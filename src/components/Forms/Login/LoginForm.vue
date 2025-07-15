<template>
    <form @submit.prevent="handleLogin" class="space-y-4 max-w-sm mx-auto mt-10">
        <h2 class="text-xl font-bold">Login</h2>
        <input 
        v-model="form.email" 
        type="email" 
        placeholder="Email" 
        class="border p-2 w-full"
        required>

        <input
        v-model="form.password" 
        type="password"
        placeholder="Password" 
        class="border p-2 w-full"
        required>

        <button 
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded">
        Login
        </button>
    </form>
</template>

<script>
import { loginUser } from '@/composables/registration'

export default {
    data() {
        return {
            form: {
                email: '',
                password: ''
            }
        }
    },
    methods: {
        async handleLogin() {
            const { success, data, error } = await loginUser(this.form)
            if (success) {
                localStorage.setItem('user', JSON.stringify(data.user))
                localStorage.setItem('role', data.user.role)
                alert('Login successful')
                this.$router.push('/dashboard')
            } else {
                alert(`Login Failed: ${error}`)
            }
        }
    }
}
</script>

<style>

</style>