<template>
  <form
    @submit.prevent="handleLogin"
    class="space-y-4 max-w-sm mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg"
  >
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
      <button
        type="submit"
        class="bg-[#37555e] text-white px-4 py-2 rounded hover:bg-[#2a4048] transition"
      >
        Login
      </button>

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
import { useUserStore } from '@/stores/users.js'

export default {
  data() {
    return {
      form: { email: '', password: '' }
    }
  },

  mounted() {
    const user = sessionStorage.getItem('user')
    if (user) this.$router.push('/dashboard')
  },

  methods: {
    async handleLogin() {
      try {
        const { success, data, error } = await loginUser(this.form)

        if (!success) {
          alert(`Login failed: ${error}`)
          return
        }

        const userStore = useUserStore()
        const user = data.user
        const token = data.token

        sessionStorage.clear()

        sessionStorage.setItem('user', JSON.stringify(user))
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('role', user.role)
        sessionStorage.setItem('user_id', user.id)

        if (user.role === 'teacher' && user.teacher_id) {
          sessionStorage.setItem('teacher_id', user.teacher_id)
        }

        if (user.role === 'student') {
          sessionStorage.setItem('student_id', user.student_id)

          // 🔥 PROPER WAY TO FETCH school_id
          const res = await fetch(
            `http://localhost:3000/students?user_id=${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          const result = await res.json()

          if (result?.data?.length) {
            sessionStorage.setItem("school_id", result.data[0].school_id)
          }
        }

        userStore.setUser(user, token)

        alert('Login successful!')
        this.$router.push('/dashboard')

      } catch (err) {
        console.error('Login Error:', err)
        alert('Something went wrong during login.')
      }
    }
  }
}
</script>

