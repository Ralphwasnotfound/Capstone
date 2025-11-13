<template>
  <div>
    <!-- Profile Settings and Dashboard -->
    <div class="py-10 flex items-center gap-10">
      <div class="relative w-[150px] h-[150px] rounded-full overflow-hidden"
           :class="{'cursor-pointer': isEditing}"
           @click="isEditing ? triggerFileInput() : null"
           @mouseenter="hovering = true"
           @mouseleave="hovering = false">
        <img 
          :src="imageUrl || 'https://via.placeholder.com/150'" 
          alt="Profile"
          class="w-full h-full object-cover bg-[#7a8e9c]" />
        <input type="file"
               ref="fileInput"
               @change="onFileChange" 
               accept="image/*"
               style="display:none" />
      </div>

      <div class="flex flex-col">
        <h1 class="text-[60px]">{{ teacher.full_name }}</h1>
        <h1 class="text-[20px]">{{ teacher.department || 'Not Set' }} <br>{{ teacher.rank || 'Not Set' }} / {{ teacher.specialization || 'Not Set' }}</h1>
      </div>
    </div>

    <!-- Profile Details -->
    <div v-if="showDetails" class="space-y-8">
      <button @click="toggleEdit"
              class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
        {{ isEditing ? 'Cancel' : 'Edit Profile' }}
      </button>

      <button v-if="isEditing"
              @click="saveProfile"
              class="mb-4 ml-2 px-4 py-2 bg-green-600 text-white rounded">
        Save Profile
      </button>

      <section>
        <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Personal Info</h2>
        <ul class="space-y-2">
          <li>
            <label class="block font-semibold">Full Name:</label>
            <div v-if="!isEditing">{{ teacher.full_name }}</div>
            <input v-else v-model="teacher.full_name" type="text" class="border rounded p-1 w-full">
          </li>
          <li>
            <label class="block font-semibold">Email:</label>
            <div v-if="!isEditing">{{ teacher.email }}</div>
            <input v-else v-model="teacher.email" type="email" class="border rounded p-1 w-full">
          </li>
          <li>
            <label class="block font-semibold">Specialization:</label>
            <div v-if="!isEditing">{{ teacher.specialization }}</div>
            <input v-else v-model="teacher.specialization" type="text" class="border rounded p-1 w-full">
          </li>
          <li>
            <label class="block font-semibold">Status:</label>
            <div v-if="!isEditing">{{ teacher.status }}</div>
            <input v-else v-model="teacher.status" type="text" class="border rounded p-1 w-full">
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    showDetails: { type: Boolean, default: true },
  },
  data() {
    return {
      teacher: {},
      imageUrl: null,
      isEditing: false,
      hovering: false,
    };
  },
  async created() {
    const user = JSON.parse(sessionStorage.getItem("user")); // fetch user from sessionStorage
    const token = sessionStorage.getItem("token"); // fetch token from sessionStorage
    if (user && user.id && token) {
      try {
        const res = await axios.get(
          `http://localhost:3000/teachers?user_id=${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } } // token added here
        );
        if (res.data.success && res.data.data.length > 0) {
          this.teacher = res.data.data[0];
        } else {
          console.error("No teacher data found");
        }
      } catch (err) {
        console.error("Error fetching teacher data:", err);
      }
    } else {
      console.error("No user or token in sessionStorage");
    }
  },
  methods: {
    toggleEdit() { this.isEditing = !this.isEditing; },
    saveProfile() { 
      console.log("Saving profile:", this.teacher); 
      this.isEditing = false; 
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) this.imageUrl = URL.createObjectURL(file);
    },
  },
};
</script>
