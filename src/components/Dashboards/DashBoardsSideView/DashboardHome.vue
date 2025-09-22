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
      <AcademicYears/>
      <div class="flex justify-between py-2">
        
        <div class="flex flex-col justify-between">
          <UserTable :users="users" @user-deleted="removeUser"/>
          <div class="py-2">
            <router-link to="/admin/enrollments">
              <button
              class="bg-blue-500 text-white px-3 py-1 rounded"
              >Enrollments</button>
            </router-link>
          </div>

          <div>
            <router-link to="/admin/approval/teachers">
              <button
              class="bg-green-500 text-white px-3 py-1 rounded">Teachers</button>
            </router-link>
          </div>
          <div class="py-2">
            <router-link to="/admin/approval/students">
              <button
              class="bg-green-500 text-white px-3 py-1 rounded">Students</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Teacher  -->
    <div v-else-if="role === 'teacher'">
      <div class="flex justify-between py-2">
        <div class="flex flex-col justify-between">
          <DashboardProfileSettings :showDetails="false" :role="role"/>
        </div>
      </div>
    </div>
    
    <!-- Student -->
    <div v-else>
      <div class="flex justify-between py-2">
        <div class="flex flex-col justify-between">
          <DashboardProfileSettings :showDetails="false" :role="role"  />
          <div class="h-[300px] overflow-y-auto pr-2 ">
            <DashboardAnouncement />
          </div>
        </div>
        <div>
          <DashboardDigitalIDs flippable />
        </div>
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
import UserTable from '../Admin/UserTable.vue';
import { fetchUsers } from '@/composables/utils/api';
import { fetchStudents } from '@/composables/utils/api';
import AcademicYears from '@/components/Forms/Years/AcademicYears.vue';



export default {
  components:{
    LogOutButton,
    DashboardProfileSettings,
    DashboardSubjectCourses,        
    DashboardDigitalIDs,
    DashboardAnouncement,
    UserTable,
    AcademicYears
  },
  props: {
    role: {
      type: String,
      required: true
    }
  },
  methods:{
    logout(){
      sessionStorage.clear()
      this.$router.push('/login')
    },
    remove(id) {
      this.users = this.users.filter(user => user.id !== id)
    }
  },
  data() {
    return {
      users: [],
      students: [],
    }
  },
    async mounted() {
    try {
      const [usersRes, studentsRes] = await Promise.all([
        fetchUsers(),
        fetchStudents()
      ])

      if (usersRes.success) this.users = usersRes.data
      if (studentsRes.success) this.students = studentsRes.data
    } catch (err) {
      console.error('Error Loading Data:', err)
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