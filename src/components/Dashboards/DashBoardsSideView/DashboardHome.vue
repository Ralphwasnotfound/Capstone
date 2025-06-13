<template>
  
  <div>
    <div class="flex items-center justify-between">
      <h1 
      class="text-[40px] font-semibold">
      {{ role === 'admin' ? 'Admin Dashboard' : 
          role === 'teacher' ? 'Teacher Dashboard' : 
          'Student Dashboard'  
      }}
      </h1>
      <LogOutButton @click="logout"/>
    </div>

    <!-- Admin  -->
    <div v-if="role === 'admin'">
      <div class="flex justify-between py-2">
        <div class="flex flex-col justify-between">
          <h1>This is the Admin Dashboard</h1>
        </div>
      </div>
    </div>

    <!-- Teacher  -->
    <div v-else-if="role === 'teacher'">
      <div class="flex justify-between py-2">
        <div class="flex flex-col justify-between">
          <h1>This is the teacher Dashboard</h1>
        </div>
      </div>
    </div>
    <!-- Student -->
    <div v-else>
      <div class="flex justify-between py-2">
        <div class="flex flex-col justify-between">
          <DashboardProfileSettings :showDetails="false"  />
          <div class="h-[300px] overflow-y-auto pr-2 ">
            <DashboardAnouncement />
          </div>
        </div>
      <DashboardDigitalIDs flippable />
      </div>
        <DashboardSubjectCourses :showSubject="false" :editable="false"/>
    </div>
  </div>
</template>

<script>
import LogOutButton from '@/components/Buttons/LogOutButton.vue';
import DashboardProfileSettings from './DashboardProfileSettings.vue';
import DashboardSubjectCourses from './DashboardSubjectCourses.vue';
import DashboardDigitalIDs from './DashboardDigitalIDs.vue';
import DashboardAnouncement from './DashboardAnouncement.vue';



export default {
  components:{
    LogOutButton,
    DashboardProfileSettings,
    DashboardSubjectCourses,
    DashboardDigitalIDs,
    DashboardAnouncement 
  },
  props: {
    role: {
      type: String,
      required: true
    }
  },
  methods:{
    logout(){
      localStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 6px;
}
</style>