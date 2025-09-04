<template>
    <div>
        <component :is="dashboardComponent"/>
    </div>
</template>

<script>
import AdminDashBoard from '@/components/Dashboards/AdminView.vue';
import StudentDashBoard from '@/components/Dashboards/StudentView.vue';
import TeacherDashBoard from '@/components/Dashboards/TeacherView.vue';

export default {
    components:{
        StudentDashBoard,
        TeacherDashBoard,
        AdminDashBoard
    },
    data(){
        return{
        }
    },
    computed:{
        role(){
            return sessionStorage.getItem('role') || null
        },
        dashboardComponent(){
            switch(this.role){
                case 'student':
                    return StudentDashBoard
                case 'teacher':
                    return TeacherDashBoard
                case 'admin':
                    return AdminDashBoard
                default: 
                    return null
            }
        }
    },
    created(){
        const role = sessionStorage.getItem('role')
        const validRoles = ['student','teacher','admin']

        if(!validRoles.includes(role)){
            this.$router.push('/login')
        }
    }
}
</script>

<style lang="scss" scoped>

</style>