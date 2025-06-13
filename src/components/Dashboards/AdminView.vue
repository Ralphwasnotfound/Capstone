<template>
    <div class="flex flex-row  gap-5">
        <!-- SIDE BAR -->
        <div class="bg-[#073050] flex flex-col items-start p-4 w-[25%] h-[100vh]">
            <div class="flex flex-row  items-center w-full mb-6 gap-5">
                <img class="w-[30%] mb-2" src="@/assets/img/Logo.png" alt="Logo">
                <div class="text-white text-center">
                    <h1 class="text-[40px] leading-tight">Campus</h1>
                    <h1 class="text-[40px] leading-tight">Connect</h1>
                </div>
            </div>
            <!-- Buttons -->
            <div class="w-full overflow-y-auto flex flex-col gap-2 pr-2 scrollbar-thin" style="max-height: calc(100vh - 140px)">
                <ButtonDashboard 
                :isActive="activeSection === 'dashboard'"
                @click="adminSelectSection('dashboard')" 
                to="/dashboard/admin"/>
                <ButtonSubjectsCourses
                :isActive="activeSection === 'subject'"
                @click="adminSelectSection('subject')" 
                to="/dashboard/admin/subject-courses"/>
                <ButtonAttendance
                :isActive="activeSection === 'attendance'"
                @click="adminSelectSection('attendance')" 
                to="/dashboard/admin/attendance"/>
                <ButtonDigitalID
                :isActive="activeSection === 'digital'"
                @click="adminSelectSection('digital')" 
                to="/dashboard/admin/digital-IDs"/>
                <ButtonGrades 
                :isActive="activeSection === 'grades'"
                @click="adminSelectSection('grades')" 
                to="/dashboard/admin/grades"/>
                <ButtonAnouncements
                :isActive="activeSection === 'announcements'"
                @click="adminSelectSection('announcements')" 
                to="/dashboard/admin/announcements"/>
                <ButtonConcernContact 
                :isActive="activeSection === 'contact'"
                @click="adminSelectSection('contact')" 
                to="/dashboard/admin/contact-concern"/>
                <ButtonProfileSettings 
                :isActive="activeSection === 'profile'"
                @click="adminSelectSection('profile')" 
                to="/dashboard/admin/profile-settings"/>
                <ButtonReports 
                :isActive="activeSection === 'reports'"
                @click="adminSelectSection('reports')" 
                to="/dashboard/admin/reports"/>
            </div>
        </div>
        
        <div class="flex-1 p-6 overflow-y-auto h-screen">
            <component :is="currentComputed" :role="'admin'" :key="componentKey" />
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
//Section Components
import DashboardHome from './DashBoardsSideView/DashboardHome.vue';
import DashboardReports from './DashBoardsSideView/DashboardReports.vue';
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
        ButtonReports,
        // SIDE COMPONENTS
        DashboardHome,
        DashboardSubjectCourse,
        DashboardAttendance,
        DashboardDigitalIDs,
        DashboardGrades,
        DashboardAnouncement,
        DashboardConcernContact,
        DashboardProfileSettings,
        DashboardReports
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
                case 'reports':
                    return 'DashboardReports' 

                default: 
                    return 'DashboardHome'
            }
        }
    },
    methods:{
        adminSelectSection(section){
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
            if (path.includes('reports'))
                return 'reports'
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