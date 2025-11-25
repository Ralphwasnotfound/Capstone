<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow rounded mt-10">
    <h2 class="text-2xl font-bold mb-4">Forgot Password</h2>

    <div class="mb-3">
      <label class="font-medium">Enter your email</label>
      <input
        v-model="email"
        type="email"
        class="w-full border px-3 py-2 rounded mt-1"
        placeholder="you@example.com"
      />
    </div>

    <button
      @click="sendOtp"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2"
    >
      Send OTP
    </button>

    <p class="mt-4 text-gray-600">
      OTP will be sent to your email (simulated — shown in backend console)
    </p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
    };
  },
  methods: {
    async sendOtp() {
      if (!this.email) return alert("Please enter your email.");

      try {
        const res = await axios.post("http://localhost:3000/users/forgot-password", {
          email: this.email,
        });

        alert("OTP sent! Please check your email (backend console).");

        this.$router.push({
          name: "ResetPassword",
          query: { email: this.email },
        });
      } catch (err) {
        console.error(err.response?.data);
        alert(err.response?.data?.error || "Failed to send OTP.");
      }
    },
  },
};
</script>
