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

    <div class="flex flex-col gap-3 mt-4">
      <button
        type="submit"
        class="bg-[#37555e] text-white px-4 py-2 rounded hover:bg-[#2a4048] transition"
      >
        Login
      </button>

      <RouterLink to="/register" class="text-center text-[#37555e] font-semibold hover:underline">
        Don’t have an account? Create one
      </RouterLink>

      <router-link to="/forgot-password">
        Forgot Password
      </router-link>
    </div>
  </form>
</template>

<script>
import axios from "axios";
import { useUserStore } from "@/stores/users";

export default {
  data() {
    return {
      form: { email: "", password: "" }
    };
  },

  mounted() {
    const user = sessionStorage.getItem("user");
    if (user) this.$router.push("/dashboard");
  },

  methods: {
    async handleLogin() {
  try {
    const res = await axios.post("http://localhost:3000/users/login", {
      email: this.form.email,
      password: this.form.password
    });

    // 🔥 If OTP is required
    if (res.data.requiresOTP) {
      alert("OTP sent! Check your email (simulated in backend console).");
      this.$router.push({
        path: "/verify-login-otp",
        query: { userId: res.data.userId }
      });
      return;
    }

    // 🔥 If login doesn’t need OTP (fallback)
    const userStore = useUserStore();
    const user = res.data.user;
    const token = res.data.token;

    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", user.role);

    userStore.setUser(user, token);

    alert("Login successful!");
    this.$router.push("/dashboard");

  } catch (err) {
    console.error("Login Error:", err);
    alert(err.response?.data?.error || "Login failed.");
  }
}

  }
};
</script>
