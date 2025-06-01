<template>
    <div class="flex flex-row  gap-5">
        <!-- SIDE BAR -->
        <div class="bg-[#073050] flex flex-col items-start p-4 w-[25%] h-screen">
            <div class="flex flex-row  items-center w-full mb-6 gap-5">
                <img class="w-[30%] mb-2" src="@/assets/img/Logo.png" alt="Logo">
                <div class="text-white text-center">
                    <h1 class="text-[40px] leading-tight">Campus</h1>
                    <h1 class="text-[40px] leading-tight">Connect</h1>
                </div>
            </div>
            <!-- Buttons -->
            <div class="w-full overflow-y-auto flex flex-col gap-2 pr-2 scrollbar-thin" style="max-height: calc(100vh - 140px)">
                <ButtonDashboard/>
                <ButtonSubjectsCourses/>
                <ButtonAttendance/>
                <ButtonDigitalID/>
                <ButtonGrades/>
                <ButtonAnouncements/>
                <ButtonConcernContact/>
                <ButtonProfileSettings/>
                <ButtonReports/>
            </div>
        </div>
        
        <div class="flex-1 p-6">
            <h1 class="text-[40px]">Teacher Dashboard</h1>
        </div>
    </div>
</template>

<script>
import ButtonAnouncements from '../Buttons/DashBoardButtons/ButtonAnouncements.vue';
import ButtonAttendance from '../Buttons/DashBoardButtons/ButtonAttendance.vue';
import ButtonConcernContact from '../Buttons/DashBoardButtons/ButtonConcernContact.vue';
import ButtonDashboard from '../Buttons/DashBoardButtons/ButtonDashboard.vue';
import ButtonDigitalID from '../Buttons/DashBoardButtons/ButtonDigitalID.vue';
import ButtonGrades from '../Buttons/DashBoardButtons/ButtonGrades.vue';
import ButtonProfileSettings from '../Buttons/DashBoardButtons/ButtonProfileSettings.vue';
import ButtonReports from '../Buttons/DashBoardButtons/ButtonReports.vue';
import ButtonSubjectsCourses from '../Buttons/DashBoardButtons/ButtonSubjectsCourses.vue';

export default {
    components:{
        ButtonDashboard, 
        ButtonAttendance,
        ButtonDigitalID,
        ButtonGrades,
        ButtonSubjectsCourses,
        ButtonAnouncements,
        ButtonConcernContact,
        ButtonProfileSettings,
        ButtonReports
    }
}
</script>

<style  scoped>
.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3); 
    border-radius: 10px;
}

.scrollbar-thin {
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

</style>