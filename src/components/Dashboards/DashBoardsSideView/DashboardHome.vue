<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-[40px] font-semibold">Student DashBoard</h1>
      <LogOutButton/>
    </div>
    <!-- Student Profile -->
    <div>
      <DashboardProfileSettings :showDetails="false"/>
      
    </div>
  </div>
</template>

<script>
import LogOutButton from '@/components/Buttons/LogOutButton.vue';
import DashboardProfileSettings from './DashboardProfileSettings.vue';

export default {
  components:{
    LogOutButton,
    DashboardProfileSettings
  }
}
</script>
