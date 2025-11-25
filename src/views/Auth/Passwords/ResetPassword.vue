<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow rounded mt-10">
    <h2 class="text-2xl font-bold mb-4">Reset Password</h2>

    <div class="mb-3">
      <label class="font-medium">Email</label>
      <input
        type="email"
        v-model="email"
        class="w-full border px-3 py-2 rounded"
        placeholder="you@example.com"
      />
    </div>

    <div class="mb-3">
      <label class="font-medium">Enter OTP</label>
      <input
        type="text"
        v-model="otp"
        class="w-full border px-3 py-2 rounded"
        placeholder="6-digit OTP"
      />
    </div>

    <div class="mb-3">
      <label class="font-medium">New Password</label>
      <input
        type="password"
        v-model="newPassword"
        class="w-full border px-3 py-2 rounded"
      />
    </div>

    <button
      @click="resetPassword"
      class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
    >
      Reset Password
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: this.$route.query.email || "",
      otp: "",
      newPassword: "",
    };
  },
  methods: {
    async resetPassword() {
      if (!this.email || !this.otp || !this.newPassword) {
        return alert("All fields are required.");
      }

      try {
        const res = await axios.post("http://localhost:3000/users/reset-password", {
          email: this.email,
          otp: this.otp,
          newPassword: this.newPassword,
        });

        alert("Password reset successful!");

        // 🔥 KEY FIX: Delay redirect to avoid Axios abort error
        setTimeout(() => {
          this.$router.push("/login");
        }, 300);

      } catch (err) {
        console.error("Reset error:", err.response?.data);
        alert(err.response?.data?.error || "Failed to reset password.");
      }
    },
  },
};
</script>
