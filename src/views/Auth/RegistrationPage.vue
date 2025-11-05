<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="flex flex-col md:flex-row items-center justify-center gap-16 w-full max-w-5xl px-4">
      <!-- Logo -->
      <div class="flex justify-center items-center flex-1">
        <img src="@/assets/img/Logo.png" alt="Logo" class="w-64 md:w-80" />
      </div>

      <!-- Registration form -->
      <div class="flex-1 max-w-md w-full">
        <StudentRegister />
      </div>
    </div>
  </div>
</template>

<script>
import StudentRegister from '@/components/Forms/Registration/StudentRegister.vue';

export default {
  components: {
    StudentRegister,
  },
  data() {
    return {
      activeForm: null,
    };
  },
  methods: {
    goTo(type) {
      if (type === 'student') {
        this.$router.push('/register/student');
      } else if (type === 'teacher') {
        this.$router.push('/register/teacher');
      }
    },
  },
};
</script>
