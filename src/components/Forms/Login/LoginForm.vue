<template>
  <form @submit.prevent="handleLogin" class="space-y-4 max-w-sm mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold text-center mb-4 text-[#37555e]">Login</h2>

    <!-- Email -->
    <input 
      v-model="form.email" 
      type="email" 
      placeholder="Email" 
      class="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-[#37555e]"
      required
    />

    <!-- Password -->
    <input
      v-model="form.password" 
      type="password"
      placeholder="Password" 
      class="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-[#37555e]"
      required
    />

    <!-- Buttons -->
    <div class="flex flex-col gap-3 mt-4">
      <!-- Login button -->
      <button 
        type="submit"
        class="bg-[#37555e] text-white px-4 py-2 rounded hover:bg-[#2a4048] transition"
      >
        Login
      </button>

      <!-- Register redirect -->
      <RouterLink 
        to="/register" 
        class="text-center text-[#37555e] font-semibold hover:underline"
      >
        Don’t have an account? Create one
      </RouterLink>
    </div>
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
        sessionStorage.setItem('user', JSON.stringify(data.user))
        sessionStorage.setItem('role', data.user.role)
        alert('Login successful')
        this.$router.push('/dashboard')
    } else {
        alert(`Login Failed: ${error}`)
      }
    }
  }
}
</script>
