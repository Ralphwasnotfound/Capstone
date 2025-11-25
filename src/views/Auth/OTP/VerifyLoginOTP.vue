<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow rounded mt-10">
    <h2 class="text-2xl font-bold mb-4">Verify OTP</h2>

    <input
      v-model="otp"
      class="border w-full px-3 py-2 rounded"
      placeholder="Enter 6-digit OTP"
    />

    <button
      @click="verifyOtp"
      class="w-full bg-blue-600 text-white py-2 rounded mt-4"
    >
      Verify
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      otp: "",
      userId: this.$route.query.userId,
    };
  },
  methods: {
    async verifyOtp() {
      const res = await axios.post("http://localhost:3000/users/verify-login-otp", {
        userId: this.userId,
        otp: this.otp,
      });

      alert("Login Successful!");

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("role", res.data.user.role);

      this.$router.push("/dashboard");
    }
  }
};
</script>
