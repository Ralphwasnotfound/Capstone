<template>
  <div>
    <!-- Profile Header -->
    <div class="py-10 flex items-center gap-10">
      <div
        class="relative w-[150px] h-[150px] rounded-full overflow-hidden"
        :class="{ 'cursor-pointer': isEditing }"
        @click="isEditing ? triggerFileInput() : null"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
      >
        <img
          :src="imageUrl || student.profile_picture || 'https://via.placeholder.com/150'"
          alt="Profile"
          class="w-full h-full object-cover bg-[#7a8e9c]"
        />

        <input
          type="file"
          ref="fileInput"
          @change="onFileChange"
          accept="image/*"
          style="display: none"
        />

        <div
          v-if="isEditing && hovering"
          class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full text-white text-3xl select-none pointer-events-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(173,184,194,1)">
            <path
              d="M20 3C20.5523 3 21 3.44772 21 4V5.757L19 7.757V5H5V13.1L9 9.1005L13.328 13.429L11.9132 14.8422L9 11.9289L5 15.928V19H15.533L16.2414 19.0012L17.57 17.671L18.8995 19H19V16.242L21 14.242V20C21 20.5523 20.5523 21 20 21H4C3.45 21 3 20.55 3 20V4C3 3.44772 3.44772 3 4 3H20ZM21.7782 7.80761L23.1924 9.22183L15.4142 17L13.9979 16.9979L14 15.5858L21.7782 7.80761ZM15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10C14.6716 10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7Z"
            />
          </svg>
        </div>
      </div>

      <div class="flex flex-col">
        <h1 class="text-[60px] text-start">{{ student.full_name }}</h1>
        <h1 class="text-[20px] text-start">
          {{ student.course_id }} <br />{{ student.enrollment_type }} / {{ student.status }}
        </h1>
      </div>
    </div>

    <div>
      <ChangePassword/>
    </div>

    <!-- Profile Details -->
    <div v-if="showDetails" class="space-y-8">
      <button @click="toggleEdit" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
        {{ isEditing ? 'Cancel' : 'Edit Profile' }}
      </button>

      <button
        v-if="isEditing"
        @click="saveProfileData"
        class="mb-4 ml-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        Save Profile
      </button>

      <!-- Example Personal Info Section -->
      <section>
        <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Personal Info</h2>
        <ul class="space-y-2">
          <li>
            <label for="name" class="block font-semibold">Full Name:</label>
            <div v-if="!isEditing">{{ student.full_name }}</div>
            <input v-else v-model="student.full_name" id="name" type="text" class="border rounded p-1 w-full" />
          </li>
          <li>
            <label for="email" class="block font-semibold">Email:</label>
            <div v-if="!isEditing">{{ student.email }}</div>
            <input v-else v-model="student.email" id="email" type="email" class="border rounded p-1 w-full" />
          </li>
          <li>
            <label class="block font-semibold">School ID:</label>
            <div>{{ student.school_id }}</div>
          </li>
          <li>
            <label class="block font-semibold">Status:</label>
            <div>{{ student.status }}</div>
          </li>
          <li>
            <label class="block font-semibold">Enrollment Type:</label>
            <div>{{ student.enrollment_type }}</div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { handleImageupload } from '@/composables/useProfile'
import { useUserStore } from '@/stores/users.js'
import ChangePassword from '@/components/Dashboards/Admin/Passwords/ChangePassword.vue';

export default {
  components: {
    ChangePassword
  },
  props: {
    role: { type: String, required: true },
    showDetails: { type: Boolean, default: true }
  },
  data() {
    return {
      isEditing: false,
      hovering: false,
      imageUrl: null,
      student: {}
    }
  },
  async created() {
    const userStore = useUserStore()
    if (!userStore.user) return

    try {
      const token = sessionStorage.getItem('token') || userStore.token
      const userId = userStore.user.id

      // Fetch student by user_id exactly as your backend returns
      const res = await axios.get(`http://localhost:3000/students?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      this.student = res.data.data[0] || {}
    } catch (err) {
      console.error('Failed to load student:', err)
      this.student = {}
    }
  },
  methods: {
    toggleEdit() {
      this.isEditing = !this.isEditing
    },

    async saveProfileData() {
      try {
        const token = sessionStorage.getItem('token')
        if (!this.student.id) return alert('Student ID missing!')

        // Save using PUT with the actual student.id from GET response
        await axios.put(`http://localhost:3000/students/${this.student.id}`, this.student, {
          headers: { Authorization: `Bearer ${token}` }
        })

        alert('Profile saved successfully!')
        this.isEditing = false
      } catch (err) {
        console.error('Failed to save profile:', err)
        alert('Error saving profile.')
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    onFileChange(e) {
      handleImageupload(e, (url) => {
        this.imageUrl = url
        this.student.profile_picture = url // update profile picture field
      })
    }
  }
}
</script>
