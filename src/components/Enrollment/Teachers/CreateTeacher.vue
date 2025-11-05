<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Create Teacher Account</h2>

    <form @submit.prevent="createTeacher" class="space-y-3">
      <input
        v-model="email"
        type="email"
        placeholder="Teacher Email"
        class="w-full border p-2 rounded"
        required
      />

      <button
        type="submit"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Create Teacher
      </button>
    </form>

    <p v-if="message" class="mt-4 text-green-600 font-medium">{{ message }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      message: "",
    };
  },
  methods: {
    async createTeacher() {
      try {
        const res = await axios.post("http://localhost:3000/users/create", {
          email: this.email,
        });
        this.message = `${res.data.message} Default Password: ${res.data.defaultPassword}`;
        this.email = "";
      } catch (err) {
        console.error(err);
        this.message = err.response?.data?.error || "Failed to create teacher";
      }
    },
  },
};
</script>
