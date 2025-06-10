<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-[40px] font-semibold">Student DashBoard</h1>
      <LogOutButton/>
    </div>
    <!-- Student Profile -->
    <div>
      <div class="flex justify-between">
        <DashboardProfileSettings :showDetails="false"  />
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



export default {
  components:{
    LogOutButton,
    DashboardProfileSettings,
    DashboardSubjectCourses,
    DashboardDigitalIDs 
  }
}
</script>
