<template>
  <header class="top-0 left-0 w-full bg-white shadow-md z-50">
    <div class="flex justify-between items-center px-8 py-4">
      
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2">
        <img src="@/assets/img/PCC/PCC.png" alt="Logo" class="w-14 md:w-16">
        <span class="text-xl font-bold text-[#37555e] hidden md:block">
          PCC
        </span>
      </RouterLink>

      <!-- Nav + Buttons on Right -->
      <div class="flex items-center gap-8">
        <!-- Nav Links -->
        <nav class="hidden md:flex gap-8 text-lg font-medium text-gray-700 items-center">
          <RouterLink to="/" class="hover:text-[#37555e] transition">Home</RouterLink>

          <!-- Programs Dropdown -->
          <div class="relative group">
            <button class="hover:text-[#37555e] transition">Programs ▾</button>
            <div class="absolute hidden group-hover:block bg-white shadow-md mt-2 rounded w-40 z-50">
              <RouterLink to="/programs/bsit" class="block px-4 py-2 hover:bg-gray-100">BSIT</RouterLink>
              <RouterLink to="/programs/bsed" class="block px-4 py-2 hover:bg-gray-100">BSED</RouterLink>
              <RouterLink to="/programs/bsba" class="block px-4 py-2 hover:bg-gray-100">BSBA</RouterLink>
              <RouterLink to="/programs/bsa" class="block px-4 py-2 hover:bg-gray-100">BSA</RouterLink>
            </div>
          </div>

          <RouterLink to="/enroll" class="hover:text-[#37555e] transition">Enrollment</RouterLink>
          <RouterLink to="/digital-ID" class="hover:text-[#37555e] transition">Digital ID</RouterLink>
          <RouterLink to="/grades" class="hover:text-[#37555e] transition">Grades</RouterLink>
          <RouterLink to="/admin" class="hover:text-[#37555e] transition">Contact & Support</RouterLink>
        </nav>

        <!-- Buttons -->
        <div class="hidden md:flex">
          <LoginButton @click="goToLogin" class="px-4 py-2 text-sm" />
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button class="md:hidden p-2 rounded-lg hover:bg-gray-100">
        ☰
      </button>
    </div>
  </header>
</template>

<script>
import LoginButton from '@/components/Buttons/LoginButton.vue'

export default {
  components: {
    LoginButton,
  },
  methods: {
    goToLogin() {
      this.$router.push('/login')
    },
  }
}
</script>
