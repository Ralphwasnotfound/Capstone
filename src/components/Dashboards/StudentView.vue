<template>
    <div class="flex flex-row  gap-5">
        <!-- SIDE BAR -->
        <div class="bg-[#073050] flex flex-col items-start p-4 w-[250px] fixed top-0 left-0 h-screen">
            <div class="flex flex-row  items-center w-full mb-6 gap-5">
                <img class="w-[30%] mb-2" src="@/assets/img/Logo.png" alt="Logo">
                <div class="text-white text-center">
                    <h1 class="text-[40px] leading-tight">Campus</h1>
                    <h1 class="text-[40px] leading-tight">Connect</h1>
                </div>
            </div>
            <!-- Buttons -->
            <div class="w-full overflow-y-auto flex flex-col gap-2 pr-2 scrollbar-thin" style="max-height: calc(100vh - 140px)">
                <ButtonDashboard :isActive="activeSection === 'dashboard'" 
                                @click="selectionSection('dashboard')" 
                                to="/dashboard/student"/>
                <ButtonSubjectsCourses :isActive="activeSection === 'subject'" 
                                @click="selectionSection('subject')" 
                                to="/dashboard/student/subject-courses"/>
                <ButtonAttendance :isActive="activeSection === 'attendance'" 
                                @click="selectionSection('attendance')" 
                                to="/dashboard/student/attendance"/>
                <ButtonDigitalID :isActive="activeSection === 'digital'" 
                                @click="selectionSection('digital')" 
                                to="/dashboard/student/digital-IDs"/>
                <ButtonGrades :isActive="activeSection === 'grades'" 
                                @click="selectionSection('grades')" 
                                to="/dashboard/student/grades"/>
                <ButtonAnouncements :isActive="activeSection === 'announcements'" 
                                @click="selectionSection('announcements')" 
                                to="/dashboard/student/announcements"/>
                <ButtonConcernContact :isActive="activeSection === 'contact'" 
                                @click="selectionSection('contact')" 
                                to="/dashboard/student/contact-concern"/>
                <ButtonProfileSettings :isActive="activeSection === 'profile'" 
                                @click="selectionSection('profile')" 
                                to="/dashboard/student/profile-settings"/>
            </div>
        </div>
        
        <div class="flex-1 ml-[250px] p-6 overflow-y-auto h-screen">
            <component :is="currentComputed" :key="activeSection + '-' + componentKey" />
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
import ButtonSubjectsCourses from '../Buttons/DashBoardButtons/ButtonSubjectsCourses.vue';
// Section Components

import DashboardHome from './DashBoardsSideView/DashboardHome.vue';
import DashboardSubjectCourse from './DashBoardsSideView/DashboardSubjectCourses.vue';
import DashboardAttendance from './DashBoardsSideView/DashboardAttendance.vue';
import DashboardDigitalIDs from './DashBoardsSideView/DashboardDigitalIDs.vue';
import DashboardGrades from './DashBoardsSideView/DashboardGrades.vue';
import DashboardAnouncement from './DashBoardsSideView/DashboardAnouncement.vue';
import DashboardConcernContact from './DashBoardsSideView/DashboardConcernContact.vue';
import DashboardProfileSettings from './DashBoardsSideView/DashboardProfileSettings.vue';
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
        // Seection Components
        DashboardHome,
        DashboardSubjectCourse,
        DashboardAttendance,
        DashboardDigitalIDs,
        DashboardGrades,
        DashboardAnouncement,
        DashboardConcernContact,
        DashboardProfileSettings
    },
    data(){
        return{
            activeSection: '',
            componentKey: 0
        }
    },
    computed:{
        currentComputed(){
            switch (this.activeSection) {
                case 'dashboard': 
                    return 'DashboardHome'
                case 'subject':
                    return 'DashboardSubjectCourse' 
                case 'attendance':
                    return 'DashboardAttendance' 
                case 'digital':
                    return 'DashboardDigitalIDs' 
                case 'grades':
                    return 'DashboardGrades' 
                case 'announcements':
                    return 'DashboardAnouncement' 
                case 'contact':
                    return 'DashboardConcernContact' 
                case 'profile':
                    return 'DashboardProfileSettings' 

                default: 
                    return 'DashboardHome'
            }
        }
    },
    methods:{
        selectionSection(section){
            this.activeSection = section
            this.componentKey++
        },
        getSectionFromRoute(){
            const path = this.$route.path
            if (path.includes('subject-courses'))
                return 'subject'
            if (path.includes('attendance'))
                return 'attendance'
            if (path.includes('digital-IDs'))
                return 'digital'
            if (path.includes('grades'))
                return 'grades'
            if (path.includes('announcements'))
                return 'announcements'
            if (path.includes('contact-concern'))
                return 'contact'
            if (path.includes('profile-settings'))
                return 'profile'
            return 'dashboard'
        }
    },
    mounted(){
        this.activeSection = this.getSectionFromRoute()
    },
    watch:{
        '$route.path'(){
            this.activeSection = this.getSectionFromRoute()
        }
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