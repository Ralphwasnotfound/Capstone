import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Nav/HomeView.vue'
import EnrollmentView from '@/views/Nav/EnrollmentView.vue'
import DigitalID from '@/views/Nav/Digital_ID.vue'
import Grades from '@/views/Nav/GradesView.vue'
import Admin from '@/views/Nav/AdminContactView.vue'
import Login from '@/views/Login/LoginPage.vue'
import Register from '@/views/Login/RegistrationPage.vue'
import DashBoard from '@/views/DashBoard.vue'
// Dashboards
import DashboardHome from '@/components/Dashboards/DashBoardsSideView/DashboardHome.vue'
import DashboardSubjectCourses from '@/components/Dashboards/DashBoardsSideView/DashboardSubjectCourses.vue'
import DashboardAttendance from '@/components/Dashboards/DashBoardsSideView/DashboardAttendance.vue'
import DashboardDigitalIDs from '@/components/Dashboards/DashBoardsSideView/DashboardDigitalIDs.vue'
import DashboardGrades from '@/components/Dashboards/DashBoardsSideView/DashboardGrades.vue'
import DashboardAnouncement from '@/components/Dashboards/DashBoardsSideView/DashboardAnouncement.vue'
import DashboardConcernContact from '@/components/Dashboards/DashBoardsSideView/DashboardConcernContact.vue'
import DashboardProfileSettings from '@/components/Dashboards/DashBoardsSideView/DashboardProfileSettings.vue'
// Registration
import StudentRegister from '@/components/Forms/Registration/StudentRegister.vue'
import TeacherRegister from '@/components/Forms/Registration/TeacherRegister.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/enroll',
      name: 'enrollment',
      component: EnrollmentView,
    },
    {
      path: '/digital-ID',
      name: 'digital ID',
      component: DigitalID,
    },
    {
      path: '/grades',
      name: 'grades',
      component: Grades,
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
    },
    // Login
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    //Registration 
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/register/student',
      name: 'register-student',
      component: () => import('@/components/Forms/Registration/StudentRegister.vue')
    },
    {
      path: '/register/teacher',
      name:'register-teacher',
      component: () => import('@/components/Forms/Registration/TeacherRegister.vue')
    },
    
    // DASHBOARD
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashBoard,
      children:[
        {
          path: '',
          redirect: () => {
          const role = localStorage.getItem('role')
          if (role === 'teacher') return '/dashboard/teacher'
          if (role === 'student') return '/dashboard/student'
          if (role === 'admin') return '/dashboard/admin'
          return '/login'
        }
        },
        // TEACHER
        {
          path: 'teacher',
          component: () => import('@/views/DashBoard.vue'),
          children: [
            {
              path: '',
              name: 'TeacherDashboard',
              component: DashboardHome
            },
            {
              path: 'subject-courses',
              name: 'TeacherSubjectCourses',
              component: DashboardSubjectCourses,
            },
            {
              path: 'attendance',
              name: 'TeachertAttendance',
              component: DashboardAttendance,
            },
            {
              path: 'digital-IDs',
              name: 'TeacherDigitalIDs',
              component: DashboardDigitalIDs
            },
            {
              path: 'grades',
              name: 'TeacherGrades',
              component: DashboardGrades
            },
            {
              path: 'announcements',
              name: 'TeacherAnnouncements',
              component: DashboardAnouncement
            },
            {
              path: 'contact-concern',
              name: 'TeacherContactConcern',
              component: DashboardConcernContact
            },
            {
              path: 'profile-settings',
              name: 'TeacherProfileSettings',
              component: DashboardProfileSettings
            },
            {
              path: 'reports',
              name: 'TeacherReports',
              component: DashboardProfileSettings
            },
          ]
        },
        // STUDENT
        {
          path: 'student',
          component: () => import('@/views/DashBoard.vue'),
          props: true,
          children: [
            {
              path: '',
              name: 'StudentDashboard',
              component: DashboardHome
            },
            {
              path: 'subject-courses',
              name: 'StudentSubjectCourses',
              component: DashboardSubjectCourses,
            },
            {
              path: 'attendance',
              name: 'StudentAttendance',
              component: DashboardAttendance,
            },
            {
              path: 'digital-IDs',
              name: 'StudentDigitalIDs',
              component: DashboardDigitalIDs
            },
            {
              path: 'grades',
              name: 'StudentGrades',
              component: DashboardGrades
            },
            {
              path: 'announcements',
              name: 'StudentAnnouncements',
              component: DashboardAnouncement
            },
            {
              path: 'contact-concern',
              name: 'StudentContactConcern',
              component: DashboardConcernContact
            },
            {
              path: 'profile-settings',
              name: 'StudentProfileSettings',
              component: DashboardProfileSettings
            },
          ]
        },
        // ADMIN
        {
          path: 'admin',
          component: () => import('@/views/DashBoard.vue'),
          children: [
            {
              path: '',
              name: 'AdminDashboard',
              component: DashboardHome
            },
            {
              path: 'subject-courses',
              name: 'AdminSubjectCourses',
              component: DashboardSubjectCourses,
            },
            {
              path: 'attendance',
              name: 'AdmintAttendance',
              component: DashboardAttendance,
            },
            {
              path: 'digital-IDs',
              name: 'AdminDigitalIDs',
              component: DashboardDigitalIDs
            },
            {
              path: 'grades',
              name: 'AdminGrades',
              component: DashboardGrades
            },
            {
              path: 'announcements',
              name: 'AdminAnnouncements',
              component: DashboardAnouncement
            },
            {
              path: 'contact-concern',
              name: 'AdminContactConcern',
              component: DashboardConcernContact
            },
            {
              path: 'profile-settings',
              name: 'AdminProfileSettings',
              component: DashboardProfileSettings
            },
            {
              path: 'reports',
              name: 'AdminReports',
              component: DashboardProfileSettings
            },
          ]
        }
      ]
    },
  ],
})

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem('role');
  const isAuthenticated = ['student', 'teacher', 'admin'].includes(role);

  if (to.path === '/dashboard' && !isAuthenticated) {
    next('/login'); // Block and redirect to login
  } else {
    next(); // Allow navigation
  }
});


export default router
