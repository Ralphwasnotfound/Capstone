<template>
  <div>
    <!-- Profile Settings and Dashboard -->
    <div class="py-10 flex items-center gap-10">
      <!-- Profile Picture -->
      <div class="relative w-[150px] h-[150px] rounded-full overflow-hidden"
           :class="{'cursor-pointer': isEditing}"
           @click="isEditing ? triggerFileInput() : null"
           @mouseenter="hovering = true"
           @mouseleave="hovering = false">
        <img 
          :src="imageUrl || teacher.profile_picture || 'https://via.placeholder.com/150'" 
          alt="Profile"
          class="w-full h-full object-cover bg-[#7a8e9c]" />
        <input type="file"
               ref="fileInput"
               @change="onFileChange" 
               accept="image/*"
               style="display:none" />
      </div>

      <!-- Name / Occupation -->
      <div class="flex flex-col">
        <h1 class="text-[60px]">{{ teacher.full_name }}</h1>
        <h1 class="text-[20px]">{{ teacher.occupation || 'Not Set' }} / {{ teacher.specialization || 'Not Set' }}</h1>
      </div>
    </div>

    <!-- Profile Details Two-Column Layout -->
    <div v-if="showDetails" class="space-y-8">
      <div class="flex gap-4 mb-4">
        <button @click="toggleEdit"
                class="px-4 py-2 bg-blue-600 text-white rounded">
          {{ isEditing ? 'Cancel' : 'Edit Profile' }}
        </button>

        <button v-if="isEditing"
                @click="saveProfile"
                class="px-4 py-2 bg-green-600 text-white rounded">
          Save Profile
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Left Column: Main Info -->
        <section>
          <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Profile Information</h2>
          <ul class="space-y-2">
            <li>
              <label class="block font-semibold">Full Name:</label>
              <input v-model="teacher.full_name" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Age:</label>
              <input v-model="teacher.age" type="number" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Email:</label>
              <input v-model="teacher.email" type="email" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Contact:</label>
              <input v-model="teacher.contact" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Bio:</label>
              <textarea v-model="teacher.bio" class="border rounded p-1 w-full" :disabled="!isEditing"></textarea>
            </li>
            <li>
              <label class="block font-semibold">Occupation:</label>
              <input v-model="teacher.occupation" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Education:</label>
              <input v-model="teacher.education" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Skills:</label>
              <textarea v-model="teacher.skills" class="border rounded p-1 w-full" :disabled="!isEditing"></textarea>
            </li>
            <li>
              <label class="block font-semibold">Specialization:</label>
              <input v-model="teacher.specialization" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
          </ul>
        </section>

        <!-- Right Column: Address Info -->
        <section>
          <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Address</h2>
          <ul class="space-y-2">
            <li>
              <label class="block font-semibold">Street:</label>
              <input v-model="teacher.street" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Barangay:</label>
              <input v-model="teacher.barangay" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">City:</label>
              <input v-model="teacher.city" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Province:</label>
              <input v-model="teacher.province" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
            <li>
              <label class="block font-semibold">Zipcode:</label>
              <input v-model="teacher.zipcode" type="text" class="border rounded p-1 w-full" :disabled="!isEditing">
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: { showDetails: { type: Boolean, default: true } },
  data() {
    return {
      teacher: {},
      imageUrl: null,
      isEditing: false,
      hovering: false,
    };
  },
  async created() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const token = sessionStorage.getItem("token");

    if (user && user.id && token) {
      try {
        const res = await axios.get(
          `http://localhost:3000/teachers?user_id=${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success && res.data.data.length > 0) {
          this.teacher = res.data.data[0];

          // If address exists, split it into separate fields
          if (this.teacher.address) {
            const parts = this.teacher.address.split(",").map(p => p.trim());
            [this.teacher.street, this.teacher.barangay, this.teacher.city, this.teacher.province, this.teacher.zipcode] = parts;
          }

          this.imageUrl = this.teacher.profile_picture || null;
        }
      } catch (err) {
        console.error("Error fetching teacher data:", err);
      }
    }
  },
  methods: {
    toggleEdit() { this.isEditing = !this.isEditing; },
    async saveProfile() {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const token = sessionStorage.getItem("token");
      if (!user || !token) return;

      // Combine address fields into single database column
      this.teacher.address = `${this.teacher.street || ''}, ${this.teacher.barangay || ''}, ${this.teacher.city || ''}, ${this.teacher.province || ''}, ${this.teacher.zipcode || ''}`;

      try {
        const res = await axios.put(
          `http://localhost:3000/teachers/${user.id}`,
          this.teacher,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) this.isEditing = false;
      } catch (err) {
        console.error("Failed to save profile:", err);
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) this.imageUrl = URL.createObjectURL(file);
    },
    triggerFileInput() { this.$refs.fileInput.click(); },
  },
};
</script>
