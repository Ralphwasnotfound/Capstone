<template>
  <div class="max-w-md p-4 bg-white rounded shadow mx-auto mt-4">

    <h2 class="text-xl font-bold mb-4">Change Password</h2>

    <div class="mb-3">
      <label class="block font-medium">Current Password</label>
      <input
        type="password"
        v-model="currentPassword"
        class="w-full border px-3 py-2 rounded"
      />
    </div>

    <div class="mb-3">
      <label class="block font-medium">New Password</label>
      <input
        type="password"
        v-model="newPassword"
        class="w-full border px-3 py-2 rounded"
      />
    </div>

    <div class="mb-4">
      <label class="block font-medium">Confirm New Password</label>
      <input
        type="password"
        v-model="confirmPassword"
        class="w-full border px-3 py-2 rounded"
      />
    </div>

    <button
      @click="updatePassword"
      class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
    >
      Update Password
    </button>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  },
  methods: {
    async updatePassword() {
      if (!this.currentPassword || !this.newPassword) {
        return alert("Please fill out all fields.");
      }

      if (this.newPassword !== this.confirmPassword) {
        return alert("New passwords do not match.");
      }

      try {
        const token = localStorage.getItem("token");

        await axios.put(
          "http://localhost:3000/users/change-password",
          {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Password updated successfully!");
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";

      } catch (err) {
        console.error("Password change error:", err.response?.data);
        alert(err.response?.data?.error || "Failed to update password.");
      }
    },
  },
};
</script>
